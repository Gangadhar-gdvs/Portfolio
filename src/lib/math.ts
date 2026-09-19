export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Re-maps `value` from [inMin, inMax] to [0, 1], clamped. */
export function progressBetween(value: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return value >= inMax ? 1 : 0;
  return clamp((value - inMin) / (inMax - inMin), 0, 1);
}

/**
 * Frame-rate independent exponential smoothing toward a target.
 * `lambda` is the decay rate: higher settles faster.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
