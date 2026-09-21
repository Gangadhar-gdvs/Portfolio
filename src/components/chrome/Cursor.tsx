"use client";

import { useEffect, useRef } from "react";
import { layers } from "@/content/layers";
import { stageHover } from "@/gl/stageState";
import { isLite, onLiteChange } from "@/lib/lite";
import { hasFinePointer } from "@/lib/motion";
import { motionAllowed, withMotion } from "@/lib/motionRuntime";

const INTERACTIVE = "a, button, [role='button'], label, select, summary, input";

/**
 * A dot that tracks the mouse exactly and a ring that trails it. Over links
 * the ring grows; over elements with `data-cursor` it becomes a small label.
 * Mouse only, and off in Lite mode and for reduced motion.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !hasFinePointer()) return;
    let dispose: (() => void) | undefined;

    const start = () => {
      if (!motionAllowed()) return;
      dispose = withMotion(({ gsap }) => {
        const dot = root.querySelector<HTMLElement>(".cursor-dot");
        const ring = root.querySelector<HTMLElement>(".cursor-ring");
        const text = root.querySelector<HTMLElement>(".cursor-text");
        if (!dot || !ring || !text) return;

        const html = document.documentElement;
        html.classList.add("has-cursor");
        const dotX = gsap.quickSetter(dot, "x", "px");
        const dotY = gsap.quickSetter(dot, "y", "px");
        const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
        const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

        let target: Element | null = null;
        let seen = false;

        const describe = () => {
          const labelled = target?.closest<HTMLElement>("[data-cursor]");
          let state = "";
          let label = "";
          if (labelled) {
            const kind = labelled.dataset.cursor;
            const plate = stageHover.get();
            label = kind === "drag" ? (plate >= 0 ? layers[plate].short : "Drag") : (kind ?? "");
            state = "label";
          } else if (target?.closest(INTERACTIVE)) {
            state = "link";
          }
          if (root.dataset.state !== state) root.dataset.state = state;
          if (text.textContent !== label && label) text.textContent = label;
        };

        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          dotX(event.clientX);
          dotY(event.clientY);
          if (!seen) {
            seen = true;
            gsap.set(ring, { x: event.clientX, y: event.clientY });
          } else {
            ringX(event.clientX);
            ringY(event.clientY);
          }
          delete root.dataset.hidden;
          target = event.target instanceof Element ? event.target : null;
          describe();
        };
        const onLeave = () => {
          root.dataset.hidden = "";
        };
        const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.3, ease: "power3" });
        const onUp = () => gsap.to(ring, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" });

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        html.addEventListener("pointerleave", onLeave);
        const stopHover = stageHover.subscribe(describe);

        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          html.removeEventListener("pointerleave", onLeave);
          stopHover();
          html.classList.remove("has-cursor");
          root.dataset.hidden = "";
          gsap.set([dot, ring], { clearProps: "all" });
        };
      });
    };

    start();
    const stopWatching = onLiteChange((lite) => {
      if (lite) {
        dispose?.();
        dispose = undefined;
      } else if (!dispose) {
        start();
      }
    });

    return () => {
      stopWatching();
      dispose?.();
    };
  }, []);

  if (isLite()) return null;

  return (
    <div ref={ref} className="cursor max-md:hidden" aria-hidden="true" data-hidden="">
      <div className="cursor-ring">
        <span className="cursor-text t-label" />
      </div>
      <div className="cursor-dot" />
    </div>
  );
}
