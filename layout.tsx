import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { getI18n } from "@/i18n/server";
import { dirOf } from "@/i18n";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollEffects } from "@/components/animation/ScrollEffects";
import { CartDrawer } from "@/components/cart/CartDrawer";

// Fonts are self-hosted from src/app/fonts — the build never depends on Google Fonts being reachable.
const archivo = localFont({ src: "./fonts/archivo-latin-var.woff2", weight: "100 900", variable: "--font-archivo", display: "swap" });
const inter = localFont({ src: "./fonts/inter-latin-var.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
// Arabic faces are not preloaded: they download only when Arabic text is on screen.
const alexandria = localFont({ src: "./fonts/alexandria-arabic-var.woff2", weight: "100 900", variable: "--font-alexandria", display: "swap", preload: false });
const plexArabic = localFont({
  src: [
    { path: "./fonts/plex-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plex-arabic-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plex-arabic-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-ar",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: { default: locale === "ar" ? "NOV — هوديز وقبعات" : "NOV — Hoodies & Caps", template: "%s · NOV" },
    description: t.common.footer.intro,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2efea" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  width: "device-width",
  initialScale: 1,
};

const bootScript = `(function(){var h=document.documentElement;h.classList.add('js');try{var t=localStorage.getItem('nov-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';h.dataset.theme=t;}catch(e){h.dataset.theme='light'}try{if(sessionStorage.getItem('nov-intro'))h.classList.add('no-intro');else sessionStorage.setItem('nov-intro','1')}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, t } = await getI18n();
  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning className={`${archivo.variable} ${inter.variable} ${alexandria.variable} ${plexArabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="grain">
        <LocaleProvider initialLocale={locale}>
          <CartProvider>
            <a href="#main" className="skip-link t-label">{t.common.skip}</a>
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">{children}</main>
            <Footer t={t} />
            <CartDrawer />
            <ScrollEffects />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
