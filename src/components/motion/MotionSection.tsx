"use client";

import { useRef, type ComponentProps } from "react";
import { useReveal } from "./useReveal";

/**
 * A server-rendered section with client-side choreography: scroll reveals
 * for the `data-*` hooks inside it.
 */
export function MotionSection({ children, ...props }: ComponentProps<"section">) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
