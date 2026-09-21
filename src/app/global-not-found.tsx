/**
 * The 404 for addresses no route matches. With a root layout per design there
 * is no single layout to render it inside, so it brings its own document.
 */
import "./globals.css";
import type { Metadata } from "next";
import { fontClass } from "@/design/fonts.stack";
import { siteUrl } from "@/lib/site";
import NotFound from "./(home)/not-found";

export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: "Page not found", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en-IN" className={fontClass} data-design="stack">
      <body>
        <NotFound />
      </body>
    </html>
  );
}
