"use client";

import { useRef, type ComponentProps } from "react";
import { MORPH, setScene } from "@/gl/sceneState";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { lerp } from "@/lib/math";
import { useReveal } from "./useReveal";

type SceneCue = "work" | "record";

interface MotionSectionProps extends ComponentProps<"section"> {
  /** What the particle layer should do while this section is on screen. */
  scene?: SceneCue;
}

/**
 * A server-rendered section with client-side choreography: scroll reveals for
 * its `data-*` hooks, and optionally a cue for the particle layer.
 */
export function MotionSection({ scene, children, ...props }: MotionSectionProps) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !scene) return;

      if (scene === "work") {
        // Leave the AI core and dissolve back into faint dust behind the work.
        ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "top 25%",
          onUpdate: (self) =>
            setScene({
              morph: MORPH.lastLayer + self.progress,
              opacity: lerp(1, 0.32, self.progress),
              layout: self.progress > 0.5 ? "center" : "side",
            }),
        });
      }

      if (scene === "record") {
        ScrollTrigger.create({
          trigger: root,
          start: "top 60%",
          end: "bottom top",
          onToggle: (self) => {
            if (self.isActive) setScene({ morph: MORPH.work, opacity: 0.22, layout: "center" });
          },
        });
      }
    },
    { scope: ref, dependencies: [scene] },
  );

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
