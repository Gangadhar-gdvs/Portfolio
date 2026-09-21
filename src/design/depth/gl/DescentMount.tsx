"use client";

import { useEffect, useRef } from "react";
import { useGraphics } from "@/gl/useGraphics";
import { useLite } from "@/lib/lite";

/**
 * The shaft, fixed behind the whole page.
 *
 * Loaded after the page is interactive and only where there is a GPU worth
 * using. Without one — or in Lite mode — the page keeps a plain gradient, and
 * nothing about the reading changes.
 */
export function DescentMount() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lite = useLite();
  const graphics = useGraphics();
  const webgl = graphics === "gpu" && !lite;

  useEffect(() => {
    if (!webgl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: import("./descent").Descent | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(async () => {
      const { Descent } = await import("./descent");
      if (cancelled) return;

      scene = new Descent({ canvas });
      scene.start();

      let previous = window.scrollY;
      const onScroll = () => {
        const span = document.documentElement.scrollHeight - window.innerHeight;
        scene?.setDepth(span > 0 ? window.scrollY / span : 0);
        scene?.setVelocity(window.scrollY - previous);
        previous = window.scrollY;
      };
      const onPointer = (event: PointerEvent) => {
        scene?.setPointer((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1), true);
      };
      const onLeave = () => scene?.setPointer(0, 0, false);
      const onResize = () => scene?.resize();
      const onVisibility = () => (document.hidden ? scene?.stop() : scene?.start());

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(
        () => window.removeEventListener("scroll", onScroll),
        () => window.removeEventListener("pointermove", onPointer),
        () => window.removeEventListener("pointerleave", onLeave),
        () => window.removeEventListener("resize", onResize),
        () => document.removeEventListener("visibilitychange", onVisibility),
      );
      onScroll();
    });

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle as number);
      for (const cleanup of cleanups) cleanup();
      scene?.dispose();
    };
  }, [webgl]);

  return (
    <div className="d-shaft" aria-hidden="true">
      {webgl && <canvas ref={canvasRef} className="d-shaft-canvas" />}
    </div>
  );
}
