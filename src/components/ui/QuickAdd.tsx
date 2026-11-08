"use client";

import { useState } from "react";
import type { Product } from "@/db/schema";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useCart } from "@/components/providers/CartProvider";
import { PlusIcon } from "./Icons";

/** Hover (desktop) / tap "+" (touch) size picker that adds straight to the bag. */
export function QuickAdd({ product }: { product: Pick<Product, "slug" | "nameEn" | "nameAr" | "art" | "price" | "sizes" | "colors"> }) {
  const { t } = useI18n();
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const color = product.colors[0];
  const pick = (size: string) => {
    add({ slug: product.slug, nameEn: product.nameEn, nameAr: product.nameAr, art: product.art, price: product.price, size, color });
    setOpen(false);
  };
  const label = (s: string) => (s === "One size" ? t.products.oneSize : s);

  return (
    <div className="absolute inset-x-2 bottom-2 z-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t.products.quickAdd}
        className="ms-auto flex size-10 items-center justify-center rounded-full bg-ivory text-ink shadow-sm md:hidden"
      >
        <PlusIcon size={18} />
      </button>
      <div
        className={`mt-2 bg-ivory/95 p-2 backdrop-blur-sm transition-[opacity,transform] duration-300 ease-[var(--ease-out-strong)] md:mt-0 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 ${
          open ? "block" : "hidden md:block"
        }`}
      >
        <p className="t-label mb-2 text-center text-[0.625rem]! text-muted">{t.products.quickAdd}</p>
        <div className="flex flex-wrap justify-center gap-1">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              className="min-h-9 min-w-10 flex-1 border border-ink/15 px-2 text-xs font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
            >
              {label(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
