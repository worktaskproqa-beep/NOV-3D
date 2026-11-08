import { getI18n } from "@/i18n/server";
import { getProducts, siblingsByArt } from "@/lib/catalog";
import { HeroSection } from "@/components/home/HeroSection";
import { ShopGrid } from "@/components/home/ShopGrid";
import { TrustBar } from "@/components/home/TrustBar";
import { DetailsSection } from "@/components/home/DetailsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export const dynamic = "force-dynamic";

/**
 * Lean store homepage — 4 blocks, every image used once:
 * hero (hoodie cut-outs) → all products (studio shots) → trust strip → 3 detail close-ups → newsletter.
 */
export default async function HomePage() {
  const { locale, t } = await getI18n();
  const all = await getProducts();
  return (
    <>
      <HeroSection hoodies={all.filter((p) => p.category === "hoodies")} />
      <ShopGrid t={t} locale={locale} products={all} siblings={siblingsByArt(all)} />
      <TrustBar t={t} />
      <DetailsSection t={t} />
      <NewsletterSection t={t} />
    </>
  );
}
