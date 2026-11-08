"use client";

import { useI18n } from "@/components/providers/LocaleProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t, pending } = useI18n();
  return (
    <div role="group" aria-label={t.common.lang.label} className={`flex items-center gap-1 ${className}`} aria-busy={pending}>
      <button
        type="button"
        lang="en"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`min-h-11 min-w-11 px-1.5 font-sans text-[0.75rem] tracking-[0.18em] transition-opacity duration-200 ${locale === "en" ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
      >
        EN
      </button>
      <span aria-hidden="true" className="h-3 w-px bg-current opacity-40" />
      <button
        type="button"
        lang="ar"
        onClick={() => setLocale("ar")}
        aria-pressed={locale === "ar"}
        className={`min-h-11 min-w-11 px-1.5 text-[0.9375rem] transition-opacity duration-200 ${locale === "ar" ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
        style={{ fontFamily: "var(--font-ar-body)", letterSpacing: 0 }}
      >
        عربي
      </button>
    </div>
  );
}
