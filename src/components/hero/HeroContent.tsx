import Image from "next/image";
import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { vars } from "@/lib/style";
import { LocalTime } from "./LocalTime";

type Variant = "surface" | "xray";

/**
 * The hero, drawn twice from the same markup: once as the calm surface and
 * once as the X-ray underneath. Sharing the layout is what keeps the outlined
 * letters exactly under the solid ones when the lens passes over them.
 */
export function HeroContent({ variant }: { variant: Variant }) {
  const xray = variant === "xray";
  const Name = xray ? "p" : "h1";

  return (
    <div
      data-hero-content
      className="relative mx-auto flex h-full max-w-[1600px] flex-col px-5 pt-24 pb-6 sm:px-8 md:px-10 md:pt-28 md:pb-10"
    >
      <div className="intro-fade flex min-h-6 flex-wrap items-center gap-x-5 gap-y-1" style={vars({ "--d": "60ms" })}>
        {xray ? (
          <p className="readout text-phosphor">{`<Status open timeZone="${profile.timeZone}" />`}</p>
        ) : (
          <>
            <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <span className="status-dot size-2 rounded-full bg-ember" />
              {profile.availability}
            </p>
            <p className="readout text-ink-soft">
              {profile.locationShort} · <LocalTime timeZone={profile.timeZone} label="IST" />
            </p>
          </>
        )}
      </div>

      <div className="relative mt-8 md:mt-12" style={vars({ "--name-size": "clamp(2rem, 9.2vw, 11rem)" })}>
        {xray && (
          <p className="readout absolute -top-6 right-0 text-phosphor/75">h1 · Archivo 800 · wdth 125 · 9.2vw</p>
        )}
        <Name
          data-name
          className={`display uppercase ${xray ? "outline-type" : "text-ink"}`}
          style={{ fontSize: "var(--name-size)" }}
        >
          <NameLine delay="140ms" xray={xray}>
            {profile.firstName}
          </NameLine>
          <NameLine delay="230ms" xray={xray}>
            {profile.lastName}
          </NameLine>
        </Name>

        <figure
          className="intro-fade absolute right-0"
          style={{
            top: "calc(var(--name-size) * 0.86 + 0.75rem)",
            width: "clamp(8.5rem, min(20vw, 36vh), 19rem)",
            ...vars({ "--d": "320ms" }),
          }}
        >
          <div className={`relative aspect-[4/5] overflow-hidden rounded-[3px] ${xray ? "xray-photo" : "bg-ink/10"}`}>
            <Image
              src={profile.portrait.src}
              alt={xray ? "" : profile.portrait.alt}
              fill
              priority={!xray}
              sizes="(max-width: 768px) 32vw, 19rem"
              className="object-cover object-[50%_20%]"
            />
            {xray && <div className="scanlines absolute inset-0" />}
          </div>
          {xray && <figcaption className="readout mt-2 hidden text-phosphor/80 sm:block">x-ray · 1575 × 1600 → avif</figcaption>}
        </figure>
      </div>

      <div className="mt-auto grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7 lg:col-span-6">
          <div className="relative">
            <p
              className={`intro-fade measure text-[1.05rem] leading-relaxed md:text-xl md:leading-relaxed ${
                xray ? "invisible" : "text-ink-soft"
              }`}
              style={vars({ "--d": "420ms" })}
            >
              {profile.lede}
            </p>
            {xray && (
              <pre className="readout absolute inset-0 overflow-hidden whitespace-pre-wrap text-phosphor">
                {`<p className="lede">\n  {profile.lede}\n</p>\n// rendered on the server: readable before any JavaScript runs`}
              </pre>
            )}
          </div>

          <div className="intro-fade mt-7 flex flex-wrap gap-3" style={vars({ "--d": "520ms" })}>
            <Action href="#work" xray={xray} note='href="#work"' primary>
              See my work
            </Action>
            <Action href={`mailto:${profile.email}`} xray={xray} note='href="mailto:…"'>
              Email me
            </Action>
            <Action href={profile.links.resume} xray={xray} note='target="_blank"' external>
              Résumé ↗
            </Action>
          </div>
        </div>

        <div className="intro-fade md:col-span-5 md:text-right lg:col-span-6" style={vars({ "--d": "640ms" })}>
          {xray ? (
            <p className="readout text-phosphor">{`ScrollTrigger.create({ pin: true, end: "+=110%" })`}</p>
          ) : (
            <>
              <p className="readout text-ink-soft">
                <span className="hidden pointer-fine:inline">Move your cursor to look underneath.</span>
                <span className="pointer-fine:hidden">Tap anywhere to look underneath.</span>
              </p>
              <p className="readout mt-1 text-ink">Scroll to go under the surface ↓</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NameLine({ children, delay, xray }: { children: ReactNode; delay: string; xray: boolean }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="intro-rise block" style={vars({ "--d": delay })}>
        {children}
      </span>
      {xray && <TypeGuides />}
    </span>
  );
}

/**
 * Construction lines drawn at Archivo's real metrics: with a 0.86 line height,
 * cap height sits 0.078em from the top of the line box, x-height 0.238em and
 * the baseline 0.764em.
 */
function TypeGuides() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
      <span className="absolute inset-x-0 border-t border-dashed border-phosphor/45" style={{ top: "0.078em" }} />
      <span className="absolute inset-x-0 border-t border-dashed border-phosphor/25" style={{ top: "0.238em" }} />
      <span className="absolute inset-x-0 border-t border-phosphor/60" style={{ top: "0.764em" }} />
      <span
        className="readout absolute right-0 hidden text-phosphor/75 md:block"
        style={{ top: "calc(0.078em + 4px)", fontSize: "11px", WebkitTextStroke: "0" }}
      >
        cap height · 686
      </span>
      <span
        className="readout absolute right-0 hidden text-phosphor/75 md:block"
        style={{ top: "calc(0.764em - 18px)", fontSize: "11px", WebkitTextStroke: "0" }}
      >
        baseline
      </span>
    </span>
  );
}

interface ActionProps {
  href: string;
  children: ReactNode;
  xray: boolean;
  note: string;
  primary?: boolean;
  external?: boolean;
}

function Action({ href, children, xray, note, primary, external }: ActionProps) {
  const shape = "relative inline-flex h-11 items-center rounded-full px-5 text-[0.95rem] font-medium";
  if (xray) {
    return (
      <span className={`${shape} border border-dashed border-phosphor/70 text-transparent`}>
        {children}
        <span className="readout absolute -top-5 left-1 whitespace-nowrap text-[0.66rem] text-phosphor">{note}</span>
      </span>
    );
  }
  const look = primary
    ? "bg-ink text-surface hover:bg-phosphor-deep"
    : "border border-ink/25 text-ink hover:border-ink hover:bg-ink/[0.04]";
  return (
    <a
      href={href}
      className={`${shape} ${look} transition-colors duration-300`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
