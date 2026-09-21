import { roles } from "@/content/experience";
import { profile } from "@/content/profile";
import { clientSites } from "@/content/projects";

/**
 * What the production work came to, as the roles themselves record it:
 * "6 real-time modules" reads as the figure "6" over "Real-time modules".
 */
const outcomes = roles
  .filter((role) => role.highlight)
  .map((role) => {
    const [value, ...rest] = role.highlight!.split(" ");
    const label = rest.join(" ");
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1), company: role.company };
  });

/**
 * The surface, where the fall starts.
 *
 * The opening is cinematic but nothing here is hidden waiting for JavaScript:
 * the letterbox bars retract around the type rather than over it, and the heat
 * sweeps across letters that were already painted. A title sequence that
 * delays the words is a title sequence that delays the page.
 */
export function Surface() {
  return (
    <section id="top" className="d-surface" aria-labelledby="surface-name">
      <div className="d-wrap d-surface-inner">
        <p className="d-data d-surface-meta">
          <span>{profile.availability}</span>
          <span>{profile.locationShort}</span>
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
          {outcomes.map((outcome) => (
            <div key={outcome.company}>
              <dt className="d-data">
                {outcome.label}
                <span className="d-surface-proof-where">{outcome.company}</span>
              </dt>
              <dd className="d-num">{outcome.value}</dd>
            </div>
          ))}
          <div>
            <dt className="d-data">
              Client sites
              <span className="d-surface-proof-where">Live on the web</span>
            </dt>
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
