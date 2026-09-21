"use client";

import { useEffect, useRef, useState } from "react";
import type { LabStats, LoadLab } from "@/gl/lab/LoadLab";
import { useGraphics } from "@/gl/useGraphics";
import { useLite } from "@/lib/lite";
import { prefersReducedMotion, useMediaQuery } from "@/lib/motion";

type State = "idle" | "running" | "unavailable";

const BUDGET = 1000 / 60;

const SMALL = [5_000, 25_000, 60_000, 120_000];
const LARGE = [10_000, 50_000, 150_000, 400_000];

const format = (value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value));

/**
 * A benchmark, not a decoration: it runs on the visitor's own GPU and reports
 * what actually happened, in percentiles. The shedding switch turns the
 * degradation ladder off so the failure mode is visible too.
 */
export function LoadLabPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const spark = useRef<HTMLCanvasElement>(null);
  const lab = useRef<LoadLab | null>(null);
  const lite = useLite();

  const graphics = useGraphics();
  const small = useMediaQuery("(pointer: coarse), (max-width: 799px)");
  const steps = small ? SMALL : LARGE;
  const unavailable = lite || (graphics !== "gpu" && graphics !== "unknown");

  const [running, setRunning] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [shedding, setShedding] = useState(true);
  const [stats, setStats] = useState<LabStats | null>(null);
  const [adapter, setAdapter] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const count = chosen ?? steps[1];
  const state: State = unavailable ? "unavailable" : running ? "running" : "idle";

  useEffect(() => {
    const element = canvas.current;
    if (!element || unavailable || graphics === "unknown") return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    const fit = () => {
      const box = element.getBoundingClientRect();
      lab.current?.resize(box.width, box.height);
    };

    void import("@/gl/lab/LoadLab").then(({ LoadLab }) => {
      if (cancelled) return;
      const instance = new LoadLab({
        canvas: element,
        max: steps[steps.length - 1],
        count,
        onStats: (next) => setStats(next),
        onShed: (message) =>
          setLog((entries) => [`${new Date().toLocaleTimeString("en-GB")}  ${message}`, ...entries].slice(0, 4)),
      });
      lab.current = instance;
      setAdapter(instance.adapter());
      fit();
      window.addEventListener("resize", fit);

      // Only run while it is on screen: an idle benchmark is just a space heater.
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !prefersReducedMotion()) {
            instance.start();
            setRunning(true);
          } else {
            instance.stop();
            setRunning(false);
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(element);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", fit);
      lab.current?.dispose();
      lab.current = null;
    };
    // `count` is only the starting value here; changes go through setCount below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailable, graphics, small]);

  useEffect(() => {
    lab.current?.setCount(count);
  }, [count]);

  useEffect(() => {
    lab.current?.setShedding(shedding);
  }, [shedding]);

  // The frame-time trace, with the 16.7 ms budget drawn across it.
  useEffect(() => {
    const element = spark.current;
    const samples = stats?.recent;
    if (!element || !samples || samples.length === 0) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = element.clientWidth;
    const height = element.clientHeight;
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    const ctx = element.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const peak = Math.max(25, ...samples);
    const x = (index: number) => (index / (samples.length - 1 || 1)) * width;
    const y = (value: number) => height - (value / peak) * height;

    ctx.strokeStyle = "rgba(238,242,247,0.22)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y(BUDGET));
    ctx.lineTo(width, y(BUDGET));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    samples.forEach((value, index) => {
      const px = x(index);
      const py = y(value);
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = "#7ce7ff";
    ctx.lineWidth = 1.25;
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(124,231,255,0.12)";
    ctx.fill();
  }, [stats]);

  const readouts: [string, string][] = stats
    ? [
        ["Frames per second", String(stats.fps)],
        ["Frame p50", `${stats.p50.toFixed(1)} ms`],
        ["Frame p95", `${stats.p95.toFixed(1)} ms`],
        ["Frame p99", `${stats.p99.toFixed(1)} ms`],
        ["Particles drawn", stats.count.toLocaleString("en-GB")],
        ["Draw calls", String(stats.drawCalls)],
        ["Pixel ratio", stats.pixelRatio.toFixed(2)],
        ["GPU", adapter || "—"],
      ]
    : [];

  return (
    <div data-reveal className="overflow-hidden rounded-[18px] bg-night-1 ring-1 ring-line">
      <div className="relative aspect-[16/9] border-b border-line bg-night-2 sm:aspect-[21/9]">
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden="true" />
        {state === "unavailable" && (
          <p className="t-small absolute inset-0 grid place-items-center px-6 text-center text-fg-3">
            {lite
              ? "The load test needs the GPU. Switch Lite off in the header to run it."
              : "No GPU here, so there is nothing honest to measure. The numbers below were taken on a machine that has one."}
          </p>
        )}
        {state !== "unavailable" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
            <span className="t-label rounded-full bg-night/70 px-3 py-1.5 text-fg-2">
              {stats ? `${stats.fps} fps · p95 ${stats.p95.toFixed(1)} ms` : "warming up…"}
            </span>
            <span className={`t-label rounded-full px-3 py-1.5 ${shedding ? "bg-night/70 text-fg-3" : "bg-warm/15 text-warm"}`}>
              {shedding ? "shedding on" : "shedding off"}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-8">
        <div className="lg:col-span-5">
          <fieldset>
            <legend className="t-label text-fg-3">Particles</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((step) => (
                <button
                  key={step}
                  type="button"
                  aria-pressed={count === step}
                  disabled={state === "unavailable"}
                  onClick={() => setChosen(step)}
                  className="t-label h-9 rounded-full px-4 text-fg-2 ring-1 ring-line-2 transition-colors hover:text-fg hover:ring-line-3 disabled:opacity-40 aria-pressed:bg-fg aria-pressed:text-night aria-pressed:ring-fg"
                >
                  {format(step)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 flex items-start gap-3">
            <input
              type="checkbox"
              checked={shedding}
              disabled={state === "unavailable"}
              onChange={(event) => {
                setShedding(event.target.checked);
                setLog([]);
              }}
              className="mt-0.5 size-4 accent-[var(--color-glow)]"
            />
            <span>
              <span className="t-small block text-fg">Shed load when the budget breaks</span>
              <span className="t-small block text-fg-3">
                Pixel ratio first, then detail. Turn it off to watch the frame time go instead.
              </span>
            </span>
          </label>

          <div className="mt-6">
            <p className="t-label text-fg-3">Frame time, last 120 frames</p>
            <canvas ref={spark} className="mt-2 h-12 w-full" aria-hidden="true" />
            <p className="t-label mt-1 text-fg-3">dashed line: 16.7 ms</p>
          </div>

          {log.length > 0 && (
            <ul className="mt-6 space-y-1.5 border-t border-line pt-4">
              {log.map((entry) => (
                <li key={entry} className="font-mono text-[0.75rem] text-warm">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-7">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-line ring-1 ring-line sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {(readouts.length > 0 ? readouts : Array.from({ length: 8 }, () => ["", ""] as [string, string])).map(
              ([label, value], index) => (
                <div key={label || index} className="bg-night-1 p-4">
                  <dt className="t-label text-fg-3">{label || "—"}</dt>
                  <dd className="mt-2 font-mono text-[0.9375rem] text-fg">{value || "—"}</dd>
                </div>
              ),
            )}
          </dl>
          <p className="t-small mt-5 text-fg-2">
            Percentiles over a rolling 600-frame window, with the first 60 frames after any change thrown away. One
            draw call: the field is a single buffer, and nothing about it is computed on the CPU per frame. Numbers
            here are your machine&rsquo;s, measured with <code className="font-mono text-[0.8125rem]">performance.now()</code> — not a
            claim copied from mine.
          </p>
        </div>
      </div>
    </div>
  );
}
