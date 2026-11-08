import type { Dictionary } from "@/i18n";

const ICONS = {
  shipping: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  returns: "M4 9h11a5 5 0 0 1 0 10H9M4 9l4-4M4 9l4 4",
  cod: "M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 10v.01M18 14v.01",
  embroidered: "M4 20 20 4M14 4h6v6M7 13l4 4M5 15l4 4",
} as const;

export function TrustBar({ t }: { t: Dictionary }) {
  const items = (Object.keys(ICONS) as (keyof typeof ICONS)[]).map((k) => ({ k, ...t.common.trust[k] }));
  return (
    <section aria-label={t.common.trust.shipping.t} className="border-y border-ink/10 bg-linen">
      <ul className="container-wide grid grid-cols-2 gap-px lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.k} className="flex items-center gap-4 py-6 lg:justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-wine">
              <path d={ICONS[it.k]} />
            </svg>
            <div>
              <p className="text-[0.875rem] font-semibold">{it.t}</p>
              <p className="t-small text-[0.75rem]!">{it.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
