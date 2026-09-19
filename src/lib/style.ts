import type { CSSProperties } from "react";

/** Inline CSS custom properties without fighting React's CSSProperties type. */
export function vars(values: Record<`--${string}`, string | number>): CSSProperties {
  return values as CSSProperties;
}
