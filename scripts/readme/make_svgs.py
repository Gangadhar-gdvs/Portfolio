"""
Builds the animated SVG artwork for the portfolio README (docs/readme/*.svg).

    pip install fonttools
    python3 scripts/readme/make_svgs.py

Needs Node 22.6+ (the particle shapes are read straight from src/gl/shapes.ts).

Every word is converted to vector paths from the site's own fonts (Archivo
Expanded ExtraBold and JetBrains Mono), because GitHub renders README SVGs as
images, where web fonts can't load. Animations are SMIL, which runs inside
<img> in every modern browser.
"""

import json
import math
import subprocess
from html import escape
import random
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "readme"
OUT.mkdir(parents=True, exist_ok=True)
DOTS = json.loads(
    subprocess.run(
        ["node", "--experimental-strip-types", "--no-warnings", str(Path(__file__).with_name("dots.mjs"))],
        capture_output=True, text=True, check=True, cwd=ROOT,
    ).stdout
)

W = 1280
PAD = 64

C = {
    "abyss": "#05080D",
    "deep": "#010306",
    "raised": "#0B111A",
    "surface": "#E6E9EC",
    "ink": "#0A0D12",
    "ink_soft": "#545E69",
    "bone": "#D7E3EA",
    "bone_soft": "#8593A1",
    "phosphor": "#6FE6FF",
    "phosphor_deep": "#0A6E8A",
    "ember": "#FF9E4A",
    "line": "#1B2632",
    "line_strong": "#2A3947",
}

PALETTES = {
    "dark": {
        "card": C["abyss"],
        "stroke": "#15202B",
        "text": C["bone"],
        "soft": C["bone_soft"],
        "accent": C["phosphor"],
        "lens": C["deep"],
        "rule": C["line_strong"],
    },
    "light": {
        "card": C["surface"],
        "stroke": "#D3D8DD",
        "text": C["ink"],
        "soft": C["ink_soft"],
        "accent": C["phosphor_deep"],
        "lens": C["abyss"],
        "rule": "#C5CCD3",
    },
}

# Every themed colour is read through a variable; see theme_style().
TOKENS = {
    "card": "var(--card)",
    "card_stroke": "var(--stroke)",
    "text": "var(--text)",
    "soft": "var(--soft)",
    "accent": "var(--accent)",
    "lens_bg": "var(--lens)",
    "rule": "var(--rule)",
}
THEMES = {"dark": TOKENS, "light": TOKENS}


def theme_style(theme: str) -> str:
    """Dark files are always dark; light files follow the reader's colour scheme."""
    def block(name: str) -> str:
        return ";".join(f"--{k}:{v}" for k, v in PALETTES[name].items())
    if theme == "dark":
        return f"<style>svg{{{block('dark')}}}</style>"
    return (
        f"<style>svg{{{block('light')}}}"
        f"@media (prefers-color-scheme: dark){{svg{{{block('dark')}}}}}</style>"
    )


def fmt(v: float) -> str:
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


class Face:
    """Lays out a single line of text as one SVG path from a TTF."""

    def __init__(self, path: Path):
        self.font = TTFont(path)
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upm = self.font["head"].unitsPerEm
        self.hmtx = self.font["hmtx"]

    def advance(self, ch: str) -> int:
        return self.hmtx[self.cmap[ord(ch)]][0]

    def width(self, text: str, size: float, tracking: float = 0.0) -> float:
        raw = sum(self.advance(c) for c in text) * size / self.upm
        return raw + tracking * size * max(0, len(text) - 1)

    def path(self, text: str, x: float, baseline: float, size: float, tracking: float = 0.0) -> str:
        pen = SVGPathPen(self.glyphs, ntos=fmt)
        scale = size / self.upm
        cursor = x
        for ch in text:
            name = self.cmap[ord(ch)]
            self.glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
            cursor += self.advance(ch) * scale + tracking * size
        return pen.getCommands()


DISPLAY = Face(ROOT / "src/assets/fonts/Archivo-ExpandedExtraBold.ttf")
MONO = Face(ROOT / "src/assets/fonts/JetBrainsMono-Medium.ttf")
CAP = 0.686  # Archivo cap height, in em


