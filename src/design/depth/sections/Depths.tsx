import { decisions, incident, optimisations } from "@/content/engineering";
import { roles } from "@/content/experience";
import { profile } from "@/content/profile";
import { SectionHead } from "../chrome";
import { depthMeasured } from "../measured";

/**
 * The core: the numbers this page can prove about itself, the changes that
 * produced them, and the fault that taught the lesson.
 */
export function Core() {
  return (
    <section id="core" className="d-section d-wrap" aria-labelledby="core-title">
      <SectionHead
        id="core"
        depth={3000}
        title="Measured, not claimed"
        note={`Taken ${depthMeasured.takenOn}`}
        lead={depthMeasured.how}
      />

      <div className="d-readouts" data-d-reveal>
        {depthMeasured.lighthouse.map((row) => (
          <div key={`${row.page}-${row.profile}`} className="d-readout">
            <p className="d-data">
              {row.page} · {row.profile}
            </p>
            <ol>
              {row.scores.map((score, index) => (
                <li key={depthMeasured.categories[index]}>
                  <span className="d-num d-readout-score" data-full={score === 100 ? "" : undefined}>
                    {score}
                  </span>
                  <span className="d-data">{depthMeasured.categories[index]}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="d-gauges">
        {depthMeasured.vitals.map((item, index) => (
          <div key={item.label} className="d-gauge" data-d-reveal style={{ ["--delay" as string]: `${index * 0.03}s` }}>
            <p className="d-num d-gauge-value">{item.value}</p>
            <p className="d-gauge-label">{item.label}</p>
            <p className="d-body d-gauge-note">{item.note}</p>
          </div>
        ))}
      </div>

      <h3 className="d-h3 d-sub" data-d-reveal>
        Changes, with the measurement that justified each one
      </h3>
      <ul className="d-grid-3">
        {optimisations.map((item, index) => (
          <li key={item.title} className="d-slab d-opt" data-d-reveal style={{ ["--delay" as string]: `${index * 0.05}s` }}>
            <h4 className="d-index-name">{item.title}</h4>
            <p className="d-opt-delta">
              <span className="d-num d-opt-before">{item.before}</span>
              <span aria-hidden="true">→</span>
              <span className="d-num d-opt-after">{item.after}</span>
            </p>
            <p className="d-data">{item.unit}</p>
            <p className="d-body">{item.how}</p>
          </li>
        ))}
      </ul>

      <div className="d-incident" data-d-reveal>
        <h3 className="d-h3">{incident.title}</h3>
        <dl>
          {incident.entries.map((entry) => (
            <div key={entry.label}>
              <dt className="d-data">{entry.label}</dt>
              <dd className="d-body">{entry.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h3 className="d-h3 d-sub" data-d-reveal>
        Decisions, each with what was turned down
      </h3>
      <ul className="d-decisions">
        {decisions.slice(0, 3).map((decision, index) => (
          <li key={decision.decision} data-d-reveal style={{ ["--delay" as string]: `${index * 0.04}s` }}>
            <h4 className="d-index-name">{decision.decision}</h4>
            <p className="d-data d-decision-instead">Instead of: {decision.instead}</p>
            <p className="d-body">{decision.why}</p>
            <p className="d-decision-result">{decision.result}</p>
          </li>
        ))}
      </ul>

    </section>
  );
}

/** The path so far, read the way a core sample is read: newest layer on top. */
export function Strata() {
  return (
    <section id="strata" className="d-section d-wrap" aria-labelledby="strata-title">
      <SectionHead id="strata" depth={3400} title="The path so far" note={`${roles.length} teams`} lead="Where the production work happened, and what it was." />

      <ol className="d-strata">
        {roles.map((role, index) => (
          <li key={role.company} data-d-reveal style={{ ["--delay" as string]: `${index * 0.06}s` }}>
            <div className="d-strata-edge" aria-hidden="true" />
            <div className="d-strata-body">
              <div className="d-strata-role">
                <div className="d-strata-head">
                  <h3 className="d-h3">{role.company}</h3>
                  {role.period && <span className="d-data">{role.period}</span>}
                </div>
                <p className="d-strata-title">{role.title}</p>
              </div>
              <div>
                <p className="d-body">{role.summary}</p>
                {role.highlight && <p className="d-strata-highlight">{role.highlight}</p>}
                {role.note && <p className="d-data">{role.note}</p>}
                <ul className="d-tags" aria-label={`${role.company} stack`}>
                  {role.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}

        <li data-d-reveal>
          <div className="d-strata-edge" aria-hidden="true" />
          <div className="d-strata-body">
            <div className="d-strata-role">
              <div className="d-strata-head">
                <h3 className="d-h3">{profile.education.school}</h3>
                <span className="d-data">{profile.education.year}</span>
              </div>
              <p className="d-strata-title">{profile.education.degree}</p>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}

/**
 * The three ways this page gets used, in the reader's own terms: someone
 * hiring, someone with a problem to solve, someone who needs a build finished.
 */
const ENGAGEMENTS = [
  {
    label: "Full-time",
    title: "A role on your team",
    body: "Web, mobile, desktop or AI work, across the whole stack. The work below is the evidence; the numbers beside it were all measured.",
  },
  {
    label: "Client work",
    title: "A problem in your business",
    body: "Comfort Floors run their operations on software I built for them. That is the shape of it: find what is costing you time, build the thing that removes it, stay for the next one.",
  },
  {
    label: "Freelance",
    title: "A build that needs finishing",
    body: "A site, an app, an integration, or a product to hand over. Medcare ships as a licensed installer; the invitation site went live for a fixed date that could not move.",
  },
];

/** How I work, and the way back up: the page surfaces on the contact. */
export function Surfacing() {
  return (
    <>
      <section id="about" className="d-section d-wrap" aria-labelledby="about-title">
        <SectionHead id="about" depth={3700} title="How I work" note={profile.locationShort} lead={profile.about.intro} />

        <div className="d-about">
          <div className="d-about-text">
            {profile.about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="d-body" data-d-reveal>
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="d-principles">
            {profile.about.principles.map((principle, index) => (
              <li key={principle.title} className="d-slab" data-d-reveal style={{ ["--delay" as string]: `${index * 0.06}s` }}>
                <h3 className="d-index-name">{principle.title}</h3>
                <p className="d-body">{principle.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="d-section d-wrap d-contact" aria-labelledby="contact-title">
        <p className="d-data" data-d-reveal>
          4,000 m · floor
        </p>
        <h2 id="contact-title" className="d-display d-contact-title" data-d-reveal>
          Come up with me
        </h2>
        <p className="d-body d-contact-lead" data-d-reveal>
          If you are hiring for web, mobile, desktop or AI work, write to me. I answer every message.
        </p>
        <ul className="d-offers">
          {ENGAGEMENTS.map((offer, index) => (
            <li key={offer.title} className="d-offer" data-d-reveal style={{ ["--delay" as string]: `${index * 0.05}s` }}>
              <span className="d-data">{offer.label}</span>
              <h3>{offer.title}</h3>
              <p>{offer.body}</p>
            </li>
          ))}
        </ul>

        <div className="d-actions d-contact-actions" data-d-reveal>
          <a className="d-button" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a className="d-button d-button-ghost" href={profile.links.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
          <a className="d-button d-button-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
        </div>
      </section>
    </>
  );
}
