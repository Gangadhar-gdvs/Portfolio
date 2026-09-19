"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clamp, easeInCubic, easeInOutCubic, lerp, progressBetween } from "@/lib/math";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { setNavTheme } from "@/lib/navTheme";

interface HeroProps {
  surface: ReactNode;
  xray: ReactNode;
}

/**
 * The surface with a hole in it. The lens follows the cursor (or roams on
 * touch screens), and scrolling grows it until the surface is gone.
 */
export function Hero({ surface, xray }: HeroProps) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stageEl = stage.current;
      const sectionEl = section.current;
      if (!stageEl || !sectionEl) return;

      const xrayEl = stageEl.querySelector<HTMLElement>("[data-xray]");
      const surfaceContent = stageEl.querySelector<HTMLElement>("[data-surface] [data-hero-content]");
      const rimEl = stageEl.querySelector<HTMLElement>("[data-lens-rim]");
      const readout = stageEl.querySelector<HTMLElement>("[data-lens-readout]");
      const nameEl = stageEl.querySelector<HTMLElement>("[data-surface] [data-name]");

      setNavTheme("surface");

      if (prefersReducedMotion()) {
        // No lens, no pin: the surface simply scrolls away.
        ScrollTrigger.create({
          trigger: sectionEl,
          start: "top top",
          end: "bottom 40px",
          onLeave: () => setNavTheme("abyss"),
          onEnterBack: () => setNavTheme("surface"),
        });
        return;
      }

      let width = stageEl.clientWidth;
      let height = stageEl.clientHeight;
      const baseRadius = () => clamp(Math.min(width, height) * 0.2, 84, 168);

      const lens = { x: width * 0.72, y: height * 0.55, r: 0, dive: 0 };
      const written = { x: NaN, y: NaN, r: NaN, base: NaN };

      const render = () => {
        const d = lens.dive;
        const centreMix = easeInOutCubic(progressBetween(d, 0, 0.7));
        const x = lerp(lens.x, width / 2, centreMix);
        const y = lerp(lens.y, height / 2, centreMix);
        const r = lerp(lens.r, Math.hypot(width, height) * 0.6 + 40, easeInCubic(d));
        if (Math.abs(x - written.x) < 0.1 && Math.abs(y - written.y) < 0.1 && Math.abs(r - written.r) < 0.1) return;
        written.x = x;
        written.y = y;
        written.r = r;
        const base = baseRadius();
        if (rimEl && base !== written.base) {
          written.base = base;
          rimEl.style.setProperty("--lb", `${base}px`);
        }
        stageEl.style.setProperty("--lx", `${x.toFixed(1)}px`);
        stageEl.style.setProperty("--ly", `${y.toFixed(1)}px`);
        stageEl.style.setProperty("--lr", `${Math.max(0, r).toFixed(1)}px`);
        rimEl?.style.setProperty("--ls", (Math.max(0, r) / base).toFixed(4));
        if (readout) readout.textContent = `x ${Math.round(x)} · y ${Math.round(y)}`;
      };
      gsap.ticker.add(render);

      const resize = new ResizeObserver(() => {
        width = stageEl.clientWidth;
        height = stageEl.clientHeight;
      });
      resize.observe(stageEl);

      // Rest on the portrait, where the X-ray photo is worth seeing.
      const portraitEl = stageEl.querySelector<HTMLElement>("[data-surface] figure");
      const restingPoint = () => {
        if (!portraitEl) return { x: width * 0.75, y: height * 0.45 };
        const stageBox = stageEl.getBoundingClientRect();
        const box = portraitEl.getBoundingClientRect();
        return { x: box.left - stageBox.left + box.width / 2, y: box.top - stageBox.top + box.height * 0.42 };
      };

      // Intro: the lens opens on the first letter and sweeps across the name,
      // showing what the page is about before anyone has to discover it.
      const intro = gsap.timeline({ delay: 0.75 });
      if (nameEl) {
        const stageBox = stageEl.getBoundingClientRect();
        const nameBox = nameEl.getBoundingClientRect();
        const lineY = nameBox.top - stageBox.top + nameBox.height * 0.27;
        intro
          .set(lens, { x: nameBox.left - stageBox.left + baseRadius() * 0.4, y: lineY, r: 0 })
          .to(lens, { r: baseRadius() * 0.85, duration: 0.7, ease: "expo.out" })
          .to(
            lens,
            { x: nameBox.right - stageBox.left - baseRadius() * 0.5, duration: 1.5, ease: "power2.inOut" },
            "<0.15",
          );
      }
      const rest = restingPoint();
      intro.to(lens, { x: rest.x, y: rest.y, r: baseRadius(), duration: 1.1, ease: "power3.inOut" });

      const cleanups: (() => void)[] = [];

      if (hasFinePointer()) {
        const toX = gsap.quickTo(lens, "x", { duration: 0.6, ease: "power3" });
        const toY = gsap.quickTo(lens, "y", { duration: 0.6, ease: "power3" });
        const onMove = (event: PointerEvent) => {
          if (intro.isActive()) {
            intro.kill();
            gsap.to(lens, { r: baseRadius(), duration: 0.5, ease: "power3.out" });
          }
          const box = stageEl.getBoundingClientRect();
          toX(event.clientX - box.left);
          toY(event.clientY - box.top);
        };
        stageEl.addEventListener("pointermove", onMove);
        cleanups.push(() => stageEl.removeEventListener("pointermove", onMove));
      } else {
        // Touch: drift slowly between the name and the portrait; a tap moves
        // the lens there, then drifting resumes.
        const roam = gsap
          .timeline({ repeat: -1, paused: true, defaults: { duration: 3.2, ease: "sine.inOut" } })
          .to(lens, { x: () => width * 0.3, y: () => height * 0.3 })
          .to(lens, { x: () => width * 0.7, y: () => height * 0.34 })
          .to(lens, { x: () => width * 0.5, y: () => height * 0.62 })
          .to(lens, { x: () => restingPoint().x, y: () => restingPoint().y });
        intro.eventCallback("onComplete", () => roam.play());

        let resume: gsap.core.Tween | null = null;
        const onTap = (event: PointerEvent) => {
          if (event.pointerType === "mouse") return;
          intro.progress(1);
          roam.pause();
          resume?.kill();
          const box = stageEl.getBoundingClientRect();
          gsap.to(lens, {
            x: event.clientX - box.left,
            y: event.clientY - box.top,
            r: baseRadius(),
            duration: 0.7,
            ease: "power3.out",
            overwrite: "auto",
          });
          resume = gsap.delayedCall(3.5, () => roam.play());
        };
        stageEl.addEventListener("pointerdown", onTap);
        cleanups.push(() => {
          stageEl.removeEventListener("pointerdown", onTap);
          resume?.kill();
        });
      }

      // The dive: pin the hero and let scrolling open the lens to full screen.
      ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: "+=110%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (p > 0.02 && intro.isActive()) intro.progress(1);
          lens.dive = p;
          if (xrayEl) xrayEl.style.opacity = String(1 - progressBetween(p, 0.55, 0.95));
          if (rimEl) rimEl.style.opacity = String(1 - progressBetween(p, 0.35, 0.7));
          if (surfaceContent) surfaceContent.style.transform = `scale(${1 + easeInCubic(p) * 0.08})`;
          // Switch once the lens has swallowed the bar.
          setNavTheme(p > 0.78 ? "abyss" : "surface");
        },
      });

      return () => {
        gsap.ticker.remove(render);
        resize.disconnect();
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope: section },
  );

  return (
    <section ref={section} id="top" aria-label="Introduction" className="relative">
      <div ref={stage} className="hero-stage">
        <div data-xray aria-hidden="true" className="hero-layer grid-underlay text-bone">
          {xray}
        </div>
        <div data-surface data-tone="surface" className="hero-layer hero-surface">
          {surface}
        </div>
        <div data-lens-rim aria-hidden="true" className="lens-rim">
          <span
            data-lens-readout
            className="readout absolute top-full left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap text-[0.68rem] text-phosphor"
          />
        </div>
      </div>
    </section>
  );
}
