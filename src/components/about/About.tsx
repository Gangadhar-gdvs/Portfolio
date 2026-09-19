import Image from "next/image";
import { MotionSection } from "@/components/motion/MotionSection";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltPanel } from "@/components/ui/TiltPanel";
import { profile } from "@/content/profile";
import { Counter } from "./Counter";

const LINKS = [
  { label: "GitHub", href: profile.links.github },
  { label: "LinkedIn", href: profile.links.linkedin },
  { label: "Résumé", href: profile.links.resume },
];

export function About() {
  return (
    <MotionSection id="about" aria-labelledby="about-title" className="wrap py-24 md:py-36">
      <SectionHeader id="about-title" label={profile.location} title="About" />

      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-12 md:mt-20">
        <figure data-reveal className="col-span-12 sm:col-span-8 md:col-span-5 lg:col-span-4">
          <TiltPanel max={6} className="overflow-hidden rounded-[16px] ring-1 ring-line">
            <div data-develop className="relative aspect-[4/5]">
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw"
                className="object-cover object-[50%_20%]"
              />
            </div>
          </TiltPanel>
          <figcaption className="t-label mt-4 flex justify-between gap-4 text-fg-3">
            <span>{profile.name}</span>
            <span>{profile.role}</span>
          </figcaption>
        </figure>

        <div className="col-span-12 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-6">
          <p data-split className="text-[clamp(1.375rem,1rem+1.15vw,2rem)] leading-[1.25] font-medium tracking-[-0.03em]">
            {profile.about.intro}
          </p>
          {profile.about.body.map((paragraph) => (
            <p key={paragraph} data-reveal className="t-body mt-6 max-w-[34rem] text-fg-2">
              {paragraph}
            </p>
          ))}

          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 md:grid-cols-4">
            {profile.about.stats.map((stat) => (
              <li key={stat.label} data-reveal>
                <Counter value={stat.value} suffix={stat.suffix} className="block text-[2.25rem] leading-none font-medium tracking-[-0.05em]" />
                <span className="t-small mt-2 block text-fg-3">{stat.label}</span>
              </li>
            ))}
          </ul>

          <ul data-reveal className="mt-12 flex flex-wrap gap-3">
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
