"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLite, onLiteChange } from "@/lib/lite";
import { prefersReducedMotion } from "@/lib/motion";
import { loadMotion, motionAllowed } from "@/lib/motionRuntime";

let instance: Lenis | null = null;

/** The page-wide Lenis instance, or null when smooth scrolling is off. */
export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToTarget(target: string | HTMLElement | number): void {
  if (instance) {
    instance.scrollTo(target, { duration: 1.4 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView();
}

/**
 * Smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis read
 * the same scroll position on the same frame. Both libraries load after the
 * page is interactive, and neither loads at all in Lite mode or with reduced
 * motion: then the browser's own scrolling is used.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    let stop: (() => void) | undefined;

    const start = async () => {
      if (!motionAllowed() || instance) return;
      const [{ gsap, ScrollTrigger }, lenisModule] = await Promise.all([loadMotion(), import("lenis")]);
      if (!alive || instance || !motionAllowed()) return;

      const lenis = new lenisModule.default({ autoRaf: false, anchors: true, lerp: 0.11, stopInertiaOnNavigate: true });
      instance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      stop = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        instance = null;
      };
    };

    void start();
    const stopWatching = onLiteChange(() => {
      if (isLite() || prefersReducedMotion()) {
        stop?.();
        stop = undefined;
      } else {
        void start();
      }
    });

    return () => {
      alive = false;
      stopWatching();
      stop?.();
    };
  }, []);

  // After a route change the new page has mounted its triggers; measure them,
  // then honour a #hash in the URL (pin spacers change where targets sit).
  useEffect(() => {
    const frame = requestAnimationFrame(async () => {
      if (motionAllowed()) {
        const { ScrollTrigger } = await loadMotion();
        ScrollTrigger.refresh();
        instance?.resize();
      }
      const { hash } = window.location;
      const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      if (instance) instance.scrollTo(target, { immediate: true, force: true });
      else target.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
