import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Cursor } from "@/components/chrome/Cursor";
import { Frame } from "@/components/chrome/Frame";
import { Intro } from "@/components/chrome/Intro";
import { Nav } from "@/components/chrome/Nav";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { profile } from "@/content/profile";
import { siteUrl } from "@/lib/site";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

const title = `${profile.name}, full-stack engineer`;
const description =
  "Full-stack engineer for web, mobile, desktop and AI. Builder of Aethra, an AI agent that uses your computer behind a permission gate. Open to full-time roles.";

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

export const viewport: Viewport = {
  themeColor: "#030509",
  colorScheme: "dark",
};

/**
 * Decides before first paint whether to play the intro: once per visit, and
 * never for people who prefer reduced motion.
 */
const introScript = `try{var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("gg-intro")&&location.pathname==="/"){d.classList.add("has-intro");sessionStorage.setItem("gg-intro","1")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <Intro />
        <Nav />
        {children}
        <Frame />
        <Cursor />
        <SmoothScroll />
      </body>
    </html>
  );
}
