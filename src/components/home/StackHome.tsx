import "lenis/dist/lenis.css";
import "@/app/globals.css";
import { About } from "@/components/about/About";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { Dive } from "@/components/capabilities/Dive";
import { Contact } from "@/components/contact/Contact";
import { Engineering } from "@/components/engineering/Engineering";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { ProofStrip } from "@/components/hero/ProofStrip";
import { PageTransition } from "@/components/motion/PageTransition";
import { Skills } from "@/components/skills/Skills";
import { Work } from "@/components/work/Work";
import { profile } from "@/content/profile";
import { StageMount } from "@/gl/StageMount";
import { siteUrl } from "@/lib/site";
import type { ReactNode } from "react";

/**
 * The dark design's home page: the glass stack, unchanged. It lives in its own
 * module so the build for the other design does not carry it.
 */
export function StackHome() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="relative outline-none">
        <StageMount />
        <div className="relative z-10">
          <Hero />
          <ProofStrip />
          {/* Opaque sections slide over the stage like a curtain, and let it stop drawing. */}
          <Opaque>
            <Work />
          </Opaque>
          <Capabilities />
          <Dive />
          <Opaque>
            <Skills />
            <Engineering />
            <Experience />
            <About />
          </Opaque>
          <Contact />
        </div>
        <PersonJsonLd />
      </main>
    </PageTransition>
  );
}

function Opaque({ children }: { children: ReactNode }) {
  return (
    <div data-stage="away" data-stage-cover className="relative bg-night">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-full h-[30vh] bg-[linear-gradient(transparent,var(--color-night))]"
      />
      {children}
    </div>
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
    // AETHRA: knowsAbout: ["Full-stack development", "React", "Next.js", "Flutter", "Tauri", "Node.js", "AI agents"],
    knowsAbout: ["Full-stack development", "React", "Next.js", "Flutter", "Tauri", "Node.js"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
