import { sql } from "drizzle-orm";
import { hasDatabase } from "@/db";
import { dbOrNull } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** 200 when the app is up. Reports database status; 503 only if a configured database is unreachable. */
export async function GET() {
  if (!hasDatabase) return Response.json({ ok: true, database: "not-configured" });
  const d = await dbOrNull();
  if (!d) return Response.json({ ok: false, database: "unreachable" }, { status: 503 });
  try {
    await d.execute(sql`select 1`);
    return Response.json({ ok: true, database: "connected" });
  } catch {
    return Response.json({ ok: false, database: "unreachable" }, { status: 503 });
  }
}
