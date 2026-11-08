import { newsletterSubscribers } from "@/db/schema";
import { dbOrNull, NO_DB_RESPONSE } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; locale?: string };
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return Response.json({ ok: false, error: "email" }, { status: 400 });
  const d = await dbOrNull();
  if (!d) return Response.json(NO_DB_RESPONSE, { status: 503 });
  const rows = await d.insert(newsletterSubscribers).values({ email, locale: body.locale === "ar" ? "ar" : "en" }).onConflictDoNothing().returning({ id: newsletterSubscribers.id });
  return Response.json({ ok: true, already: rows.length === 0 });
}
