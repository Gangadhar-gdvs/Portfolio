/**
 * Collects an icon for every skill on the globe.
 *
 * Most are brand marks from simple-icons (CC0). The rest are skills with no
 * logo to borrow — REST APIs, accessibility, performance work — so they get a
 * glyph drawn here from primitives, in the same 24 × 24 box the brand marks
 * use, so the whole set extrudes and lights identically.
 *
 * Regenerate with `npm run globe:icons`.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const si = require("simple-icons");

// ── Drawing helpers, all filled shapes: an extrusion needs area, not strokes.
const n = (v) => Math.round(v * 100) / 100;
const circle = (cx, cy, r) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0Z`;
const poly = (points) => `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}Z`;
const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);

/** A bar rotated about its own centre, for spokes, needles and limbs. */
function bar(cx, cy, length, thickness, degrees) {
  const a = (degrees * Math.PI) / 180;
  const [dx, dy] = [Math.cos(a), Math.sin(a)];
  const [px, py] = [-dy * (thickness / 2), dx * (thickness / 2)];
  const [hx, hy] = [dx * (length / 2), dy * (length / 2)];
  return poly([
    [cx - hx + px, cy - hy + py],
    [cx + hx + px, cy + hy + py],
    [cx + hx - px, cy + hy - py],
    [cx - hx - px, cy - hy - py],
  ]);
}

/** A ring drawn as a band of segments, so it never needs a hole. */
function ring(cx, cy, radius, thickness, from = 0, to = 360, step = 12) {
  let d = "";
  for (let a = from; a < to; a += step) {
    const mid = ((a + step / 2) * Math.PI) / 180;
    d += bar(cx + Math.cos(mid) * radius, cy + Math.sin(mid) * radius, (radius * step * Math.PI) / 180 + thickness * 0.45, thickness, a + step / 2 + 90);
  }
  return d;
}

function gear(cx, cy, radius, teeth = 8) {
  let d = circle(cx, cy, radius * 0.66);
  for (let i = 0; i < teeth; i += 1) {
    const a = (i * 360) / teeth;
    d += bar(cx + Math.cos((a * Math.PI) / 180) * radius * 0.82, cy + Math.sin((a * Math.PI) / 180) * radius * 0.82, radius * 0.62, radius * 0.42, a);
  }
  return d;
}

/**
 * Glyphs for the skills with no brand mark. Geometry only — no lettering, so
 * they read at the size a globe gives them.
 */
const DRAWN = {
  "REST APIs": // two chevrons, the way an endpoint is written
    poly([[10.2, 4.6], [12.4, 6.6], [7.9, 12], [12.4, 17.4], [10.2, 19.4], [3.8, 12]]) +
    poly([[13.8, 4.6], [20.2, 12], [13.8, 19.4], [11.6, 17.4], [16.1, 12], [11.6, 6.6]]),
  WebSockets: // a frame each way, which is the whole point of the protocol
    poly([[2.5, 7.4], [14, 7.4], [14, 4.4], [21.5, 9], [14, 13.6], [14, 10.6], [2.5, 10.6]]) +
    poly([[21.5, 16.6], [10, 16.6], [10, 19.6], [2.5, 15], [10, 10.4], [10, 13.4], [21.5, 13.4]]),
  "Vector search": // a lens over scattered points
    ring(10.5, 10.5, 6.2, 1.9) + bar(17.6, 17.6, 6.4, 2.2, 45) +
    circle(8.2, 9.4, 1.05) + circle(12.4, 8.2, 1.05) + circle(11.2, 12.6, 1.05),
  "Embeddings & RAG": // points gathered around one they are near
    circle(12, 12, 2.5) + circle(5.4, 7.6, 1.7) + circle(18.6, 7.6, 1.7) +
    circle(5.4, 16.4, 1.7) + circle(18.6, 16.4, 1.7),
  "Agent tooling": gear(12, 12, 8.4),
  "Performance budgets": // a gauge with the needle inside the arc
    ring(12, 14.5, 7.6, 2.3, 180, 360) + bar(12, 14.5, 9, 2.1, -52) + circle(12, 14.5, 1.9),
  Accessibility: // the access mark: head, arms, legs
    circle(12, 4.6, 2.3) + rect(3.6, 8.4, 16.8, 2.2) +
    poly([[10.4, 10.2], [13.6, 10.2], [13.6, 14], [18, 21.4], [15.2, 22.6], [12, 16.6], [8.8, 22.6], [6, 21.4], [10.4, 14]]),
  Playwright: // a pointer, driving a browser
    poly([[6, 3.4], [19.4, 12.4], [13.2, 13.4], [16.6, 20], [13.8, 21.4], [10.4, 14.8], [6, 19.2]]),
  "HarfBuzz text shaping": // a letterform on a baseline
    poly([[6.4, 3.6], [17.6, 3.6], [17.6, 6.4], [13.4, 6.4], [13.4, 16.4], [10.6, 16.4], [10.6, 6.4], [6.4, 6.4]]) +
    rect(4.2, 18.6, 15.6, 2.4),
};

