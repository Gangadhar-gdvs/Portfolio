import { MotionSection } from "@/components/motion/MotionSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { roles } from "@/content/experience";
import { profile } from "@/content/profile";

/** "99/100 PageSpeed" → the figure, then what it measures. */
function splitHighlight(highlight: string): [string, string] {
  const [figure, ...rest] = highlight.split(" ");
  return [figure, rest.join(" ")];
}

export function Experience() {
  return (
    <MotionSection id="experience" aria-labelledby="experience-title" className="wrap py-24 md:py-36">
      <SectionHeader
        id="experience-title"
        label={`${roles.length} product teams`}
        title="Experience"
        intro="Teams I've shipped with, from real-time energy operations to high-performance websites. Most recent first."
      />

      <ol className="mt-14 border-t border-line md:mt-20">
        {roles.map((role) => {
          const [figure, measure] = role.highlight ? splitHighlight(role.highlight) : ["", ""];
          return (
            <li key={role.company} data-reveal className="grid grid-cols-12 gap-x-6 gap-y-4 border-b border-line py-8 md:py-10">
              <p className="t-label col-span-12 text-fg-3 md:col-span-2 md:pt-1.5">{role.period || "Earlier"}</p>
              <div className="col-span-12 md:col-span-4">
                <h3 className="t-h4 text-[1.375rem] md:text-[1.5rem]">{role.company}</h3>
                <p className="t-small mt-1 text-fg-2">{role.title}</p>
              </div>
              <div className="col-span-12 md:col-span-4">
                <p className="t-body text-fg">{role.summary}</p>
                {role.note && <p className="t-small mt-2 text-fg-3">{role.note}</p>}
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${role.company} stack`}>
                  {role.stack.map((tool) => (
                    <li key={tool} className="chip">
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
              {figure && (
                <p className="col-span-12 flex items-baseline gap-3 md:col-span-2 md:flex-col md:items-end md:gap-2 md:text-right">
                  <span className="text-[2rem] leading-none font-medium tracking-[-0.045em]">{figure}</span>
                  <span className="t-small text-fg-3">{measure}</span>
                </p>
              )}
            </li>
          );
        })}
        <li data-reveal className="grid grid-cols-12 gap-x-6 gap-y-4 border-b border-line py-8 md:py-10">
          <p className="t-label col-span-12 text-fg-3 md:col-span-2 md:pt-1.5">{profile.education.year}</p>
          <div className="col-span-12 md:col-span-4">
            <h3 className="t-h4 text-[1.375rem] md:text-[1.5rem]">{profile.education.school}</h3>
            <p className="t-small mt-1 text-fg-2">Education</p>
          </div>
          <p className="t-body col-span-12 text-fg md:col-span-4">{profile.education.degree}</p>
        </li>
      </ol>
    </MotionSection>
  );
}
