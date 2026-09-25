import Image from "next/image";
import { gateSteps } from "@/content/aethra";
import { clientSites, featured, projects, showFeatured, type Project } from "@/content/projects";
import { SectionHead } from "../chrome";

/**
 * The work, as core samples.
 *
 * Each card is a slab with its own depth: the capture sits behind, the reading
 * sits in front, and the whole thing leans towards the cursor. The lead
 * project gets the widest slab because it is the one with a case study under
 * it.
 */
export function Work() {
  const deep = projects.filter((project) => project.story);
  const listed = projects.filter((project) => !project.story);

  return (
    <section id="work" className="d-section d-wrap" aria-labelledby="work-title" data-d-effect="wipe">
      <SectionHead
        id="work"
        label="Work"
        title="Selected work"
        note={`${deep.length + (showFeatured ? 1 : 0)} in depth · ${listed.length} more · ${clientSites.length} client sites`}
        lead="What each one is, what it runs on, and where to see it. Open any card for the problem, the approach and the result."
      />

      {showFeatured && (
      <article className="d-slab d-slab-lead" data-d-reveal aria-labelledby="work-aethra">
        <div className="d-slab-body">
          <p className="d-data">Featured · {featured.status}</p>
          <h3 id="work-aethra" className="d-h2 d-slab-name">
            {featured.name}
          </h3>
          <p className="d-body d-slab-summary">{featured.summary}</p>

          <dl className="d-story">
            {[
              ["Problem", featured.story.problem],
              ["Approach", featured.story.approach],
              ["Result", featured.story.result],
            ].map(([label, body]) => (
              <div key={label}>
                <dt className="d-data">{label}</dt>
                <dd className="d-body">{body}</dd>
              </div>
            ))}
          </dl>

          <ul className="d-tags" aria-label={`${featured.name} stack`}>
            {featured.stack.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>

          <div className="d-actions">
            <a className="d-button" href={featured.caseStudy}>
              Read the case study
            </a>
            <span className="d-data">{featured.codeNote}</span>
          </div>
        </div>

        <aside className="d-slab-side">
          <dl className="d-facts">
            {featured.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="d-num">{fact.value}</dt>
                <dd className="d-data">{fact.label}</dd>
              </div>
            ))}
          </dl>

          <div className="d-gate">
            <p className="d-data">Every tool call passes this, in order</p>
            <ol>
              {gateSteps.map((step) => (
                <li key={step.id}>{step.question}</li>
              ))}
            </ol>
          </div>
        </aside>
      </article>
      )}

      <div className="d-grid">
        {deep.map((project, index) => (
          <Slab key={project.slug} project={project} index={index} />
        ))}
      </div>

      <h3 className="d-h3 d-sub" data-d-reveal>
        Also built
      </h3>
      <ul className="d-index">
        {listed.map((project, index) => (
          <li key={project.slug} data-d-reveal>
            <span className="d-data d-index-num">{String(index + 1).padStart(2, "0")}</span>
            <div className="d-index-main">
              <h4 className="d-index-name">{project.name}</h4>
              <p className="d-data">{project.kind}</p>
            </div>
            <div className="d-index-side">
              <ul className="d-tags" aria-label={`${project.name} stack`}>
                {project.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
              {project.links.length > 0 ? (
                <div className="d-index-links">
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              ) : (
                <span className="d-data">{project.codeNote}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="d-h3 d-sub" data-d-reveal>
        Client websites
      </h3>
      <ul className="d-clients">
        {clientSites.map((client) => (
          <li key={client.href} className="d-slab d-client" data-d-reveal>
            {client.preview && (
              <div className="d-client-shot">
                <Image src={client.preview.src} alt={client.preview.alt} width={1440} height={900} sizes="(min-width: 62rem) 30vw, 90vw" />
              </div>
            )}
            <div className="d-client-body">
              <h4 className="d-index-name">{client.name}</h4>
              {client.place && <p className="d-data">{client.place}</p>}
              <p className="d-body">{client.work}</p>
              <a href={client.href} target="_blank" rel="noreferrer noopener" className="d-client-link">
                Visit ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Slab({ project, index }: { project: Project; index: number }) {
  if (!project.story) return null;

  return (
    <article
      className="d-slab d-slab-deep"
      data-d-reveal
      style={{ ["--delay" as string]: `${index * 0.05}s` }}
      aria-labelledby={`work-${project.slug}`}
    >
      <div className="d-slab-shot">
        {project.preview ? (
          <Image src={project.preview.src} alt={project.preview.alt} width={1440} height={900} sizes="(min-width: 62rem) 44vw, 92vw" />
        ) : (
          <p className="d-slab-shot-empty d-data">{project.codeNote ?? "No public screenshots"}</p>
        )}
      </div>
      <div className="d-slab-body">
        <div className="d-slab-head">
          <h3 id={`work-${project.slug}`} className="d-h3">
            {project.name}
          </h3>
          {project.year && <span className="d-data">{project.year}</span>}
        </div>
        <p className="d-data d-slab-kind">{project.kind}</p>
        <p className="d-body d-slab-line">{project.summary}</p>

        <ul className="d-tags" aria-label={`${project.name} stack`}>
          {project.stack.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>

        {/* The whole story is one tap away rather than printed on every card. */}
        <details className="d-slab-more">
          <summary>How it was built</summary>
          <dl className="d-story d-story-tight">
            {[
              ["Problem", project.story.problem],
              ["Approach", project.story.approach],
              ["Result", project.story.result],
            ].map(([label, body]) => (
              <div key={label}>
                <dt className="d-data">{label}</dt>
                <dd className="d-body">{body}</dd>
              </div>
            ))}
          </dl>
        </details>

        <div className="d-actions">
          {project.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener" className="d-client-link">
              {link.label} ↗
            </a>
          ))}
          {project.codeNote && project.preview && <span className="d-data">{project.codeNote}</span>}
        </div>
      </div>
    </article>
  );
}
