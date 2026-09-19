"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-in choreography for everything inside `scope`, driven by attributes:
 *
 * - `data-split`: headings rise line by line from behind a mask
 * - `data-reveal`: blocks fade up, batched so neighbours stagger together
 * - `data-draw` (on SVG paths with pathLength="1"): lines draw themselves
 *
 * Content is fully visible without JavaScript and with reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root || prefersReducedMotion()) return;

      root.querySelectorAll<HTMLElement>("[data-split]").forEach((heading) => {
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (split) =>
            gsap.from(split.lines, {
              yPercent: 105,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.08,
              scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            }),
        });
      });

      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      if (blocks.length > 0) {
        gsap.set(blocks, { autoAlpha: 0, y: 26 });
        ScrollTrigger.batch(blocks, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: "expo.out", stagger: 0.07, overwrite: true }),
        });
      }

      root.querySelectorAll<SVGSVGElement>("svg[data-draw-root]").forEach((svg) => {
        const paths = svg.querySelectorAll<SVGPathElement>("[data-draw]");
        if (paths.length === 0) return;
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
    },
    { scope },
  );
}
