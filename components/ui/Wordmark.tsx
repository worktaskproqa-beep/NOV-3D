/**
 * NOV logo — vector serif wordmark matching the serif "NOV" embroidered on the products.
 * Drawn as paths (no font dependency). The "O" is a clean open ring: no dot inside, by brand request.
 * Never mirrored in RTL.
 */
export function Wordmark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <span className={`wordmark select-none ${className}`} translate="no">
      <svg viewBox="0 0 312 100" height="1em" width="3.12em" fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
        {/* N — thin stems, heavy diagonal, bracket serifs */}
        <path d="M2 14h30l52 61V22c0-5-3-7-10-7h-4v-1h30v1h-4c-7 0-9 2-9 7v66h-6L24 26v52c0 5 3 7 10 7h4v1H8v-1h4c7 0 9-2 9-7V22l-3-4c-3-3-6-3-10-3H2z" />
        {/* O — high-contrast ring, hollow centre */}
        <path fillRule="evenodd" d="M163 12c26 0 44 17 44 38s-18 38-44 38-44-17-44-38 18-38 44-38zm0 3c-15 0-24 15-24 35s9 35 24 35 24-15 24-35-9-35-24-35z" />
        {/* V — heavy left stroke, thin right stroke */}
        <path d="M214 14h40v1h-5c-7 0-8 3-6 8l26 54 21-50c3-7 1-12-8-12h-3v-1h30v1h-2c-6 0-9 3-12 9l-31 65h-5l-34-71c-3-5-5-3-11-3z" />
      </svg>
    </span>
  );
}
