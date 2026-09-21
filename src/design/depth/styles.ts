/**
 * The depth design's stylesheet, as a module rather than a `.css` import.
 *
 * A stylesheet imported by a component is collected into the route's CSS by
 * the bundler whether or not that component ever renders, which would put
 * every rule here into the dark design's build too. As a module it is ordinary
 * code: the build that does not use it drops it, and the build that does
 * inlines it, saving a request.
 *
 * Nothing in here applies unless an ancestor carries [data-design="depth"].
 */

export const depthStyles = String.raw`
/* ── Reset ────────────────────────────────────────────────────────────────
   This design does not load the dark design's Tailwind sheet, so it carries
   its own reset. Without it every padded container is laid out content-box
   and ends up wider than the column it sits in — which is exactly what went
   wrong with the alignments the first time round. */
[data-design="depth"] *,
[data-design="depth"] *::before,
[data-design="depth"] *::after {
  box-sizing: border-box;
}

html[data-design="depth"] body {
  margin: 0;
}

[data-design="depth"] h1,
[data-design="depth"] h2,
[data-design="depth"] h3,
[data-design="depth"] h4,
[data-design="depth"] p,
[data-design="depth"] dl,
[data-design="depth"] dd,
[data-design="depth"] figure {
  margin: 0;
}

[data-design="depth"] img,
[data-design="depth"] canvas,
[data-design="depth"] svg {
  display: block;
  max-width: 100%;
}

[data-design="depth"] button,
[data-design="depth"] input {
  font: inherit;
  color: inherit;
}

html[data-design="depth"] {
  background: #070608;
  color-scheme: dark;
}

[data-design="depth"] {
  /* ── Colour: a warm black that gets hotter the deeper you go ─────────── */
  --void: #070608;
  --rock: #131017;
  --rock-2: #1c1822;
  --rock-3: #272130;

  --bone: #f4f1f7;
  --ash: #a59fb0;
  --ash-2: #8a8397;

  --magma: #ff6b2c;
  --ember: #ffb03a;
  --cool: #5ee0c8;

  --line: rgb(244 241 247 / 0.08);
  --line-2: rgb(244 241 247 / 0.16);

  /* ── Space ──────────────────────────────────────────────────────────── */
  --gutter: clamp(1.25rem, 4vw, 4.5rem);
  --section: clamp(6rem, 12vw, 12rem);
  --measure: 60ch;

  /* ── Motion ─────────────────────────────────────────────────────────── */
  --fall: cubic-bezier(0.16, 1, 0.3, 1);
  --drive: cubic-bezier(0.65, 0, 0.35, 1);
}

[data-design="depth"] .d-page {
  position: relative;
  min-height: 100svh;
  background: var(--void);
  color: var(--bone);
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

[data-design="depth"] ::selection {
  background: var(--magma);
  color: var(--void);
}

[data-design="depth"] :focus-visible {
  outline: 2px solid var(--cool);
  outline-offset: 3px;
  border-radius: 3px;
}

/* ── Type ─────────────────────────────────────────────────────────────── */

[data-design="depth"] .d-display {
  font-weight: 700;
  font-size: clamp(3rem, 11vw, 9.5rem);
  /* 0.88 clipped the descenders: the tails of the g's in the first name ran
     straight into the cap-heights of the second. This leaves the tails clear
     with a little air under them. */
  line-height: 1.02;
  letter-spacing: -0.04em;
  font-variation-settings: "wdth" 96;
}

[data-design="depth"] .d-h2 {
  font-weight: 600;
  font-size: clamp(1.75rem, 3.4vw, 3rem);
  line-height: 1.02;
  letter-spacing: -0.032em;
}

[data-design="depth"] .d-h3 {
  font-weight: 600;
  font-size: clamp(1.15rem, 1.6vw, 1.45rem);
  line-height: 1.16;
  letter-spacing: -0.02em;
}

[data-design="depth"] .d-body {
  font-size: 1.0625rem;
  line-height: 1.68;
  color: var(--ash);
  max-width: var(--measure);
}

[data-design="depth"] .d-data {
  font-family: var(--font-data), ui-monospace, "SFMono-Regular", Menlo, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ash-2);
  font-variant-numeric: tabular-nums;
}

[data-design="depth"] .d-num {
  font-family: var(--font-data), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* ── Layout ───────────────────────────────────────────────────────────── */

[data-design="depth"] .d-wrap {
  width: 100%;
  max-width: 88rem;
  margin-inline: auto;
  padding-inline: var(--gutter);
}

[data-design="depth"] .d-section {
  position: relative;
  padding-block: var(--section);
}

/* ── The opening: a letterbox that retracts ───────────────────────────── */

/* The bars never cover the name, so the words are painted on the first frame
   and the page's largest paint does not wait for a title sequence. */
[data-design="depth"] .d-curtain {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
}

[data-design="depth"] .d-curtain span {
  position: absolute;
  left: 0;
  right: 0;
  height: 22vh;
  background: var(--void);
  animation: d-retract 1.15s var(--drive) forwards;
}

[data-design="depth"] .d-curtain span:first-child {
  top: 0;
  transform-origin: top;
}

[data-design="depth"] .d-curtain span:last-child {
  bottom: 0;
  transform-origin: bottom;
}

@keyframes d-retract {
  from {
    transform: scaleY(1);
  }
  to {
    transform: scaleY(0);
  }
}

/* A single sweep of heat across the title, once. */
[data-design="depth"] .d-sweep {
  background-image: linear-gradient(
    100deg,
    var(--bone) 0%,
    var(--bone) 38%,
    var(--ember) 48%,
    var(--magma) 54%,
    var(--bone) 66%,
    var(--bone) 100%
  );
  background-size: 280% 100%;
  background-position: 180% 0;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: d-sweep 2.6s var(--fall) 0.35s forwards;
}

@keyframes d-sweep {
  to {
    background-position: -40% 0;
  }
}

/* ── Chrome ───────────────────────────────────────────────────────────── */

[data-design="depth"] .d-skip {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 90;
  padding: 0.6rem 0.9rem;
  background: var(--magma);
  color: var(--void);
  font-weight: 600;
  border-radius: 3px;
  transform: translateY(-160%);
  transition: transform 0.25s var(--fall);
}

[data-design="depth"] .d-skip:focus-visible {
  transform: none;
}

[data-design="depth"] .d-nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem var(--gutter);
  transition: background-color 0.5s var(--fall), backdrop-filter 0.5s var(--fall);
}

[data-design="depth"] .d-nav.is-deep {
  background: rgb(7 6 8 / 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 var(--line);
}

[data-design="depth"] .d-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--bone);
  text-decoration: none;
}

[data-design="depth"] .d-brand-mark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, var(--ember), var(--magma) 58%, #7a1f00);
  box-shadow: 0 0 14px rgb(255 107 44 / 0.55);
}

[data-design="depth"] .d-nav-links {
  display: none;
  gap: 1.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

[data-design="depth"] .d-nav-links a {
  color: var(--ash);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.3s var(--fall);
}

[data-design="depth"] .d-nav-links a:hover {
  color: var(--bone);
}

[data-design="depth"] .d-nav-end {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

[data-design="depth"] .d-lite {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  background: transparent;
  color: var(--ash);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: border-color 0.3s var(--fall), color 0.3s var(--fall);
}

[data-design="depth"] .d-lite:hover {
  border-color: var(--cool);
  color: var(--bone);
}

[data-design="depth"] .d-lite-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid var(--ash-2);
}

[data-design="depth"] .d-lite-dot[data-on] {
  background: var(--cool);
  border-color: var(--cool);
}

/* ── Phone menu: a button that folds into an X, and a sheet that opens
   out of it like an aperture ─────────────────────────────────────────── */

[data-design="depth"] .d-burger {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-left: auto;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  background: rgb(7 6 8 / 0.55);
  backdrop-filter: blur(8px);
  color: var(--bone);
  cursor: pointer;
  transition: border-color 0.4s var(--fall), background-color 0.4s var(--fall), transform 0.4s var(--fall);
}

[data-design="depth"] .d-burger:active {
  transform: scale(0.94);
}

[data-design="depth"] .d-nav.is-open .d-burger {
  border-color: var(--magma);
  background: rgb(255 107 44 / 0.12);
}

[data-design="depth"] .d-burger-lines {
  position: relative;
  width: 1.1rem;
  height: 0.7rem;
}

[data-design="depth"] .d-burger-lines span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1.5px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.5s var(--fall), top 0.5s var(--fall), width 0.5s var(--fall);
}

[data-design="depth"] .d-burger-lines span:first-child {
  top: 0;
}

[data-design="depth"] .d-burger-lines span:last-child {
  top: calc(100% - 1.5px);
  width: 70%;
}

[data-design="depth"] .d-nav.is-open .d-burger-lines span:first-child {
  top: calc(50% - 0.75px);
  transform: rotate(45deg);
}

[data-design="depth"] .d-nav.is-open .d-burger-lines span:last-child {
  top: calc(50% - 0.75px);
  width: 100%;
  transform: rotate(-45deg);
}

[data-design="depth"] .d-nav.is-open {
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
}

[data-design="depth"] .d-menu {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(5.5rem + env(safe-area-inset-top, 0px)) var(--gutter) calc(2rem + env(safe-area-inset-bottom, 0px));
  background:
    radial-gradient(120% 80% at 100% 0%, rgb(255 107 44 / 0.16), transparent 55%),
    rgb(7 6 8 / 0.96);
  backdrop-filter: blur(14px);
  /* Opens out of the button: a circle from its centre to past the far corner. */
  clip-path: circle(0 at calc(100% - var(--gutter) - 1.375rem) 2.4rem);
  visibility: hidden;
  transition: clip-path 0.7s var(--drive), visibility 0s linear 0.7s;
}

[data-design="depth"] .d-menu.is-open {
  clip-path: circle(150% at calc(100% - var(--gutter) - 1.375rem) 2.4rem);
  visibility: visible;
  transition: clip-path 0.75s var(--drive), visibility 0s;
}

[data-design="depth"] .d-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-menu-list li {
  border-bottom: 1px solid var(--line);
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.45s var(--fall), transform 0.45s var(--fall);
}

[data-design="depth"] .d-menu.is-open .d-menu-list li {
  opacity: 1;
  transform: none;
  transition-delay: calc(0.18s + var(--i, 0) * 0.055s);
}

[data-design="depth"] .d-menu-list a {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding-block: 1rem;
  color: var(--bone);
  text-decoration: none;
}

[data-design="depth"] .d-menu-label {
  font-weight: 600;
  font-size: clamp(1.9rem, 8vw, 2.6rem);
  line-height: 1;
  letter-spacing: -0.03em;
  transition: color 0.3s var(--fall), transform 0.4s var(--fall);
}

[data-design="depth"] .d-menu-list a:hover .d-menu-label,
[data-design="depth"] .d-menu-list a:focus-visible .d-menu-label {
  color: var(--ember);
  transform: translateX(6px);
}

[data-design="depth"] .d-menu-foot {
  margin: 0;
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

[data-design="depth"] .d-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.05rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--bone);
  color: var(--void);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: transform 0.4s var(--fall), box-shadow 0.4s var(--fall), background-color 0.4s var(--fall);
}

[data-design="depth"] .d-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px -18px rgb(244 241 247 / 0.5);
}

[data-design="depth"] .d-button-ghost {
  background: transparent;
  color: var(--bone);
  border-color: var(--line-2);
}

[data-design="depth"] .d-button-ghost:hover {
  border-color: var(--magma);
  box-shadow: 0 14px 34px -22px rgb(255 107 44 / 0.8);
}

[data-design="depth"] .d-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.34rem 0.75rem;
  border: 1px solid rgb(244 241 247 / 0.28);
  border-radius: 999px;
  background: rgb(244 241 247 / 0.08);
  color: #ffffff;
  font-size: 0.8125rem;
  font-family: var(--font-data), monospace;
  cursor: pointer;
  transition: color 0.3s var(--fall), border-color 0.3s var(--fall), background-color 0.3s var(--fall);
}

[data-design="depth"] .d-chip:hover {
  color: var(--bone);
  border-color: var(--ash-2);
}

[data-design="depth"] .d-chip[aria-pressed="true"] {
  color: var(--void);
  background: var(--cool);
  border-color: var(--cool);
}

/* ── Reveals: nothing above the fold waits for JavaScript ─────────────── */

[data-design="depth"] [data-d-reveal] {
  opacity: 0;
  transform: translateY(26px);
}

[data-design="depth"] [data-d-reveal].is-in {
  opacity: 1;
  transform: none;
  transition: opacity 1s var(--fall), transform 1s var(--fall);
  transition-delay: var(--delay, 0s);
}

/* ── Lite mode and reduced motion ─────────────────────────────────────── */

[data-design="depth"].lite [data-d-reveal],
[data-design="depth"].lite [data-d-reveal].is-in {
  opacity: 1;
  transform: none;
  transition: none;
}

[data-design="depth"].lite .d-curtain {
  display: none;
}

[data-design="depth"].lite .d-sweep {
  animation: none;
  background: none;
  -webkit-background-clip: border-box;
  background-clip: border-box;
  color: var(--bone);
}

@media (prefers-reduced-motion: reduce) {
  [data-design="depth"] .d-menu,
  [data-design="depth"] .d-menu.is-open,
  [data-design="depth"] .d-menu-list li {
    transition: none;
  }

  [data-design="depth"] [data-d-reveal],
  [data-design="depth"] [data-d-reveal].is-in {
    opacity: 1;
    transform: none;
    transition: none;
  }

  [data-design="depth"] .d-curtain span,
  [data-design="depth"] .d-sweep {
    animation: none;
  }

  [data-design="depth"] .d-curtain {
    display: none;
  }

  [data-design="depth"] .d-sweep {
    background: none;
    -webkit-background-clip: border-box;
    background-clip: border-box;
    color: var(--bone);
  }
}

[data-design="depth"] .d-nav-switch {
  display: none;
  margin-left: auto;
}

[data-design="depth"] .d-menu-switch {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
  margin-top: 2rem;
}

[data-design="depth"] .d-colophon-end {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 62rem) {
  [data-design="depth"] .d-nav-links {
    display: flex;
  }

  [data-design="depth"] .d-nav-switch {
    display: inline-flex;
  }

  [data-design="depth"] .d-burger,
  [data-design="depth"] .d-menu {
    display: none;
  }
}

/* ── The shaft behind everything ──────────────────────────────────────── */

[data-design="depth"] .d-shaft {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 50% -20%, #151327 0%, transparent 55%),
    radial-gradient(120% 90% at 50% 120%, #2a0d05 0%, transparent 60%),
    var(--void);
}

[data-design="depth"] .d-shaft-canvas {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0.85;
}

[data-design="depth"] .d-main {
  position: relative;
  z-index: 1;
  outline: none;
}

/* ── Surface ──────────────────────────────────────────────────────────── */

[data-design="depth"] .d-surface {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding-block: clamp(7rem, 14vh, 11rem) clamp(3rem, 8vh, 6rem);
}

[data-design="depth"] .d-surface-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.6rem;
  margin: 0 0 clamp(1.5rem, 4vw, 3rem);
}

[data-design="depth"] .d-surface-name {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.03em;
}

/* Both lines of the name start on the same edge: an indent on the second one
   read as a mistake at every width. */
[data-design="depth"] .d-surface-last {
  padding-left: 0;
}

[data-design="depth"] .d-surface-row {
  display: grid;
  gap: 1.5rem;
  margin-top: clamp(2rem, 5vw, 3.5rem);
  padding-top: 1.75rem;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-surface-role {
  margin: 0;
  font-weight: 600;
  font-size: 1.0625rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

[data-design="depth"] .d-surface-disciplines {
  font-family: var(--font-data), monospace;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--magma);
}

[data-design="depth"] .d-surface-statement {
  margin: 0;
  font-size: 1.1875rem;
  color: var(--ash);
}

[data-design="depth"] .d-surface-statement em {
  font-style: normal;
  color: var(--bone);
}

[data-design="depth"] .d-surface-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.25rem;
}

[data-design="depth"] .d-surface-proof {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 2rem;
  margin: clamp(2.5rem, 6vw, 4rem) 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-surface-proof dd {
  margin: 0.3rem 0 0;
  font-size: 1.375rem;
  font-weight: 600;
}

[data-design="depth"] .d-surface-proof dt {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

[data-design="depth"] .d-surface-proof-where {
  color: var(--ash-2);
  letter-spacing: 0.04em;
  text-transform: none;
}

[data-design="depth"] .d-surface-proof div {
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
}

[data-design="depth"] .d-surface-cue {
  margin: 2.5rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

[data-design="depth"] .d-surface-cue::after {
  content: "";
  width: 44px;
  height: 1px;
  background: linear-gradient(90deg, var(--magma), transparent);
  animation: d-cue 2.4s var(--drive) infinite;
}

@keyframes d-cue {
  0%, 100% { transform: translateX(0); opacity: 0.4; }
  50% { transform: translateX(10px); opacity: 1; }
}

/* ── Section openings ─────────────────────────────────────────────────── */

[data-design="depth"] .d-head {
  margin-bottom: clamp(2.5rem, 5vw, 4rem);
}

[data-design="depth"] .d-head-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-head-title {
  margin: 1.5rem 0 0;
  max-width: 20ch;
}

[data-design="depth"] .d-head-lead {
  margin-top: 1.25rem;
}

[data-design="depth"] .d-sub {
  margin: clamp(3.5rem, 7vw, 6rem) 0 1.75rem;
}

/* ── Slabs: the card language ─────────────────────────────────────────── */

[data-design="depth"] .d-slab {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgb(244 241 247 / 0.045), rgb(244 241 247 / 0.012)),
    rgb(9 8 12 / 0.72);
  overflow: hidden;
  transition: border-color 0.5s var(--fall), transform 0.5s var(--fall), box-shadow 0.5s var(--fall);
}

/* A hot edge along the top, brighter as the slab is approached. */
[data-design="depth"] .d-slab::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--magma), transparent);
  opacity: 0.35;
  transition: opacity 0.5s var(--fall);
}

[data-design="depth"] .d-slab:hover {
  border-color: var(--line-2);
  transform: translateY(-3px);
  box-shadow: 0 30px 60px -40px rgb(255 107 44 / 0.5);
}

[data-design="depth"] .d-slab:hover::before {
  opacity: 1;
}

[data-design="depth"] .d-slab-lead {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  padding: clamp(1.25rem, 2.4vw, 2rem);
}

[data-design="depth"] .d-slab-name {
  margin: 0.6rem 0 0;
}

[data-design="depth"] .d-slab-summary {
  margin-top: 0.85rem;
  font-size: 1rem;
}

[data-design="depth"] .d-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin: 0 0 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-facts dt {
  font-size: 1.625rem;
  font-weight: 600;
  line-height: 1;
  color: var(--ember);
}

[data-design="depth"] .d-facts dd {
  margin: 0.4rem 0 0;
  font-family: var(--font-data), monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ash-2);
}

[data-design="depth"] .d-gate ol {
  counter-reset: gate;
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

[data-design="depth"] .d-gate ol > li {
  counter-increment: gate;
  display: flex;
  gap: 0.7rem;
  font-size: 0.9375rem;
  color: var(--ash);
}

[data-design="depth"] .d-gate ol > li::before {
  content: counter(gate);
  font-family: var(--font-data), monospace;
  color: var(--cool);
}

[data-design="depth"] .d-story {
  display: grid;
  gap: 0.85rem;
  margin: 1.35rem 0 0;
}

[data-design="depth"] .d-story .d-body {
  font-size: 0.9375rem;
  line-height: 1.6;
}

[data-design="depth"] .d-story dd {
  margin: 0.35rem 0 0;
}

[data-design="depth"] .d-story-tight {
  margin-top: 1.25rem;
  gap: 0.9rem;
}

[data-design="depth"] .d-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 1.35rem 0 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-tags li {
  /* Flex items shrink below their content by default, which squeezed these
     pills into ellipses with the names spilling out of them. */
  flex: 0 0 auto;
  padding: 0.18rem 0.5rem;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  font-family: var(--font-data), monospace;
  font-size: 0.6875rem;
  color: var(--ash);
  white-space: nowrap;
}

[data-design="depth"] .d-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 1.75rem;
}

[data-design="depth"] .d-grid,
[data-design="depth"] .d-grid-3 {
  display: grid;
  gap: 1.25rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-slab-deep {
  display: flex;
  flex-direction: column;
}

[data-design="depth"] .d-slab-shot {
  border-bottom: 1px solid var(--line);
  background: #0c0a10;
}

/* Capped, so a screenshot never takes over the card it illustrates. */
[data-design="depth"] .d-slab-shot img,
[data-design="depth"] .d-client-shot img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 8.5;
  object-fit: cover;
  object-position: top;
  /* A white screenshot in a dark page is a hole in it: bring the captures
     down to the room's light rather than letting them glare. */
  opacity: 0.88;
  filter: saturate(0.88) brightness(0.74) contrast(1.04);
  transition: opacity 0.5s var(--fall), filter 0.5s var(--fall);
}

[data-design="depth"] .d-slab:hover .d-slab-shot img,
[data-design="depth"] .d-slab:hover .d-client-shot img {
  opacity: 1;
  filter: saturate(1) brightness(0.94) contrast(1);
}

[data-design="depth"] .d-slab-body {
  padding: clamp(1.1rem, 1.8vw, 1.5rem);
}

/* Project cards run shorter than client ones: a strip of the capture, not a poster. */
[data-design="depth"] .d-slab-deep .d-slab-shot img {
  aspect-ratio: 16 / 6.5;
  object-position: center;
  /* Project captures are the evidence, so they stay near full light; only
     the glare of an all-white page is taken off. */
  opacity: 1;
  filter: brightness(0.96);
}

[data-design="depth"] .d-slab-deep:hover .d-slab-shot img {
  filter: none;
}

/* Wide screens: the capture beside the words, not above them, which halves
   each card's height and lets two sit on one screen. */
@media (min-width: 62rem) {
  [data-design="depth"] .d-slab-deep {
    flex-direction: row;
  }

  [data-design="depth"] .d-slab-deep .d-slab-shot {
    flex: 0 0 36%;
    border-bottom: 0;
    border-right: 1px solid var(--line);
  }

  [data-design="depth"] .d-slab-deep .d-slab-shot img,
  [data-design="depth"] .d-slab-deep .d-slab-shot-empty {
    height: 100%;
    aspect-ratio: auto;
    /* The middle of a capture is where its subject is — the sign-in card,
       the doors, the filters — not the empty top-left corner. */
    object-position: center;
  }
}

[data-design="depth"] .d-slab-shot-empty {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 6.5;
  margin: 0;
  padding: 1rem;
  text-align: center;
  color: var(--ash-2);
  background:
    repeating-linear-gradient(135deg, rgb(244 241 247 / 0.035) 0 1px, transparent 1px 12px),
    #0c0a10;
}

[data-design="depth"] .d-slab-deep .d-slab-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

[data-design="depth"] .d-slab-kind {
  margin: 0.35rem 0 0;
}

[data-design="depth"] .d-slab-line {
  margin: 0.85rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.55;
}

[data-design="depth"] .d-slab-deep .d-tags {
  margin-top: 1rem;
}

[data-design="depth"] .d-slab-more {
  margin-top: 1.1rem;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-slab-more summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.85rem 0.1rem;
  list-style: none;
  cursor: pointer;
  font-family: var(--font-data), monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bone);
}

[data-design="depth"] .d-slab-more summary::-webkit-details-marker {
  display: none;
}

[data-design="depth"] .d-slab-more summary::after {
  content: "+";
  font-size: 1rem;
  line-height: 1;
  color: var(--ember);
  transition: transform 0.3s var(--fall);
}

[data-design="depth"] .d-slab-more[open] summary::after {
  transform: rotate(45deg);
}

[data-design="depth"] .d-slab-more summary:focus-visible {
  outline: 2px solid var(--cool);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Links sit on the card's floor, so a row of cards shares one baseline. */
[data-design="depth"] .d-slab-deep .d-actions {
  margin-top: auto;
  padding-top: 1.1rem;
}

[data-design="depth"] .d-slab-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

[data-design="depth"] .d-index {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-index > li {
  display: grid;
  gap: 0.75rem;
  padding-block: 1.6rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-index-name {
  margin: 0;
  font-size: 1.1875rem;
  font-weight: 600;
}

[data-design="depth"] .d-index-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.85rem;
}

[data-design="depth"] .d-index-links a,
[data-design="depth"] .d-client-link {
  color: var(--cool);
  text-decoration: none;
  font-size: 0.9375rem;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s var(--fall);
}

[data-design="depth"] .d-index-links a:hover,
[data-design="depth"] .d-client-link:hover {
  border-color: var(--cool);
}

[data-design="depth"] .d-clients {
  display: grid;
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-client-body {
  padding: 1.35rem;
}

[data-design="depth"] .d-client-body .d-body {
  margin: 0.5rem 0 0.85rem;
}

/* ── The globe ────────────────────────────────────────────────────────── */

[data-design="depth"] .d-globe {
  position: relative;
  padding-block: var(--section) clamp(3rem, 6vw, 5rem);
}

[data-design="depth"] .d-globe-head {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

[data-design="depth"] .d-globe-head .d-h2 {
  margin: 0;
  max-width: 18ch;
}

/* The shaft keeps falling behind this section, so the globe is given its own
   pool of dark to sit in — otherwise the rings read as rings around it. */
[data-design="depth"] .d-globe::before {
  content: "";
  position: absolute;
  inset: 8% -10% 0;
  background: radial-gradient(60% 55% at 50% 52%, rgb(7 6 8 / 0.92) 0%, rgb(7 6 8 / 0.78) 45%, transparent 78%);
  pointer-events: none;
}

[data-design="depth"] .d-globe-stage {
  position: relative;
  height: min(78svh, 46rem);
  margin-inline: auto;
  max-width: 88rem;
  padding-inline: var(--gutter);
}

[data-design="depth"] .d-globe-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: pan-y;
  border-radius: 18px;
}

[data-design="depth"] .d-globe-canvas:active {
  cursor: grabbing;
}

[data-design="depth"] .d-globe-readout {
  position: absolute;
  left: var(--gutter);
  bottom: 0;
  width: min(22rem, calc(100% - var(--gutter) * 2));
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgb(7 6 8 / 0.88);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

[data-design="depth"] .d-globe-readout .d-h3 {
  margin: 0.5rem 0 0.35rem;
}

[data-design="depth"] .d-globe-readout .d-body {
  margin: 0;
  font-size: 0.9375rem;
}

/* The shaft keeps falling behind this section, and its rings converge right
   where the middle of this list sits — which left the text there competing
   with a bright tunnel while the edges read fine. The controls get their own
   ground to stand on. */
[data-design="depth"] .d-globe-controls {
  position: relative;
  margin-top: 2.5rem;
  display: grid;
  gap: 1.75rem;
  padding: clamp(1.25rem, 2.5vw, 2rem);
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgb(7 6 8 / 0.82);
  backdrop-filter: blur(10px);
}

[data-design="depth"] .d-globe-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
}

[data-design="depth"] .d-globe-hint {
  margin: 0;
  color: #ffffff;
  font-size: 0.9375rem;
}

[data-design="depth"] .d-globe-zoom {
  display: flex;
  gap: 0.5rem;
}

[data-design="depth"] .d-globe-zoom .d-chip {
  min-width: 2.5rem;
  min-height: 2.5rem;
  justify-content: center;
  border-radius: 10px;
}

/* A label on the left, the options in an even grid on the right: every
   chip the same width, so the eye reads rows rather than a ragged cloud. */
[data-design="depth"] .d-globe-group {
  display: grid;
  gap: 0.6rem 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-globe-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

[data-design="depth"] .d-globe-filters .d-chip {
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  text-align: left;
  line-height: 1.25;
}

[data-design="depth"] .d-swatch {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
}

[data-design="depth"] .d-globe-more {
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
}

[data-design="depth"] .d-globe-more summary {
  cursor: pointer;
  color: var(--bone);
}

[data-design="depth"] .d-globe-controls-list {
  display: grid;
  gap: 0.4rem 2rem;
  margin: 1rem 0 0;
  padding: 0 0 0 1.4rem;
  color: #ffffff;
  font-size: 0.9375rem;
}

[data-design="depth"] .d-globe-controls-list > li {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-globe-controls-list > li::marker {
  color: var(--ash-2);
  font-family: var(--font-data), monospace;
  font-size: 0.8em;
}

@media (min-width: 720px) {
  [data-design="depth"] .d-globe-group {
    grid-template-columns: 7rem minmax(0, 1fr);
    align-items: center;
  }

  [data-design="depth"] .d-globe-filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  [data-design="depth"] .d-globe-filters-view {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

[data-design="depth"] .d-globe-list {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 100%;
  overflow: auto;
}

[data-design="depth"] .d-globe-list > li {
  display: grid;
  gap: 0.2rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-globe-list span:first-child {
  font-weight: 600;
}

/* ── Core readouts ────────────────────────────────────────────────────── */

[data-design="depth"] .d-readouts {
  display: grid;
  gap: 1.25rem;
}

[data-design="depth"] .d-readout {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.35rem;
  background: rgb(9 8 12 / 0.6);
}

[data-design="depth"] .d-readout ol {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-readout ol > li {
  display: grid;
  gap: 0.25rem;
}

[data-design="depth"] .d-readout-score {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--ember);
}

[data-design="depth"] .d-readout-score[data-full] {
  color: var(--cool);
}

[data-design="depth"] .d-gauges {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

[data-design="depth"] .d-gauge {
  padding: 1.1rem 1.25rem;
  border-left: 2px solid var(--line-2);
}

[data-design="depth"] .d-gauge-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bone);
}

[data-design="depth"] .d-gauge-label {
  margin: 0.15rem 0 0.35rem;
  font-weight: 600;
  font-size: 0.9375rem;
}

[data-design="depth"] .d-gauge-note {
  margin: 0;
  font-size: 0.875rem;
}

[data-design="depth"] .d-opt {
  padding: 1.5rem;
}

[data-design="depth"] .d-opt-delta {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0.75rem 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
}

[data-design="depth"] .d-opt-before {
  color: var(--ash-2);
  text-decoration: line-through;
}

[data-design="depth"] .d-opt-after {
  color: var(--cool);
}

[data-design="depth"] .d-incident {
  margin-top: clamp(3rem, 6vw, 5rem);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border-left: 2px solid var(--magma);
  background: linear-gradient(90deg, rgb(255 107 44 / 0.07), transparent 60%);
}

[data-design="depth"] .d-incident dl {
  display: grid;
  gap: 1.1rem;
  margin: 1.5rem 0 0;
}

[data-design="depth"] .d-incident dd {
  margin: 0.3rem 0 0;
}

[data-design="depth"] .d-decisions {
  display: grid;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-decisions > li {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--line);
}

[data-design="depth"] .d-decision-instead {
  margin: 0.35rem 0 0.6rem;
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.875rem;
  color: var(--ash-2);
}

[data-design="depth"] .d-decision-result {
  margin: 0.6rem 0 0;
  font-weight: 600;
  color: var(--cool);
}

[data-design="depth"] .d-guards {
  display: grid;
  gap: 0.6rem;
  margin: 2.5rem 0 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-guards li {
  position: relative;
  padding-left: 1.4rem;
  max-width: none;
}

[data-design="depth"] .d-guards li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--magma);
}

/* ── Strata ───────────────────────────────────────────────────────────── */

[data-design="depth"] .d-strata {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1px;
  background: var(--line);
  border-block: 1px solid var(--line);
}

[data-design="depth"] .d-strata > li {
  position: relative;
  display: grid;
  grid-template-columns: 3px minmax(0, 1fr);
  gap: 1.25rem;
  background: var(--void);
  padding-block: 1.5rem;
  transition: background-color 0.5s var(--fall);
}

[data-design="depth"] .d-strata-body {
  display: grid;
  gap: 0.75rem 2rem;
  align-items: start;
}

[data-design="depth"] .d-strata-role {
  display: grid;
  gap: 0.15rem;
}

[data-design="depth"] .d-strata > li:hover {
  background: rgb(244 241 247 / 0.025);
}

[data-design="depth"] .d-strata-edge {
  background: linear-gradient(var(--magma), transparent);
  border-radius: 2px;
}

[data-design="depth"] .d-strata-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

[data-design="depth"] .d-strata-title {
  margin: 0.2rem 0 0;
  font-weight: 600;
  color: var(--cool);
}

[data-design="depth"] .d-strata-highlight {
  margin: 0.6rem 0 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ember);
}

/* ── About and the way up ─────────────────────────────────────────────── */

[data-design="depth"] .d-about {
  display: grid;
  gap: 2.5rem;
}

[data-design="depth"] .d-about-text {
  display: grid;
  gap: 1.1rem;
}

[data-design="depth"] .d-principles {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  align-content: start;
}

[data-design="depth"] .d-principles > li {
  padding: 1.35rem;
}

[data-design="depth"] .d-principles .d-body {
  margin-top: 0.5rem;
}

[data-design="depth"] .d-offers {
  display: grid;
  gap: 1rem;
  margin: 2.5rem 0 0;
  padding: 0;
  list-style: none;
}

[data-design="depth"] .d-offers > li {
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgb(244 241 247 / 0.02);
}

[data-design="depth"] .d-offers > li h3 {
  margin: 0.5rem 0 0.4rem;
  font-size: 1.0625rem;
  font-weight: 600;
}

[data-design="depth"] .d-offers > li p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--ash);
}

@media (min-width: 48rem) {
  [data-design="depth"] .d-offers {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

[data-design="depth"] .d-contact {
  text-align: center;
}

[data-design="depth"] .d-contact-title {
  margin: 0.75rem 0 0;
}

[data-design="depth"] .d-contact-lead {
  margin: 1.25rem auto 0;
}

[data-design="depth"] .d-contact-actions {
  justify-content: center;
  margin-top: 2.25rem;
}

[data-design="depth"] .d-colophon {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
  padding-block: 2rem 2.5rem;
}

[data-design="depth"] .d-colophon-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem 2rem;
}

[data-design="depth"] .d-colophon-row > div {
  display: grid;
  gap: 0.4rem;
}

[data-design="depth"] .d-colophon-name {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

/* ── Wider screens ────────────────────────────────────────────────────── */

@media (max-width: 47.999rem) {
  /* Four scores across a 390px screen put the labels on top of each other, so
     the readout becomes two rows of two and the tracking tightens. */
  [data-design="depth"] .d-readout ol {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 0.75rem;
  }

  [data-design="depth"] .d-data {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }

  [data-design="depth"] .d-readout-score {
    font-size: 1.5rem;
  }

  /* One long column of metadata reads better as pairs. */
  [data-design="depth"] .d-surface-proof {
    gap: 1rem;
  }

  [data-design="depth"] .d-surface-proof dd {
    font-size: 1.25rem;
  }

  [data-design="depth"] .d-brand {
    font-size: 0.9375rem;
    white-space: nowrap;
  }

  [data-design="depth"] .d-nav {
    padding-inline: 1rem;
  }

  [data-design="depth"] .d-chip {
    font-size: 0.75rem;
    padding: 0.28rem 0.6rem;
  }

  /* On a phone the readout sits under the globe rather than over it, so the
     stage grows to hold both; a fixed height let the card overflow and hide
     under the controls panel. */
  [data-design="depth"] .d-globe-stage {
    height: auto;
  }

  [data-design="depth"] .d-globe-canvas {
    height: min(64svh, 34rem);
    border-radius: 0;
  }

  /* Edge to edge on a phone: the gutter every other section uses left an
     empty strip down each side of the globe. The readout keeps its margin. */
  [data-design="depth"] .d-globe-stage {
    padding-inline: 0;
  }

  [data-design="depth"] .d-globe-readout {
    margin-inline: var(--gutter);
  }

  [data-design="depth"] .d-globe-readout {
    position: static;
    width: auto;
    margin-top: 1rem;
  }
}

@media (min-width: 48rem) {
  [data-design="depth"] .d-surface-row {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 3rem;
  }

  [data-design="depth"] .d-surface-proof {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  [data-design="depth"] .d-grid,
  [data-design="depth"] .d-clients {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  [data-design="depth"] .d-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  [data-design="depth"] .d-index > li {
    grid-template-columns: 3rem minmax(0, 1fr) minmax(0, 18rem);
    gap: 1.5rem;
    align-items: start;
  }

  [data-design="depth"] .d-readouts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  [data-design="depth"] .d-gauges {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  [data-design="depth"] .d-globe-controls-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  [data-design="depth"] .d-about {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  }

  [data-design="depth"] .d-strata-body {
    grid-template-columns: minmax(0, 13rem) minmax(0, 1fr);
  }
}

@media (min-width: 62rem) {
  [data-design="depth"] .d-slab-lead {
    grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  }

  [data-design="depth"] .d-clients {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  [data-design="depth"] .d-decisions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem 3rem;
  }

  [data-design="depth"] .d-gauges {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
`;
