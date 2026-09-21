/**
 * The shared shell. It deliberately imports no stylesheet: the dark design's
 * Tailwind sheet is pulled in by the pages that use it, so a build of the
 * other design does not render-block on a stylesheet it never applies.
 */
import type { Metadata, Viewport } from "next";
import { Cursor } from "@/components/chrome/Cursor";
import { Frame } from "@/components/chrome/Frame";
import { Intro } from "@/components/chrome/Intro";
import { Nav } from "@/components/chrome/Nav";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { profile } from "@/content/profile";
import { activeDesign, isDepth } from "@/design/design";
import { fontClass } from "@/design/fonts";
import { siteUrl } from "@/lib/site";

const title = `${profile.name}, full-stack engineer`;
// Aethra is not on the page while it is in progress, so it is not named here
// either: a share card should describe what a reader will actually find.
const description =
  "Full-stack engineer for web, mobile, desktop and AI. Shipped billing software, client web apps and a bilingual invitation site. Open to full-time roles, client work and freelance builds.";

export const metadata: Metadata = {
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
    "AI agents",
    "Andhra Pradesh",
  ],
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

export const viewport: Viewport = isDepth
  ? { themeColor: "#070608", colorScheme: "dark" }
  : { themeColor: "#030509", colorScheme: "dark" };

/**
 * Runs before first paint: picks Lite mode (an explicit choice, else reduced
 * motion), and decides whether the intro plays — once per visit, never in Lite.
 */
const bootScript = `try{var d=document.documentElement,s=localStorage.getItem("gg-lite"),r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(s==="1"||(s===null&&r))d.classList.add("lite");if(!d.classList.contains("lite")&&!sessionStorage.getItem("gg-intro")&&location.pathname==="/"){d.classList.add("has-intro");sessionStorage.setItem("gg-intro","1")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={fontClass} data-design={activeDesign} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {isDepth ? (
          // The depth design brings its own chrome; the dark design's cursor,
          // frame and smooth scroll belong to it alone.
          children
        ) : (
          <>
            <Intro />
            <Nav />
            {children}
            <Frame />
            <Cursor />
            <SmoothScroll />
          </>
        )}
      </body>
    </html>
  );
}
