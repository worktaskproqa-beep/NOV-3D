"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";

type Theme = "light" | "dark";

/** Day / night switch. The boot script in <head> applies the saved theme before paint. */
export function ThemeToggle({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the theme applied by the boot script
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.add("theme-anim");
    html.dataset.theme = next;
    try { localStorage.setItem("nov-theme", next); } catch { /* private mode */ }
    setTheme(next);
    window.setTimeout(() => html.classList.remove("theme-anim"), 400);
  };

  const dark = theme === "dark";
  const label = dark ? t.common.theme.toLight : t.common.theme.toDark;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} aria-pressed={dark} className={`flex h-11 min-w-11 items-center justify-center gap-2 ${className}`}>
      <span className="relative block size-5" aria-hidden="true">
        {/* sun */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className={`absolute inset-0 transition-[opacity,transform] duration-300 ${dark ? "rotate-90 scale-50 opacity-0" : "opacity-100"}`}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
        </svg>
        {/* moon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={`absolute inset-0 transition-[opacity,transform] duration-300 ${dark ? "opacity-100" : "-rotate-90 scale-50 opacity-0"}`}>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      </span>
      {withLabel && <span className="t-label">{dark ? t.common.theme.night : t.common.theme.day}</span>}
    </button>
  );
}
