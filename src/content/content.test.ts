import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { architecture, architectureLayouts, evaluateGate, sampleTools } from "./aethra";
import { decisions, incident, measured, optimisations } from "./engineering";
import { siteStack, skillGroups } from "./skills";
import { roles } from "./experience";
import { layers } from "./layers";
import { profile } from "./profile";
import { clientSites, featured, projects } from "./projects";

const everything = {
  profile,
  layers,
  projects,
  featured,
  clientSites,
  roles,
  architecture,
  sampleTools,
  skillGroups,
  siteStack,
  measured,
  optimisations,
  incident,
  decisions,
};

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

  it("gives every layer a distinct short name for its plate", () => {
    const names = layers.map((l) => l.short);
    expect(new Set(names).size).toBe(layers.length);
    for (const name of names) expect(name.length).toBeLessThanOrEqual(14);
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

  it("only point previews at images that exist", () => {
    const previews = [...projects, ...clientSites].flatMap((item) => (item.preview ? [item.preview.src] : []));
    expect(previews.length).toBeGreaterThan(0);
    for (const src of previews) {
      expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    }
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

describe("skills", () => {
  const skills = skillGroups.flatMap((group) => group.skills);

  it("names every skill once", () => {
    const names = skills.map((skill) => skill.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("backs every skill with where it was used", () => {
    for (const skill of skills) {
      expect(skill.proof.length).toBeGreaterThan(6);
      expect(["production", "project"]).toContain(skill.level);
    }
  });

  it("gives every group at least three skills", () => {
    for (const group of skillGroups) expect(group.skills.length).toBeGreaterThanOrEqual(3);
  });

  it("pins a version and a reason for everything in this site's stack", () => {
    for (const item of siteStack) {
      expect(item.version).toMatch(/^\d/);
      expect(item.role.length).toBeGreaterThan(10);
    }
  });
});

describe("engineering", () => {
  it("scores every Lighthouse run in all four categories", () => {
    for (const run of measured.lighthouse) {
      expect(run.scores).toHaveLength(measured.categories.length);
      for (const score of run.scores) {
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("says how the numbers were taken", () => {
    expect(measured.how).toMatch(/Lighthouse/);
    expect(measured.takenOn).toMatch(/2026/);
  });

  it("gives every optimisation a before, an after and a method", () => {
    for (const item of optimisations) {
      expect(item.before).not.toBe(item.after);
      expect(item.unit.length).toBeGreaterThan(3);
      expect(item.how.length).toBeGreaterThan(40);
    }
  });

  it("writes the incident up as symptom, cause, fix and prevention", () => {
    const labels = incident.entries.map((entry) => entry.label);
    expect(labels.slice(0, 3)).toEqual(["Symptom", "Cause", "Fix"]);
    expect(labels).toContain("Prevention");
    for (const entry of incident.entries) expect(entry.body.length).toBeGreaterThan(40);
  });

  it("records the alternative that each decision turned down", () => {
    for (const item of decisions) {
      expect(item.instead.length).toBeGreaterThan(8);
      expect(item.why.length).toBeGreaterThan(40);
      expect(item.result.length).toBeGreaterThan(8);
    }
  });
});
