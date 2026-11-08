import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getI18n } from "@/i18n/server";
import { plural } from "@/i18n";
import { CATEGORIES, getProducts, type Category } from "@/lib/catalog";
import { ProductTile } from "@/components/ui/ProductTile";
import { SortSelect } from "@/components/shop/SortSelect";
import { ChevronIcon } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.products.shopTitle };
}

type SP = { category?: string; color?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { locale, t } = await getI18n();
  const sp = await searchParams;
  const active = CATEGORIES.includes(sp.category as Category) ? (sp.category as Category) : undefined;
  const all = await getProducts();

  const inCat = active ? all.filter((p) => p.category === active) : all;
  const colours = Array.from(new Map(inCat.map((p) => [p.colors[0].hex, p.colors[0]])).values());
  const colour = colours.find((c) => c.en.toLowerCase().replace(/\s+/g, "-") === sp.color);
  let items = colour ? inCat.filter((p) => p.colors[0].hex === colour.hex) : inCat;
  if (sp.sort === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  if (sp.sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);

  const href = (next: Partial<SP>) => {
    const q = new URLSearchParams();
    const merged = { category: active, color: colour ? sp.color : undefined, sort: sp.sort, ...next };
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
    const s = q.toString();
    return s ? `/shop?${s}` : "/shop";
  };
  const title = active ? t.common.categories[active] : t.products.shopTitle;

  return (
    <div className="bg-ivory">
      <header className="container-wide pb-8 pt-8 md:pt-12">
        <nav aria-label={t.products.breadcrumb}>
          <ol className="t-small flex items-center gap-2">
            <li><Link href="/" className="hover:text-ink">{t.common.nav.home}</Link></li>
            <li aria-hidden="true"><ChevronIcon size={12} className="flip-rtl" /></li>
            <li aria-current="page" className="text-ink">{title}</li>
          </ol>
        </nav>
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="t-h1">{title}</h1>
          <p className="t-body max-w-md text-muted">{t.products.shopIntro}</p>
        </div>
      </header>

      <div className="sticky top-[var(--header-h)] z-20 border-y border-ink/10 bg-ivory/95 backdrop-blur-md">
        <div className="container-wide flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
          <nav aria-label={t.products.filter}>
            <ul className="flex items-center gap-1">
              {[undefined, ...CATEGORIES].map((c) => {
                const on = c === active;
                return (
                  <li key={c ?? "all"}>
                    <Link
                      href={href({ category: c, color: undefined })}
                      aria-current={on ? "page" : undefined}
                      className={`flex min-h-10 items-center rounded-full px-4 text-[0.8125rem] font-semibold transition-colors ${on ? "bg-ink text-ivory" : "hover:bg-ink/5"}`}
                    >
                      {c ? t.common.categories[c] : t.common.categories.all}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {colours.length > 1 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.products.filterColor}>
                <span className="t-label hidden text-muted lg:inline">{t.products.filterColor}</span>
                {colours.map((c) => {
                  const slug = c.en.toLowerCase().replace(/\s+/g, "-");
                  const on = colour?.hex === c.hex;
                  const name = locale === "ar" ? c.ar : c.en;
                  return (
                    <Link
                      key={c.hex}
                      href={href({ color: on ? undefined : slug })}
                      aria-label={name}
                      title={name}
                      aria-current={on ? "true" : undefined}
                      className={`flex size-8 items-center justify-center rounded-full ${on ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "ring-1 ring-ink/15 hover:ring-ink/50"}`}
                    >
                      <span className="size-6 rounded-full" style={{ background: c.hex }} />
                    </Link>
                  );
                })}
                {colour && <Link href={href({ color: undefined })} className="t-small ms-1 underline underline-offset-4">{t.products.clear}</Link>}
              </div>
            )}
            <p className="t-small hidden whitespace-nowrap md:block" aria-live="polite">{plural(locale, items.length, t.products.results)}</p>
            <Suspense fallback={null}><SortSelect /></Suspense>
          </div>
        </div>
      </div>

      <section className="container-wide pb-[var(--section-y)] pt-8" aria-label={title}>
        {items.length === 0 ? (
          <p className="t-lead py-20 text-center">{t.products.empty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {items.map((p, i) => (
              <ProductTile key={p.id} product={p} locale={locale} t={t} index={i} priority={i < 4} className="aspect-[4/5]" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