def svg(height: int, label: str, body: str, defs: str = "", theme: str = "dark") -> str:
    label = escape(label)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{height}" '
        f'viewBox="0 0 {W} {height}" role="img" aria-label="{label}">'
        f"<title>{label}</title>{theme_style(theme)}"
        f"<defs>{defs}</defs>{body}</svg>"
    )


def spline_anim(attr: str, frames: list[tuple[float, str]], dur: float, ease: str = "0.45 0 0.25 1") -> str:
    """SMIL animation through keyframes (time in seconds, value) with easing."""
    times = ";".join(f"{t / dur:.4f}" for t, _ in frames)
    values = ";".join(v for _, v in frames)
    splines = ";".join([ease] * (len(frames) - 1))
    return (
        f'<animate attributeName="{attr}" dur="{dur}s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="{times}" values="{values}" keySplines="{splines}"/>'
    )


def mono(text: str, x: float, baseline: float, size: float, fill: str, anchor: str = "start", opacity: float = 1) -> str:
    tracking = 0.04
    if anchor == "end":
        x -= MONO.width(text, size, tracking)
    elif anchor == "middle":
        x -= MONO.width(text, size, tracking) / 2
    op = "" if opacity == 1 else f' fill-opacity="{opacity}"'
    return f'<path d="{MONO.path(text, x, baseline, size, tracking)}" style="fill:{fill}"{op}/>'


def pulse_rule(y: float, x0: float, x1: float, color: str, uid: str, dur: float = 3.6) -> tuple[str, str]:
    defs = (
        f'<linearGradient id="{uid}-g" x1="0" x2="1">'
        f'<stop offset="0" style="stop-color:{color}" stop-opacity="0"/>'
        f'<stop offset=".5" style="stop-color:{color}" stop-opacity=".6"/>'
        f'<stop offset="1" style="stop-color:{color}" stop-opacity="0"/></linearGradient>'
        f'<linearGradient id="{uid}-p" x1="0" x2="1">'
        f'<stop offset="0" stop-color="{C["phosphor"]}" stop-opacity="0"/>'
        f'<stop offset=".6" stop-color="{C["phosphor"]}"/>'
        f'<stop offset="1" stop-color="{C["phosphor"]}" stop-opacity="0"/></linearGradient>'
        f'<clipPath id="{uid}-c"><rect x="{x0}" y="{y - 4}" width="{x1 - x0}" height="8"/></clipPath>'
    )
    body = (
        f'<rect x="{x0}" y="{y - 0.5}" width="{x1 - x0}" height="1" fill="url(#{uid}-g)"/>'
        f'<g clip-path="url(#{uid}-c)"><rect x="{x0 - 180}" y="{y - 1.5}" width="180" height="3" rx="1.5" fill="url(#{uid}-p)">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;{x1 - x0 + 180} 0" '
        f'dur="{dur}s" repeatCount="indefinite"/></rect></g>'
    )
    return defs, body


def twinkle(dur: float, begin: float, low: float = 0.35) -> str:
    return (
        f'<animate attributeName="opacity" values="1;{low};1" dur="{dur}s" begin="{begin}s" '
        f'repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1"/>'
    )


def dot_path(points: list[tuple[float, float]]) -> str:
    return "".join(f"M{fmt(x)} {fmt(y)}h0" for x, y in points)


# ── 1. Hero ──────────────────────────────────────────────────────────────────


