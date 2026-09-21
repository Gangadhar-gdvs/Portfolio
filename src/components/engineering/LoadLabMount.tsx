"use client";

import dynamic from "next/dynamic";

/**
 * The benchmark can't do anything without JavaScript and a GPU, so it is kept
 * out of the first load entirely and fetched when the page is idle.
 */
const LoadLabPanel = dynamic(() => import("./LoadLabPanel").then((module) => module.LoadLabPanel), {
  ssr: false,
  loading: () => (
    <div className="aspect-[16/9] animate-none rounded-[18px] bg-night-1 ring-1 ring-line sm:aspect-[21/9]" />
  ),
});

export function LoadLabMount() {
  return <LoadLabPanel />;
}
