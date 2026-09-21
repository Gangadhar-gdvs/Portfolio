// Lines marked `AETHRA:` are hidden while Aethra is still being built. To bring
// it back, uncomment them, delete the line each one replaced, and set
// `showFeatured` in projects.ts to true. `grep -rn AETHRA: src` lists them all.

export type LayerId = "interface" | "devices" | "services" | "data" | "intelligence";

export interface Evidence {
  /** Where the proof comes from: a company or a project. */
  source: string;
  detail: string;
}

export interface Layer {
  id: LayerId;
  /** The discipline, as it would appear on a CV. */
  name: string;
  /** Short name for tight spaces: the plate labels and the etching on the glass. */
  short: string;
  summary: string;
  evidence: Evidence[];
  tools: string[];
}

/**
 * The stack from the surface down to the core. The order is the point:
 * each discipline sits underneath the one before it.
 */
export const layers: Layer[] = [
  {
    id: "interface",
    name: "Frontend Engineering",
    short: "Interface",
    summary: "Fast, accessible web apps in React and Next.js that rank well and stay easy to change.",
    evidence: [
      { source: "Tech Kshatriyas", detail: "99/100 PageSpeed on the web experiences I built" },
      { source: "Vectorsoft", detail: "99% SEO score on responsive web builds" },
      { source: "Comfort Floors, Ireland", detail: "Custom web app that automates their core operations" },
    ],
    tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js"],
  },
  {
    id: "devices",
    name: "Mobile & Desktop Apps",
    short: "Devices",
    summary: "Cross-platform mobile apps in Flutter, and desktop apps in Tauri with native Rust underneath.",
    evidence: [
      { source: "SuperCabs", detail: "Flutter and Firebase rental app with OTP sign-up and push notifications" },
      // AETHRA: { source: "Aethra", detail: "One Rust interface for screen, mouse, keyboard, shell and UI trees, per operating system" },
      { source: "Vectorsoft", detail: "Tauri desktop integrations, Flutter apps and the Zoom Video SDK" },
    ],
    tools: ["Flutter", "Dart", "Tauri", "Rust", "Capacitor", "Electron"],
  },
  {
    id: "services",
    name: "Backend & Real-time Systems",
    short: "Services",
    // AETHRA: summary: "APIs, WebSockets, authentication and push notifications that keep products running.",
    summary: "APIs, authentication and push notifications that keep products running.",
    evidence: [
      { source: "Zyrone Energy", detail: "6 real-time modules that replaced manual workflows, on NestJS and Firebase Cloud Messaging" },
      { source: "TaskFlow", detail: "JWT auth with role-based access and a live analytics dashboard" },
      // AETHRA: { source: "Aethra", detail: "WebSocket task loop on Bun and Elysia, with Swagger-documented routes" },
    ],
    // AETHRA: tools: ["Node.js", "NestJS", "Express", "Bun", "Elysia", "WebSockets", "Firebase"],
    tools: ["Node.js", "NestJS", "Express", "Bun", "Elysia", "Firebase"],
  },
  {
    id: "data",
    name: "Data & Storage",
    short: "Data",
    // AETHRA: summary: "Schemas, queries and pipelines, from MongoDB and PostgreSQL to vectors in on-device SQLite.",
    summary: "Schemas, queries and pipelines, from MongoDB and PostgreSQL to SQLite on the machine itself.",
    evidence: [
      // AETHRA: { source: "Aethra", detail: "Long-term memory stored as vectors in local SQLite and searched by cosine similarity" },
      { source: "event_analysis", detail: "Event generator into PostgreSQL, SQL analysis and charts, all in Docker Compose" },
      { source: "G-Mart and TaskFlow", detail: "MongoDB models for products, orders, projects and tasks" },
    ],
    tools: ["MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Firebase"],
  },
  {
    id: "intelligence",
    // AETHRA: name: "AI Agents & LLM Systems",
    name: "AI & Machine Learning",
    short: "Intelligence",
    // AETHRA: summary: "Agents that plan, remember and use tools, behind a permission system that decides what they may do.",
    summary: "Models that turn data into a decision: a symptom classifier prepared, trained, evaluated and served end to end.",
    evidence: [
      // AETHRA: { source: "Aethra", detail: "44 tools behind one fail-closed permission gate" },
      // AETHRA: { source: "Aethra", detail: "Local models through Ollama, Gemini as fallback, background subagents for long tasks" },
      { source: "Medical recommendation", detail: "Support-vector classifier that maps symptoms to conditions, served with Flask" },
      { source: "Medical recommendation", detail: "Symptom dataset prepared in pandas; the model built and evaluated in a Jupyter notebook" },
    ],
    // AETHRA: tools: ["Gemini", "Ollama", "OpenAI", "RAG", "Embeddings", "Python", "scikit-learn"],
    tools: ["Python", "scikit-learn", "pandas", "Flask", "Jupyter"],
  },
];
