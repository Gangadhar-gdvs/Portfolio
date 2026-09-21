"use client";

import { useEffect, useRef, useState } from "react";
import { setLite, useLite } from "@/lib/lite";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "globe", label: "World" },
  { id: "core", label: "Core" },
  { id: "strata", label: "Path" },
  { id: "about", label: "About" },
];

/** How deep the whole page goes. A readout has to be in some unit; this is ours. */
export const FLOOR_METRES = 4000;

export function DepthNav({ name }: { name: string }) {
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    const onScroll = () => setDeep(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`d-nav${deep ? " is-deep" : ""}`}>
      <a href="#top" className="d-brand">
        <span className="d-brand-mark" aria-hidden="true" />
        <span>{name}</span>
      </a>
      <ul className="d-nav-links">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.label}</a>
          </li>
        ))}
      </ul>
    </header>
  );
}

/** The advertised way out of the motion: the same store the dark design uses. */
export function LiteSwitch() {
  const lite = useLite();
  return (
    <button type="button" className="d-lite" onClick={() => setLite(!lite)} aria-pressed={lite}>
      <span className="d-lite-dot" data-on={lite ? "" : undefined} aria-hidden="true" />
      Lite
    </button>
  );
}

/**
 * The instrument panel: how far down the reader is, in metres, and a rail that
 * fills as they fall. It writes to the DOM on an animation frame rather than
 * through React state, because scroll fires far more often than a page should
 * re-render.
 */
export function DepthHud() {
  const valueRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let shown = -1;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const span = document.documentElement.scrollHeight - window.innerHeight;
      const progress = span > 0 ? Math.min(Math.max(window.scrollY / span, 0), 1) : 0;
      const metres = Math.round((progress * FLOOR_METRES) / 5) * 5;

      if (metres !== shown) {
        shown = metres;
        if (valueRef.current) valueRef.current.textContent = `${metres.toLocaleString("en-GB")} m`;
      }
      railRef.current?.style.setProperty("--descent", progress.toFixed(4));
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="d-hud" aria-hidden="true">
      <span ref={valueRef} className="d-hud-value">
        0 m
      </span>
      <div ref={railRef} className="d-hud-rail">
        <div className="d-hud-fill" />
      </div>
      <span className="d-hud-label">Depth</span>
    </div>
  );
}

/**
 * One observer for the page: everything marked `data-d-reveal` settles when it
 * arrives, and anything already on screen is marked at once so nothing a
 * reader is mid-sentence on fades out and back in.
 */
export function Reveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-d-reveal]");
    if (targets.length === 0) return;

    const show = (el: Element) => el.classList.add("is-in");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    for (const target of targets) {
      const box = target.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) show(target);
      else observer.observe(target);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}

/** A section opening, marked with the depth it sits at. */
export function SectionHead({
  id,
  depth,
  title,
  note,
  lead,
}: {
  id: string;
  depth: number;
  title: string;
  note?: string;
  lead?: string;
}) {
  return (
    <div className="d-head">
      <div className="d-head-top" data-d-reveal>
        <span className="d-data">
          {depth.toLocaleString("en-GB")} m · {id}
        </span>
        {note && <span className="d-data d-head-note">{note}</span>}
      </div>
      <h2 id={`${id}-title`} className="d-h2 d-head-title" data-d-reveal>
        {title}
      </h2>
      {lead && (
        <p className="d-body d-head-lead" data-d-reveal style={{ ["--delay" as string]: "0.08s" }}>
          {lead}
        </p>
      )}
    </div>
  );
}
