"use client";

import { useEffect, useRef, useState } from "react";
import { layers } from "@/content/layers";
import { isLite, onLiteChange } from "@/lib/lite";
import { prefersReducedMotion } from "@/lib/motion";
import { loadMotion } from "@/lib/motionRuntime";
import { detectTier, probeGraphics, TIERS } from "./quality";
import type { StageView } from "./stack/layout";
import type { Stage } from "./Stage";
import { StackFallback } from "./StackFallback";
import { stage, stageHover, stageRunning, stageStats } from "./stageState";

type Status = "waiting" | "live" | "fallback";

/**
 * The fixed 3D layer behind the home page. It waits for the browser to go
 * idle, loads three.js, draws the plates, compiles shaders off the main
 * thread, then fades in. Without a GPU — or in Lite mode — it shows a drawing
 * of the stack instead, because a software rasteriser would stall the page.
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
    let starting = false;
    let cancelled = false;
    let running = stageRunning.get();
    let cleanups: (() => void)[] = [];

    const stop = () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      instance?.dispose();
      instance = null;
      stageHover.set(-1);
      stageStats.set(null);
      stageRunning.set(true);
    };

    const start = async () => {
      if (instance || starting || cancelled) return;
      if (isLite()) {
        setStatus("fallback");
        stageStats.set({ fps: 0, pixelRatio: 0, tier: "—", mode: "lite" });
        return;
      }
      if (probeGraphics() !== "gpu") {
        setStatus("fallback");
        stageStats.set({ fps: 0, pixelRatio: 0, tier: "—", mode: "fallback" });
        return;
      }
      starting = true;
      const root = document.documentElement;
      const font = getComputedStyle(root).getPropertyValue("--font-geist-mono").trim() || "monospace";
      const [{ Stage }, { gsap, ScrollTrigger }] = await Promise.all([
        import("./Stage"),
        loadMotion(),
        document.fonts?.load(`500 20px ${font}`),
      ]);
      starting = false;
      if (cancelled || isLite()) return;

      const tier = detectTier();
      instance = new Stage({
        canvas,
        layers,
        labels: labelRefs.current,
        tier: TIERS[tier],
        reducedMotion: prefersReducedMotion(),
        font,
        onStats: (fps, pixelRatio) => stageStats.set({ fps, pixelRatio, tier, mode: "gpu" }),
      });
      const fit = () => instance?.resize(window.innerWidth, window.innerHeight);
      fit();
      window.addEventListener("resize", fit);
      cleanups.push(() => window.removeEventListener("resize", fit));

      await instance.prepare();
      if (cancelled || !instance) return;

      // Share GSAP's ticker so the stage moves on the same frame as the scroll.
      const tick = (_time: number, deltaMs: number) => {
        if (running) instance?.frame(deltaMs / 1000);
      };
      gsap.ticker.add(tick);
      cleanups.push(() => gsap.ticker.remove(tick));
      cleanups.push(stageRunning.subscribe((next) => (running = next)));

      // Sections steer the camera.
      const triggers: ScrollTrigger[] = [];
      document.querySelectorAll<HTMLElement>("[data-stage]").forEach((section) => {
        const view = section.dataset.stage as StageView;
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) stage.view = view;
            },
          }),
        );
        if (view === "hero") {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom top",
              onUpdate: (self) => {
                stage.heroProgress = self.progress;
              },
            }),
          );
        }
      });

      // The dive is scrubbed straight from scroll position.
      document.querySelectorAll<HTMLElement>("[data-stage-dive]").forEach((section) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              stage.diveProgress = self.progress;
              document.documentElement.style.setProperty("--dive", self.progress.toFixed(3));
            },
            // Past the bottom the descent is finished, so it stays finished;
            // above the top it hasn't started.
            onLeave: () => document.documentElement.style.setProperty("--dive", "1"),
            onLeaveBack: () => document.documentElement.style.setProperty("--dive", "0"),
          }),
        );
      });

      // A plate comes forward while its copy is on screen. The ranges overlap,
      // so scrolling hands focus straight from one plate to the next.
      document.querySelectorAll<HTMLElement>("[data-stage-focus]").forEach((step) => {
        const index = Number(step.dataset.stageFocus);
        triggers.push(
          ScrollTrigger.create({
            trigger: step,
            start: "top 70%",
            end: "bottom 30%",
            onToggle: (self) => {
              if (self.isActive) stage.focus = index;
              else if (stage.focus === index) stage.focus = -1;
            },
          }),
        );
      });

      // Nothing to draw while opaque sections fill the whole screen.
      document.querySelectorAll<HTMLElement>("[data-stage-cover]").forEach((cover) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: cover,
            start: "top top",
            end: "bottom bottom",
            onToggle: (self) => stageRunning.set(!self.isActive),
          }),
        );
      });
      ScrollTrigger.refresh();
      cleanups.push(() => {
        triggers.forEach((trigger) => trigger.kill());
        document.documentElement.style.removeProperty("--dive");
        stage.diveProgress = 0;
      });

      // Land the plates as the intro's curtains open, or straight away.
      instance.enter(root.classList.contains("has-intro") ? 1.15 : 0.1);
      setStatus("live");
    };

    // Safari has no requestIdleCallback; a short timeout does the same job there.
    const idleApi = window as Window & Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>;
    const schedule = () =>
      idleApi.requestIdleCallback
        ? idleApi.requestIdleCallback(() => void start(), { timeout: 1200 })
        : window.setTimeout(() => void start(), 400);
    let idle = schedule();

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

    const stopWatchingLite = onLiteChange((lite) => {
      if (lite) {
        stop();
        setStatus("fallback");
      } else {
        setStatus("waiting");
        idle = schedule();
      }
    });

    return () => {
      cancelled = true;
      if (idleApi.cancelIdleCallback) idleApi.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      stopHover();
      stopWatchingLite();
      delete document.documentElement.dataset.stageHover;
      stop();
      stage.pointer.active = false;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-night transition-opacity duration-1200 ease-out"
      style={{ opacity: status === "waiting" ? 0 : 1 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" hidden={status !== "live"} />
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
