/**
 * Art-directed product illustration used in place of photography.
 * The NOV repository contains no product/campaign photographs, so instead of
 * unrelated stock imagery we render tonal line illustrations of the actual NOV
 * product types, clearly labelled as a photography placeholder.
 */
import Image from "next/image";
import { galleryFor } from "@/lib/productImages";

export const hasPhoto = (art: string) => galleryFor(art) !== null;

type Props = { sizes?: string; priority?: boolean; art: string; color: string; label: string; alt: string; className?: string; tone?: "sand" | "parchment" | "linen" | "wine"; showLabel?: boolean };

const TONES = { sand: "#E2D6C4", parchment: "#EDE5D8", linen: "#F4EEE5", wine: "#4A1520" } as const;
const STROKE = "rgba(44,24,16,.55)";

function scrunchiePath(cx: number, cy: number, r: number, amp: number, lobes: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 360; i += 3) {
    const a = (i * Math.PI) / 180;
    const rr = r + Math.sin(a * lobes) * amp;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function Shape({ art, c }: { art: string; c: string }) {
  const s = { stroke: STROKE, strokeWidth: 1.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (art) {
    case "hoodie":
      return (
        <g {...s}>
          <path fill={c} d="M128 168 92 188 58 330l36 12 22-92 2 172h164l2-172 22 92 36-12-34-142-36-20c-20-14-44-18-72-18s-52 4-72 18Z" />
          <path fill={c} d="M150 172c-4-48 18-80 50-82 32 2 54 34 50 82-16 16-32 22-50 22s-34-6-50-22Z" />
          <path fill="none" d="M166 176c10 10 22 14 34 14s24-4 34-14M190 192l-3 58M210 192l3 58M146 330h108l12 56H134l12-56ZM118 404h164M94 330l-4 14M306 330l4 14" />
        </g>
      );
    case "crewneck":
      return (
        <g {...s}>
          <path fill={c} d="M130 150 92 172 58 330l36 12 22-92 2 170h164l2-170 22 92 36-12-34-158-38-22c-14 14-36 22-70 22s-56-8-70-22Z" />
          <path fill="none" d="M136 152c14 18 36 26 64 26s50-8 64-26M118 400h164M94 330l-4 14M306 330l4 14M200 178v8" />
        </g>
      );
    case "pajama":
      return (
        <g {...s}>
          <defs>
            <pattern id={`stripe-${c.slice(1)}`} width="9" height="10" patternUnits="userSpaceOnUse"><rect width="9" height="10" fill={c} /><rect width="2" height="10" fill="rgba(94,26,38,.22)" /></pattern>
          </defs>
          <path fill={`url(#stripe-${c.slice(1)})`} d="M140 110 100 128 70 236l32 10 18-60 2 116h156l2-116 18 60 32-10-30-108-40-18-28 22h-36l-28-22Z" />
          <path fill={`url(#stripe-${c.slice(1)})`} stroke={STROKE} d="M200 132 172 110l-14 38 42-16 42 16-14-38-28 22Z" />
          <path fill="none" d="M200 132v168" />
          {[160, 196, 232, 268].map((y) => (<circle key={y} cx="207" cy={y} r="2.6" fill="#F4EEE5" />))}
          <path fill={`url(#stripe-${c.slice(1)})`} d="M128 322h144l10 104h-64l-18-58-18 58h-64l10-104Z" />
          <path fill="none" d="M128 336h144" />
        </g>
      );
    case "mask":
      return (
        <g {...s}>
          <path fill="none" d="M84 250c-30 4-44 20-46 40M316 250c30 4 44 20 46 40" />
          <path fill={c} d="M84 250c6-50 52-62 116-46 64-16 110-4 116 46-4 50-56 58-96 38-12-6-28-6-40 0-40 20-92 12-96-38Z" />
          <path fill="none" opacity=".6" d="M100 252c8-30 44-38 96-26M300 252c-8-30-44-38-96-26" />
        </g>
      );
    case "cap":
      return (
        <g {...s}>
          <path fill={c} d="M100 300c-6-80 40-128 112-130 74 2 116 52 112 128-70 18-154 18-224 2Z" />
          <path fill={c} d="M100 300c-34 4-56 16-64 34 50 12 108 10 160-4-30-14-62-24-96-30Z" />
          <path fill="none" d="M212 172c-20 30-26 80-16 126M212 172c26 30 40 76 38 124" />
          <circle cx="212" cy="170" r="5" fill={c} />
          <text x="236" y="262" fill="rgba(244,238,229,.78)" stroke="none" fontFamily="Georgia, serif" fontStyle="italic" fontSize="22" transform="rotate(-6 236 262)">NOV</text>
        </g>
      );
    case "tote":
      return (
        <g {...s}>
          <path fill="none" strokeWidth={9} stroke={c} d="M156 206c0-70 18-104 44-104s44 34 44 104" />
          <path fill="none" d="M151 206c0-74 20-110 49-110s49 36 49 110M161 206c0-66 16-98 39-98s39 32 39 98" />
          <path fill={c} d="M108 200h184l16 232H92l16-232Z" />
          <path fill="none" d="M108 214h184" opacity=".6" />
        </g>
      );
    case "scrunchie":
      return (
        <g {...s}>
          <path fill={c} fillRule="evenodd" d={`${scrunchiePath(200, 270, 112, 14, 11)} ${scrunchiePath(200, 270, 46, 6, 11)}`} />
          {Array.from({ length: 11 }).map((_, i) => {
            const a = (i / 11) * Math.PI * 2 + 0.14;
            return <path key={i} fill="none" opacity=".55" d={`M${200 + Math.cos(a) * 56},${270 + Math.sin(a) * 56}Q${200 + Math.cos(a + 0.15) * 90},${270 + Math.sin(a + 0.15) * 90} ${200 + Math.cos(a) * 118},${270 + Math.sin(a) * 118}`} />;
          })}
        </g>
      );
    case "beanie":
    default:
      return (
        <g {...s}>
          <path fill={c} d="M118 300c-6-96 28-152 82-154 54 2 88 58 82 154Z" />
          <path fill={c} d="M104 296h192v66H104z" />
          {Array.from({ length: 15 }).map((_, i) => (<path key={i} fill="none" opacity=".45" d={`M${116 + i * 12} 300v58`} />))}
          <path fill="none" opacity=".35" d="M160 170c-10 40-14 86-12 126M240 170c10 40 14 86 12 126M200 148v148" />
        </g>
      );
  }
}

export function ProductArt({ art, color, label, alt, className = "", tone = "parchment", showLabel = true, sizes = "(min-width: 1024px) 25vw, 50vw", priority = false }: Props) {
  const bg = TONES[tone];
  const real = galleryFor(art, color)?.[0];
  if (real) {
    return (
      <div className={`relative overflow-hidden bg-linen ${className}`}>
        <Image src={real.src} alt={alt} fill sizes={sizes} priority={priority} placeholder="blur" quality={80} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }} role="img" aria-label={alt}>
      <svg viewBox="0 0 400 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <radialGradient id={`glow-${art}`} cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <rect width="400" height="500" fill={`url(#glow-${art})`} />
        <ellipse cx="200" cy="448" rx="130" ry="10" fill="rgba(44,24,16,.08)" />
        <Shape art={art} c={color} />
      </svg>
      {showLabel && (
        <span className="t-small pointer-events-none absolute bottom-3 start-3 bg-ivory/70 px-2 py-0.5 text-[0.6875rem]! text-muted backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
