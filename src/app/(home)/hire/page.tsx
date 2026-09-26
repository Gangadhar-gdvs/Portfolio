import type { Metadata } from "next";
import { PitchHero, PitchSection, PitchShell } from "@/design/depth/PitchShell";
import { fullTime } from "@/content/hire";
import { profile } from "@/content/profile";
import { ResumeButton } from "@/components/ResumeButton";
import { roles } from "@/content/experience";

const description =
  "Gangadhara Gooti — full-stack engineer available for full-time roles in Hyderabad or remote. Ships web, mobile, desktop and ML, front to back.";

export const metadata: Metadata = {
  title: "Hire me full-time",
  description,
  alternates: { canonical: "/hire" },
  openGraph: { type: "profile", url: "/hire", title: "Hire me full-time", description },
  twitter: { card: "summary_large_image", title: "Hire me full-time", description },
};

export default function HirePage() {
  return (
    <PitchShell other={{ href: "/freelance", label: "Need a build instead? Freelance & contract", short: "Freelance" }}>
      <PitchHero
        eyebrow={fullTime.eyebrow}
        title={fullTime.title}
        lead={fullTime.lead}
        stats={fullTime.stats}
        actions={
          <>
            <a className="d-button" href={profile.links.resume} target="_blank" rel="noreferrer noopener">
              Read the résumé
            </a>
            <a
              className="d-button d-button-ghost"
              href={`mailto:${profile.email}?subject=Full-time%20role`}
            >
              Email me
            </a>
          </>
        }
      />

      <PitchSection label="What I bring" title="A whole product, from one engineer." effect="zoom">
        <div className="d-pitch-grid">
          {fullTime.strengths.map((item) => (
            <article key={item.title} className="d-slab d-pitch-card" data-d-reveal>
              <h3 className="d-h3">{item.title}</h3>
              <p className="d-body">{item.body}</p>
            </article>
          ))}
        </div>
      </PitchSection>

      <PitchSection label="Where it happened" title="Three teams, each with a number attached." effect="slide">
        <ol className="d-pitch-roles">
          {roles.map((role) => (
            <li key={role.company} className="d-pitch-role" data-d-reveal>
              <div className="d-pitch-role-head">
                <span className="d-pitch-role-name">{role.company}</span>
                <span className="d-data">{role.period || "—"}</span>
              </div>
              <p className="d-pitch-role-title">{role.title}</p>
              <p className="d-body">{role.summary}</p>
              {role.highlight && <p className="d-pitch-role-metric">{role.highlight}</p>}
              <ul className="d-tags">
                {role.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </PitchSection>

      <PitchSection label="The logistics" title="The details a recruiter needs." effect="tilt">
        <dl className="d-pitch-facts">
          {fullTime.logistics.map((item) => (
            <div key={item.title} data-d-reveal>
              <dt className="d-data">{item.title}</dt>
              <dd className="d-body">{item.body}</dd>
            </div>
          ))}
        </dl>
      </PitchSection>

      <section className="d-pitch-close d-wrap" data-d-reveal>
        <h2 className="d-h2">{fullTime.close.title}</h2>
        <p className="d-body">{fullTime.close.body}</p>
        <div className="d-pitch-actions">
          <a className="d-button" href={`mailto:${profile.email}?subject=Full-time%20role`}>
            Start a conversation
          </a>
          <a className="d-button d-button-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
        </div>
      </section>
    </PitchShell>
  );
}
