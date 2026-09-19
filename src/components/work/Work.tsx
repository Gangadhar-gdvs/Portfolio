import Image from "next/image";
import { Magnetic } from "@/components/chrome/Magnetic";
import { LensLink } from "@/components/motion/LensLink";
import { MotionSection } from "@/components/motion/MotionSection";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltPanel } from "@/components/ui/TiltPanel";
import { gateSteps } from "@/content/aethra";
import { clientSites, featured, projects } from "@/content/projects";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ClientIndex } from "./ClientIndex";
import { ProjectIndex } from "./ProjectIndex";

export function Work() {
  return (
    <MotionSection id="work" aria-labelledby="work-title" className="wrap pt-24 pb-24 md:pt-32 md:pb-36">
      <SectionHeader
        id="work-title"
        label={`${projects.length + 1} projects · ${clientSites.length} client websites`}
        title="Selected Work"
        intro="Products I've designed and built, from an AI agent that uses your computer to websites in production. Live links where they exist."
      />
      <Featured />

      <div className="mt-24 md:mt-32">
        <ListHeader title="Projects" note="Open a row for details" />
        <ProjectIndex projects={projects} />
      </div>

      <div className="mt-24 md:mt-32">
        <ListHeader title="Client websites" note="Live sites" />
        <ClientIndex clients={clientSites} />
      </div>
    </MotionSection>
  );
}

function ListHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
      <h3 data-split className="t-h4 text-[1.5rem] md:text-[1.75rem]">
        {title}
      </h3>
      <p data-reveal className="t-label text-fg-3">
        {note}
      </p>
    </div>
  );
}

/** Aethra gets a panel of its own: what it is, what's in it, and how it's built. */
function Featured() {
  return (
    <article
      aria-labelledby="work-aethra"
      data-reveal
      className="mt-16 rounded-[20px] bg-night-1 p-5 ring-1 ring-line sm:p-8 md:mt-24 lg:p-10 xl:p-12"
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 flex flex-col lg:col-span-6">
          <div className="flex items-center gap-3">
            <Image src="/images/aethra-logo.png" alt="" width={36} height={36} className="size-9 rounded-[8px]" />
            <p className="t-label text-fg-2">
              Featured <span className="text-fg-3">· {featured.status}</span>
            </p>
          </div>
          <h3 id="work-aethra" className="t-h2 mt-8 md:mt-10">
            {featured.name}
          </h3>
          <p className="t-lead mt-4 max-w-[34rem] text-fg-2">{featured.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-10">
            <Magnetic>
              <LensLink href={featured.caseStudy} className="btn btn-solid">
                Read the case study
                <Arrow />
              </LensLink>
            </Magnetic>
            <p className="t-small text-fg-3">{featured.codeNote}</p>
          </div>
        </div>

        <div className="col-span-12 flex flex-col justify-end lg:col-span-5 lg:col-start-8">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-7">
            {featured.facts.map((fact) => (
              <li key={fact.value}>
                <span className="block text-[2rem] leading-none font-medium tracking-[-0.045em]">{fact.value}</span>
                <span className="t-small mt-2 block text-fg-3">{fact.label}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Aethra stack">
            {featured.stack.map((tool) => (
              <li key={tool} className="chip">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TiltPanel max={3} className="mt-10 rounded-[14px] bg-night p-4 ring-1 ring-line sm:p-6 md:mt-14 md:p-10">
        <div className="t-label flex items-center justify-between gap-4 text-fg-3">
          <span>Fig. 01 — How Aethra is built</span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-glow" />
            Live
          </span>
        </div>
        <div className="mx-auto max-w-[60rem] pt-8 md:pt-12">
          <ArchitectureDiagram idPrefix="work-arch" />
        </div>
        <div className="mt-10 md:mt-14">
          <p className="t-label text-fg-3">Every action passes one gate, in this order</p>
          <ol className="mt-4 grid gap-px overflow-hidden rounded-[10px] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
            {gateSteps.map((step, index) => (
              <li key={step.id} className="bg-night-1 p-4 md:p-5">
                <span className="t-label text-glow">{String(index + 1).padStart(2, "0")}</span>
                <p className="t-small mt-3 text-fg">{step.question}</p>
              </li>
            ))}
          </ol>
        </div>
      </TiltPanel>
    </article>
  );
}
