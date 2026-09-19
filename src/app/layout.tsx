import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Nav } from "@/components/nav/Nav";
import { profile } from "@/content/profile";
import { siteUrl } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
});

// Only small labels use the mono face, so it isn't worth a preload slot in
// the critical path on slow connections.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
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
  themeColor: "#05080d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${plex.variable} ${jetbrains.variable}`}>
      <body>
        <Nav />
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
