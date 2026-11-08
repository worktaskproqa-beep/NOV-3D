import type { StaticImageData } from "next/image";

// NOV product photography — sourced exclusively from the real NOV photos (github.com/worktaskproqa-beep/NOV-, Nov-01…Nov-12).
// Exported at high resolution (lanczos3 + light sharpening, 4:4:4 chroma). Studio front/back = real garment pixels cut out
// of Nov-05…08 and placed on a rendered NOV studio backdrop. No garment pixel is generated or retouched.
import wineFront from "../../public/images/hoodies/wine-front.jpg";
import wineBack from "../../public/images/hoodies/wine-back.jpg";
import wineMan from "../../public/images/hoodies/wine-man.jpg";
import wineRear from "../../public/images/hoodies/wine-rear.jpg";
import wineWoman from "../../public/images/hoodies/wine-woman.jpg";
import wineWalk from "../../public/images/hoodies/wine-walk.jpg";
import wineEmb from "../../public/images/hoodies/wine-emb.jpg";
import wineSleeve from "../../public/images/hoodies/wine-sleeve.jpg";
import wineQr from "../../public/images/hoodies/wine-qr.jpg";
import wineFabric from "../../public/images/hoodies/wine-fabric.jpg";
import blueFront from "../../public/images/hoodies/blue-front.jpg";
import blueBack from "../../public/images/hoodies/blue-back.jpg";
import blueMan from "../../public/images/hoodies/blue-man.jpg";
import blueRear from "../../public/images/hoodies/blue-rear.jpg";
import blueWoman from "../../public/images/hoodies/blue-woman.jpg";
import blueWalk from "../../public/images/hoodies/blue-walk.jpg";
import blueEmb from "../../public/images/hoodies/blue-emb.jpg";
import blueSleeve from "../../public/images/hoodies/blue-sleeve.jpg";
import blueQr from "../../public/images/hoodies/blue-qr.jpg";
import blueFabric from "../../public/images/hoodies/blue-fabric.jpg";
import brownFront from "../../public/images/hoodies/brown-front.jpg";
import brownBack from "../../public/images/hoodies/brown-back.jpg";
import brownMan from "../../public/images/hoodies/brown-man.jpg";
import brownRear from "../../public/images/hoodies/brown-rear.jpg";
import brownWoman from "../../public/images/hoodies/brown-woman.jpg";
import brownWalk from "../../public/images/hoodies/brown-walk.jpg";
import brownEmb from "../../public/images/hoodies/brown-emb.jpg";
import brownSleeve from "../../public/images/hoodies/brown-sleeve.jpg";
import brownQr from "../../public/images/hoodies/brown-qr.jpg";
import brownFabric from "../../public/images/hoodies/brown-fabric.jpg";
import blackFront from "../../public/images/hoodies/black-front.jpg";
import blackBack from "../../public/images/hoodies/black-back.jpg";
import blackMan from "../../public/images/hoodies/black-man.jpg";
import blackRear from "../../public/images/hoodies/black-rear.jpg";
import blackWoman from "../../public/images/hoodies/black-woman.jpg";
import blackWalk from "../../public/images/hoodies/black-walk.jpg";
import blackEmb from "../../public/images/hoodies/black-emb.jpg";
import blackSleeve from "../../public/images/hoodies/black-sleeve.jpg";
import blackQr from "../../public/images/hoodies/black-qr.jpg";
import blackFabric from "../../public/images/hoodies/black-fabric.jpg";
import capWine from "../../public/images/caps/wine.jpg";

export type ShotKind = "front" | "back" | "man" | "rear" | "woman" | "walk" | "emb" | "sleeve" | "qr" | "fabric";
export type Shot = { src: StaticImageData; kind: ShotKind; wide?: boolean; studio?: boolean };

export const HOODIE_COLORS = {
  wine: { hex: "#5E1A26", en: "Burgundy", ar: "عنابي" },
  blue: { hex: "#1E2A8A", en: "Royal Blue", ar: "أزرق ملكي" },
  brown: { hex: "#6B3F26", en: "Brown", ar: "بنّي" },
  black: { hex: "#151313", en: "Black", ar: "أسود" },
} as const;
export type HoodieColor = keyof typeof HOODIE_COLORS;

