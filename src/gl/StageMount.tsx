"use client";

import { useEffect, useRef, useState } from "react";
import { layers } from "@/content/layers";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { detectTier, probeGraphics, TIERS } from "./quality";
import type { StageView } from "./stack/layout";
import type { Stage } from "./Stage";
import { StackFallback } from "./StackFallback";
import { stage, stageHover, stageRunning } from "./stageState";

type Status = "waiting" | "live" | "fallback";

/**
 * The fixed 3D layer behind the home page. It waits for the browser to go
 * idle, loads three.js, draws the plates, compiles shaders off the main
 * thread, then fades in. Without a GPU it shows a drawing of the stack.
 *
 * Sections steer it with attributes: `data-stage` names the view while that
 * section is centred, `data-stage-focus` brings one plate forward, and
 * `data-stage-cover` marks opaque content that hides the canvas completely.
 */
export function StageMount() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [status, setStatus] = useState<Status>("waiting");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let instance: Stage | null = null;
    let cancelled = false;
    let running = stageRunning.get();
    const cleanups: (() => void)[] = [];

    const start = async () => {
      if (probeGraphics() !== "gpu") {
        setStatus("fallback");
        return;
      }
      const root = document.documentElement;
      const font = getComputedStyle(root).getPropertyValue("--font-geist-mono").trim() || "monospace";
      const [{ Stage }] = await Promise.all([import("./Stage"), document.fonts?.load(`500 20px ${font}`)]);
      if (cancelled) return;

      instance = new Stage({
        canvas,
        layers,
        labels: labelRefs.current,
        tier: TIERS[detectTier()],
        reducedMotion: prefersReducedMotion(),
        font,
      });
      const fit = () => instance?.resize(window.innerWidth, window.innerHeight);
      fit();
      window.addEventListener("resize", fit);
      cleanups.push(() => window.removeEventListener("resize", fit));

      await instance.prepare();
      if (cancelled) return;

      // Share GSAP's ticker so the stage moves on the same frame as the scroll.
      const tick = (_time: number, deltaMs: number) => {
        if (running) instance?.frame(deltaMs / 1000);
      };
      gsap.ticker.add(tick);
      cleanups.push(() => gsap.ticker.remove(tick));
      cleanups.push(stageRunning.subscribe((next) => (running = next)));
      // Land the plates as the intro's curtains open, or straight away.
      instance.enter(root.classList.contains("has-intro") ? 1.15 : 0.1);
      setStatus("live");
    };

    // Safari has no requestIdleCallback; a short timeout does the same job there.
    const idleApi = window as Window & Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>;
    const idle = idleApi.requestIdleCallback
      ? idleApi.requestIdleCallback(() => void start(), { timeout: 1200 })
      : window.setTimeout(() => void start(), 400);

    // A handle for inspecting the stage from the console during development.
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __stage: stage });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      stage.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      stage.pointer.active = true;
    };
    const onLeave = () => {
      stage.pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const stopHover = stageHover.subscribe((index) => {
      if (index >= 0) document.documentElement.dataset.stageHover = "";
      else delete document.documentElement.dataset.stageHover;
    });

    return () => {
      cancelled = true;
      if (idleApi.cancelIdleCallback) idleApi.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      stopHover();
      delete document.documentElement.dataset.stageHover;
      cleanups.forEach((cleanup) => cleanup());
      instance?.dispose();
      stage.pointer.active = false;
      stageHover.set(-1);
      stageRunning.set(true);
    };
  }, []);

  useGSAP(() => {
    document.querySelectorAll<HTMLElement>("[data-stage]").forEach((section) => {
      const view = section.dataset.stage as StageView;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) stage.view = view;
        },
      });
      if (view === "hero") {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            stage.heroProgress = self.progress;
          },
        });
      }
    });

    // A plate comes forward while its copy is on screen. The ranges overlap,
    // so scrolling hands focus straight from one plate to the next.
    document.querySelectorAll<HTMLElement>("[data-stage-focus]").forEach((step) => {
      const index = Number(step.dataset.stageFocus);
      ScrollTrigger.create({
        trigger: step,
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (self.isActive) stage.focus = index;
          else if (stage.focus === index) stage.focus = -1;
        },
      });
    });

    // Nothing to draw while opaque sections fill the whole screen.
    document.querySelectorAll<HTMLElement>("[data-stage-cover]").forEach((cover) => {
      ScrollTrigger.create({
        trigger: cover,
        start: "top top",
        end: "bottom bottom",
        onToggle: (self) => stageRunning.set(!self.isActive),
      });
    });

    return () => {
      stage.view = "hero";
      stage.heroProgress = 0;
      stage.focus = -1;
      stageRunning.set(true);
    };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-night transition-opacity duration-1200 ease-out"
      style={{ opacity: status === "waiting" ? 0 : 1 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" hidden={status === "fallback"} />
      {status === "fallback" && <StackFallback />}
      <div className="absolute inset-0 overflow-hidden">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            ref={(element) => {
              labelRefs.current[index] = element;
            }}
            className="stage-label"
            style={{ opacity: 0 }}
          >
            <span className="stage-label-rule" />
            <span className="t-label">
              <span className="text-fg-3">{String(index + 1).padStart(2, "0")}</span>&ensp;{layer.short}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
