/**
 * Which design the site is built with.
 *
 * There is one design:
 *
 * - `depth` — a descent: a cinematic opening, then a scroll that falls
 *   through strata, a world built out of the skills, and a core.
 */

export const designs = ["depth"] as const;

export type Design = (typeof designs)[number];

export const defaultDesign: Design = "depth";

/** Anything unrecognised falls back to the default rather than failing a build. */
export function readDesign(value: string | undefined | null): Design {
  const name = value?.trim().toLowerCase();
  return designs.find((design) => design === name) ?? defaultDesign;
}

// Written as a literal member access so the bundler can inline it.
export const activeDesign: Design = readDesign(process.env.NEXT_PUBLIC_DESIGN);

export const isDepth = activeDesign === "depth";
