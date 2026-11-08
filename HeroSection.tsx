import type { Product } from "@/db/schema";
import { HeroShowcase, type ShowcaseItem } from "./HeroShowcase";

const KEY: Record<string, ShowcaseItem["key"]> = {
  "skyline-hoodie-burgundy": "wine", "skyline-hoodie-royal-blue": "blue", "skyline-hoodie-brown": "brown", "skyline-hoodie-black": "black",
};

/** Store hero: a single hoodie, large and straight, with live colour + front/back switching. */
export function HeroSection({ hoodies }: { hoodies: Product[] }) {
  const items: ShowcaseItem[] = hoodies
    .filter((p) => KEY[p.slug])
    .map((p) => ({ key: KEY[p.slug], slug: p.slug, price: p.price, ...p.colors[0] }));
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-hero text-ink">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_68%_50%,rgba(255,255,255,.7),transparent_70%)] rtl:bg-[radial-gradient(60%_70%_at_32%_50%,rgba(255,255,255,.7),transparent_70%)] dark:opacity-0" />
      <div className="container-wide flex min-h-[calc(100svh-36px)] max-h-[1000px] items-center pb-12 pt-[calc(var(--header-h)+24px)]">
        <div className="w-full">
          <HeroShowcase items={items} />
        </div>
      </div>
    </section>
  );
}
