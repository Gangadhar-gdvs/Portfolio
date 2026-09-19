"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

interface TiltPanelProps {
  children: ReactNode;
  className?: string;
  /** Largest tilt, in degrees. */
  max?: number;
}

/**
 * Tips toward the cursor in 3D, with a faint sheen where the light would
 * catch it. Mouse only; flat for reduced motion.
 */
export function TiltPanel({ children, className = "", max = 5 }: TiltPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = ref.current;
    if (!panel || !hasFinePointer() || prefersReducedMotion()) return;
    const sheen = panel.querySelector<HTMLElement>("[data-sheen]");
    const rotateX = gsap.quickTo(panel, "rotationX", { duration: 0.9, ease: "power3" });
    const rotateY = gsap.quickTo(panel, "rotationY", { duration: 0.9, ease: "power3" });
    gsap.set(panel, { transformPerspective: 1400 });

    const onMove = (event: PointerEvent) => {
      const box = panel.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      rotateY((x - 0.5) * max * 2);
      rotateX(-(y - 0.5) * max * 2);
      if (sheen) {
        sheen.style.opacity = "1";
        sheen.style.background = `radial-gradient(38rem circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgb(238 242 247 / 0.06), transparent 60%)`;
      }
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
      if (sheen) sheen.style.opacity = "0";
    };

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerleave", onLeave);
    return () => {
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`relative will-change-transform ${className}`}>
      {children}
      <div
        data-sheen
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500"
      />
    </div>
  );
}
