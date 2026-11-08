import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { localize } from "@/i18n";
import { getProduct, getProducts } from "@/lib/catalog";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductTile } from "@/components/ui/ProductTile";
import { ChevronIcon } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getI18n();
  const p = await getProduct(slug);
  if (!p) return {};
  const l = localize(p, locale);
  return { title: l.name, description: l.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const product = await getProduct(slug);
  if (!product) notFound();
  const l = localize(product, locale);
  const all = await getProducts();
  const related = [...all.filter((p) => p.category !== product.category), ...all.filter((p) => p.category === product.category && p.slug !== product.slug)].slice(0, 4);
  const colorways = all.filter((p) => p.art === product.art).map((p) => ({ slug: p.slug, ...p.colors[0] }));
  const cat = product.category as keyof typeof t.common.categories;

  return (
    <div className="bg-ivory">
      <nav aria-label={t.products.breadcrumb} className="container-wide pt-8">
        <ol className="t-small flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-ink">{t.common.nav.home}</Link></li>
          <li aria-hidden="true"><ChevronIcon size={12} className="flip-rtl" /></li>
          <li><Link href={`/shop?category=${product.category}`} className="hover:text-ink">{t.common.categories[cat]}</Link></li>
          <li aria-hidden="true"><ChevronIcon size={12} className="flip-rtl" /></li>
          <li aria-current="page" className="text-ink">{l.name}</li>
        </ol>
      </nav>

      <div className="container-wide pb-20 pt-6">
        <PurchasePanel product={product} name={l.name} description={l.description} material={l.material} colorways={colorways} />
      </div>

      <section aria-labelledby="related-title" className="border-t border-ink/10 bg-ivory py-[clamp(56px,8vw,112px)]">
        <div className="container-wide">
          <h2 id="related-title" className="t-h2">{product.category === "hoodies" ? t.products.completeLook : t.products.related}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((p, i) => (<ProductTile key={p.id} product={p} locale={locale} t={t} index={i} className="aspect-[4/5]" />))}
          </div>
        </div>
      </section>
    </div>
  );
}
