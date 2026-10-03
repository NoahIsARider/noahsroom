#!/usr/bin/env python3
"""Rebuild the site's favicon: the room's CRT, wrapped in a violet glow, its glass turned
into a green terminal.

Run from the repository root:

    python tools/make-favicon.py

Source art: assets/objects/crt.png (the monitor cut-out). The screen area is found from the
image itself — the dark glass inside the bezel — so the terminal paint follows the real shape
of the tube instead of a guessed rectangle.

Outputs (all in assets/):
    favicon.png           96×96, transparent, what the tab shows
    favicon-32.png        32×32, transparent, hard-coded small size
    apple-touch-icon.png 180×180, on a dark violet ground (iOS composites transparency badly)

Tuning knobs are the constants below.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "objects" / "crt.png"

# --- look -------------------------------------------------------------------
CANVAS = 192              # compose big, downscale at the end
PAD = 0.15                # share of the canvas kept clear for the glow
GLOW_TIGHT = (170, 100, 255)      # the light hugging the case
GLOW_TIGHT_BLUR = 0.018
GLOW_TIGHT_STRENGTH = 0.95
GLOW_WIDE = (104, 48, 216)        # the haze it throws into the room
GLOW_WIDE_BLUR = 0.085
GLOW_WIDE_STRENGTH = 0.6
RIM_COLOR = (176, 122, 255)
RIM_STRENGTH = 0.3        # low: the violet should come from behind, not repaint the plastic
TERMINAL_KEEP = 0.12      # how much of the original glass shows through the green
SCREEN_DARK = 105         # luminance below this counts as glass
SCREEN_WINDOW = (0.04, 0.82, 0.06, 0.74)   # x0, x1, y0, y1 (share of the monitor) — excludes the stand's shadow
INK = (76, 232, 138)
INK_BRIGHT = (198, 255, 112)
BASE_TOP = (5, 20, 11)
BASE_BOTTOM = (9, 37, 19)


def screen_mask(mon: Image.Image) -> Image.Image:
    """The glass of the tube: dark pixels inside the bezel, cleaned up and softened."""
    arr = np.asarray(mon).astype(np.float32)
    lum = arr[..., :3] @ np.array([0.299, 0.587, 0.114])
    dark = ((lum < SCREEN_DARK) & (arr[..., 3] > 200)).astype(np.uint8) * 255
    w, h = mon.size
    x0, x1, y0, y1 = SCREEN_WINDOW
    keep = np.zeros_like(dark)
    keep[int(h * y0):int(h * y1), int(w * x0):int(w * x1)] = 255
    mask = np.minimum(dark, keep)
    m = Image.fromarray(mask, "L").filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    m = m.filter(ImageFilter.MinFilter(3))            # keep off the bezel
    m = m.filter(ImageFilter.GaussianBlur(1.1)).point(lambda v: 255 if v > 110 else 0)
    return m.filter(ImageFilter.GaussianBlur(1.0))


def terminal(size, mask: Image.Image, rows: int, line: int) -> Image.Image:
    """A green terminal painted only where the glass is."""
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x0, x1, y0, y1 = SCREEN_WINDOW
    sx0, sx1, sy0, sy1 = int(w * x0), int(w * x1), int(h * y0), int(h * y1)
    bw, bh = sx1 - sx0, sy1 - sy0
    if bw < 6 or bh < 6:
        return layer
    draw.rectangle([sx0, sy0, sx1, sy1], fill=BASE_TOP)
    if line == 1:
        for row in range(sy0, sy1, 3):                # scanlines, only when there is room
            draw.line([(sx0, row), (sx1, row)], fill=(3, 14, 8, 255))
    step = max(2, bh // (rows + 1))
    rng = np.random.default_rng(7)                    # fixed seed: the icon should not jitter
    for i in range(rows):
        y = sy0 + int(step * (i + 0.6))
        if y + line > sy1:
            break
        indent = 0 if i < 2 else int(rng.integers(0, max(1, bw // 6)))
        length = int(bw * (0.55 if i == 1 else 0.18 + 0.3 * rng.random()))
        length = max(2 + line, min(length, bw - indent - 3))
        draw.rectangle([sx0 + 2 + indent, y, sx0 + 2 + indent + length, y + line - 1], fill=INK)
    # the last line is the prompt, with a cursor
    y = sy0 + int(step * (rows + 0.5))
    if y + 2 + line < sy1:
        draw.rectangle([sx0 + 2, y, sx0 + 2 + max(2, bw // 6), y + line - 1], fill=INK)
        cx = sx0 + 5 + max(2, bw // 6)
        draw.rectangle([cx, y - 1, cx + line + 1, y + line], fill=INK_BRIGHT)
    layer.putalpha(ImageChops.multiply(layer.split()[3], mask))
    # let a little of the real glass (scratches, reflections) survive
    colours = layer.split()[0:3] + (layer.split()[3].point(lambda v: int(v * (1 - TERMINAL_KEEP))),)
    return Image.merge("RGBA", colours)


def build(canvas: int = CANVAS, rows: int = 7, line: int = 1, glow: float = 1.0) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    inner = canvas - 2 * int(canvas * PAD)
    scale = min(inner / src.width, inner / src.height)
    mon = src.resize((max(1, int(src.width * scale)), max(1, int(src.height * scale))), Image.LANCZOS)

    mask = screen_mask(mon)
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    ox, oy = (canvas - mon.width) // 2, (canvas - mon.height) // 2
    body = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    body.alpha_composite(mon, (ox, oy))
    body = Image.alpha_composite(body, terminal(mon.size, mask, rows, line).transform(
        (canvas, canvas), Image.AFFINE, (1, 0, -ox, 0, 1, -oy)))

    # violet light: the case is backlit — a tight ring, then the haze it throws off,
    # weighted to the left so it reads as a light source rather than an even aura
    alpha = body.split()[3]
    left_bias = Image.new("L", (canvas, canvas))
    for x in range(canvas):
        left_bias.paste(int(255 * (1.0 - 0.72 * x / canvas)), (x, 0, x + 1, canvas))
    halo = Image.new("RGBA", (canvas, canvas), GLOW_WIDE + (255,))
    halo.putalpha(ImageChops.multiply(
        alpha.filter(ImageFilter.GaussianBlur(canvas * GLOW_WIDE_BLUR))
             .point(lambda v: int(min(255, v * GLOW_WIDE_STRENGTH * glow))),
        left_bias))
    out = Image.alpha_composite(out, halo)
    tight = Image.new("RGBA", (canvas, canvas), GLOW_TIGHT + (255,))
    tight.putalpha(alpha.filter(ImageFilter.GaussianBlur(canvas * GLOW_TIGHT_BLUR))
                        .point(lambda v: int(min(255, v * GLOW_TIGHT_STRENGTH * glow))))
    out = Image.alpha_composite(out, tight)
    out = Image.alpha_composite(out, body)

    # violet rim light, only where the backlight would catch an edge
    rim = ImageChops.subtract(alpha, alpha.filter(ImageFilter.MinFilter(3)))
    rim_layer = Image.new("RGBA", (canvas, canvas), RIM_COLOR + (255,))
    rim_layer.putalpha(ImageChops.multiply(rim.point(lambda v: int(v * RIM_STRENGTH)), left_bias))
    return Image.alpha_composite(out, rim_layer)


def save(icon: Image.Image, size: int, path: Path, ground=None) -> None:
    small = icon.resize((size, size), Image.LANCZOS)
    if ground is not None:
        back = Image.new("RGBA", (size, size), ground + (255,))
        back.alpha_composite(small)
        small = back
    small.save(path, "PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({size}×{size}, {path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    # one icon per size, drawn at that size: downscaling a 192px canvas turns the terminal
    # text and the glow into mush in a 16px tab
    big = build(canvas=192, rows=7, line=1)
    save(big, 96, ROOT / "assets" / "favicon.png")
    save(build(canvas=48, rows=5, line=1, glow=1.25), 48, ROOT / "assets" / "favicon-48.png")
    save(build(canvas=32, rows=4, line=1, glow=1.7), 32, ROOT / "assets" / "favicon-32.png")
    save(build(canvas=16, rows=3, line=1, glow=2.2), 16, ROOT / "assets" / "favicon-16.png")
    save(build(canvas=180, rows=7, line=2, glow=0.95), 180, ROOT / "assets" / "apple-touch-icon.png", ground=(16, 8, 38))
