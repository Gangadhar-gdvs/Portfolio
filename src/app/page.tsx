import { About } from "@/components/about/About";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { Contact } from "@/components/contact/Contact";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { PageTransition } from "@/components/motion/PageTransition";
import { Work } from "@/components/work/Work";
import { profile } from "@/content/profile";
import { StageMount } from "@/gl/StageMount";
import { siteUrl } from "@/lib/site";

export default function Home() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="relative outline-none">
        <StageMount />
        <div className="relative z-10">
          <Hero />
          <Capabilities />
          {/* Opaque: slides over the stage like a curtain, and lets it stop drawing. */}
          <div data-stage="away" data-stage-cover className="relative bg-night">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-full h-[30vh] bg-[linear-gradient(transparent,var(--color-night))]"
            />
            <Work />
            <Experience />
            <About />
          </div>
          <Contact />
        </div>
        <PersonJsonLd />
      </main>
    </PageTransition>
  );
}

function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: siteUrl,
    image: `${siteUrl}${profile.portrait.src}`,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pulivendula",
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
    worksFor: { "@type": "Organization", name: "Vectorsoft LLC" },
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: ["Full-stack development", "React", "Next.js", "Flutter", "Tauri", "Node.js", "AI agents"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
