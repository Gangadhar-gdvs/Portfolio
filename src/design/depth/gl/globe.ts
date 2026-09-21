import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { detectTier, TIERS, type Tier } from "@/gl/quality";
import { LIGHTS, LIGHT_SIZES } from "./lights";
import { BORDERS, COAST } from "./world";

/**
 * A world built out of what I know.
 *
 * Every skill in `src/content/skills.ts` is a place on this globe: laid out on
 * a Fibonacci sphere so nothing clumps, coloured by discipline, and joined to
 * the rest of its discipline by arcs when you touch it. The globe is the
 * content — not an illustration of it — so when a skill is added to the
 * content file, a new place appears here.
 */

export interface GlobeSkill {
  id: string;
  name: string;
  group: string;
  groupName: string;
  level: "production" | "project";
  proof: string;
}

export interface GlobeFilter {
  group: string | null;
  level: "production" | "project" | null;
}

interface Place {
  skill: GlobeSkill;
  position: Vector3;
  sprite: Sprite;
  /** Width over height of the label, so it can be rescaled without squashing. */
  aspect: number;
  /** 0 filtered out, 1 in play. Eased, so filtering is a movement not a jump. */
  presence: number;
}

export interface GlobeOptions {
  canvas: HTMLCanvasElement;
  skills: GlobeSkill[];
  colours: Record<string, string>;
  tier?: Tier;
  onHover?: (skill: GlobeSkill | null) => void;
  onSelect?: (skill: GlobeSkill | null) => void;
}

const MIN_ZOOM = 2.15;
const MAX_ZOOM = 5.2;
/* World units for a label's height. The globe has radius 1, so this is small
   on purpose: a name should sit on the surface, not wrap around it. */
const LABEL_SCALE = 0.076;

/** Fibonacci sphere: the cheapest way to scatter n points evenly on a ball. */
function fibonacci(index: number, total: number): Vector3 {
  const offset = 2 / total;
  const increment = Math.PI * (3 - Math.sqrt(5));
  const y = index * offset - 1 + offset / 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = index * increment;
  return new Vector3(Math.cos(phi) * radius, y, Math.sin(phi) * radius);
}

/** A round dot. Points render as squares without one. */
function dotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.85)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

