import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page so navigations tagged "lens" reveal it through a growing
 * circle while the previous page recedes. Other navigations swap instantly.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ lens: "lens-enter", default: "none" }}
      exit={{ lens: "lens-exit", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
