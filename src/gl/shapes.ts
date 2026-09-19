/**
 * Point clouds the particle field morphs between. Each shape is generated
 * procedurally from a seed, so there is nothing to download and the output is
 * identical on every device.
 *
 * Every shape returns `count` records of [x, y, z, highlight]. Highlight (0..1)
 * picks out the parts that glow in the accent colour.
 */

export const SHAPE_IDS = ["field", "browser", "devices", "network", "database", "core"] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

/** Floats per particle: x, y, z, highlight. */
export const STRIDE = 4;

type Rng = () => number;

interface Point {
  x: number;
  y: number;
  z: number;
  h: number;
}

interface Part {
  weight: number;
  sample: (rng: Rng) => Point;
}

// ── Randomness ───────────────────────────────────────────────────────────

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function range(rng: Rng, min: number, max: number): number {
  return min + (max - min) * rng();
}

// ── Primitive samplers ───────────────────────────────────────────────────

function point(x: number, y: number, z: number, h = 0): Point {
  return { x, y, z, h };
}

function onSegment(
  rng: Rng,
  a: [number, number, number],
  b: [number, number, number],
  h = 0,
  jitter = 0.006,
): Point {
  const t = rng();
  return point(
    a[0] + (b[0] - a[0]) * t + gaussian(rng) * jitter,
    a[1] + (b[1] - a[1]) * t + gaussian(rng) * jitter,
    a[2] + (b[2] - a[2]) * t + gaussian(rng) * jitter,
    h,
  );
}

/** Uniformly along the perimeter of a rounded rectangle in the XY plane. */
function onRoundedRect(
  rng: Rng,
  cx: number,
  cy: number,
  w: number,
  hgt: number,
  r: number,
  z = 0,
  h = 0,
): Point {
  const sx = w - 2 * r;
  const sy = hgt - 2 * r;
  const arc = (Math.PI / 2) * r;
  const left = cx - w / 2;
  const right = cx + w / 2;
  const top = cy + hgt / 2;
  const bottom = cy - hgt / 2;
  const jitter = () => gaussian(rng) * 0.005;

  // Walk clockwise from the top-left: edge, corner, edge, corner…
  // Each corner sweeps a quarter turn clockwise from `startAngle`.
  const corner = (ccx: number, ccy: number, startAngle: number, distance: number) => {
    const angle = startAngle - (distance / arc) * (Math.PI / 2);
    return point(ccx + Math.cos(angle) * r + jitter(), ccy + Math.sin(angle) * r + jitter(), z, h);
  };

  let s = rng() * (2 * sx + 2 * sy + 4 * arc);
  if (s < sx) return point(left + r + s, top + jitter(), z, h);
  s -= sx;
  if (s < arc) return corner(right - r, top - r, Math.PI / 2, s);
  s -= arc;
  if (s < sy) return point(right + jitter(), top - r - s, z, h);
  s -= sy;
  if (s < arc) return corner(right - r, bottom + r, 0, s);
  s -= arc;
  if (s < sx) return point(right - r - s, bottom + jitter(), z, h);
  s -= sx;
  if (s < arc) return corner(left + r, bottom + r, -Math.PI / 2, s);
  s -= arc;
  if (s < sy) return point(left + jitter(), bottom + r + s, z, h);
  s -= sy;
  return corner(left + r, top - r, Math.PI, s);
}

function inRect(rng: Rng, cx: number, cy: number, w: number, hgt: number, z = 0, h = 0): Point {
  return point(cx + (rng() - 0.5) * w, cy + (rng() - 0.5) * hgt, z, h);
}

function inDisk(rng: Rng, cx: number, cy: number, radius: number, z = 0, h = 0): Point {
  const r = radius * Math.sqrt(rng());
  const a = rng() * Math.PI * 2;
  return point(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z, h);
}

/** Circle lying in the XZ plane (a ring seen from the front). */
function onRingXZ(rng: Rng, cx: number, cy: number, cz: number, radius: number, h = 0, spread = 0.008): Point {
  const a = rng() * Math.PI * 2;
  return point(
    cx + Math.cos(a) * radius + gaussian(rng) * spread,
    cy + gaussian(rng) * spread,
    cz + Math.sin(a) * radius + gaussian(rng) * spread,
    h,
  );
}

// ── Transforms ───────────────────────────────────────────────────────────

function rotateX(p: Point, angle: number): Point {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c, h: p.h };
}

function rotateZ(p: Point, angle: number): Point {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z, h: p.h };
}