def hero(theme: str) -> str:
    t = THEMES[theme]
    H = 520
    size = 118
    y1 = 221
    y2 = round(y1 + 0.9 * size)
    line1 = DISPLAY.path("GANGADHARA", PAD, y1, size, -0.012)
    line2 = DISPLAY.path("GOOTI", PAD, y2, size, -0.012)
    uid = f"hero-{theme}"

    # Lens choreography (seconds): open on the first letter, sweep the name,
    # rest on GOOTI, drift to the code on the right, close.
    dur = 11.0
    keys = [
        (0.0, 150, 180, 0),
        (0.6, 150, 180, 92),
        (3.2, 1110, 180, 92),
        (4.6, 330, 290, 92),
        (6.0, 330, 290, 92),
        (7.4, 905, 300, 118),
        (9.4, 905, 300, 118),
        (10.2, 905, 300, 0),
        (11.0, 150, 180, 0),
    ]

    def lens_anims() -> str:
        return (
            spline_anim("cx", [(k[0], str(k[1])) for k in keys], dur)
            + spline_anim("cy", [(k[0], str(k[2])) for k in keys], dur)
            + spline_anim("r", [(k[0], str(k[3])) for k in keys], dur)
        )

    translate = (
        f'<animateTransform attributeName="transform" type="translate" dur="{dur}s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="{";".join(f"{k[0] / dur:.4f}" for k in keys)}" '
        f'values="{";".join(f"{k[1]} {k[2]}" for k in keys)}" '
        f'keySplines="{";".join(["0.45 0 0.25 1"] * (len(keys) - 1))}"/>'
    )
    scale = (
        f'<animateTransform attributeName="transform" type="scale" dur="{dur}s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="{";".join(f"{k[0] / dur:.4f}" for k in keys)}" '
        f'values="{";".join(f"{k[3] / 92:.3f}" for k in keys)}" '
        f'keySplines="{";".join(["0.45 0 0.25 1"] * (len(keys) - 1))}"/>'
    )

    rng = random.Random(7)
    specks_a, specks_b, specks_c, glow = [], [], [], []
    for _ in range(420):
        x, y = rng.uniform(20, W - 20), rng.uniform(20, H - 20)
        bucket = rng.random()
        (glow if bucket < 0.12 else specks_a if bucket < 0.45 else specks_b if bucket < 0.75 else specks_c).append((x, y))

    code = [
        "const stack = [",
        '  "interface",',
        '  "devices",',
        '  "services",',
        '  "data",',
        '  "intelligence",',
        "];",
    ]
    code_paths = "".join(mono(line, 820, 236 + i * 24, 17, C["phosphor"]) for i, line in enumerate(code))

    guides = ""
    for base in (y1, y2):
        for off, op, dash in ((CAP * size, 0.5, "6 6"), (0.526 * size, 0.28, "3 7"), (0, 0.7, "")):
            y = base - off
            dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
            guides += (
                f'<line x1="{PAD}" x2="{W - PAD}" y1="{fmt(y)}" y2="{fmt(y)}" stroke="{C["phosphor"]}" '
                f'stroke-opacity="{op}" stroke-width="1"{dash_attr}/>'
            )
    guides += mono("CAP HEIGHT · 686", W - PAD, y1 - CAP * size + 18, 13, C["phosphor"], "end", 0.8)
    guides += mono("BASELINE", W - PAD, y1 - 8, 13, C["phosphor"], "end", 0.8)

    defs = (
        f'<clipPath id="{uid}-card"><rect width="{W}" height="{H}" rx="24"/></clipPath>'
        f'<clipPath id="{uid}-lens"><circle cx="150" cy="180" r="0">{lens_anims()}</circle></clipPath>'
        f'<pattern id="{uid}-grid" width="32" height="32" patternUnits="userSpaceOnUse">'
        f'<path d="M32 0H0V32" fill="none" stroke="{C["phosphor"]}" stroke-opacity=".09"/></pattern>'
        f'<pattern id="{uid}-scan" width="4" height="4" patternUnits="userSpaceOnUse">'
        f'<rect width="4" height="1" fill="#000" fill-opacity=".35"/></pattern>'
        f'<filter id="{uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'
    )

    status = (
        f'<circle cx="{PAD + 6}" cy="66" r="7" fill="{C["ember"]}"/>'
        f'<circle cx="{PAD + 6}" cy="66" r="7" fill="none" stroke="{C["ember"]}" stroke-width="2">'
        f'<animate attributeName="r" values="7;18" dur="2.4s" repeatCount="indefinite"/>'
        f'<animate attributeName="stroke-opacity" values=".6;0" dur="2.4s" repeatCount="indefinite"/></circle>'
        + mono("OPEN TO FULL-TIME ROLES", PAD + 26, 74, 21, t["text"])
        + mono("·  PULIVENDULA, INDIA  ·  IST", PAD + 26 + MONO.width("OPEN TO FULL-TIME ROLES ", 21, 0.04) + 8, 74, 21, t["soft"])
        + mono("PORTFOLIO · 2026", W - PAD, 74, 21, t["soft"], "end")
    )

    bottom = (
        f'<line x1="{PAD}" x2="{W - PAD}" y1="410" y2="410" style="stroke:{t["rule"]}"/>'
        + mono("FULL-STACK ENGINEER — WEB · MOBILE · DESKTOP · AI", PAD, 458, 21, t["text"])
        + mono("LIGHTHOUSE DESKTOP · 100 × 4", W - PAD, 458, 21, t["accent"], "end")
    )

    underneath = (
        f'<g clip-path="url(#{uid}-lens)">'
        f'<rect width="{W}" height="{H}" style="fill:{t["lens_bg"]}"/>'
        f'<rect width="{W}" height="{H}" fill="url(#{uid}-grid)"/>'
        f'<path d="{dot_path(specks_a)}" stroke="{C["bone"]}" stroke-width="2" stroke-linecap="round" opacity=".55">{twinkle(3.1, 0)}</path>'
        f'<path d="{dot_path(specks_b)}" stroke="{C["bone"]}" stroke-width="1.6" stroke-linecap="round" opacity=".4">{twinkle(4.3, 1.1)}</path>'
        f'<path d="{dot_path(specks_c)}" stroke="{C["phosphor"]}" stroke-width="1.6" stroke-linecap="round" opacity=".5">{twinkle(5.2, 2.2)}</path>'
        f'<path d="{dot_path(glow)}" stroke="{C["phosphor"]}" stroke-width="3" stroke-linecap="round">{twinkle(2.6, 0.4, 0.4)}</path>'
        f"{guides}"
        f'<path d="{line1}" fill="none" stroke="{C["phosphor"]}" stroke-width="1.6"/>'
        f'<path d="{line2}" fill="none" stroke="{C["phosphor"]}" stroke-width="1.6"/>'
        f"{code_paths}"
        f'<rect width="{W}" height="{H}" fill="url(#{uid}-scan)"/>'
        f"</g>"
    )

    ticks = "".join(
        f'<line x1="{fmt(math.cos(a) * 94)}" y1="{fmt(math.sin(a) * 94)}" x2="{fmt(math.cos(a) * 108)}" '
        f'y2="{fmt(math.sin(a) * 108)}" stroke="{C["phosphor"]}" stroke-width="2"/>'
        for a in (0, math.pi / 2, math.pi, 3 * math.pi / 2)
    )
    label_w = MONO.width("X-RAY", 13, 0.04)
    rim = (
        f'<circle cx="150" cy="180" r="0" fill="none" stroke="{C["phosphor"]}" stroke-width="6" '
        f'stroke-opacity=".45" filter="url(#{uid}-glow)">{lens_anims()}</circle>'
        f'<circle cx="150" cy="180" r="0" fill="none" stroke="{C["phosphor"]}" stroke-width="1.5">{lens_anims()}</circle>'
        f'<g>{translate}<g>{scale}{ticks}{mono("X-RAY", -label_w / 2, 128, 13, C["phosphor"])}</g></g>'
    )

    body = (
        f'<g clip-path="url(#{uid}-card)">'
        f'<rect width="{W}" height="{H}" style="fill:{t["card"]}"/>'
        f"{status}"
        f'<path d="{line1}" style="fill:{t["text"]}"/>'
        f'<path d="{line2}" style="fill:{t["text"]}"/>'
        f"{bottom}{underneath}{rim}</g>"
        f'<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="23.5" fill="none" style="stroke:{t["card_stroke"]}"/>'
    )
    return svg(H, "Gangadhara Gooti, full-stack engineer. An X-ray lens sweeps across the name.", body, defs, theme)


