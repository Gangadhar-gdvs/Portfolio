"use client";

import { useRef } from "react";
import { layers, type Layer } from "@/content/layers";
import { MORPH, setScene } from "@/gl/sceneState";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/components/motion/useReveal";

/**
 * Five full-height layers, surface to core. While a layer scrolls in, the
 * particles scrub from the previous layer's shape to its own.
 */
export function LayersSection() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const panels = root.querySelectorAll<HTMLElement>("[data-layer-panel]");
      const gaugeItems = root.querySelectorAll<HTMLElement>("[data-gauge-item]");
      const gaugeFill = root.querySelector<HTMLElement>("[data-gauge-fill]");

      ScrollTrigger.create({
        trigger: root.querySelector("[data-layers-intro]"),
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) setScene({ morph: MORPH.hero, layout: "center", opacity: 1 });
        },
      });

      panels.forEach((panel, index) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top 85%",
          end: "top 20%",
          onUpdate: (self) => {
            setScene({
              morph: MORPH.hero + index + self.progress,
              layout: index === 0 && self.progress < 0.3 ? "center" : "side",
              opacity: 1,
            });
          },
        });

        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) gaugeItems.forEach((item, i) => item.toggleAttribute("data-active", i === index));
          },
        });
      });

      if (gaugeFill && panels.length > 0) {
        ScrollTrigger.create({
          trigger: panels[0],
          endTrigger: panels[panels.length - 1],
          start: "top center",
          end: "bottom center",
          onUpdate: (self) => {
            gaugeFill.style.transform = `scaleY(${self.progress})`;
          },
        });
      }
    },
    { scope: section },
  );

  return (
    <section ref={section} id="stack" aria-labelledby="stack-title" data-nav-theme="abyss" className="relative">
      <div data-layers-intro className="mx-auto flex min-h-[85svh] max-w-[1600px] items-center px-5 sm:px-8 md:px-10">
        <div className="max-w-4xl">
          <p data-reveal className="eyebrow text-phosphor">
            Under the surface
          </p>
          <h2 id="stack-title" data-split className="display-tight mt-5 text-[clamp(2.5rem,6.4vw,6rem)] text-bone">
            Five layers down. I build in every one.
          </h2>
          <p data-reveal className="measure mt-7 text-lg leading-relaxed text-bone-soft md:text-xl">
            Every product runs on the same stack: an interface people touch, the devices it lives on, services that keep
            it running, data that keeps it true, and intelligence that lets it act. Here is my work at each depth.
          </p>
        </div>
      </div>

      <div className="relative">
        <DepthGauge />
        {layers.map((layer, index) => (
          <LayerPanel key={layer.id} layer={layer} index={index} />
        ))}
      </div>
    </section>
  );
}

function LayerPanel({ layer, index }: { layer: Layer; index: number }) {
  return (
    <article
      data-layer-panel
      aria-labelledby={`layer-${layer.id}`}
      className="relative flex min-h-[100svh] pt-[44svh] pb-16 md:items-center md:py-0"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10">
        <div className="relative max-w-[36rem] lg:ml-[8.333%] xl:ml-[11%]">
          {/* On phones the shape sits above the copy; this keeps the copy on solid ground. */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-5 -top-12 -bottom-16 -z-10 bg-[linear-gradient(to_bottom,transparent,var(--color-abyss)_3rem)] md:hidden"
          />
          <p data-reveal className="eyebrow flex items-center gap-3 text-phosphor">
            <span className="text-bone-soft">
              Layer {index + 1} of {layers.length}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-phosphor/50" />
            {layer.name}
          </p>
          <h3
            id={`layer-${layer.id}`}
            data-split
            className="display-tight mt-5 text-[clamp(2.3rem,5.2vw,4.8rem)] text-bone"
          >
            {layer.statement}
          </h3>
          <p data-reveal className="mt-5 text-lg leading-relaxed text-bone-soft">
            {layer.body}
          </p>
          <ul className="mt-8 border-t border-line">
            {layer.evidence.map((item) => (
              <li
                key={`${item.source}-${item.detail}`}
                data-reveal
                className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[10.5rem_1fr] sm:gap-5"
              >
                <span className="readout text-phosphor">{item.source}</span>
                <span className="text-[0.95rem] leading-snug text-bone">{item.detail}</span>
              </li>
            ))}
          </ul>
          <p data-reveal className="readout mt-6 text-bone-soft">
            {layer.tools.join("  ·  ")}
          </p>
        </div>
      </div>
    </article>
  );
}

/** A sounding line down the left edge: how deep into the stack you are. */
function DepthGauge() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-6 z-10 hidden xl:block">
      <div className="sticky top-1/2 -translate-y-1/2">
        <div className="relative flex gap-4">
          <div className="relative w-px bg-line">
            <div data-gauge-fill className="absolute inset-0 origin-top scale-y-0 bg-phosphor" />
          </div>
          <ol className="flex flex-col gap-6 py-1">
            {layers.map((layer) => (
              <li
                key={layer.id}
                data-gauge-item
                className="readout text-[0.68rem] tracking-[0.14em] text-bone-soft uppercase transition-colors duration-500 data-active:text-phosphor"
              >
                {layer.name}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
