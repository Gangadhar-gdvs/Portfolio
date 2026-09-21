import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

/**
 * The depth design's faces, resolved by the alias in next.config.ts — so the
 * dark design's build never declares or preloads them.
 *
 * Bricolage Grotesque carries the voice: a variable grotesque with real
 * character in its wide weights, which is what a title sequence needs. JetBrains
 * Mono carries the instruments — depths, pressures, counts — because readings
 * should line up in a column.
 */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
  preload: false,
});

export const fontClass = `${bricolage.variable} ${jetbrains.variable}`;