function transformed(parts: Part[], transform: (p: Point) => Point): Part[] {
  return parts.map((part) => ({ weight: part.weight, sample: (rng) => transform(part.sample(rng)) }));
}

// ── Assembly ─────────────────────────────────────────────────────────────

function build(parts: Part[], count: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * STRIDE);
  const total = parts.reduce((sum, part) => sum + part.weight, 0);
  const counts = parts.map((part) => Math.floor((part.weight / total) * count));

  let assigned = counts.reduce((a, b) => a + b, 0);
  for (let k = 0; assigned < count; k++, assigned++) counts[k % counts.length]++;

  let i = 0;
  parts.forEach((part, index) => {
    for (let n = 0; n < counts[index]; n++, i++) {
      const p = part.sample(rng);
      const o = i * STRIDE;
      out[o] = p.x;
      out[o + 1] = p.y;
      out[o + 2] = p.z;
      out[o + 3] = p.h;
    }
  });

  // Shuffle whole records so that, when morphing, every particle travels to a
  // random place in the next shape: the swarm dissolves and re-forms.
  for (let a = count - 1; a > 0; a--) {
    const b = Math.floor(rng() * (a + 1));
    for (let k = 0; k < STRIDE; k++) {
      const tmp = out[a * STRIDE + k];
      out[a * STRIDE + k] = out[b * STRIDE + k];
      out[b * STRIDE + k] = tmp;
    }
  }
  return out;
}

// ── Shapes ───────────────────────────────────────────────────────────────

/**
 * A volume of dust sized to a 16:9 view; the scene stretches it to other
 * aspect ratios. Most of it sits near the focal plane, where the lens looks.
 */
function field(): Part[] {
  return [
    {
      weight: 1,
      sample: (rng) =>
        point(
          range(rng, -4.4, 4.4),
          range(rng, -2.6, 2.6),
          1.2 - Math.pow(rng(), 1.6) * 4.2,
          rng() < 0.08 ? 1 : 0,
        ),
    },
  ];
}

/** A browser window: frame, title bar, a hero block, copy, a button and cards. */
function browser(): Part[] {
  const cards = [-1.12, 0, 1.12];
  const copy: [number, number][] = [
    [0.58, 1.45],
    [0.4, 1.2],
    [0.22, 1.35],
  ];
  return [
    { weight: 0.2, sample: (rng) => onRoundedRect(rng, 0, 0, 3.4, 2.3, 0.09) },
    { weight: 0.04, sample: (rng) => onSegment(rng, [-1.7, 0.85, 0], [1.7, 0.85, 0]) },
    {
      weight: 0.03,
      sample: (rng) => inDisk(rng, -1.52 + Math.floor(rng() * 3) * 0.16, 1.0, 0.045, 0, 1),
    },
    { weight: 0.04, sample: (rng) => onRoundedRect(rng, 0.15, 1.0, 1.9, 0.16, 0.08) },
    { weight: 0.1, sample: (rng) => inRect(rng, -0.72, 0.28, 1.5, 0.8, gaussian(rng) * 0.02) },
    { weight: 0.05, sample: (rng) => onRoundedRect(rng, -0.72, 0.28, 1.5, 0.8, 0.04) },
    {
      weight: 0.07,
      sample: (rng) => {
        const [y, end] = copy[Math.floor(rng() * copy.length)];
        return onSegment(rng, [0.25, y, 0], [end, y, 0]);
      },
    },
    { weight: 0.03, sample: (rng) => onRoundedRect(rng, 0.62, -0.02, 0.72, 0.16, 0.08, 0, 1) },
    {
      weight: 0.18,
      sample: (rng) => onRoundedRect(rng, cards[Math.floor(rng() * 3)], -0.62, 0.98, 0.62, 0.05),
    },
    {
      weight: 0.06,
      sample: (rng) => {
        const x = cards[Math.floor(rng() * 3)];
        const y = rng() < 0.5 ? -0.5 : -0.66;
        return onSegment(rng, [x - 0.36, y, 0], [x + (y > -0.6 ? 0.3 : 0.1), y, 0]);
      },
    },
    { weight: 0.06, sample: (rng) => inRect(rng, 0, 0, 3.6, 2.5, gaussian(rng) * 0.35) },
  ];
}

