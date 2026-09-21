import { profile } from "@/content/profile";

/**
 * The descent: scrolling here falls the camera through the open stack and
 * lands on the core, while the page letterboxes like a projection. It is
 * scroll-linked, never scroll-jacked — the scrollbar keeps working, and the
 * whole thing is skipped in Lite mode and with reduced motion.
 */
export function Dive() {
  return (
    <section data-stage="dive" data-stage-dive aria-label="Descending through the stack" className="dive relative h-[190svh] md:h-[210svh]">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="dive-bar dive-bar--top" />
        <div aria-hidden="true" className="dive-bar dive-bar--bottom" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-[42svh] -translate-y-1/2 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(3_5_9/0.92),transparent_70%)]"
        />
        <p className="wrap t-h3 relative max-w-[26ch] text-center text-balance">
          <span className="dive-line dive-line--first block">{profile.statement.lead.replace(/,$/, ".")}</span>
          <span className="dive-line dive-line--second absolute inset-x-0 top-0 block">
            <span className="t-serif">{profile.statement.accent}</span>
          </span>
        </p>
      </div>
    </section>
  );
}
