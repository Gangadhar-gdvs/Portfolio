"use client";

import { useEffect, useRef } from "react";
import { isLite } from "@/lib/lite";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A number that counts up the first time it scrolls into view. Server-rendered
 * at its final value, so it is correct without JavaScript and in Lite mode.
 */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || isLite() || prefersReducedMotion()) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          element.textContent = `${Math.round(value * eased)}${suffix}`;
          if (t < 1) frame = requestAnimationFrame(run);
        };
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {value}
      {suffix}
    </span>
  );
}
