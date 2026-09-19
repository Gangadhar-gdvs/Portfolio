# Portfolio rebuild — design and build checklist

**Goal:** A portfolio that gets Gangadhara Gooti shortlisted for full-stack product roles (web, mobile, desktop, AI) on first view, then holds up when a CTO looks closer.

**Thesis:** Gangadhara's own line — *simple on the surface, engineered deeply underneath.* The site is built as that sentence.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind CSS 4 · three.js · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis · Vitest. Deployed on Vercel.

---

## Concept

| Moment | What happens | Why |
|---|---|---|
| **Surface** (hero) | A calm, light "aluminium" page: name, one line, portrait, three actions. The cursor is an **X-ray lens** that reveals what is underneath: outlined type with its construction lines, the portrait as an X-ray, the markup behind the copy, and a live particle field. | Shows the thesis in the first second, and rewards curiosity. |
| **Dive** | Scrolling grows the lens until it swallows the screen. The page goes dark. | One orchestrated transition instead of scattered effects. |
| **The stack** | Five full-height layers — Interface, Devices, Services, Data, Intelligence. A WebGL particle cloud morphs into each layer's artifact (browser → laptop + phone → network → database → AI core). A depth gauge tracks how deep you are. | "Full-stack" made literal. The order is real: surface to core. |
| **Selected work** | Aethra as the lead "X-ray plate" with a live architecture schematic; five more projects as smaller plates; client sites as a list. | No screenshots exist yet, so projects are shown as their architecture — honest and on-theme. |
| **Record** | Experience and education. | Facts a recruiter needs, fast. |
| **Resurface** (contact) | A circle of light rises back over the dark; big invitation to talk; email, copy-email, LinkedIn, GitHub, résumé. | Closes the loop the hero opened. |
| **Case study** `/work/aethra` | Opens through a lens-shaped view transition from the click point. Architecture, an interactive permission-gate simulator using Aethra's real policy table, the Rust device layer, memory, cost posture, what's next. | Depth for the reader who wants it. |

**Signature:** the X-ray lens (hero cursor → dive → page transitions). Everything else stays quiet.

## Tokens

