"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/LocaleProvider";
import { FREE_SHIPPING_THRESHOLD, useCart } from "@/components/providers/CartProvider";
import { galleryFor } from "@/lib/productImages";
import { fill, formatPrice } from "@/i18n";
import { ArrowIcon, CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";

export function CartDrawer() {
  const { t, locale } = useI18n();
  const { items, subtotal, drawerOpen, setDrawerOpen, setQty, remove } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus();
    };
  }, [drawerOpen, setDrawerOpen]);

  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  return (
    <div aria-hidden={!drawerOpen} className={`fixed inset-0 z-[70] ${drawerOpen ? "" : "pointer-events-none"}`}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t.cart.close}
        onClick={() => setDrawerOpen(false)}
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.drawerTitle}
        className={`absolute inset-y-0 end-0 flex w-full max-w-[440px] flex-col bg-ivory shadow-2xl transition-transform duration-[420ms] ease-[var(--ease-drawer,cubic-bezier(0.32,0.72,0,1))] ${
          drawerOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="t-h4">
            {t.cart.drawerTitle} <span className="ltr-nums text-muted">({items.reduce((s, i) => s + i.qty, 0)})</span>
          </h2>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label={t.cart.close} className="-me-2 flex size-11 items-center justify-center">
            <CloseIcon size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="t-h3">{t.cart.empty}</p>
            <p className="t-small mt-2">{t.cart.emptyBody}</p>
            <Link href="/shop" className="btn btn-primary mt-8">{t.common.actions.shopNow}</Link>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/10 px-6 py-4">
              <p className="t-small text-ink!">{left > 0 ? fill(t.cart.freeLeft, { amount: formatPrice(left, locale) }) : t.cart.freeReached}</p>
              <div className="mt-2.5 h-1 w-full overflow-hidden bg-ink/10">
                <div className="h-full origin-left bg-wine transition-transform duration-500 rtl:origin-right" style={{ transform: `scaleX(${progress})` }} />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto px-6">
              {items.map((i) => {
                const name = locale === "ar" ? i.nameAr : i.nameEn;
                const img = galleryFor(i.art, i.color.hex)?.[0];
                return (
                  <li key={i.key} className="flex gap-4 border-b border-ink/10 py-5">
                    <Link href={`/shop/${i.slug}`} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-linen">
                      {img && <Image src={img.src} alt={name} fill sizes="80px" className="object-cover" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <Link href={`/shop/${i.slug}`} className="t-h4 hover:text-wine">{name}</Link>
                        <span className="t-h4 shrink-0">{formatPrice(i.price * i.qty, locale)}</span>
                      </div>
                      <p className="t-small mt-1">{locale === "ar" ? i.color.ar : i.color.en} · {i.size === "One size" ? t.products.oneSize : i.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-ink/20">
                          <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={t.cart.decrease} className="flex size-9 items-center justify-center"><MinusIcon size={13} /></button>
                          <span className="ltr-nums w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button type="button" onClick={() => setQty(i.key, i.qty + 1)} disabled={i.qty >= 10} aria-label={t.cart.increase} className="flex size-9 items-center justify-center disabled:opacity-40"><PlusIcon size={13} /></button>
                        </div>
                        <button type="button" onClick={() => remove(i.key)} className="t-small underline underline-offset-4 hover:text-error">{t.cart.remove}</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ink/10 px-6 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <span className="t-h4">{t.cart.subtotal}</span>
                <span className="t-h3">{formatPrice(subtotal, locale)}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary mt-5 w-full">
                {t.cart.checkout}
                <ArrowIcon size={16} className="flip-rtl" />
              </Link>
              <Link href="/cart" className="btn btn-outline mt-2 w-full">{t.cart.viewBag}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
