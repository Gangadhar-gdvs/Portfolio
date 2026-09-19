export interface Role {
  company: string;
  title: string;
  /** Shown as written. Left empty when the dates aren't on record. */
  period: string;
  summary: string;
  highlight?: string;
  note?: string;
  stack: string[];
}

/** Most recent first. */
export const roles: Role[] = [
  {
    company: "Vectorsoft LLC",
    title: "Junior Developer",
    period: "Now",
    summary: "Responsive web platforms, desktop integrations and mobile apps.",
    highlight: "99% SEO score",
    stack: ["Next.js", "Elysia", "Tauri", "Flutter", "Zoom Video SDK"],
  },
  {
    company: "Zyrone Energy",
    title: "Full Stack Developer",
    period: "2025",
    summary: "Engineered real-time operational systems that replaced manual workflows.",
    highlight: "6 real-time modules",
    note: "Joined as an intern in March 2025, full-time from May 2025.",
    stack: ["NestJS", "Firebase", "Flutter", "Angular", "REST APIs"],
  },
  {
    company: "Tech Kshatriyas",
    title: "Frontend Developer",
    period: "",
    summary: "High-performance web experiences and custom workflow applications.",
    highlight: "99/100 PageSpeed",
    stack: ["React", "Node.js", "NestJS", "Tailwind CSS"],
  },
];
