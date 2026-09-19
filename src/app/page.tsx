import type { Viewport } from "next";
import { ContactSection } from "@/components/contact/ContactSection";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { Hero } from "@/components/hero/Hero";
import { HeroContent } from "@/components/hero/HeroContent";
import { LayersSection } from "@/components/layers/LayersSection";
import { PageTransition } from "@/components/motion/PageTransition";
import { WorkSection } from "@/components/work/WorkSection";
import { profile } from "@/content/profile";
import { SceneMount } from "@/gl/SceneMount";
import { siteUrl } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#e6e9ec",
};

export default function Home() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="relative bg-abyss outline-none">
        <SceneMount />
        <div className="relative z-10">
          <Hero surface={<HeroContent variant="surface" />} xray={<HeroContent variant="xray" />} />
          <LayersSection />
          <WorkSection />
          <ExperienceSection />
          <ContactSection />
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