# ── 2. Typed taglines ────────────────────────────────────────────────────────


def tagline(theme: str) -> str:
    t = THEMES[theme]
    color = "var(--accent)"
    H = 64
    size = 26
    lines = ["SIMPLE ON THE SURFACE.", "ENGINEERED DEEPLY UNDERNEATH.", "WEB · MOBILE · DESKTOP · AI"]
    segment = 4.6
    dur = segment * len(lines)
    char_w = MONO.width("M", size, 0.04) + 0.04 * size
    body = ""
    defs = ""
    for i, text in enumerate(lines):
        width = MONO.width(text, size, 0.04)
        x0 = (W - width) / 2
        start = i * segment + 0.2
        frames: list[tuple[float, float]] = [(0.0, 0.0)]
        for c in range(1, len(text) + 1):
            frames.append((start + c * 0.045, min(width, c * char_w)))
        hold_end = start + len(text) * 0.045 + 2.3
        steps = 6
        for s in range(1, steps + 1):
            frames.append((hold_end + s * 0.05, width * (1 - s / steps)))
        frames = [f for f in frames if f[0] < dur]
        times = ";".join(f"{f[0] / dur:.4f}" for f in frames)
        widths = ";".join(fmt(f[1]) for f in frames)
        carets = ";".join(fmt(x0 + f[1] + 4) for f in frames)
        visible_from, visible_to = start, hold_end + steps * 0.05 + 0.05
        vis_times = f"0;{visible_from / dur:.4f};{min(visible_to / dur, 0.9999):.4f}"
        defs += (
            f'<clipPath id="tl-{theme}-{i}"><rect x="{fmt(x0)}" y="10" width="0" height="46">'
            f'<animate attributeName="width" dur="{dur}s" repeatCount="indefinite" calcMode="discrete" '
            f'keyTimes="{times}" values="{widths}"/></rect></clipPath>'
        )
        body += f'<path clip-path="url(#tl-{theme}-{i})" d="{MONO.path(text, x0, 42, size, 0.04)}" style="fill:{color}"/>'
        body += (
            f'<rect x="{fmt(x0 + 4)}" y="16" width="3" height="32" style="fill:{color}" opacity="0">'
            f'<animate attributeName="x" dur="{dur}s" repeatCount="indefinite" calcMode="discrete" '
            f'keyTimes="{times}" values="{carets}"/>'
            f'<animate attributeName="opacity" dur="{dur}s" repeatCount="indefinite" calcMode="discrete" '
            f'keyTimes="{vis_times}" values="0;1;0"/></rect>'
        )
    body = f'<g>{body}</g>'
    return svg(H, "Simple on the surface. Engineered deeply underneath. Web, mobile, desktop and AI.", body, defs, theme)


