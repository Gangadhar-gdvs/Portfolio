"use client";

import { useEffect, useRef } from "react";
import { scrollToTarget } from "@/components/motion/SmoothScroll";
import { layers } from "@/content/layers";
import { clamp, lerp } from "@/lib/math";
import { stage, stageHover } from "./stageState";

/**
 * An invisible surface over the stack. Dragging sideways turns it (and it
 * glides on when let go); a click on a plate jumps to that capability.
 * Vertical swipes still scroll the page on touch screens.
 */
export function StageDrag({ className }: { className: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = ref.current;
    if (!surface) return;

    let pointer = -1;
    let lastX = 0;
    let lastTime = 0;
    let travel = 0;
    let velocity = 0;

    const release = (event: PointerEvent, tapped: boolean) => {
      if (event.pointerId !== pointer) return;
      pointer = -1;
      stage.dragging = false;
      stage.spinVelocity = clamp(velocity, -7, 7);
      surface.removeAttribute("data-dragging");
      const plate = stageHover.get();
      if (tapped && travel < 6 && plate >= 0) scrollToTarget(`#capability-${layers[plate].id}`);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointer = event.pointerId;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      travel = 0;
      velocity = 0;
      stage.dragging = true;
      stage.spinVelocity = 0;
      surface.setAttribute("data-dragging", "");
      surface.setPointerCapture(pointer);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      const dx = event.clientX - lastX;
      const seconds = Math.max(event.timeStamp - lastTime, 1) / 1000;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      travel += Math.abs(dx);
      const turn = dx * 0.0065;
      stage.spin += turn;
      velocity = lerp(velocity, turn / seconds, 0.5);
    };

    const onUp = (event: PointerEvent) => release(event, true);
    const onCancel = (event: PointerEvent) => release(event, false);

    surface.addEventListener("pointerdown", onDown);
    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerup", onUp);
    surface.addEventListener("pointercancel", onCancel);
    return () => {
      surface.removeEventListener("pointerdown", onDown);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerup", onUp);
      surface.removeEventListener("pointercancel", onCancel);
      stage.dragging = false;
    };
  }, []);

  return <div ref={ref} aria-hidden="true" data-cursor="drag" className={`touch-pan-y select-none ${className}`} />;
}
