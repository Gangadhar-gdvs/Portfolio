import { MotionSection } from "@/components/motion/MotionSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { layers, type Layer } from "@/content/layers";
import { StageDrag } from "@/gl/StageDrag";

/**
 * The stack opened up. Each discipline is one step of the scroll; while a
 * step is centred, its plate slides out of the 3D stack beside it.
 */
export function Capabilities() {
  return (
    <MotionSection id="capabilities" data-stage="capabilities" aria-labelledby="capabilities-title" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
        <StageDrag className="pointer-events-auto sticky top-0 h-[100svh] w-full" />
      </div>

      {/* On phones the stack stands at the top of the screen, so the copy starts below it. */}
      <div className="wrap pointer-events-none relative pt-[46svh] md:pt-[16vh]">
        <div className="pointer-events-auto bg-[linear-gradient(transparent,var(--color-night)_4rem)] pt-16 md:w-[46%] md:bg-none md:pt-0 lg:w-[40%]">
          <SectionHeader
            layout="stacked"
            id="capabilities-title"
            label="Surface to core · 5 layers"
            title="Capabilities"
            intro="Web, mobile, desktop and AI: one stack, from the interface people touch to the intelligence underneath. Every layer is backed by work I've shipped."
          />
        </div>

        <ol className="mt-[8vh]">
          {layers.map((layer, index) => (
            <Step key={layer.id} layer={layer} index={index} />
          ))}
        </ol>
      </div>
    </MotionSection>
  );
}

function Step({ layer, index }: { layer: Layer; index: number }) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <li
      id={`capability-${layer.id}`}
      aria-labelledby={`capability-${layer.id}-title`}
      className="flex min-h-[125svh] items-end md:min-h-[92svh] md:items-center"
    >
      <div
        data-stage-focus={index}
        className="pointer-events-auto w-full bg-[linear-gradient(transparent,var(--color-night)_4.5rem)] pt-20 pb-10 md:w-[46%] md:bg-none md:py-16 lg:w-[40%]"
      >
        <p data-reveal className="t-label flex items-center gap-3 text-fg-3">
          <span className="text-glow">{number}</span>
          <span aria-hidden="true" className="h-px w-6 bg-line-3" />
          {layer.short}
        </p>
        <h3 id={`capability-${layer.id}-title`} data-split className="t-h3 mt-5">
          {layer.name}
        </h3>
        <p data-reveal className="t-lead mt-5 text-fg-2">
          {layer.summary}
        </p>
        <ul className="mt-8 border-t border-line">
          {layer.evidence.map((item) => (
            <li
              key={item.detail}
              data-reveal
              className="grid grid-cols-[minmax(0,8rem)_1fr] gap-x-5 border-b border-line py-3.5 sm:grid-cols-[9.5rem_1fr]"
            >
              <span className="t-small text-fg-3">{item.source}</span>
              <span className="t-small text-fg">{item.detail}</span>
            </li>
          ))}
        </ul>
        <ul data-reveal className="mt-6 flex flex-wrap gap-2" aria-label={`${layer.name} tools`}>
          {layer.tools.map((tool) => (
            <li key={tool} className="chip">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
