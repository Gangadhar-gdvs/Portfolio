"""
Builds the animated SVG artwork for the README (docs/readme/*.svg).

    pip install fonttools uharfbuzz
    python3 scripts/readme/make_svgs.py

Every word is set as vector paths from the site's own fonts (Geist, Geist Mono
and Instrument Serif), shaped with HarfBuzz so the kerning matches the browser.
GitHub shows README SVGs as images, where web fonts can't load. The stack is
drawn with the same view as the site's 3D camera, and every animation is SMIL,
which runs inside <img> in every modern browser.
"""

import io
import math
import random
from html import escape
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "readme"
FONTS = ROOT / "src" / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

W = 1280
PAD = 64

C = {
    "night": "#030509",
    "night1": "#070B12",
    "night2": "#0C121C",
    "fg": "#EEF2F7",
    "fg2": "#A7B0BD",
    "fg3": "#7D8694",
    "glow": "#7CE7FF",
    "warm": "#FFB86B",
    "line": "#161E29",
    "line2": "#232C38",
    "etch": "#DFE9F5",
    "edge": "#9FDCFF",
}

EASE = "0.45 0 0.25 1"


def fmt(v: float) -> str:
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


# ── Type ─────────────────────────────────────────────────────────────────────


class Face:
    """Shapes a line of text with HarfBuzz and returns it as one SVG path."""

    def __init__(self, file: str):
        font = TTFont(FONTS / file)
        font.flavor = None  # WOFF in, plain sfnt out, which HarfBuzz can read
        data = io.BytesIO()
        font.save(data)
        raw = data.getvalue()
        self.font = TTFont(io.BytesIO(raw))
        self.glyphs = self.font.getGlyphSet()
        self.upm = self.font["head"].unitsPerEm
        self.hb = hb.Font(hb.Face(hb.Blob(raw)))

    def shape(self, text: str):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": True})
        return [
            (self.font.getGlyphName(info.codepoint), pos.x_advance, pos.x_offset, pos.y_offset)
            for info, pos in zip(buf.glyph_infos, buf.glyph_positions)
        ]

    def width(self, text: str, size: float, tracking: float = 0.0) -> float:
        glyphs = self.shape(text)
        return sum(g[1] for g in glyphs) * size / self.upm + tracking * size * max(0, len(glyphs) - 1)

    def path(self, text: str, x: float, baseline: float, size: float, tracking: float = 0.0) -> str:
        pen = SVGPathPen(self.glyphs, ntos=fmt)
        scale = size / self.upm
        cursor = x
        for name, advance, dx, dy in self.shape(text):
            self.glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor + dx * scale, baseline - dy * scale)))
            cursor += advance * scale + tracking * size
        return pen.getCommands()


SANS = Face("Geist-Medium.woff")
SANS_REGULAR = Face("Geist-Regular.woff")
MONO = Face("GeistMono-Regular.woff")
SERIF = Face("InstrumentSerif-Italic.woff")


def words(face: Face, text: str, x: float, baseline: float, size: float, fill: str,
          tracking: float = 0.0, anchor: str = "start", opacity: float = 1.0, attrs: str = "") -> str:
    width = face.width(text, size, tracking)
    if anchor == "end":
        x -= width
    elif anchor == "middle":
        x -= width / 2
    op = f' fill-opacity="{opacity}"' if opacity != 1 else ""
    return f'<path d="{face.path(text, x, baseline, size, tracking)}" fill="{fill}"{op}{attrs}/>'


def label(text: str, x: float, baseline: float, fill: str = C["fg3"], size: float = 13,
          anchor: str = "start", opacity: float = 1.0, attrs: str = "") -> str:
    """Small uppercase mono, like the site's labels."""
    return words(MONO, text.upper(), x, baseline, size, fill, 0.08, anchor, opacity, attrs)


def svg(width: int, height: int, title: str, body: str, defs: str = "") -> str:
    title = escape(title)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" role="img" aria-label="{title}">'
        f"<title>{title}</title><defs>{defs}</defs>{body}</svg>"
    )


def card(width: int, height: int, uid: str, glow_at: str = "72% 45%") -> tuple[str, str]:
    cx, cy = glow_at.split()
    defs = (
        f'<clipPath id="{uid}-clip"><rect width="{width}" height="{height}" rx="22"/></clipPath>'
        f'<radialGradient id="{uid}-bg" cx="{cx}" cy="{cy}" r="75%">'
        f'<stop offset="0" stop-color="#0B1626"/><stop offset=".55" stop-color="{C["night1"]}"/>'
        f'<stop offset="1" stop-color="{C["night"]}"/></radialGradient>'
    )
    body = (
        f'<rect width="{width}" height="{height}" rx="22" fill="url(#{uid}-bg)"/>'
        f'<rect x=".5" y=".5" width="{width - 1}" height="{height - 1}" rx="21.5" fill="none" stroke="{C["line2"]}"/>'
    )
    return defs, body


