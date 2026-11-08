import { asc, eq, notInArray, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "@/db";
import { products, type Product } from "@/db/schema";

// Colours verified from the real NOV product photography (Nov-01…Nov-12).
const H = {
  wine: { hex: "#5E1A26", en: "Burgundy", ar: "عنابي" },
  blue: { hex: "#1E2A8A", en: "Royal Blue", ar: "أزرق ملكي" },
  brown: { hex: "#6B3F26", en: "Brown", ar: "بنّي" },
  black: { hex: "#151313", en: "Black", ar: "أسود" },
};

type Seed = Omit<Product, "id" | "createdAt">;

// Hoodie copy, price and material are carried over unchanged from the existing catalogue entry;
// the added sentence only describes details visible in the product photographs.
const HOODIE_EN = "Our signature hoodie: heavyweight cotton, a relaxed fit and a soft brushed inside. Skyline embroidery on the chest and back, “Go in peace, Move in trust, Act in faith” down the sleeve, and a QR code at the cuff.";
const HOODIE_AR = "هودي NOV الأساسي: قطن ثقيل، وقصّة مريحة، وملمس داخلي ناعم. تطريز أفق المدينة على الصدر والظهر، وعبارة «Go in peace, Move in trust, Act in faith» على الكمّ، ورمز QR عند طرفه.";
const hoodie = (key: keyof typeof H, slug: string, order: number): Seed => ({
  slug, category: "hoodies", art: "hoodie", price: 320, featured: 1, sortOrder: order,
  nameEn: `Skyline Hoodie — ${H[key].en}`, nameAr: `هودي سكايلاين — ${H[key].ar}`,
  descriptionEn: HOODIE_EN, descriptionAr: HOODIE_AR,
  materialEn: "100% brushed organic cotton fleece, 420 gsm", materialAr: "قطن عضوي 100٪ بملمس داخلي ناعم، بوزن 420 غ/م²",
  colors: [H[key]], sizes: ["XS", "S", "M", "L", "XL"],
});

const SEED: Seed[] = [
  hoodie("wine", "skyline-hoodie-burgundy", 1),
  hoodie("blue", "skyline-hoodie-royal-blue", 2),
  hoodie("brown", "skyline-hoodie-brown", 3),
  hoodie("black", "skyline-hoodie-black", 4),
  {
    slug: "signature-cap", category: "caps", art: "cap", price: 150, featured: 1, sortOrder: 5,
    nameEn: "NOV Cap", nameAr: "قبعة NOV",
    descriptionEn: "A six-panel cap in washed cotton twill with a tonal NOV embroidery on the front — the easy way to finish the look.",
    descriptionAr: "قبعة من ستّ قطع بقماش قطني مغسول، مع تطريز NOV على الأمام بلون القبعة نفسه — أسهل طريقة لإكمال الإطلالة.",
    materialEn: "Washed cotton twill, adjustable strap", materialAr: "قماش قطني مغسول، بحزام قابل للتعديل",
    colors: [H.wine], sizes: ["One size"],
  },
];

let ready: Promise<NodePgDatabase> | null = null;
let downUntil = 0; // after a failed connection, skip the database for a short while (no slow pages)

async function bootstrap(d: NodePgDatabase) {
  await d.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id serial PRIMARY KEY, slug varchar(120) NOT NULL UNIQUE, category varchar(40) NOT NULL,
      name_en text NOT NULL, name_ar text NOT NULL, description_en text NOT NULL, description_ar text NOT NULL,
      material_en text NOT NULL, material_ar text NOT NULL, price integer NOT NULL, art varchar(40) NOT NULL,
      colors jsonb NOT NULL, sizes jsonb NOT NULL, featured integer NOT NULL DEFAULT 0,
      sort_order integer NOT NULL DEFAULT 0, created_at timestamp NOT NULL DEFAULT now())`);
  await d.execute(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id serial PRIMARY KEY, reference varchar(20) NOT NULL UNIQUE, full_name text NOT NULL, email text NOT NULL,
      phone text NOT NULL, city text NOT NULL, address text NOT NULL, notes text, items jsonb NOT NULL,
      subtotal integer NOT NULL, shipping integer NOT NULL, total integer NOT NULL, locale varchar(4) NOT NULL,
      created_at timestamp NOT NULL DEFAULT now())`);
  await d.execute(sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id serial PRIMARY KEY, email text NOT NULL UNIQUE, locale varchar(4) NOT NULL,
      created_at timestamp NOT NULL DEFAULT now())`);
  await d.execute(sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id serial PRIMARY KEY, name text NOT NULL, email text NOT NULL, message text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now())`);
  // The store sells hoodies and caps only: upsert the catalogue and retire anything else.
  for (const s of SEED) {
    await d.insert(products).values(s).onConflictDoUpdate({
      target: products.slug,
      set: { category: s.category, art: s.art, nameEn: s.nameEn, nameAr: s.nameAr, descriptionEn: s.descriptionEn, descriptionAr: s.descriptionAr, materialEn: s.materialEn, materialAr: s.materialAr, price: s.price, colors: s.colors, sizes: s.sizes, featured: s.featured, sortOrder: s.sortOrder },
    });
  }
  await d.delete(products).where(notInArray(products.slug, SEED.map((s) => s.slug)));
}

