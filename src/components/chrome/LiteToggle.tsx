"use client";

import { setLite, useLite } from "@/lib/lite";

/**
 * The escape hatch, in plain sight: one switch turns off the 3D, the smooth
 * scrolling, the custom cursor and every reveal, leaving a fast document.
 * Reduced motion starts here by default.
 */
export function LiteToggle() {
  const lite = useLite();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lite}
      onClick={() => setLite(!lite)}
      title={lite ? "Lite mode is on: no 3D, no motion" : "Switch to Lite mode: no 3D, no motion"}
      className="t-label group flex h-8 items-center gap-2 rounded-full px-3 text-fg-2 ring-1 ring-line-2 transition-colors hover:text-fg hover:ring-line-3 aria-checked:text-glow aria-checked:ring-glow/50"
    >
      <span
        aria-hidden="true"
        className="relative h-3 w-5 rounded-full bg-fg-3/40 transition-colors group-aria-checked:bg-glow/30"
      >
        <span className="absolute top-0.5 left-0.5 size-2 rounded-full bg-fg transition-transform duration-300 ease-out-expo group-aria-checked:translate-x-2 group-aria-checked:bg-glow" />
      </span>
      Lite
    </button>
  );
}
