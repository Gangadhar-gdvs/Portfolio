import {
  CanvasTexture,
  ExtrudeGeometry,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  PlaneGeometry,
  Shape,
  type ShaderMaterial,
  type WebGLRenderer,
} from "three";
import type { Layer } from "@/content/layers";
import { drawPlate } from "./etch";
import { createEtchMaterial, createGlassMaterial, createPlateUniforms, type Lights, type PlateUniforms } from "./materials";
import { PLATE } from "./layout";

function roundedSquare(size: number, radius: number): Shape {
  const h = size / 2;
  const r = radius;
  const shape = new Shape();
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h);
  shape.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(h, h - r);
  shape.absarc(h - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-h + r, h);
  shape.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-h, -h + r);
  shape.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/** A thin glass tile with rounded corners and a bevelled edge, centred on the origin. */
function createPlateGeometry(): ExtrudeGeometry {
  const depth = PLATE.thickness - PLATE.bevel * 2;
  const geometry = new ExtrudeGeometry(roundedSquare(PLATE.size - PLATE.bevel * 2, PLATE.radius - PLATE.bevel), {
    depth,
    bevelEnabled: true,
    bevelThickness: PLATE.bevel,
    bevelSize: PLATE.bevel,
    bevelSegments: 4,
    curveSegments: 14,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -depth / 2, 0);
  return geometry;
}

export interface Plate {
  /** Moves the plate and its etching together. */
  root: Group;
  /** The reflection's copy of `root`, below the floor. */
  mirror: Group;
  uniforms: PlateUniforms;
  materials: ShaderMaterial[];
  texture: CanvasTexture;
}

export interface StackOptions {
  layers: Layer[];
  lights: Lights;
  renderer: WebGLRenderer;
  textureSize: number;
  font: string;
  reflection: boolean;
}

/**
 * Five glass plates, one per layer of the stack, and their reflection.
 * The stage moves them; this class only builds and owns them.
 */
export class Stack {
  readonly group = new Group();
  readonly reflection = new Group();
  readonly plates: Plate[];
  private readonly geometries: (ExtrudeGeometry | PlaneGeometry)[];

  constructor({ layers, lights, renderer, textureSize, font, reflection }: StackOptions) {
    const glassGeometry = createPlateGeometry();
    const etchGeometry = new PlaneGeometry(PLATE.size, PLATE.size);
    etchGeometry.rotateX(-Math.PI / 2);
    this.geometries = [glassGeometry, etchGeometry];

    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const count = layers.length;
    // The reflection mirrors the stack, so it's drawn in the opposite order.
    this.reflection.scale.y = -1;
    this.reflection.visible = reflection;

    this.plates = layers.map((layer, index) => {
      const texture = new CanvasTexture(drawPlate(layer.id, index, layer.short, textureSize, font));
      texture.anisotropy = anisotropy;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.generateMipmaps = true;

      const uniforms = createPlateUniforms();
      const phase = index / count;
      const materials: ShaderMaterial[] = [];

      const build = (mirror: boolean) => {
        const root = new Group();
        const glassMaterial = createGlassMaterial(lights, uniforms, mirror);
        const etchMaterial = createEtchMaterial(lights, uniforms, texture, phase, mirror);
        materials.push(glassMaterial, etchMaterial);

        const glass = new Mesh(glassGeometry, glassMaterial);
        const etch = new Mesh(etchGeometry, etchMaterial);
        etch.position.y = PLATE.thickness / 2 + 0.0015;

        // Back to front: the camera always looks down on the stack, so the
        // lowest plate is furthest away. Its reflection is the other way up.
        const depth = mirror ? index : count - 1 - index;
        const base = mirror ? -40 : 0;
        glass.renderOrder = base + depth * 2;
        etch.renderOrder = base + depth * 2 + 1;
        root.add(glass, etch);
        return root;
      };

      const root = build(false);
      const mirror = build(true);
      this.group.add(root);
      this.reflection.add(mirror);
      return { root, mirror, uniforms, materials, texture };
    });
  }

  /** Copy each plate's transform onto its reflection. */
  syncReflection(floorY: number): void {
    this.reflection.position.set(this.group.position.x, 2 * floorY - this.group.position.y, this.group.position.z);
    this.reflection.rotation.copy(this.group.rotation);
    for (const plate of this.plates) {
      plate.mirror.position.copy(plate.root.position);
      plate.mirror.rotation.copy(plate.root.rotation);
    }
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const plate of this.plates) {
      plate.texture.dispose();
      for (const material of plate.materials) material.dispose();
    }
  }
}
