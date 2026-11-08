"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/db/schema";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ProductArt } from "@/components/ui/ProductArt";
import { Gallery } from "./Gallery";
import { galleryFor } from "@/lib/productImages";
import { formatPrice } from "@/i18n";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";

export type Colorway = { slug: string; hex: string; en: string; ar: string };

export function PurchasePanel({ product, name, description, material, colorways = [] }: { product: Product; name: string; description: string; material: string; colorways?: Colorway[] }) {
  const { t, locale } = useI18n();
  const { add } = useCart();
  const single = product.sizes.length === 1;
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(single ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const gallery = galleryFor(product.art, color.hex);
  const colorName = locale === "ar" ? color.ar : color.en;
  const sizeLabel = (s: string) => (s === "One size" ? t.products.oneSize : s);

  function onAdd() {
    if (!size) { setError(true); return; }
    add({ slug: product.slug, nameEn: product.nameEn, nameAr: product.nameAr, art: product.art, price: product.price, size, color }, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        {gallery ? (
          <Gallery key={color.hex} shots={gallery.filter((g) => !g.wide)} name={name} colorName={colorName} />
        ) : (
          <ProductArt art={product.art} color={color.hex} alt={name} label={t.common.placeholder} className="aspect-[4/5] w-full" />
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
          <h1 className="t-h2">{name}</h1>
          <p className="mt-3 text-xl font-semibold">{formatPrice(product.price, locale)}</p>
          {product.art === "hoodie" && <p className="t-small mt-2">{t.products.embroideryNote}</p>}

          {colorways.length > 1 ? (
            <nav className="mt-10" aria-label={t.products.colorways}>
              <p className="t-label mb-4">{t.products.color} — <span className="text-muted">{colorName}</span></p>
              <ul className="flex flex-wrap gap-3">
                {colorways.map((c) => {
                  const current = c.slug === product.slug;
                  const label = locale === "ar" ? c.ar : c.en;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/shop/${c.slug}`}
                        aria-current={current ? "page" : undefined}
                        aria-label={label}
                        title={label}
                        className={`block size-11 rounded-full ring-offset-4 ring-offset-ivory transition-shadow duration-200 ${current ? "ring-2 ring-ink" : "ring-1 ring-taupe hover:ring-ink"}`}
                        style={{ background: c.hex }}
                      />
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : (
            <fieldset className="mt-10">
              <legend className="t-label mb-4">{t.products.color} — <span className="text-muted">{colorName}</span></legend>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button key={c.hex} type="button" onClick={() => setColor(c)} aria-pressed={c.hex === color.hex} aria-label={locale === "ar" ? c.ar : c.en}
                    className={`size-11 rounded-full ring-offset-4 ring-offset-ivory ${c.hex === color.hex ? "ring-2 ring-ink" : "ring-1 ring-taupe"}`} style={{ background: c.hex }} />
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mt-8" aria-describedby={error ? "size-error" : undefined}>
            <legend className="mb-4 flex w-full items-center justify-between"><span className="t-label">{t.products.size}</span>{!single && <Link href="/contact#size" className="t-small underline underline-offset-4 hover:text-ink">{t.products.sizeGuide}</Link>}</legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSize(s); setError(false); }}
                  aria-pressed={size === s}
                  className={`min-h-12 min-w-14 border px-4 text-sm font-semibold transition-colors duration-200 ${size === s ? "border-ink bg-ink text-ivory" : "border-taupe hover:border-ink"}`}
                >
                  {sizeLabel(s)}
                </button>
              ))}
            </div>
            {error && <p id="size-error" role="alert" className="field-error">{t.products.selectSize}</p>}
          </fieldset>

          <div className="mt-8 flex gap-2">
            <div className="flex items-center border border-ink" role="group" aria-label={t.products.quantity}>
              <button type="button" className="flex size-[52px] items-center justify-center disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.cart.decrease}><MinusIcon size={16} /></button>
              <output className="ltr-nums w-8 text-center font-semibold" aria-live="polite">{qty}</output>
              <button type="button" className="flex size-[52px] items-center justify-center disabled:opacity-40" onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label={t.cart.increase}><PlusIcon size={16} /></button>
            </div>
            <button type="button" onClick={onAdd} className="btn btn-primary flex-1" aria-live="polite">
              {added ? (<><CheckIcon size={16} />{t.products.added}</>) : t.products.addToBag}
            </button>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-2 border-y border-ink/10 py-5 sm:grid-cols-2">
            {(["shipping", "returns", "cod", "embroidered"] as const).map((k) => (
              <li key={k} className="flex items-start gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" className="mt-0.5 shrink-0 text-wine"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                <span className="text-[0.8125rem]"><span className="font-semibold">{t.common.trust[k].t}</span> <span className="text-muted">— {t.common.trust[k].d}</span></span>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            {[
              { k: "details", body: description },
              { k: "materialCare", body: `${material}. ${t.products.careText}` },
              { k: "shipping", body: t.products.shippingNote },
            ].map(({ k, body }, n) => (
              <details key={k} open={n === 0} className="group border-b border-ink/10">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-[0.875rem] font-semibold">
                  {t.products.acc[k as "details" | "materialCare" | "shipping"]}
                  <span aria-hidden="true" className="text-xl leading-none transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="t-body pb-5 text-muted">{body}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
