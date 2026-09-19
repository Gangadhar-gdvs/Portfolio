"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type { ParticleScene } from "./ParticleScene";
import { detectTier, probeGraphics, TIERS } from "./quality";
import { onSceneRunning, scene, setSceneRunning } from "./sceneState";

type Status = "waiting" | "live" | "fallback";

/**
 * The fixed particle layer behind the home page. It waits for the browser to
 * go idle, loads three.js, compiles the shader off the main thread, then fades
 * in. Without a GPU it shows a static glow instead.
 */
export function SceneMount() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("waiting");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let particles: ParticleScene | null = null;
    let cancelled = false;
    let running = true;
    const cleanups: (() => void)[] = [];

    const start = async () => {
      if (probeGraphics() !== "gpu") {
        setStatus("fallback");
        return;
      }
      const { ParticleScene } = await import("./ParticleScene");
      if (cancelled) return;

      const tier = TIERS[detectTier()];
      particles = new ParticleScene({
        canvas,
        count: tier.count,
        pointSize: tier.pointSize,
        maxPixelRatio: tier.maxPixelRatio,
        reducedMotion: prefersReducedMotion(),
      });
      const fit = () => particles?.resize(window.innerWidth, window.innerHeight);
      fit();
      window.addEventListener("resize", fit);
      cleanups.push(() => window.removeEventListener("resize", fit));

      await particles.prepare();
      if (cancelled) return;

      // Share GSAP's ticker so particles move on the same frame as the scroll.
      const tick = (_time: number, deltaMs: number) => {
        if (running) particles?.frame(deltaMs / 1000);
      };
      gsap.ticker.add(tick);
      cleanups.push(() => gsap.ticker.remove(tick));
      cleanups.push(onSceneRunning((next) => (running = next)));
      setStatus("live");
    };

    // Safari has no requestIdleCallback; a short timeout does the same job there.
    const idleApi = window as Window & Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>;
    const idle = idleApi.requestIdleCallback
      ? idleApi.requestIdleCallback(() => void start(), { timeout: 1500 })
      : window.setTimeout(() => void start(), 500);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      scene.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      scene.pointer.active = true;
    };
    const onLeave = () => {
      scene.pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      if (idleApi.cancelIdleCallback) idleApi.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cleanups.forEach((cleanup) => cleanup());
      particles?.dispose();
      scene.pointer.active = false;
      setSceneRunning(true);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1600 ease-out"
      style={{ opacity: status === "waiting" ? 0 : 1 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" hidden={status === "fallback"} />
      {status === "fallback" && (
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_45%,rgb(111_230_255/0.14),transparent_70%)]" />
      )}
    </div>
  );
}
