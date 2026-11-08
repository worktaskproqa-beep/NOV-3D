import Link from "next/link";
import type { Product } from "@/db/schema";
import { plural, type Dictionary, type Locale } from "@/i18n";
import { ProductTile, type Sibling } from "@/components/ui/ProductTile";
import { ArrowIcon } from "@/components/ui/Icons";

/**
 * "Shop all": bento grid. The signature piece takes a 2×2 feature tile, the rest fill the grid
 * around it (5 products → exactly 8 cells on desktop, 2 + 4 on mobile).
 */
export function ShopGrid({ t, locale, products, siblings }: { t: Dictionary; locale: Locale; products: Product[]; siblings: Record<string, Sibling[]> }) {
  const [feature, ...rest] = products;
  if (!feature) return null;
  return (
    <section aria-labelledby="shopall-title" className="bg-ivory py-[clamp(56px,8vw,112px)]">
      <div className="container-wide">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
          <div>
            <p className="t-label text-wine">{t.home.shopAll.eyebrow}</p>
            <h2 id="shopall-title" className="t-h1 mt-3">{t.home.shopAll.title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <span className="t-small hidden sm:inline">{plural(locale, products.length, t.products.results)}</span>
            <Link href="/shop" className="btn btn-outline min-h-11 px-5">
              {t.common.actions.viewAll}
              <ArrowIcon size={15} className="flip-rtl" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <ProductTile
            product={feature}
            locale={locale}
            t={t}
            size="feature"
            siblings={siblings[feature.art]}
            priority
            className="col-span-2 aspect-square sm:aspect-[16/11] lg:row-span-2 lg:aspect-auto"
          />
          {rest.map((p, i) => (
            <ProductTile key={p.id} product={p} locale={locale} t={t} index={i + 1} priority={i < 2} className="aspect-[4/5]" />
          ))}
        </div>
      </div>
    </section>
  );
}
