import { AdditiveBlending, Color, ShaderMaterial, Vector3, type IUniform, type Texture } from "three";

/**
 * Lighting shared by every plate: a cool key light from the front left, a
 * warm rim from behind on the right, and a light that follows the cursor.
 * Cinema lighting, teal against orange, done in a few lines of shader.
 */
export function createLights() {
  return {
    uKey: { value: new Color("#dcebff") },
    uKeyDir: { value: new Vector3(-0.45, 0.8, 0.4).normalize() },
    uRim: { value: new Color("#ffb86b") },
    uRimDir: { value: new Vector3(0.7, 0.3, -0.65).normalize() },
    uEdge: { value: new Color("#9fdcff") },
    uCursorColor: { value: new Color("#7ce7ff") },
    uFloorY: { value: -2 },
    uTime: { value: 0 },
  } satisfies Record<string, IUniform>;
}

export type Lights = ReturnType<typeof createLights>;

/** Values that belong to one plate. Its reflection shares the same objects. */
export function createPlateUniforms() {
  return {
    uBrightness: { value: 1 },
    uOpacity: { value: 1 },
    uHighlight: { value: 0 },
    uCursor: { value: new Vector3(0, 99, 0) },
    uCursorOn: { value: 0 },
  } satisfies Record<string, IUniform>;
}

export type PlateUniforms = ReturnType<typeof createPlateUniforms>;

const worldVertex = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/** The reflection fades with depth below the floor. */
const mirrorFade = /* glsl */ `
float mirrorFade(float y) {
  return exp(-max(uFloorY - y, 0.0) * 1.2) * 0.42;
}
`;

const glassFragment = /* glsl */ `
uniform vec3 uKey;
uniform vec3 uKeyDir;
uniform vec3 uRim;
uniform vec3 uRimDir;
uniform vec3 uEdge;
uniform vec3 uCursorColor;
uniform vec3 uCursor;
uniform float uCursorOn;
uniform float uBrightness;
uniform float uOpacity;
uniform float uHighlight;
uniform float uFloorY;
uniform float uMirror;

varying vec3 vWorld;
varying vec3 vNormalW;

${mirrorFade}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 4.0);

  // Smoked glass, lit at the edges.
  vec3 color = vec3(0.01, 0.017, 0.03);
  color += uEdge * fresnel * (0.75 + uHighlight * 0.5);

  // A tight highlight from the key light and a broad sheen under it.
  float keySpec = max(dot(N, normalize(uKeyDir + V)), 0.0);
  color += uKey * (pow(keySpec, 160.0) * 1.2 + pow(keySpec, 16.0) * 0.05);

  // Warm rim from behind.
  color += uRim * pow(max(dot(N, uRimDir), 0.0), 2.0) * (0.12 + fresnel * 1.5);

  // The cursor is a small lamp hovering just above the glass.
  vec3 toLamp = uCursor + vec3(0.0, 0.35, 0.0) - vWorld;
  float lampDistance = length(toLamp);
  vec3 L = toLamp / max(lampDistance, 0.0001);
  float lampSpec = pow(max(dot(N, normalize(L + V)), 0.0), 70.0);
  float lampWash = max(dot(N, L), 0.0) * 0.12;
  color += uCursorColor * uCursorOn * (lampSpec * 1.6 + lampWash) / (1.0 + lampDistance * lampDistance * 1.2);

  color *= uBrightness;
  float alpha = uOpacity * mix(0.86, 1.0, fresnel);

  if (uMirror > 0.5) {
    float fade = mirrorFade(vWorld.y);
    color *= fade;
    alpha *= fade;
  }

  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const etchFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uLine;
uniform vec3 uAccent;
uniform vec3 uCursor;
uniform float uCursorOn;
uniform float uBrightness;
uniform float uHighlight;
uniform float uTime;
uniform float uPhase;
uniform float uFloorY;
uniform float uMirror;

varying vec3 vWorld;
varying vec2 vUv;

${mirrorFade}

void main() {
  vec3 marks = texture2D(uMap, vUv).rgb;

  // A thin band of light sweeps across each plate, out of step with the others.
  float sweepAt = fract(uTime * 0.06 + uPhase) * 1.5 - 0.25;
  float sweep = exp(-pow((vUv.y - sweepAt) * 26.0, 2.0));

  // Pulses travel diagonally, so data looks like it's moving.
  float wave = 0.5 + 0.5 * sin(uTime * 2.2 - (vUv.x + vUv.y) * 8.0 + uPhase * 6.2831);

  float lamp = uCursorOn * exp(-dot(vWorld - uCursor, vWorld - uCursor) * 2.2);

  vec3 color = uLine * marks.r * (0.72 + sweep * 0.9 + lamp * 1.1 + uHighlight * 0.3)
    + uAccent * marks.g * (0.95 + lamp * 0.5 + uHighlight * 0.3)
    + uAccent * marks.b * (0.2 + wave * 1.05);
  color *= uBrightness;

  if (uMirror > 0.5) color *= mirrorFade(vWorld.y);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function createGlassMaterial(lights: Lights, plate: PlateUniforms, mirror: boolean): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: worldVertex,
    fragmentShader: glassFragment,
    transparent: true,
    depthWrite: !mirror,
    depthTest: !mirror,
    uniforms: { ...lights, ...plate, uMirror: { value: mirror ? 1 : 0 } },
  });
}

export function createEtchMaterial(lights: Lights, plate: PlateUniforms, map: Texture, phase: number, mirror: boolean): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: worldVertex,
    fragmentShader: etchFragment,
    transparent: true,
    depthWrite: false,
    depthTest: !mirror,
    blending: AdditiveBlending,
    uniforms: {
      ...lights,
      ...plate,
      uMap: { value: map },
      uLine: { value: new Color("#dfe9f5") },
      uAccent: { value: new Color("#7ce7ff") },
      uPhase: { value: phase },
      uMirror: { value: mirror ? 1 : 0 },
    },
  });
}

// ── Stage: backdrop, floor and dust ──────────────────────────────────────

/** A full-screen gradient with a pool of light where the stack stands. */
export function createBackdropMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTop: { value: new Color("#020308") },
      uBottom: { value: new Color("#05080f") },
      uGlow: { value: new Color("#0b1626") },
      uCenter: { value: new Vector3(0.7, 0.55, 0) },
      uAspect: { value: 1.6 },
      uFade: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.9999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uBottom;
      uniform vec3 uGlow;
      uniform vec3 uCenter;
      uniform float uAspect;
      uniform float uFade;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec3 color = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
        vec2 d = (vUv - uCenter.xy) * vec2(uAspect, 1.0);
        color += uGlow * exp(-dot(d, d) * 1.8) * uFade;
        vec2 v = vUv - 0.5;
        color *= 1.0 - dot(v, v) * 0.5;
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
        // Dither, so the dark gradient never bands.
        gl_FragColor.rgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
      }
    `,
  });
}

