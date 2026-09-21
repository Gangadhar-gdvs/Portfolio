import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Fog,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { detectTier, TIERS, type Tier } from "@/gl/quality";

/**
 * The shaft the whole page falls down.
 *
 * Rings of rock pass the camera as you scroll, dust drifts up past you, and
 * the light warms as you go: cold at the surface, molten near the core. Scroll
 * velocity drives it, so stopping stops the fall and flicking down accelerates
 * it — the page's motion is the reader's own, not a timeline playing at them.
 *
 * The dust is also the pointer's: it is pushed away from the cursor, which is
 * the one bit of this scene you can touch directly.
 */

const RING_COUNT = 34;
const RING_SPACING = 4.2;
const SURFACE = new Color(0x2a3350);
const CORE = new Color(0xff5a1f);

export interface DescentOptions {
  canvas: HTMLCanvasElement;
  tier?: Tier;
}

export class Descent {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly rings: InstancedMesh;
  private readonly ringMaterial: MeshBasicMaterial;
  private readonly dust: Points;
  private readonly dustPositions: Float32Array;
  private readonly dustSeeds: Float32Array;
  private readonly fog: Fog;
  private readonly count: number;

  private frame = 0;
  private running = false;
  private disposed = false;

  private travelled = 0;
  private velocity = 0;
  private targetVelocity = 0;
  private depth = 0;
  private pointer = new Vector3(0, 0, 0);
  private pointerStrength = 0;

  constructor({ canvas, tier = detectTier() }: DescentOptions) {
    const settings = TIERS[tier];
    this.count = tier === "high" ? 1400 : tier === "mid" ? 900 : 480;

    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.maxPixelRatio));

    this.camera = new PerspectiveCamera(62, 1, 0.1, RING_COUNT * RING_SPACING);
    this.camera.position.set(0, 0, 0);

    this.fog = new Fog(0x07060a, 8, RING_COUNT * RING_SPACING * 0.92);
    this.scene.fog = this.fog;

    // The shaft: rings receding into the dark, recycled as they pass.
    this.ringMaterial = new MeshBasicMaterial({ color: 0x3a3446, transparent: true, opacity: 0.75, fog: true });
    this.rings = new InstancedMesh(new TorusGeometry(6.4, 0.018, 3, 64), this.ringMaterial, RING_COUNT);
    this.scene.add(this.rings);
    this.layoutRings();

    // The dust: pushed up past the falling reader, and away from the cursor.
    this.dustPositions = new Float32Array(this.count * 3);
    this.dustSeeds = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.6 + Math.random() * 5.6;
      this.dustPositions[i * 3] = Math.cos(angle) * radius;
      this.dustPositions[i * 3 + 1] = Math.sin(angle) * radius;
      this.dustPositions[i * 3 + 2] = -Math.random() * RING_COUNT * RING_SPACING;
      this.dustSeeds[i * 3] = 0.25 + Math.random() * 0.9;
      this.dustSeeds[i * 3 + 1] = Math.random() * Math.PI * 2;
      this.dustSeeds[i * 3 + 2] = 0.4 + Math.random() * 1.4;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(this.dustPositions, 3));
    this.dust = new Points(
      geometry,
      new PointsMaterial({
        size: 0.055,
        color: 0xffc89a,
        transparent: true,
        opacity: 0.75,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: true,
      }),
    );
    this.scene.add(this.dust);

    this.resize();
  }

  private layoutRings() {
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();

    for (let i = 0; i < RING_COUNT; i += 1) {
      position.set(0, 0, -i * RING_SPACING);
      const wobble = 0.86 + Math.sin(i * 1.7) * 0.1;
      scale.set(wobble, wobble, 1);
      matrix.compose(position, rotation, scale);
      this.rings.setMatrixAt(i, matrix);
    }
    this.rings.instanceMatrix.needsUpdate = true;
  }

  /** How far down the page is, 0 at the surface and 1 at the core. */
  setDepth(value: number) {
    this.depth = Math.min(Math.max(value, 0), 1);
  }

  /** Scroll movement since the last frame, in pixels. */
  setVelocity(pixels: number) {
    this.targetVelocity = Math.min(Math.max(pixels * 0.02, -3), 9);
  }

  /** Cursor position in clip space; the dust gets out of its way. */
  setPointer(x: number, y: number, active: boolean) {
    this.pointer.set(x * 6.2, y * 4.2, 0);
    this.pointerStrength = active ? 1 : 0;
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.frame = requestAnimationFrame(loop);
      this.render();
    };
    this.frame = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private render() {
    // A slow constant fall, plus whatever the reader is doing to the scrollbar.
    this.velocity += (this.targetVelocity + 0.35 - this.velocity) * 0.06;
    this.targetVelocity *= 0.9;
    this.travelled += this.velocity * 0.06;

    const shaft = RING_COUNT * RING_SPACING;
    const colour = SURFACE.clone().lerp(CORE, Math.pow(this.depth, 1.25));
    this.ringMaterial.color.copy(colour);
    this.fog.color.setRGB(0.03 + this.depth * 0.06, 0.024 + this.depth * 0.018, 0.04 - this.depth * 0.018);
    this.fog.far = shaft * (0.94 - this.depth * 0.25);

    // Rings: move the whole set forward and wrap it, so the shaft never ends.
    this.rings.position.z = (this.travelled % RING_SPACING) * 1;
    this.rings.rotation.z = this.travelled * 0.012;

    // Dust: rises, drifts, and keeps clear of the cursor.
    const positions = this.dustPositions;
    for (let i = 0; i < this.count; i += 1) {
      const ix = i * 3;
      positions[ix + 1] += this.dustSeeds[ix] * 0.012 + this.velocity * 0.004;
      positions[ix] += Math.sin(this.travelled * 0.1 + this.dustSeeds[ix + 1]) * 0.002;
      positions[ix + 2] += this.velocity * 0.06 * this.dustSeeds[ix + 2];

      if (this.pointerStrength > 0 && positions[ix + 2] > -14) {
        const dx = positions[ix] - this.pointer.x;
        const dy = positions[ix + 1] - this.pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 2.4 && distance > 0.001) {
          const push = ((2.4 - distance) / 2.4) * 0.06;
          positions[ix] += (dx / distance) * push;
          positions[ix + 1] += (dy / distance) * push;
        }
      }

      if (positions[ix + 2] > 1.5) positions[ix + 2] -= shaft;
      if (positions[ix + 1] > 6) positions[ix + 1] = -6;
    }
    this.dust.geometry.attributes.position.needsUpdate = true;
    (this.dust.material as PointsMaterial).color.setRGB(1, 0.78 - this.depth * 0.18, 0.6 - this.depth * 0.3);

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.rings.geometry.dispose();
    this.ringMaterial.dispose();
    this.dust.geometry.dispose();
    (this.dust.material as PointsMaterial).dispose();
    this.scene.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose();
    });
    this.renderer.dispose();
  }
}
