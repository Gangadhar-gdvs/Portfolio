"use client";

import { useRef } from "react";
import { LocalTime } from "@/components/hero/LocalTime";
import { scrollToTarget } from "@/components/motion/SmoothScroll";
import { useReveal } from "@/components/motion/useReveal";
import { profile } from "@/content/profile";
import { setSceneRunning } from "@/gl/sceneState";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { setNavTheme } from "@/lib/navTheme";
import { CopyEmail } from "./CopyEmail";

/**
 * Resurfacing: a dome of the light surface rises over the dark as the section
 * scrolls in, closing the loop the hero opened.
 */
export function ContactSection() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  useGSAP(
    () => {
      const root = section.current;
      const dome = root?.querySelector<HTMLElement>("[data-dome]");
      if (!root || !dome) return;

      const reduced = prefersReducedMotion();
      gsap.fromTo(
        dome,
        { "--dome": reduced ? "150%" : "0%" },
        {
          "--dome": "125%",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "top 12%",
            scrub: reduced ? false : true,
            onUpdate: (self) => {
              setNavTheme(self.progress > 0.9 ? "surface" : "abyss");
              setSceneRunning(self.progress < 0.999);
            },
            onLeave: () => setSceneRunning(false),
            onEnterBack: () => setSceneRunning(true),
          },
        },
      );
    },
    { scope: section },
  );

  return (
    <section ref={section} id="contact" aria-labelledby="contact-title" className="relative">
      <div
        data-dome
        data-tone="surface"
        className="relative bg-surface text-ink"
        style={{ clipPath: "circle(var(--dome, 150%) at 50% 100%)" }}
      >
        <div className="mx-auto flex min-h-[100svh] max-w-[1600px] flex-col px-5 pt-32 pb-8 sm:px-8 md:px-10 md:pt-40">
          <div className="flex-1">
            <p data-reveal className="eyebrow text-phosphor-deep">
              Back to the surface
            </p>
            <h2
              id="contact-title"
              data-split
              className="display mt-6 max-w-[14ch] text-[clamp(2.6rem,7.6vw,8.4rem)] uppercase"
            >
              Let&rsquo;s build something that feels simple.
            </h2>
            <p data-reveal className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
              I&rsquo;m looking for a full-time role on a product team, across the stack. Email is the fastest way to
              reach me.
            </p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="btn btn-ink">
                Email me
              </a>
              <CopyEmail email={profile.email} className="btn btn-ink-ghost" />
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ink-ghost">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-ink-ghost">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a href={profile.links.resume} target="_blank" rel="noopener noreferrer" className="btn btn-ink-ghost">
                Résumé <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p data-reveal className="readout mt-6 text-ink-soft">
              {profile.email}
            </p>
          </div>

          <footer className="readout mt-24 grid gap-4 border-t border-line-ink pt-6 text-ink-soft sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <p>© 2026 {profile.name}</p>
            <p>
              {profile.locationShort} · <LocalTime timeZone={profile.timeZone} label="IST" />
            </p>
            <p>Built with Next.js, Three.js and GSAP</p>
            <p className="lg:text-right">
              <button
                type="button"
                onClick={() => scrollToTarget(0)}
                className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Back to the surface ↑
              </button>
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}
