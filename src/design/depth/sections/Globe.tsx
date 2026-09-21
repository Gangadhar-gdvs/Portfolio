"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/skills";
import { useGraphics } from "@/gl/useGraphics";
import { useLite } from "@/lib/lite";
import type { GlobeSkill, SkillGlobe } from "../gl/globe";

/** One colour per discipline, used on the globe, the legend and the arcs. */
export const GROUP_COLOURS: Record<string, string> = {
  frontend: "#ff6b2c",
  devices: "#ffb03a",
  backend: "#5ee0c8",
  data: "#7aa2ff",
  ai: "#c98bff",
  practice: "#8ce99a",
};

const SKILLS: GlobeSkill[] = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({
    id: `${group.id}-${skill.name}`,
    name: skill.name,
    group: group.id,
    groupName: group.name,
    level: skill.level,
    proof: skill.proof,
  })),
);

/** What a reader can do with it, said out loud rather than left to be found. */
const CONTROLS = [
  "Drag to turn it — on a phone swipe sideways; up and down still scrolls the page",
  "Throw it and it keeps going",
  "Pinch, the + and − buttons, or ⌘-scroll to zoom",
  "Hover an icon to read where that skill was used",
  "Click to lock one and turn the globe to it",
  "Locking draws the arcs to the rest of its discipline",
  "Filter by discipline",
  "Filter by production work or own project",
  "Arrow keys turn it, + and − zoom",
  "Enter steps through, Escape lets go",
];

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<SkillGlobe | null>(null);
  const [hovered, setHovered] = useState<GlobeSkill | null>(null);
  const [selected, setSelected] = useState<GlobeSkill | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [level, setLevel] = useState<"production" | "project" | null>(null);

  const lite = useLite();
  const graphics = useGraphics();
  const webgl = graphics === "gpu" && !lite;

  useEffect(() => {
    if (!webgl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const cleanups: (() => void)[] = [];
    let handle: number | undefined;

    // Building 40 extruded icons and five thousand city lights is a long task,
    // so it waits until the reader is about a screen away from the globe
    // rather than landing on the first idle moment after load, where it held
    // a phone's main thread for over a second before anyone had scrolled.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        handle = idle(build) as number;
      },
      { rootMargin: "100% 0px" },
    );
    approach.observe(canvas);

    const build = async () => {
      const { SkillGlobe } = await import("../gl/globe");
      if (cancelled) return;

      const globe = new SkillGlobe({
        canvas,
        skills: SKILLS,
        colours: GROUP_COLOURS,
        onHover: setHovered,
        onSelect: setSelected,
      });
      globeRef.current = globe;
      globe.start();

      let last: { x: number; y: number } | null = null;
      const pointers = new Map<number, { x: number; y: number }>();

      const clip = (event: PointerEvent) => {
        const box = canvas.getBoundingClientRect();
        return {
          x: ((event.clientX - box.left) / box.width) * 2 - 1,
          y: -(((event.clientY - box.top) / box.height) * 2 - 1),
        };
      };

      const onDown = (event: PointerEvent) => {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        last = { x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
      };

      const onMove = (event: PointerEvent) => {
        const point = clip(event);
        globe.setPointer(point.x, point.y, true);

        if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        // Two fingers: pinch to zoom rather than turn.
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          globe.setPinch(Math.hypot(a.x - b.x, a.y - b.y));
          return;
        }

        if (!last || !pointers.has(event.pointerId)) return;
        globe.drag(event.clientX - last.x, event.clientY - last.y);
        last = { x: event.clientX, y: event.clientY };
      };

      const onUp = (event: PointerEvent) => {
        pointers.delete(event.pointerId);
        if (pointers.size < 2) globe.endPinch();
        if (pointers.size === 0) {
          last = null;
          globe.endDrag();
        }
      };

      const onLeave = () => {
        globe.setPointer(0, 0, false);
        globe.endDrag();
      };

      const onWheel = (event: WheelEvent) => {
        if (!event.ctrlKey && !event.metaKey) return; // let the page scroll
        event.preventDefault();
        globe.zoomBy(event.deltaY * 0.0022);
      };

      const onClick = () => globe.focus(null);
      const onResize = () => globe.resize();

      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("resize", onResize);
      cleanups.push(
        () => canvas.removeEventListener("pointerdown", onDown),
        () => canvas.removeEventListener("pointermove", onMove),
        () => canvas.removeEventListener("pointerup", onUp),
        () => canvas.removeEventListener("pointercancel", onUp),
        () => canvas.removeEventListener("pointerleave", onLeave),
        () => canvas.removeEventListener("wheel", onWheel),
        () => window.removeEventListener("resize", onResize),
      );
      void onClick;

      // Nothing renders while the globe is off screen.
      const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? globe.start() : globe.stop()), {
        threshold: 0,
      });
      observer.observe(canvas);
      cleanups.push(() => observer.disconnect());
    };

    return () => {
      cancelled = true;
      approach.disconnect();
      if (handle !== undefined && window.cancelIdleCallback) window.cancelIdleCallback(handle);
      for (const cleanup of cleanups) cleanup();
      globeRef.current?.dispose();
      globeRef.current = null;
    };
  }, [webgl]);

  useEffect(() => {
    globeRef.current?.setFilter({ group, level });
  }, [group, level]);

  /** Click picks whatever the globe currently has under the pointer. */
  const onCanvasClick = useCallback(() => {
    if (hovered) globeRef.current?.focus(hovered.id);
    else globeRef.current?.focus(null);
  }, [hovered]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const globe = globeRef.current;
    if (!globe) return;
    const step = event.shiftKey ? 0.28 : 0.12;

    switch (event.key) {
      case "ArrowLeft":
        globe.nudge(-step, 0);
        break;
      case "ArrowRight":
        globe.nudge(step, 0);
        break;
      case "ArrowUp":
        globe.nudge(0, -step);
        break;
      case "ArrowDown":
        globe.nudge(0, step);
        break;
      case "+":
      case "=":
        globe.zoomBy(-0.4);
        break;
      case "-":
      case "_":
        globe.zoomBy(0.4);
        break;
      case "Enter":
      case " ":
        globe.step(1);
        break;
      case "Escape":
        globe.reset();
        break;
      default:
        return;
    }
    event.preventDefault();
  }, []);

  const shown = selected ?? hovered;

  return (
    <section id="globe" className="d-globe" aria-labelledby="globe-title">
      <div className="d-wrap d-globe-head">
        <span className="d-data" data-d-reveal>
          Skills
        </span>
        <h2 id="globe-title" className="d-h2" data-d-reveal>
          Everything I work with, as one place
        </h2>
        <p className="d-body" data-d-reveal>
          {SKILLS.length} skills, each one an icon standing on the surface, carrying the work that proves it. Turn it,
          zoom it, lock one and it shows you the rest of its discipline. No percentage bars: a bar filled to 80% is
          a number with no scale under it.
        </p>
        <p className="d-data" data-d-reveal>
          Coastlines and borders: Natural Earth 1:50m, public domain · City lights: GeoNames populated places, CC BY 4.0
        </p>
      </div>

      <div className="d-globe-stage">
        {webgl ? (
          <canvas
            ref={canvasRef}
            className="d-globe-canvas"
            tabIndex={0}
            role="application"
            aria-label={`Interactive globe of ${SKILLS.length} skills. Arrow keys turn it, plus and minus zoom, Enter steps through, Escape lets go.`}
            onClick={onCanvasClick}
            onKeyDown={onKeyDown}
          />
        ) : (
          <ul className="d-globe-list">
            {SKILLS.map((skill) => (
              <li key={skill.id}>
                <span style={{ color: GROUP_COLOURS[skill.group] }}>{skill.name}</span>
                <span className="d-body">{skill.proof}</span>
              </li>
            ))}
          </ul>
        )}

        {webgl && (
          <div className="d-globe-readout" aria-live="polite">
            {shown ? (
              <>
                <span className="d-data" style={{ color: GROUP_COLOURS[shown.group] }}>
                  {shown.groupName} · {shown.level === "production" ? "Production" : "Own project"}
                </span>
                <p className="d-h3">{shown.name}</p>
                <p className="d-body">{shown.proof}</p>
              </>
            ) : (
              <>
                <span className="d-data">Idle</span>
                <p className="d-h3">Take hold of it</p>
                <p className="d-body">Drag to turn, pinch or use the buttons to zoom, tap or hover an icon to see where that skill was used.</p>
              </>
            )}
          </div>
        )}
      </div>

      {webgl && (
        <div className="d-wrap d-globe-controls">
          <div className="d-globe-bar">
            <p className="d-globe-hint">Drag to turn · pinch or +/− to zoom · tap an icon to see where it was used</p>
            <div className="d-globe-zoom" role="group" aria-label="Zoom the globe">
              <button type="button" className="d-chip" onClick={() => globeRef.current?.zoomBy(-0.45)} aria-label="Zoom in">
                +
              </button>
              <button type="button" className="d-chip" onClick={() => globeRef.current?.zoomBy(0.45)} aria-label="Zoom out">
                −
              </button>
              <button type="button" className="d-chip" onClick={() => globeRef.current?.reset()}>
                Reset
              </button>
            </div>
          </div>

          <div className="d-globe-group">
            <span className="d-data">Show</span>
            <div className="d-globe-filters d-globe-filters-view" role="group" aria-label="Which skills to show">
              <button
                type="button"
                className="d-chip"
                aria-pressed={group === null && level === null}
                onClick={() => {
                  setGroup(null);
                  setLevel(null);
                  globeRef.current?.reset();
                }}
              >
                All {SKILLS.length}
              </button>
              <button
                type="button"
                className="d-chip"
                aria-pressed={level === "production"}
                onClick={() => setLevel(level === "production" ? null : "production")}
              >
                Shipped for a client
              </button>
            </div>
          </div>

          <div className="d-globe-group">
            <span className="d-data">Discipline</span>
            <div className="d-globe-filters" role="group" aria-label="Filter by discipline">
              {skillGroups.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="d-chip"
                  aria-pressed={group === item.id}
                  onClick={() => setGroup(group === item.id ? null : item.id)}
                >
                  <span className="d-swatch" style={{ background: GROUP_COLOURS[item.id] }} aria-hidden="true" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* The full list stays for keyboard readers, folded so it doesn't bury the globe. */}
          <details className="d-globe-more">
            <summary className="d-data">Every way to use it</summary>
            <ol className="d-globe-controls-list">
              {CONTROLS.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </section>
  );
}
