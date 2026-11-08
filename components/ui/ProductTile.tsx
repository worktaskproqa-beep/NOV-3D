import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Product } from "@/db/schema";
import { formatPrice, localize, plural, type Dictionary, type Locale } from "@/i18n";
import { cutoutFor } from "@/lib/productImages";
import { ProductArt } from "./ProductArt";
import { QuickAdd } from "./QuickAdd";
import { ArrowIcon } from "./Icons";

export type Sibling = { slug: string; hex: string; en: string; ar: string };
type Size = "feature" | "regular";

/**
 * Store tile: the real garment cut-out on a soft panel tinted with the product's own colour.
 * Name, colour and price sit inside the tile; hover lifts the piece and reveals the back; quick-add stays.
 */
export function ProductTile({
  product, locale, t, size = "regular", siblings = [], priority = false, index = 0, className = "",
}: {
  product: Product; locale: Locale; t: Dictionary; size?: Size; siblings?: Sibling[]; priority?: boolean; index?: number; className?: string;
}) {
  const { name } = localize(product, locale);
  const title = name.split(" — ")[0];
  const color = product.colors[0];
  const colourName = color ? (locale === "ar" ? color.ar : color.en) : "";
  const cut = cutoutFor(product.art, color?.hex);
  const feature = size === "feature";
  const sizes = feature ? "(min-width: 1024px) 46vw, 100vw" : "(min-width: 1024px) 23vw, 50vw";
  const href = `/shop/${product.slug}`;

  return (
    <article
      data-reveal
      style={{ ["--d" as string]: `${(index % 4) * 70}ms`, ["--tint" as string]: color?.hex ?? "#6e1f2c" } as CSSProperties}
      className={`group relative isolate overflow-hidden tile ${className}`}
    >
      <Link href={href} className="absolute inset-0 z-[1]" aria-label={`${name} — ${formatPrice(product.price, locale)}`} />

      {/* info */}
      <div className={`pointer-events-none relative z-[2] flex items-start justify-between gap-3 ${feature ? "p-5 md:p-8" : "p-3.5 md:p-4"}`}>
        <div className="min-w-0">
          <h3 className={feature ? "t-h2" : "text-[0.875rem] font-semibold leading-snug md:text-[0.9375rem]"}>{title}</h3>
          <p className={`mt-1 flex items-center gap-1.5 text-muted ${feature ? "text-[0.9375rem]" : "text-[0.75rem] md:text-[0.8125rem]"}`}>
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: color?.hex }} />
            {colourName}
          </p>
          {feature && siblings.length > 1 && (
            <div className="pointer-events-auto relative z-[3] mt-4 hidden md:block">
              <ul className="flex gap-2">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/shop/${s.slug}`}
                      title={locale === "ar" ? s.ar : s.en}
                      aria-label={locale === "ar" ? s.ar : s.en}
                      aria-current={s.slug === product.slug ? "true" : undefined}
                      className={`block size-5 rounded-full ring-offset-2 ring-offset-transparent transition-shadow ${s.slug === product.slug ? "ring-2 ring-ink" : "ring-1 ring-ink/20 hover:ring-ink/60"}`}
                      style={{ background: s.hex }}
                    />
                  </li>
                ))}
              </ul>
              <p className="t-small mt-2">{plural(locale, siblings.length, t.products.colours)}</p>
            </div>
          )}
        </div>
        <p className={`shrink-0 font-semibold ${feature ? "text-lg md:text-xl" : "text-[0.8125rem] md:text-[0.875rem]"}`}>{formatPrice(product.price, locale)}</p>
      </div>

      {/* product */}
      <div aria-hidden="true" className={`pointer-events-none absolute ${feature ? "inset-x-[10%] top-[17%] bottom-[13%] md:inset-x-[16%] md:top-[15%] md:bottom-[12%]" : "inset-x-[9%] top-[22%] bottom-[11%]"}`}>
        <div className="absolute inset-x-[16%] -bottom-[3%] h-[7%] rounded-[50%] bg-black/25 blur-xl transition-[transform,opacity] duration-700 group-hover:scale-90 group-hover:opacity-70 dark:bg-black/60" />
        {cut ? (
          <div className="relative h-full w-full transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:-translate-y-[3%] group-hover:scale-[1.04]">
            <Image
              src={cut.front}
              alt=""
              fill
              quality={90}
              priority={priority}
              sizes={sizes}
              className={`object-contain transition-opacity duration-500 ${cut.back ? "group-hover:opacity-0" : ""}`}
            />
            {cut.back && (
              <Image src={cut.back} alt="" fill quality={90} sizes={sizes} className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            )}
          </div>
        ) : (
          <ProductArt art={product.art} color={color?.hex ?? "#6E1F2C"} alt="" label={t.common.placeholder} showLabel={false} className="h-full w-full" />
        )}
      </div>

      {/* feature: call to action (gives way to quick-add on hover) */}
      {feature && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden items-end justify-end p-5 md:flex md:p-8">
          <span className="btn btn-primary min-h-11 px-5 transition-opacity duration-300 group-hover:opacity-0">
            {t.common.actions.shopNow}
            <ArrowIcon size={15} className="flip-rtl" />
          </span>
        </div>
      )}

      <QuickAdd product={product} />
    </article>
  );
}