/** A laptop with an editor open, and a phone standing in front of it. */
function devices(): Part[] {
  const deck = {
    backLeft: [-1.85, -0.56, -0.2] as [number, number, number],
    backRight: [0.95, -0.56, -0.2] as [number, number, number],
    frontRight: [1.15, -0.8, 0.75] as [number, number, number],
    frontLeft: [-2.05, -0.8, 0.75] as [number, number, number],
  };
  const onDeck = (u: number, v: number): [number, number, number] => {
    const back = deck.backLeft.map((a, k) => a + (deck.backRight[k] - a) * u);
    const front = deck.frontLeft.map((a, k) => a + (deck.frontRight[k] - a) * u);
    return back.map((a, k) => a + (front[k] - a) * v) as [number, number, number];
  };
  const code: [number, number, number][] = [
    [0.96, -1.55, 0.2],
    [0.79, -1.4, 0.55],
    [0.62, -1.4, 0.35],
    [0.45, -1.25, 0.75],
    [0.28, -1.4, 0.15],
    [0.11, -1.55, 0.4],
    [-0.06, -1.4, -0.1],
  ];
  const rows = [0.18, 0.02, -0.14, -0.3];
  const parts: Part[] = [
    { weight: 0.17, sample: (rng) => onRoundedRect(rng, -0.45, 0.32, 2.7, 1.72, 0.06, -0.2) },
    { weight: 0.06, sample: (rng) => onRoundedRect(rng, -0.45, 0.34, 2.5, 1.52, 0.03, -0.2) },
    {
      weight: 0.09,
      sample: (rng) => {
        const [y, start, end] = code[Math.floor(rng() * code.length)];
        return onSegment(rng, [start, y, -0.2], [end, y, -0.2]);
      },
    },
    { weight: 0.012, sample: (rng) => inRect(rng, -0.62, 0.45, 0.03, 0.12, -0.2, 1) },
    {
      weight: 0.08,
      sample: (rng) => {
        const edge = Math.floor(rng() * 4);
        const corners = [deck.backLeft, deck.backRight, deck.frontRight, deck.frontLeft];
        return onSegment(rng, corners[edge], corners[(edge + 1) % 4]);
      },
    },
    {
      weight: 0.08,
      sample: (rng) => {
        const u = 0.1 + Math.round(rng() * 13) * (0.8 / 13);
        const v = 0.12 + Math.round(rng() * 4) * (0.42 / 4);
        const [x, y, z] = onDeck(u, v);
        return point(x + gaussian(rng) * 0.012, y, z + gaussian(rng) * 0.012);
      },
    },
    {
      weight: 0.02,
      sample: (rng) => {
        const u = 0.38 + rng() * 0.24;
        const v = rng() < 0.5 ? 0.66 : 0.9;
        const [x, y, z] = onDeck(u, v);
        return point(x, y, z);
      },
    },
    { weight: 0.14, sample: (rng) => onRoundedRect(rng, 1.45, -0.05, 0.86, 1.72, 0.13, 0.55) },
    { weight: 0.012, sample: (rng) => onRoundedRect(rng, 1.45, 0.7, 0.22, 0.05, 0.025, 0.55, 1) },
    { weight: 0.03, sample: (rng) => onRoundedRect(rng, 1.45, 0.42, 0.66, 0.24, 0.04, 0.55) },
    {
      weight: 0.05,
      sample: (rng) => {
        const y = rows[Math.floor(rng() * rows.length)];
        return onSegment(rng, [1.16, y, 0.55], [1.74, y, 0.55]);
      },
    },
    { weight: 0.02, sample: (rng) => inDisk(rng, 1.45, -0.66, 0.07, 0.55, 1) },
    { weight: 0.03, sample: (rng) => inRect(rng, -0.2, 0.1, 4, 2.2, gaussian(rng) * 0.4) },
  ];
  return transformed(parts, (p) => ({ ...p, x: p.x + 0.05 }));
}

/** A graph of services: dense nodes joined to their nearest neighbours. */
function network(rng: Rng): Part[] {
  const count = 24;
  const nodes: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const r = 1.45 + gaussian(rng) * 0.08;
    nodes.push([Math.cos(theta) * radius * r, y * r * 0.82, Math.sin(theta) * radius * r]);
  }

  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  });

  const hubs = new Set([2, 9, 15, 20]);
  return [
    {
      weight: 0.42,
      sample: (rng) => {
        const i = Math.floor(rng() * count);
        const [x, y, z] = nodes[i];
        const spread = hubs.has(i) ? 0.075 : 0.042;
        return point(x + gaussian(rng) * spread, y + gaussian(rng) * spread, z + gaussian(rng) * spread, 0.9);
      },
    },
    {
      weight: 0.48,
      sample: (rng) => {
        const [i, j] = edges[Math.floor(rng() * edges.length)];
        return onSegment(rng, nodes[i], nodes[j], rng() < 0.05 ? 1 : 0, 0.008);
      },
    },
    {
      weight: 0.1,
      sample: (rng) => {
        const u = rng() * 2 - 1;
        const a = rng() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const r = 1.95 + gaussian(rng) * 0.1;
        return point(Math.cos(a) * s * r, u * r * 0.82, Math.sin(a) * s * r);
      },
    },
  ];
}

