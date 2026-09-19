import { describe, expect, it } from "vitest";
import { clamp, damp, easeInOutCubic, lerp, progressBetween } from "./math";

describe("math", () => {
  it("clamps into range", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });

  it("interpolates linearly", () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it("maps a value to progress between two bounds", () => {
    expect(progressBetween(15, 10, 20)).toBe(0.5);
    expect(progressBetween(25, 10, 20)).toBe(1);
    expect(progressBetween(5, 10, 20)).toBe(0);
    expect(progressBetween(10, 10, 10)).toBe(1);
  });

  it("damps toward a target regardless of frame rate", () => {
    const oneStep = damp(0, 1, 4, 1 / 30);
    let twoSteps = damp(0, 1, 4, 1 / 60);
    twoSteps = damp(twoSteps, 1, 4, 1 / 60);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(damp(0, 1, 4, 10)).toBeCloseTo(1, 6);
  });

  it("eases symmetrically", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
  });
});
