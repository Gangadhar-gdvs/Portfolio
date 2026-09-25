import Link from "next/link";
import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { DepthTilt, Reveal } from "./chrome";
import { depthStyles } from "./styles";

/**
 * The surround for a pitch page (`/hire`, `/freelance`).
 *
 * It shares the depth design's document, background and type, but not the home
 * page's section navigation — a standalone page has no in-page sections to jump
 * to. The bar carries only the name, the way back to the site, and the door to
 * the other audience's page, so a recruiter is always one link from the client
 * pitch and never lands in the middle of it.
 */
export function PitchShell({
  other,
  children,
}: {
  other: { href: string; label: string; short: string };
  children: ReactNode;
}) {
  return (
    <div className="d-page">
      <style dangerouslySetInnerHTML={{ __html: depthStyles }} />
      <a href="#main" className="d-skip">
        Skip to content
      </a>
      <div className="d-shaft" aria-hidden="true" />

      <header className="d-nav is-deep">
        <Link href="/" className="d-brand">
          <span className="d-brand-mark" aria-hidden="true" />
          <span>{profile.name}</span>
        </Link>
        <nav className="d-pitch-nav" aria-label="Ways to work together">
          <a href={other.href}>
            <span className="d-pitch-nav-full">{other.label}</span>
            <span className="d-pitch-nav-short">{other.short} →</span>
          </a>
          <Link href="/" className="d-pitch-nav-home">
            Full site
          </Link>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="d-main">
        {children}
      </main>

      <footer className="d-colophon">
        <div className="d-wrap d-colophon-row">
          <div>
            <p className="d-colophon-name">{profile.name}</p>
            <p className="d-data">
              {profile.locationShort} · {profile.timeZone.split("/")[1]} · {profile.availability}
            </p>
            <p className="d-data">
              <a href={other.href} className="d-pitch-foot-link">
                {other.label} →
              </a>
            </p>
          </div>
          <div className="d-colophon-end">
            <a className="d-button d-button-ghost" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
        </div>
      </footer>
      <Reveal />
      <DepthTilt />
    </div>
  );
}

/** A page opening: an eyebrow, the headline, a lead, the proof, and the calls. */
export function PitchHero({
  eyebrow,
  title,
  lead,
  stats,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  stats: readonly { value: string; label: string }[];
  actions: ReactNode;
}) {
  return (
    <section className="d-pitch-hero d-wrap" aria-labelledby="pitch-title" data-d-effect="wipe">
      <p className="d-data d-pitch-eyebrow" data-d-reveal>
        {eyebrow}
      </p>
      <h1 id="pitch-title" className="d-display d-pitch-title" data-d-reveal>
        {title}
      </h1>
      <p className="d-body d-pitch-lead" data-d-reveal>
        {lead}
      </p>
      <div className="d-pitch-actions" data-d-reveal>
        {actions}
      </div>
      <dl className="d-pitch-stats" data-d-reveal>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="d-num">{stat.value}</dt>
            <dd className="d-data">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** A titled band of content within a pitch page. Each takes its own reveal. */
export function PitchSection({
  label,
  title,
  effect = "haze",
  children,
}: {
  label: string;
  title: string;
  effect?: "wipe" | "zoom" | "slide" | "haze" | "tilt" | "lift";
  children: ReactNode;
}) {
  return (
    <section className="d-pitch-section d-wrap" data-d-effect={effect}>
      <div className="d-pitch-section-head" data-d-reveal>
        <span className="d-data">{label}</span>
        <h2 className="d-h2">{title}</h2>
      </div>
      {children}
    </section>
  );
}
