import Image from "next/image";
import { MotionSection } from "@/components/motion/MotionSection";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltPanel } from "@/components/ui/TiltPanel";
import { profile } from "@/content/profile";

const LINKS = [
  { label: "GitHub", href: profile.links.github },
  { label: "LinkedIn", href: profile.links.linkedin },
  { label: "Résumé", href: profile.links.resume },
];

export function About() {
  return (
    <MotionSection id="about" aria-labelledby="about-title" className="wrap py-24 md:py-32">
      <SectionHeader
        id="about-title"
        label={profile.location}
        title="About"
        intro="A full-stack engineer a year into the industry, building things end to end and measuring what they cost."
      />

      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-12 md:mt-20">
        <figure data-reveal className="col-span-12 sm:col-span-7 md:col-span-4 lg:col-span-3">
          <TiltPanel max={6} className="overflow-hidden rounded-[16px] ring-1 ring-line">
            <div data-develop className="relative aspect-[4/5]">
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                fill
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 34vw, 80vw"
                className="object-cover object-[50%_20%]"
              />
            </div>
          </TiltPanel>
          <figcaption className="t-label mt-4 flex justify-between gap-4 text-fg-3">
            <span>{profile.name}</span>
            <span>{profile.education.year} graduate</span>
          </figcaption>
        </figure>

        <div className="col-span-12 md:col-span-8 md:col-start-6 lg:col-span-8 lg:col-start-5">
          <p data-split className="text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] leading-[1.3] font-medium tracking-[-0.028em]">
            {profile.about.intro}
          </p>
          {profile.about.body.map((paragraph) => (
            <p key={paragraph} data-reveal className="t-body mt-5 max-w-[38rem] text-fg-2">
              {paragraph}
            </p>
          ))}

          <ul className="mt-12 grid gap-px overflow-hidden rounded-[14px] bg-line ring-1 ring-line md:grid-cols-3">
            {profile.about.principles.map((principle) => (
              <li key={principle.title} data-reveal className="bg-night-1 p-5">
                <p className="t-h4 text-[1rem]">{principle.title}</p>
                <p className="t-small mt-2.5 text-fg-2">{principle.body}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-12 grid gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
            <div data-reveal>
              <dt className="t-label text-fg-3">Education</dt>
              <dd className="t-small mt-2 text-fg">
                {profile.education.degree}
                <span className="block text-fg-3">
                  {profile.education.school} · {profile.education.year}
                </span>
              </dd>
            </div>
            <div data-reveal>
              <dt className="t-label text-fg-3">Right now</dt>
              <dd className="t-small mt-2 text-fg">
                {profile.availability}
                <span className="block text-fg-3">{profile.location}</span>
              </dd>
            </div>
          </dl>

          <ul data-reveal className="mt-10 flex flex-wrap gap-3">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                  {link.label}
                  <Arrow dir="up-right" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MotionSection>
  );
}
