import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  NeutralToneMapping,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Layer } from "@/content/layers";
import { clamp, damp, lerp } from "@/lib/math";
import { mulberry32 } from "@/lib/random";
import type { TierSettings } from "./quality";
import { boundingRadius, fitDistance, framingFor, gapFor, PLATE, PLATE_COUNT, plateY } from "./stack/layout";
import { createBackdropMaterial, createDustMaterial, createFloorMaterial, createLights } from "./stack/materials";
import { Stack } from "./stack/Stack";
import { stage, stageHover } from "./stageState";

/** A long lens: little distortion, so the object reads as clean and flat-lit. */
const FOV = 26;
/** How far the floor sits below the lowest plate. */
const FLOOR_DROP = 0.5;
const TURN = Math.PI * 2;

export interface StageOptions {
  canvas: HTMLCanvasElement;
  layers: Layer[];
  /** One label per plate; positioned every frame beside its plate. */
  labels: (HTMLElement | null)[];
  tier: TierSettings;
  reducedMotion: boolean;
  /** CSS font-family list for the small labels etched into the glass. */
  font: string;
  /** Called about twice a second with the measured frame rate. */
  onStats?: (fps: number, pixelRatio: number) => void;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * The 3D stage behind the home page: the stack of glass plates on a glossy
 * floor, lit like a product film. Plain three.js with named imports.
 */
export class Stage {
  private readonly renderer: WebGLRenderer;
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  private readonly scene = new Scene();
  private readonly lights = createLights();
  private readonly stack: Stack;
  private readonly backdrop: Mesh<PlaneGeometry, ReturnType<typeof createBackdropMaterial>>;
  private readonly floor: Mesh<PlaneGeometry, ReturnType<typeof createFloorMaterial>>;
  private readonly dust: Points<BufferGeometry, ReturnType<typeof createDustMaterial>>;
  private readonly dustCount: number;
  private readonly labels: (HTMLElement | null)[];
  private readonly reducedMotion: boolean;
  private readonly raycaster = new Raycaster();
  private readonly plane = new Plane(new Vector3(0, 1, 0), 0);
  private readonly hit = new Vector3();
  private readonly local = new Vector3();
  private readonly anchor = new Vector3();
  private readonly ndc = new Vector2();
  private readonly onStats?: StageOptions["onStats"];
  private statsFrames = 0;
  private statsElapsed = 0;
  private maxPixelRatio: number;
  private width = 1;
  private height = 1;
  private time = 0;
  private entranceAt: number | null = null;

  private readonly live = {
    x: 0.36,
    y: 0.08,
    fillV: 0.74,
    fillH: 0.5,
    elevation: 0.46,
    yaw: -0.62,
    presence: 1,
    explode: 0,
    spin: 0,
    azimuth: 0,
    tilt: 0,
    lamp: 0,
    dive: 0,
    focus: new Array<number>(PLATE_COUNT).fill(0),
    hover: new Array<number>(PLATE_COUNT).fill(0),
    // Frame-time monitor for adaptive quality.
    watched: 0,
    frames: 0,
    sampled: 0,
    degraded: 0,
  };

  constructor({ canvas, layers, labels, tier, reducedMotion, font, onStats }: StageOptions) {
    this.labels = labels;
    this.onStats = onStats;
    this.reducedMotion = reducedMotion;
    this.maxPixelRatio = tier.maxPixelRatio;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.setClearColor(0x020308, 1);

    this.backdrop = new Mesh(new PlaneGeometry(2, 2), createBackdropMaterial());
    this.backdrop.frustumCulled = false;
    this.backdrop.renderOrder = -100;

    this.floor = new Mesh(new PlaneGeometry(60, 60), createFloorMaterial(this.lights));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.renderOrder = -60;

    this.stack = new Stack({
      layers,
      lights: this.lights,
      renderer: this.renderer,
      textureSize: tier.textureSize,
      font,
      reflection: tier.reflection,
    });

    this.dustCount = tier.dust;
    const rng = mulberry32(7);
    const positions = new Float32Array(this.dustCount * 3);
    const seeds = new Float32Array(this.dustCount * 4);
    for (let i = 0; i < this.dustCount; i++) {
      positions[i * 3] = (rng() - 0.5) * 10;
      positions[i * 3 + 1] = rng() * 7 - 3;
      positions[i * 3 + 2] = (rng() - 0.5) * 8 - 0.5;
      for (let j = 0; j < 4; j++) seeds[i * 4 + j] = rng();
    }
    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    dustGeometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));
    this.dust = new Points(dustGeometry, createDustMaterial(13, reducedMotion));
    this.dust.frustumCulled = false;
    this.dust.renderOrder = 60;