def keyframes(attr: str, frames: list[tuple[float, str]], dur: float, extra: str = "") -> str:
    times = ";".join(f"{t / dur:.4f}" for t, _ in frames)
    values = ";".join(v for _, v in frames)
    splines = ";".join([EASE] * (len(frames) - 1))
    return (
        f'<animate attributeName="{attr}" dur="{dur}s" repeatCount="indefinite" calcMode="spline" '
        f'keyTimes="{times}" values="{values}" keySplines="{splines}"{extra}/>'
    )


def move(frames: list[tuple[float, str]], dur: float) -> str:
    """Looping translate through keyframes of 'x y'."""
    times = ";".join(f"{t / dur:.4f}" for t, _ in frames)
    values = ";".join(v for _, v in frames)
    splines = ";".join([EASE] * (len(frames) - 1))
    return (
        f'<animateTransform attributeName="transform" type="translate" dur="{dur}s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="{times}" values="{values}" keySplines="{splines}" additive="sum"/>'
    )


def twinkle(dur: float, begin: float, low: float = 0.3) -> str:
    return (
        f'<animate attributeName="opacity" values="1;{low};1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1"/>'
    )


def hairline(uid: str, x0: float, x1: float, y: float, draw: bool = True, dur: float = 4.2) -> tuple[str, str]:
    """A 1px rule that draws in from the left, with a light running along it."""
    defs = (
        f'<linearGradient id="{uid}-run" x1="0" x2="1"><stop offset="0" stop-color="{C["glow"]}" stop-opacity="0"/>'
        f'<stop offset=".7" stop-color="{C["glow"]}"/><stop offset="1" stop-color="{C["glow"]}" stop-opacity="0"/></linearGradient>'
        f'<clipPath id="{uid}-rc"><rect x="{x0}" y="{y - 3}" width="{x1 - x0}" height="6"/></clipPath>'
    )
    # Static viewers show the finished rule; animating ones grow it from nothing.
    grow = (
        f'<animate attributeName="width" values="0;0;{x1 - x0}" keyTimes="0;.12;1" dur="1.8s" fill="freeze" '
        f'calcMode="spline" keySplines="0 0 1 1;0.16 1 0.3 1"/>'
        if draw else ""
    )
    body = (
        f'<rect x="{x0}" y="{y - 0.5}" width="{x1 - x0}" height="1" fill="{C["line2"]}">{grow}</rect>'
        f'<g clip-path="url(#{uid}-rc)"><rect x="{x0 - 160}" y="{y - 1}" width="160" height="2" rx="1" fill="url(#{uid}-run)">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;{x1 - x0 + 160} 0" '
        f'dur="{dur}s" begin="1.2s" repeatCount="indefinite"/></rect></g>'
    )
    return defs, body


# ── The stack ────────────────────────────────────────────────────────────────
# The same view as the site: the camera turned 35° around the stack and
# looking down at 27°. Orthographic here, so every plate is an affine image of
# a square and its etching can be drawn flat, then mapped onto it.

YAW = math.radians(-35)
ELEV = math.radians(27)
HALF = 1.1
THICK = 0.07
PITCH_CLOSED = THICK + 0.05
PITCH_OPEN = THICK + 0.64
LAYERS = [
    ("interface", "Interface", "Frontend Engineering", "React · Next.js · TypeScript · Three.js"),
    ("devices", "Devices", "Mobile & Desktop Apps", "Flutter · Tauri · Rust · Capacitor"),
    # AETHRA: ("services", "Services", "Backend & Real-time Systems", "Node.js · NestJS · Bun · WebSockets"),
    ("services", "Services", "Backend & Real-time Systems", "Node.js · NestJS · Express · Firebase"),
    ("data", "Data", "Data & Storage", "PostgreSQL · MongoDB · SQLite · Redis"),
    # AETHRA: ("intelligence", "Intelligence", "AI Agents & LLM Systems", "Gemini · Ollama · RAG · Python"),
    ("intelligence", "Intelligence", "AI & Machine Learning", "Python · scikit-learn · pandas · Flask"),
]


def project(x: float, y: float, z: float, k: float) -> tuple[float, float]:
    x1 = x * math.cos(YAW) + z * math.sin(YAW)
    z1 = -x * math.sin(YAW) + z * math.cos(YAW)
    return k * x1, -k * y * math.cos(ELEV) + k * z1 * math.sin(ELEV)


def plate_matrix(k: float) -> str:
    """Maps the 1000 × 1000 drawing of a plate onto its top face."""
    ax, ay = project(-HALF, 0, -HALF, k)
    bx, by = project(HALF, 0, -HALF, k)
    dx, dy = project(-HALF, 0, HALF, k)
    return f"matrix({(bx - ax) / 1000:.5f} {(by - ay) / 1000:.5f} {(dx - ax) / 1000:.5f} {(dy - ay) / 1000:.5f} {ax:.2f} {ay:.2f})"


def lift(pitch: float, k: float) -> float:
    return pitch * math.cos(ELEV) * k


NS = ' vector-effect="non-scaling-stroke"'


