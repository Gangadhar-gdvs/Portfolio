/** Drawn bottom plate first, so upper plates overlap lower ones. */
const PLATES = [4, 3, 2, 1, 0];

/** Isometric corners of a plate centred at (300, y). */
function rhombus(y: number, dx = 220, dy = 110): string {
  return `300,${y - dy} ${300 + dx},${y} 300,${y + dy} ${300 - dx},${y}`;
}

/**
 * A line drawing of the stack for machines without a real GPU. Vector, so it
 * stays sharp; placed where the 3D stack would stand.
 */
export function StackFallback() {
  return (
    <div className="stack-fallback">
      <svg viewBox="0 0 600 640" className="size-full" fill="none">
        <defs>
          <radialGradient id="fallback-pool" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#7ce7ff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#7ce7ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fallback-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#101a2a" />
            <stop offset="1" stopColor="#060a12" />
          </linearGradient>
        </defs>
        <ellipse cx="300" cy="560" rx="260" ry="60" fill="url(#fallback-pool)" />
        {PLATES.map((index) => {
          const y = 150 + index * 78;
          return (
            <g key={index}>
              <polygon points={`${300 - 220},${y} 300,${y + 110} ${300 + 220},${y} ${300 + 220},${y + 9} 300,${y + 119} ${300 - 220},${y + 9}`} fill="#0b1422" />
              <polygon points={rhombus(y)} fill="url(#fallback-face)" stroke="#dfe9f5" strokeOpacity="0.55" strokeWidth="1.2" />
              <polygon points={rhombus(y, 176, 88)} stroke="#dfe9f5" strokeOpacity="0.16" strokeWidth="1" />
              <path d={`M${300 - 220} ${y} L300 ${y + 110} L${300 + 220} ${y}`} stroke="#9fdcff" strokeOpacity="0.8" strokeWidth="1.2" />
              <circle cx="300" cy={y} r={index === 4 ? 14 : 4} fill="#7ce7ff" fillOpacity={index === 4 ? 0.9 : 0.7} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
