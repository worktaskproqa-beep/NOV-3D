"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/productImages";
import { useI18n } from "@/components/providers/LocaleProvider";
import { fill } from "@/i18n";
import { ChevronIcon } from "@/components/ui/Icons";

export function Gallery({ shots, name, colorName }: { shots: Shot[]; name: string; colorName: string }) {
  const { t, dir } = useI18n();
  const [i, setI] = useState(0);
  const railRef = useRef<HTMLUListElement>(null);
  const alt = (s: Shot) => `${name} — ${colorName} — ${t.products.shots[s.kind]}`;

  // mobile rail: track the visible slide
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setI(Number((e.target as HTMLElement).dataset.i))),
      { root: rail, threshold: 0.6 },
    );
    rail.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [shots]);

  const go = (n: number) => setI((n + shots.length) % shots.length);

  return (
    <div aria-label={t.products.gallery} role="region">
      {/* Mobile / tablet: swipe rail */}
      <div className="relative lg:hidden">
        <ul ref={railRef} className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
          {shots.map((s, n) => (
            <li key={s.kind} data-i={n} className="w-full shrink-0 snap-center">
              <div className="relative aspect-[4/5] bg-linen">
                <Image src={s.src} alt={alt(s)} fill quality={90} priority={n === 0} placeholder="blur" sizes="100vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ul>
        <p className="ltr-nums absolute bottom-3 end-3 bg-ivory/90 px-2.5 py-1 text-xs font-semibold">{i + 1} / {shots.length}</p>
      </div>

      {/* Desktop: thumbnails + main */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[84px_1fr]">
        <ul className="flex max-h-[min(78vh,820px)] flex-col gap-2 overflow-y-auto [scrollbar-width:none]">
          {shots.map((s, n) => (
            <li key={s.kind}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={fill(t.products.thumb, { n: n + 1 })}
                aria-current={n === i ? "true" : undefined}
                className={`relative block aspect-[4/5] w-full overflow-hidden bg-linen transition-opacity ${n === i ? "opacity-100 ring-1 ring-ink" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={s.src} alt="" fill sizes="84px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <div className="group relative aspect-[4/5] max-h-[min(78vh,820px)] w-full overflow-hidden bg-linen">
          {shots.map((s, n) => (
            <Image
              key={s.kind}
              src={s.src}
              alt={n === i ? alt(s) : ""}
              aria-hidden={n !== i}
              fill
              quality={90}
              priority={n === 0}
              placeholder="blur"
              sizes="(min-width: 1024px) 52vw, 100vw"
              className={`object-cover transition-opacity duration-500 ${n === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <button type="button" onClick={() => go(dir === "rtl" ? i + 1 : i - 1)} aria-label={fill(t.products.thumb, { n: ((i - 1 + shots.length) % shots.length) + 1 })} className="absolute start-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
            <ChevronIcon size={18} className="rotate-180 rtl:rotate-0" />
          </button>
          <button type="button" onClick={() => go(dir === "rtl" ? i - 1 : i + 1)} aria-label={fill(t.products.thumb, { n: ((i + 1) % shots.length) + 1 })} className="absolute end-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
            <ChevronIcon size={18} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
