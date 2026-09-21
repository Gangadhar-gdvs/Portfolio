"use client";

import { useSyncExternalStore } from "react";
import { probeGraphics, type GraphicsSupport } from "./quality";

let cached: GraphicsSupport | null = null;
const noSubscription = () => () => {};

/**
 * What kind of WebGL this machine has, decided once. `unknown` while server
 * rendering, so the markup matches until React takes over.
 */
export function useGraphics(): GraphicsSupport | "unknown" {
  return useSyncExternalStore(
    noSubscription,
    () => (cached ??= probeGraphics()),
    () => "unknown" as const,
  );
}
