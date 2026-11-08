"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/LocaleProvider";

export function SortSelect() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get("sort") ?? "featured";
  return (
    <label className="flex items-center gap-2">
      <span className="t-label hidden text-muted sm:inline">{t.products.sort.label}</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const q = next.toString();
          router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
        }}
        aria-label={t.products.sort.label}
        className="min-h-11 cursor-pointer border border-ink/20 bg-ivory px-3 text-sm font-semibold"
      >
        <option value="featured">{t.products.sort.featured}</option>
        <option value="price-asc">{t.products.sort.priceAsc}</option>
        <option value="price-desc">{t.products.sort.priceDesc}</option>
      </select>
    </label>
  );
}
