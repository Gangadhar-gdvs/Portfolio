import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Static TTF instances for share images (the image renderer can't read
 * variable fonts): Archivo at width 125 / weight 800, and JetBrains Mono 500.
 */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [display, mono] = await Promise.all([
    readFile(join(dir, "Archivo-ExpandedExtraBold.ttf")),
    readFile(join(dir, "JetBrainsMono-Medium.ttf")),
  ]);
  return [
    { name: "Archivo", data: display, weight: 800 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

/** Scattered points for the lens, fixed so every build renders the same image. */
export function lensSpecks(count: number, radius: number): { x: number; y: number; s: number; glow: boolean }[] {
  const specks = [];
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    const angle = next() * Math.PI * 2;
    const distance = Math.sqrt(next()) * radius * 0.92;
    specks.push({
      x: radius + Math.cos(angle) * distance,
      y: radius + Math.sin(angle) * distance,
      s: 2 + Math.round(next() * 3),
      glow: next() < 0.18,
    });
  }
  return specks;
}
