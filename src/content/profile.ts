/**
 * Who Gangadhara is, in one place. Every page reads its copy from `src/content`,
 * so updating the site never means hunting through components.
 */
export const profile = {
  name: "Gangadhara Gooti",
  firstName: "Gangadhara",
  lastName: "Gooti",
  role: "Full-stack engineer",
  headline: "Full-stack engineer for web, mobile, desktop and AI",
  lede: "Full-stack engineer across web, mobile, desktop and AI. I build software that feels simple on the surface and is engineered deeply underneath.",
  availability: "Open to full-time roles",
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
  education: {
    degree: "B.Tech, Computer Science and Engineering",
    school: "JNTUA College of Engineering, Pulivendula",
    year: "2025",
  },
} as const;

export type Profile = typeof profile;
