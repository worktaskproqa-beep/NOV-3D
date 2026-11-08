"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, dictionaries, dirOf, type Dictionary, type Locale } from "@/i18n";

type Ctx = { locale: Locale; t: Dictionary; dir: "ltr" | "rtl"; setLocale: (l: Locale) => void; pending: boolean };
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      const html = document.documentElement;
      html.lang = next;
      html.dir = dirOf(next);
      setLocaleState(next);
      // Re-render server components (product names, metadata) on the same route. Client state (cart) persists.
      startTransition(() => router.refresh());
    },
    [locale, router],
  );

  const value = useMemo<Ctx>(
    () => ({ locale, t: dictionaries[locale], dir: dirOf(locale), setLocale, pending }),
    [locale, setLocale, pending],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
