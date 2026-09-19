import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { clamp, damp } from "@/lib/math";
import { scene, SEQUENCE } from "./sceneState";
import { particleFragmentShader, particleVertexShader } from "./shaders";
import { CORE_SPIN_AXIS, generateShape, mulberry32, type ShapeId } from "./shapes";

const SEEDS: Record<ShapeId, number> = {
  field: 11,
  browser: 23,
  devices: 37,
  network: 41,
  database: 53,
  core: 67,
};

/** Widest shape, in world units; used to fit shapes to the room beside the copy. */
const SHAPE_SPAN = 4.2;
const FOV = 40;
const CAMERA_Z = 6;

export interface ParticleSceneOptions {
  canvas: HTMLCanvasElement;
  count: number;
  pointSize: number;
  maxPixelRatio: number;
  reducedMotion: boolean;
}

/**
 * One draw call: a cloud of points whose positions morph between procedural
 * shapes as the page scrolls. Plain three.js with named imports, so only the
 * parts of the library this scene uses end up in the bundle.
 */
export class ParticleScene {
  private readonly renderer: WebGLRenderer;
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 40);
  private readonly root = new Scene();
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;
  private readonly points: Points;
  private readonly shapes: BufferAttribute[];
  private readonly count: number;
  private readonly reducedMotion: boolean;
  private maxPixelRatio: number;
  private elapsed = 0;

  private readonly live = {
    morph: scene.morph,
    pair: 0,
    opacity: 0,
    x: 0,
    y: 0,
    scale: 1,
    scaleX: 1,
    rotX: 0,
    rotY: 0,
    pointerX: 99,
    pointerY: 99,
    pointerForce: 0,
    // Frame-time monitor for adaptive quality.
    watched: 0,
    frames: 0,
    sampled: 0,
    degraded: 0,
  };

  constructor({ canvas, count, pointSize, maxPixelRatio, reducedMotion }: ParticleSceneOptions) {
    this.count = count;
    this.reducedMotion = reducedMotion;
    this.maxPixelRatio = maxPixelRatio;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, CAMERA_Z);

    // One GPU buffer per shape, uploaded once. Morphing only swaps which two
    // buffers feed `aFrom` and `aTo`, so changing shape never re-uploads data.
    const cache = new Map<ShapeId, BufferAttribute>();
    this.shapes = SEQUENCE.map((id) => {
      let buffer = cache.get(id);
      if (!buffer) {
        buffer = new BufferAttribute(generateShape(id, count, SEEDS[id]), 4);
        cache.set(id, buffer);
      }
      return buffer;
    });

    const rng = mulberry32(99);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rng();
    this.geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry.setAttribute("aFrom", this.shapes[0]);
    this.geometry.setAttribute("aTo", this.shapes[1]);
    this.geometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));

    this.material = new ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSize: { value: pointSize },
        uPixelRatio: { value: 1 },
        uSwirl: { value: reducedMotion ? 0 : 1 },
        uPointer: { value: new Vector3(99, 99, 0) },
        uPointerForce: { value: 0 },
        uSpinFrom: { value: 0 },
        uSpinTo: { value: 0 },
        uSpinAxis: { value: new Vector3(...CORE_SPIN_AXIS) },
        uColor: { value: new Color("#d7e3ea") },
        uAccent: { value: new Color("#6fe6ff") },
        uOpacity: { value: 0 },
      },
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.root.add(this.points);
  }

  /** Compiles the shader without blocking the main thread where supported. */
  async prepare(): Promise<void> {
    await this.renderer.compileAsync(this.root, this.camera);
  }

  resize(width: number, height: number): void {
    const ratio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Advance and draw one frame. `delta` is in seconds. */
  frame(delta: number): void {
    const dt = Math.min(delta, 1 / 20);
    this.elapsed += dt;
    const l = this.live;
    const u = this.material.uniforms;
    const t = this.elapsed;

    // The visible slice of the z = 0 plane, in world units.
    const vh = 2 * Math.tan(((FOV / 2) * Math.PI) / 180) * CAMERA_Z;
    const aspect = this.camera.aspect;
    const vw = vh * aspect;
    const portrait = aspect < 0.9;

    // Where along the sequence we are, and which two shapes that sits between.
    // With reduced motion, shapes swap whole instead of flowing into each other.
    l.morph = this.reducedMotion ? Math.round(scene.morph) : damp(l.morph, scene.morph, 2.4, dt);
    const last = SEQUENCE.length - 1;
    const m = clamp(l.morph, 0, last);
    const pair = Math.min(Math.floor(m), last - 1);
    if (pair !== l.pair) {
      this.geometry.setAttribute("aFrom", this.shapes[pair]);
      this.geometry.setAttribute("aTo", this.shapes[pair + 1]);
      l.pair = pair;
    }
    const progress = m - pair;
    u.uSpinFrom.value = SEQUENCE[pair] === "core" ? 1 : 0;
    u.uSpinTo.value = SEQUENCE[pair + 1] === "core" ? 1 : 0;
    u.uProgress.value = progress;

    l.opacity = damp(l.opacity, scene.opacity, 2.2, dt);
    u.uOpacity.value = l.opacity;

    // Layout: beside the copy on wide screens, above it on tall ones. Shapes
    // fit the room they have; the dust field stretches to cover any view.
    const side = scene.layout === "side";
    const room = side && !portrait ? vw * 0.4 : vw * 0.9;
    const fit = clamp(room / SHAPE_SPAN, 0.42, 1.15);
    const scaleOf = (id: ShapeId) => (id === "field" ? [clamp(aspect / 1.78, 0.32, 1.3), 1] : [fit, fit]);
    const [fromX, fromY] = scaleOf(SEQUENCE[pair]);
    const [toX, toY] = scaleOf(SEQUENCE[pair + 1]);
    l.x = damp(l.x, side && !portrait ? vw * 0.255 : 0, 2.6, dt);
    l.y = damp(l.y, side && portrait ? vh * 0.17 : 0, 2.6, dt);
    l.scaleX = damp(l.scaleX, fromX + (toX - fromX) * progress, 3, dt);
    l.scale = damp(l.scale, fromY + (toY - fromY) * progress, 3, dt);
    this.points.position.set(l.x, l.y, 0);
    this.points.scale.set(l.scaleX, l.scale, l.scale);

    const swayY = this.reducedMotion ? 0 : Math.sin(t * 0.17) * 0.26;
    const swayX = this.reducedMotion ? 0 : Math.sin(t * 0.13) * 0.07;
    l.rotY = damp(l.rotY, swayY + scene.pointer.x * 0.22, 2, dt);
    l.rotX = damp(l.rotX, swayX - scene.pointer.y * 0.12, 2, dt);
    this.points.rotation.set(l.rotX, l.rotY, 0);

    const pointerOn = scene.pointer.active && !this.reducedMotion;
    l.pointerX = damp(l.pointerX, (scene.pointer.x * vw) / 2, 9, dt);
    l.pointerY = damp(l.pointerY, (scene.pointer.y * vh) / 2, 9, dt);
    l.pointerForce = damp(l.pointerForce, pointerOn ? 1 : 0, 4, dt);
    u.uPointer.value.set(l.pointerX, l.pointerY, 0);
    u.uPointerForce.value = l.pointerForce;

    u.uTime.value = this.reducedMotion ? 0 : t;
    u.uPixelRatio.value = this.renderer.getPixelRatio();

    this.renderer.render(this.root, this.camera);
    this.adapt(delta);
  }

  /**
   * If frames run slow once the page has settled, lower the pixel ratio, then
   * draw fewer particles. Long gaps (a hidden tab, a paused scene) say nothing
   * about speed, so they're ignored.
   */
  private adapt(delta: number): void {
    const l = this.live;
    if (delta > 0.25) return;
    l.watched += delta;
    if (l.watched < 3) return;
    l.frames += 1;
    l.sampled += delta;
    if (l.sampled < 2) return;
    const average = l.sampled / l.frames;
    l.frames = 0;
    l.sampled = 0;
    if (average < 1 / 42) return;

    const ratio = this.renderer.getPixelRatio();
    if (ratio > 1.01) {
      this.maxPixelRatio = Math.max(1, ratio - 0.25);
      const size = this.renderer.getSize(new Vector2());
      this.resize(size.x, size.y);
    } else if (l.degraded < 2) {
      l.degraded += 1;
      this.geometry.setDrawRange(0, Math.floor(this.count * (l.degraded === 1 ? 0.65 : 0.4)));
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
