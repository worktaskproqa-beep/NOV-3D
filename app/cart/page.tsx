import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { CartView } from "@/components/cart/CartView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.cart.title };
}

export default async function CartPage() {
  const { t } = await getI18n();
  return (
    <div className="container-wide pb-[var(--section-y)] pt-16 md:pt-24">
      <h1 className="lines t-h1 mb-12"><span className="line-mask"><span>{t.cart.title}</span></span></h1>
      <CartView />
    </div>
  );
}
