import type { ShapeId } from "./shapes";

/**
 * The order the particles travel through as the page scrolls: a loose field
 * under the hero, then one shape per layer of the stack, then back to dust.
 */
export const SEQUENCE: readonly ShapeId[] = ["field", "browser", "devices", "network", "database", "core", "field"];

/** Positions along SEQUENCE that page sections ask for. */
export const MORPH = {
  hero: 0,
  firstLayer: 1,
  lastLayer: 5,
  work: 6,
} as const;

export type SceneLayout = "center" | "side";

/**
 * A plain mutable object shared by scroll triggers (which write targets) and
 * the render loop (which eases toward them). No React state, so scrolling never
 * causes a re-render.
 */
export const scene = {
  /** Target position along SEQUENCE, fractional while between shapes. */
  morph: 0 as number,
  /** Target global opacity of the particles. */
  opacity: 1 as number,
  /** `side` moves the cloud beside the text on wide screens. */
  layout: "center" as SceneLayout,
  pointer: { x: 0, y: 0, active: false },
};

export function setScene(target: Partial<Pick<typeof scene, "morph" | "opacity" | "layout">>): void {
  Object.assign(scene, target);
}

type RunningListener = (running: boolean) => void;
let running = true;
const runningListeners = new Set<RunningListener>();

/** Stop rendering while something opaque fully covers the canvas. */
export function setSceneRunning(next: boolean): void {
  if (next === running) return;
  running = next;
  runningListeners.forEach((listener) => listener(next));
}

export function onSceneRunning(listener: RunningListener): () => void {
  runningListeners.add(listener);
  return () => runningListeners.delete(listener);
}
