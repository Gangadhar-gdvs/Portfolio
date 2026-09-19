import { describe, expect, it } from "vitest";
import { SHAPE_IDS, STRIDE, generateShape } from "./shapes";

const COUNT = 4000;

describe("generateShape", () => {
  for (const id of SHAPE_IDS) {
    describe(id, () => {
      const points = generateShape(id, COUNT, 7);

      it("returns one xyz + highlight record per particle", () => {
        expect(points).toBeInstanceOf(Float32Array);
        expect(points.length).toBe(COUNT * STRIDE);
      });

      it("contains only finite numbers", () => {
        expect(points.every(Number.isFinite)).toBe(true);
      });

      it("stays inside the stage and keeps highlights in [0, 1]", () => {
        for (let i = 0; i < COUNT; i++) {
          const [x, y, z, h] = points.subarray(i * STRIDE, i * STRIDE + STRIDE);
          expect(Math.abs(x)).toBeLessThanOrEqual(6.5);
          expect(Math.abs(y)).toBeLessThanOrEqual(4);
          expect(z).toBeGreaterThanOrEqual(-5);
          expect(z).toBeLessThanOrEqual(3);
          expect(h).toBeGreaterThanOrEqual(0);
          expect(h).toBeLessThanOrEqual(1);
        }
      });

      it("is deterministic for a given seed", () => {
        expect(generateShape(id, COUNT, 7)).toEqual(points);
      });

      it("changes with the seed", () => {
        expect(generateShape(id, COUNT, 8)).not.toEqual(points);
      });
    });
  }

  it("produces visibly different shapes", () => {
    const centroids = SHAPE_IDS.map((id) => {
      const p = generateShape(id, COUNT, 3);
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (let i = 0; i < COUNT; i++) {
        sx += Math.abs(p[i * STRIDE]);
        sy += Math.abs(p[i * STRIDE + 1]);
        sz += Math.abs(p[i * STRIDE + 2]);
      }
      return `${(sx / COUNT).toFixed(2)}|${(sy / COUNT).toFixed(2)}|${(sz / COUNT).toFixed(2)}`;
    });
    expect(new Set(centroids).size).toBe(SHAPE_IDS.length);
  });

  it("handles tiny particle counts", () => {
    for (const id of SHAPE_IDS) {
      expect(generateShape(id, 12, 1).length).toBe(12 * STRIDE);
    }
  });
});
