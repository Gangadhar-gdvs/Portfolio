import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { mulberry32 } from "@/lib/random";

export interface LabStats {
  /** Frames per second, averaged over the sample window. */
  fps: number;
  /** Frame times in milliseconds. */
  p50: number;
  p95: number;
  p99: number;
  count: number;
  pixelRatio: number;
  drawCalls: number;
  /** Frame times for the sparkline, oldest first. */
  recent: number[];
}

export interface LabOptions {
  canvas: HTMLCanvasElement;
  max: number;
  count: number;
  onStats: (stats: LabStats) => void;
  onShed: (message: string) => void;
}

/**
 * The band around one frame at 60 Hz (16.7 ms). A display hitting vsync exactly
 * reports ~16.7 ms, so shedding only starts once frames really slip, and quality
 * only comes back when there is clear headroom.
 */
const OVER = 20;
const UNDER = 14;
const WARM_UP = 60;
const WINDOW = 600;
const RATIOS = [2, 1.75, 1.5, 1.25, 1];

/**
 * A particle field whose only job is to be measured. Nothing is computed per
 * particle on the CPU: positions are derived in the vertex shader from a seed,
 * so the frame time is the GPU's answer to "how much can you draw in 16.7 ms".
 *
 * When shedding is on it does what an overloaded service should: give up
 * quality in a fixed order — pixel ratio, then detail — instead of stuttering.
 */
export class LoadLab {
  private readonly renderer: WebGLRenderer;
  private readonly camera = new PerspectiveCamera(50, 1, 0.1, 40);
  private readonly scene = new Scene();
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;
  private readonly points: Points;
  private readonly onStats: LabOptions["onStats"];
  private readonly onShed: LabOptions["onShed"];
  private readonly max: number;

  private frames: number[] = [];
  private recent: number[] = [];
  private warmUp = WARM_UP;
  private count: number;
  private detail = 1;
  private ratioStep = 0;
  private maxRatio = 1;
  private shedding = true;
  private overBudgetFor = 0;
  private underBudgetFor = 0;
  private running = false;
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private sinceReport = 0;

  constructor({ canvas, max, count, onStats, onShed }: LabOptions) {
    this.max = max;
    this.count = count;
    this.onStats = onStats;
    this.onShed = onShed;

    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x05080f, 1);
    this.maxRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.ratioStep = RATIOS.findIndex((ratio) => ratio <= this.maxRatio);
    if (this.ratioStep < 0) this.ratioStep = RATIOS.length - 1;
    this.camera.position.set(0, 1.15, 4.35);
    this.camera.lookAt(0, 0, 0);

