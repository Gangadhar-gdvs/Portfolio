import { useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function matches(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export function prefersReducedMotion(): boolean {
  return matches(REDUCED_MOTION_QUERY);
}

export function hasFinePointer(): boolean {
  return matches(FINE_POINTER_QUERY);
}

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

const subscribeReducedMotion = subscribeTo(REDUCED_MOTION_QUERY);
const subscribeFinePointer = subscribeTo(FINE_POINTER_QUERY);

/** Live `prefers-reduced-motion` value; `false` during server rendering. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
}

/** Whether the main pointer is a mouse or trackpad; `false` during server rendering. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFinePointer, hasFinePointer, () => false);
}
