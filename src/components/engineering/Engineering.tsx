import { MotionSection } from "@/components/motion/MotionSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { decisions, incident, measured, optimisations } from "@/content/engineering";
import { LiveReadout } from "./LiveReadout";
import { LoadLabMount } from "./LoadLabMount";

/**
 * The part a senior engineer reads. Every claim here has a measurement, a
 * method, or a switch the reader can flip themselves.
 */
export function Engineering() {
  return (
    <MotionSection id="engineering" aria-labelledby="engineering-title" className="wrap py-24 md:py-32">
      <SectionHeader
        id="engineering-title"
        label="Measured, not claimed"
        title="Engineering"
        intro="Robustness, load and performance are easy to assert and easy to check. So everything below is either running on your machine right now, or reproducible on mine in one command."
      />

      <Panel index="01" title="Load test" note="Runs on your GPU">
        <p data-reveal className="t-lead mb-8 max-w-[44rem] text-fg-2">
          A frame has 16.7 ms. Push the particle count up until that budget breaks, and watch what happens when
          something has to give: pixel ratio goes first, then detail — the same order an overloaded service should
          shed work in, rather than falling over all at once.
        </p>
        <LoadLabMount />
      </Panel>

      <Panel index="02" title="This page, measured" note={measured.takenOn}>
        <LiveReadout />
        <p data-reveal className="t-small mt-4 text-fg-3">
          {measured.how}
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="t-label py-3 pr-4 font-normal text-fg-3">
                  Lighthouse
                </th>
                {measured.categories.map((category) => (
                  <th key={category} scope="col" className="t-label py-3 pr-4 font-normal text-fg-3">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measured.lighthouse.map((row) => (
                <tr key={`${row.page}-${row.profile}`} data-reveal className="border-b border-line">
                  <th scope="row" className="t-small py-4 pr-4 font-normal text-fg">
                    {row.page} <span className="text-fg-3">· {row.profile}</span>
                  </th>
                  {row.scores.map((score, index) => (
                    <td key={measured.categories[index]} className="py-4 pr-4">
                      <span className={`font-mono text-[1.125rem] ${score === 100 ? "text-glow" : "text-fg"}`}>{score}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...measured.vitals, ...measured.budget].map((item) => (
            <div key={item.label} data-reveal className="border-t border-line pt-4">
              <p className="font-mono text-[1.5rem] leading-none text-fg">{item.value}</p>
              <p className="t-small mt-2 text-fg">{item.label}</p>
              <p className="t-small mt-1 text-fg-3">{item.note}</p>
            </div>
          ))}
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {measured.guards.map((guard) => (
            <li key={guard} data-reveal className="t-small flex gap-3 text-fg-2">
              <span aria-hidden="true" className="mt-[0.6em] h-px w-4 shrink-0 bg-glow" />
              {guard}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel index="03" title="Changes with a number attached" note="Before → after">
        <ul className="grid gap-px overflow-hidden rounded-[14px] bg-line ring-1 ring-line lg:grid-cols-3">
          {optimisations.map((item) => (
            <li key={item.title} data-reveal className="flex flex-col bg-night-1 p-5 md:p-6">
              <p className="t-h4 text-[1.0625rem]">{item.title}</p>
              <p className="mt-5 flex items-baseline gap-3 font-mono text-[1.375rem]">
                <span className="text-fg-3 line-through decoration-fg-3/50">{item.before}</span>
                <span aria-hidden="true" className="text-fg-3">
                  →
                </span>
                <span className="text-glow">{item.after}</span>
              </p>
              <p className="t-label mt-2 text-fg-3">{item.unit}</p>
              <p className="t-small mt-5 text-fg-2">{item.how}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel index="04" title={incident.title} note="Post-mortem">
        <dl className="border-t border-line">
          {incident.entries.map((entry) => (
            <div key={entry.label} data-reveal className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="t-label pt-1 text-fg-3">{entry.label}</dt>
              <dd className="t-small max-w-[46rem] text-fg-2">{entry.body}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel index="05" title="Decisions" note="and what was turned down">
        <ul className="grid gap-px overflow-hidden rounded-[14px] bg-line ring-1 ring-line md:grid-cols-2">
          {decisions.map((item) => (
            <li key={item.decision} data-reveal className="flex flex-col bg-night-1 p-5 md:p-6">
              <p className="t-h4 text-[1.0625rem] text-fg">{item.decision}</p>
              <p className="t-small mt-3 text-fg-3">
                <span className="text-fg-2">Instead of:</span> {item.instead}
              </p>
              <p className="t-small mt-3 text-fg-2">{item.why}</p>
              <p className="t-label mt-4 text-glow">{item.result}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </MotionSection>
  );
}

function Panel({ index, title, note, children }: { index: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 md:mt-20">
      <div className="mb-7 border-t border-line pt-5 md:mb-9">
        <p data-reveal className="t-label flex items-center gap-3 text-fg-3">
          <span className="text-glow">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-line-3" />
          {note ?? title}
        </p>
        <h3 data-split className="t-h4 mt-4 text-[1.5rem] md:text-[1.75rem]">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}
