"use client";

import { useSyncExternalStore } from "react";

/**
 * Lite mode: the site as a plain, fast document. No 3D, no smooth scroll, no
 * custom cursor, no scroll reveals. A script in the layout sets the class
 * before first paint, so there is never a flash of the full version.
 *
 * Reduced motion turns it on by default; an explicit choice always wins.
 */
export const LITE_CLASS = "lite";
export const LITE_KEY = "gg-lite";

const listeners = new Set<() => void>();

function current(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains(LITE_CLASS);
}

export function setLite(on: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(LITE_CLASS, on);
  try {
    localStorage.setItem(LITE_KEY, on ? "1" : "0");
  } catch {
    // Private windows can refuse storage; the class still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Live Lite state. `false` while server rendering, which matches the default markup. */
export function useLite(): boolean {
  return useSyncExternalStore(subscribe, current, () => false);
}

/** For non-React code (the stage, the smooth scroller). */
export function isLite(): boolean {
  return current();
}

export function onLiteChange(listener: (lite: boolean) => void): () => void {
  const wrapped = () => listener(current());
  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}
