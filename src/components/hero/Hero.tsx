import type { ReactNode } from "react";
import { Magnetic } from "@/components/chrome/Magnetic";
import { Arrow } from "@/components/ui/Arrow";
import { profile } from "@/content/profile";
import { StageDrag } from "@/gl/StageDrag";
import { vars } from "@/lib/style";
import { LocalTime } from "./LocalTime";

/**
 * The opening screen. The 3D stack stands on the right (above, on phones);
 * the copy is anchored bottom left, with the credits along the bottom edge.
 * Its entrance is CSS, so it plays before the JavaScript arrives.
 */
export function Hero() {
  return (
    <section id="top" data-stage="hero" aria-labelledby="hero-title" className="relative flex h-[100svh] min-h-[40rem] flex-col">
      <StageDrag className="absolute inset-x-0 top-16 h-[48%] md:top-20 md:right-0 md:bottom-32 md:left-auto md:h-auto md:w-[56%]" />

      <div className="wrap pointer-events-none relative mt-auto">
        <div className="pointer-events-auto max-w-[40rem]">
          <p className="t-label enter flex flex-wrap items-center gap-x-3 gap-y-2 text-fg-2" style={vars({ "--d": "80ms" })}>
            <span aria-hidden="true" className="enter-rule h-px w-8 bg-fg-3" style={vars({ "--d": "80ms" })} />
            <span>{profile.role}</span>
            <span aria-hidden="true" className="text-fg-3 max-sm:hidden">
              —
            </span>
            <span className="whitespace-nowrap text-fg-3 max-sm:w-full max-sm:pl-11">{profile.disciplines.join(" · ")}</span>
          </p>
          <h1 id="hero-title" className="t-display mt-6">
            <span className="mask">
              <span className="rise" style={vars({ "--d": "140ms" })}>
                {profile.firstName}
              </span>
            </span>{" "}
            <span className="mask">
              <span className="rise" style={vars({ "--d": "220ms" })}>
                {profile.lastName}
              </span>
            </span>
          </h1>
          <p className="t-lead enter mt-7 max-w-[26rem] text-fg-2" style={vars({ "--d": "420ms" })}>
            {profile.statement.lead} <span className="t-serif text-fg">{profile.statement.accent}</span>
          </p>
          <div className="enter mt-9 flex flex-wrap gap-3" style={vars({ "--d": "520ms" })}>
            <Magnetic>
              <a href="#work" className="btn btn-solid">
                View selected work
                <Arrow dir="down" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-line">
                Get in touch
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="enter-rule mt-12 h-px bg-line-2 md:mt-16" style={vars({ "--d": "560ms" })} />
        <div
          className="enter pointer-events-auto grid grid-cols-2 gap-x-6 gap-y-4 pt-5 pb-6 md:grid-cols-4 md:pb-8"
          style={vars({ "--d": "660ms" })}
        >
          <Credit label="Based in" className="max-md:hidden">
            {profile.locationShort}
          </Credit>
          <Credit label="Local time">
            <LocalTime timeZone={profile.timeZone} label="IST" />
          </Credit>
          <Credit label="Status">
            <span className="flex items-center gap-2.5">
              <span className="dot-live" />
              {profile.availability}
            </span>
          </Credit>
          <div className="hidden items-end justify-end gap-4 md:flex">
            <span className="t-label text-fg-3">Scroll to open the stack</span>
            <span aria-hidden="true" className="scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Credit({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <dl className={className}>
      <dt className="t-label text-fg-3">{label}</dt>
      <dd className="t-small mt-1.5 text-fg">{children}</dd>
    </dl>
  );
}
