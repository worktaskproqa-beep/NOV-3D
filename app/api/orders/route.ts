import { orders } from "@/db/schema";
import { dbOrNull, getProducts, NO_DB_RESPONSE } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Body = { fullName?: string; email?: string; phone?: string; city?: string; address?: string; notes?: string; locale?: string; items?: { slug: string; size: string; color: string; qty: number }[] };

export async function POST(req: Request) {
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return Response.json({ ok: false }, { status: 400 }); }
  const { fullName, email, phone, city, address, notes, locale, items } = body;
  if (!fullName?.trim() || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !phone?.trim() || !city?.trim() || !address?.trim() || !Array.isArray(items) || items.length === 0) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const d = await dbOrNull();
  if (!d) return Response.json(NO_DB_RESPONSE, { status: 503 });
  // Prices are always resolved server-side from the catalogue.
  const catalog = new Map((await getProducts()).map((p) => [p.slug, p]));
  const lines = [];
  for (const i of items) {
    const p = catalog.get(i.slug);
    const qty = Math.floor(Number(i.qty));
    if (!p || !(qty >= 1 && qty <= 10)) return Response.json({ ok: false, error: "item" }, { status: 400 });
    lines.push({ slug: p.slug, name: p.nameEn, size: String(i.size).slice(0, 20), color: String(i.color).slice(0, 40), qty, price: p.price });
  }
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const shipping = subtotal >= 400 ? 0 : 25;
  const reference = `NOV-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  await d.insert(orders).values({
    reference, fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), city: city.trim(), address: address.trim(),
    notes: notes?.trim() || null, items: lines, subtotal, shipping, total: subtotal + shipping, locale: locale === "ar" ? "ar" : "en",
  });
  return Response.json({ ok: true, reference });
}
