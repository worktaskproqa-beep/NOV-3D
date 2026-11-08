#!/usr/bin/env node
/**
 * Case-sensitive import checker.
 * Vercel builds on Linux, where "ProductTile" ≠ "productTile". Windows and macOS ignore case, so a wrong
 * import can work locally and fail on Vercel with "Module not found". This script resolves every import
 * the way Linux does (exact case, segment by segment) and reports anything that would break.
 *
 *   node scripts/check-imports.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "src");
const EXT = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"];
const ASSET = /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|css)$/i;

const problems = [];
const dirCache = new Map();
const list = (d) => {
  if (!dirCache.has(d)) {
    try { dirCache.set(d, fs.readdirSync(d)); } catch { dirCache.set(d, null); }
  }
  return dirCache.get(d);
};

/** Walk the path segment by segment with exact-case comparison. Returns {ok} or {ok:false, hint}. */
function exact(abs) {
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..")) return { ok: fs.existsSync(abs) };
  let cur = ROOT;
  for (const seg of rel.split(path.sep)) {
    const entries = list(cur);
    if (!entries) return { ok: false };
    if (!entries.includes(seg)) {
      const ci = entries.find((e) => e.toLowerCase() === seg.toLowerCase());
      return { ok: false, hint: ci ? path.join(path.relative(ROOT, cur), ci) : undefined };
    }
    cur = path.join(cur, seg);
  }
  return { ok: true };
}

function resolve(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // package import (react, next/…) — resolved by npm
  const candidates = [base, ...EXT.map((e) => base + e), ...EXT.map((e) => path.join(base, "index" + e))];
  let hint;
  for (const c of candidates) {
    const r = exact(c);
    if (r.ok && fs.statSync(c).isFile()) return { ok: true };
    if (r.hint && !hint) hint = r.hint;
  }
  return { ok: false, hint };
}

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

const files = walk(SRC);
const code = files.filter((f) => /\.(tsx?|jsx?|mjs)$/.test(f));
const css = files.filter((f) => f.endsWith(".css"));
let checked = 0;

const IMPORT_RE = [
  /\bimport\s+(?:type\s+)?[^'"]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bexport\s+[^'"]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
];
for (const f of code) {
  const src = fs.readFileSync(f, "utf8");
  const specs = new Set();
  for (const re of IMPORT_RE) for (const m of src.matchAll(re)) specs.add(m[1]);
  // next/font/local: src: "./fonts/…"  /  path: "./fonts/…"
  if (src.includes("next/font/local")) for (const m of src.matchAll(/\b(?:src|path):\s*["'](\.[^"']+)["']/g)) specs.add(m[1]);
  for (const s of specs) {
    const r = resolve(f, s);
    if (r === null) continue;
    checked++;
    if (!r.ok) problems.push({ file: path.relative(ROOT, f), spec: s, hint: r.hint });
  }
  // string references to /public assets, e.g. "/images/hero.jpg"
  for (const m of src.matchAll(/["'`](\/(?:images|fonts|icons)\/[^"'`\s?#]+)["'`]/g)) {
    checked++;
    const r = exact(path.join(ROOT, "public", m[1]));
    if (!r.ok) problems.push({ file: path.relative(ROOT, f), spec: m[1], hint: r.hint && "public/…/" + path.basename(r.hint) });
  }
}
for (const f of css) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/url\(\s*["']?(\.{1,2}\/[^"')]+)["']?\s*\)/g)) {
    checked++;
    const r = exact(path.resolve(path.dirname(f), m[1]));
    if (!r.ok) problems.push({ file: path.relative(ROOT, f), spec: m[1], hint: r.hint });
  }
}

// Files that differ only by case collide on Windows/macOS and confuse git.
const all = [...walk(SRC), ...(fs.existsSync(path.join(ROOT, "public")) ? walk(path.join(ROOT, "public")) : [])];
const seen = new Map();
const collisions = [];
for (const f of all) {
  const k = f.toLowerCase();
  if (seen.has(k)) collisions.push([path.relative(ROOT, seen.get(k)), path.relative(ROOT, f)]);
  else seen.set(k, f);
}
// Risky file names (spaces, non-ASCII) break URLs and some git clients.
const risky = all.filter((f) => /[^A-Za-z0-9._\-/\[\]()]/.test(path.relative(ROOT, f))).map((f) => path.relative(ROOT, f));

// ── Project structure: the usual results of a drag-and-drop upload to GitHub ──
const structure = [];
const must = [
  ["public/images/hoodies", "product photos"],
  ["public/images/showcase", "hero / store cut-outs"],
  ["public/images/caps", "cap photos"],
  ["src/app/fonts", "font files"],
];
for (const [d, what] of must) if (!exact(path.join(ROOT, d)).ok) structure.push(`missing folder "${d}" (${what}) — upload it with the same name and location`);
const strayDirs = [];
for (const d of ["app", "pages", "components", "lib", "i18n", "db"]) {
  if (!fs.existsSync(path.join(ROOT, d)) || !fs.statSync(path.join(ROOT, d)).isDirectory()) continue;
  // a root app/ or pages/ replaces src/app — that breaks the site; other stray copies are just clutter
  if (d === "app" || d === "pages") structure.push(`stray folder "${d}/" at the repository root — Next.js would use it INSTEAD of src/app/. Delete the root copy.`);
  else strayDirs.push(d + "/");
}
const strayRoot = fs.readdirSync(ROOT).filter((f) => /\.(tsx?|jsx?|json|css)$/.test(f) && !/^(package(-lock)?\.json|tsconfig\.json|drizzle\.config\.json|next\.config\.ts|next-env\.d\.ts|eslint\.config\.mjs|postcss\.config\.mjs)$/.test(f));

console.log(`Checked ${checked} local imports/asset paths in ${code.length + css.length} files.`);
if (structure.length) {
  console.log(`\n✖ Project structure (${structure.length}):`);
  for (const p of structure) console.log("  " + p);
}
if (strayDirs.length) console.log(`\n⚠ stray folder(s) at the repository root (ignored by the build, safe to delete): ${strayDirs.join(", ")}`);
if (strayRoot.length) console.log(`\n⚠ ${strayRoot.length} stray file(s) at the repository root (ignored by the build, safe to delete): ${strayRoot.slice(0, 8).join(", ")}${strayRoot.length > 8 ? " …" : ""}`);
if (problems.length) {
  console.log(`\n✖ ${problems.length} import(s) will fail on Vercel (Linux, case-sensitive):`);
  for (const p of problems) console.log(`  ${p.file}\n    import "${p.spec}"${p.hint ? `\n    → actual file: ${p.hint}  (case differs)` : "\n    → file does not exist"}`);
}
if (collisions.length) {
  console.log(`\n✖ ${collisions.length} file name(s) differ only by case:`);
  for (const [a, b] of collisions) console.log(`  ${a}  ⇄  ${b}`);
}
if (risky.length) {
  console.log(`\n⚠ ${risky.length} file name(s) with spaces or non-ASCII characters:`);
  for (const r of risky) console.log(`  ${r}`);
}
const failed = problems.length + collisions.length + structure.length > 0;
console.log(failed ? "\nFAILED" : "\n✓ All imports match the real file names exactly.");
process.exit(failed ? 1 : 0);
