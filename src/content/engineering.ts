// Lines marked `AETHRA:` are hidden while Aethra is still being built. To bring
// it back, uncomment them, delete the line each one replaced, and set
// `showFeatured` in projects.ts to true. `grep -rn AETHRA: src` lists them all.

/**
 * Numbers about this site, and the engineering behind them. Everything here
 * was measured on the production build, and every figure says how. Anything
 * that can't be measured doesn't go on the page.
 */

export const measured = {
  takenOn: "22 September 2026",
  how: "Lighthouse 12 against this design's production build, from a cold cache, median of three runs on the same machine. The mobile column uses Lighthouse's phone profile: 4× CPU slowdown and a simulated slow 4G connection.",
  lighthouse: [
    { page: "Home", profile: "Desktop", scores: [99, 100, 100, 100] },
    { page: "Home", profile: "Mobile", scores: [93, 100, 100, 100] },
    // AETHRA: the case study is the Aethra page, hidden with it.
    // AETHRA: { page: "Case study", profile: "Mobile", scores: [96, 100, 100, 100] },
  ] as { page: string; profile: string; scores: [number, number, number, number] }[],
  categories: ["Performance", "Accessibility", "Best practices", "SEO"],
  vitals: [
    { label: "First contentful paint", value: "0.3 s", note: "desktop · 1.4 s on the phone profile" },
    { label: "Largest contentful paint", value: "0.5 s", note: "desktop · 2.8 s on the phone profile, where it waits on the webfont" },
    { label: "Cumulative layout shift", value: "0", note: "nothing moves once it is painted" },
    { label: "Total blocking time", value: "0 ms", note: "desktop · 80 ms on the phone profile" },
  ],
  budget: [
    { label: "First-load JavaScript", value: "198 KB", note: "gzipped, across 10 chunks" },
    { label: "3D scene", value: "143 KB", note: "gzipped, loaded after idle and only with a GPU" },
    { label: "Images on first paint", value: "0", note: "the stack is geometry, its etching is drawn in a canvas" },
    { label: "DOM nodes", value: "1,491", note: "on this whole page, as Lighthouse counts them" },
  ],
  guards: [
    "Every route is prerendered as static HTML; the words are there before any script runs.",
    "CI runs lint, types, 39 tests and a production build on every push.",
    "Content-Security-Policy, frame-ancestors none, nosniff, a strict referrer policy and HSTS.",
    "Verified in Chromium on macOS at 1440 × 900 and on an emulated iPhone profile, with reduced motion and without a GPU.",
  ],
};

/** Changes made to this site, with the measurement that justified each one. */
export const optimisations = [
  {
    title: "Moved the motion layer off the critical path",
    before: "242 KB",
    after: "191 KB",
    unit: "first-load JS at the time, gzipped",
    how: "GSAP and Lenis are imported after the page is interactive, so scrolling and reading never wait for them. Nothing on screen animates in late: the reveal only applies to blocks the reader hasn't reached.",
  },
  {
    title: "Dropped React Three Fiber for plain three.js",
    before: "236 KB",
    after: "136 KB",
    unit: "3D chunk at the time, gzipped",
    how: "The scene is one scene graph built once; the reconciler added weight without buying anything. Named imports let the rest of three.js tree-shake away.",
  },
  {
    title: "Stopped hiding content the reader had already reached",
    before: "every block",
    after: "only what's below the fold",
    unit: "elements the reveal animates",
    how: "The motion layer now measures each block before touching it. Anything already on screen when it loads is left alone, so nothing a reader is mid-sentence on fades out and back in.",
  },
];

/** The fault that led to that last one, written up the way an on-call note would be. */
export const incident = {
  title: "The page froze on machines without a GPU",
  entries: [
    {
      label: "Symptom",
      body: "On an earlier build, the throttled phone profile went unresponsive shortly after load: 220 ms of blocking time and interactive at 4.2 s. On the very first build the same fault cost around 3.5 s of main-thread time.",
    },
    {
      label: "Cause",
      body: "WebGL was being served by a software rasteriser. Shader compilation and then every frame ran on the CPU, on the main thread, against hydration.",
    },
    {
      label: "Fix",
      body: "Check the renderer string before three.js is even fetched. Anything reporting SwiftShader, llvmpipe or a basic renderer gets a vector drawing of the stack and no WebGL at all; shaders that do run compile through compileAsync, off the main thread.",
    },
    {
      label: "What changed since",
      body: "Moving the motion layer behind idle hid the symptom from the tool: today the phone profile scores the same whether the guard is there or not, because three.js now loads after the page is interactive. The guard stays anyway — the metric moved, the problem didn't, and someone without a GPU would still be running my scene on their CPU.",
    },
    {
      label: "Prevention",
      body: "A frame-time monitor sheds pixel ratio, then the reflection, then detail. Device tiers cap texture size and particle count up front. Rendering stops entirely while opaque sections cover the canvas, and Lite mode turns it off by choice.",
    },
  ],
};

/** Decisions worth defending, each with the option that was turned down. */
export const decisions = [
  {
    decision: "Draw the layer artwork in a canvas at load",
    instead: "Ship five texture images",
    why: "Images would be either heavy or soft when the camera gets close. The drawings are code: a few milliseconds at startup, sharp at any size, and they change when the content changes.",
    result: "No image bytes on first paint",
  },
  // AETHRA: {
    // AETHRA: decision: "Fail closed in the Aethra permission kernel",
    // AETHRA: instead: "Allow by default with a blocklist",
    // AETHRA: why: "A model can invent a tool name. If the registry doesn't know a tool, there is no rule to check, and the only safe answer is no.",
    // AETHRA: result: "44 tools, each with a risk tier; anything unregistered is denied",
  // AETHRA: },
  {
    decision: "One mutable object between scroll and the render loop",
    instead: "React state for scene state",
    why: "Scroll writes targets sixty times a second. Putting that in state would re-render the tree for values only the renderer reads.",
    result: "Scrolling causes no React renders",
  },
  {
    decision: "Degrade before dropping frames",
    instead: "Render at full quality and stutter",
    why: "Google's SRE guidance for overloaded services applies to a frame budget too: shed the cheapest thing first and keep serving. Pixel ratio goes first, then the reflection, then detail.",
    result: "A measurable ladder you can watch run in the load test above",
  },
  {
    decision: "Prerender every route as static HTML",
    instead: "Render on request",
    why: "Nothing here is personalised. Static HTML means the text is readable before any JavaScript, and a recruiter with a bad connection still reads it.",
    result: "9 static routes, no server work per visit",
  },
];
