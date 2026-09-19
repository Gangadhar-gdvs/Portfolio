"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

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
 * the same scroll position on the same frame. Skipped for reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      lerp: 0.11,
      stopInertiaOnNavigate: true,
    });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  // After a route change the new page has mounted its triggers; measure them,
  // then honour a #hash in the URL (pin spacers change where targets sit).
  // Lenis clamps targets to the previous page's height until it re-measures.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      instance?.resize();
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
