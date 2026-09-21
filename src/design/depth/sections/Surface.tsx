import { profile } from "@/content/profile";
import { clientSites, projects, showFeatured } from "@/content/projects";
import { depthMeasured } from "../measured";

const deep = projects.filter((project) => project.story).length + (showFeatured ? 1 : 0);

/**
 * The surface, where the fall starts.
 *
 * The opening is cinematic but nothing here is hidden waiting for JavaScript:
 * the letterbox bars retract around the type rather than over it, and the heat
 * sweeps across letters that were already painted. A title sequence that
 * delays the words is a title sequence that delays the page.
 */
export function Surface() {
  const lighthouse = depthMeasured.lighthouse[0].scores[0];
  const firstLoad = depthMeasured.budget.find((item) => item.label === "First-load JavaScript")?.value;

  return (
    <section id="top" className="d-surface" aria-labelledby="surface-name">
      <div className="d-wrap d-surface-inner">
        <p className="d-data d-surface-meta">
          <span>0 m · surface</span>
        </p>

        <h1 id="surface-name" className="d-display d-surface-name">
          <span className="d-sweep">{profile.firstName}</span>
          <span className="d-sweep d-surface-last">{profile.lastName}</span>
        </h1>

        <div className="d-surface-row">
          <p className="d-surface-role">
            {profile.role}
            <span className="d-surface-disciplines">{profile.disciplines.join(" / ")}</span>
          </p>

          <p className="d-body d-surface-statement">
            {profile.statement.lead} <em>{profile.statement.accent}</em>
          </p>
        </div>

        <div className="d-surface-actions">
          <a className="d-button" href="#work">
            See the work
          </a>
          <a className="d-button d-button-ghost" href={profile.links.resume} target="_blank" rel="noreferrer noopener">
            Résumé
          </a>
        </div>

        <dl className="d-surface-proof">
          <div>
            <dt className="d-data">Lighthouse</dt>
            <dd className="d-num">{lighthouse}/100</dd>
          </div>
          <div>
            <dt className="d-data">First load</dt>
            <dd className="d-num">{firstLoad}</dd>
          </div>
          <div>
            <dt className="d-data">Projects in depth</dt>
            <dd className="d-num">{deep}</dd>
          </div>
          <div>
            <dt className="d-data">Client sites</dt>
            <dd className="d-num">{clientSites.length}</dd>
          </div>
        </dl>

        <p className="d-surface-cue d-data" aria-hidden="true">
          Scroll to descend
        </p>
      </div>
    </section>
  );
}
