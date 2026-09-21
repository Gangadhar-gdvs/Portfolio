"use client";

import { useEffect, type RefObject } from "react";
import { isLite, onLiteChange } from "@/lib/lite";
import { prefersReducedMotion } from "@/lib/motion";
import { withMotion } from "@/lib/motionRuntime";

/**
 * Scroll-in choreography for everything inside `scope`, driven by attributes:
 *
 * - `data-split`: headings rise line by line from behind a mask
 * - `data-reveal`: blocks fade up, batched so neighbours stagger together
 * - `data-draw` (on SVG paths with pathLength="1"): lines draw themselves
 * - `data-draw-line`: hairlines draw across from the left
 * - `data-develop`: photos develop from black and white into colour
 *
 * Nothing is ever hidden that the reader can already see: the motion layer
 * loads after the page is interactive, so anything on screen by then is left
 * alone. Content is fully visible without JavaScript, in Lite mode and with
 * reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    let dispose: (() => void) | undefined;

    const start = () => {
      if (isLite() || prefersReducedMotion()) return;
      dispose = withMotion(({ gsap, ScrollTrigger, SplitText }) => {
        const context = gsap.context(() => {
          // Only animate what the reader hasn't reached yet.
          const waiting = (element: Element) => element.getBoundingClientRect().top > window.innerHeight * 0.88;

          root.querySelectorAll<HTMLElement>("[data-split]").forEach((heading) => {
            if (!waiting(heading)) return;
            SplitText.create(heading, {
              type: "lines",
              mask: "lines",
              // Whole lines only, so the text still reads in order and needs no
              // aria-label (which isn't allowed on a paragraph).
              aria: "none",
              autoSplit: true,
              onSplit: (split) =>
                gsap.from(split.lines, {
                  yPercent: 110,
                  duration: 1.2,
                  ease: "expo.out",
                  stagger: 0.09,
                  scrollTrigger: { trigger: heading, start: "top 88%", once: true },
                }),
            });
          });

          const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]", root).filter(waiting);
          if (blocks.length > 0) {
            gsap.set(blocks, { autoAlpha: 0, y: 18 });
            ScrollTrigger.batch(blocks, {
              start: "top 92%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: "expo.out", stagger: 0.07, overwrite: true }),
            });
          }

          root.querySelectorAll<HTMLElement>("[data-draw-line]").forEach((line) => {
            if (!waiting(line)) return;
            gsap.from(line, {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.6,
              ease: "expo.out",
              scrollTrigger: { trigger: line, start: "top 94%", once: true },
            });
          });

          root.querySelectorAll<HTMLElement>("[data-develop]").forEach((photo) => {
            if (!waiting(photo)) return;
            photo.classList.add("develop-pending");
            ScrollTrigger.create({
              trigger: photo,
              start: "top 72%",
              once: true,
              onEnter: () => photo.classList.remove("develop-pending"),
            });
          });

          root.querySelectorAll<SVGSVGElement>("svg[data-draw-root]").forEach((svg) => {
            const paths = svg.querySelectorAll<SVGPathElement>("[data-draw]");
            if (paths.length === 0 || !waiting(svg)) return;
            gsap.fromTo(
              paths,
              { attr: { "stroke-dasharray": 1, "stroke-dashoffset": 1 } },
              {
                attr: { "stroke-dashoffset": 0 },
                duration: 1.3,
                ease: "power2.inOut",
                stagger: 0.12,
                scrollTrigger: { trigger: svg, start: "top 82%", once: true },
              },
            );
          });
        }, root);

        return () => context.revert();
      });
    };

    start();
    // Switching to Lite puts every hidden block back the way it was.
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
  }, [scope]);
}
