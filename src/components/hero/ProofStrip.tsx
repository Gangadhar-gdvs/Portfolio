import { Counter } from "@/components/about/Counter";
import { MotionSection } from "@/components/motion/MotionSection";
import { profile } from "@/content/profile";

/**
 * The first thing after the hero: four numbers a reader can check elsewhere on
 * the page, so the ten-second scan lands on evidence rather than adjectives.
 */
export function ProofStrip() {
  return (
    <MotionSection data-stage="capabilities" aria-label="At a glance" className="wrap pt-[12vh] pb-[14vh]">
      <div data-draw-line className="h-px bg-line-2" />
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 pt-8 md:grid-cols-4 md:pt-10">
        {profile.about.stats.map((stat) => (
          <li key={stat.label} data-reveal>
            <Counter
              value={stat.value}
              suffix={stat.suffix}
              className="block text-[clamp(2.25rem,1.4rem+2.4vw,3.25rem)] leading-none font-medium tracking-[-0.05em]"
            />
            <p className="t-small mt-3 max-w-[14rem] text-fg-2">{stat.label}</p>
          </li>
        ))}
      </ul>
    </MotionSection>
  );
}
