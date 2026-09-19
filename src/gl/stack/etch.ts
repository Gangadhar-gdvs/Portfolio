import type { LayerId } from "@/content/layers";
import { mulberry32 } from "@/lib/random";

/**
 * The drawings etched into each glass plate, one per layer of the stack.
 * They're drawn into a canvas when the scene loads, so they stay sharp at
 * any size and nothing is downloaded.
 *
 * Each colour channel carries one kind of mark, and the shader decides how
 * it looks: red is line work, green is lit in the accent colour, blue pulses.
 */

/** Drawing units along each side of a plate. */
const U = 1000;

type Channel = "line" | "accent" | "pulse";
type Path = (ctx: CanvasRenderingContext2D) => void;

const RGB: Record<Channel, string> = {
  line: "255,0,0",
  accent: "0,255,0",
  pulse: "0,0,255",
};

class Pen {
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly font: string,
  ) {}

  color(channel: Channel, alpha: number): string {
    return `rgba(${RGB[channel]},${alpha})`;
  }

  stroke(channel: Channel, alpha: number, width: number, path: Path, dash: number[] = []): void {
    const { ctx } = this;
    ctx.beginPath();
    path(ctx);
    ctx.setLineDash(dash);
    ctx.lineWidth = width;
    ctx.strokeStyle = this.color(channel, alpha);
    ctx.stroke();
  }

  fill(channel: Channel, alpha: number, path: Path): void {
    const { ctx } = this;
    ctx.beginPath();
    path(ctx);
    ctx.fillStyle = this.color(channel, alpha);
    ctx.fill();
  }

  line(channel: Channel, alpha: number, width: number, x1: number, y1: number, x2: number, y2: number): void {
    this.stroke(channel, alpha, width, (c) => {
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
    });
  }

  /** A soft pool of light, for the few places that should glow. */
  glow(channel: Channel, alpha: number, x: number, y: number, radius: number): void {
    const { ctx } = this;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.color(channel, alpha));
    gradient.addColorStop(0.35, this.color(channel, alpha * 0.4));
    gradient.addColorStop(1, this.color(channel, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  text(channel: Channel, alpha: number, size: number, value: string, x: number, y: number, align: CanvasTextAlign = "left"): void {
    const { ctx } = this;
    ctx.font = `500 ${size}px ${this.font}`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = this.color(channel, alpha);
    ctx.fillText(value, x, y);
  }
}

const rect = (x: number, y: number, w: number, h: number, r: number): Path => (c) => c.roundRect(x, y, w, h, r);
const circle = (x: number, y: number, r: number): Path => (c) => c.arc(x, y, r, 0, Math.PI * 2);

// ── Shared frame ─────────────────────────────────────────────────────────

function frame(pen: Pen, index: number, name: string): void {
  // The outline sits exactly on the edge of the glass.
  pen.stroke("line", 0.8, 2.6, rect(5, 5, 990, 990, 54));
  pen.stroke("line", 0.14, 1.2, rect(34, 34, 932, 932, 30));

  // A ruler along the far edge, like a technical drawing.
  for (let x = 80, n = 0; x <= 920; x += 20, n++) {
    const major = n % 5 === 0;
    pen.line("line", major ? 0.4 : 0.2, 1.4, x, 34, x, 34 + (major ? 16 : 8));
  }

  // Crosshairs in the inner corners.
  for (const [x, y] of [
    [60, 60],
    [940, 60],
    [60, 940],
    [940, 940],
  ]) {
    pen.line("line", 0.35, 1.4, x - 9, y, x + 9, y);
    pen.line("line", 0.35, 1.4, x, y - 9, x, y + 9);
  }

  pen.text("line", 0.7, 21, `${String(index + 1).padStart(2, "0")}  ${name.toUpperCase()}`, 84, 952);
  pen.text("line", 0.4, 21, `L${index + 1} / 05`, 916, 952, "right");
}

// ── Interface: a web app, mid-interaction ────────────────────────────────

function drawInterface(pen: Pen): void {
  pen.stroke("line", 0.95, 3, rect(110, 110, 780, 700, 20));
  pen.line("line", 0.5, 2, 110, 164, 890, 164);
  for (const x of [142, 166, 190]) pen.fill("line", 0.7, circle(x, 137, 7));
  pen.stroke("line", 0.45, 2, rect(330, 123, 340, 28, 14));
  pen.line("line", 0.3, 4, 352, 137, 520, 137);

  // Navigation
  pen.fill("accent", 0.9, rect(144, 190, 26, 26, 7));
  for (const [a, b] of [
    [548, 590],
    [612, 660],
    [682, 730],
  ]) {
    pen.line("line", 0.45, 4, a, 203, b, 203);
  }
  pen.stroke("line", 0.7, 2, rect(760, 189, 96, 28, 14));

  // Headline, copy and actions
  pen.line("line", 0.95, 15, 144, 268, 470, 268);
  pen.line("line", 0.95, 15, 144, 298, 404, 298);
  for (const [y, end] of [
    [342, 480],
    [364, 452],
    [386, 396],
  ]) {
    pen.line("line", 0.4, 5, 144, y, end, y);
  }
  pen.fill("accent", 0.85, rect(144, 414, 124, 40, 20));
  pen.fill("pulse", 0.55, rect(144, 414, 124, 40, 20));
  pen.stroke("line", 0.6, 2, rect(282, 414, 112, 40, 20));

  // A live chart in the hero card
  pen.stroke("line", 0.75, 2.5, rect(540, 244, 316, 212, 14));
  for (let y = 290; y <= 420; y += 32) pen.line("line", 0.1, 1.4, 560, y, 836, y);
  const chart: [number, number][] = [
    [560, 404],
    [600, 386],
    [640, 392],
    [680, 356],
    [720, 364],
    [760, 322],
    [800, 330],
    [836, 290],
  ];
  pen.stroke("accent", 0.85, 3, (c) => {
    c.moveTo(...chart[0]);
    for (const point of chart.slice(1)) c.lineTo(...point);
  });
  pen.fill("accent", 0.12, (c) => {
    c.moveTo(560, 436);
    for (const point of chart) c.lineTo(...point);
    c.lineTo(836, 436);
    c.closePath();
  });
  pen.fill("pulse", 0.9, circle(836, 290, 7));

  // A row of cards; the middle one is being hovered.
  for (const [i, x] of [144, 386, 628].entries()) {
    const hovered = i === 1;
    pen.stroke(hovered ? "pulse" : "line", hovered ? 0.95 : 0.6, 2, rect(x, 496, 228, 272, 14));
    if (hovered) pen.stroke("line", 0.8, 2, rect(x, 496, 228, 272, 14));
    pen.fill("line", 0.08, rect(x + 12, 508, 204, 112, 8));
    pen.line("line", 0.8, 8, x + 16, 650, x + 150, 650);
    pen.line("line", 0.35, 4, x + 16, 676, x + 200, 676);
    pen.line("line", 0.35, 4, x + 16, 696, x + 168, 696);
    pen.stroke("line", 0.4, 2, rect(x + 16, 726, 64, 22, 11));
  }

  // The cursor that's doing the hovering.
  pen.fill("accent", 0.95, (c) => {
    const x = 560;
    const y = 700;
    c.moveTo(x, y);
    c.lineTo(x, y + 38);
    c.lineTo(x + 10, y + 29);
    c.lineTo(x + 18, y + 46);
    c.lineTo(x + 25, y + 43);
    c.lineTo(x + 17, y + 26);
    c.lineTo(x + 30, y + 26);
    c.closePath();
  });
}

// ── Devices: laptop, phone, desktop app and a video call ─────────────────

function drawDevices(pen: Pen): void {
  // Laptop
  pen.stroke("line", 0.95, 3, rect(96, 120, 540, 340, 16));
  pen.stroke("line", 0.3, 1.5, rect(114, 138, 504, 304, 6));
  pen.line("line", 0.25, 1.5, 196, 138, 196, 442);
  for (const y of [172, 198, 224, 250]) pen.line("line", 0.4, 5, 132, y, 176, y);
  const bars = [120, 170, 140, 210, 190, 250];
  bars.forEach((height, i) => {
    const x = 232 + i * 60;
    pen.stroke(i === 5 ? "accent" : "line", i === 5 ? 0.9 : 0.55, 2, rect(x, 420 - height, 34, height, 4));
  });
  pen.stroke("line", 0.9, 3, (c) => {
    c.moveTo(62, 472);
    c.lineTo(670, 472);
    c.lineTo(640, 500);
    c.lineTo(92, 500);
    c.closePath();
  });

  // Phone
  pen.stroke("line", 0.95, 3, rect(704, 120, 204, 412, 30));
  pen.fill("line", 0.55, rect(774, 136, 64, 16, 8));
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 730 + col * 56;
      const y = 178 + row * 62;
      const lit = row === 1 && col === 2;
      pen.stroke(lit ? "accent" : "line", lit ? 0.95 : 0.45, 2, rect(x, y, 40, 40, 11));
      if (lit) pen.fill("pulse", 0.6, rect(x, y, 40, 40, 11));
    }
  }
  pen.line("line", 0.6, 4, 766, 510, 846, 510);

  // Desktop app window with a terminal
  pen.stroke("line", 0.85, 2.5, rect(96, 560, 560, 330, 14));
  pen.line("line", 0.4, 2, 96, 598, 656, 598);
  for (const x of [124, 146, 168]) pen.fill("line", 0.6, circle(x, 579, 6));
  const commands = [300, 420, 260, 380, 210];
  commands.forEach((length, i) => {
    const y = 640 + i * 42;
    pen.text("accent", 0.9, 22, ">", 124, y + 8);
    pen.line("line", 0.45, 5, 150, y, 150 + length, y);
  });
  pen.fill("pulse", 0.95, rect(372, 812, 14, 24, 2));

  // Tablet in a video call
  pen.stroke("line", 0.85, 2.5, rect(704, 580, 204, 310, 20));
  for (let i = 0; i < 4; i++) {
    const x = 722 + (i % 2) * 88;
    const y = 604 + Math.floor(i / 2) * 110;
    const speaking = i === 0;
    pen.stroke(speaking ? "accent" : "line", speaking ? 0.9 : 0.4, 2, rect(x, y, 80, 100, 8));
    pen.stroke(speaking ? "accent" : "line", speaking ? 0.9 : 0.5, 2, circle(x + 40, y + 42, 16));
    pen.stroke(speaking ? "accent" : "line", speaking ? 0.9 : 0.5, 2, (c) => c.arc(x + 40, y + 92, 28, Math.PI * 1.15, Math.PI * 1.85));
  }
  pen.fill("pulse", 0.8, circle(810, 850, 12));

  // Everything stays in sync.
  pen.stroke("pulse", 0.9, 2, (c) => {
    c.moveTo(636, 300);
    c.lineTo(704, 300);
  }, [8, 10]);
  pen.stroke("pulse", 0.9, 2, (c) => {
    c.moveTo(656, 740);
    c.lineTo(704, 740);
  }, [8, 10]);
  pen.stroke("line", 0.3, 2, (c) => {
    c.moveTo(366, 500);
    c.lineTo(366, 560);
  }, [4, 8]);
}