/** Three stacked cylinders, the universal database glyph, with a query beam. */
function database(): Part[] {
  const radius = 1.15;
  const height = 0.52;
  const centers = [0.66, 0, -0.66];
  const pick = (rng: Rng) => centers[Math.floor(rng() * centers.length)];
  const parts: Part[] = [
    { weight: 0.3, sample: (rng) => onRingXZ(rng, 0, pick(rng) + height / 2, 0, radius, 0.85) },
    { weight: 0.15, sample: (rng) => onRingXZ(rng, 0, pick(rng) - height / 2, 0, radius, 0.2) },
    {
      weight: 0.2,
      sample: (rng) => {
        const a = rng() * Math.PI * 2;
        const y = pick(rng) + (rng() - 0.5) * height;
        return point(Math.cos(a) * radius, y, Math.sin(a) * radius);
      },
    },
    {
      weight: 0.08,
      sample: (rng) => {
        const r = radius * Math.sqrt(rng());
        const a = rng() * Math.PI * 2;
        return point(Math.cos(a) * r, centers[0] + height / 2, Math.sin(a) * r, 0.1);
      },
    },
    {
      weight: 0.05,
      sample: (rng) => point(gaussian(rng) * 0.02, range(rng, -1.25, 1.25), gaussian(rng) * 0.02, 1),
    },
    { weight: 0.05, sample: (rng) => point(range(rng, -1.8, 1.8), range(rng, -1.3, 1.3), gaussian(rng) * 0.5) },
  ];
  return transformed(parts, (p) => rotateX(p, 0.42));
}

const CORE_TILT_X = -1.05;
const CORE_TILT_Z = 0.35;

/** A spiral of intelligence around a bright core, ringed by a thin halo. */
function core(): Part[] {
  const arms = 3;
  const parts: Part[] = [
    {
      weight: 0.16,
      sample: (rng) => point(gaussian(rng) * 0.16, gaussian(rng) * 0.16, gaussian(rng) * 0.16, 1),
    },
    {
      weight: 0.52,
      sample: (rng) => {
        const arm = Math.floor(rng() * arms);
        const r = 0.2 + Math.pow(rng(), 0.8) * 1.5;
        const theta = (arm * Math.PI * 2) / arms + Math.log(r / 0.22) * 1.9 + gaussian(rng) * 0.18;
        const spread = gaussian(rng) * 0.05 * r;
        return point(
          Math.cos(theta) * r + spread,
          gaussian(rng) * 0.05 * (1.9 - r),
          Math.sin(theta) * r + spread,
          Math.max(0, 1 - r / 1.8) * 0.9,
        );
      },
    },
    { weight: 0.12, sample: (rng) => onRingXZ(rng, 0, 0, 0, 1.8, 0.35, 0.022) },
    {
      weight: 0.1,
      sample: (rng) => {
        const u = rng() * 2 - 1;
        const a = rng() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const r = 2 * Math.sqrt(rng());
        return point(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r);
      },
    },
  ];
  return transformed(parts, (p) => rotateZ(rotateX(p, CORE_TILT_X), CORE_TILT_Z));
}

/** The axis the core spins around: the galaxy's disk normal after tilting. */
export const CORE_SPIN_AXIS: [number, number, number] = (() => {
  const n = rotateZ(rotateX(point(0, 1, 0), CORE_TILT_X), CORE_TILT_Z);
  return [n.x, n.y, n.z];
})();

export function generateShape(id: ShapeId, count: number, seed: number): Float32Array {
  const rng = mulberry32(seed);
  switch (id) {
    case "field":
      return build(field(), count, rng);
    case "browser":
      return build(browser(), count, rng);
    case "devices":
      return build(devices(), count, rng);
    case "network":
      return build(network(rng), count, rng);
    case "database":
      return build(database(), count, rng);
    case "core":
      return build(core(), count, rng);
  }
}
