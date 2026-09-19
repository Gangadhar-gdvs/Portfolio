import { readFile } from "node:fs/promises";
import { join } from "node:path";

const assets = join(process.cwd(), "src/assets");

/**
 * Static font files for share images; the image renderer reads WOFF and TTF
 * but not variable or WOFF2 fonts.
 */
export async function loadOgFonts() {
  const read = (file: string) => readFile(join(assets, "fonts", file));
  const [medium, regular, mono, serif] = await Promise.all([
    read("Geist-Medium.woff"),
    read("Geist-Regular.woff"),
    read("GeistMono-Regular.woff"),
    read("InstrumentSerif-Italic.woff"),
  ]);
  return [
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Instrument Serif", data: serif, weight: 400 as const, style: "italic" as const },
  ];
}

const dataUrl = (data: Buffer) => `data:image/png;base64,${data.toString("base64")}`;

/** A PNG from `src/assets/og` as a data URL, for images inside share cards. */
export async function loadOgAsset(file: string): Promise<string> {
  return dataUrl(await readFile(join(assets, "og", file)));
}

/** A PNG from `public/images` as a data URL. */
export async function loadPublicImage(file: string): Promise<string> {
  return dataUrl(await readFile(join(process.cwd(), "public", "images", file)));
}

export const ogColors = {
  night: "#030509",
  fg: "#eef2f7",
  fg2: "#a7b0bd",
  fg3: "#7d8694",
  glow: "#7ce7ff",
  warm: "#ffb86b",
  deny: "#ff7a85",
  line: "rgba(238, 242, 247, 0.14)",
};
