import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Database connection — optional by design.
 *
 * - With DATABASE_URL (e.g. Neon / Vercel Postgres): products, orders, newsletter and contact are stored in Postgres.
 * - Without DATABASE_URL (e.g. a fresh Vercel deploy): the store still builds and runs; the catalogue is served
 *   from the built-in product list and order/newsletter/contact endpoints answer with a clear "not configured" error.
 *
 * Never throws at import time, so `next build` works with or without a database.
 */
const databaseUrl = process.env.DATABASE_URL?.trim() || "";

export const hasDatabase = databaseUrl.length > 0;

const globalForDb = globalThis as typeof globalThis & { __novPool?: Pool };

function createPool() {
  const p = new Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 5000, // fail fast instead of hanging a request
    idleTimeoutMillis: 30000,
  });
  // an idle client losing its connection must never crash the server
  p.on("error", (err) => console.error("[db] idle client error:", err.message));
  return p;
}

export const pool: Pool | null = hasDatabase ? (globalForDb.__novPool ??= createPool()) : null;

export const db: NodePgDatabase | null = pool ? drizzle(pool) : null;
