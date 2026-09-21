"use client";

import Image from "next/image";
import { useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import type { Preview, Project } from "@/content/projects";
import { hasDiagram, ProjectDiagram } from "./ProjectDiagram";
import { useFloatingPreview } from "./useFloatingPreview";

/**
 * Projects as an index. Hovering a row shows a capture of the product beside
 * the cursor; clicking opens the row to show what was built and where to see it.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const previews = projects.flatMap((project) => (project.preview ? [project.preview] : []));
  const floating = useFloatingPreview(previews);

  return (
    <div onPointerLeave={floating.hide}>
      <div aria-hidden="true" className="t-label hidden grid-cols-12 gap-x-6 pb-4 text-fg-3 md:grid">
        <span className="col-span-1">No.</span>
        <span className="col-span-4">Project</span>
        <span className="col-span-3">Type</span>
        <span className="col-span-3">Stack</span>
        <span className="col-span-1 text-right">Year</span>
      </div>
      <ol className="border-t border-line">
        {projects.map((project, index) => {
          const expanded = open === project.slug;
          const panel = `project-${project.slug}`;
          return (
            <li key={project.slug} data-reveal className="border-b border-line">
              <h4>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panel}
                  data-cursor={expanded ? "Close" : "Open"}
                  onClick={() => setOpen(expanded ? null : project.slug)}
                  onPointerEnter={(event) => floating.show(project.preview?.src, event)}
                  className="group grid w-full grid-cols-12 items-center gap-x-6 py-5 text-left md:py-6"
                >
                  <span className="t-label col-span-2 text-fg-3 md:col-span-1">{String(index + 1).padStart(2, "0")}</span>
                  <span className="col-span-8 text-[1.25rem] font-medium tracking-[-0.028em] transition-[translate,color] duration-500 ease-out-expo group-hover:translate-x-2 md:col-span-4 md:text-[1.5rem]">
                    {project.name}
                  </span>
                  <span className="t-small col-span-3 hidden text-fg-2 md:block">{project.kind}</span>
                  <span className="t-small col-span-3 hidden text-fg-3 md:block">{project.stack.join(" · ")}</span>
                  <span className="col-span-2 flex items-center justify-end gap-4 md:col-span-1">
                    <span className="t-label text-fg-3">{project.year}</span>
                    <Toggle open={expanded} />
                  </span>
                </button>
              </h4>
              <div
                id={panel}
                role="region"
                aria-label={project.name}
                inert={!expanded}
                className="grid transition-[grid-template-rows] duration-700 ease-out-expo"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <Details project={project} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {floating.element}
    </div>
  );
}

function Details({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-6 pb-10 md:pt-2">
      <p className="t-body col-span-12 text-fg md:col-span-4 md:col-start-2">{project.summary}</p>
      <ul className="col-span-12 space-y-2 md:col-span-4">
        {project.points.map((point) => (
          <li key={point} className="t-small flex gap-3 text-fg-2">
            <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-glow" />
            {point}
          </li>
        ))}
      </ul>
      <div className="col-span-12 flex flex-col items-start gap-3 md:col-span-3">
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
            {link.label}
            <Arrow dir="up-right" />
          </a>
        ))}
        {project.codeNote && <p className="t-small text-fg-3">{project.codeNote}</p>}
        <p className="t-small text-fg-3 md:hidden">{project.stack.join(" · ")}</p>
      </div>
      {project.preview ? (
        <MobilePreview preview={project.preview} />
      ) : (
        hasDiagram(project.slug) && (
          <figure className="col-span-12 rounded-[12px] bg-night-1 p-4 ring-1 ring-line sm:p-6 md:col-span-7 md:col-start-2">
            <div className="mx-auto max-w-[32rem]">
              <ProjectDiagram slug={project.slug} />
            </div>
            <figcaption className="t-label mt-4 text-fg-3">
              How it fits together{project.links.length === 0 ? " · private repository" : ""}
            </figcaption>
          </figure>
        )
      )}
    </div>
  );
}

/** Phones have no hover, so the capture sits inside the open row. */
function MobilePreview({ preview }: { preview: Preview }) {
  return (
    <div className="relative col-span-12 aspect-[16/10] overflow-hidden rounded-[10px] ring-1 ring-line-2 md:hidden">
      <Image src={preview.src} alt={preview.alt} fill sizes="100vw" className="object-cover object-top" />
    </div>
  );
}

function Toggle({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative grid size-7 place-items-center rounded-full ring-1 ring-line-2 transition-colors group-hover:ring-fg">
      <span className="absolute h-px w-2.5 bg-fg" />
      <span className={`absolute h-2.5 w-px bg-fg transition-transform duration-500 ease-out-expo ${open ? "scale-y-0" : ""}`} />
    </span>
  );
}
