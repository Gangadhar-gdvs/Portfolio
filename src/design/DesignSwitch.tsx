"use client";

import { designLabel, hrefFor } from "./routes";
import { designs, type Design } from "./design";

/**
 * Two segments, the current design lit. The other is a plain link: each design
 * is its own document, so opening it is a clean page load that brings only
 * that design's code, styles and fonts. Pointing at it starts fetching the
 * page, so by the time the click lands it is usually already here.
 */
export function DesignSwitch({ current, className = "" }: { current: Design; className?: string }) {
  const warm = (href: string) => {
    if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  };

  return (
    <nav className={`ds ${className}`} aria-label="Design">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {designs.map((design) =>
        design === current ? (
          <span key={design} className="ds-item is-current" aria-current="page">
            {designLabel[design]}
          </span>
        ) : (
          <a
            key={design}
            className="ds-item"
            href={hrefFor(design)}
            onPointerEnter={() => warm(hrefFor(design))}
            onFocus={() => warm(hrefFor(design))}
            onTouchStart={() => warm(hrefFor(design))}
            aria-label={`Switch to the ${designLabel[design].toLowerCase()} design`}
          >
            {designLabel[design]}
          </a>
        ),
      )}
    </nav>
  );
}

// Both designs are dark, so one neutral look sits in either without borrowing
// the other's stylesheet.
const css = `
.ds{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid rgb(255 255 255 / 0.18);border-radius:999px;background:rgb(10 10 14 / 0.6);font-size:0.75rem;line-height:1;letter-spacing:0.02em;white-space:nowrap}
.ds-item{display:inline-flex;align-items:center;min-height:28px;padding:0 0.8rem;border-radius:999px;color:rgb(255 255 255 / 0.72);text-decoration:none;transition:background-color .25s ease,color .25s ease}
a.ds-item:hover{color:#fff;background:rgb(255 255 255 / 0.1)}
a.ds-item:focus-visible{outline:2px solid #5ee0c8;outline-offset:2px}
.ds-item.is-current{background:#f4f1f7;color:#070608;font-weight:600}
.ds-lg{font-size:0.875rem}
.ds-lg .ds-item{min-height:40px;padding:0 1.25rem}
`;
