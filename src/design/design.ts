/**
 * Which design the site is built with.
 *
 * Two complete designs live in this repository and share one set of content
 * files, so the words and the numbers can never drift apart:
 *
 * - `stack` — the dark glass-and-etching design. The default.
 * - `depth` — a descent: a cinematic opening, then a scroll that falls
 *   through strata, a world built out of the skills, and a core.
 *
 * Pick one at build time with NEXT_PUBLIC_DESIGN. The value is inlined by the
 * bundler, so the design that isn't built ships none of its code.
 */

export const designs = ["stack", "depth"] as const;

export type Design = (typeof designs)[number];

export const defaultDesign: Design = "stack";

/** Anything unrecognised falls back to the default rather than failing a build. */
export function readDesign(value: string | undefined | null): Design {
  const name = value?.trim().toLowerCase();
  return designs.find((design) => design === name) ?? defaultDesign;
}

// Written as a literal member access so the bundler can inline it.
export const activeDesign: Design = readDesign(process.env.NEXT_PUBLIC_DESIGN);

export const isDepth = activeDesign === "depth";