# ── 3. Divider ───────────────────────────────────────────────────────────────


def divider() -> str:
    defs, rule = pulse_rule(16, PAD, W - PAD, "#3FC8E4", "div", 4.2)
    marks = "".join(
        f'<rect x="{fmt(x - 3)}" y="13" width="6" height="6" transform="rotate(45 {fmt(x)} 16)" fill="#3FC8E4" fill-opacity=".8"/>'
        for x in (W / 2,)
    )
    return svg(32, "Divider", rule + marks, defs)


# ── 4. Section plates ────────────────────────────────────────────────────────


def plate(theme: str, key: str, eyebrow: str, title: str, aside: str) -> str:
    t = THEMES[theme]
    H = 176
    size = 74
    baseline = 70 + CAP * size + 8
    title_path = DISPLAY.path(title, PAD, baseline, size, -0.012)
    title_w = DISPLAY.width(title, size, -0.012)
    uid = f"pl-{key}-{theme}"
    dur = 7.0
    band = 56
    defs = (
        f'<mask id="{uid}-m"><rect width="{W}" height="{H}" fill="#fff"/>'
        f'<rect x="{PAD - band - 20}" y="0" width="{band}" height="{H}" fill="#000">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;0 0;{title_w + band + 40} 0;{title_w + band + 40} 0" '
        f'keyTimes="0;.25;.7;1" dur="{dur}s" repeatCount="indefinite"/></rect></mask>'
        f'<clipPath id="{uid}-c"><rect x="{PAD - band - 20}" y="0" width="{band}" height="{H}">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;0 0;{title_w + band + 40} 0;{title_w + band + 40} 0" '
        f'keyTimes="0;.25;.7;1" dur="{dur}s" repeatCount="indefinite"/></rect></clipPath>'
    )
    rule_defs, rule = pulse_rule(H - 18, PAD, W - PAD, t["accent"], uid, 5.0)
    defs += rule_defs
    marker = f'<rect x="{PAD}" y="30" width="10" height="10" style="fill:{t["accent"]}"/>'
    body = (
        marker
        + mono(eyebrow, PAD + 22, 41, 20, t["accent"])
        + mono(aside, W - PAD, 41, 18, t["soft"], "end")
        + f'<path d="{title_path}" fill="none" style="stroke:{t["accent"]}" stroke-opacity=".35" stroke-width="1.4" transform="translate(7 7)"/>'
        + f'<path d="{title_path}" style="fill:{t["text"]}" mask="url(#{uid}-m)"/>'
        + f'<path d="{title_path}" fill="none" style="stroke:var(--accent)" stroke-width="1.5" clip-path="url(#{uid}-c)"/>'
        + rule
    )
    return svg(H, f"{eyebrow} {title}", body, defs, theme)


