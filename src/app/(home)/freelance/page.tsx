import type { Metadata } from "next";
import Link from "next/link";
import { PitchHero, PitchSection, PitchShell } from "@/design/depth/PitchShell";
import { freelance } from "@/content/hire";
import { profile } from "@/content/profile";
import { clientSites } from "@/content/projects";

const description =
  "Work with Gangadhara Gooti on your product — web, mobile, desktop and AI builds, delivered as something you own. Fixed projects, monthly, or rescue work.";

export const metadata: Metadata = {
  title: "Freelance & contract builds",
  description,
  alternates: { canonical: "/freelance" },
  openGraph: { type: "website", url: "/freelance", title: "Freelance & contract builds", description },
  twitter: { card: "summary_large_image", title: "Freelance & contract builds", description },
};

export default function FreelancePage() {
  return (
    <PitchShell other={{ href: "/hire", label: "Hiring full-time? For recruiters", short: "For recruiters" }}>
      <PitchHero
        eyebrow={freelance.eyebrow}
        title={freelance.title}
        lead={freelance.lead}
        stats={freelance.stats}
        actions={
          <>
            <a className="d-button" href={`mailto:${profile.email}?subject=Project%20enquiry`}>
              Book a call
            </a>
            <Link className="d-button d-button-ghost" href="/#work">
              See the work
            </Link>
          </>
        }
      />

      <PitchSection label="What I build" title="Whatever your customers actually use." effect="zoom">
        <div className="d-pitch-grid">
          {freelance.services.map((item) => (
            <article key={item.title} className="d-slab d-pitch-card" data-d-reveal>
              <h3 className="d-h3">{item.title}</h3>
              <p className="d-body">{item.body}</p>
            </article>
          ))}
        </div>
      </PitchSection>

      <PitchSection label="How it works" title="Scoped, shown in stages, and handed over." effect="slide">
        <ol className="d-pitch-steps">
          {freelance.process.map((step, index) => (
            <li key={step.title} className="d-pitch-step" data-d-reveal>
              <span className="d-pitch-step-n d-num">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="d-h3">{step.title}</h3>
                <p className="d-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </PitchSection>

      <PitchSection label="Engagements" title="Three ways to start." effect="tilt">
        <div className="d-pitch-grid d-pitch-grid-3">
          {freelance.engagements.map((option) => (
            <article key={option.name} className="d-slab d-pitch-card d-pitch-engage" data-d-reveal>
              <p className="d-data">{option.best}</p>
              <h3 className="d-h3">{option.name}</h3>
              <p className="d-body">{option.detail}</p>
              <ul className="d-pitch-engage-list">
                {option.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PitchSection>

      <PitchSection label="Already live" title="Client work on the open web." effect="wipe">
        <ul className="d-pitch-clients">
          {clientSites.map((site) => (
            <li key={site.name} className="d-pitch-client" data-d-reveal>
              <div>
                <p className="d-pitch-client-name">{site.name}</p>
                <p className="d-body">{site.work}</p>
                <ul className="d-tags">
                  {site.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
              <a className="d-pitch-client-link d-data" href={site.href} target="_blank" rel="noreferrer noopener">
                Visit →
              </a>
            </li>
          ))}
        </ul>
      </PitchSection>

      <section className="d-pitch-close d-wrap" data-d-reveal>
        <h2 className="d-h2">{freelance.close.title}</h2>
        <p className="d-body">{freelance.close.body}</p>
        <div className="d-pitch-actions">
          <a className="d-button" href={`mailto:${profile.email}?subject=Project%20enquiry`}>
            Tell me about it
          </a>
          <a className="d-button d-button-ghost" href="/hire">
            Hiring full-time instead?
          </a>
        </div>
      </section>
    </PitchShell>
  );
}
