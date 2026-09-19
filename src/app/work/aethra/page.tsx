import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { PermissionGate } from "@/components/case/PermissionGate";
import { Magnetic } from "@/components/chrome/Magnetic";
import { LensLink } from "@/components/motion/LensLink";
import { MotionSection } from "@/components/motion/MotionSection";
import { PageTransition } from "@/components/motion/PageTransition";
import { Arrow } from "@/components/ui/Arrow";
import { TiltPanel } from "@/components/ui/TiltPanel";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { caseStudy } from "@/content/aethra";
import { profile } from "@/content/profile";
import { featured } from "@/content/projects";
import { vars } from "@/lib/style";

const description = caseStudy.tagline;

export const metadata: Metadata = {
  title: "Aethra case study",
  description,
  alternates: { canonical: "/work/aethra" },
  openGraph: { type: "article", url: "/work/aethra", title: "Aethra case study", description },
  twitter: { card: "summary_large_image", title: "Aethra case study", description },
};

export default function AethraCaseStudy() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="relative min-h-screen overflow-x-clip bg-night outline-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[80vh] bg-[radial-gradient(60%_70%_at_75%_0%,#0b1626,transparent)]"
        />
        <CaseHero />

        <Chapter index={1} label="The idea" title="An assistant that can act, safely.">
          {caseStudy.idea.map((paragraph) => (
            <p key={paragraph} data-reveal className="t-lead text-fg-2">
              {paragraph}
            </p>
          ))}
        </Chapter>

        <Chapter index={2} label="Architecture" title="A brain, a pair of hands, and a gate between them.">
          <TiltPanel max={3} className="rounded-[16px] bg-night-1 p-4 ring-1 ring-line sm:p-6 md:p-8">
            <p className="t-label text-fg-3">Fig. 01 — How Aethra is built</p>
            <div className="pt-8">
              <ArchitectureDiagram idPrefix="case-arch" />
            </div>
          </TiltPanel>
          <div className="grid gap-6 md:grid-cols-3">
            {caseStudy.brainAndHands.map((item) => (
              <div key={item.title} data-reveal className="border-t border-line pt-5">
                <h3 className="t-h4">{item.title}</h3>
                <p className="t-body mt-2 text-fg-2">{item.body}</p>
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter index={3} label="Permission kernel" title="One gate for every action. Try it.">
          <p data-reveal className="t-lead text-fg-2">
            {caseStudy.gateIntro}
          </p>
          <div data-reveal>
            <PermissionGate />
          </div>
        </Chapter>

        <Chapter index={4} label="Device layer" title="One interface, every operating system.">
          <p data-reveal className="t-lead text-fg-2">
            {caseStudy.deviceLayer.intro}
          </p>
          <ul className="border-t border-line">
            {caseStudy.deviceLayer.modules.map((module) => (
              <li key={module.file} data-reveal className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <code className="font-mono text-[0.8125rem] text-glow">{module.file}</code>
                <span className="t-body text-fg">{module.role}</span>
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter index={5} label="Memory" title="Memory that stays on the machine.">
          <Points items={caseStudy.memory} />
        </Chapter>

        <Chapter index={6} label="Cost" title="Free by default.">
          <Points items={caseStudy.cost} />
        </Chapter>

        <Chapter index={7} label="Subagents" title="Many agents, one conversation.">
          <p data-reveal className="t-lead text-fg-2">
            {caseStudy.swarm}
          </p>
        </Chapter>

        <Chapter index={8} label="Next" title="What I’m building now.">
          <Points items={caseStudy.next} />
        </Chapter>

        <CaseFooter />
      </main>
    </PageTransition>
  );
}

function CaseHero() {
  return (
    <header className="wrap relative pt-28 pb-16 md:pt-36 md:pb-24">
      <LensLink href="/#work" className="t-label group inline-flex items-center gap-2 text-fg-3 transition-colors hover:text-fg">
        <span className="rotate-180">
          <Arrow />
        </span>
        All work
      </LensLink>

      <div className="enter mt-12 flex items-center gap-3 md:mt-16" style={vars({ "--d": "60ms" })}>
        <Image src="/images/aethra-logo.png" alt="Aethra logo" width={40} height={40} className="size-10 rounded-[9px]" />
        <p className="t-label text-fg-2">
          Case study <span className="text-fg-3">· {featured.kind}</span>
        </p>
      </div>

      <h1 className="t-display mt-8">
        <span className="mask">
          <span className="rise" style={vars({ "--d": "120ms" })}>
            {caseStudy.title}
          </span>
        </span>
      </h1>
      <p className="t-lead enter mt-7 max-w-[40rem] text-fg-2" style={vars({ "--d": "300ms" })}>
        {caseStudy.tagline}
      </p>

      <dl className="enter mt-14 grid gap-6 border-t border-line pt-6 sm:grid-cols-3" style={vars({ "--d": "420ms" })}>
        {caseStudy.meta.map((item) => (
          <div key={item.label}>
            <dt className="t-label text-fg-3">{item.label}</dt>
            <dd className="t-small mt-1.5 text-fg">{item.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="enter mt-10 grid gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4" style={vars({ "--d": "520ms" })}>
        {featured.facts.map((fact) => (
          <li key={fact.value}>
            <span className="block text-[2.25rem] leading-none font-medium tracking-[-0.05em]">{fact.value}</span>
            <span className="t-small mt-2 block text-fg-3">{fact.label}</span>
          </li>
        ))}
      </ul>
    </header>
  );
}

function Chapter({ index, label, title, children }: { index: number; label: string; title: string; children: ReactNode }) {
  const id = `chapter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <MotionSection aria-labelledby={id} className="wrap">
      <div data-draw-line className="h-px bg-line-2" />
      <div className="grid grid-cols-12 gap-x-6 gap-y-10 py-16 md:py-24">
        <div className="col-span-12 lg:col-span-4">
          <p data-reveal className="t-label flex items-center gap-3 text-fg-3">
            <span className="text-glow">{String(index).padStart(2, "0")}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-3" />
            {label}
          </p>
          <h2 id={id} data-split className="t-h3 mt-6 max-w-[22rem]">
            {title}
          </h2>
        </div>
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-7 lg:col-start-6">{children}</div>
      </div>
    </MotionSection>
  );
}

function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item} data-reveal className="t-lead flex gap-4 text-fg-2">
          <span aria-hidden="true" className="mt-[0.75em] h-px w-5 shrink-0 bg-glow" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CaseFooter() {
  return (
    <MotionSection aria-labelledby="walkthrough" className="wrap relative pt-20 pb-10 md:pt-28">
      <div data-draw-line className="h-px bg-line-2" />
      <p data-reveal className="t-label mt-16 text-fg-3 md:mt-24">
        Walkthrough
      </p>
      <h2 id="walkthrough" data-split className="t-display mt-6 max-w-[14ch]">
        Want to see it <span className="t-serif">run?</span>
      </h2>
      <p data-reveal className="t-lead mt-7 max-w-[32rem] text-fg-2">
        The code is private. I&rsquo;m happy to take you through it live, from the Rust device layer to the permission
        kernel.
      </p>
      <div data-reveal className="mt-10 flex flex-wrap gap-3">
        <Magnetic>
          <a href={`mailto:${profile.email}?subject=Aethra%20walkthrough`} className="btn btn-solid">
            Ask for a walkthrough
            <Arrow dir="up-right" />
          </a>
        </Magnetic>
        <Magnetic>
          <LensLink href="/#work" className="btn btn-line">
            Back to all work
          </LensLink>
        </Magnetic>
      </div>
      <footer className="t-small mt-28 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-fg-3">
        <p>© 2026 {profile.name}</p>
        <p>Built with Next.js, Three.js and GSAP</p>
      </footer>
    </MotionSection>
  );
}
