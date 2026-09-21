import { activeDesign, type Design } from "./design";

/**
 * Where each design can be read, whichever one this build puts at `/`.
 *
 * The design picked by NEXT_PUBLIC_DESIGN is the home page; the other one is
 * always one link away at its own path. Its own path for the home design just
 * redirects to `/`, so there is only ever one address for each page.
 */
export const designPath: Record<Design, string> = { stack: "/glass", depth: "/depth" };

/** What a reader sees on the switch: what it looks like, not what it's called in the code. */
export const designLabel: Record<Design, string> = { stack: "Glass", depth: "Depth" };

export function hrefFor(design: Design): string {
  return design === activeDesign ? "/" : designPath[design];
}
