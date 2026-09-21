import { describe, expect, it } from "vitest";
import { defaultDesign, designs, readDesign } from "./design";

describe("readDesign", () => {
  it("accepts every declared design, however it is typed", () => {
    for (const design of designs) {
      expect(readDesign(design)).toBe(design);
      expect(readDesign(` ${design.toUpperCase()} `)).toBe(design);
    }
  });

  it("falls back to the default rather than breaking a build", () => {
    expect(readDesign(undefined)).toBe(defaultDesign);
    expect(readDesign(null)).toBe(defaultDesign);
    expect(readDesign("")).toBe(defaultDesign);
    expect(readDesign("gopuram")).toBe(defaultDesign);
  });

  it("keeps the dark design as the default", () => {
    expect(defaultDesign).toBe("stack");
  });
});
