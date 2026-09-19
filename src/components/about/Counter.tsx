"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** A number that counts up once it scrolls into view. Server-rendered at its final value. */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || prefersReducedMotion()) return;
      const state = { n: 0 };
      element.textContent = `0${suffix}`;
      gsap.to(state, {
        n: value,
        duration: 1.8,
        ease: "expo.out",
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
        onUpdate: () => {
          element.textContent = `${Math.round(state.n)}${suffix}`;
        },
      });
    },
    { dependencies: [value, suffix] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {value}
      {suffix}
    </span>
  );
}