def s_line(d: str, color: str = C["etch"], opacity: float = 0.55, width: float = 1, dash: str = "") -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="{d}" fill="none" stroke="{color}" stroke-opacity="{opacity}" stroke-width="{width}" '
        f'stroke-linecap="round" stroke-linejoin="round"{dash_attr}{NS}/>'
    )


def s_rect(x, y, w, h, r, color=C["etch"], opacity=0.55, width=1, fill: str = "", fill_opacity: float = 0) -> str:
    fill_attr = f'fill="{fill}" fill-opacity="{fill_opacity}"' if fill else 'fill="none"'
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" {fill_attr} stroke="{color}" '
        f'stroke-opacity="{opacity}" stroke-width="{width}"{NS}/>'
    )


def f_rect(x, y, w, h, r, color=C["etch"], opacity=0.8) -> str:
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{color}" fill-opacity="{opacity}"/>'


def f_circle(x, y, r, color=C["etch"], opacity=0.8) -> str:
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" fill-opacity="{opacity}"/>'


def s_circle(x, y, r, color=C["etch"], opacity=0.55, width=1, dash: str = "") -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{color}" stroke-opacity="{opacity}" '
        f'stroke-width="{width}"{dash_attr}{NS}/>'
    )


def etch_interface() -> str:
    g = s_rect(110, 110, 780, 700, 20, opacity=0.8, width=1.2)
    g += s_line("M110 164H890", opacity=0.4)
    g += "".join(f_circle(x, 137, 7, opacity=0.6) for x in (142, 166, 190))
    g += s_rect(330, 123, 340, 28, 14, opacity=0.4)
    g += f_rect(144, 190, 26, 26, 7, C["glow"], 0.9)
    g += f_rect(144, 258, 326, 18, 9, opacity=0.85) + f_rect(144, 290, 260, 18, 9, opacity=0.85)
    g += "".join(s_line(f"M144 {y}H{end}", opacity=0.35) for y, end in ((342, 480), (364, 452), (386, 396)))
    g += f_rect(144, 414, 124, 40, 20, C["glow"], 0.85) + s_rect(282, 414, 112, 40, 20, opacity=0.5)
    g += s_rect(540, 244, 316, 212, 14, opacity=0.65)
    g += s_line("M560 404L600 386L640 392L680 356L720 364L760 322L800 330L836 290", C["glow"], 0.9, 1.4)
    g += '<path d="M560 436L560 404L600 386L640 392L680 356L720 364L760 322L800 330L836 290L836 436Z" fill="#7CE7FF" fill-opacity=".12"/>'
    for i, x in enumerate((144, 386, 628)):
        hovered = i == 1
        g += s_rect(x, 496, 228, 272, 14, C["glow"] if hovered else C["etch"], 0.9 if hovered else 0.5)
        g += f_rect(x + 12, 508, 204, 112, 8, opacity=0.08)
        g += f_rect(x + 16, 646, 134, 8, 4, opacity=0.7)
        g += s_line(f"M{x + 16} 676H{x + 200}M{x + 16} 696H{x + 168}", opacity=0.3)
    g += '<path d="M560 700v38l10-9 8 17 7-3-8-17h13z" fill="#7CE7FF"/>'
    return g


