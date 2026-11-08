import enCommon from "./en/common.json";
import enHome from "./en/home.json";
import enProducts from "./en/products.json";
import enCart from "./en/cart.json";
import enForms from "./en/forms.json";
import arCommon from "./ar/common.json";
import arHome from "./ar/home.json";
import arProducts from "./ar/products.json";
import arCart from "./ar/cart.json";
import arForms from "./ar/forms.json";

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "nov-locale";

const en = { common: enCommon, home: enHome, products: enProducts, cart: enCart, forms: enForms };
export type Dictionary = typeof en;

// The Arabic dictionary must satisfy the English shape — missing keys fail type-checking.
const ar: Dictionary = { common: arCommon, home: arHome, products: arProducts, cart: arCart, forms: arForms };

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ar";
}

export function dirOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function formatPrice(amount: number, locale: Locale) {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-QA-u-nu-latn" : "en-QA", { maximumFractionDigits: 0 }).format(amount);
  return locale === "ar" ? `${n} ر.ق` : `QAR ${n}`;
}

type Localized = { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; materialEn: string; materialAr: string };
export function localize<T extends Localized>(p: T, locale: Locale) {
  return locale === "ar"
    ? { name: p.nameAr, description: p.descriptionAr, material: p.materialAr }
    : { name: p.nameEn, description: p.descriptionEn, material: p.materialEn };
}

/**
 * Plural-aware text: picks the right form for the number (Arabic has zero/one/two/few/many/other).
 * forms = { one: "1 item", other: "{count} items" } — missing forms fall back to "other".
 */
export function plural(locale: Locale, count: number, forms: Record<string, string>) {
  const cat = new Intl.PluralRules(locale === "ar" ? "ar" : "en").select(count);
  return fill(forms[cat] ?? forms.other ?? "", { count });
}
