import type { Metadata, Viewport } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { PermissionGate } from "@/components/case/PermissionGate";
import { LensLink } from "@/components/motion/LensLink";
import { MotionSection } from "@/components/motion/MotionSection";
import { PageTransition } from "@/components/motion/PageTransition";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { caseStudy } from "@/content/aethra";
import { profile } from "@/content/profile";
import { featured } from "@/content/projects";

const description = caseStudy.tagline;

export const metadata: Metadata = {
  title: "Aethra case study",
  description,
  alternates: { canonical: "/work/aethra" },
  openGraph: { type: "article", url: "/work/aethra", title: "Aethra case study", description },
  twitter: { card: "summary_large_image", title: "Aethra case study", description },
};

export const viewport: Viewport = {
  themeColor: "#05080d",
};

export default function AethraCaseStudy() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="relative min-h-screen bg-abyss outline-none">
        <CaseHero />

        <Chapter label="The idea" title="An assistant that can act, safely.">
          {caseStudy.idea.map((paragraph) => (
            <p key={paragraph} data-reveal className="text-lg leading-relaxed text-bone md:text-xl md:leading-relaxed">
              {paragraph}
            </p>
          ))}
        </Chapter>

        <Chapter label="Architecture" title="A brain, a pair of hands, and a gate between them.">
          <div data-reveal className="rounded-[4px] border border-line bg-abyss-raised/80 p-4 md:p-8">
            <ArchitectureDiagram idPrefix="case-arch" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {caseStudy.brainAndHands.map((item) => (
              <div key={item.title} data-reveal className="border-t border-line pt-4">
                <h3 className="font-medium text-bone">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-bone-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter label="Permission kernel" title="One gate for every action. Try it.">
          <p data-reveal className="measure text-lg leading-relaxed text-bone">
            {caseStudy.gateIntro}
          </p>
          <div data-reveal>
            <PermissionGate />
          </div>
        </Chapter>

        <Chapter label="Device layer" title="One interface, every operating system.">
          <p data-reveal className="measure text-lg leading-relaxed text-bone">
            {caseStudy.deviceLayer.intro}
          </p>
          <ul className="border-t border-line">
            {caseStudy.deviceLayer.modules.map((module) => (
              <li
                key={module.file}
                data-reveal
                className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <code className="readout text-phosphor">{module.file}</code>
                <span className="text-bone">{module.role}</span>
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter label="Memory" title="Memory that stays on the machine.">
          <Points items={caseStudy.memory} />
        </Chapter>

        <Chapter label="Cost" title="Free by default.">
          <Points items={caseStudy.cost} />
        </Chapter>

        <Chapter label="Subagents" title="Many agents, one conversation.">
          <p data-reveal className="measure text-lg leading-relaxed text-bone">
            {caseStudy.swarm}
          </p>
        </Chapter>

        <Chapter label="Next" title="What I’m building now.">
          <Points items={caseStudy.next} />
        </Chapter>

        <CaseFooter />
      </main>
    </PageTransition>
  );
}

function CaseHero() {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="grid-underlay absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative mx-auto max-w-[1600px] px-5 pt-28 pb-14 sm:px-8 md:px-10 md:pt-36 md:pb-20">
        <LensLink href="/#work" className="readout text-bone-soft transition-colors hover:text-phosphor">
          <span aria-hidden="true">←</span> All work
        </LensLink>

        <div className="intro-fade mt-10 flex items-center gap-4" style={{ animationDelay: "80ms" }}>
          <Image src="/images/aethra-logo.png" alt="Aethra logo" width={52} height={52} className="size-13" />
          <p className="eyebrow text-phosphor">Case study · {featured.kind}</p>
        </div>

        <h1 className="display mt-6 overflow-hidden text-[clamp(3.8rem,15vw,14rem)] text-bone uppercase">
          <span className="intro-rise block" style={{ animationDelay: "140ms" }}>
            {caseStudy.title}
          </span>
        </h1>
        <p
          className="intro-fade mt-8 max-w-4xl text-xl leading-snug text-bone md:text-3xl md:leading-snug"
          style={{ animationDelay: "320ms" }}
        >
          {caseStudy.tagline}
        </p>

        <dl
          className="intro-fade mt-12 grid gap-6 border-t border-line pt-6 sm:grid-cols-3"
          style={{ animationDelay: "440ms" }}
        >
          {caseStudy.meta.map((item) => (
            <div key={item.label}>
              <dt className="eyebrow text-bone-soft">{item.label}</dt>
              <dd className="mt-2 text-bone">{item.value}</dd>
            </div>
          ))}
        </dl>

        <ul
          className="intro-fade mt-10 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4"
          style={{ animationDelay: "540ms" }}
        >
          {featured.facts.map((fact) => (
            <li key={fact.value} className="flex items-baseline gap-4">
              <span className="display-tight text-4xl text-bone">{fact.value}</span>
              <span className="text-sm leading-snug text-bone-soft">{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function Chapter({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  const id = `chapter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <MotionSection aria-labelledby={id} className="border-b border-line">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p data-reveal className="eyebrow text-phosphor">
            {label}
          </p>
          <h2 id={id} data-split className="display-tight mt-4 text-[clamp(2rem,3.6vw,3.4rem)] text-bone">
            {title}
          </h2>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-8">{children}</div>
      </div>
    </MotionSection>
  );
}

function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} data-reveal className="flex gap-4 text-lg leading-relaxed text-bone">
          <span aria-hidden="true" className="mt-[0.8em] h-px w-5 shrink-0 bg-phosphor/70" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CaseFooter() {
  return (
    <MotionSection aria-labelledby="walkthrough" className="relative">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 md:px-10 md:py-32">
        <p data-reveal className="eyebrow text-phosphor">
          Walkthrough
        </p>
        <h2 id="walkthrough" data-split className="display mt-5 max-w-[16ch] text-[clamp(2.4rem,6vw,6rem)] text-bone uppercase">
          Want to see it run?
        </h2>
        <p data-reveal className="measure mt-6 text-lg leading-relaxed text-bone-soft">
          The code is private. I&rsquo;m happy to take you through it live, from the Rust device layer to the
          permission kernel.
        </p>
        <div data-reveal className="mt-10 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}?subject=Aethra%20walkthrough`} className="btn btn-glow">
            Ask for a walkthrough
          </a>
          <LensLink href="/#work" className="btn btn-ghost">
            Back to all work
          </LensLink>
        </div>
        <footer className="readout mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-bone-soft">
          <p>© 2026 {profile.name}</p>
          <p>Built with Next.js, Three.js and GSAP</p>
        </footer>
      </div>
    </MotionSection>
  );
}