// ── Services: a hub and the services around it ───────────────────────────

function drawServices(pen: Pen): void {
  const hub = { x: 500, y: 490 };
  const nodes = [
    { x: 200, y: 200 },
    { x: 500, y: 180 },
    { x: 800, y: 200 },
    { x: 170, y: 490 },
    { x: 830, y: 490 },
    { x: 200, y: 780 },
    { x: 500, y: 800 },
    { x: 800, y: 780 },
  ];

  pen.stroke("line", 0.14, 1.4, circle(hub.x, hub.y, 420), [3, 9]);

  // Orthogonal routes, like traces on a board.
  for (const node of nodes) {
    const route: [number, number][] =
      node.x === hub.x
        ? [
            [hub.x, hub.y + Math.sign(node.y - hub.y) * 74],
            [node.x, node.y - Math.sign(node.y - hub.y) * 36],
          ]
        : node.y === hub.y
          ? [
              [hub.x + Math.sign(node.x - hub.x) * 74, hub.y],
              [node.x - Math.sign(node.x - hub.x) * 50, node.y],
            ]
          : [
              [hub.x + Math.sign(node.x - hub.x) * 74, hub.y],
              [node.x, hub.y],
              [node.x, node.y - Math.sign(node.y - hub.y) * 36],
            ];
    pen.stroke("line", 0.32, 2, (c) => {
      c.moveTo(...route[0]);
      for (const point of route.slice(1)) c.lineTo(...point);
    });
    const [ax, ay] = route[route.length - 2];
    const [bx, by] = route[route.length - 1];
    pen.fill("pulse", 1, rect((ax + bx) / 2 - 6, (ay + by) / 2 - 6, 12, 12, 2));
  }

  for (const [i, node] of nodes.entries()) {
    pen.stroke("line", 0.85, 2.5, rect(node.x - 50, node.y - 36, 100, 72, 12));
    pen.line("line", 0.6, 5, node.x - 30, node.y - 6, node.x + 22, node.y - 6);
    pen.line("line", 0.3, 4, node.x - 30, node.y + 12, node.x + 4, node.y + 12);
    pen.fill(i % 3 === 0 ? "pulse" : "accent", 0.9, circle(node.x + 32, node.y - 18, 5));
  }

  pen.glow("accent", 0.35, hub.x, hub.y, 150);
  pen.stroke("line", 0.95, 3, circle(hub.x, hub.y, 74));
  pen.stroke("accent", 0.9, 3, circle(hub.x, hub.y, 50));
  pen.fill("accent", 0.3, circle(hub.x, hub.y, 50));
  pen.stroke("line", 0.5, 1.5, circle(hub.x, hub.y, 92), [2, 6]);
  pen.fill("pulse", 0.9, circle(hub.x, hub.y, 14));
}

