import type { StaticImageData } from "next/image";
import wineFront from "../../public/images/showcase/wine-front.webp";
import wineBack from "../../public/images/showcase/wine-back.webp";
import blueFront from "../../public/images/showcase/blue-front.webp";
import blueBack from "../../public/images/showcase/blue-back.webp";
import brownFront from "../../public/images/showcase/brown-front.webp";
import brownBack from "../../public/images/showcase/brown-back.webp";
import blackFront from "../../public/images/showcase/black-front.webp";
import blackBack from "../../public/images/showcase/black-back.webp";

export type HoodieKey = "wine" | "blue" | "brown" | "black";

/**
 * One real photograph per viewing angle (degrees, 0 = front, 180 = back, clockwise seen from above).
 * The turntable blends between neighbouring angles, so adding more angles makes rotation more continuous.
 * To add the rendered 3D views (three-quarter, profile …), drop the image in /public/images/showcase
 * and append e.g. `{ angle: 45, src: wine34 }` to the colour's list — no other code changes needed.
 */
export type Frame = { angle: number; src: StaticImageData };

export const TURNTABLE: Record<HoodieKey, Frame[]> = {
  wine: [{ angle: 0, src: wineFront }, { angle: 180, src: wineBack }],
  blue: [{ angle: 0, src: blueFront }, { angle: 180, src: blueBack }],
  brown: [{ angle: 0, src: brownFront }, { angle: 180, src: brownBack }],
  black: [{ angle: 0, src: blackFront }, { angle: 180, src: blackBack }],
};
