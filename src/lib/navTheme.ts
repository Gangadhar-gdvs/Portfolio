import { useSyncExternalStore } from "react";

/** Which ground the fixed navigation bar currently sits over. */
export type NavTheme = "surface" | "abyss";

let current: NavTheme = "surface";
const listeners = new Set<() => void>();

export function setNavTheme(next: NavTheme): void {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNavTheme(): NavTheme {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "surface",
  );
}