    const rng = mulberry32(31);
    const positions = new Float32Array(max * 3);
    const seeds = new Float32Array(max * 2);
    for (let i = 0; i < max; i++) {
      // A disc with a soft edge: dense enough to look like something, cheap to generate.
      const radius = 0.45 + Math.sqrt(rng()) * 1.75;
      const angle = rng() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (rng() + rng() - 1) * 0.26 * (1.1 - radius * 0.3);
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      seeds[i * 2] = rng();
      seeds[i * 2 + 1] = rng();
    }
    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("aSeed", new BufferAttribute(seeds, 2));
    this.geometry.setDrawRange(0, count);

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 13 },
        uPixelRatio: { value: 1 },
        uNear: { value: new Color("#7ce7ff") },
        uFar: { value: new Color("#3d7bff") },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uSize;
        uniform float uPixelRatio;
        attribute vec2 aSeed;
        varying float vDepth;
        varying float vTwinkle;

        void main() {
          float radius = length(position.xz);
          // Inner rings turn faster, like anything that orbits.
          float angle = atan(position.z, position.x) + uTime * (0.42 / (radius + 0.35));
          vec3 p = vec3(cos(angle) * radius, position.y + sin(uTime * 0.7 + aSeed.x * 6.2831) * 0.05, sin(angle) * radius);
          vec4 view = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * view;
          gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed.y * 0.75) / -view.z;
          vDepth = clamp((radius - 0.4) / 1.9, 0.0, 1.0);
          vTwinkle = 0.65 + 0.35 * sin(uTime * (1.1 + aSeed.y * 2.0) + aSeed.x * 24.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uNear;
        uniform vec3 uFar;
        varying float vDepth;
        varying float vTwinkle;

        void main() {
          float r = length(gl_PointCoord - 0.5);
          float disc = 1.0 - smoothstep(0.32, 0.5, r);
          if (disc <= 0.0) discard;
          vec3 color = mix(uNear, uFar, vDepth);
          gl_FragColor = vec4(color, disc * vTwinkle * 0.3);
          #include <colorspace_fragment>
        }
      `,
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  /** The GPU behind this canvas, as the driver reports it. */
  adapter(): string {
    const gl = this.renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    const parts = name.replace(/^ANGLE \(|\)$/g, "").split(",").map((part) => part.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  }

  resize(width: number, height: number): void {
    this.renderer.setPixelRatio(RATIOS[this.ratioStep]);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
  }

  setCount(count: number): void {
    this.count = Math.min(count, this.max);
    this.detail = 1;
    this.geometry.setDrawRange(0, this.count);
    this.reset();
  }

  setShedding(on: boolean): void {
    this.shedding = on;
    if (!on) {
      this.detail = 1;
      this.geometry.setDrawRange(0, this.count);
    }
    this.reset();
  }

  /** Discard the samples taken while things were changing. */
  private reset(): void {
    this.frames = [];
    this.warmUp = WARM_UP;
    this.overBudgetFor = 0;
    this.underBudgetFor = 0;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.reset();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame(now);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame(now: number): void {
    const delta = now - this.last;
    this.last = now;
    // A tab that was hidden or a long GC pause says nothing about the GPU.
    if (delta > 200) return;
    this.elapsed += delta / 1000;
    this.material.uniforms.uTime.value = this.elapsed;
    this.renderer.render(this.scene, this.camera);

    if (this.warmUp > 0) {
      this.warmUp -= 1;
      return;
    }

    this.frames.push(delta);
    if (this.frames.length > WINDOW) this.frames.shift();
    this.recent.push(delta);
    if (this.recent.length > 120) this.recent.shift();

    this.sinceReport += delta;
    if (this.sinceReport < 200 || this.frames.length < 30) return;
    this.sinceReport = 0;

    const sorted = [...this.frames].sort((a, b) => a - b);
    const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
    const p95 = at(0.95);
    const average = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;

    this.onStats({
      fps: Math.round(1000 / average),
      p50: at(0.5),
      p95,
      p99: at(0.99),
      count: Math.round(this.count * this.detail),
      pixelRatio: this.renderer.getPixelRatio(),
      drawCalls: this.renderer.info.render.calls,
      recent: [...this.recent],
    });

    this.adapt(p95);
  }

  /** Give up quality in a fixed order while the budget is broken; take it back when it isn't. */
  private adapt(p95: number): void {
    if (!this.shedding) return;

    if (p95 > OVER) {
      this.underBudgetFor = 0;
      this.overBudgetFor += 1;
      if (this.overBudgetFor < 4) return;
      this.overBudgetFor = 0;

      if (RATIOS[this.ratioStep] > 1) {
        this.ratioStep += 1;
        this.onShed(`p95 ${p95.toFixed(1)} ms over budget → pixel ratio ${RATIOS[this.ratioStep].toFixed(2)}`);
        this.resizeToCanvas();
      } else if (this.detail > 0.3) {
        this.detail = Math.max(0.3, this.detail - 0.25);
        this.geometry.setDrawRange(0, Math.floor(this.count * this.detail));
        this.onShed(`p95 ${p95.toFixed(1)} ms over budget → drawing ${Math.round(this.detail * 100)}% of the field`);
      } else {
        this.onShed(`p95 ${p95.toFixed(1)} ms: nothing left to shed at this count`);
      }
      this.reset();
      return;
    }

    if (p95 >= UNDER) return;
    this.overBudgetFor = 0;
    this.underBudgetFor += 1;
    if (this.underBudgetFor < 12) return;
    this.underBudgetFor = 0;

    if (this.detail < 1) {
      this.detail = Math.min(1, this.detail + 0.25);
      this.geometry.setDrawRange(0, Math.floor(this.count * this.detail));
      this.onShed(`p95 ${p95.toFixed(1)} ms, headroom → back to ${Math.round(this.detail * 100)}% of the field`);
      this.reset();
    } else if (RATIOS[this.ratioStep] < this.maxRatio) {
      this.ratioStep -= 1;
      this.onShed(`p95 ${p95.toFixed(1)} ms, headroom → pixel ratio ${RATIOS[this.ratioStep].toFixed(2)}`);
      this.resizeToCanvas();
      this.reset();
    }
  }

  private resizeToCanvas(): void {
    const canvas = this.renderer.domElement;
    this.resize(canvas.clientWidth, canvas.clientHeight);
  }

  dispose(): void {
    this.stop();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
