"use client";

import { useEffect, useRef } from "react";
import { useGraphics } from "@/gl/useGraphics";
import { useLite } from "@/lib/lite";

/**
 * The hero centrepiece, bounded to the right of the surface. Loaded after the
 * page is interactive and only where there is a GPU to spare; without one the
 * hero simply has no object, and nothing about the reading changes.
 */
export function ShardMount() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lite = useLite();
  const graphics = useGraphics();
  const webgl = graphics === "gpu" && !lite;

  useEffect(() => {
    if (!webgl) return;
    // A right-hand centrepiece only makes sense beside the copy — on phones the
    // hero keeps the lattice alone, and no second context is created.
    if (!window.matchMedia("(min-width: 62rem)").matches) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let scene: import("./shard").ShardSphere | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250));
    const handle = idle(async () => {
      const { ShardSphere } = await import("./shard");
      if (cancelled) return;

      // As the sphere is zoomed in it takes over the whole hero: nav and copy
      // fade, the object grows to fill the screen. Hysteresis stops it flickering
      // at the threshold.
      const root = document.documentElement;
      let immersive = false;
      scene = new ShardSphere({
        canvas,
        onProgress: (open) => {
          if (!immersive && open > 0.3) {
            immersive = true;
            root.classList.add("sphere-in");
          } else if (immersive && open < 0.12) {
            immersive = false;
            root.classList.remove("sphere-in");
          }
        },
      });
      scene.start();
      cleanups.push(() => root.classList.remove("sphere-in"));

      // The scene owns its own drag/zoom on the canvas; the mount only keeps it
      // sized to its box and pauses it when the tab is hidden.
      const onResize = () => scene?.resize();
      const onVisibility = () => (document.hidden ? scene?.stop() : scene?.start());
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(
        () => window.removeEventListener("resize", onResize),
        () => document.removeEventListener("visibilitychange", onVisibility),
      );
      // The box has its final size now that the object exists.
      scene.resize();
    });

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle as number);
      for (const cleanup of cleanups) cleanup();
      scene?.dispose();
    };
  }, [webgl]);

  return (
    <div ref={wrapRef} className="d-shard" aria-hidden="true">
      {webgl && <canvas ref={canvasRef} className="d-shard-canvas" />}
    </div>
  );
}
