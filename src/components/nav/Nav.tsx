"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLenis, scrollToTarget } from "@/components/motion/SmoothScroll";
import { profile } from "@/content/profile";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { setNavTheme, useNavTheme, type NavTheme } from "@/lib/navTheme";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "record", label: "Record" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const theme = useNavTheme();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((value: boolean) => boolean)) =>
    setOpenOn((current) => {
      const value = typeof next === "function" ? next(current === pathname) : next;
      return value ? pathname : null;
    });
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // Follow whichever ground sits under the bar. Sections that change ground
  // mid-scroll (the hero dive, the contact dome) report their own theme.
  useGSAP(
    () => {
      document.querySelectorAll<HTMLElement>("[data-nav-theme]").forEach((section) => {
        const tone = section.dataset.navTheme as NavTheme;
        ScrollTrigger.create({
          trigger: section,
          start: "top 32px",
          end: "bottom 32px",
          onToggle: (self) => {
            if (self.isActive) setNavTheme(tone);
          },
        });
      });
      if (!onHome) setNavTheme("abyss");
    },
    { dependencies: [pathname], revertOnUpdate: true },
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

  const tone = open || theme === "abyss" ? "abyss" : "surface";

  return (
    <header
      style={{ viewTransitionName: "site-nav" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${tone === "surface" ? "text-ink" : "text-bone"}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-500 ${
          tone === "surface" ? "bg-[linear-gradient(var(--color-surface),transparent)]" : "bg-[linear-gradient(var(--color-abyss),transparent)]"
        } ${open ? "opacity-0" : "opacity-90"}`}
      />
      <a
        href="#main"
        onClick={() => document.getElementById("main")?.focus({ preventScroll: true })}
        className="btn btn-glow absolute top-3 left-3 z-10 -translate-y-24 focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8 md:px-10">
        <Link href="/" className="text-[0.95rem] font-medium tracking-tight">
          {profile.name}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <SectionLink id={section.id} onHome={onHome} className="eyebrow opacity-80 transition-opacity hover:opacity-100">
                  {section.label}
                </SectionLink>
              </li>
            ))}
            <li>
              <a
                href={profile.links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className={`eyebrow rounded-full border px-4 py-2 transition-colors ${
                  tone === "surface" ? "border-ink/25 hover:border-ink" : "border-line-strong hover:border-bone"
                }`}
              >
                Résumé ↗
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="eyebrow -mr-2 p-2 md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          ref={menu}
          id="mobile-menu"
          className="menu-lens fixed inset-0 -z-10 flex flex-col justify-between bg-abyss px-5 pt-28 pb-10 sm:px-8 md:hidden"
        >
          <nav aria-label="Mobile">
            <ul className="space-y-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <SectionLink
                    id={section.id}
                    onHome={onHome}
                    onNavigate={() => setOpen(false)}
                    className="display-tight block py-1 text-[2.6rem] text-bone"
                  >
                    {section.label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="readout space-y-2 text-bone-soft">
            <a href={profile.links.resume} target="_blank" rel="noopener noreferrer" className="block text-bone">
              Résumé ↗
            </a>
            <a href={`mailto:${profile.email}`} className="block">
              {profile.email}
            </a>
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
  children: React.ReactNode;
  onNavigate?: () => void;
}

/** In-page anchors glide on the home page; elsewhere they route home first. */
function SectionLink({ id, onHome, className, children, onNavigate }: SectionLinkProps) {
  if (onHome) {
    return (
      <a
        href={`#${id}`}
        className={className}
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
    <Link href={`/#${id}`} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}
