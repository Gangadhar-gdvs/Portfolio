"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLenis, scrollToTarget } from "@/components/motion/SmoothScroll";
import { Arrow } from "@/components/ui/Arrow";
import { Mark } from "@/components/ui/Mark";
import { profile } from "@/content/profile";
import { Magnetic } from "./Magnetic";
import { LiteToggle } from "./LiteToggle";

export const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "capabilities", label: "Capabilities" },
  { id: "skills", label: "Skills" },
  { id: "engineering", label: "Engineering" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [active, setActive] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // Plain observers: the bar has to work before the motion layer loads, and
  // in Lite mode it never loads at all.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setTucked(y > last + 4 && y > window.innerHeight * 0.9);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const sections = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;
    // Whichever section crosses the middle of the screen is the current one.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
          else setActive((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome, pathname]);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    const button = menuButton.current;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      button?.focus();
    };
  }, [open]);

  const hidden = tucked && !open;

  return (
    <header
      style={{ viewTransitionName: "site-nav" }}
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-out-expo ${hidden ? "-translate-y-full" : ""}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(var(--color-night)_20%,transparent)] transition-opacity duration-500 ${
          scrolled && !open ? "opacity-100" : "opacity-0"
        }`}
      />
      <a
        href="#main"
        onClick={() => document.getElementById("main")?.focus({ preventScroll: true })}
        className="btn btn-solid btn-sm absolute top-3 left-3 z-10 -translate-y-24 focus-visible:translate-y-0"
      >
        Skip to content
      </a>

      <div className="wrap relative flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Mark className="size-[18px] text-fg" />
          <span className="text-[0.875rem] font-medium tracking-[-0.01em]">{profile.name}</span>
          <span className="t-label hidden text-fg-3 2xl:inline">/ {profile.role}</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <SectionLink
                  id={section.id}
                  onHome={onHome}
                  aria-current={active === section.id ? "true" : undefined}
                  className="group flex items-center gap-2 px-2.5 py-2 text-[0.8125rem] text-fg-2 transition-colors hover:text-fg aria-[current]:text-fg xl:px-3"
                >
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-glow opacity-0 transition-opacity group-aria-[current]:opacity-100"
                  />
                  {section.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LiteToggle />
          <Magnetic>
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-line btn-sm max-sm:hidden"
            >
              Résumé
              <Arrow dir="up-right" />
            </a>
          </Magnetic>
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpenOn(open ? null : pathname)}
            className="t-label -mr-2 flex items-center gap-2 p-2 lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-2 w-4">
              <span className={`absolute inset-x-0 top-0 h-px bg-fg transition-transform duration-500 ${open ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`absolute inset-x-0 bottom-0 h-px bg-fg transition-transform duration-500 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={menu}
          id="mobile-menu"
          className="menu-lens wrap fixed inset-0 -z-10 flex flex-col justify-between overflow-y-auto bg-night pt-24 pb-10 lg:hidden"
        >
          <nav aria-label="Mobile">
            <ol className="border-t border-line">
              {SECTIONS.map((section, index) => (
                <li key={section.id} className="border-b border-line">
                  <SectionLink
                    id={section.id}
                    onHome={onHome}
                    onNavigate={() => setOpenOn(null)}
                    className="flex items-baseline justify-between py-3.5 text-[1.5rem] font-medium tracking-[-0.035em]"
                  >
                    {section.label}
                    <span className="t-label text-fg-3">{String(index + 1).padStart(2, "0")}</span>
                  </SectionLink>
                </li>
              ))}
            </ol>
          </nav>
          <div className="t-small mt-8 space-y-3 text-fg-2">
            <a href={profile.links.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg">
              Résumé <Arrow dir="up-right" />
            </a>
            <a href={`mailto:${profile.email}`} className="block">
              {profile.email}
            </a>
            <p className="flex items-center gap-2.5">
              <span className="dot-live" />
              {profile.availability}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

interface SectionLinkProps {
  id: string;
  onHome: boolean;
  className: string;
  children: ReactNode;
  onNavigate?: () => void;
  "aria-current"?: "true";
}

/** In-page anchors glide on the home page; elsewhere they route home first. */
function SectionLink({ id, onHome, className, children, onNavigate, ...rest }: SectionLinkProps) {
  if (onHome) {
    return (
      <a
        href={`#${id}`}
        className={className}
        {...rest}
        onClick={(event) => {
          if (!onNavigate) return; // Lenis handles plain anchor clicks.
          // From the open menu: close it (which resumes scrolling), then glide.
          event.preventDefault();
          onNavigate();
          requestAnimationFrame(() => scrollToTarget(`#${id}`));
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={`/#${id}`} className={className} onClick={onNavigate} {...rest}>
      {children}
    </Link>
  );
}
