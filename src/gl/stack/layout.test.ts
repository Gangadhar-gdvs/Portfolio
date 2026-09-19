import { describe, expect, it } from "vitest";
import { boundingRadius, fitDistance, framingFor, GAP, gapFor, PLATE, PLATE_COUNT, plateY } from "./layout";

describe("stack layout", () => {
  it("opens from the closed gap to the open gap", () => {
    expect(gapFor(0)).toBeCloseTo(GAP.closed);
    expect(gapFor(1)).toBeCloseTo(GAP.open);
    expect(gapFor(-2)).toBeCloseTo(GAP.closed);
    expect(gapFor(3)).toBeCloseTo(GAP.open);
  });

  it("widens the gap steadily as the stack opens", () => {
    let previous = gapFor(0);
    for (let t = 0.05; t <= 1; t += 0.05) {
      const next = gapFor(t);
      expect(next).toBeGreaterThanOrEqual(previous);
      previous = next;
    }
  });

  it("centres the plates around zero, top plate highest", () => {
    const gap = gapFor(0.5);
    expect(plateY(0, gap)).toBeCloseTo(-plateY(PLATE_COUNT - 1, gap));
    expect(plateY(2, gap)).toBeCloseTo(0);
    for (let i = 1; i < PLATE_COUNT; i++) {
      expect(plateY(i - 1, gap) - plateY(i, gap)).toBeCloseTo(PLATE.thickness + gap);
    }
  });

  it("contains every plate corner inside the bounding radius", () => {
    for (const gap of [GAP.closed, GAP.open]) {
      const radius = boundingRadius(gap);
      const corner = Math.hypot(PLATE.size / 2, PLATE.size / 2, plateY(0, gap) + PLATE.thickness / 2);
      expect(corner).toBeLessThanOrEqual(radius + 1e-9);
    }
    expect(boundingRadius(GAP.open)).toBeGreaterThan(boundingRadius(GAP.closed));
  });

  it("fits the stack inside the requested share of the view", () => {
    const fov = 26;
    const tanV = Math.tan((fov * Math.PI) / 360);
    for (const aspect of [0.46, 1, 1.6, 2.4]) {
      const radius = boundingRadius(GAP.open);
      const distance = fitDistance(radius, fov, aspect, 0.8, 0.5);
      expect(radius / (distance * tanV)).toBeLessThanOrEqual(0.8 + 1e-9);
      expect(radius / (distance * tanV * aspect)).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it("puts the stack beside the copy on wide screens and above it on tall ones", () => {
    expect(framingFor("hero", 1.6).x).toBeGreaterThan(0);
    expect(framingFor("hero", 0.46).x).toBe(0);
    expect(framingFor("hero", 0.46).y).toBeGreaterThan(0);
    expect(framingFor("away", 1.6).presence).toBe(0);
  });
});
