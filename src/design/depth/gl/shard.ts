import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  Sphere,
  Sprite,
  SpriteMaterial,
  Vector2,
  WebGLRenderer,
  type IUniform,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { detectTier, TIERS, type Tier } from "@/gl/quality";

/**
 * The hero's centrepiece: a sphere fractured into polished metal shards around
 * a molten core. Drag orbits it, and scrolling over it zooms — pull in and the
 * shards part and the camera slips inside to the glowing core, push out and it
 * closes back to a whole sphere. Idle, it turns slowly on its own. A studio
 * environment map gives the facets their sheen without shipping an HDRI.
 */

const CORE = new Color(0xff2f45); // the hot core, the one warm note on the page
const SHARD = new Color(0x14141a);

export interface ShardSphereOptions {
  canvas: HTMLCanvasElement;
  tier?: Tier;
  /** Reports how far the sphere is zoomed in, 0 (rest) → 1 (full), each frame. */
  onProgress?: (open: number) => void;
}

export class ShardSphere {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly shards: Mesh;
  private readonly core: Mesh;
  private readonly glow: Sprite;
  private readonly light: PointLight;
  private readonly shardMat: MeshPhysicalMaterial;

  private uExplode: IUniform = { value: 0 };
  private uTime: IUniform = { value: 0 };

  private readonly reduced: boolean;
  private raf = 0;
  private running = false;
  private disposed = false;
  private last = 0;
  private time = 0;

  // Orbit + zoom state, driven by drag and wheel.
  private azimuth = 0.6;
  private polar = Math.PI / 2;
  private azVel = 0;
  private poVel = 0;
  private dist = 8;
  private targetDist = 8;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private idle = 0;
  private readonly minDist = 0.55;
  private readonly maxDist = 11;
  private readonly raycaster = new Raycaster();
  private readonly hitSphere = new Sphere(undefined, 1.75);
  private readonly ndc = new Vector2();
  private cleanupControls: () => void = () => {};
  private readonly onProgress?: (open: number) => void;
  private lastW = 0;
  private lastH = 0;

