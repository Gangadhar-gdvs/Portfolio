"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

type LensLinkProps = ComponentProps<typeof Link>;

/**
 * A link whose destination opens through a circular lens, growing from the
 * point that was clicked (or the link's centre, for keyboard users).
 */
export function LensLink({ onClick, ...props }: LensLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    let x = event.clientX;
    let y = event.clientY;
    if (event.detail === 0) {
      const box = event.currentTarget.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    }
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${Math.round(x)}px`);
    root.style.setProperty("--vt-y", `${Math.round(y)}px`);
    onClick?.(event);
  };

  return <Link {...props} transitionTypes={["lens"]} onClick={handleClick} />;
}
