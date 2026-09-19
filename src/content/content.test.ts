import { describe, expect, it } from "vitest";
import { SHAPE_IDS } from "@/gl/shapes";
import { architecture, architectureLayouts, evaluateGate, sampleTools } from "./aethra";
import { roles } from "./experience";
import { layers } from "./layers";
import { profile } from "./profile";
import { clientSites, featured, projects } from "./projects";

const everything = { profile, layers, projects, featured, clientSites, roles, architecture, sampleTools };

describe("content", () => {
  it("contains no placeholder copy", () => {
    const text = JSON.stringify(everything);
    expect(text).not.toMatch(/\b(TODO|TBD|FIXME|lorem|ipsum|placeholder)\b/i);
  });

  it("uses https for every external link", () => {
    const hrefs = [
      ...Object.values(profile.links),
      ...projects.flatMap((p) => p.links.map((l) => l.href)),
      ...clientSites.map((c) => c.href),
    ];
    for (const href of hrefs) expect(href).toMatch(/^https:\/\//);
  });

  it("has a valid contact email", () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
  });
});

describe("layers", () => {
  it("runs surface to core through five distinct layers", () => {
    expect(layers.map((l) => l.id)).toEqual(["interface", "devices", "services", "data", "intelligence"]);
  });

  it("maps each layer to its own particle shape", () => {
    const shapes = layers.map((l) => l.shape);
    for (const shape of shapes) expect(SHAPE_IDS).toContain(shape);
    expect(new Set(shapes).size).toBe(layers.length);
  });

  it("backs every layer with evidence and tools", () => {
    for (const layer of layers) {
      expect(layer.evidence.length).toBeGreaterThanOrEqual(2);
      expect(layer.tools.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("projects", () => {
  it("have unique slugs, including the featured one", () => {
    const slugs = [featured.slug, ...projects.map((p) => p.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("each draw a pipeline of at least three steps", () => {
    for (const project of projects) expect(project.flow.length).toBeGreaterThanOrEqual(3);
  });

  it("either link to something or say why they can't", () => {
    for (const project of projects) {
      expect(project.links.length > 0 || Boolean(project.codeNote)).toBe(true);
    }
  });
});

describe("Aethra architecture", () => {
  it("only connects nodes that exist", () => {
    const ids = new Set(architecture.nodes.map((n) => n.id));
    for (const edge of architecture.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }
  });

  it("gives every node a unique slot in each layout", () => {
    for (const layout of Object.values(architectureLayouts)) {
      const slots = architecture.nodes.map((n) => layout.slots[n.id].join(","));
      expect(new Set(slots).size).toBe(slots.length);
      for (const [col, row] of Object.values(layout.slots)) {
        expect(col).toBeLessThan(layout.columns);
        expect(row).toBeLessThan(layout.rows);
      }
    }
  });
});

describe("evaluateGate", () => {
  const registered = { registered: true, defaultAction: "ALLOW" as const };

  it("denies unregistered tools before anything else", () => {
    const result = evaluateGate({
      tool: { registered: false, defaultAction: "ALLOW" },
      cloudDisabled: false,
      localRule: "ALLOW",
    });
    expect(result).toEqual({ decision: "DENY", decidedAt: "registry" });
  });

  it("lets a cloud admin disable a tool everywhere", () => {
    expect(evaluateGate({ tool: registered, cloudDisabled: true, localRule: "ALLOW" })).toEqual({
      decision: "DENY",
      decidedAt: "cloud",
    });
  });

  it("applies a matching local rule over the default", () => {
    expect(evaluateGate({ tool: registered, cloudDisabled: false, localRule: "ASK" })).toEqual({
      decision: "ASK",
      decidedAt: "local",
    });
  });

  it("falls back to the tool's default action", () => {
    expect(evaluateGate({ tool: registered, cloudDisabled: false, localRule: null })).toEqual({
      decision: "ALLOW",
      decidedAt: "default",
    });
  });

  it("marks exactly one sample tool as unregistered", () => {
    expect(sampleTools.filter((t) => !t.registered)).toHaveLength(1);
  });
});