# ── 5. The stack, drawn by the site's own particle shapes ────────────────────


def stack_layers() -> str:
    H = 470
    names = [("browser", "INTERFACE"), ("devices", "DEVICES"), ("network", "SERVICES"), ("database", "DATA"), ("core", "INTELLIGENCE")]
    col = (W - 2 * PAD) / 5
    box_w, box_h = 196, 188
    cy = 250
    body = (
        f'<rect width="{W}" height="{H}" rx="24" fill="{C["abyss"]}"/>'
        f'<rect width="{W}" height="{H}" rx="24" fill="url(#st-grid)"/>'
        f'<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="23.5" fill="none" stroke="#15202B"/>'
    )
    rule_defs, rule = pulse_rule(76, PAD + 120, W - PAD - 70, C["phosphor"], "st", 3.4)
    defs = (
        '<pattern id="st-grid" width="32" height="32" patternUnits="userSpaceOnUse">'
        f'<path d="M32 0H0V32" fill="none" stroke="{C["phosphor"]}" stroke-opacity=".05"/></pattern>' + rule_defs
    )
    body += mono("SURFACE", PAD, 82, 18, C["bone_soft"]) + rule + mono("CORE", W - PAD, 82, 18, C["phosphor"], "end")
    body += mono("22,000 PARTICLES  ·  ONE DRAW CALL  ·  SCROLL-DRIVEN", W / 2, 124, 16, C["bone_soft"], "middle")

    for i, (shape, label) in enumerate(names):
        pts = DOTS[shape]
        xs = sorted(p[0] for p in pts)
        ys = sorted(p[1] for p in pts)
        lo = int(len(xs) * 0.015)
        hi = int(len(xs) * 0.985)
        x_min, x_max, y_min, y_max = xs[lo], xs[hi], ys[lo], ys[hi]
        s = min(box_w / (x_max - x_min), box_h / (y_max - y_min))
        cx = PAD + col * (i + 0.5)
        mx, my = (x_min + x_max) / 2, (y_min + y_max) / 2
        groups: dict[str, list[tuple[float, float]]] = {"hi": [], "near": [], "mid": [], "far": []}
        for x, y, h, z in pts:
            px, py = cx + (x - mx) * s, cy - (y - my) * s
            if abs(px - cx) > box_w * 0.62 or abs(py - cy) > box_h * 0.62:
                continue
            key = "hi" if h > 0.5 else "near" if z > 0.25 else "mid" if z > -0.4 else "far"
            groups[key].append((px, py))
        body += (
            f'<path d="{dot_path(groups["far"])}" stroke="{C["bone"]}" stroke-width="1.5" stroke-linecap="round" opacity=".35">{twinkle(4.6, i * 0.3)}</path>'
            f'<path d="{dot_path(groups["mid"])}" stroke="{C["bone"]}" stroke-width="1.8" stroke-linecap="round" opacity=".6">{twinkle(3.7, 1 + i * 0.2)}</path>'
            f'<path d="{dot_path(groups["near"])}" stroke="{C["bone"]}" stroke-width="2.1" stroke-linecap="round" opacity=".85">{twinkle(5.3, 2 + i * 0.25)}</path>'
            f'<path d="{dot_path(groups["hi"])}" stroke="{C["phosphor"]}" stroke-width="2.4" stroke-linecap="round">{twinkle(2.8, i * 0.4, 0.55)}</path>'
        )
        body += mono(label, cx, 392, 19, C["bone"], "middle")
        body += mono(f"LAYER {i + 1}", cx, 420, 15, C["phosphor"] if i == 4 else C["bone_soft"], "middle")
    body += mono("drawn by src/gl/shapes.ts", W - PAD, H - 22, 14, C["bone_soft"], "end", 0.8)
    return svg(H, "The five layers of the stack as particle shapes: interface, devices, services, data, intelligence.", body, defs)