/** Skill name → simple-icons export. Guessing the slug does not work. */
const BRAND = {
  React: "siReact", "Next.js": "siNextdotjs", TypeScript: "siTypescript", JavaScript: "siJavascript",
  "Tailwind CSS": "siTailwindcss", "HTML & CSS": "siHtml5", "Three.js": "siThreedotjs", GSAP: "siGreensock",
  "WebGL shaders": "siWebgl", "Chart.js": "siChartdotjs", SCSS: "siSass", Flutter: "siFlutter", Dart: "siDart",
  Tauri: "siTauri", Electron: "siElectron", Rust: "siRust", "Zoom Video SDK": "siZoom", "Node.js": "siNodedotjs",
  NestJS: "siNestjs", Express: "siExpress", "Bun & Elysia": "siBun", "Firebase Cloud Messaging": "siFirebase",
  "JWT & role-based access": "siJsonwebtokens", PHP: "siPhp", MongoDB: "siMongodb", PostgreSQL: "siPostgresql",
  MySQL: "siMysql", SQLite: "siSqlite", Firebase: "siFirebase", Gemini: "siGooglegemini", Ollama: "siOllama",
  "scikit-learn": "siScikitlearn", pandas: "siPandas", Python: "siPython", "Git & GitHub Actions": "siGithubactions",
  Vitest: "siVitest", Vite: "siVite", "Docker Compose": "siDocker", "Vercel & Railway": "siVercel",
};

const source = await import("node:fs").then((fs) =>
  fs.readFileSync(new URL("../../src/content/skills.ts", import.meta.url), "utf8"),
);
const names = [...source.matchAll(/\{ name: "([^"]+)", level:/g)].map((m) => m[1]);

const entries = [];
const missing = [];
for (const name of names) {
  const brand = BRAND[name];
  // The brand's own colour where there is one; the drawn glyphs take their
  // discipline's colour at render time, which is what `null` means here.
  if (brand && si[brand]) entries.push([name, si[brand].path, "brand", `#${si[brand].hex}`]);
  else if (DRAWN[name]) entries.push([name, DRAWN[name], "drawn", null]);
  else missing.push(name);
}

writeFileSync(
  new URL("../../src/design/depth/gl/icons.ts", import.meta.url),
  `/**
 * One icon per skill, as SVG path data in a 24 × 24 box.
 *
 * Generated by \`scripts/globe/icons.mjs\`. ${entries.filter((e) => e[2] === "brand").length} are brand marks from
 * simple-icons (CC0); ${entries.filter((e) => e[2] === "drawn").length} are drawn in that script for skills with no
 * logo to borrow. The globe extrudes each one, so they are geometry rather
 * than pictures. Regenerate with \`npm run globe:icons\`.
 */

export interface Icon {
  path: string;
  /** The brand's own colour, or null for a glyph that takes its discipline's. */
  colour: string | null;
}

export const ICONS: Record<string, Icon> = {
${entries.map(([name, path, , colour]) => `  ${JSON.stringify(name)}: { path: ${JSON.stringify(path)}, colour: ${colour ? JSON.stringify(colour) : "null"} },`).join("\n")}
};
`,
);

console.log("icons:", entries.length, "of", names.length, "| brand:", entries.filter((e) => e[2] === "brand").length, "| drawn:", entries.filter((e) => e[2] === "drawn").length);
if (missing.length) console.log("NO ICON:", missing.join(", "));
