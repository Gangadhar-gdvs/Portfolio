/**
 * Numbers for this design's own build.
 *
 * The figures in `src/content/engineering.ts` were measured on the dark
 * design's build, which is a different bundle: different components, a
 * different stylesheet, different webfonts and a different scene. Quoting them
 * here would be quoting the wrong page, so this design measures itself, by the
 * same method, so the two can be compared directly.
 */

export const depthMeasured = {
  takenOn: "21 September 2026",
  how: "Lighthouse 12 against this design's production build, from a cold cache, median of three runs on the same machine. The mobile column uses Lighthouse's phone profile: 4× CPU slowdown and a simulated slow 4G connection.",
  lighthouse: [
    { page: "Home", profile: "Desktop", scores: [100, 100, 100, 100] },
    { page: "Home", profile: "Mobile", scores: [95, 100, 100, 100] },
  ] as { page: string; profile: string; scores: [number, number, number, number] }[],
  categories: ["Performance", "Accessibility", "Best practices", "SEO"],
  vitals: [
    { label: "First contentful paint", value: "0.3 s", note: "desktop · 1.2 s on the phone profile" },
    { label: "Largest contentful paint", value: "0.6 s", note: "desktop · 2.8 s on the phone profile" },
    { label: "Cumulative layout shift", value: "0.005", note: "the display face swapping in; everything else holds still" },
    { label: "Total blocking time", value: "0 ms", note: "desktop · 20 ms on the phone profile" },
  ],
  budget: [
    { label: "First-load JavaScript", value: "190 KB", note: "gzipped, across 9 chunks" },
    { label: "Scenes", value: "2", note: "the shaft and the globe, both fetched after the page is interactive" },
    { label: "DOM nodes", value: "635", note: "on this whole page" },
    { label: "Images on first paint", value: "0", note: "the shaft is geometry and the globe draws its own labels" },
  ],
  guards: [
    "The first screen never waits for JavaScript: the opening animates around the words, not over them.",
    "Both scenes are WebGL only where there is a GPU worth using; without one the globe is a list and the shaft is a gradient.",
    "Lite mode and reduced motion switch off the fall, the opening and every reveal.",
    "The design that is not built ships nothing: no components, no stylesheet, no webfont.",
  ],
};