    this.scene.add(this.backdrop, this.floor, this.stack.reflection, this.stack.group, this.dust);
  }

  /** Compile shaders and upload textures before the first frame, off the main thread where possible. */
  async prepare(): Promise<void> {
    for (const plate of this.stack.plates) this.renderer.initTexture(plate.texture);
    await this.renderer.compileAsync(this.scene, this.camera);
  }

  /** Start the plates' entrance, optionally after a delay in seconds. */
  enter(delay = 0): void {
    this.entranceAt = this.time + delay;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxPixelRatio));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.backdrop.material.uniforms.uAspect.value = width / height;
  }

  /** Advance and draw one frame. `delta` is in seconds. */
  frame(delta: number): void {
    const dt = Math.min(delta, 1 / 20);
    this.time += dt;
    const t = this.time;
    const l = this.live;
    const aspect = this.width / this.height;
    const portrait = aspect < 0.9;
    const view = stage.view;
    const framing = framingFor(view, aspect);
    // With reduced motion, everything settles at once instead of drifting.
    const rate = this.reducedMotion ? 40 : 1;
    const ease = (current: number, target: number, lambda: number) => damp(current, target, lambda * rate, dt);

    l.x = ease(l.x, framing.x, 2.2);
    l.y = ease(l.y, framing.y, 2.2);
    l.fillV = ease(l.fillV, framing.fillV, 2.2);
    l.fillH = ease(l.fillH, framing.fillH, 2.2);
    l.elevation = ease(l.elevation, framing.elevation, 2);
    l.yaw = ease(l.yaw, framing.yaw, 2);
    l.presence = ease(l.presence, framing.presence, 2.4);
    l.explode = ease(l.explode, view === "hero" ? stage.heroProgress : framing.explode, 3.2);
    // The dive is scrubbed by scroll, so it follows directly rather than easing.
    l.dive = view === "dive" ? stage.diveProgress : damp(l.dive, 0, 4, dt);
    const dive = l.dive;
    const gap = gapFor(l.explode) * (1 + dive * 1.5);

    // Entrance: the plates land one by one, foundation first.
    const since = this.entranceAt === null ? -1 : t - this.entranceAt;
    const entry = (index: number) => {
      if (this.reducedMotion) return since >= 0 ? 1 : 0;
      const order = PLATE_COUNT - 1 - index;
      return easeOutQuart(clamp((since - order * 0.14) / 1.3, 0, 1));
    };
    const settle = this.reducedMotion ? (since >= 0 ? 1 : 0) : easeOutQuart(clamp(since / 3, 0, 1));

    // Drag, then glide, then settle back to the composed pose.
    if (!stage.dragging) {
      stage.spin += stage.spinVelocity * dt;
      stage.spinVelocity *= Math.exp(-dt * 2.4);
      if (Math.abs(stage.spinVelocity) < 0.3) {
        stage.spin = damp(stage.spin, Math.round(stage.spin / TURN) * TURN, 1.4, dt);
      }
    }
    l.spin = damp(l.spin, stage.spin, 10, dt);
    const sway = !this.reducedMotion && (view === "hero" || view === "contact") ? Math.sin(t * 0.21) * 0.2 : 0;
    const yaw = l.yaw + sway + l.spin;

    const pointerOn = stage.pointer.active && !this.reducedMotion;
    l.azimuth = ease(l.azimuth, pointerOn ? stage.pointer.x * 0.08 : 0, 2);
    l.tilt = ease(l.tilt, pointerOn ? -stage.pointer.y * 0.04 : 0, 2);

    // Camera: fit the stack to its share of the screen, then shift the
    // picture so the stack sits beside (or above) the copy.
    const framed = fitDistance(boundingRadius(gap), FOV, aspect, l.fillV, l.fillH) * (1 + (1 - settle) * 0.22);
    // Falling through the stack: the camera drops to the core and levels out.
    const distance = lerp(framed, 1.15, dive);
    const elevation = lerp(l.elevation + l.tilt + (1 - settle) * 0.1, 0.06, dive);
    const float = this.reducedMotion ? 0 : Math.sin(t * 0.8) * 0.03;
    this.camera.position.set(
      Math.sin(l.azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance + float,
      Math.cos(l.azimuth) * Math.cos(elevation) * distance,
    );
    this.camera.lookAt(0, float + lerp(0, plateY(PLATE_COUNT - 1, gap), dive), 0);
    this.camera.setViewOffset(this.width, this.height, (-l.x * this.width) / 2, (l.y * this.height) / 2, this.width, this.height);

    // The stack
    const group = this.stack.group;
    group.position.set(0, -(1 - l.presence) * 1.6, 0);
    group.rotation.set(0, yaw, 0);
    group.updateMatrixWorld();

    // Toward the camera and to its left, in the stack's own frame. A focused
    // plate slides out toward the copy that describes it.
    const relative = l.azimuth - yaw;
    const slideX = portrait ? Math.sin(relative) * 0.5 : Math.sin(relative) * 0.3 - Math.cos(relative) * 0.75;
    const slideZ = portrait ? Math.cos(relative) * 0.5 : Math.cos(relative) * 0.3 + Math.sin(relative) * 0.75;

    const hovered = this.pick(pointerOn && l.presence > 0.5 && (view === "hero" || view === "capabilities"));
    stageHover.set(hovered);

    const focusing = view === "capabilities" && stage.focus >= 0;
    let focusMix = 0;
    for (let i = 0; i < PLATE_COUNT; i++) {
      l.focus[i] = ease(l.focus[i], focusing && stage.focus === i ? 1 : 0, 3.6);
      l.hover[i] = ease(l.hover[i], hovered === i ? 1 : 0, 7);
      focusMix = Math.max(focusMix, l.focus[i]);
    }

    l.lamp = ease(l.lamp, pointerOn ? 1 : 0, 3);
    for (let i = 0; i < PLATE_COUNT; i++) {
      const plate = this.stack.plates[i];
      const arrived = entry(i);
      // Plates above a focused one lift away from it; plates below drop.
      let open = 0;
      for (let j = 0; j < PLATE_COUNT; j++) {
        if (j > i) open += l.focus[j] * 0.24;
        if (j < i) open -= l.focus[j] * 0.12;
      }
      const slide = l.focus[i];
      plate.root.position.set(
        slideX * slide,
        plateY(i, gap) + open + l.hover[i] * 0.06 + (1 - arrived) * 2.6,
        slideZ * slide,
      );
      plate.root.updateMatrixWorld();

      // Diving dims everything except the core we are falling toward.
      const dimmed = lerp(1, 0.36, focusMix) * lerp(1, i === PLATE_COUNT - 1 ? 1.15 : 0.25, dive);
      const u = plate.uniforms;
      u.uBrightness.value = l.presence * arrived * lerp(dimmed, 1.12, l.focus[i]) * (1 + l.hover[i] * 0.25);
      u.uOpacity.value = l.presence * arrived;
      u.uHighlight.value = Math.max(l.focus[i], l.hover[i]);
      u.uCursorOn.value = l.lamp;
    }
    const floorY = plateY(PLATE_COUNT - 1, gap) - PLATE.thickness / 2 - FLOOR_DROP;
    this.floor.position.y = floorY;
    this.lights.uFloorY.value = floorY;
    this.aimLamps(floorY);
    this.stack.syncReflection(floorY);

    // Stage
    const backdrop = this.backdrop.material.uniforms;
    backdrop.uCenter.value.set((l.x + 1) / 2, (l.y + 1) / 2 + 0.04, 0);
    backdrop.uFade.value = settle * (0.4 + 0.6 * l.presence);
    const floor = this.floor.material.uniforms;
    floor.uCenter.value.set(group.position.x, 0, group.position.z);
    floor.uPresence.value = l.presence * settle;
    floor.uCursorOn.value = l.lamp * l.presence;
    const dust = this.dust.material.uniforms;
    dust.uTime.value = t;
    dust.uOpacity.value = settle;
    dust.uPixelRatio.value = this.renderer.getPixelRatio();
    this.lights.uTime.value = this.reducedMotion ? 0 : t;

    this.placeLabels(portrait, focusing, entry);
    this.renderer.render(this.scene, this.camera);
    this.report(delta);
    this.adapt(delta);
  }

  /** Frame rate, twice a second, for the engineering readout. */
  private report(delta: number): void {
    if (!this.onStats || delta > 0.25) return;
    this.statsFrames += 1;
    this.statsElapsed += delta;
    if (this.statsElapsed < 0.5) return;
    this.onStats(Math.round(this.statsFrames / this.statsElapsed), this.renderer.getPixelRatio());
    this.statsFrames = 0;
    this.statsElapsed = 0;
  }

  /** Which plate is under the pointer, top plate first. */
  private pick(enabled: boolean): number {
    if (!enabled) return -1;
    this.raycaster.setFromCamera(this.ndc.set(stage.pointer.x, stage.pointer.y), this.camera);
    const half = PLATE.size / 2;
    for (let i = 0; i < PLATE_COUNT; i++) {
      const root = this.stack.plates[i].root;
      this.plane.constant = -(root.getWorldPosition(this.hit).y + PLATE.thickness / 2);
      if (!this.raycaster.ray.intersectPlane(this.plane, this.hit)) continue;
      root.worldToLocal(this.local.copy(this.hit));
      if (Math.abs(this.local.x) <= half && Math.abs(this.local.z) <= half) return i;
    }
    return -1;
  }

  /** Put each plate's cursor lamp where the pointer's ray crosses that plate. */
  private aimLamps(floorY: number): void {
    if (!stage.pointer.active) return;
    this.raycaster.setFromCamera(this.ndc.set(stage.pointer.x, stage.pointer.y), this.camera);
    for (const plate of this.stack.plates) {
      this.plane.constant = -(plate.root.getWorldPosition(this.hit).y + PLATE.thickness / 2);
      if (this.raycaster.ray.intersectPlane(this.plane, this.hit)) plate.uniforms.uCursor.value.copy(this.hit);
    }
    const floorLamp = this.floor.material.uniforms.uCursor.value;
    this.plane.constant = -floorY;
    if (this.raycaster.ray.intersectPlane(this.plane, this.hit)) floorLamp.copy(this.hit);
  }

  /** Labels float beside each plate's outer corner once the stack opens. */
  private placeLabels(portrait: boolean, focusing: boolean, entry: (index: number) => number): void {
    const l = this.live;
    const view = stage.view;
    const shown =
      !portrait && (view === "hero" || view === "capabilities")
        ? smoothstep(0.45, 0.9, l.explode) * l.presence * (1 - smoothstep(0, 0.15, this.live.dive))
        : 0;

    for (let i = 0; i < PLATE_COUNT; i++) {
      const label = this.labels[i];
      if (!label) continue;
      const opacity = shown * entry(i) * (focusing ? lerp(0.42, 1, l.focus[i]) : 1);
      if (opacity < 0.01) {
        if (label.style.opacity !== "0") label.style.opacity = "0";
        continue;
      }
      const root = this.stack.plates[i].root;
      this.anchor.set(PLATE.size / 2, PLATE.thickness / 2, -PLATE.size / 2);
      root.localToWorld(this.anchor).project(this.camera);
      const x = ((this.anchor.x + 1) / 2) * this.width;
      const y = ((1 - this.anchor.y) / 2) * this.height;
      label.style.opacity = opacity.toFixed(3);
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      label.dataset.active = String(l.focus[i] > 0.5 || l.hover[i] > 0.5);
    }
  }

  /**
   * If frames run slow once the page has settled, lower the pixel ratio,
   * then drop the reflection, then thin the dust. Long gaps (a hidden tab, a
   * paused stage) say nothing about speed, so they're ignored.
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
    if (average < 1 / 45) return;

    const ratio = this.renderer.getPixelRatio();
    if (ratio > 1.01) {
      this.maxPixelRatio = Math.max(1, ratio - 0.25);
      this.resize(this.width, this.height);
    } else if (this.stack.reflection.visible) {
      this.stack.reflection.visible = false;
    } else if (l.degraded < 1) {
      l.degraded += 1;
      this.dust.geometry.setDrawRange(0, Math.floor(this.dustCount * 0.4));
    }
  }

  dispose(): void {
    this.stack.dispose();
    this.backdrop.geometry.dispose();
    this.backdrop.material.dispose();
    this.floor.geometry.dispose();
    this.floor.material.dispose();
    this.dust.geometry.dispose();
    this.dust.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