// ── Data: a table, databases and a vector search ─────────────────────────

function drawData(pen: Pen): void {
  const rng = mulberry32(53);

  // Table
  pen.fill("line", 0.1, rect(96, 120, 480, 42, 8));
  pen.stroke("line", 0.5, 2, rect(96, 120, 480, 42, 8));
  for (const x of [176, 336, 456]) pen.line("line", 0.15, 1.5, x, 162, x, 582);
  for (let row = 0; row < 10; row++) {
    const y = 162 + row * 42;
    pen.line("line", 0.2, 1.5, 96, y + 42, 576, y + 42);
    if (row === 4) {
      pen.fill("accent", 0.14, rect(96, y + 2, 480, 38, 4));
      pen.fill("pulse", 0.25, rect(96, y + 2, 480, 38, 4));
    }
    for (const [start, end] of [
      [110, 164],
      [190, 324],
      [350, 444],
      [470, 562],
    ]) {
      const length = (end - start) * (0.45 + rng() * 0.55);
      pen.line(row === 4 ? "accent" : "line", row === 4 ? 0.9 : 0.4, 4, start, y + 21, start + length, y + 21);
    }
  }

  // Two databases
  for (const [i, cx] of [690, 836].entries()) {
    const top = 136;
    const bottom = 300;
    const channel: Channel = i === 0 ? "accent" : "line";
    const alpha = i === 0 ? 0.9 : 0.8;
    pen.stroke(channel, alpha, 2.5, (c) => c.ellipse(cx, top, 58, 17, 0, 0, Math.PI * 2));
    pen.stroke(channel, alpha, 2.5, (c) => {
      c.moveTo(cx - 58, top);
      c.lineTo(cx - 58, bottom);
      c.ellipse(cx, bottom, 58, 17, 0, Math.PI, 0, true);
      c.lineTo(cx + 58, top);
    });
    for (const y of [190, 245]) {
      pen.stroke("line", 0.4, 2, (c) => c.ellipse(cx, y, 58, 17, 0, 0, Math.PI));
    }
  }

  // Vector search: a query and its nearest neighbours.
  const query = { x: 764, y: 500 };
  pen.stroke("line", 0.2, 1.5, rect(620, 376, 290, 250, 12));
  for (let i = 0; i < 46; i++) {
    const x = 636 + rng() * 258;
    const y = 392 + rng() * 218;
    const near = Math.hypot(x - query.x, y - query.y) < 76;
    pen.fill(near ? "pulse" : "line", near ? 0.95 : 0.5, circle(x, y, near ? 5 : 3.5));
  }
  pen.stroke("accent", 0.65, 2, circle(query.x, query.y, 76), [6, 8]);
  pen.fill("accent", 1, circle(query.x, query.y, 8));
  pen.glow("accent", 0.4, query.x, query.y, 60);

  // Throughput
  pen.line("line", 0.3, 1.5, 96, 890, 910, 890);
  const trend: [number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const x = 104 + i * 45;
    const height = 50 + rng() * 110 + i * 3;
    const last = i === 17;
    pen.fill(last ? "accent" : "line", last ? 0.7 : 0.1, rect(x, 890 - height, 28, height, 3));
    pen.stroke(last ? "accent" : "line", last ? 0.9 : 0.5, 2, rect(x, 890 - height, 28, height, 3));
    trend.push([x + 14, 890 - height - 18]);
  }
  pen.stroke("pulse", 0.8, 2.5, (c) => {
    c.moveTo(...trend[0]);
    for (const point of trend.slice(1)) c.lineTo(...point);
  });
}

