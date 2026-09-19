import { LensLink } from "@/components/motion/LensLink";
import { MotionSection } from "@/components/motion/MotionSection";
import { clientSites, featured, projects, type Project } from "@/content/projects";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { Pipeline } from "./Pipeline";

export function WorkSection() {
  return (
    <MotionSection
      id="work"
      aria-labelledby="work-title"
      data-nav-theme="abyss"
      scene="work"
      className="relative pt-28 pb-12 md:pt-40 md:pb-16"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p data-reveal className="eyebrow text-phosphor">
              Selected work
            </p>
            <h2 id="work-title" data-split className="display-tight mt-5 text-[clamp(2.3rem,4.8vw,4.6rem)] text-bone">
              Systems I&rsquo;ve designed, engineered and built.
            </h2>
          </div>
          <p data-reveal className="text-lg leading-relaxed text-bone-soft md:col-span-4">
            Each project is drawn as its architecture: what talks to what, and where the data goes. Live links where
            they exist.
          </p>
        </header>

        <FeaturedPlate />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectPlate key={project.slug} project={project} />
          ))}
        </div>

        <ClientList />
      </div>
    </MotionSection>
  );
}

function FeaturedPlate() {
  return (
    <article
      data-reveal
      aria-labelledby="work-aethra"
      className="relative mt-14 grid gap-10 rounded-[4px] border border-line bg-abyss-raised/85 p-6 md:mt-20 md:p-10 lg:grid-cols-12 lg:gap-12"
    >
      <div className="flex flex-col lg:col-span-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow text-phosphor">{featured.kind}</p>
          <span className="readout rounded-full border border-ember/50 px-2.5 py-0.5 text-[0.66rem] text-ember">
            {featured.status}
          </span>
        </div>
        <h3 id="work-aethra" className="display mt-5 text-[clamp(3.2rem,7.5vw,7rem)] text-bone uppercase">
          {featured.name}
        </h3>
        <p className="measure mt-5 text-lg leading-relaxed text-bone">{featured.summary}</p>

        <ul className="mt-8 border-t border-line">
          {featured.facts.map((fact) => (
            <li key={fact.value} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-b border-line py-3">
              <span className="display-tight text-2xl text-bone">{fact.value}</span>
              <span className="text-[0.92rem] leading-snug text-bone-soft">{fact.label}</span>
            </li>
          ))}
        </ul>
        <p className="readout mt-6 text-bone-soft">{featured.stack.join("  ·  ")}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-auto lg:pt-10">
          <LensLink href={featured.caseStudy} className="btn btn-glow">
            Read the Aethra case study <span aria-hidden="true">→</span>
          </LensLink>
          <p className="readout text-bone-soft">{featured.codeNote}</p>
        </div>
      </div>

      <div className="lg:col-span-7 lg:self-center">
        <ArchitectureDiagram idPrefix="work-arch" />
      </div>
    </article>
  );
}

function ProjectPlate({ project }: { project: Project }) {
  return (
    <article
      data-reveal
      aria-labelledby={`project-${project.slug}`}
      className="group @container flex flex-col rounded-[4px] border border-line bg-abyss-raised/80 p-6 transition-colors duration-500 hover:border-line-strong md:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-phosphor">{project.kind}</p>
        {project.year && <p className="readout text-bone-soft">{project.year}</p>}
      </div>
      <h3 id={`project-${project.slug}`} className="display-tight mt-4 text-[1.9rem] text-bone">
        {project.name}
      </h3>
      <p className="mt-3 leading-relaxed text-bone-soft">{project.summary}</p>

      <div className="mt-6">
        <Pipeline steps={project.flow} label={`${project.name} data flow`} />
      </div>

      <ul className="mt-6 space-y-2 text-[0.92rem] text-bone">
        {project.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-phosphor/70" />
            {point}
          </li>
        ))}
      </ul>
      <p className="readout mt-6 text-bone-soft">{project.stack.join("  ·  ")}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-link text-bone">
            {link.label}
            <span className="sr-only"> for {project.name}</span> <span aria-hidden="true">↗</span>
          </a>
        ))}
        {project.codeNote && <span className="readout text-bone-soft">{project.codeNote}</span>}
      </div>
    </article>
  );
}

function ClientList() {
  return (
    <div className="mt-20 md:mt-28">
      <p data-reveal className="eyebrow text-bone-soft">
        Shipped for clients
      </p>
      <ul className="mt-5 border-t border-line">
        {clientSites.map((site) => (
          <li key={site.href} data-reveal className="border-b border-line">
            <a
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-2 py-6 transition-colors md:grid-cols-12 md:items-baseline md:gap-6"
            >
              <span className="text-xl text-bone transition-colors group-hover:text-phosphor md:col-span-4 md:text-2xl">
                {site.name}
                {site.place && <span className="readout ml-3 text-bone-soft">{site.place}</span>}
              </span>
              <span className="leading-relaxed text-bone-soft md:col-span-5">{site.work}</span>
              <span className="readout text-bone-soft md:col-span-2">{site.stack.join(" · ")}</span>
              <span className="readout text-phosphor md:col-span-1 md:text-right">
                Visit <span aria-hidden="true">↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
