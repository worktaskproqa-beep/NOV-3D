import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  async redirects() {
    // The single "Everyday Hoodie" listing became four colourway listings.
    return [{ source: "/shop/everyday-hoodie", destination: "/shop/skyline-hoodie-burgundy", permanent: true }];
  },
};

/**
 * Pre-flight check on every production build (locally and on Vercel):
 * verifies that every import matches a real file with the exact same upper/lower case and that the
 * project folders are where they belong. Fails fast with one readable report instead of dozens of
 * "Module not found" errors.
 */
export default function config(phase: string): NextConfig {
  const checker = path.join(process.cwd(), "scripts", "check-imports.mjs");
  // Next evaluates this file in several build workers — run the check once (workers inherit the env flag).
  if (phase === PHASE_PRODUCTION_BUILD && existsSync(checker) && !process.env.NOV_PREFLIGHT_DONE) {
    process.env.NOV_PREFLIGHT_DONE = "1";
    const r = spawnSync(process.execPath, [checker], { stdio: "inherit" });
    if (r.status !== 0) {
      throw new Error(
        "Pre-flight check failed: some files are missing or their names do not match the imports (see the report above). " +
          "فحص ما قبل البناء فشل: بعض الملفات ناقصة أو أسماؤها لا تطابق الاستيراد — راجع التقرير أعلاه.",
      );
    }
  }
  return nextConfig;
}
