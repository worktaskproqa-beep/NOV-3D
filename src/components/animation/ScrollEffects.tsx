"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = "[data-reveal], .lines, .curtain";

/**
 * Global scroll-motion engine.
 * - Reveals: IntersectionObserver adds `.is-in` once (no scroll listeners).
 * - Parallax: elements with data-parallax="0.15" are translated by
 *   (distance from viewport centre × factor), in a single rAF loop, using translate3d only.
 *   Technique adapted from the Three.js scroll demo (scroll offset → transform),
 *   but rAF-throttled, viewport-relative and disabled for reduced motion.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) el.classList.add("is-in");
        else io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduce) return;
      const vh = window.innerHeight;
      const mobileScale = window.innerWidth < 768 ? 0.5 : 1;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const host = el.parentElement ?? el;
        const r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const factor = Number(el.dataset.parallax) || 0.15;
        const offset = (r.top + r.height / 2 - vh / 2) * factor * mobileScale;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
