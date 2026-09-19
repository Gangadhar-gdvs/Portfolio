import { architecture, architectureLayouts, type NodeId } from "@/content/aethra";

type LayoutName = keyof typeof architectureLayouts;

const BOX = { w: 150, h: 56 };
const SPACING: Record<LayoutName, { gapX: number; gapY: number; pad: number }> = {
  wide: { gapX: 58, gapY: 64, pad: 6 },
  tall: { gapX: 20, gapY: 44, pad: 6 },
};

interface Placed {
  x: number;
  y: number;
}

function place(layout: LayoutName) {
  const grid = architectureLayouts[layout];
  const { gapX, gapY, pad } = SPACING[layout];
  const positions = {} as Record<NodeId, Placed>;
  for (const node of architecture.nodes) {
    const [col, row] = grid.slots[node.id];
    positions[node.id] = { x: pad + col * (BOX.w + gapX), y: pad + row * (BOX.h + gapY) };
  }
  return {
    positions,
    width: pad * 2 + grid.columns * BOX.w + (grid.columns - 1) * gapX,
    height: pad * 2 + grid.rows * BOX.h + (grid.rows - 1) * gapY,
  };
}

/** A straight connector between facing sides, or an elbow when needed. */
function connect(a: Placed, b: Placed) {
  const ax = a.x + BOX.w / 2;
  const ay = a.y + BOX.h / 2;
  const bx = b.x + BOX.w / 2;
  const by = b.y + BOX.h / 2;

  if (Math.abs(ay - by) < 1) {
    const [x1, x2] = ax < bx ? [a.x + BOX.w, b.x] : [a.x, b.x + BOX.w];
    return { d: `M${x1} ${ay} L${x2} ${by}`, mid: { x: (x1 + x2) / 2, y: ay }, vertical: false };
  }
  if (Math.abs(ax - bx) < 1) {
    const [y1, y2] = ay < by ? [a.y + BOX.h, b.y] : [a.y, b.y + BOX.h];
    return { d: `M${ax} ${y1} L${bx} ${y2}`, mid: { x: ax, y: (y1 + y2) / 2 }, vertical: true };
  }
  const x1 = ax < bx ? a.x + BOX.w : a.x;
  const y2 = ay < by ? b.y : b.y + BOX.h;
  return { d: `M${x1} ${ay} L${bx} ${ay} L${bx} ${y2}`, mid: { x: (x1 + bx) / 2, y: ay }, vertical: false };
}

function Diagram({ layout, className, idPrefix }: { layout: LayoutName; className: string; idPrefix: string }) {
  const { positions, width, height } = place(layout);
  const arrow = `${idPrefix}-${layout}-arrow`;

  return (
    <svg
      data-draw-root
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-labelledby={`${idPrefix}-${layout}-title`}
    >
      <title id={`${idPrefix}-${layout}-title`}>
        Aethra architecture: you talk to the desktop app, which reaches the backend brain over a WebSocket. Every tool
        call passes a permission gate that cloud admin rules can override, before backend tools or your computer act.
      </title>
      <defs>
        <marker id={arrow} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" className="fill-glow/70" />
        </marker>
      </defs>

      {architecture.edges.map((edge, index) => {
        const path = connect(positions[edge.from], positions[edge.to]);
        const twoWay = edge.label === "WebSocket";
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <path
              data-draw
              d={path.d}
              pathLength={1}
              fill="none"
              className="stroke-glow/45"
              strokeWidth={1.2}
              markerEnd={`url(#${arrow})`}
              markerStart={twoWay ? `url(#${arrow})` : undefined}
            />
            <circle r={2.6} className="arch-pulse fill-glow">
              <animateMotion dur="2.6s" begin={`${index * 0.4}s`} repeatCount="indefinite" path={path.d} />
            </circle>
            {twoWay && (
              <circle r={2.6} className="arch-pulse fill-warm">
                <animateMotion
                  dur="2.6s"
                  begin="1.3s"
                  repeatCount="indefinite"
                  path={path.d}
                  keyPoints="1;0"
                  keyTimes="0;1"
                  calcMode="linear"
                />
              </circle>
            )}
            {edge.label && (
              <text
                x={path.vertical ? path.mid.x + 8 : path.mid.x}
                y={path.vertical ? path.mid.y + 3 : path.mid.y - 8}
                textAnchor={path.vertical ? "start" : "middle"}
                className="fill-fg-3 font-mono text-[9.5px] tracking-wide"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {architecture.nodes.map((node) => {
        const { x, y } = positions[node.id];
        return (
          <g key={node.id}>
            <rect
              x={x}
              y={y}
              width={BOX.w}
              height={BOX.h}
              rx={8}
              className={node.accent ? "fill-night stroke-glow" : "fill-night-2 stroke-line-3"}
              strokeWidth={1}
            />
            <text x={x + 12} y={y + 24} className={`font-sans text-[14px] font-medium ${node.accent ? "fill-glow" : "fill-fg"}`}>
              {node.title}
            </text>
            <text x={x + 12} y={y + 42} className="fill-fg-3 font-mono text-[10px]">
              {node.detail}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Aethra's architecture as a live diagram: wide on larger screens, tall on phones. */
export function ArchitectureDiagram({ idPrefix = "arch" }: { idPrefix?: string }) {
  return (
    <>
      <Diagram layout="wide" idPrefix={idPrefix} className="hidden h-auto w-full md:block" />
      <Diagram layout="tall" idPrefix={idPrefix} className="mx-auto h-auto w-full max-w-[400px] md:hidden" />
    </>
  );
}
