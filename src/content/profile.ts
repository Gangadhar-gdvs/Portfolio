// Lines marked `AETHRA:` are hidden while Aethra is still being built. To bring
// it back, uncomment them, delete the line each one replaced, and set
// `showFeatured` in projects.ts to true. `grep -rn AETHRA: src` lists them all.

/**
 * Who Gangadhara is, in one place. Every page reads its copy from `src/content`,
 * so updating the site never means hunting through components.
 */
export const profile = {
  name: "Gangadhara Gooti",
  firstName: "Gangadhara",
  lastName: "Gooti",
  role: "Full-Stack Engineer",
  disciplines: ["Web", "Mobile", "Desktop", "AI"],
  /** Gangadhara's own line from the GitHub profile README, split for the accent. */
  statement: {
    lead: "Building software that feels simple on the surface,",
    accent: "engineered deeply underneath.",
  },
  headline: "Full-Stack Engineer for web, mobile, desktop and AI",
  availability: "Available for full-time roles",
  location: "Hyderabad, Telangana, India",
  locationShort: "Hyderabad, India",
  timeZone: "Asia/Kolkata",
  email: "gangadhargdvs0@gmail.com",
  links: {
    github: "https://github.com/Gangadhar-gdvs",
    linkedin: "https://www.linkedin.com/in/gangadhar-gooti",
    resume: "https://drive.google.com/file/d/17II87o3DU8JI0LzT6W-ElN9-YTB3yFQt/view?usp=drive_link",
  },
  portrait: {
    src: "/images/gangadhara.jpg",
    alt: "Gangadhara Gooti in a charcoal suit and blue tie",
    width: 1575,
    height: 1600,
  },
  about: {
    intro:
      // AETHRA: "I'm Gangadhara, a full-stack engineer from Pulivendula, India. I build complete products: interfaces people enjoy, apps for phones and desktops, real-time backends, and AI agents that can act.",
      "I'm Gangadhara, a full-stack engineer based in Hyderabad, India. I build complete products: interfaces people enjoy, apps for phones and desktops, real-time backends, and machine-learning models that make a call from data.",
    body: [
      "At Vectorsoft I build responsive web platforms, desktop integrations and mobile apps. Before that I engineered real-time operations modules at Zyrone Energy and shipped high-performance web apps with Tech Kshatriyas.",
      // AETHRA: "In my own time I'm building Aethra, an AI agent that sees the screen and uses the computer for you, with a permission gate in front of every action.",
    ],
    /** How I work, each with the artefact that shows it. */
    principles: [
      // AETHRA: {
        // AETHRA: title: "Fail closed",
        // AETHRA: body: "Aethra denies any tool that isn't in its registry. A model can invent a name, and the only safe answer to something unknown is no.",
      // AETHRA: },
      {
        title: "Hand over something they own",
        body: "Medcare installs on the clinic's own machine, with its records on that machine, delivered as a licensed build rather than an account on someone else's service.",
      },
      {
        title: "Measure before optimising",
        body: "The 3D scene moved off the critical path because a profile showed it blocking the main thread, not because the page felt slow.",
      },
      {
        title: "Work on the worst device in the room",
        body: "No GPU, no JavaScript, reduced motion, a throttled connection: each of those has a path through this site that still reads.",
      },
    ],
    stats: [
      { value: 3, suffix: "", label: "Product teams shipped with" },
      { value: 6, suffix: "", label: "Real-time modules at Zyrone Energy" },
      { value: 99, suffix: "/100", label: "PageSpeed at Tech Kshatriyas" },
      // AETHRA: { value: 44, suffix: "", label: "Tools in the Aethra agent" },
    ],
  },
  education: {
    degree: "B.Tech, Computer Science and Engineering",
    school: "JNTUA College of Engineering, Pulivendula",
    year: "2025",
  },
} as const;

export type Profile = typeof profile;
