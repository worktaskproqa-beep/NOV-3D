"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Frame, HoodieKey } from "@/lib/turntable";

type Side = "front" | "back";

type Props = {
  frames: Record<HoodieKey, Frame[]>;
  colour: HoodieKey;
  /** requested side + a counter that increments on every button press */
  side: Side;
  sideNonce: number;
  onSideChange: (s: Side) => void;
  onInteract: () => void;
  label: string;
  hint: string;
};

const SPRING = 7.5; // critically damped → settles in ~0.55s, never overshoots
const RESUME_MS = 9000;
const TILT_MAX = 22; // max visual tilt (deg) while turning between two photos
const norm = (a: number) => ((a % 360) + 360) % 360;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Image-based 360° turntable: every view is a real photograph; dragging blends between the two nearest
 * angles with a subtle perspective tilt. Only transform/opacity are animated (GPU-composited), and all
 * per-frame work bypasses React, so motion stays smooth on phones. No WebGL, no distorted textures.
 */
export function Turntable({ frames, colour, side, sideNonce, onSideChange, onInteract, label, hint }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  // first-paint state only — afterwards opacity is driven exclusively by the animation loop
  const [init] = useState(() => ({ colour, angle: side === "back" ? 180 : 0 }));
  const layerRefs = useRef(new Map<string, HTMLDivElement>());
  const colourRef = useRef(colour);
  const cbs = useRef({ onSideChange, onInteract });
  useEffect(() => { cbs.current = { onSideChange, onInteract }; }, [onSideChange, onInteract]);
  const api = useRef<{ goSide: (s: Side) => void; step: (dir: 1 | -1) => void } | null>(null);
  const sideRef = useRef(side);
  useEffect(() => { sideRef.current = side; }, [side]);
  useEffect(() => { colourRef.current = colour; }, [colour]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keys = Object.keys(frames) as HoodieKey[];
    const sorted = Object.fromEntries(keys.map((k) => [k, [...frames[k]].sort((a, b) => a.angle - b.angle)])) as Record<HoodieKey, Frame[]>;

    // nearest frame angle to θ (unwrapped, so the spring always takes the short way)
    const nearest = (k: HoodieKey, th: number) => {
      let best = th, bd = Infinity;
      for (const f of sorted[k]) {
        const c = f.angle + 360 * Math.round((th - f.angle) / 360);
        const d = Math.abs(c - th);
        if (d < bd) { bd = d; best = c; }
      }
      return best;
    };

    let angle = sideRef.current === "back" ? 180 : 0;
    let vel = 0; // deg/s
    let target = angle;
    let rest = angle;
    let dragging = false, dragAngle = angle, lastX = 0, lastT = 0, pVel = 0, startX = 0, startY = 0, decided = false;
    let auto = !reduce;
    let swayT = 0, flipT = 0, idleSince = performance.now();
    let lastSide: Side = sideRef.current;
    const mix: Record<string, number> = Object.fromEntries(keys.map((k) => [k, k === colourRef.current ? 1 : 0]));

    const interact = () => { auto = false; idleSince = performance.now(); cbs.current.onInteract(); };
    const goSide = (s: Side) => {
      interact();
      const want = s === "back" ? 180 : 0;
      const c = want + 360 * Math.round((angle - want) / 360);
      rest = target = c;
    };
    const step = (dir: 1 | -1) => {
      interact();
      const k = colourRef.current;
      const n = sorted[k].length;
      const gap = 360 / Math.max(2, n);
      rest = target = nearest(k, angle + dir * gap);
    };
    api.current = { goSide, step };

    // ── pointer: horizontal drags rotate; vertical swipes scroll the page ──
    const down = (e: PointerEvent) => {
      dragging = true; decided = e.pointerType === "mouse";
      startX = lastX = e.clientX; startY = e.clientY; lastT = e.timeStamp; pVel = 0; dragAngle = angle;
      if (decided) { stage.setPointerCapture(e.pointerId); stage.style.cursor = "grabbing"; interact(); }
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      if (!decided) {
        const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; } // let the page scroll
        decided = true; stage.setPointerCapture(e.pointerId); interact();
      }
      const dx = e.clientX - lastX; lastX = e.clientX;
      const dA = (dx / Math.max(260, stage.clientWidth)) * 300;
      dragAngle += dA;
      const dt = Math.max(0.008, (e.timeStamp - lastT) / 1000); lastT = e.timeStamp;
      pVel = pVel * 0.7 + (dA / dt) * 0.3;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false; stage.style.cursor = "grab";
      try { stage.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
      if (!decided) return;
      if (e.timeStamp - lastT > 90) pVel = 0; // finger rested before lifting
      const v = Math.max(-900, Math.min(900, pVel));
      rest = target = nearest(colourRef.current, angle + v * 0.18);
      vel = v * 0.5;
      idleSince = performance.now();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(stage);

    const physics = (h: number) => {
      if (dragging && decided) {
        const prev = angle;
        angle += (dragAngle - angle) * (1 - Math.exp(-30 * h));
        vel = (angle - prev) / h;
        return;
      }
      if (auto) {
        swayT += h; flipT += h;
        if (flipT > 6.5) { flipT = 0; rest = nearest(colourRef.current, rest + 180); }
        target = rest + Math.sin(swayT * 0.8) * 9;
      } else if (!reduce && performance.now() - idleSince > RESUME_MS) {
        auto = true; flipT = 0; rest = nearest(colourRef.current, angle);
      }
      const acc = SPRING * SPRING * (target - angle) - 2 * SPRING * vel;
      vel += acc * h;
      angle += vel * h;
    };

    let raf = 0, last = performance.now();
    const render = (dt: number) => {
      const k = colourRef.current;
      for (const c of keys) mix[c] += ((c === k ? 1 : 0) - mix[c]) * Math.min(1, dt * (reduce ? 60 : 9));
      const n = norm(angle);
      // per colour: the two frames around the current angle and the blend between them.
      // Each photo carries its own tilt: the outgoing one keeps turning away, the incoming one turns in
      // from the opposite side — both in the same direction, so motion is continuous through the hand-over.
      const tiltOf = (d: number) => Math.max(-TILT_MAX, Math.min(TILT_MAX, d * 0.32));
      const xf = (tl: number) => `perspective(1400px) rotateY(${(-tl).toFixed(2)}deg) scale(${(1 - 0.035 * Math.abs(Math.sin((tl / TILT_MAX) * (Math.PI / 2)))).toFixed(4)})`;
      for (const c of keys) {
        const fs = sorted[c];
        let ia = fs.length - 1;
        for (let i = 0; i < fs.length; i++) if (fs[i].angle <= n) ia = i;
        const ib = (ia + 1) % fs.length;
        const a = fs[ia].angle, b = fs[ib].angle;
        const span = norm(b - a) || 360;
        const t = norm(n - a) / span;
        const aOp = 1 - smooth(0.55, 0.78, t);
        const bOp = smooth(0.22, 0.6, t);
        fs.forEach((_, i) => {
          const el = layerRefs.current.get(`${c}-${i}`);
          if (!el) return;
          const o = (i === ia ? aOp : i === ib ? bOp : 0) * mix[c];
          el.style.opacity = o < 0.002 ? "0" : o.toFixed(3);
          el.style.zIndex = i === ib ? "2" : "1";
          if (i === ia) el.style.transform = xf(tiltOf(t * span));
          else if (i === ib) el.style.transform = xf(tiltOf((t - 1) * span));
        });
      }
      const sd: Side = Math.cos((angle * Math.PI) / 180) >= 0 ? "front" : "back";
      if (sd !== lastSide) { lastSide = sd; cbs.current.onSideChange(sd); }
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      for (let i = 0; i < steps; i++) physics(dt / steps);
      render(dt);
    };
    render(1);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      api.current = null;
    };
  }, [frames]);

  useEffect(() => {
    if (sideNonce > 0) api.current?.goSide(sideRef.current);
  }, [sideNonce]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      api.current?.step(e.key === "ArrowRight" ? 1 : -1);
    }
  };

  const keys = Object.keys(frames) as HoodieKey[];
  const orderOf = (c: HoodieKey, f: Frame) => [...frames[c]].sort((a, b) => a.angle - b.angle).indexOf(f);
  return (
    <div
      ref={stageRef}
      role="img"
      aria-label={`${label}. ${hint}`}
      tabIndex={0}
      onKeyDown={onKey}
      className="absolute inset-0 cursor-grab select-none outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
      style={{ touchAction: "pan-y" }}
    >
      <div className="absolute inset-0">
        {keys.map((c) =>
          frames[c].map((f) => (
            <div
              key={`${c}-${f.angle}`}
              ref={(el) => {
                const id = `${c}-${orderOf(c, f)}`;
                if (el) layerRefs.current.set(id, el);
                else layerRefs.current.delete(id);
              }}
              className="absolute inset-0 will-change-[opacity,transform]"
              style={{ opacity: c === init.colour && f.angle === init.angle ? 1 : 0 }}
            >
              <Image
                src={f.src}
                alt=""
                aria-hidden="true"
                fill
                draggable={false}
                quality={90}
                sizes="(min-width: 1024px) 50vw, 92vw"
                priority={c === init.colour && f.angle === init.angle}
                className="pointer-events-none object-contain"
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}