const IMG = {
  wine: { front: wineFront, back: wineBack, man: wineMan, rear: wineRear, woman: wineWoman, walk: wineWalk, emb: wineEmb, sleeve: wineSleeve, qr: wineQr, fabric: wineFabric },
  blue: { front: blueFront, back: blueBack, man: blueMan, rear: blueRear, woman: blueWoman, walk: blueWalk, emb: blueEmb, sleeve: blueSleeve, qr: blueQr, fabric: blueFabric },
  brown: { front: brownFront, back: brownBack, man: brownMan, rear: brownRear, woman: brownWoman, walk: brownWalk, emb: brownEmb, sleeve: brownSleeve, qr: brownQr, fabric: brownFabric },
  black: { front: blackFront, back: blackBack, man: blackMan, rear: blackRear, woman: blackWoman, walk: blackWalk, emb: blackEmb, sleeve: blackSleeve, qr: blackQr, fabric: blackFabric },
} as const;

const gallery = (c: HoodieColor): Shot[] => [
  { src: IMG[c].front, kind: "front", studio: true },
  { src: IMG[c].back, kind: "back", studio: true },
  { src: IMG[c].man, kind: "man" },
  { src: IMG[c].rear, kind: "rear" },
  { src: IMG[c].emb, kind: "emb" },
  { src: IMG[c].sleeve, kind: "sleeve" },
  { src: IMG[c].qr, kind: "qr" },
  { src: IMG[c].fabric, kind: "fabric" },
  { src: IMG[c].woman, kind: "woman" },
  { src: IMG[c].walk, kind: "walk" },
];

/** Galleries keyed by product art → upper-case colour hex. */
export const GALLERIES: Record<string, Record<string, Shot[]>> = {
  hoodie: Object.fromEntries((Object.keys(HOODIE_COLORS) as HoodieColor[]).map((c) => [HOODIE_COLORS[c].hex, gallery(c)])),
  cap: { "#5E1A26": [{ src: capWine, kind: "front", studio: true }] },
};

export function galleryFor(art: string, hex?: string): Shot[] | null {
  const byColor = GALLERIES[art];
  if (!byColor) return null;
  return (hex && byColor[hex.toUpperCase()]) || Object.values(byColor)[0] || null;
}

export const HOODIES = IMG;
export const CAP_IMAGES = { wine: capWine };

// ── Transparent cut-outs (real garment pixels, background removed) used by the store tiles ──
import cutWineFront from "../../public/images/showcase/wine-front.webp";
import cutWineBack from "../../public/images/showcase/wine-back.webp";
import cutBlueFront from "../../public/images/showcase/blue-front.webp";
import cutBlueBack from "../../public/images/showcase/blue-back.webp";
import cutBrownFront from "../../public/images/showcase/brown-front.webp";
import cutBrownBack from "../../public/images/showcase/brown-back.webp";
import cutBlackFront from "../../public/images/showcase/black-front.webp";
import cutBlackBack from "../../public/images/showcase/black-back.webp";
import cutCap from "../../public/images/caps/wine-cutout.webp";

export type Cutout = { front: StaticImageData; back?: StaticImageData };
const CUTOUTS: Record<string, Record<string, Cutout>> = {
  hoodie: {
    [HOODIE_COLORS.wine.hex]: { front: cutWineFront, back: cutWineBack },
    [HOODIE_COLORS.blue.hex]: { front: cutBlueFront, back: cutBlueBack },
    [HOODIE_COLORS.brown.hex]: { front: cutBrownFront, back: cutBrownBack },
    [HOODIE_COLORS.black.hex]: { front: cutBlackFront, back: cutBlackBack },
  },
  cap: { "#5E1A26": { front: cutCap } },
};

export function cutoutFor(art: string, hex?: string): Cutout | null {
  const byColor = CUTOUTS[art];
  if (!byColor) return null;
  return (hex && byColor[hex.toUpperCase()]) || Object.values(byColor)[0] || null;
}
