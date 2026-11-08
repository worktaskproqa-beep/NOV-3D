"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/LocaleProvider";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, useCart } from "@/components/providers/CartProvider";
import { ProductArt } from "@/components/ui/ProductArt";
import { formatPrice } from "@/i18n";
import { ArrowIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";

export function OrderTotals() {
  const { t, locale } = useI18n();
  const { subtotal } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  return (
    <dl className="space-y-3">
      <div className="flex justify-between"><dt className="t-body text-muted">{t.cart.subtotal}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>
      <div className="flex justify-between"><dt className="t-body text-muted">{t.cart.shipping}</dt><dd>{shipping ? formatPrice(shipping, locale) : t.cart.free}</dd></div>
      <div className="flex justify-between border-t hairline pt-4"><dt className="t-label">{t.cart.total}</dt><dd className="t-h3 text-wine">{formatPrice(subtotal + shipping, locale)}</dd></div>
    </dl>
  );
}

export function CartView() {
  const { t, locale } = useI18n();
  const { items, setQty, remove, hydrated } = useCart();

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center py-16 text-center">
        <p className="t-h2">{t.cart.empty}</p>
        <p className="t-lead mt-4">{t.cart.emptyBody}</p>
        <Link href="/shop" className="btn btn-primary mt-10">{t.common.actions.shopNow}<ArrowIcon size={16} className="flip-rtl" /></Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
      <ul className="border-t hairline lg:col-span-8">
        {items.map((i) => {
          const name = locale === "ar" ? i.nameAr : i.nameEn;
          return (
            <li key={i.key} className="flex gap-5 border-b hairline py-6 sm:gap-8">
              <Link href={`/shop/${i.slug}`} className="w-24 shrink-0 sm:w-32">
                <ProductArt art={i.art} color={i.color.hex} tone="parchment" alt={name} label={t.common.placeholder} showLabel={false} sizes="128px" className="aspect-[4/5] w-full" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="t-h4"><Link href={`/shop/${i.slug}`} className="hover:text-wine">{name}</Link></h2>
                    <p className="t-small mt-2">
                      {t.cart.colour}: {locale === "ar" ? i.color.ar : i.color.en} · {t.cart.size}: {i.size === "One size" ? t.products.oneSize : i.size}
                    </p>
                  </div>
                  <p className="shrink-0">{formatPrice(i.price * i.qty, locale)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-taupe" role="group" aria-label={`${t.products.quantity} — ${name}`}>
                    <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={t.cart.decrease} className="flex size-11 items-center justify-center"><MinusIcon size={14} /></button>
                    <output className="ltr-nums w-7 text-center" aria-live="polite">{i.qty}</output>
                    <button type="button" onClick={() => setQty(i.key, i.qty + 1)} disabled={i.qty >= 10} aria-label={t.cart.increase} className="flex size-11 items-center justify-center disabled:opacity-40"><PlusIcon size={14} /></button>
                  </div>
                  <button type="button" onClick={() => remove(i.key)} className="t-label link-underline min-h-11 text-[0.6875rem]! text-muted hover:text-error">{t.cart.remove}</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="lg:col-span-4" aria-label={t.cart.summary}>
        <div className="bg-linen p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+32px)]">
          <h2 className="t-h3 mb-6">{t.cart.summary}</h2>
          <OrderTotals />
          <p className="t-small mt-4">{t.cart.freeNote}</p>
          <Link href="/checkout" className="btn btn-primary mt-8 w-full">{t.cart.checkout}<ArrowIcon size={16} className="flip-rtl" /></Link>
          <Link href="/shop" className="t-label link-underline mt-5 inline-block text-[0.6875rem]!">{t.common.actions.continue}</Link>
        </div>
      </aside>
    </div>
  );
}
