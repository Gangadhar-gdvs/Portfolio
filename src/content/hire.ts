/**
 * The two ways to work with Gangadhara, each on its own page so neither
 * dilutes the other: `/hire` speaks to a recruiter filling a full-time role,
 * `/freelance` speaks to a founder or business paying for a build. Both draw
 * their proof from the same content files as the rest of the site, so the
 * numbers here can't drift from the numbers everywhere else.
 */

export interface PitchStat {
  value: string;
  label: string;
}

export interface PitchBlock {
  title: string;
  body: string;
}

export interface Engagement {
  name: string;
  best: string;
  detail: string;
  points: string[];
}

/** The full-time pitch: for recruiters and hiring managers. */
export const fullTime = {
  eyebrow: "For recruiters",
  title: "Hire one engineer who ships the whole product.",
  lead: "Web, mobile, desktop and the machine-learning bits — front to back, brief to release. I've done it across three product teams already, and I measure the work rather than describe it.",
  stats: [
    { value: "3", label: "Product teams shipped with" },
    { value: "99/100", label: "PageSpeed at Tech Kshatriyas" },
    { value: "6", label: "Real-time modules at Zyrone Energy" },
    { value: "0", label: "CLS on this site, both profiles" },
  ] satisfies PitchStat[],
  strengths: [
    {
      title: "Full-stack, not front-of-stack",
      body: "React and Next.js on the surface, Node, NestJS and Elysia behind it, MongoDB and SQLite under that. Same person writes the screen and the query that fills it.",
    },
    {
      title: "Beyond the browser",
      body: "Flutter apps on phones, Tauri and Electron on the desktop, and ML models served from Flask. A role isn't blocked because it needs more than a web app.",
    },
    {
      title: "Performance is a habit",
      body: "99/100 PageSpeed, a site that holds 0 layout shift and works with JavaScript off. I profile before I optimise and cut weight I can prove is on the critical path.",
    },
    {
      title: "Ships under real constraints",
      body: "Mid-range Android, no GPU, throttled data, a fixed date. I build for the worst device in the room, because that's the one that decides whether it works.",
    },
  ] satisfies PitchBlock[],
  logistics: [
    { title: "Role", body: "Full-stack, frontend or product engineer. Individual contributor building end to end." },
    { title: "Location", body: "Based in Hyderabad, India. Open to remote, hybrid, or relocating for the right team." },
    { title: "Availability", body: "Available now, on a standard notice period." },
    { title: "Stack", body: "TypeScript, React, Next.js, Node, NestJS, Flutter, Tauri, MongoDB — and quick to pick up yours." },
  ] satisfies PitchBlock[],
  close: {
    title: "Read the resume, then let's talk.",
    body: "The work above is live and the code is public where it can be. If the fit looks right, I'm one email away.",
  },
} as const;

/** The freelance pitch: for founders and businesses paying for a build. */
export const freelance = {
  eyebrow: "For clients",
  title: "Have it built by the person who'll still understand it later.",
  lead: "I take a product from a rough brief to something your customers use — web, mobile or desktop — and hand it over as something you own, not an account on my dashboard.",
  stats: [
    { value: "3", label: "Client sites live on the web" },
    { value: "IE", label: "Shipped for a business in Ireland" },
    { value: "4", label: "Platforms: web, mobile, desktop, AI" },
    { value: "100%", label: "Handover: the code is yours" },
  ] satisfies PitchStat[],
  services: [
    {
      title: "Web apps",
      body: "Dashboards, portals and marketing sites in React and Next.js — fast, accessible, and built to rank.",
    },
    {
      title: "Mobile apps",
      body: "One Flutter codebase for Android and iOS, with OTP onboarding, push and the backend to serve it.",
    },
    {
      title: "Desktop software",
      body: "Installed apps for the counter or the workshop — Tauri or Electron, with the data on your machine.",
    },
    {
      title: "AI & automation",
      body: "Models and agents wired into the product, so the software makes the call instead of the person.",
    },
  ] satisfies PitchBlock[],
  process: [
    {
      title: "Scope",
      body: "We agree what it does, what it runs on and what 'done' looks like, in a fixed quote — no open meter.",
    },
    {
      title: "Build",
      body: "You see it working in stages, not at the end. Every stage is on a real device before it's called finished.",
    },
    {
      title: "Handover",
      body: "You get the code, the build and a walkthrough. Medcare shipped as a licensed installer the clinic runs itself — yours to keep, not to rent.",
    },
  ] satisfies PitchBlock[],
  engagements: [
    {
      name: "Fixed project",
      best: "Best for a defined build",
      detail: "A clear scope, a fixed price, a delivery date.",
      points: ["One quote, no surprises", "Milestone check-ins", "Handover + a support window"],
    },
    {
      name: "Monthly",
      best: "Best for ongoing work",
      detail: "A rolling arrangement for a product that keeps growing.",
      points: ["A set number of days a month", "Priority on your queue", "Cancel with notice"],
    },
    {
      name: "Rescue & polish",
      best: "Best for an existing build",
      detail: "Someone else started it; it needs to ship or speed up.",
      points: ["Audit first, then fix", "Performance and accessibility", "No rewrite unless it's cheaper"],
    },
  ] satisfies Engagement[],
  close: {
    title: "Tell me what you're building.",
    body: "Send a line about the product and where it's stuck or starting. I'll come back with how I'd build it and what it costs.",
  },
} as const;