/**
 * Connects, creates tables and syncs the catalogue on first use (no manual migration needed on Vercel).
 * Throws DatabaseUnavailable when DATABASE_URL is missing or the server cannot be reached.
 */
export class DatabaseUnavailable extends Error {}
export function ensureDb(): Promise<NodePgDatabase> {
  const d = db;
  if (!d) return Promise.reject(new DatabaseUnavailable("DATABASE_URL is not set"));
  if (Date.now() < downUntil) return Promise.reject(new DatabaseUnavailable("database recently unreachable"));
  if (!ready) {
    ready = bootstrap(d)
      .then(() => d)
      .catch((err: unknown) => {
        ready = null;
        downUntil = Date.now() + 30_000;
        throw new DatabaseUnavailable(err instanceof Error ? err.message : String(err));
      });
  }
  return ready;
}

/** Built-in catalogue — used when no database is configured, so the storefront always works. */
const STATIC_PRODUCTS: Product[] = SEED.map((s, i) => ({ ...s, id: i + 1, createdAt: new Date(0) }));
let warned = false;
function fallback(err: unknown) {
  if (!warned) {
    warned = true;
    console.warn("[catalog] serving built-in products —", err instanceof Error ? err.message : err);
  }
}

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const d = await ensureDb();
    const q = d.select().from(products);
    return await (category
      ? q.where(eq(products.category, category)).orderBy(asc(products.sortOrder))
      : q.orderBy(asc(products.sortOrder)));
  } catch (err) {
    fallback(err);
    return STATIC_PRODUCTS.filter((p) => !category || p.category === category);
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const d = await ensureDb();
    const rows = await d.select().from(products).where(eq(products.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    fallback(err);
    return STATIC_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export const CATEGORIES = ["hoodies", "caps"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Colourway siblings per product art (used for swatches on cards and the product page). */
export function siblingsByArt(all: Product[]) {
  const map: Record<string, { slug: string; hex: string; en: string; ar: string }[]> = {};
  for (const p of all) (map[p.art] ??= []).push({ slug: p.slug, ...p.colors[0] });
  return map;
}

/** For write endpoints: the database, or null when it is not configured / unreachable. */
export async function dbOrNull(): Promise<NodePgDatabase | null> {
  try {
    return await ensureDb();
  } catch (err) {
    console.error("[db] unavailable:", err instanceof Error ? err.message : err);
    return null;
  }
}

export const NO_DB_RESPONSE = { ok: false, error: "database-not-configured" } as const;
