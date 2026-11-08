"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { fill, formatPrice } from "@/i18n";
import { ArrowIcon } from "@/components/ui/Icons";
import { TURNTABLE } from "@/lib/turntable";
import { Turntable } from "./Turntable";

export type ShowcaseItem = { key: "wine" | "blue" | "brown" | "black"; slug: string; hex: string; en: string; ar: string; price: number };
type Side = "front" | "back";



// soft colour glow behind the garment, per colourway
const GLOW: Record<ShowcaseItem["key"], string> = {
  wine: "rgba(138,42,58,.22)", blue: "rgba(40,60,190,.20)", brown: "rgba(140,85,50,.22)", black: "rgba(90,85,80,.20)",
};

/** One hoodie, shown large and straight: pick a colour, flip front/back. Real garment cut-outs, never mirrored. */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const { t, locale } = useI18n();
  const h = t.home.hero;
  const [idx, setIdx] = useState(0);
  const [side, setSide] = useState<Side>("back");
  const touched = useRef(false);
  const [sideNonce, setSideNonce] = useState(0);
  const cur = items[idx];

  const onInteract = useCallback(() => { touched.current = true; }, []);
  const onSideChange = useCallback((s: Side) => setSide(s), []);

  if (!cur) return null;
  const name = (c: ShowcaseItem) => (locale === "ar" ? c.ar : c.en);

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-6">
      <div className="order-2 lg:order-1 lg:col-span-5">
        <p data-reveal className="t-label text-wine">{h.eyebrow}</p>
        <h1 id="hero-title" className="lines t-display mt-4 [font-size:clamp(2.6rem,7vw,6rem)]! lg:[font-size:clamp(2.4rem,3.7vw,4.6rem)]! [overflow-wrap:anywhere]">
          <span className="line-mask" style={{ ["--i" as string]: 0 }}><span>{h.titleA}</span></span>
          <span className="line-mask" style={{ ["--i" as string]: 1 }}><span>{h.titleB}</span></span>
        </h1>
        <p data-reveal style={{ ["--d" as string]: "400ms" }} className="t-lead mt-5 max-w-md text-ink/75!">{h.body}</p>

        <div data-reveal style={{ ["--d" as string]: "550ms" }} className="mt-8 max-w-md border-t border-ink/10 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div role="radiogroup" aria-label={h.colour} className="flex items-center gap-2.5">
              {items.map((c, i) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={i === idx}
                  aria-label={name(c)}
                  title={name(c)}
                  onClick={() => { touched.current = true; setIdx(i); }}
                  className={`size-9 rounded-full ring-offset-[3px] ring-offset-hero transition-shadow duration-200 ${i === idx ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-ink/50"}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
            <div role="radiogroup" aria-label={h.view} className="flex rounded-full border border-ink/15 p-1">
              {(["front", "back"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={side === s}
                  onClick={() => { touched.current = true; setSide(s); setSideNonce((n) => n + 1); }}
                  className={`min-h-9 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors duration-200 ${side === s ? "bg-ink text-ivory" : "text-ink/70 hover:text-ink"}`}
                >
                  {h[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between gap-4" aria-live="polite">
            <p className="text-[0.9375rem] font-semibold">{h.product} — {name(cur)}</p>
            <p className="text-[0.9375rem] font-semibold">{formatPrice(cur.price, locale)}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/shop/${cur.slug}`} className="btn btn-primary flex-1">
              {fill(h.shopColour, { colour: name(cur) })}
              <ArrowIcon size={16} className="flip-rtl" />
            </Link>
            <Link href="/shop?category=caps" className="btn btn-outline">{h.secondary}</Link>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-7">
        <div className="relative mx-auto aspect-square w-full max-w-[min(680px,62svh)] lg:max-w-[min(760px,74svh)]">
          {/* colour glow + floor shadow */}
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full blur-3xl transition-[background-color] duration-700" style={{ backgroundColor: GLOW[cur.key] }} />
          <div aria-hidden="true" className="absolute inset-x-[18%] bottom-[1.5%] h-[5%] rounded-[50%] bg-black/25 blur-xl dark:bg-black/60" />
          <Turntable
            frames={TURNTABLE}
            colour={cur.key}
            side={side}
            sideNonce={sideNonce}
            onSideChange={onSideChange}
            onInteract={onInteract}
            label={`${h.showcase}: ${h.product} — ${name(cur)}`}
            hint={h.drag}
          />
        </div>
        {(
          <p className="t-small mt-2 flex items-center justify-center gap-2 text-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true"><path d="M3 12a9 4 0 0 0 18 0M21 12a9 4 0 0 0-18 0" /><path d="m17 9 4 3-4 3" /></svg>
            {h.drag}
          </p>
        )}
      </div>
    </div>
  );
}
