import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { HOODIES } from "@/lib/productImages";

export function DetailsSection({ t }: { t: Dictionary }) {
  const d = t.home.details;
  const tiles = [
    { key: "emb", src: HOODIES.wine.emb },
    { key: "sleeve", src: HOODIES.brown.sleeve },
    { key: "qr", src: HOODIES.black.qr },
  ] as const;
  return (
    <section aria-labelledby="details-title" className="on-dark bg-ink py-[clamp(56px,8vw,112px)] text-ivory">
      <div className="container-wide">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
          <div>
            <p className="t-label text-ivory/60">{d.eyebrow}</p>
            <h2 id="details-title" className="t-h2 mt-3">{d.title}</h2>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {tiles.map((tile, i) => {
            const it = d.items[tile.key];
            return (
              <li key={tile.key} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                <div className="relative aspect-[16/10] overflow-hidden bg-espresso sm:aspect-square">
                  <Image src={tile.src} alt={it.t} fill quality={90} placeholder="blur" sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-4 text-[0.9375rem] font-semibold">{it.t}</p>
                <p className="t-small mt-1 text-ivory/65!" lang={tile.key === "sleeve" ? "en" : undefined}>{it.d}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