# ── 6. The journey through the page ──────────────────────────────────────────


def flow() -> str:
    H = 356
    nodes = [
        ("01  SURFACE", "calm light hero, SSR"),
        ("02  X-RAY LENS", "cursor-driven CSS mask"),
        ("03  THE DIVE", "pinned scroll, lens opens"),
        ("04  FIVE LAYERS", "22k particles morph"),
        ("05  SELECTED WORK", "projects as architecture"),
        ("06  RESURFACE", "light rises to contact"),
    ]
    nw, nh, gap = 344, 100, 60
    xs = [PAD, PAD + nw + gap, PAD + 2 * (nw + gap)]
    rows = [74, 214]
    body = (
        f'<rect width="{W}" height="{H}" rx="24" fill="{C["abyss"]}"/>'
        f'<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="23.5" fill="none" stroke="#15202B"/>'
    )
    body += mono("THE JOURNEY  ·  ONE SCROLL, SIX MOMENTS", PAD, 46, 17, C["bone_soft"])
    connectors = []
    for r in range(2):
        for c in range(2):
            x1 = xs[c] + nw
            x2 = xs[c + 1]
            y = rows[r] + nh / 2
            connectors.append(f"M{x1} {y} L{x2} {y}")
    turn_y = rows[0] + nh + 20
    connectors.append(
        f"M{xs[2] + nw / 2} {rows[0] + nh} L{xs[2] + nw / 2} {turn_y} L{xs[0] + nw / 2} {turn_y} L{xs[0] + nw / 2} {rows[1]}"
    )
    for i, d in enumerate(connectors):
        body += f'<path d="{d}" fill="none" stroke="{C["phosphor"]}" stroke-opacity=".4" stroke-width="1.4"/>'
        body += (
            f'<circle r="3.5" fill="{C["phosphor"]}"><animateMotion dur="{2.2 if i < 4 else 3.6}s" begin="{i * 0.35}s" '
            f'repeatCount="indefinite" path="{d}"/></circle>'
        )
    for i, (title, detail) in enumerate(nodes):
        x = xs[i % 3]
        y = rows[i // 3]
        accent = i == 1
        body += (
            f'<rect x="{x}" y="{y}" width="{nw}" height="{nh}" rx="12" fill="{C["deep"] if accent else C["raised"]}" '
            f'stroke="{C["phosphor"] if accent else C["line_strong"]}"/>'
        )
        body += mono(title, x + 24, y + 42, 22, C["phosphor"] if accent else C["bone"])
        body += mono(detail, x + 24, y + 74, 17, C["bone_soft"])
    return svg(H, "How the page flows: surface, X-ray lens, the dive, five layers, selected work, resurface.", body)


# ── 7. Footer: resurfacing ───────────────────────────────────────────────────


def footer() -> str:
    H = 340
    size = 50
    l1, l2 = "LET'S BUILD SOMETHING", "THAT FEELS SIMPLE."
    w1, w2 = DISPLAY.width(l1, size, -0.012), DISPLAY.width(l2, size, -0.012)
    p1 = DISPLAY.path(l1, (W - w1) / 2, 150, size, -0.012)
    p2 = DISPLAY.path(l2, (W - w2) / 2, 150 + 0.95 * size + 8, size, -0.012)
    contact = "GANGADHARGDVS0@GMAIL.COM  ·  LINKEDIN.COM/IN/GANGADHAR-GOOTI"
    dur = 9.0
    frames = [(0.0, "330"), (2.6, "860"), (7.0, "860"), (8.2, "330"), (9.0, "330")]
    rise = spline_anim("r", frames, dur, "0.65 0 0.35 1")
    defs = (
        f'<clipPath id="ft-card"><rect width="{W}" height="{H}" rx="24"/></clipPath>'
        f'<clipPath id="ft-dome"><circle cx="{W / 2}" cy="{H + 400}" r="330">{rise}</circle></clipPath>'
    )
    outline = (
        f'<path d="{p1}" fill="none" stroke="{C["phosphor"]}" stroke-width="1.3"/>'
        f'<path d="{p2}" fill="none" stroke="{C["phosphor"]}" stroke-width="1.3"/>'
        + mono(contact, W / 2, 292, 17, C["bone_soft"], "middle")
    )
    solid = (
        f'<path d="{p1}" fill="{C["ink"]}"/><path d="{p2}" fill="{C["ink"]}"/>'
        + mono(contact, W / 2, 292, 17, C["ink_soft"], "middle")
    )
    body = (
        f'<g clip-path="url(#ft-card)">'
        f'<rect width="{W}" height="{H}" fill="{C["abyss"]}"/>'
        + mono("BACK TO THE SURFACE", W / 2, 76, 17, C["phosphor"], "middle")
        + outline
        + f'<g clip-path="url(#ft-dome)"><rect width="{W}" height="{H}" fill="{C["surface"]}"/>'
        + mono("BACK TO THE SURFACE", W / 2, 76, 17, C["phosphor_deep"], "middle")
        + solid
        + "</g></g>"
        f'<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="23.5" fill="none" stroke="#15202B"/>'
    )
    return svg(H, "Let's build something that feels simple. Email gangadhargdvs0@gmail.com", body, defs)


PLATES = [
    ("idea", "01 / CONCEPT", "THE IDEA", "SURFACE → UNDERNEATH"),
    ("stack", "02 / FIVE LAYERS, IN PARTICLES", "THE STACK", "INTERFACE → INTELLIGENCE"),
    ("screens", "03 / THE REAL THING", "SCREENS", "DESKTOP · MOBILE"),
    ("how", "04 / UNDER THE HOOD", "HOW IT WORKS", "LENS · DIVE · PARTICLES"),
    ("built", "05 / STACK & SCORES", "BUILT WITH", "NEXT.JS 16 · THREE.JS · GSAP"),
    ("run", "06 / LOCAL SETUP", "RUN IT", "NODE 22.12+"),
]


def main() -> None:
    written = {}
    for theme in ("dark", "light"):
        written[f"hero-{theme}.svg"] = hero(theme)
        written[f"tagline-{theme}.svg"] = tagline(theme)
        for key, eyebrow, title, aside in PLATES:
            written[f"section-{key}-{theme}.svg"] = plate(theme, key, eyebrow, title, aside)
    written["divider.svg"] = divider()
    written["stack-layers.svg"] = stack_layers()
    written["flow.svg"] = flow()
    written["footer.svg"] = footer()
    for name, content in written.items():
        (OUT / name).write_text(content)
    total = 0
    for name in sorted(written):
        size = (OUT / name).stat().st_size
        total += size
        print(f"{size / 1024:7.1f} KB  {name}")
    print(f"{total / 1024:7.1f} KB  total")


if __name__ == "__main__":
    main()
