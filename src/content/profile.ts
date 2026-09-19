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
  location: "Pulivendula, Andhra Pradesh, India",
  locationShort: "Pulivendula, India",
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
      "I'm Gangadhara, a full-stack engineer from Pulivendula, India. I build complete products: interfaces people enjoy, apps for phones and desktops, real-time backends, and AI agents that can act.",
    body: [
      "At Vectorsoft I build responsive web platforms, desktop integrations and mobile apps. Before that I engineered real-time operations modules at Zyrone Energy and shipped high-performance web apps with Tech Kshatriyas.",
      "In my own time I'm building Aethra, an AI agent that sees the screen and uses the computer for you, with a permission gate in front of every action.",
    ],
    stats: [
      { value: 3, suffix: "", label: "Product teams shipped with" },
      { value: 6, suffix: "", label: "Real-time modules at Zyrone Energy" },
      { value: 99, suffix: "/100", label: "PageSpeed at Tech Kshatriyas" },
      { value: 44, suffix: "", label: "Tools in the Aethra agent" },
    ],
  },
  education: {
    degree: "B.Tech, Computer Science and Engineering",
    school: "JNTUA College of Engineering, Pulivendula",
    year: "2025",
  },
} as const;

export type Profile = typeof profile;
