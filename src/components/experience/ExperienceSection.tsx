import { MotionSection } from "@/components/motion/MotionSection";
import { roles } from "@/content/experience";
import { profile } from "@/content/profile";

export function ExperienceSection() {
  return (
    <MotionSection
      id="record"
      aria-labelledby="record-title"
      data-nav-theme="abyss"
      scene="record"
      className="relative pt-16 pb-28 md:pt-24 md:pb-40"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10">
        <p data-reveal className="eyebrow text-phosphor">
          Record
        </p>
        <h2 id="record-title" data-split className="display-tight mt-5 text-[clamp(2.3rem,4.8vw,4.6rem)] text-bone">
          Where I&rsquo;ve shipped.
        </h2>

        <ol className="mt-14 border-t border-line">
          {roles.map((role) => (
            <li key={role.company} data-reveal className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-6">
              <p className="readout text-bone-soft md:col-span-2">{role.period}</p>
              <div className="md:col-span-4">
                <h3 className="text-2xl font-medium text-bone">{role.company}</h3>
                <p className="mt-1 text-bone-soft">{role.title}</p>
              </div>
              <div className="md:col-span-4">
                <p className="leading-relaxed text-bone">{role.summary}</p>
                {role.note && <p className="mt-2 text-sm text-bone-soft">{role.note}</p>}
                <p className="readout mt-3 text-bone-soft">{role.stack.join("  ·  ")}</p>
              </div>
              {role.highlight && (
                <p className="md:col-span-2 md:text-right">
                  <span className="readout inline-block rounded-full border border-phosphor/40 px-3 py-1 text-phosphor">
                    {role.highlight}
                  </span>
                </p>
              )}
            </li>
          ))}
          <li data-reveal className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-6">
            <p className="readout text-bone-soft md:col-span-2">{profile.education.year}</p>
            <div className="md:col-span-4">
              <h3 className="text-2xl font-medium text-bone">{profile.education.school}</h3>
              <p className="mt-1 text-bone-soft">{profile.education.degree}</p>
            </div>
          </li>
        </ol>
      </div>
    </MotionSection>
  );
}
