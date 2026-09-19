import { MotionSection } from "@/components/motion/MotionSection";
import { Arrow } from "@/components/ui/Arrow";
import { profile } from "@/content/profile";
import { StageDrag } from "@/gl/StageDrag";
import { CopyEmail } from "./CopyEmail";

const LINKS = [
  { label: "GitHub", href: profile.links.github },
  { label: "LinkedIn", href: profile.links.linkedin },
  { label: "Résumé", href: profile.links.resume },
];

/** The last screen: the stack closes up again beside the invitation to talk. */
export function Contact() {
  return (
    <MotionSection id="contact" data-stage="contact" aria-labelledby="contact-title" className="relative flex min-h-[100svh] flex-col">
      <StageDrag className="absolute inset-y-0 right-0 hidden w-1/2 md:block" />

      <div className="wrap pointer-events-none relative flex flex-1 flex-col pt-[46svh] md:pt-40">
        <div className="pointer-events-auto max-w-[44rem]">
          <p data-reveal className="t-label flex items-center gap-3 text-fg-2">
            <span className="dot-live" />
            {profile.availability}
          </p>
          <h2 id="contact-title" data-split className="t-display mt-7">
            Let&rsquo;s work <span className="t-serif">together.</span>
          </h2>
          <p data-reveal className="t-lead mt-7 max-w-[30rem] text-fg-2">
            I&rsquo;m looking for a full-time role on a product team, across web, mobile, desktop and AI. Email is the
            fastest way to reach me.
          </p>
          <div data-reveal className="mt-10 flex flex-col items-start gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="link group inline-flex items-center gap-4 pb-1 text-[clamp(1.25rem,0.9rem+1.5vw,2.125rem)] font-medium tracking-[-0.035em]"
            >
              {profile.email}
              <Arrow dir="up-right" />
            </a>
            <CopyEmail email={profile.email} className="t-label text-fg-3 transition-colors hover:text-fg" />
          </div>
        </div>

        <footer className="pointer-events-auto mt-auto pt-24">
          <div className="grid grid-cols-12 items-baseline gap-x-6 gap-y-5 border-t border-line pt-6 pb-8">
            <ul className="col-span-12 flex flex-wrap gap-x-6 gap-y-2 md:col-span-6">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="t-small group inline-flex items-center gap-2 text-fg-2 transition-colors hover:text-fg">
                    {link.label}
                    <Arrow dir="up-right" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-small col-span-7 text-fg-3 md:col-span-4">
              © 2026 {profile.name}. Built with Next.js, Three.js and GSAP.
            </p>
            <a href="#top" className="t-small group col-span-5 inline-flex items-center justify-end gap-2 text-fg-2 transition-colors hover:text-fg md:col-span-2">
              Back to top
              <span className="-rotate-90">
                <Arrow />
              </span>
            </a>
          </div>
        </footer>
      </div>
    </MotionSection>
  );
}
