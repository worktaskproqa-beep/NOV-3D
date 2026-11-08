import { contactMessages } from "@/db/schema";
import { dbOrNull, NO_DB_RESPONSE } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string };
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const name = body.name?.trim(), email = body.email?.trim(), message = body.message?.trim();
  if (!name || !message || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return Response.json({ ok: false }, { status: 400 });
  const d = await dbOrNull();
  if (!d) return Response.json(NO_DB_RESPONSE, { status: 503 });
  await d.insert(contactMessages).values({ name: name.slice(0, 200), email: email.slice(0, 200), message: message.slice(0, 5000) });
  return Response.json({ ok: true });
}
