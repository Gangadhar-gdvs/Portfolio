export interface ProjectLink {
  label: string;
  href: string;
}

export interface Preview {
  src: string;
  alt: string;
}

/** Problem, approach and result: the order a reviewer reads a project in. */
export interface Story {
  problem: string;
  approach: string;
  result: string;
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
  links: ProjectLink[];
  /** Shown instead of a code link when the repository is private. */
  codeNote?: string;
  /** A capture of the live product, shown on hover. */
  preview?: Preview;
  /** Projects with a story lead the section; the rest are listed. */
  story?: Story;
}

export interface ClientSite {
  name: string;
  place?: string;
  work: string;
  stack: string[];
  href: string;
  preview?: Preview;
}

/**
 * Aethra is still being built, so it is kept out of the portfolio for now.
 * Nothing about it has been deleted: the entry below, its case study at
 * `/work/aethra` and the content in `aethra.ts` are all intact. Set this to
 * true to put it back on the page.
 */
export const showFeatured = false;

export const featured = {
  slug: "aethra",
  name: "Aethra",
  kind: "AI agent · Desktop · Backend · Cloud",
  year: "2026",
  status: "In active development",
  summary:
    "An AI companion that sees your screen, plans the steps and uses your computer to do them, with a 3D avatar that talks you through it and a permission gate in front of every action.",
  facts: [
    { value: "6", label: "packages: desktop, backend, cloud, admin, shared, Android" },
    { value: "44", label: "tools, each with a risk tier and a default action" },
    { value: "81", label: "tests across the permission kernel, memory, voice and avatar" },
    { value: "19k", label: "lines of TypeScript and Rust" },
  ],
  stack: ["Tauri 2", "Rust", "React", "Three.js", "Bun", "Elysia", "SQLite", "Ollama", "Gemini", "Playwright"],
  caseStudy: "/work/aethra",
  codeNote: "Private repository. Walkthrough on request.",
  story: {
    problem:
      "An assistant that can only talk leaves you to do the work. One that can use your computer is only acceptable if it is safe by construction, because a model that is wrong once is a model with your files.",
    approach:
      "The backend is the brain: a Bun and Elysia service that plans, acts and verifies, and owns the conversation. The Tauri desktop app is the hands and eyes, with a Rust core behind one interface per operating system, and it starts nothing on its own. Every tool call from either side passes a single permission gate before it runs.",
    result:
      "44 tools, each with a risk tier and a default action; a tool that isn't in the registry is denied outright. 81 tests across the kernel, memory, voice and avatar, over 19k lines and six packages.",
  },
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
    links: [
      { label: "Live app", href: "https://taskflow-production-50d6.up.railway.app/" },
      { label: "Code", href: "https://github.com/Gangadhar-gdvs/TaskFlow" },
    ],
    preview: { src: "/images/work/taskflow.jpg", alt: "TaskFlow sign-in screen" },
    story: {
      problem:
        "A small team needs one place to see who is doing what, without handing everyone the power to change everything.",
      approach:
        "JWT sign-in over bcrypt-hashed passwords, with the role checked on the server for every route: admins manage projects and people, members can only move their own tasks. The dashboard aggregates in one pass instead of one query per card.",
      result:
        "Live, with the code public: sign up and drive the whole flow, from creating a project to the status, per-person and overdue counts on the dashboard.",
    },
  },
  {
    slug: "wedding-invitation",
    name: "Wedding Invitation",
    kind: "Interactive site · WebGL · Bilingual",
    year: "2026",
    summary:
      "A Nikah invitation that opens like a card: tap the gold seal, the jali doors part, and the weekend unfolds chapter by chapter, in English or Telugu.",
    points: [
      "Reads as a complete page with JavaScript switched off",
      "Three device tiers plus a calm version for reduce-motion; WebGL only where it will run",
      "Arabic and Urdu calligraphy shaped with HarfBuzz at build time, so no shaping engine ships",
      "A maker page mints a personal link for each guest, with calendar and directions",
    ],
    stack: ["TypeScript", "Vite", "three.js", "GSAP", "Lenis", "HarfBuzz"],
    links: [{ label: "Live invitation", href: "https://sayed-wedding-invitation.netlify.app/" }],
    codeNote: "Private repository",
    preview: { src: "/images/work/wedding.jpg", alt: "The sealed jali doors of the invitation under a starlit sky" },
    story: {
      problem:
        "An invitation goes out over WhatsApp to a few hundred people, most of them on mid-range Android phones and patchy data. It has to feel like an occasion on a good phone and still be readable on a weak one — and it cannot be late, because the date is fixed.",
      approach:
        "The invitation itself is in the HTML: with JavaScript off the page still reads end to end, names, times and venue included. Everything above that is chosen from the device — a WebGL seal and gold dust on strong phones, a lighter pass on most, no WebGL at all where there is no WebGL 2 or the reader has asked for less motion. The Arabic and Urdu calligraphy is shaped with HarfBuzz during the build and shipped as paths.",
      result:
        "Live for a family's 3–4 October 2026 weekend, bilingual, with per-guest links. 61 unit tests cover the calendar, countdown, tier picking, guest links and both translations; with scripting disabled the page still delivers 1,902 characters of invitation.",
    },
  },
  {
    slug: "medcare",
    name: "Medcare",
    kind: "Billing software · Desktop",
    year: "",
    summary:
      "Billing software for a clinic and pharmacy counter: invoices, patient bills and payments, running as an installed application rather than a website.",
    points: [
      "Runs on the counter machine as a desktop application, not a hosted site",
      "SQLite on the machine, with MongoDB behind the Express service",
      "Handed over as a licensed Windows build, installed directly at the shop",
    ],
    stack: ["Electron", "React", "Node.js", "Express", "SQLite", "MongoDB"],
    links: [],
    codeNote: "Private · licensed desktop build",
    story: {
      problem:
        "Counter billing cannot depend on a browser tab and someone else's uptime, and a clinic does not want an account on a service — it wants the software on its own machine, with its own records.",
      approach:
        "One React interface, wrapped in Electron so it starts like any other application on the counter machine, with the Node and Express service running behind it. SQLite keeps the working records on the machine itself; MongoDB holds the store behind the service. Delivery is a licensed Windows build handed over directly, not a URL and a password.",
      result:
        "A billing desk that opens from the desktop: invoices, patient bills and payments, with the data on the clinic's own machine and the whole product shipped as one licensed installer.",
    },
  },
  {
    slug: "supercabs",
    name: "SuperCabs",
    kind: "Cross-platform mobile app",
    year: "",
    summary: "A ride-rental app with OTP sign-up, document checks and real-time push notifications.",
    points: ["OTP onboarding", "Document verification workflows", "Real-time push notifications"],
    stack: ["Flutter", "Dart", "Firebase", "FCM"],
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
    links: [
      { label: "Live demo", href: "https://network-traffic-analysis-client.onrender.com/" },
      { label: "Code", href: "https://github.com/Gangadhar-gdvs/Network-Traffic-Analysis" },
    ],
    preview: { src: "/images/work/nta.jpg", alt: "Network Traffic Analyser with its IP, protocol and packet-length filters" },
    story: {
      problem:
        "Reading a packet capture usually means installing Wireshark and already knowing what to look for.",
      approach:
        "Upload a PCAP and it is parsed into packet-level records, then filtered by address, protocol number and length. The same records feed a table and the charts, so the two can never disagree, and the report exports to PDF.",
      result:
        "A live demo you can drop a capture into, with the parser and the filters public on GitHub.",
    },
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
    preview: { src: "/images/work/comfortfloors.jpg", alt: "Comfort Floors & Bathrooms website" },
  },
  {
    name: "Agnikula Kshatriyas IT Solutions",
    work: "Company web application for the Tech Kshatriyas team",
    stack: ["NestJS", "TypeScript", "Tailwind CSS"],
    href: "https://agnikulakshatriyasitsolutions.com/",
    preview: { src: "/images/work/agnikula.jpg", alt: "Agnikula Kshatriyas IT Solutions website" },
  },
  {
    name: "JNTUA College of Engineering, Pulivendula",
    work: "Maintained the official college website: content, fixes, navigation and performance",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    href: "https://jntuacep.ac.in/",
    preview: { src: "/images/work/jntuacep.jpg", alt: "JNTUA College of Engineering, Pulivendula website" },
  },
];
