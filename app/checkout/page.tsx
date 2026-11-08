import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.cart.checkoutTitle };
}

export default async function CheckoutPage() {
  const { t } = await getI18n();
  return (
    <div className="container-wide pb-[var(--section-y)] pt-16 md:pt-24">
      <h1 className="lines t-h1 mb-12"><span className="line-mask"><span>{t.cart.checkoutTitle}</span></span></h1>
      <CheckoutForm />
    </div>
  );
}
