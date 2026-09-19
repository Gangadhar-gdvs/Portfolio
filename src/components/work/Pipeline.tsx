/**
 * A project's data flow with a pulse travelling each link. It runs left to
 * right when its card is wide enough, and top to bottom when it isn't, so a
 * link never dangles at the end of a wrapped row.
 */
export function Pipeline({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol aria-label={label} className="flex flex-col items-start @md:flex-row @md:items-center">
      {steps.map((step, index) => (
        <li key={step} className="flex flex-col items-start @md:flex-row @md:items-center">
          <span className="readout rounded-[3px] border border-line-strong bg-abyss/70 px-2 py-1 text-[0.7rem] whitespace-nowrap text-bone transition-colors duration-500 group-hover:border-phosphor/60">
            {step}
          </span>
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="pipe-link">
              <span className="pipe-pulse" style={{ animationDelay: `${index * 0.3}s` }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
