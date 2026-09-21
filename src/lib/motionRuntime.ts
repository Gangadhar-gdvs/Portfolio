"use client";

import { isLite } from "./lite";
import { prefersReducedMotion } from "./motion";

type Motion = typeof import("./gsap");

let pending: Promise<Motion> | null = null;

/**
 * Loads GSAP and its plugins on demand, once, after the page is interactive.
 * Keeping the motion layer out of the first load takes ~69 KB gzipped off the
 * critical path; every caller renders fine before it resolves.
 */
export function loadMotion(): Promise<Motion> {
  pending ??= import("./gsap");
  return pending;
}

/** Whether animation should run at all. */
export function motionAllowed(): boolean {
  return !isLite() && !prefersReducedMotion();
}

/**
 * Runs `setup` once the motion library is ready, unless the effect was cleaned
 * up first. Returns a disposer for `useEffect`.
 */
export function withMotion(setup: (motion: Motion) => (() => void) | void): () => void {
  let cancelled = false;
  let cleanup: (() => void) | void;
  void loadMotion().then((motion) => {
    if (cancelled) return;
    cleanup = setup(motion);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
