"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLenis, scrollToTarget } from "@/components/motion/SmoothScroll";
import { Arrow } from "@/components/ui/Arrow";
import { Mark } from "@/components/ui/Mark";
import { profile } from "@/content/profile";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Magnetic } from "./Magnetic";

export const SECTIONS = [
  { id: "capabilities", label: "Capabilities" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
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

  useGSAP(
    () => {
      // Show a backing once the page moves; tuck the bar away while reading
      // downwards and bring it back on the way up.
      ScrollTrigger.create({
        start: 24,
        end: "max",
        onToggle: (self) => setScrolled(self.isActive),
        onUpdate: (self) => setTucked(self.direction === 1 && self.scroll() > window.innerHeight * 0.9),
      });
      if (!onHome) return;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        ScrollTrigger.create({
          trigger: element,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) setActive(section.id);
            else setActive((current) => (current === section.id ? null : current));
          },
        });
      }
    },
    { dependencies: [pathname, onHome], revertOnUpdate: true },
  );

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

      <div className="wrap relative flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-3">
          <Mark className="size-[18px] text-fg" />
          <span className="text-[0.875rem] font-medium tracking-[-0.01em]">{profile.name}</span>
          <span className="t-label hidden text-fg-3 xl:inline">/ {profile.role}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <SectionLink
                  id={section.id}
                  onHome={onHome}
                  aria-current={active === section.id ? "true" : undefined}
                  className="group flex items-center gap-2 px-3 py-2 text-[0.8125rem] text-fg-2 transition-colors hover:text-fg aria-[current]:text-fg"
                >
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-glow opacity-0 transition-opacity group-aria-[current]:opacity-100"
                  />
                  {section.label}
                </SectionLink>
              </li>
            ))}
            <li className="ml-4">
              <Magnetic>
                <a href={profile.links.resume} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                  Résumé
                  <Arrow dir="up-right" />
                </a>
              </Magnetic>
            </li>
          </ul>
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenOn(open ? null : pathname)}
          className="t-label -mr-2 flex items-center gap-2 p-2 md:hidden"
        >
          <span aria-hidden="true" className="relative block h-2 w-4">
            <span className={`absolute inset-x-0 top-0 h-px bg-fg transition-transform duration-500 ${open ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`absolute inset-x-0 bottom-0 h-px bg-fg transition-transform duration-500 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
          </span>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          ref={menu}
          id="mobile-menu"
          className="menu-lens wrap fixed inset-0 -z-10 flex flex-col justify-between bg-night pt-28 pb-10 md:hidden"
        >
          <nav aria-label="Mobile">
            <ol className="border-t border-line">
              {SECTIONS.map((section, index) => (
                <li key={section.id} className="border-b border-line">
                  <SectionLink
                    id={section.id}
                    onHome={onHome}
                    onNavigate={() => setOpenOn(null)}
                    className="flex items-baseline justify-between py-4 text-[1.75rem] font-medium tracking-[-0.035em]"
                  >
                    {section.label}
                    <span className="t-label text-fg-3">{String(index + 1).padStart(2, "0")}</span>
                  </SectionLink>
                </li>
              ))}
            </ol>
          </nav>
          <div className="t-small space-y-3 text-fg-2">
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
