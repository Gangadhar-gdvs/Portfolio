"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MotionSection } from "@/components/motion/MotionSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteStack, skillGroups, type Skill } from "@/content/skills";
import { motionAllowed } from "@/lib/motionRuntime";

const ALL = "all";

interface Entry extends Skill {
  group: string;
  groupId: string;
}

const entries: Entry[] = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({ ...skill, group: group.name, groupId: group.id })),
);

/**
 * Skills as a filterable index. Changing the filter re-lays the grid out with
 * a FLIP: measure where every cell was, let React place them, then animate the
 * difference away. It runs on the compositor, and not at all in Lite mode.
 */
export function Skills() {
  const [active, setActive] = useState<string>(ALL);
  const list = useRef<HTMLUListElement>(null);
  const previous = useRef(new Map<string, DOMRect>());

  const shown = active === ALL ? entries : entries.filter((entry) => entry.groupId === active);

  const choose = (next: string) => {
    if (next === active) return;
    if (motionAllowed()) {
      previous.current.clear();
      list.current?.querySelectorAll<HTMLElement>("[data-skill]").forEach((cell) => {
        previous.current.set(cell.dataset.skill ?? "", cell.getBoundingClientRect());
      });
    }
    setActive(next);
  };

  useLayoutEffect(() => {
    if (previous.current.size === 0) return;
    list.current?.querySelectorAll<HTMLElement>("[data-skill]").forEach((cell) => {
      const key = cell.dataset.skill ?? "";
      const before = previous.current.get(key);
      const now = cell.getBoundingClientRect();
      if (!before) {
        cell.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], {
          duration: 280,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        });
        return;
      }
      const dx = before.left - now.left;
      const dy = before.top - now.top;
      if (dx || dy) {
        cell.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
          duration: 420,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        });
      }
    });
    previous.current.clear();
  }, [active]);

  return (
    <MotionSection id="skills" aria-labelledby="skills-title" className="wrap py-24 md:py-32">
      <SectionHeader
        id="skills-title"
        label={`${entries.length} skills · each with the work behind it`}
        title="Skills"
        intro="Grouped by what they are for, and tagged with where they were used. No percentage bars: a bar filled to 80% is a number with no scale under it."
      />

      <div data-reveal className="mt-12 flex flex-wrap items-center gap-2 md:mt-16">
        <Filter id={ALL} active={active} onChoose={choose} count={entries.length}>
          Everything
        </Filter>
        {skillGroups.map((group) => (
          <Filter key={group.id} id={group.id} active={active} onChoose={choose} count={group.skills.length}>
            {group.name}
          </Filter>
        ))}
      </div>

      <ul
        ref={list}
        aria-label="Skills"
        className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] bg-line ring-1 ring-line md:grid-cols-3 xl:grid-cols-4"
      >
        {shown.map((entry) => (
          <li key={entry.name} data-skill={entry.name} className="flex flex-col gap-1.5 bg-night-1 p-4 md:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.9375rem] font-medium tracking-[-0.012em]">{entry.name}</span>
              <span
                title={entry.level === "production" ? "Shipped for a company or client" : "Built in my own projects"}
                className={`t-label shrink-0 ${entry.level === "production" ? "text-glow" : "text-fg-3"}`}
              >
                {entry.level === "production" ? "prod" : "own"}
              </span>
            </div>
            <span className="t-small text-fg-3">{entry.proof}</span>
          </li>
        ))}
      </ul>

      <p data-reveal className="t-small mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-fg-3">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="t-label text-glow">
            prod
          </span>
          shipped for a company or client
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="t-label">
            own
          </span>
          built in my own projects
        </span>
      </p>

      <div className="mt-20 md:mt-28">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
          <h3 data-split className="t-h4 text-[1.5rem] md:text-[1.75rem]">
            This page&rsquo;s stack
          </h3>
          <p data-reveal className="t-label text-fg-3">
            Versions, not logos
          </p>
        </div>
        <ul className="border-t border-line">
          {siteStack.map((item) => (
            <li
              key={item.name}
              data-reveal
              className="grid grid-cols-12 items-baseline gap-x-6 gap-y-1 border-b border-line py-4 md:py-5"
            >
              <span className="col-span-8 text-[0.9375rem] font-medium tracking-[-0.012em] md:col-span-3">{item.name}</span>
              <span className="t-label col-span-4 text-right text-fg-3 md:col-span-2 md:text-left">{item.version}</span>
              <span className="t-small col-span-12 text-fg-2 md:col-span-7">{item.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </MotionSection>
  );
}

function Filter({
  id,
  active,
  count,
  onChoose,
  children,
}: {
  id: string;
  active: string;
  count: number;
  onChoose: (id: string) => void;
  children: React.ReactNode;
}) {
  const on = active === id;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChoose(id)}
      className="t-label flex h-9 items-center gap-2 rounded-full px-4 text-fg-2 ring-1 ring-line-2 transition-colors hover:text-fg hover:ring-line-3 aria-pressed:bg-fg aria-pressed:text-night aria-pressed:ring-fg"
    >
      {children}
      <span className={on ? "text-night/60" : "text-fg-3"}>{count}</span>
    </button>
  );
}
