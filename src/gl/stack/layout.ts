import { clamp, easeInOutCubic } from "@/lib/math";

/** One glass plate, in world units. */
export const PLATE = {
  size: 2.2,
  thickness: 0.07,
  /** Corner radius seen from above. */
  radius: 0.12,
  bevel: 0.012,
} as const;

export const PLATE_COUNT = 5;

/** Space between plates when the stack is closed and fully open. */
export const GAP = { closed: 0.05, open: 0.64 } as const;

/** Gap between neighbouring plates for an explode amount in [0, 1]. */
export function gapFor(explode: number): number {
  return GAP.closed + (GAP.open - GAP.closed) * easeInOutCubic(clamp(explode, 0, 1));
}

/** Height of plate `index` (0 is the top) above the centre of the stack. */
export function plateY(index: number, gap: number): number {
  return ((PLATE_COUNT - 1) / 2 - index) * (PLATE.thickness + gap);
}

/** Radius of the smallest sphere around the stack's centre that contains every plate. */
export function boundingRadius(gap: number): number {
  const halfDiagonal = (PLATE.size / 2) * Math.SQRT2;
  const halfHeight = plateY(0, gap) + PLATE.thickness / 2;
  return Math.hypot(halfDiagonal, halfHeight);
}

/**
 * Camera distance at which a sphere of `radius` fills at most `fillV` of the
 * view's half-height and `fillH` of its half-width.
 */
export function fitDistance(radius: number, fovDegrees: number, aspect: number, fillV: number, fillH: number): number {
  const tanV = Math.tan((fovDegrees * Math.PI) / 360);
  const tanH = tanV * aspect;
  return Math.max(radius / (tanV * fillV), radius / (tanH * fillH));
}

export type StageView = "hero" | "capabilities" | "contact" | "away";

/** How the camera frames the stack for one part of the page. */
export interface Framing {
  /** Where the stack's centre sits on screen, in normalised device coordinates. */
  x: number;
  y: number;
  /** Share of the half-height and half-width the stack may fill. */
  fillV: number;
  fillH: number;
  /** Camera height above the stack, as an angle in radians. */
  elevation: number;
  /** Turn of the stack around its vertical axis, in radians. */
  yaw: number;
  /** 0 hides the stack below the floor, 1 shows it. */
  presence: number;
  /** How far apart the plates sit, 0 to 1. The hero opens with scroll instead. */
  explode: number;
}

const wide: Record<StageView, Framing> = {
  hero: { x: 0.34, y: 0.12, fillV: 0.72, fillH: 0.5, elevation: 0.46, yaw: -0.62, presence: 1, explode: 0 },
  capabilities: { x: 0.36, y: 0.0, fillV: 0.82, fillH: 0.46, elevation: 0.52, yaw: -0.56, presence: 1, explode: 1 },
  contact: { x: 0.38, y: 0.1, fillV: 0.7, fillH: 0.46, elevation: 0.42, yaw: -0.7, presence: 1, explode: 0.12 },
  away: { x: 0.36, y: 0.0, fillV: 0.82, fillH: 0.46, elevation: 0.52, yaw: -0.56, presence: 0, explode: 0.4 },
};

const tall: Record<StageView, Framing> = {
  hero: { x: 0, y: 0.42, fillV: 0.46, fillH: 0.86, elevation: 0.5, yaw: -0.62, presence: 1, explode: 0 },
  capabilities: { x: 0, y: 0.5, fillV: 0.44, fillH: 0.8, elevation: 0.54, yaw: -0.56, presence: 1, explode: 1 },
  contact: { x: 0, y: 0.44, fillV: 0.42, fillH: 0.8, elevation: 0.46, yaw: -0.7, presence: 1, explode: 0.12 },
  away: { x: 0, y: 0.5, fillV: 0.44, fillH: 0.8, elevation: 0.54, yaw: -0.56, presence: 0, explode: 0.4 },
};

/** Portrait screens stack the copy under the object instead of beside it. */
export function framingFor(view: StageView, aspect: number): Framing {
  return (aspect < 0.9 ? tall : wide)[view];
}
