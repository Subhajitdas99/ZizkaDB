#!/usr/bin/env python3
"""Generate README hero, gallery, and terminal GIF assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
BRAND = (249, 115, 22)
BRAND_DARK = (234, 88, 12)
BG_DARK = (15, 15, 18)
BG_CARD = (24, 24, 28)
BG_TERM = (30, 30, 46)
TEXT = (237, 237, 245)
MUTED = (161, 161, 170)
GREEN = (74, 222, 128)
FONT_PATHS = [
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/SFNSMono.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_PATHS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, xy, radius: int, fill):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_nav(draw: ImageDraw.ImageDraw, w: int, title: str):
    rounded_rect(draw, (0, 0, w, 52), 0, (18, 18, 22))
    draw.rectangle((0, 48, w, 52), fill=(40, 40, 48))
    draw.rounded_rectangle((24, 14, 44, 38), radius=8, fill=BRAND)
    draw.text((52, 16), "ZizkaDB", fill=TEXT, font=font(18, True))
    for i, label in enumerate(["Docs", "Community", "API Explorer"]):
        draw.text((w - 280 + i * 88, 20), label, fill=MUTED, font=font(12))


def dashboard_mock(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h), BG_DARK)
    draw = ImageDraw.Draw(img)
    draw_nav(draw, w, "Dashboard")

    rounded_rect(draw, (24, 68, w - 24, h - 24), 14, BG_CARD)
    draw.text((44, 88), "Your agents", fill=TEXT, font=font(22, True))
    draw.text((44, 118), "Fleet overview · live from log()", fill=MUTED, font=font(13))

    rows = [
        ("support-bot", "2m ago", "1,284 events", True),
        ("billing-agent", "14m ago", "892 events", False),
        ("onboarding-flow", "1h ago", "441 events", False),
    ]
    y = 150
    for name, ago, events, highlight in rows:
        fill = (32, 32, 38) if not highlight else (40, 28, 18)
        border = BRAND if highlight else (48, 48, 56)
        rounded_rect(draw, (44, y, w - 44, y + 72), 10, fill)
        draw.rectangle((44, y, 48, y + 72), fill=border)
        draw.text((64, y + 16), name, fill=TEXT, font=font(16, True))
        draw.text((64, y + 42), f"Last seen {ago} · {events}", fill=MUTED, font=font(12))
        if highlight:
            draw.text((w - 120, y + 26), "● live", fill=BRAND, font=font(12, True))
        y += 86

    draw.text((44, h - 52), "db.zizka.ai/dashboard", fill=MUTED, font=font(11))
    return img


def why_terminal_frame(progress: float) -> Image.Image:
    w, h = 960, 420
    img = Image.new("RGB", (w, h), BG_TERM)
    draw = ImageDraw.Draw(img)
    rounded_rect(draw, (0, 0, w, 40), 0, (22, 22, 35))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((16 + i * 22, 14, 28 + i * 22, 26), fill=c)
    draw.text((w // 2 - 80, 12), "Terminal — demo-why.py", fill=MUTED, font=font(12))

    lines = [
        ("$ python scripts/demo-why.py", True),
        ("", False),
        ("→ ZizkaDB @ http://localhost:8000", False),
        ("", False),
        ("Logged chain. Walking back with db.why():", False),
        ("", False),
        ("user_message: {'text': 'Why was my order delayed?'}", False),
        ("    └── llm_response: {'model': 'gpt-4o', 'tokens': 412}", progress > 0.35),
        ("        └── tool_call: {'tool': 'lookup_order', 'order_id': 'ORD-8842'}", progress > 0.7),
        ("", False),
        ("✓ Done", progress > 0.9),
    ]

    y = 56
    fmono = font(15)
    for text, show in lines:
        if not text:
            y += 10
            continue
        if not show and text.startswith(("    ", "✓")):
            continue
        color = GREEN if text.startswith("✓") else TEXT
        if "why()" in text:
            color = (250, 204, 21)
        if text.startswith("$"):
            color = (166, 227, 161)
        draw.text((28, y), text, fill=color, font=fmono)
        y += 26
    return img


def mcp_mock() -> Image.Image:
    w, h = 480, 320
    img = Image.new("RGB", (w, h), BG_TERM)
    draw = ImageDraw.Draw(img)
    rounded_rect(draw, (12, 12, w - 12, h - 12), 10, (22, 22, 32))
    draw.text((24, 24), "Cursor MCP", fill=TEXT, font=font(16, True))
    snippet = '''{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_..."
      }
    }
  }
}'''
    y = 56
    for line in snippet.split("\n"):
        c = BRAND if "zizkadb" in line else MUTED if "{" in line or "}" in line else TEXT
        draw.text((24, y), line, fill=c, font=font(12))
        y += 18
    return img


def homepage_strip() -> Image.Image:
    w, h = 480, 320
    img = Image.new("RGB", (w, h), (10, 10, 12))
    draw = ImageDraw.Draw(img)
    draw.text((24, 24), "Operational DB", fill=MUTED, font=font(11))
    draw.text((24, 48), "for AI agents", fill=TEXT, font=font(26, True))
    draw.text((24, 88), "Causal lineage · time-travel · semantic search", fill=MUTED, font=font(12))
    rounded_rect(draw, (24, 120, 200, 156), 8, BRAND)
    draw.text((44, 132), "Start free →", fill=(255, 255, 255), font=font(13, True))
    rounded_rect(draw, (24, 180, w - 24, h - 24), 10, (20, 20, 24))
    draw.text((40, 200), "log() → why() → at() → search()", fill=BRAND, font=font(14, True))
    for i, label in enumerate(["Managed", "MCP", "Self-host"]):
        x = 40 + i * 130
        rounded_rect(draw, (x, 240, x + 110, 280), 8, (28, 28, 34))
        draw.text((x + 14, 256), label, fill=TEXT, font=font(12))
    return img


def save_gif(frames: list[Image.Image], path: Path, duration_ms: int = 400):
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        optimize=True,
    )


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)

    og_src = Path("/tmp/zizka-og.png")
    if og_src.exists():
        og = Image.open(og_src).convert("RGB")
        og.resize((1200, 500), Image.Resampling.LANCZOS).save(ASSETS / "hero-live.png", quality=92)

    dashboard_mock((1200, 520)).save(ASSETS / "hero-dashboard.png", quality=92)
    dashboard_mock((480, 340)).save(ASSETS / "gallery-dashboard.png", quality=90)
    homepage_strip().save(ASSETS / "gallery-homepage.png", quality=90)
    mcp_mock().save(ASSETS / "gallery-mcp.png", quality=90)

    term = why_terminal_frame(1.0)
    term.save(ASSETS / "gallery-why.png", quality=90)

    frames = [why_terminal_frame(p) for p in [0.0, 0.2, 0.45, 0.7, 1.0, 1.0]]
    save_gif(frames, ASSETS / "why-demo.gif", 550)
    why_terminal_frame(1.0).resize((960, 360), Image.Resampling.LANCZOS).save(
        ASSETS / "why-demo.png", quality=90
    )

    print("Generated assets in", ASSETS)


if __name__ == "__main__":
    main()
