/**
 * The document every page is rendered into.
 *
 * The root layout owns the whole document — the depth design's fonts on
 * <html>, its `data-design` and its own chrome.
 */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { siteUrl } from "@/lib/site";
import type { Design } from "./design";

const title = `${profile.name}, full-stack engineer`;
// Aethra is not on the page while it is in progress, so it is not named here
// either: a share card should describe what a reader will actually find.
const description =
  "Full-stack engineer for web, mobile, desktop and AI. Shipped billing software, client web apps and a bilingual invitation site. Open to full-time roles, client work and freelance builds.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    profile.name,
    "full-stack engineer",
    "React",
    "Next.js",
    "Flutter",
    "Tauri",
    "Node.js",
    // AETHRA: "AI agents",
    "Hyderabad",
  ],
  // Both designs carry the same words, so `/` is the one address search engines keep.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: profile.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export function viewportFor(_design: Design): Viewport {
  return { themeColor: "#070608", colorScheme: "dark" };
}

/**
 * Runs before first paint: picks Lite mode (an explicit choice, else reduced
 * motion), and decides whether the intro plays — once per visit, never in Lite.
 */
const bootScript = `try{var d=document.documentElement,s=localStorage.getItem("gg-lite"),r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(s==="1"||(s===null&&r))d.classList.add("lite");if(!d.classList.contains("lite")&&!sessionStorage.getItem("gg-intro")&&location.pathname==="/"){d.classList.add("has-intro");sessionStorage.setItem("gg-intro","1")}}catch(e){}`;

export function RootDocument({ design, fontClass, children }: { design: Design; fontClass: string; children: ReactNode }) {
  return (
    <html lang="en-IN" className={fontClass} data-design={design} suppressHydrationWarning>
      {/* This is a root layout's document; the rule only sees it outside app/. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      {/* The depth design brings its own chrome. */}
      <body>{children}</body>
    </html>
  );
}