def etch_devices() -> str:
    g = s_rect(96, 120, 540, 340, 16, opacity=0.8, width=1.2) + s_rect(114, 138, 504, 304, 6, opacity=0.25)
    g += s_line("M196 138V442", opacity=0.2)
    for i, h in enumerate((120, 170, 140, 210, 190, 250)):
        x = 232 + i * 60
        g += s_rect(x, 420 - h, 34, h, 4, C["glow"] if i == 5 else C["etch"], 0.9 if i == 5 else 0.45)
    g += s_line("M62 472H670L640 500H92Z", opacity=0.75)
    g += s_rect(704, 120, 204, 412, 30, opacity=0.8, width=1.2) + f_rect(774, 136, 64, 16, 8, opacity=0.5)
    for row in range(4):
        for col in range(3):
            lit = row == 1 and col == 2
            g += s_rect(730 + col * 56, 178 + row * 62, 40, 40, 11, C["glow"] if lit else C["etch"], 0.9 if lit else 0.4)
            if lit:
                g += f_rect(730 + col * 56, 178 + row * 62, 40, 40, 11, C["glow"], 0.35)
    g += s_rect(96, 560, 560, 330, 14, opacity=0.7)
    g += s_line("M96 598H656", opacity=0.35)
    for i, length in enumerate((300, 420, 260, 380, 210)):
        y = 640 + i * 42
        g += s_line(f"M124 {y - 6}l8 6-8 6", C["glow"], 0.9) + s_line(f"M150 {y}H{150 + length}", opacity=0.4)
    g += s_rect(704, 580, 204, 310, 20, opacity=0.7)
    for i in range(4):
        x, y = 722 + (i % 2) * 88, 604 + (i // 2) * 110
        speaking = i == 0
        g += s_rect(x, y, 80, 100, 8, C["glow"] if speaking else C["etch"], 0.85 if speaking else 0.35)
        g += s_circle(x + 40, y + 42, 16, C["glow"] if speaking else C["etch"], 0.85 if speaking else 0.45)
    g += s_line("M636 300H704M656 740H704", C["glow"], 0.8, 1, "8 10")
    return g


def etch_services() -> str:
    hub = (500, 490)
    nodes = [(200, 200), (500, 180), (800, 200), (170, 490), (830, 490), (200, 780), (500, 800), (800, 780)]
    g = s_circle(*hub, 420, opacity=0.14, dash="3 9")
    for x, y in nodes:
        if x == hub[0]:
            d = f"M{hub[0]} {hub[1] + (74 if y > hub[1] else -74)}V{y + (-36 if y > hub[1] else 36)}"
        elif y == hub[1]:
            d = f"M{hub[0] + (74 if x > hub[0] else -74)} {hub[1]}H{x + (-50 if x > hub[0] else 50)}"
        else:
            d = f"M{hub[0] + (74 if x > hub[0] else -74)} {hub[1]}H{x}V{y + (-36 if y > hub[1] else 36)}"
        g += s_line(d, opacity=0.3)
    for i, (x, y) in enumerate(nodes):
        g += s_rect(x - 50, y - 36, 100, 72, 12, opacity=0.75)
        g += f_rect(x - 30, y - 9, 52, 6, 3, opacity=0.55) + f_rect(x - 30, y + 9, 34, 5, 2.5, opacity=0.3)
        g += f_circle(x + 32, y - 18, 5, C["glow"], 0.9)
    g += '<circle cx="500" cy="490" r="150" fill="url(#hub-glow)"/>'
    g += s_circle(*hub, 74, opacity=0.9, width=1.2) + s_circle(*hub, 50, C["glow"], 0.9, 1.2)
    g += f_circle(*hub, 50, C["glow"], 0.25) + f_circle(*hub, 14, C["glow"], 0.95)
    return g


def etch_data() -> str:
    rng = random.Random(53)
    g = f_rect(96, 120, 480, 42, 8, opacity=0.1) + s_rect(96, 120, 480, 42, 8, opacity=0.45)
    for row in range(10):
        y = 162 + row * 42
        g += s_line(f"M96 {y + 42}H576", opacity=0.18)
        if row == 4:
            g += f_rect(96, y + 2, 480, 38, 4, C["glow"], 0.16)
        for start, end in ((110, 164), (190, 324), (350, 444), (470, 562)):
            length = (end - start) * (0.45 + rng.random() * 0.55)
            g += f_rect(start, y + 18, length, 5, 2.5, C["glow"] if row == 4 else C["etch"], 0.85 if row == 4 else 0.3)
    for i, cx in enumerate((690, 836)):
        color, op = (C["glow"], 0.9) if i == 0 else (C["etch"], 0.7)
        g += (
            f'<ellipse cx="{cx}" cy="136" rx="58" ry="17" fill="none" stroke="{color}" stroke-opacity="{op}"{NS}/>'
            + s_line(f"M{cx - 58} 136V300A58 17 0 0 0 {cx + 58} 300V136", color, op)
            + s_line(f"M{cx - 58} 190A58 17 0 0 0 {cx + 58} 190M{cx - 58} 245A58 17 0 0 0 {cx + 58} 245", opacity=0.35)
        )
    query = (764, 500)
    g += s_rect(620, 376, 290, 250, 12, opacity=0.18)
    for _ in range(46):
        x, y = 636 + rng.random() * 258, 392 + rng.random() * 218
        near = math.hypot(x - query[0], y - query[1]) < 76
        g += f_circle(round(x), round(y), 5 if near else 3.5, C["glow"] if near else C["etch"], 0.9 if near else 0.45)
    g += s_circle(*query, 76, C["glow"], 0.6, dash="6 8") + f_circle(*query, 8, C["glow"], 1)
    for i in range(18):
        x = 104 + i * 45
        h = 50 + rng.random() * 110 + i * 3
        last = i == 17
        g += f_rect(x, round(890 - h), 28, round(h), 3, C["glow"] if last else C["etch"], 0.75 if last else 0.12)
        g += s_rect(x, round(890 - h), 28, round(h), 3, C["glow"] if last else C["etch"], 0.9 if last else 0.4)
    return g


def etch_intelligence() -> str:
    rng = random.Random(67)
    cx, cy = 500, 480
    g = '<circle cx="500" cy="480" r="240" fill="url(#core-glow)"/>'
    g += f_circle(cx, cy, 44, C["glow"], 1) + s_circle(cx, cy, 64, C["glow"], 0.95, 1.2)
    g += s_circle(cx, cy, 110, opacity=0.85, width=1.2) + s_circle(cx, cy, 160, opacity=0.4, dash="6 10")
    g += s_circle(cx, cy, 230, opacity=0.28) + s_circle(cx, cy, 330, opacity=0.16)
    ticks = ""
    for deg in range(0, 360, 6):
        a = math.radians(deg)
        inner = 376 if deg % 30 == 0 else 386
        ticks += f"M{fmt(cx + math.cos(a) * inner)} {fmt(cy + math.sin(a) * inner)}L{fmt(cx + math.cos(a) * 398)} {fmt(cy + math.sin(a) * 398)}"
    g += s_line(ticks, opacity=0.28)
    spokes = ""
    ends = []
    for i in range(22):
        a = rng.random() * math.pi * 2
        reach = 250 + rng.random() * 80
        x, y = cx + math.cos(a) * reach, cy + math.sin(a) * reach
        spokes += f"M{fmt(cx + math.cos(a) * 110)} {fmt(cy + math.sin(a) * 110)}L{fmt(x)} {fmt(y)}"
        ends.append((x, y, i % 4 == 0))
    g += s_line(spokes, opacity=0.22)
    for x, y, firing in ends:
        g += f_circle(round(x), round(y), 6, C["glow"] if firing else C["etch"], 0.95 if firing else 0.6)
    for i in range(5):
        a = i / 5 * math.pi * 2 + 0.4
        g += f_circle(round(cx + math.cos(a) * 230), round(cy + math.sin(a) * 230), 9, C["glow"], 0.95)
    g += s_line(f"M{fmt(cx + 272 * math.cos(-0.35))} {fmt(cy + 272 * math.sin(-0.35))}A272 272 0 0 1 {fmt(cx + 272 * math.cos(0.7))} {fmt(cy + 272 * math.sin(0.7))}", C["glow"], 0.75, 2.4)
    return g


ETCH = {
    "interface": etch_interface,
    "devices": etch_devices,
    "services": etch_services,
    "data": etch_data,
    "intelligence": etch_intelligence,
}


def stack_defs(uid: str) -> str:
    return (
        f'<linearGradient id="{uid}-face" x1="0" y1="0" x2="0.35" y2="1">'
        f'<stop offset="0" stop-color="#15212F"/><stop offset=".55" stop-color="#0B121C"/><stop offset="1" stop-color="#070B12"/></linearGradient>'
        f'<radialGradient id="hub-glow"><stop offset="0" stop-color="#7CE7FF" stop-opacity=".35"/><stop offset="1" stop-color="#7CE7FF" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="core-glow"><stop offset="0" stop-color="#7CE7FF" stop-opacity=".75"/><stop offset=".35" stop-color="#7CE7FF" stop-opacity=".25"/><stop offset="1" stop-color="#7CE7FF" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="{uid}-pool"><stop offset="0" stop-color="#1D3B5C" stop-opacity=".9"/><stop offset="1" stop-color="#1D3B5C" stop-opacity="0"/></radialGradient>'
    )


def plate(uid: str, index: int, k: float, etch_opacity: float = 1.0, etch_anim: str = "", edge_anim: str = "") -> str:
    """One glass plate: a darker copy below for its edge, then the lit top face and its etching."""
    layer_id, short, _, _ = LAYERS[index]
    matrix = plate_matrix(k)
    t = lift(THICK, k)
    name = f"{index + 1:02d}  {short.upper()}"
    etched_label = (
        f'<path d="{MONO.path(name, 84, 952, 22, 0.08)}" fill="{C["etch"]}" fill-opacity=".6"/>'
        f'<path d="{MONO.path(f"L{index + 1} / 05", 916 - MONO.width(f"L{index + 1} / 05", 22, 0.08), 952, 22, 0.08)}" fill="{C["etch"]}" fill-opacity=".35"/>'
    )
    return (
        f'<g transform="translate(0 {fmt(t)})"><g transform="{matrix}">'
        f'<rect x="0" y="0" width="1000" height="1000" rx="55" fill="#0A111B" stroke="{C["edge"]}" stroke-opacity=".75" stroke-width="1.2"{NS}/></g></g>'
        f'<g transform="{matrix}">'
        f'<rect x="0" y="0" width="1000" height="1000" rx="55" fill="url(#{uid}-face)" fill-opacity=".97" stroke="{C["edge"]}" stroke-opacity=".5" stroke-width="1"{NS}>{edge_anim}</rect>'
        f'<g opacity="{etch_opacity}">{etch_anim}{ETCH[layer_id]()}{etched_label}</g>'
        f"</g>"
    )


def stack_art(uid: str, cx: float, cy: float, k: float, dur: float, timeline: list[tuple[float, float]],
              labels: bool = True, focus: list[tuple[float, float]] | None = None) -> str:
    """
    The five plates at (cx, cy). `timeline` is (seconds, open amount 0..1);
    `focus` gives each plate a window in seconds when it slides out and lights up.
    """
    widest = max(amount for _, amount in timeline)
    pitch = PITCH_CLOSED + (PITCH_OPEN - PITCH_CLOSED) * widest
    out = [
        f'<ellipse cx="{cx}" cy="{fmt(cy + lift(pitch, k) * 2 + k * 1.05)}" rx="{fmt(k * 2.1)}" ry="{fmt(k * 0.5)}" fill="url(#{uid}-pool)"/>'
    ]
    bx, by = project(HALF, 0, -HALF, k)
    # Bottom plate first, so upper plates cover lower ones.
    for index in reversed(range(len(LAYERS))):
        offset = 2 - index

        def y_at(amount: float) -> float:
            pitch = PITCH_CLOSED + (PITCH_OPEN - PITCH_CLOSED) * amount
            return -lift(pitch, k) * offset

        # Rest at the timeline's first state, so viewers that don't animate
        # still show a proper stack; the animation adds the difference.
        base = y_at(timeline[0][1])
        frames = [(t, f"0 {fmt(y_at(a) - base)}") for t, a in timeline]
        anim = move(frames, dur)
        slide = ""
        etch_anim = ""
        edge_anim = ""
        if focus:
            start, end = focus[index]
            out_to = f"{fmt(-k * 0.34)} {fmt(k * 0.08)}"
            slide = move([(0, "0 0"), (start, "0 0"), (start + 0.5, out_to), (end, out_to), (end + 0.5, "0 0"), (dur, "0 0")], dur)
            lit = [(0, ".6"), (start, ".6"), (start + 0.5, "1"), (end, "1"), (end + 0.5, ".6"), (dur, ".6")]
            etch_anim = keyframes("opacity", lit, dur)
            edge_anim = keyframes("stroke-opacity", [(t, "1" if v == "1" else ".5") for t, v in lit], dur)
        label_svg = ""
        if labels:
            lx, ly = bx + 22, by
            name = f"{index + 1:02d}  {LAYERS[index][1].upper()}"
            appear = keyframes("opacity", [(t, fmt(max(0.0, (a - 0.55) / 0.45))) for t, a in timeline], dur)
            label_svg = (
                f'<g opacity="0">{appear}'
                f'<rect x="{fmt(lx)}" y="{fmt(ly - 0.5)}" width="26" height="1" fill="{C["fg3"]}"/>'
                + label(name, lx + 36, ly + 4.5, C["fg2"], 12)
                + "</g>"
            )
        body = plate(uid, index, k, 0.6 if focus else 1.0, etch_anim, edge_anim)
        out.append(
            f'<g transform="translate({fmt(cx)} {fmt(cy + base)})">{anim}'
            f'<g>{slide}{body}</g>{label_svg}</g>'
        )
    return "".join(out)


def dust(uid: str, x0: float, y0: float, x1: float, y1: float, count: int, seed: int) -> str:
    rng = random.Random(seed)
    groups = [[], [], []]
    for _ in range(count):
        groups[rng.randrange(3)].append((rng.uniform(x0, x1), rng.uniform(y0, y1)))
    out = ""
    for i, pts in enumerate(groups):
        d = "".join(f"M{fmt(x)} {fmt(y)}h0" for x, y in pts)
        out += (
            f'<path d="{d}" stroke="#CFE6FF" stroke-width="{1.6 + i * 0.4}" stroke-linecap="round" opacity="{0.35 + i * 0.12}">'
            f"{twinkle(3 + i * 1.3, i * 0.9)}</path>"
        )
    return out


def mark(x: float, y: float, size: float = 18) -> str:
    s = size / 20
    return (
        f'<g transform="translate({x} {y}) scale({s})">'
        f'<path d="M10 2 18 6.2 10 10.4 2 6.2Z" fill="{C["fg"]}"/>'
        f'<path d="M2 9.8 10 14l8-4.2" fill="none" stroke="{C["glow"]}" stroke-width="1.4" stroke-linejoin="round"/>'
        f'<path d="M2 13.4 10 17.6l8-4.2" fill="none" stroke="{C["glow"]}" stroke-width="1.4" stroke-linejoin="round" opacity=".55"/></g>'
    )


def live_dot(x: float, y: float) -> str:
    return (
        f'<circle cx="{x}" cy="{y}" r="4" fill="{C["warm"]}"/>'
        f'<circle cx="{x}" cy="{y}" r="4" fill="none" stroke="{C["warm"]}" stroke-width="1.5">'
        f'<animate attributeName="r" values="4;11" dur="2.4s" repeatCount="indefinite"/>'
        f'<animate attributeName="stroke-opacity" values=".7;0" dur="2.4s" repeatCount="indefinite"/></circle>'
    )


# ── Artwork ──────────────────────────────────────────────────────────────────


def hero() -> str:
    H = 640
    uid = "hero"
    card_defs, card_body = card(W, H, uid, "74% 42%")
    rule_defs, rule = hairline(f"{uid}-rule", PAD, W - PAD, 552)
    dur = 12.0
    timeline = [(0, 0), (1.6, 0), (3.2, 1), (8.6, 1), (10.2, 0), (dur, 0)]
    focus = [(3.4 + i * 1.0, 3.4 + i * 1.0 + 0.7) for i in range(5)]

    body = card_body
    body += f'<g clip-path="url(#{uid}-clip)">'
    body += dust(uid, 660, 40, 1240, 540, 70, 7)
    body += stack_art(uid, 862, 262, 108, dur, timeline, labels=True, focus=focus)

    # Top row
    body += mark(PAD, 50) + label("Gangadhara Gooti", PAD + 30, 64, C["fg"], 13)
    body += label("Portfolio · 2026", W - PAD, 64, C["fg3"], 13, "end")

    # Copy
    body += f'<rect x="{PAD}" y="171.5" width="30" height="1" fill="{C["fg3"]}"/>'
    body += label("Full-stack engineer", PAD + 44, 176, C["fg2"], 13)
    body += label("— Web · Mobile · Desktop · AI", PAD + 44 + MONO.width("FULL-STACK ENGINEER ", 13, 0.08), 176, C["fg3"], 13)
    body += words(SANS, "Gangadhara", PAD - 4, 290, 98, C["fg"], -0.045)
    body += words(SANS, "Gooti", PAD - 4, 382, 98, C["fg"], -0.045)
    body += words(SANS_REGULAR, "Building software that feels simple on the surface,", PAD, 446, 23, C["fg2"], -0.012)
    body += words(SERIF, "engineered deeply underneath.", PAD, 480, 27, C["fg"], -0.01)

    # Credits
    body += rule
    cols = [
        ("Based in", "Pulivendula, India", None),
        ("Status", "Available for full-time roles", "dot"),
        ("Lighthouse", "99 · 100 · 100 · 100", None),
        ("Stack", "Next.js 16 · three.js · GSAP", None),
    ]
    for i, (name, value, extra) in enumerate(cols):
        x = PAD + i * 290
        body += label(name, x, 584, C["fg3"], 12)
        vx = x
        if extra == "dot":
            body += live_dot(x + 4, 604)
            vx = x + 18
        body += words(SANS_REGULAR, value, vx, 609, 15, C["fg"], -0.004)

    # Curtain: the screen opens top and bottom, once. The bars rest off the card,
    # so viewers that don't animate show the page, not the curtain.
    half = H / 2 + 2
    opening = 'keyTimes="0;.45;1" dur="2s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;0.83 0 0.17 1"'
    body += (
        f'<rect x="0" y="0" width="{W}" height="{H / 2 + 1}" fill="#010203" transform="translate(0 -{half})">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -{half}" {opening}/></rect>'
        f'<rect x="0" y="{H / 2}" width="{W}" height="{H / 2}" fill="#010203" transform="translate(0 {half})">'
        f'<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 {half}" {opening}/></rect>'
        f'<rect x="0" y="{H / 2 - 0.5}" width="{W}" height="1" fill="url(#{uid}-slit)" opacity="0" transform-origin="{W / 2} {H / 2}">'
        f'<animateTransform attributeName="transform" type="scale" values="0 1;1 1;1 1" keyTimes="0;.45;1" dur="2s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1;0 0 1 1"/>'
        f'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.46;.66;1" dur="2s" fill="freeze"/></rect>'
    )
    body += "</g>"

    defs = (
        card_defs + rule_defs + stack_defs(uid)
        + f'<linearGradient id="{uid}-slit" x1="0" x2="1"><stop offset="0" stop-color="{C["glow"]}" stop-opacity="0"/>'
        f'<stop offset=".5" stop-color="{C["fg"]}"/><stop offset="1" stop-color="{C["glow"]}" stop-opacity="0"/></linearGradient>'
    )
    return svg(W, H, "Gangadhara Gooti, full-stack engineer for web, mobile, desktop and AI. Building software that feels simple on the surface, engineered deeply underneath. A stack of five glass layers opens up, and each layer slides out in turn: interface, devices, services, data and intelligence.", body, defs)


SECTIONS = [
    ("idea", "01", "Concept", "The idea", "The portfolio is the stack"),
    ("stack", "02", "Five layers", "The stack", "Surface to core"),
    ("screens", "03", "The real thing", "Screens", "Captured from the production build"),
    ("how", "04", "Under the hood", "How it works", "three.js · GSAP · Next.js 16"),
    ("built", "05", "Stack and scores", "Built with", "Lighthouse 99 · 100 · 100 · 100"),
    ("run", "06", "Local setup", "Run it", "localhost:5000"),
]


def section(key: str, index: str, eyebrow: str, title: str, note: str) -> str:
    """A dark title card per section, readable on GitHub's light and dark themes."""
    H = 136
    uid = f"s-{key}"
    card_defs, card_body = card(W, H, uid, "85% 0%")
    rule_defs, rule = hairline(uid, 40, W - 40, H - 1, draw=False, dur=5.2)
    body = card_body + f'<g clip-path="url(#{uid}-clip)">' + rule
    body += f'<rect x="40" y="40" width="7" height="7" fill="{C["glow"]}"/>'
    body += label(index, 60, 48, C["glow"], 13) + label(eyebrow, 60 + MONO.width(index + "  ", 13, 0.08), 48, C["fg3"], 13)
    body += label(note, W - 40, 48, C["fg3"], 13, "end")
    # Visible by default, so viewers that don't animate still show the title.
    body += '<g><animate attributeName="opacity" values="0;0;1" keyTimes="0;.18;1" dur="1.1s" fill="freeze"/>'
    body += (
        '<g><animateTransform attributeName="transform" type="translate" values="0 14;0 14;0 0" keyTimes="0;.15;1" '
        'dur="1.3s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;0.16 1 0.3 1"/>'
        + words(SANS, title, 38, 104, 46, C["fg"], -0.04)
        + "</g></g></g>"
    )
    return svg(W, H, f"{index} / {eyebrow}: {title}", body, card_defs + rule_defs)


def stack_layers() -> str:
    H = 640
    uid = "layers"
    card_defs, card_body = card(W, H, uid, "30% 50%")
    dur = 10.0
    timeline = [(0, 1), (dur, 1)]
    focus = [(0.4 + i * 1.9, 0.4 + i * 1.9 + 1.3) for i in range(5)]

    body = card_body + f'<g clip-path="url(#{uid}-clip)">'
    body += dust(uid, 60, 40, 640, 600, 50, 11)
    body += stack_art(uid, 360, 300, 104, dur, timeline, labels=False, focus=focus)

    x = 690
    body += label("Surface to core", x, 88, C["fg3"], 12)
    for i, (_, short, name, tools) in enumerate(LAYERS):
        y = 132 + i * 96
        start, end = focus[i]
        highlight = keyframes("opacity", [(0, "0"), (start, "0"), (start + 0.4, "1"), (end, "1"), (end + 0.5, "0"), (dur, "0")], dur)
        dim = keyframes("opacity", [(0, ".55"), (start, ".55"), (start + 0.4, "1"), (end, "1"), (end + 0.5, ".55"), (dur, ".55")], dur)
        body += f'<rect x="{x}" y="{y - 0.5}" width="{W - PAD - x}" height="1" fill="{C["line2"]}"/>'
        body += f'<rect x="{x}" y="{y - 1}" width="{W - PAD - x}" height="2" fill="{C["glow"]}" opacity="0">{highlight}</rect>'
        body += f'<g opacity=".55">{dim}'
        body += label(f"{i + 1:02d}", x, y + 32, C["glow"], 12) + label(short, x + 40, y + 32, C["fg3"], 12)
        body += words(SANS, name, x, y + 64, 24, C["fg"], -0.03)
        body += label(tools, W - PAD, y + 32, C["fg3"], 11, "end")
        body += "</g>"
    body += "</g>"
    return svg(
        W, H,
        "The stack, surface to core: 01 Interface, frontend engineering. 02 Devices, mobile and desktop apps. "
        "03 Services, backend and real-time systems. 04 Data and storage. 05 Intelligence, AI and machine learning. "
        "Each glass layer slides out in turn with its etching lit.",
        body, card_defs + stack_defs(uid),
    )


def divider() -> str:
    defs, body = hairline("divider", 0, W, 12, draw=False, dur=5.4)
    return svg(W, 24, "", body, defs)


def footer() -> str:
    H = 400
    uid = "footer"
    card_defs, card_body = card(W, H, uid, "78% 40%")
    dur = 9.0
    body = card_body + f'<g clip-path="url(#{uid}-clip)">'
    body += dust(uid, 760, 30, 1240, 380, 46, 5)
    body += (
        f'<g>{move([(0, "0 0"), (dur / 2, "0 -8"), (dur, "0 0")], dur)}'
        + stack_art(uid, 985, 190, 84, dur, [(0, 0.12), (dur, 0.12)], labels=False)
        + "</g>"
    )
    body += live_dot(PAD + 4, 91) + label("Available for full-time roles", PAD + 20, 95, C["fg2"], 13)
    together = SANS.width("Let’s work ", 76, -0.045)
    body += words(SANS, "Let’s work ", PAD - 3, 196, 76, C["fg"], -0.045)
    body += words(SERIF, "together.", PAD - 3 + together, 196, 84, C["fg"], -0.01)
    body += words(SANS_REGULAR, "Full-stack, mobile and AI roles on product teams. Email is the fastest way to reach me.", PAD, 246, 19, C["fg2"], -0.01)
    body += f'<rect x="{PAD}" y="296.5" width="{W - PAD * 2}" height="1" fill="{C["line2"]}"/>'
    body += label("gangadhargdvs0@gmail.com", PAD, 338, C["fg"], 14)
    body += label("linkedin.com/in/gangadhar-gooti", PAD + 360, 338, C["fg2"], 14)
    body += label("github.com/Gangadhar-gdvs", W - PAD, 338, C["fg2"], 14, "end")
    body += "</g>"
    return svg(W, H, "Let's work together. Available for full-time roles. Email gangadhargdvs0@gmail.com, LinkedIn gangadhar-gooti, GitHub Gangadhar-gdvs.", body, card_defs + stack_defs(uid))


def main() -> None:
    files = {"hero.svg": hero(), "stack-layers.svg": stack_layers(), "divider.svg": divider(), "footer.svg": footer()}
    for key, index, eyebrow, title, note in SECTIONS:
        files[f"section-{key}.svg"] = section(key, index, eyebrow, title, note)
    for name, content in files.items():
        (OUT / name).write_text(content, encoding="utf-8")
        print(f"{name:24} {len(content) / 1024:7.1f} KB")


if __name__ == "__main__":
    main()
