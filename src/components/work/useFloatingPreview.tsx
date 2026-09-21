"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Preview } from "@/content/projects";
import { prefersReducedMotion, useFinePointer } from "@/lib/motion";
import { withMotion } from "@/lib/motionRuntime";

/**
 * A framed capture of the product that follows the cursor over a list and
 * leans into its movement. Mounted on first hover, so its images only load
 * for people who point at the list. Mouse only.
 */
export function useFloatingPreview(previews: Preview[]) {
  const frame = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const finePointer = useFinePointer();
  const enabled = finePointer && previews.length > 0;
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = frame.current;
    if (!element || !armed) return;

    return withMotion(({ gsap }) => {
    const still = prefersReducedMotion();
    const toX = gsap.quickTo(element, "x", { duration: still ? 0.01 : 0.7, ease: "power3" });
    const toY = gsap.quickTo(element, "y", { duration: still ? 0.01 : 0.7, ease: "power3" });
    const toRotate = gsap.quickTo(element, "rotation", { duration: 0.9, ease: "power3" });
    let lastX = pointer.current.x;
    // Start under the cursor rather than sliding in from the corner.
    gsap.set(element, { x: pointer.current.x + 28, y: pointer.current.y - element.offsetHeight / 2 });

    const onMove = (event: PointerEvent) => {
      toX(event.clientX + 28);
      toY(event.clientY - element.offsetHeight / 2);
      if (!still) toRotate(gsap.utils.clamp(-7, 7, (event.clientX - lastX) * 0.35));
      lastX = event.clientX;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
    });
  }, [armed]);

  const show = useCallback(
    (src: string | undefined, event: React.PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      setArmed(true);
      setCurrent(src ?? null);
    },
    [enabled],
  );

  const hide = useCallback(() => setCurrent(null), []);

  const element =
    enabled && armed ? (
      <div
        ref={frame}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-30 hidden w-[22rem] md:block"
      >
        <div
          className={`relative aspect-[16/10] overflow-hidden rounded-[10px] bg-night-2 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] ring-1 ring-line-2 transition-[opacity,scale] duration-500 ease-out-expo ${
            current ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          {previews.map((preview) => (
            <Image
              key={preview.src}
              src={preview.src}
              alt=""
              fill
              sizes="352px"
              className={`object-cover object-top transition-opacity duration-300 ${current === preview.src ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>
    ) : null;

  return { show, hide, element };
}
