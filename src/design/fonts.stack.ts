import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

/** The dark design's faces. Resolved by the alias in next.config.ts. */

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// The two accent faces never hold up the first paint: if they are not ready
// almost immediately, this load keeps the fallback and swaps nothing.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "optional",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "optional",
  preload: false,
});

export const fontClass = `${geist.variable} ${geistMono.variable} ${instrument.variable}`;
