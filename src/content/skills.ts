// Lines marked `AETHRA:` are hidden while Aethra is still being built. To bring
// it back, uncomment them, delete the line each one replaced, and set
// `showFeatured` in projects.ts to true. `grep -rn AETHRA: src` lists them all.

/**
 * Skills, each with the work that proves it. No self-assessed percentages:
 * a bar filled to 80% is a number with no scale under it, and it tells a
 * reader less than "shipped at Zyrone Energy" does.
 */

/** `production` shipped for a company or client; `project` built in my own work. */
export type SkillLevel = "production" | "project";

export interface Skill {
  name: string;
  level: SkillLevel;
  /** Where it was used. Every one of these appears elsewhere on the site. */
  proof: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    name: "Frontend",
    skills: [
      { name: "React", level: "production", proof: "Tech Kshatriyas · Comfort Floors · TaskFlow" },
      { name: "Next.js", level: "production", proof: "Vectorsoft · this site" },
      // AETHRA: { name: "TypeScript", level: "production", proof: "Vectorsoft · Aethra · this site" },
      { name: "TypeScript", level: "production", proof: "Vectorsoft · wedding invitation · this site" },
      { name: "JavaScript", level: "production", proof: "JNTUACEP site · every project here" },
      { name: "Tailwind CSS", level: "production", proof: "Comfort Floors · Agnikula · this site" },
      { name: "HTML & CSS", level: "production", proof: "JNTUACEP site · client builds" },
      // AETHRA: { name: "Three.js", level: "project", proof: "Aethra avatar · the stack on this page" },
      { name: "Three.js", level: "project", proof: "Wedding invitation · the globe and stack on this site" },
      { name: "GSAP", level: "project", proof: "Scroll choreography on this site" },
      { name: "WebGL shaders", level: "project", proof: "Glass, etching and dust on this page" },
      { name: "HarfBuzz text shaping", level: "project", proof: "Arabic and Urdu calligraphy in the wedding invitation" },
      { name: "Chart.js", level: "project", proof: "Network Traffic Analyser" },
      { name: "SCSS", level: "project", proof: "Web Medical Management" },
    ],
  },
  {
    id: "devices",
    name: "Mobile & desktop",
    skills: [
      { name: "Flutter", level: "production", proof: "Zyrone Energy · Vectorsoft · SuperCabs" },
      { name: "Dart", level: "production", proof: "Zyrone Energy · SuperCabs" },
      // AETHRA: { name: "Tauri", level: "production", proof: "Vectorsoft desktop integrations · Aethra" },
      { name: "Tauri", level: "production", proof: "Vectorsoft desktop integrations" },
      { name: "Electron", level: "project", proof: "Medcare: billing on the clinic's counter machine" },
      // AETHRA: { name: "Rust", level: "project", proof: "Aethra device layer: screen, input, shell, UI tree" },
      { name: "Zoom Video SDK", level: "production", proof: "Vectorsoft" },
    ],
  },
  {
    id: "backend",
    name: "Backend & real-time",
    skills: [
      { name: "Node.js", level: "production", proof: "Tech Kshatriyas · TaskFlow" },
      { name: "NestJS", level: "production", proof: "Zyrone Energy · Agnikula" },
      { name: "Express", level: "production", proof: "TaskFlow · Network Traffic Analyser" },
      // AETHRA: { name: "Bun & Elysia", level: "production", proof: "Vectorsoft · Aethra backend" },
      { name: "Bun & Elysia", level: "production", proof: "Vectorsoft" },
      { name: "REST APIs", level: "production", proof: "Zyrone Energy operations modules" },
      // AETHRA: { name: "WebSockets", level: "project", proof: "Aethra task loop" },
      { name: "Firebase Cloud Messaging", level: "production", proof: "Zyrone Energy · SuperCabs" },
      { name: "JWT & role-based access", level: "project", proof: "TaskFlow · G-Mart" },
      { name: "PHP", level: "project", proof: "Web Medical Management" },
    ],
  },
  {
    id: "data",
    name: "Data",
    skills: [
      { name: "MongoDB", level: "project", proof: "TaskFlow · G-Mart" },
      { name: "PostgreSQL", level: "project", proof: "event_analysis pipeline" },
      { name: "MySQL", level: "project", proof: "Web Medical Management" },
      // AETHRA: { name: "SQLite", level: "project", proof: "Aethra long-term memory · Medcare records on-machine" },
      { name: "SQLite", level: "project", proof: "Medcare records on the clinic's machine" },
      { name: "Firebase", level: "production", proof: "Zyrone Energy · SuperCabs" },
      // AETHRA: { name: "Vector search", level: "project", proof: "Aethra: embeddings, cosine similarity" },
    ],
  },
  {
    id: "ai",
    name: "AI",
    skills: [
      // AETHRA: { name: "Gemini", level: "project", proof: "Aethra cloud fallback" },
      // AETHRA: { name: "Ollama", level: "project", proof: "Aethra local models, no account needed" },
      // AETHRA: { name: "Embeddings & RAG", level: "project", proof: "Aethra memory retrieval" },
      // AETHRA: { name: "Agent tooling", level: "project", proof: "44 tools behind one permission gate" },
      { name: "scikit-learn", level: "project", proof: "Medical recommendation classifier" },
      { name: "pandas", level: "project", proof: "Symptom dataset preparation" },
      { name: "Python", level: "project", proof: "Flask service · dataset work" },
    ],
  },
  {
    id: "practice",
    name: "Tooling & practice",
    skills: [
      { name: "Git & GitHub Actions", level: "project", proof: "CI on this repository" },
      { name: "Vitest", level: "project", proof: "39 tests here · 61 on the wedding invitation" },
      { name: "Vite", level: "project", proof: "Wedding invitation: build, subset fonts, generated art" },
      // AETHRA: { name: "Playwright", level: "project", proof: "Aethra browser automation" },
      { name: "Docker Compose", level: "project", proof: "event_analysis pipeline" },
      { name: "Performance budgets", level: "production", proof: "99/100 PageSpeed · 99% SEO" },
      { name: "Accessibility", level: "project", proof: "100 on this site, keyboard and reduced motion" },
      { name: "Vercel & Railway", level: "project", proof: "Deployments for this site and TaskFlow" },
    ],
  },
];

/** What this very site runs on, with versions a reader can check against package.json. */
export const siteStack: { name: string; version: string; role: string }[] = [
  { name: "Next.js", version: "16.3.5", role: "App Router, every route prerendered as static HTML" },
  { name: "React", version: "19.2", role: "Server components; view transitions between pages" },
  { name: "TypeScript", version: "5", role: "Strict, no `any` in the source" },
  { name: "Tailwind CSS", version: "4", role: "Design tokens as CSS variables" },
  { name: "three.js", version: "0.186", role: "The stack, floor and dust, in custom shaders" },
  { name: "GSAP", version: "3.15", role: "ScrollTrigger and SplitText, on one shared ticker" },
  { name: "Lenis", version: "1.3", role: "Smooth scroll, off in Lite mode and for reduced motion" },
  { name: "Vitest", version: "5", role: "Content integrity and layout maths" },
];
