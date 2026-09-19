// Projects the site's real particle shapes to 2D for the README dot art.
// Run by make_svgs.py: node --experimental-strip-types scripts/readme/dots.mjs
import { generateShape, STRIDE } from "../../src/gl/shapes.ts";

const COUNT = 1100;
const ids = ["browser", "devices", "network", "database", "core"];
const yaw = { browser: -0.32, devices: -0.28, network: -0.45, database: -0.2, core: 0 };
const out = {};
for (const id of ids) {
  const pts = generateShape(id, COUNT, 5);
  const a = yaw[id];
  const c = Math.cos(a), s = Math.sin(a);
  const list = [];
  for (let i = 0; i < COUNT; i++) {
    const x = pts[i * STRIDE], y = pts[i * STRIDE + 1], z = pts[i * STRIDE + 2], h = pts[i * STRIDE + 3];
    const xr = x * c + z * s;
    const zr = -x * s + z * c;
    const k = 6 / (6 - zr); // same camera distance as the site
    list.push([+(xr * k).toFixed(3), +(y * k).toFixed(3), +h.toFixed(2), +zr.toFixed(2)]);
  }
  out[id] = list;
}
process.stdout.write(JSON.stringify(out));