/** A glossy floor with a fine grid, fading into the dark. */
export function createFloorMaterial(lights: Lights): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      ...lights,
      uBase: { value: new Color("#060a12") },
      uGrid: { value: new Color("#8fb6d9") },
      uPool: { value: new Color("#1d3b5c") },
      uCenter: { value: new Vector3() },
      uCursor: { value: new Vector3(0, -99, 0) },
      uCursorOn: { value: 0 },
      uPresence: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uGrid;
      uniform vec3 uPool;
      uniform vec3 uCenter;
      uniform vec3 uCursor;
      uniform float uCursorOn;
      uniform float uPresence;
      varying vec3 vWorld;

      void main() {
        vec2 p = vWorld.xz - uCenter.xz;
        float r = length(p);

        // Hairline grid, antialiased in screen space so it stays one pixel wide.
        vec2 cell = vWorld.xz / 0.5;
        vec2 g = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
        float grid = 1.0 - min(min(g.x, g.y), 1.0);

        vec3 color = uBase;
        color += uPool * exp(-r * r * 0.4) * (0.25 + 0.45 * uPresence);
        color += uGrid * grid * 0.06 * exp(-r * 0.45);
        float lamp = length(vWorld.xz - uCursor.xz);
        color += uPool * uCursorOn * exp(-lamp * lamp * 1.5) * 0.6;

        float alpha = exp(-r * 0.16);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Specks of dust drifting through the light. Hard-edged, never blurry. */
export function createDustMaterial(pointSize: number, reducedMotion: boolean): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: pointSize },
      uPixelRatio: { value: 1 },
      uDrift: { value: reducedMotion ? 0 : 1 },
      uColor: { value: new Color("#cfe6ff") },
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uDrift;
      attribute vec4 aSeed;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        float t = uTime * uDrift;
        p.y = mod(p.y + t * (0.025 + aSeed.x * 0.05) + 3.0, 7.0) - 3.0;
        p.x += sin(t * 0.21 + aSeed.y * 6.2831) * 0.18;
        p.z += cos(t * 0.17 + aSeed.z * 6.2831) * 0.14;

        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = uSize * (0.5 + aSeed.z) * uPixelRatio / -view.z;

        float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed.w * 1.8) + aSeed.x * 40.0);
        float edge = smoothstep(-3.0, -2.2, p.y) * (1.0 - smoothstep(3.2, 4.0, p.y));
        vAlpha = twinkle * edge * (0.2 + aSeed.w * 0.45);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;

      void main() {
        float r = length(gl_PointCoord - 0.5);
        float disc = 1.0 - smoothstep(0.32, 0.5, r);
        if (disc <= 0.0) discard;
        gl_FragColor = vec4(uColor, disc * vAlpha * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
}
