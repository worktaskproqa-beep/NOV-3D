"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useCart } from "@/components/providers/CartProvider";
import { Wordmark } from "@/components/ui/Wordmark";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, ArrowIcon } from "@/components/ui/Icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

function Announcement() {
  const { t } = useI18n();
  const msgs = t.common.announcements;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % msgs.length), 4200);
    return () => window.clearInterval(id);
  }, [msgs.length]);
  return (
    <div className="on-dark relative z-50 bg-ink text-ivory">
      <div className="container-wide relative flex h-9 items-center justify-center overflow-hidden" aria-live="polite">
        {msgs.map((m, n) => (
          <p
            key={n}
            aria-hidden={n !== i}
            className={`t-label absolute inset-x-0 text-center text-[0.625rem]! transition-[opacity,transform] duration-500 ${n === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}

function NavLinks({ className, linkClass, onItem }: { className?: string; linkClass: string; onItem?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const params = useSearchParams();
  const cat = params.get("category");
  const nav = [
    { href: "/shop", label: t.common.nav.shop, active: pathname === "/shop" && !cat },
    { href: "/shop?category=hoodies", label: t.common.nav.hoodies, active: pathname === "/shop" && cat === "hoodies" },
    { href: "/shop?category=caps", label: t.common.nav.caps, active: pathname === "/shop" && cat === "caps" },
    { href: "/about", label: t.common.nav.about, active: pathname === "/about" },
  ];
  return (
    <ul className={className}>
      {nav.map((n) => (
        <li key={n.href}>
          <Link href={n.href} onClick={onItem} className={linkClass} aria-current={n.active ? "page" : undefined}>
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  const { t } = useI18n();
  const { count, hydrated, setDrawerOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = menuRef.current;
    const focusables = () => Array.from(root?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const overHero = pathname === "/" && !scrolled && !open;
  const n = hydrated ? count : 0;

  return (
    <>
      <Announcement />
      <header
        className={`sticky top-0 z-40 transition-[background-color,color,box-shadow] duration-300 ${
          overHero ? "bg-transparent text-ink" : "bg-ivory text-ink shadow-[0_1px_0_rgba(14,13,12,.1)]"
        } ${pathname === "/" ? "-mb-[var(--header-h)]" : ""}`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="container-wide grid h-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <button
              ref={toggleRef}
              type="button"
              className="-ms-2.5 flex size-11 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={t.common.nav.menu}
              onClick={() => setOpen(true)}
            >
              <MenuIcon size={22} />
            </button>
            <nav aria-label={t.common.nav.primary} className="hidden lg:block">
              <Suspense fallback={null}>
                <NavLinks className="flex items-center gap-8" linkClass="t-label link-underline" />
              </Suspense>
            </nav>
          </div>

          <Link href="/" aria-label={t.common.logoAlt} className="px-4">
            <Wordmark className="text-[1.6rem] sm:text-[1.85rem]" />
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <LanguageSwitcher className="hidden sm:flex" />
            <ThemeToggle />
            <Link href="/shop" aria-label={t.common.nav.search} className="hidden size-11 items-center justify-center sm:flex">
              <SearchIcon />
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`${t.common.nav.cart} (${n})`}
              className="relative -me-2.5 flex h-11 items-center gap-2 px-2.5"
            >
              <BagIcon />
              <span className="t-label hidden md:inline">{t.common.nav.cart}</span>
              <span
                className={`ltr-nums flex min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold leading-5 ${
                  "bg-ink text-ivory"
                }`}
              >
                {n}
              </span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label={t.common.nav.menu} className="drawer-enter fixed inset-0 z-[60] flex flex-col bg-ivory text-ink">
          <div className="container-wide flex items-center justify-between" style={{ height: "var(--header-h)" }}>
            <Wordmark className="text-[1.6rem]" />
            <button type="button" onClick={() => setOpen(false)} aria-label={t.common.nav.close} className="-me-2.5 flex size-11 items-center justify-center">
              <CloseIcon size={24} />
            </button>
          </div>
          <nav aria-label={t.common.nav.primary} className="container-wide flex-1 overflow-y-auto pt-6">
            <Suspense fallback={null}>
              <NavLinks
                className="border-t border-ink/10 [&>li]:border-b [&>li]:border-ink/10"
                linkClass="t-h2 flex min-h-[72px] items-center justify-between"
                onItem={() => setOpen(false)}
              />
            </Suspense>
            <Link href="/contact" className="t-h3 mt-6 flex items-center gap-3 text-muted">
              {t.common.nav.contact}
              <ArrowIcon size={18} className="flip-rtl" />
            </Link>
          </nav>
          <div className="container-wide flex items-center justify-between border-t border-ink/10 py-4">
            <span className="t-label text-muted">{t.common.theme.label}</span>
            <ThemeToggle withLabel />
          </div>
          <div className="container-wide flex items-center justify-between border-t border-ink/10 py-4">
            <span className="t-label text-muted">{t.common.lang.label}</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
