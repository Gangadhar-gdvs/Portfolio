export type Tier = "high" | "mid" | "low";

export interface TierSettings {
  maxPixelRatio: number;
  /** Pixels along each side of a plate's etching. */
  textureSize: number;
  dust: number;
  reflection: boolean;
}

export const TIERS: Record<Tier, TierSettings> = {
  high: { maxPixelRatio: 2, textureSize: 2048, dust: 520, reflection: true },
  mid: { maxPixelRatio: 1.75, textureSize: 1536, dust: 380, reflection: true },
  low: { maxPixelRatio: 1.25, textureSize: 1024, dust: 200, reflection: false },
};

/** A cheap guess at the device class, refined at runtime by frame timing. */
export function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return "low";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.screen.width, window.screen.height) < 500;
  if (coarse || small || memory <= 4 || cores <= 4) return "mid";

  return "high";
}

export type GraphicsSupport = "gpu" | "software" | "none";

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Whether WebGL is backed by a real GPU. Software rasterisers (SwiftShader,
 * llvmpipe) run shaders on the CPU, which would stall the page, so those
 * machines get the static fallback instead.
 */
export function probeGraphics(): GraphicsSupport {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "none";

    let renderer = String(gl.getParameter(gl.RENDERER));
    // Chrome masks RENDERER; its debug extension still reports the real one.
    if (/^(webkit webgl|mozilla)$/i.test(renderer)) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    }
    // Browsers cap live contexts; release the probe straight away.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return SOFTWARE_RENDERER.test(renderer) ? "software" : "gpu";
  } catch {
    return "none";
  }
}
