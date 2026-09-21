import type { StageView } from "./stack/layout";

/**
 * A plain mutable object shared by the page (scroll triggers, pointer, drag),
 * which writes targets, and the render loop, which eases toward them. No
 * React state, so scrolling never causes a re-render.
 */
export const stage = {
  /** Which part of the page the camera is framing. */
  view: "hero" as StageView,
  /** How far the hero has scrolled away, 0 to 1. Opens the stack. */
  heroProgress: 0,
  /** How far through the dive, 0 to 1: the camera falls through the layers. */
  diveProgress: 0,
  /** The plate brought forward in Capabilities, or -1. */
  focus: -1,
  /** Pointer position in normalised device coordinates. */
  pointer: { x: 0, y: 0, active: false },
  /** Turn added by dragging, in radians. Settles back to a whole turn. */
  spin: 0,
  /** Carried on after a drag is released, in radians per second. */
  spinVelocity: 0,
  dragging: false,
};

type Listener<T> = (value: T) => void;

function channel<T>(initial: T) {
  let current = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => current,
    set(next: T) {
      if (Object.is(next, current)) return;
      current = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener: Listener<T>) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** False while something opaque covers the whole canvas, so it can stop drawing. */
export const stageRunning = channel(true);

/** The plate under the pointer, or -1. Written by the render loop. */
export const stageHover = channel(-1);

export interface StageStats {
  fps: number;
  pixelRatio: number;
  tier: string;
  mode: "gpu" | "fallback" | "lite";
}

/** What the stage is doing right now, for the engineering readout. */
export const stageStats = channel<StageStats | null>(null);
