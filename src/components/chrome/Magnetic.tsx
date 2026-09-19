"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/** Leans its child toward the cursor while hovered, then springs back. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasFinePointer() || prefersReducedMotion()) return;
    const toX = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3" });
    const toY = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3" });
    let box = element.getBoundingClientRect();

    // Measure where the element rests, ignoring any pull still in progress.
    const onEnter = () => {
      const rect = element.getBoundingClientRect();
      const x = Number(gsap.getProperty(element, "x"));
      const y = Number(gsap.getProperty(element, "y"));
      box = new DOMRect(rect.left - x, rect.top - y, rect.width, rect.height);
    };
    const onMove = (event: PointerEvent) => {
      toX((event.clientX - (box.left + box.width / 2)) * strength);
      toY((event.clientY - (box.top + box.height / 2)) * strength);
    };
    const onLeave = () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: true });
    };

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className="inline-flex">
      {children}
    </span>
  );
}
