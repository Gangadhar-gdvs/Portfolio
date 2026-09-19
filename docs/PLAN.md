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

---

# v2 — Cinematic redesign (19 Sep 2026)

**Feedback on v1:** motion and transitions work; the design does not. Type is too big, the light hero feels flat and badly aligned, soft glows read as blur, headings sound like dummy copy, and it looks like a normal website rather than a portfolio. Wanted: clean, crisp ("4K"), 3D, deep interaction, an IMAX feel.

**Research (Awwwards SOTD 2026: Léo Parpeix, Gionatan Nese, Minh Pham, Iventions, Hubtown, By-Kin):** the 3D scene *is* the hero, lit like cinema; the UI around it is small and exact (11–14 px labels anchored to corners, one short statement, a scroll cue); one big moment per screen; a confident grid; motion never blocks reading; 60 fps or it doesn't count.

## Direction: "The Stack"

A dark, cinematic stage. On it stand five glass plates, stacked so closely they read as one sleek slab: interface, devices, services, data and intelligence, the full stack as one object. Each plate is etched with a drawing of its layer. The cursor is a lamp that lights the glass, dragging turns the stack, and scrolling opens it. In Capabilities, each discipline slides its plate out toward the copy that describes it, and at Contact the stack closes again. This is Gangadhara's own line made physical: simple on the surface, engineered deeply underneath.

| Token | Value | Use |
|---|---|---|
| `night` | `#030509` | stage |
| `night-1` / `night-2` | `#070B12` / `#0C121C` | raised surfaces, cards |
| `fg` / `fg-2` / `fg-3` | `#EEF2F7` / `#A7B0BD` / `#6E7785` | text tiers |
| `glow` | `#7CE7FF` | light, focus, live states |
| `glow-2` | `#3D7BFF` | depth in gradients only |
| `warm` | `#FFB86B` | availability dot only |

Type: **Geist** (UI and headings, weight 400–500, tight tracking), **Instrument Serif italic** (one accent phrase per screen), **Geist Mono** (11 px tracked labels). Scale: label 11 · small 13 · body 16 · lead 20 · h3 24 · h2 clamp(32→52) · display clamp(44→88).

Crispness: canvas at device pixel ratio up to 2, MSAA edges, hard-edged particles, bloom only above a high threshold, 1 px hairlines, no glow on text.

## Real headings

Hero: *Gangadhara Gooti — Full-Stack Engineer* and the README line. Sections: **About · Capabilities · Selected Work · Experience · Contact**. Capabilities are named as disciplines: Frontend Engineering, Mobile & Desktop Apps, Backend & Real-time Systems, Data & Storage, AI Agents & LLM Systems.

## Decisions made while building

- **Plates instead of a vertical monolith, and no particles.** A stack of horizontal plates says "surface over depth" at a glance and stays crisp; the particle cloud was the main source of the blur in v1, so it's gone (dust remains, as hard-edged specks).
- **Etched in a canvas, not modelled.** Each drawing is made once in a 2D canvas with one colour channel per kind of mark (lines, accent, pulses) and coloured in the shader. Anisotropic filtering keeps it sharp at an angle.
- **No bloom.** Glow is drawn into the etching where it belongs (the AI core, the service hub, the vector query), so nothing on screen is blurred and there's no post-processing cost.
- **Framing with `setViewOffset`.** The stack never moves in the world to make room for text; the camera's picture shifts instead, so lighting and perspective stay consistent.
- **Sections steer the stage with attributes** (`data-stage`, `data-stage-focus`, `data-stage-cover`), and the opaque middle of the page pauses rendering.
- **Headings are real**: Capabilities, Selected Work, Experience, About, and "Let's work together." Mono labels above them carry facts ("7 projects · 3 client websites"), not decoration.
- **Dev server on port 5000**, bound to `localhost` because macOS AirPlay Receiver holds `*:5000`.

## Checklist (v2)

- [x] Tokens, fonts, globals; remove the v1 X-ray hero styles.
- [x] Chrome: nav (active section, tucks away while reading), viewfinder corners, custom cursor with labels, magnetic buttons.
- [x] Stage: five etched glass plates, glossy floor and reflection, dust, cursor lamp, drag with inertia, open on scroll, per-discipline focus, labels beside the plates.
- [x] Intro: a line of light, a count to 100, curtains open. First visit only, skipped for reduced motion.
- [x] Hero overlay: name, statement, CTAs, credits row with local time and status, scroll cue.
- [x] About: portrait that develops into colour, statement, four real numbers with counters.
- [x] Capabilities: one scroll step per discipline driving the plate focus; stacked layout on phones.
- [x] Selected Work: Aethra panel with a large live architecture diagram and the gate order, project index with cursor-following captures, client sites.
- [x] Experience and Contact.
- [x] Case study and 404 restyle; share images rebuilt with a render of the stack.
- [x] Verify: build, tests, screenshots desktop and mobile, reduced motion, Lighthouse.
- [x] README artwork and screens in the new style.

## Verified (20 Sep 2026)

- `npm test` 27 passing, `tsc` and ESLint clean, `next build` static with no warnings.
- Lighthouse, production build: home desktop 99 / 100 / 100 / 100; home mobile 96 / 100 / 100 / 100; case study mobile 95 / 100 / 100 / 100.
- No console errors through a full scroll, a drag, the lens transition to the case study and back.
- Checked at 1440 × 900 and 390 × 844 on a real GPU, with reduced motion, and on the static fallback path.
