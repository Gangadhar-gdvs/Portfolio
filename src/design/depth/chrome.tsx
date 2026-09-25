"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "globe", label: "World" },
  { id: "core", label: "Core" },
  { id: "strata", label: "Path" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/**
 * Scroll to where a section's content begins, just under the fixed bar.
 *
 * A plain `#id` jump puts the section's top edge at the top of the window,
 * and every section here opens with a deep band of padding — so the reader
 * landed on empty space with the heading halfway down, partly under the bar.
 * This measures the padding and the bar and lands on the words.
 */
function goTo(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const bar = document.querySelector<HTMLElement>(".d-nav")?.offsetHeight ?? 0;
  const padding = id === "top" ? 0 : parseFloat(getComputedStyle(section).paddingTop) || 0;
  const top = section.getBoundingClientRect().top + window.scrollY + padding - bar - 20;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top), behavior: still ? "auto" : "smooth" });
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
}

export function DepthNav({ name }: { name: string }) {
  const [deep, setDeep] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setDeep(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open: the page behind it holds still, Escape closes it,
  // and focus moves into it — then back to the button when it closes.
  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  // Land on a section after the menu has closed and the page can scroll again.
  const follow = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    if (open) {
      setOpen(false);
      requestAnimationFrame(() => requestAnimationFrame(() => goTo(id)));
    } else {
      goTo(id);
    }
  };

  return (
    <>
      <header className={`d-nav${deep ? " is-deep" : ""}${open ? " is-open" : ""}`}>
        <a href="#top" className="d-brand" onClick={(event) => follow(event, "top")}>
          <span className="d-brand-mark" aria-hidden="true" />
          <span>{name}</span>
        </a>
        <ul className="d-nav-links">
          {SECTIONS.filter((section) => section.id !== "contact").map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} onClick={(event) => follow(event, section.id)}>
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          ref={buttonRef}
          type="button"
          className="d-burger"
          aria-expanded={open}
          aria-controls="d-menu"
          aria-label={open ? "Close the menu" : "Open the menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="d-burger-lines" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </header>

      <div id="d-menu" className={`d-menu${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="Sections">
          <ol className="d-menu-list">
            {SECTIONS.map((section, index) => (
              <li key={section.id} style={{ ["--i" as string]: index }}>
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={`#${section.id}`}
                  onClick={(event) => follow(event, section.id)}
                >
                  <span className="d-menu-label">{section.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="d-menu-foot d-data">{name} · the deeper you go, the closer to the work</p>
      </div>
    </>
  );
}

/**
 * One observer for the page: everything marked `data-d-reveal` settles when it
 * arrives, and anything already on screen is marked at once so nothing a
 * reader is mid-sentence on fades out and back in.
 */
export function Reveal() {
  useEffect(() => {
    const pending = new Set(document.querySelectorAll<HTMLElement>("[data-d-reveal]"));
    if (pending.size === 0) return;

    const show = (el: HTMLElement) => {
      el.classList.add("is-in");
      pending.delete(el);
      observer.unobserve(el);
    };

    // Reveal an element once it has risen into the reading zone — the lower
    // third of the viewport — not the instant it peeks in at the very bottom.
    // Triggering here means the motion plays where the eye actually is, so the
    // entrance is felt instead of finishing off-screen.
    const sweep = () => {
      for (const el of pending) {
        const box = el.getBoundingClientRect();
        if (box.top < window.innerHeight * 0.78 && box.bottom > window.innerHeight * 0.05) show(el);
      }
      if (pending.size === 0) {
        window.removeEventListener("scroll", sweep);
        window.removeEventListener("resize", sweep);
      }
    };

    // The observer is the primary trigger; a passive scroll sweep backs it up
    // so a missed intersection callback can never leave a section hidden.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -22% 0px", threshold: 0.05 },
    );

    for (const el of pending) observer.observe(el);
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
    };
  }, []);

  return null;
}

/**
 * Pointer tilt for the card language. Each `.d-slab` leans toward the cursor
 * in 3D, then settles back on leave. Fine pointers only, and never under
 * reduced motion — touch and reduced-motion readers get the flat card.
 */
export function DepthTilt() {
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".d-slab"));
    if (cards.length === 0) return;

    const cleanups: (() => void)[] = [];
    for (const card of cards) {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transition = "transform 0.12s ease-out";
        card.style.transform = `perspective(1000px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-2px)`;
      };
      const leave = () => {
        card.style.transition = "";
        card.style.transform = "";
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}

/** A section opening: a plain label, the heading, and an optional lead. */
export function SectionHead({
  id,
  label,
  title,
  note,
  lead,
}: {
  id: string;
  label: string;
  title: string;
  note?: string;
  lead?: string;
}) {
  return (
    <div className="d-head">
      <div className="d-head-top" data-d-reveal>
        <span className="d-data">{label}</span>
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
