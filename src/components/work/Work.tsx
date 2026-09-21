import Image from "next/image";
import { Magnetic } from "@/components/chrome/Magnetic";
import { LensLink } from "@/components/motion/LensLink";
import { MotionSection } from "@/components/motion/MotionSection";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltPanel } from "@/components/ui/TiltPanel";
import { gateSteps } from "@/content/aethra";
import { clientSites, featured, projects, showFeatured, type Project, type Story } from "@/content/projects";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ClientIndex } from "./ClientIndex";
import { ProjectDiagram, hasDiagram } from "./ProjectDiagram";
import { ProjectIndex } from "./ProjectIndex";

export function Work() {
  const deep = projects.filter((project) => project.story);
  const listed = projects.filter((project) => !project.story);

  return (
    <MotionSection id="work" aria-labelledby="work-title" className="wrap pt-24 pb-24 md:pt-32 md:pb-36">
      <SectionHeader
        id="work-title"
        label={`${deep.length + (showFeatured ? 1 : 0)} in depth · ${listed.length} more · ${clientSites.length} client sites`}
        title="Selected Work"
        intro="Problem, what I built, and what came out of it. Live links and public code where they exist; private repositories say so."
      />
      {showFeatured && <Featured />}

      <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2">
        {deep.map((project) => (
          <DeepCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-20 md:mt-28">
        <ListHeader title="Also built" note="Open a row for the sketch" />
        <ProjectIndex projects={listed} />
      </div>

      <div className="mt-20 md:mt-28">
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

function StoryList({ story, className = "" }: { story: Story; className?: string }) {
  const rows: [string, string, boolean][] = [
    ["Problem", story.problem, false],
    ["Approach", story.approach, false],
    ["Result", story.result, true],
  ];
  return (
    <dl className={`space-y-5 ${className}`}>
      {rows.map(([label, body, lead]) => (
        <div key={label} className="grid gap-1.5 sm:grid-cols-[5.5rem_1fr] sm:gap-5">
          <dt className="t-label pt-0.5 text-fg-3">{label}</dt>
          <dd className={`t-small ${lead ? "text-fg" : "text-fg-2"}`}>{body}</dd>
        </div>
      ))}
    </dl>
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
          <StoryList story={featured.story} className="mt-8 max-w-[38rem]" />
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

function DeepCard({ project }: { project: Project }) {
  if (!project.story) return null;
  return (
    <article
      data-reveal
      aria-labelledby={`work-${project.slug}`}
      className="flex flex-col overflow-hidden rounded-[18px] bg-night-1 ring-1 ring-line"
    >
      {project.preview ? (
        <div className="relative aspect-[16/10] border-b border-line bg-night-2">
          <Image
            src={project.preview.src}
            alt={project.preview.alt}
            fill
            sizes="(min-width: 768px) 46vw, 92vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        hasDiagram(project.slug) && (
          // Nothing public to screenshot: show the system instead of faking a picture of it.
          <div className="flex aspect-[16/10] items-center justify-center border-b border-line bg-night-2 px-5 py-4 sm:px-8 sm:py-6">
            <ProjectDiagram slug={project.slug} />
          </div>
        )
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-7 md:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h4 id={`work-${project.slug}`} className="t-h4 text-[1.375rem]">
            {project.name}
          </h4>
          <span className="t-label text-fg-3">{project.year}</span>
        </div>
        <p className="t-small mt-1.5 text-fg-3">{project.kind}</p>

        <StoryList story={project.story} className="mt-7" />

        <ul className="mt-7 flex flex-wrap gap-2" aria-label={`${project.name} stack`}>
          {project.stack.map((tool) => (
            <li key={tool} className="chip">
              {tool}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
          {project.links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={index === 0 ? "btn btn-solid btn-sm" : "btn btn-line btn-sm"}
            >
              {link.label}
              <Arrow dir="up-right" />
            </a>
          ))}
          {project.codeNote && <p className="t-small text-fg-3">{project.codeNote}</p>}
        </div>
      </div>
    </article>
  );
}
