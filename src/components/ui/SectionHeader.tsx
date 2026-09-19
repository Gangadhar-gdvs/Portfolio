import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Id of the heading, for the section's aria-labelledby. */
  id: string;
  /** A short line of facts about the section, set in mono. */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** `split` puts the intro beside the title; `stacked` keeps both in one column. */
  layout?: "split" | "stacked";
}

/** The same opening for every section: a hairline, a label, the title and an intro. */
export function SectionHeader({ id, label, title, intro, layout = "split" }: SectionHeaderProps) {
  const split = layout === "split";
  return (
    <header className="grid grid-cols-12 gap-x-6">
      <div data-draw-line className="col-span-12 h-px bg-line-2" />
      <p data-reveal className="t-label col-span-12 mt-5 flex items-center gap-3 text-fg-3">
        <span aria-hidden="true" className="size-1.5 bg-glow" />
        {label}
      </p>
      <h2 id={id} data-split className={`t-h2 col-span-12 mt-10 md:mt-14 ${split ? "md:col-span-6" : ""}`}>
        {title}
      </h2>
      {intro && (
        <p
          data-reveal
          className={`t-lead col-span-12 mt-6 text-fg-2 ${split ? "md:col-span-5 md:col-start-8 md:mt-14 md:self-end" : "max-w-[32rem]"}`}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
