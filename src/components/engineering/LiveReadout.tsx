"use client";

import { useSyncExternalStore } from "react";
import { stageStats } from "@/gl/stageState";

const MODES = {
  gpu: "3D running on your GPU",
  fallback: "No GPU here: vector drawing instead",
  lite: "Lite mode: 3D off by your choice",
} as const;

/** What the page you are reading is doing, right now. */
export function LiveReadout() {
  const stats = useSyncExternalStore(stageStats.subscribe, stageStats.get, () => null);

  const rows: [string, string][] = [
    ["Mode", stats ? MODES[stats.mode] : "Starting…"],
    ["Scene frame rate", stats?.mode === "gpu" ? `${stats.fps} fps` : "—"],
    ["Pixel ratio", stats?.mode === "gpu" ? stats.pixelRatio.toFixed(2) : "—"],
    ["Quality tier", stats?.mode === "gpu" ? stats.tier : "—"],
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-line ring-1 ring-line sm:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-night-1 p-4">
          <dt className="t-label text-fg-3">{label}</dt>
          <dd className="mt-2 font-mono text-[0.875rem] text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