  constructor({ canvas, tier = detectTier(), onProgress }: ShardSphereOptions) {
    const settings = TIERS[tier];
    this.onProgress = onProgress;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.maxPixelRatio));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.camera = new PerspectiveCamera(36, 1, 0.1, 100);
    // Pulled back so the sphere sits smaller and centred in its box.
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);

    // Studio image-based lighting, generated on the fly — no asset to load.
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // ── The shards: an icosphere whose every face becomes a SOLID chunk with
    // real thickness (an outer plate, an inner plate, and walls between), so it
    // reads as broken armour rather than paper triangles. ──
    const detail = tier === "high" ? 3 : 2;
    const geo = this.buildShards(1.42, 0.7, detail);

    this.shardMat = new MeshPhysicalMaterial({
      color: SHARD,
      metalness: 0.5,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.7,
      flatShading: true,
      side: DoubleSide, // so the shards still read once the camera is inside
    });
    this.shardMat.onBeforeCompile = (shader) => {
      shader.uniforms.uExplode = this.uExplode;
      shader.uniforms.uTime = this.uTime;
      // Only the position is displaced; flat shading derives every face normal
      // from the moved geometry in the fragment stage, so the lighting stays
      // correct on the outer plate, the walls and the inner plate alike.
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          attribute vec3 aCentroid;
          attribute vec3 aAxis;
          attribute float aSeed;
          uniform float uExplode;
          uniform float uTime;
          mat3 rotAxis(vec3 ax, float a){
            ax = normalize(ax);
            float s = sin(a), c = cos(a), t = 1.0 - c;
            return mat3(
              t*ax.x*ax.x+c,      t*ax.x*ax.y-s*ax.z, t*ax.x*ax.z+s*ax.y,
              t*ax.x*ax.y+s*ax.z, t*ax.y*ax.y+c,      t*ax.y*ax.z-s*ax.x,
              t*ax.x*ax.z-s*ax.y, t*ax.y*ax.z+s*ax.x, t*ax.z*ax.z+c
            );
          }
        `,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `
          float amt = uExplode * (0.5 + aSeed * 1.0);
          // Mostly translate outward with only a little tumble, so the shell
          // blooms open cleanly and leaves radial gaps onto the core.
          mat3 R = rotAxis(aAxis, amt * 0.8);
          vec3 dir = normalize(aCentroid);
          vec3 transformed = R * (position - aCentroid) + aCentroid + dir * amt * 1.35;
        `,
        );
    };
    this.shards = new Mesh(geo, this.shardMat);
    this.scene.add(this.shards);

    // ── The molten core: an inner shell of glowing shards the cracks reveal.
    // Each facet flickers on its own, so the interior reads as live heat rather
    // than a smooth painted ball. ──
    const coreGeo = this.buildShards(0.96, 0.52, detail);
    const coreMat = new MeshStandardMaterial({
      color: 0x2a0206,
      emissive: CORE,
      emissiveIntensity: 2.0,
      roughness: 0.55,
      metalness: 0.1,
      flatShading: true,
    });
    coreMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.uTime;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          attribute float aSeed;
          uniform float uTime;
          varying float vHeat;
          varying vec3 vN;
          varying vec3 vVp;
        `,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          // Per-facet heat, each on its own phase, plus a slow global surge.
          vHeat = 0.5 + 0.5 * sin(uTime * 1.4 + aSeed * 6.2831);
          vHeat = mix(0.55, 1.35, vHeat) * (0.85 + 0.3 * sin(uTime * 0.8));
        `,
        )
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `#include <beginnormal_vertex>
          vN = normalize(normalMatrix * objectNormal);
          vVp = (modelViewMatrix * vec4(position, 1.0)).xyz;
        `,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          varying float vHeat;
          varying vec3 vN;
          varying vec3 vVp;
        `,
        )
        .replace(
          "#include <emissivemap_fragment>",
          /* glsl */ `#include <emissivemap_fragment>
          // Hotter facets, and a white-hot bloom toward the centre of each face.
          float fres = pow(1.0 - abs(dot(normalize(vN), normalize(-vVp))), 2.5);
          totalEmissiveRadiance *= vHeat;
          totalEmissiveRadiance += vec3(1.0, 0.55, 0.4) * fres * vHeat * 0.55;
        `,
        );
    };
    this.core = new Mesh(coreGeo, coreMat);
    this.scene.add(this.core);

    // A soft additive halo so the core reads as light, not just a red ball.
    this.glow = new Sprite(
      new SpriteMaterial({ map: this.makeGlow(), color: CORE, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 }),
    );
    this.glow.scale.set(4.8, 4.8, 1);
    this.scene.add(this.glow);

    // The core lights the inner walls of the shards red as they open.
    this.light = new PointLight(CORE, 9, 11, 2);
    this.scene.add(this.light);
    // A hard white key for the glossy speculars, and a cool rim from behind to
    // separate the shard silhouettes from the dark — the studio look.
    const key = new DirectionalLight(0xffffff, 1.9);
    key.position.set(3, 4, 5);
    this.scene.add(key);
    const rim = new DirectionalLight(0x5468ff, 1.1);
    rim.position.set(-4, -1, -3);
    this.scene.add(rim);

    this.attachControls(canvas);
    this.resize();
  }

  /**
   * Drag to orbit, scroll to zoom. The wheel only takes over when the cursor is
   * actually over the sphere (a ray test against its bounds) so the page still
   * scrolls normally everywhere else — no scroll trap, and no instructions
   * needed on screen.
   */
  private attachControls(canvas: HTMLCanvasElement) {
    if (this.reduced) return;

    const setNdc = (event: PointerEvent | WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    };

    const onDown = (event: PointerEvent) => {
      setNdc(event);
      this.raycaster.setFromCamera(this.ndc, this.camera);
      if (!this.raycaster.ray.intersectsSphere(this.hitSphere)) return; // let the page have the drag
      this.dragging = true;
      this.idle = 0;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.azVel = -dx * 0.006;
      this.poVel = -dy * 0.006;
      this.azimuth += this.azVel;
      this.polar = MathUtils.clamp(this.polar + this.poVel, 0.25, Math.PI - 0.25);
    };
    const onUp = (event: PointerEvent) => {
      this.dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      setNdc(event);
      this.raycaster.setFromCamera(this.ndc, this.camera);
      if (!this.raycaster.ray.intersectsSphere(this.hitSphere)) return; // page scrolls
      event.preventDefault();
      this.idle = 0;
      this.targetDist = MathUtils.clamp(this.targetDist + event.deltaY * 0.01, this.minDist, this.maxDist);
    };

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    this.cleanupControls = () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }

  /**
   * Turn an icosphere into a shell of solid chunks. Every face becomes an outer
   * plate on the sphere, an inner plate pulled toward the centre, and three
   * walls joining them — so each shard has thickness and catches light on
   * several faces. Each carries its triangle's centroid, a random spin axis and
   * a seed, shared by all its vertices so it moves as one rigid piece.
   */
  private buildShards(radius: number, innerScale: number, detail: number): BufferGeometry {
    const base = new IcosahedronGeometry(radius, detail).toNonIndexed();
    const src = base.getAttribute("position");
    const faces = src.count / 3;
    base.dispose();

    const positions: number[] = [];
    const centroid: number[] = [];
    const axis: number[] = [];
    const seed: number[] = [];

    const push = (v: number[], cx: number, cy: number, cz: number, ax: number, ay: number, az: number, s: number) => {
      positions.push(v[0], v[1], v[2]);
      centroid.push(cx, cy, cz);
      axis.push(ax, ay, az);
      seed.push(s);
    };

    for (let f = 0; f < faces; f++) {
      const a = f * 3;
      const o0 = [src.getX(a), src.getY(a), src.getZ(a)];
      const o1 = [src.getX(a + 1), src.getY(a + 1), src.getZ(a + 1)];
      const o2 = [src.getX(a + 2), src.getY(a + 2), src.getZ(a + 2)];
      const i0 = [o0[0] * innerScale, o0[1] * innerScale, o0[2] * innerScale];
      const i1 = [o1[0] * innerScale, o1[1] * innerScale, o1[2] * innerScale];
      const i2 = [o2[0] * innerScale, o2[1] * innerScale, o2[2] * innerScale];

      const cx = (o0[0] + o1[0] + o2[0]) / 3;
      const cy = (o0[1] + o1[1] + o2[1]) / 3;
      const cz = (o0[2] + o1[2] + o2[2]) / 3;
      let rx = Math.random() * 2 - 1;
      let ry = Math.random() * 2 - 1;
      let rz = Math.random() * 2 - 1;
      const len = Math.hypot(rx, ry, rz) || 1;
      rx /= len;
      ry /= len;
      rz /= len;
      const s = Math.random();
      const p = (v: number[]) => push(v, cx, cy, cz, rx, ry, rz, s);

      // outer plate
      p(o0); p(o1); p(o2);
      // inner plate (reversed winding, faces inward)
      p(i0); p(i2); p(i1);
      // three walls, each a quad split into two triangles
      p(o0); p(o1); p(i1); p(o0); p(i1); p(i0);
      p(o1); p(o2); p(i2); p(o1); p(i2); p(i1);
      p(o2); p(o0); p(i0); p(o2); p(i0); p(i2);
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute("aCentroid", new BufferAttribute(new Float32Array(centroid), 3));
    geo.setAttribute("aAxis", new BufferAttribute(new Float32Array(axis), 3));
    geo.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 1));
    geo.computeVertexNormals();
    return geo;
  }

  private makeGlow(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,90,110,0.9)");
    g.addColorStop(0.6, "rgba(255,47,69,0.25)");
    g.addColorStop(1, "rgba(255,47,69,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    if (this.reduced) {
      this.uExplode.value = 0.14;
      this.renderer.render(this.scene, this.camera);
      this.running = false;
      return;
    }
    this.last = performance.now();
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frame(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame(dt: number) {
    this.time += dt;
    this.uTime.value = this.time;
    this.idle += dt;

    // Orbit: drag spins it, released it coasts, and after a moment of quiet it
    // resumes a slow turn of its own.
    if (!this.dragging) {
      this.azimuth += this.azVel;
      this.polar = MathUtils.clamp(this.polar + this.poVel, 0.25, Math.PI - 0.25);
      this.azVel *= 0.92;
      this.poVel *= 0.92;
      if (this.idle > 1.2) this.azimuth += dt * 0.12;
    }

    // Zoom eases toward its target. How far in the camera is decides how far the
    // shell opens — pull in and it blooms apart to let you inside.
    this.dist += (this.targetDist - this.dist) * Math.min(1, dt * 4);
    const open = MathUtils.clamp((8 - this.dist) / 7.45, 0, 1); // 0 rest → 1 at the centre
    // `deep` rises as the camera passes through the shell toward the centre,
    // reaching 1 at the very middle, so we can close the shell into a dome and
    // shrink the core to a point.
    const deep = MathUtils.clamp((1.8 - this.dist) / 1.25, 0, 1);
    this.onProgress?.(open);
    // The shell parts on the way in, then closes back into a continuous dome
    // around you once you're inside — a faceted sky seen from its centre.
    this.uExplode.value = 0.06 + 0.03 * Math.sin(this.time * 0.6) + open * 0.34 * (1 - deep);

    // Keep the render matched to the box as it grows to fill the screen.
    const cw = this.renderer.domElement.clientWidth;
    const ch = this.renderer.domElement.clientHeight;
    if (cw !== this.lastW || ch !== this.lastH) {
      this.lastW = cw;
      this.lastH = ch;
      this.resize();
    }

    // The core pulses and swells into the opening. Zoomed in, the soft halo
    // dims so the molten facets read clearly instead of washing to a red blob.
    const pulse = 1 + 0.05 * Math.sin(this.time * 1.6);
    // Reaching the centre, the core shrinks to a small central sun so it never
    // blocks the view of the surrounding dome; the point light brightens to lay
    // its glow across the inner walls.
    this.core.scale.setScalar(pulse * (0.05 + (1 - deep) * 0.95));
    this.glow.scale.setScalar(4.6 * (1 - deep * 0.55));
    (this.glow.material as SpriteMaterial).opacity = 0.8 * (1 - open * 0.3) * (1 - deep * 0.85);
    this.light.intensity = 7 + open * 3 + deep * 9 + Math.sin(this.time * 1.6) * 0.6;
    this.core.rotation.y -= dt * 0.1;

    // Widen the lens as you sink to the centre, so the dome wraps around the
    // view like a real sky rather than a narrow telephoto patch.
    const fov = MathUtils.lerp(36, 82, deep);
    if (Math.abs(this.camera.fov - fov) > 0.02) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    // Place the camera on its orbit and look at the heart of the sphere; near
    // the centre the far inner wall fills the view — the sky from the ground.
    const sinP = Math.sin(this.polar);
    this.camera.position.set(
      this.dist * sinP * Math.sin(this.azimuth),
      this.dist * Math.cos(this.polar),
      this.dist * sinP * Math.cos(this.azimuth),
    );
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.reduced) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.cleanupControls();
    this.shards.geometry.dispose();
    this.shardMat.dispose();
    this.core.geometry.dispose();
    (this.core.material as MeshStandardMaterial).dispose();
    (this.glow.material as SpriteMaterial).map?.dispose();
    (this.glow.material as SpriteMaterial).dispose();
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}
