export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  kind: string;
  /** Left empty when the year isn't on record. */
  year: string;
  summary: string;
  points: string[];
  stack: string[];
  /** How data moves through it, left to right. Drawn as a live pipeline. */
  flow: string[];
  links: ProjectLink[];
  /** Shown instead of a code link when the repository is private. */
  codeNote?: string;
}

export interface ClientSite {
  name: string;
  place?: string;
  work: string;
  stack: string[];
  href: string;
}

export const featured = {
  slug: "aethra",
  name: "Aethra",
  kind: "AI agent · Desktop · Backend · Cloud",
  year: "2026",
  status: "In active development",
  summary:
    "An AI companion that sees your screen, plans the steps and uses your computer to do them, with a 3D avatar that talks you through it and a permission gate on every action.",
  facts: [
    { value: "6", label: "packages: desktop, backend, cloud, admin, shared, Android" },
    { value: "44", label: "tools, each with a risk tier and a default action" },
    { value: "81", label: "tests across the permission kernel, memory, voice and avatar" },
    { value: "19k", label: "lines of TypeScript and Rust" },
  ],
  stack: ["Tauri 2", "Rust", "React", "Three.js", "Bun", "Elysia", "SQLite", "Ollama", "Gemini", "Playwright"],
  caseStudy: "/work/aethra",
  codeNote: "Private repository. Walkthrough on request.",
} as const;

export const projects: Project[] = [
  {
    slug: "taskflow",
    name: "TaskFlow",
    kind: "Full-stack web app",
    year: "2026",
    summary: "A team task manager with projects, assignments, roles and a live dashboard.",
    points: [
      "JWT sign-in with bcrypt-hashed passwords",
      "Admins manage everything; members update only their own tasks",
      "Live stats: status breakdown, tasks per person, overdue count",
    ],
    stack: ["React", "Express", "MongoDB", "JWT"],
    flow: ["React UI", "Express API", "JWT + roles", "MongoDB"],
    links: [
      { label: "Open the live app", href: "https://taskflow-production-50d6.up.railway.app/" },
      { label: "Code", href: "https://github.com/Gangadhar-gdvs/TaskFlow" },
    ],
  },
  {
    slug: "supercabs",
    name: "SuperCabs",
    kind: "Cross-platform mobile app",
    year: "",
    summary: "A ride-rental app with OTP sign-up, document checks and real-time push notifications.",
    points: ["OTP onboarding", "Document verification workflows", "Real-time push notifications"],
    stack: ["Flutter", "Dart", "Firebase", "FCM"],
    flow: ["Flutter app", "OTP sign-up", "Firebase", "Push alerts"],
    links: [],
    codeNote: "Private repository",
  },
  {
    slug: "g-mart",
    name: "G-Mart",
    kind: "E-commerce platform",
    year: "",
    summary: "A multi-module store with payments, delivery tracking and an admin panel for orders, products and deliveries.",
    points: [
      "Role-based access with JWT authentication",
      "Admin panel for orders, payments, listings and delivery updates",
      "Payment processing and delivery tracking",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB"],
    flow: ["Storefront", "Express API", "RBAC + JWT", "MongoDB"],
    links: [],
    codeNote: "Private repository",
  },
  {
    slug: "network-traffic-analyser",
    name: "Network Traffic Analyser",
    kind: "Network tooling",
    year: "2024",
    summary: "Upload a packet capture and read the traffic as tables and charts, filter it, then export the report as a PDF.",
    points: [
      "Parses PCAP files into packet-level detail",
      "Filters by IP address, packet length and protocol number",
      "Text and chart views, with PDF export",
    ],
    stack: ["React", "Chart.js", "Express", "pcap-parser"],
    flow: ["PCAP upload", "Parser", "Filters", "Charts + PDF"],
    links: [
      { label: "Open the live demo", href: "https://network-traffic-analysis-client.onrender.com/" },
      { label: "Code", href: "https://github.com/Gangadhar-gdvs/Network-Traffic-Analysis" },
    ],
  },
  {
    slug: "medical-recommendation",
    name: "Medical Recommendation",
    kind: "Machine learning",
    year: "2025",
    summary: "Enter symptoms and get a likely condition, with its description, precautions, medication, diet and workout advice.",
    points: [
      "Support-vector classifier trained on symptom data",
      "Flask app that serves predictions and recommendations",
      "Model built and evaluated in a Jupyter notebook",
    ],
    stack: ["Python", "scikit-learn", "pandas", "Flask"],
    flow: ["Symptoms", "SVC model", "Condition", "Advice"],
    links: [
      {
        label: "Code",
        href: "https://github.com/Gangadhar-gdvs/Personalized-Medical-Recommendation-System-with-Machine-Learning",
      },
    ],
  },
  {
    slug: "web-medical-management",
    name: "Web Medical Management",
    kind: "Web platform",
    year: "2024",
    summary: "Hospital management with separate doctor, patient and admin modules over one database.",
    points: ["Doctor, patient and admin modules", "PHP backend over a MySQL database"],
    stack: ["PHP", "MySQL", "JavaScript", "SCSS"],
    flow: ["Patients", "Doctors", "Admin", "MySQL"],
    links: [{ label: "Code", href: "https://github.com/Gangadhar-gdvs/Web-Medical-Management-System" }],
  },
];

export const clientSites: ClientSite[] = [
  {
    name: "Comfort Floors & Bathrooms",
    place: "Ireland",
    work: "Custom web application that automates their core business operations",
    stack: ["React", "Tailwind CSS"],
    href: "https://comfortfloors.ie/",
  },
  {
    name: "Agnikula Kshatriyas IT Solutions",
    work: "Company web application for the Tech Kshatriyas team",
    stack: ["NestJS", "TypeScript", "Tailwind CSS"],
    href: "https://agnikulakshatriyasitsolutions.com/",
  },
  {
    name: "JNTUA College of Engineering, Pulivendula",
    work: "Maintained the official college website: content, fixes, navigation and performance",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    href: "https://jntuacep.ac.in/",
  },
];