| Name | Hex | Role |
|---|---|---|
| `surface` | `#E6E9EC` | Light ground (matches the grey backdrop of the portrait) |
| `ink` | `#0A0D12` | Text on surface |
| `abyss` | `#05080D` | The underneath |
| `bone` | `#D7E3EA` | Text underneath (X-ray white) |
| `phosphor` | `#6FE6FF` | Lens rim, active states, particle highlights (the README's cyan, pushed toward X-ray phosphor) |
| `ember` | `#FF9E4A` | Status only ("open to roles", ASK state) |

Derived: `ink-soft #545E69` (5.4:1 on surface), `bone-soft #8593A1` (6.4:1 on abyss), `phosphor-deep #0A6E8A` (4.8:1 on surface).

Type: **Archivo** (variable width — display at `wdth 125`, `wght 800`), **IBM Plex Sans** (body), **JetBrains Mono** (readouts, labels, code — continuity with the GitHub README).

## Global constraints

- Content is **true and sourced**: README, old site, public GitHub, `Aethra-Docs/`. No invented metrics, dates or screenshots. Private repos get no code link.
- Hero text is server-rendered and visible without JavaScript; the WebGL canvas loads after first paint.
- Targets: LCP < 2.5 s on 4G, 60 fps on a mid-range Android, no layout shift from the canvas.
- Quality tiers: particles 22k / 12k / 6k by device; DPR ≤ 1.75; adaptive DPR drop on slow frames; CSS fallback without WebGL.
- `prefers-reduced-motion`: no lens tracking, no dive pin, no smooth scroll, particles static, view transitions instant.
- Keyboard: visible focus, skip link, every action reachable; canvas and X-ray layers are `aria-hidden`.
- Responsive from 360 px; lens roams on touch devices; tap moves it.

## File map

```
src/
  app/            layout, page, globals.css, work/aethra/page, not-found,
                  opengraph-image (home + aethra), icon.svg, apple-icon, sitemap, robots
  content/        profile.ts, layers.ts, projects.ts, experience.ts, aethra.ts   ← all copy lives here
  lib/            gsap.ts (plugin registration), math.ts, motion.ts, site.ts
  gl/             shapes.ts (point clouds), shaders.ts, sceneState.ts,
                  ParticleScene.ts (vanilla three.js), quality.ts, SceneMount.tsx
  components/     nav/, hero/, layers/, work/, experience/, contact/, case/, motion/
tests (colocated): *.test.ts
```

## Checklist

- [x] **0. Scaffold** — create-next-app (TS, Tailwind, ESLint, App Router, src/), deps, Vitest, assets (portrait, Aethra mark, OG fonts).
- [x] **1. Foundations** — tokens in `globals.css`, fonts via `next/font`, root layout, metadata base, GSAP registration, Lenis ↔ ScrollTrigger, reduced-motion helpers. *Done when* an empty page builds with correct fonts and smooth scroll.
- [x] **2. Content layer** — typed content modules + integrity tests (unique slugs, https links, no placeholder strings, five layers mapped to valid shapes). *Done when* tests pass.
- [x] **3. Particle engine** — seeded shape generators (field, browser, devices, network, database, core) + tests; morph shader (staggered easing, curl-noise swirl, pointer repulsion); scene state bridge; lazy canvas with tiers, adaptive DPR, WebGL fallback. *Done when* shapes morph smoothly from a scroll value at 60 fps on desktop.
- [x] **4. Hero + lens + dive** — surface/X-ray twin layers, lens tracking + intro sweep + touch roaming, pinned dive to full cover. *Done when* the lens reveals aligned X-ray content and the dive lands seamlessly in the dark.
- [x] **5. The stack** — five layer panels, scroll-scrubbed morph targets, depth gauge, split-line reveals.
- [x] **6. Work** — Aethra plate with live schematic, project plates with schematics, client list.
- [x] **7. Record + Resurface** — experience list, contact section with rising circle, copy-email, IST clock, footer.
- [x] **8. Nav** — theme-aware bar (surface/abyss), mobile menu, résumé link.
- [x] **9. Aethra case study** — page, permission-gate simulator, lens view transition in and out.
- [x] **10. SEO + share** — metadata, JSON-LD Person, OG images, icons, sitemap, robots, 404.
- [x] **11. Verify** — lint, typecheck, tests, production build, screenshots desktop + mobile, reduced motion, console clean.
- [x] **12. Handover** — README (edit content, deploy to Vercel), list of facts for Gangadhara to confirm.

## Decisions made during the build

- **React Three Fiber dropped for plain three.js.** The scene is a single `Points` draw call, so the reconciler added nothing. Named imports let three.js tree-shake: the lazy 3D chunk went from 236 KB to 136 KB gzipped, and a deprecation warning from R3F's clock went away.
- **Software WebGL gets the static fallback.** SwiftShader and llvmpipe compile and run shaders on the CPU. That blocked the main thread for about 3.5 s under mobile throttling, and real users without a GPU would see the same stall.
- **The lens rim moves with transforms.** Moving it with left/top/size registered as layout shifts (CLS 0.10); transforms brought CLS to 0.
- **The JetBrains Mono preload was removed.** It's used only for small labels, so it no longer competes with the display and body faces on slow connections.

## Verified (19 Sep 2026)

- 53 unit tests, ESLint, `tsc` and `next build` all pass; every route is prerendered as static HTML.
- Lighthouse desktop 100/100/100/100; mobile 89–90 performance and 100 for accessibility, best practices and SEO.
- Screenshots at 1440×900 and 390×844 with GPU and touch emulation; reduced motion (no lens, no pin, all content visible); mobile menu focus and scroll lock; lens page transition; permission-gate simulator.
- README rendered through GitHub's own Markdown API and checked in dark and light themes: 43 images, none broken. Its artwork is animated SVG with text set as vector paths, generated by `scripts/readme/make_svgs.py`; the screenshots and the animated lens capture come from the production build.

## Open items for Gangadhara

- Confirm dates: when Vectorsoft started, when Zyrone ended, and the Tech Kshatriyas period (shown blank).
- Confirm the college: *JNTUA College of Engineering, Pulivendula*, inferred from "maintained my college website".
- Check that the résumé link (the Google Drive file from the old site) is current.
- Add screen recordings of Aethra, G-Mart and SuperCabs when you have them; the plates can take media alongside the diagrams.
- G-Mart, SuperCabs and Aethra are private on GitHub, so the site shows no code links for them (the GitHub profile README links to them, and visitors get a 404).