// ── Intelligence: the core ───────────────────────────────────────────────

function drawIntelligence(pen: Pen): void {
  const rng = mulberry32(67);
  const cx = 500;
  const cy = 480;

  pen.glow("accent", 0.9, cx, cy, 230);
  pen.fill("accent", 1, circle(cx, cy, 44));
  pen.stroke("accent", 0.95, 3, circle(cx, cy, 64));
  pen.stroke("line", 0.9, 2.5, circle(cx, cy, 110));
  pen.stroke("line", 0.45, 2, circle(cx, cy, 160), [6, 10]);
  pen.stroke("line", 0.3, 1.5, circle(cx, cy, 230));
  pen.stroke("line", 0.18, 1.5, circle(cx, cy, 330));

  // Dial around the outside
  for (let degrees = 0; degrees < 360; degrees += 2) {
    const angle = (degrees * Math.PI) / 180;
    const major = degrees % 10 === 0;
    const inner = major ? 378 : 388;
    pen.line(
      "line",
      major ? 0.4 : 0.2,
      1.4,
      cx + Math.cos(angle) * inner,
      cy + Math.sin(angle) * inner,
      cx + Math.cos(angle) * 398,
      cy + Math.sin(angle) * 398,
    );
  }

  // Ticks inside the middle ring
  for (let degrees = 0; degrees < 360; degrees += 6) {
    const angle = (degrees * Math.PI) / 180;
    pen.line("line", 0.3, 1.4, cx + Math.cos(angle) * 220, cy + Math.sin(angle) * 220, cx + Math.cos(angle) * 230, cy + Math.sin(angle) * 230);
  }

  // Connections out from the core
  for (let i = 0; i < 22; i++) {
    const angle = rng() * Math.PI * 2;
    const reach = 250 + rng() * 80;
    const x = cx + Math.cos(angle) * reach;
    const y = cy + Math.sin(angle) * reach;
    pen.line("line", 0.24, 1.5, cx + Math.cos(angle) * 110, cy + Math.sin(angle) * 110, x, y);
    const firing = i % 4 === 0;
    pen.stroke(firing ? "pulse" : "line", firing ? 1 : 0.75, 2, circle(x, y, 6));
    if (firing) pen.fill("pulse", 0.9, circle(x, y, 6));
  }

  // Satellites on the middle ring
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + 0.4;
    pen.fill("pulse", 0.95, circle(cx + Math.cos(angle) * 230, cy + Math.sin(angle) * 230, 9));
  }

  // Readout arcs
  pen.stroke("accent", 0.75, 5, (c) => c.arc(cx, cy, 272, -0.35, 0.7));
  pen.stroke("line", 0.6, 5, (c) => c.arc(cx, cy, 272, 2.8, 3.5));
}

const DRAWINGS: Record<LayerId, (pen: Pen) => void> = {
  interface: drawInterface,
  devices: drawDevices,
  services: drawServices,
  data: drawData,
  intelligence: drawIntelligence,
};

/**
 * Draws one plate. `font` is a CSS font-family list for the small labels;
 * it must already be loaded.
 */
export function drawPlate(id: LayerId, index: number, name: string, size: number, font: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Opaque black first, then add light: each channel accumulates on its own.
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setTransform(size / U, 0, 0, size / U, 0, 0);

  const pen = new Pen(ctx, font);
  frame(pen, index, name);
  DRAWINGS[id](pen);
  return canvas;
}