function labelTexture(text: string, colour: string, level: "production" | "project") {
  const scale = 2;
  const font = `${level === "production" ? 600 : 500} ${26 * scale}px ui-sans-serif, system-ui, sans-serif`;
  const measure = document.createElement("canvas").getContext("2d");
  if (measure) measure.font = font;
  const width = Math.ceil((measure?.measureText(text).width ?? text.length * 15 * scale) + 26 * scale);
  const height = 44 * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { texture: new CanvasTexture(canvas), aspect: width / height };

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // A dot in the discipline's colour, then the name. Production work is set
  // brighter than a personal project: the difference should be visible.
  const dotX = 13 * scale;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(dotX, height / 2, 4.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = level === "production" ? "#ffffff" : "#c7c1d2";
  ctx.fillText(text, width / 2 + 6 * scale, height / 2 + 1);

  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 4;
  return { texture, aspect: width / height };
}

export class SkillGlobe {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly world = new Group();
  private readonly places: Place[] = [];
  private readonly arcs: LineSegments;
  private readonly colours: Record<string, string>;
  private readonly onHover?: (skill: GlobeSkill | null) => void;
  private readonly onSelect?: (skill: GlobeSkill | null) => void;

  private frame = 0;
  private running = false;
  private disposed = false;

  private rotation = { x: 0.16, y: 0 };
  private target = { x: 0.16, y: 0 };
  private velocity = { x: 0, y: 0 };
  private dragging = false;
  private pinch = 0;
  private zoom = 4.4;
  private zoomTarget = 3.1;
  private idle = 0;
  private hovered: Place | null = null;
  private selected: Place | null = null;
  private filter: GlobeFilter = { group: null, level: null };
  private pointer = { x: 0, y: 0, active: false };
  private touched = false;

  constructor({ canvas, skills, colours, tier = detectTier(), onHover, onSelect }: GlobeOptions) {
    this.colours = colours;
    this.onHover = onHover;
    this.onSelect = onSelect;

    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: tier !== "low" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, TIERS[tier].maxPixelRatio));

    this.camera = new PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.z = this.zoom;

    this.scene.add(this.world);
    this.buildShell();

    // One dot per skill, all in a single draw call.
    const dots = new Float32Array(skills.length * 3);
    const dotColours = new Float32Array(skills.length * 3);
    const colour = new Color();

    skills.forEach((skill, index) => {
      const position = fibonacci(index, skills.length);
      dots.set([position.x, position.y, position.z], index * 3);
      colour.set(colours[skill.group] ?? "#ffffff");
      dotColours.set([colour.r, colour.g, colour.b], index * 3);

      const { texture, aspect } = labelTexture(skill.name, colours[skill.group] ?? "#ffffff", skill.level);
      const sprite = new Sprite(
        new SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 }),
      );
      sprite.scale.set(LABEL_SCALE * aspect, LABEL_SCALE, 1);
      sprite.position.copy(position).multiplyScalar(1.055);
      sprite.renderOrder = 2;
      this.world.add(sprite);

      this.places.push({ skill, position, sprite, aspect, presence: 1 });
    });

    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute("position", new BufferAttribute(dots, 3));
    dotGeometry.setAttribute("color", new BufferAttribute(dotColours, 3));
    const points = new Points(
      dotGeometry,
      new PointsMaterial({
        size: 0.05,
        map: dotTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        alphaTest: 0.02,
      }),
    );
    this.world.add(points);

    // Arcs between skills in the same discipline, drawn only when one is touched.
    this.arcs = new LineSegments(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: AdditiveBlending }),
    );
    this.arcs.renderOrder = 1;
    this.world.add(this.arcs);

    this.resize();
  }

  /** The globe itself: the world's land as a dot matrix, a glow shell and a core. */
  private buildShell() {
    // The core is opaque and drawn first: it writes depth, so the land just
    // outside it survives, and the far side of the world stays hidden.
    const core = new Mesh(
      new SphereGeometry(0.975, 48, 32),
      new MeshBasicMaterial({ color: 0x0b0910 }),
    );
    this.world.add(core);

    // The world itself: Natural Earth's coastlines, and every border between
    // two countries, as real line geometry on the sphere.
    const coast = new LineSegments(
      new BufferGeometry().setAttribute("position", new BufferAttribute(COAST, 3)),
      new LineBasicMaterial({ color: 0xb9b2c6, transparent: true, opacity: 0.9 }),
    );
    this.world.add(coast);

    // The night side: one point per city, its brightness taken from how many
    // people live there — read as a field of stars rather than a wash of
    // sodium light. Small, tight and close to white: additive blending piles
    // up fast, so anywhere dense (the Gangetic plain, the Pearl River delta)
    // would burn out to a single blob if the points were any bigger.
    const lights = new BufferGeometry();
    lights.setAttribute("position", new BufferAttribute(LIGHTS, 3));
    lights.setAttribute("aSize", new BufferAttribute(LIGHT_SIZES, 1));
    const lightField = new Points(
      lights,
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uScale: { value: 1 } },
        vertexShader: `
          attribute float aSize;
          varying float vSize;
          uniform float uScale;
          void main() {
            vSize = aSize;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (0.55 + aSize * 0.42) * uScale * 16.0 / -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vSize;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            if (d > 1.0) discard;
            // A hard little core with a short halo, the way a star reads.
            float core = pow(1.0 - d, 3.6);
            vec3 tint = mix(vec3(0.80, 0.86, 1.0), vec3(1.0, 0.96, 0.88), min(vSize * 0.55, 1.0));
            gl_FragColor = vec4(tint, core * 0.58);
          }
        `,
      }),
    );
    this.world.add(lightField);

    const borders = new LineSegments(
      new BufferGeometry().setAttribute("position", new BufferAttribute(BORDERS, 3)),
      new LineBasicMaterial({ color: 0x6f6880, transparent: true, opacity: 0.55 }),
    );
    this.world.add(borders);

    const glow = new Mesh(
      new SphereGeometry(1.24, 48, 32),
      new MeshBasicMaterial({ color: 0xff6b2c, transparent: true, opacity: 0.055, blending: AdditiveBlending, side: 1 }),
    );
    this.scene.add(glow);
  }

  // ── Interaction ──────────────────────────────────────────────────────

  /** Drag: hands on the globe, with the throw carried over when you let go. */
  drag(dx: number, dy: number) {
    this.touched = true;
    this.dragging = true;
    this.idle = 0;
    this.velocity.y = dx * 0.005;
    this.velocity.x = dy * 0.005;
    this.target.y += this.velocity.y;
    this.target.x = Math.min(Math.max(this.target.x + this.velocity.x, -1.15), 1.15);
  }

  endDrag() {
    this.dragging = false;
  }

  /** Wheel, pinch or the buttons: the same clamped dolly either way. */
  zoomBy(delta: number) {
    this.touched = true;
    this.idle = 0;
    this.zoomTarget = Math.min(Math.max(this.zoomTarget + delta, MIN_ZOOM), MAX_ZOOM);
  }

  setPinch(distance: number) {
    if (this.pinch > 0) this.zoomBy((this.pinch - distance) * 0.01);
    this.pinch = distance;
  }

  endPinch() {
    this.pinch = 0;
  }

  /** Where the pointer is, in clip space, for picking and for the idle tilt. */
  setPointer(x: number, y: number, active: boolean) {
    this.pointer = { x, y, active };
  }

  /** Turn the globe so a skill faces the reader, and keep it there. */
  focus(id: string | null) {
    const place = id ? this.places.find((p) => p.skill.id === id) ?? null : null;
    this.selected = place;
    this.onSelect?.(place?.skill ?? null);
    if (!place) return;

    this.idle = -2200;
    const p = place.position;
    this.target.y = -Math.atan2(p.x, p.z);
    this.target.x = Math.asin(Math.min(Math.max(p.y, -1), 1));
    this.zoomTarget = Math.min(this.zoomTarget, 3.1);
  }

  setFilter(filter: GlobeFilter) {
    this.filter = filter;
  }

  reset() {
    this.target = { x: 0.16, y: 0 };
    this.zoomTarget = 3.1;
    this.selected = null;
    this.idle = 0;
    this.onSelect?.(null);
  }

  /** Keyboard control, so the globe is not a mouse-only object. */
  nudge(dx: number, dy: number) {
    this.touched = true;
    this.idle = -900;
    this.target.y += dx;
    this.target.x = Math.min(Math.max(this.target.x + dy, -1.15), 1.15);
  }

  /** Step to the next place in play, for arrow-key browsing. */
  step(direction: 1 | -1) {
    const inPlay = this.places.filter((place) => this.passes(place));
    if (inPlay.length === 0) return;
    const current = this.selected ? inPlay.findIndex((p) => p === this.selected) : -1;
    const next = inPlay[(current + direction + inPlay.length) % inPlay.length];
    this.focus(next.skill.id);
  }

  private passes(place: Place) {
    if (this.filter.group && place.skill.group !== this.filter.group) return false;
    if (this.filter.level && place.skill.level !== this.filter.level) return false;
    return true;
  }

  /** Picking in screen space: project every place and take the nearest. */
  private pick() {
    if (!this.pointer.active) return null;
    let best: Place | null = null;
    let bestDistance = 0.075;

    for (const place of this.places) {
      if (place.presence < 0.5) continue;
      const projected = place.sprite.position.clone().applyMatrix4(this.world.matrixWorld).project(this.camera);
      if (projected.z > 1) continue;
      const dx = projected.x - this.pointer.x;
      const dy = projected.y - this.pointer.y;
      const distance = Math.hypot(dx, dy * 1.4);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = place;
      }
    }
    return best;
  }

  /** Arcs from the touched place to the rest of its discipline. */
  private drawArcs(place: Place | null) {
    const material = this.arcs.material as LineBasicMaterial;
    if (!place) {
      material.opacity += (0 - material.opacity) * 0.12;
      return;
    }

    const points: number[] = [];
    const colour = new Color(this.colours[place.skill.group] ?? "#ffffff");
    for (const other of this.places) {
      if (other === place || other.skill.group !== place.skill.group || !this.passes(other)) continue;
      const mid = place.position.clone().add(other.position).multiplyScalar(0.5).normalize().multiplyScalar(1.42);
      const curve = new QuadraticBezierCurve3(place.position.clone().multiplyScalar(1.02), mid, other.position.clone().multiplyScalar(1.02));
      const samples = curve.getPoints(18);
      for (let i = 0; i < samples.length - 1; i += 1) {
        points.push(samples[i].x, samples[i].y, samples[i].z, samples[i + 1].x, samples[i + 1].y, samples[i + 1].z);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(points), 3));
    this.arcs.geometry.dispose();
    this.arcs.geometry = geometry;
    material.color = colour;
    material.opacity += (0.5 - material.opacity) * 0.12;
  }

  // ── Loop ─────────────────────────────────────────────────────────────

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
    this.idle += 16;

    // Left alone, it turns by itself — a globe nobody is holding still.
    if (!this.dragging && this.idle > 2400 && !this.selected) this.target.y += 0.0016;

    if (!this.dragging) {
      this.target.y += this.velocity.y;
      this.target.x = Math.min(Math.max(this.target.x + this.velocity.x, -1.15), 1.15);
      this.velocity.x *= 0.92;
      this.velocity.y *= 0.92;
    }

    this.rotation.x += (this.target.x - this.rotation.x) * 0.09;
    this.rotation.y += (this.target.y - this.rotation.y) * 0.09;

    // A little lean towards the cursor, so the thing feels attended to.
    const lean = this.pointer.active && !this.dragging ? this.pointer.x * 0.06 : 0;
    this.world.rotation.set(this.rotation.x, this.rotation.y, 0);
    this.world.position.x = lean;

    this.zoom += (this.zoomTarget - this.zoom) * 0.08;
    this.camera.position.z = this.zoom;
    this.world.updateMatrixWorld();

    const picked = this.dragging ? this.hovered : this.pick();
    if (picked !== this.hovered) {
      this.hovered = picked;
      this.onHover?.(picked?.skill ?? null);
    }

    const shown = this.selected ?? this.hovered;
    this.drawArcs(shown);

    // Labels fade as they turn away, and fade out when filtered away.
    const forward = new Vector3(0, 0, 1);
    for (const place of this.places) {
      const wanted = this.passes(place) ? 1 : 0;
      place.presence += (wanted - place.presence) * 0.12;

      const world = place.position.clone().applyMatrix4(this.world.matrixWorld).normalize();
      const facing = Math.max(0, world.dot(forward));
      const emphasis = place === shown ? 1 : shown && place.skill.group === shown.skill.group ? 0.95 : 0.78;
      const material = place.sprite.material as SpriteMaterial;
      // A floor under the fade: a name on the shoulder of the globe should
      // still be readable, not a rumour.
      material.opacity = (0.16 + 0.84 * Math.pow(facing, 1.25)) * place.presence * emphasis;

      const scale = (place === shown ? 1.55 : 1) * (0.55 + place.presence * 0.45);
      place.sprite.scale.set(LABEL_SCALE * place.aspect * scale, LABEL_SCALE * scale, 1);
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // A tall, narrow canvas needs the globe further away, or the labels at its
    // edges are cut off by the sides of the screen.
    if (!this.touched) this.zoomTarget = width < 700 ? 4.9 : width / height < 1.1 ? 4.2 : 3.1;
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points || object instanceof LineSegments) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
      if (object instanceof Sprite) {
        object.material.map?.dispose();
        object.material.dispose();
      }
    });
    this.renderer.dispose();
  }
}
