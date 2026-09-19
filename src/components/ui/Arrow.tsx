type Direction = "right" | "up-right" | "down";

const PATHS: Record<Direction, string> = {
  right: "M1.5 6h9M7 2.5 10.5 6 7 9.5",
  "up-right": "M2.5 9.5l7-7M3.5 2.5h6v6",
  down: "M6 1.5v9M2.5 7 6 10.5 9.5 7",
};

/**
 * A small arrow that slides out and is replaced by its twin when the link or
 * button around it is hovered.
 */
export function Arrow({ dir = "right" }: { dir?: Direction }) {
  const icon = (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[dir]} />
    </svg>
  );
  return (
    <span className="arrow" data-dir={dir} aria-hidden="true">
      {icon}
      {icon}
    </span>
  );
}
