"""Phoenix Gym photo pipeline (Pillow only).

Takes the originals in photos/originals/ and writes web-ready, theme-graded
images to public/images/phoenix/<name>-<width>.webp at several widths.

Steps per photo: gentle denoise -> high-quality upscale -> local-contrast
"clarity" -> shadow lift / tone curve -> champagne-gold grade -> fine sharpen
-> subtle vignette -> responsive WebP exports.

Run:  python3 photos/enhance.py
Note: this enhances and cleans images; it cannot invent detail that a
low-resolution source doesn't contain (no AI upscaling).
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'photos' / 'originals'
OUT = ROOT / 'public' / 'images' / 'phoenix'
WIDTHS = [640, 960, 1280, 1600, 2000, 2560, 3200]

# Champagne-gold palette from the Phoenix emblem
INK, BRONZE, CHAMPAGNE = (12, 9, 6), (138, 104, 62), (243, 226, 194)

PHOTOS = {
    # name: (source file, settings)
    # Hero: cinematic golden-hour edit of the sunrise flex (sun at ~61.6% x, 47.6% y of the frame)
    # Hero: HD stock (Anastase Maragos / Unsplash, free licence). Already 5472px: light touch only.
    'hero-gym': ('stock-hero-barbell-anastase-maragos.jpg', dict(upscale=False, gamma=0.9, contrast=1.06, grade=0.12, clarity=22, saturation=1.04, vignette=0.1,
                 spots=[((0.585, 0.34), (0.14, 0.36), 0.55), ((0.567, 0.19), (0.03, 0.045), 0.7)])),
    'hero-sunrise': ('beach-sunrise-flex.jpeg', dict(gamma=1.26, contrast=1.32, grade=0.18, clarity=46, saturation=1.1, vignette=0.45, sun=(0.616, 0.476), golden=0.42)),
}


def tone_curve(im, gamma):
    """Lift shadows/midtones (gamma < 1 brightens) while protecting highlights."""
    lut = [min(255, round(255 * ((i / 255) ** gamma))) for i in range(256)]
    return im.point(lut * 3)


def gold_grade(im, amount):
    """Blend a luminance-based gold colourise over the photo (split-tone feel)."""
    lum = ImageOps.grayscale(im)
    gold = ImageOps.colorize(lum, black=INK, mid=BRONZE, white=CHAMPAGNE, midpoint=110)
    return Image.blend(im, gold, amount)


def vignette(im, strength):
    w, h = im.size
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    pad_w, pad_h = int(w * 0.12), int(h * 0.12)
    d.ellipse((-pad_w, -pad_h, w + pad_w, h + pad_h), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.18))
    dark = ImageEnhance.Brightness(im).enhance(1 - strength)
    return Image.composite(im, dark, mask)


def spotlight(im, center, radius, gamma):
    """Studio-style dodge: lift shadows only inside a soft oval around the subject."""
    w, h = im.size
    cx, cy = center[0] * w, center[1] * h
    rx, ry = radius[0] * w, radius[1] * h
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(rx, ry) * 0.55))
    lifted = tone_curve(im, gamma)
    return Image.composite(lifted, im, mask)


def golden_hour(im, sun, strength, s_radius=0.42, edge_dark=0.32):
    """Cinematic sunrise: deepen the sky toward the edges, warm it, and bloom the sun."""
    w, h = im.size
    # warm split-tone: shadows -> deep bronze, highlights -> molten gold
    lum = ImageOps.grayscale(im)
    warm = ImageOps.colorize(lum, black=(10, 6, 4), mid=(150, 88, 40), white=(255, 214, 150), midpoint=120)
    im = Image.blend(im, warm, strength)
    # radial darkening away from the sun keeps the subject's silhouette and the copy area moody
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    cx, cy = int(sun[0] * w), int(sun[1] * h)
    r = int(max(w, h) * s_radius)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(r * 0.45))
    im = Image.composite(im, ImageEnhance.Brightness(im).enhance(edge_dark), mask)
    # sun bloom: blur the brightest areas and screen them back on
    bright = im.point(lambda v: 255 if v > 210 else int(v * 0.15))
    bloom = bright.filter(ImageFilter.GaussianBlur(min(w, h) * 0.035))
    im = ImageChops.screen(im, ImageEnhance.Brightness(bloom).enhance(0.55))
    glow = Image.new('L', (w, h), 0)
    ImageDraw.Draw(glow).ellipse((cx - r // 5, cy - r // 5, cx + r // 5, cy + r // 5), fill=150)
    glow = glow.filter(ImageFilter.GaussianBlur(r * 0.12))
    im = ImageChops.screen(im, Image.merge('RGB', (glow, glow.point(lambda v: int(v * 0.62)), glow.point(lambda v: int(v * 0.22)))))
    return im


def process(name, src, s):
    im = Image.open(SRC / src).convert('RGB')
    if s.get('upscale', True):
        # 1. gentle denoise on the low-res source (removes JPEG/phone noise before upscaling)
        im = Image.blend(im, im.filter(ImageFilter.MedianFilter(3)), 0.45)
        # 2. high-quality 2x upscale
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    elif im.width > 3200:
        # already HD: just cap the master at the largest web width
        im = im.resize((3200, round(im.height * 3200 / im.width)), Image.LANCZOS)
    # 3. clarity: large-radius unsharp = local contrast
    im = im.filter(ImageFilter.UnsharpMask(radius=24, percent=s['clarity'], threshold=0))
    # 4. tone (+ optional spotlight on the subject)
    im = tone_curve(im, s['gamma'])
    for spot in s.get('spots', []):  # body, then a small lift on the cap-shadowed face
        im = spotlight(im, *spot)
    im = ImageEnhance.Contrast(im).enhance(s['contrast'])
    im = ImageEnhance.Color(im).enhance(s['saturation'])
    # 5. brand grade (+ optional cinematic golden-hour pass)
    im = gold_grade(im, s['grade'])
    if s.get('sun'):
        im = golden_hour(im, s['sun'], s.get('golden', 0.35))
    # 6. fine sharpening for crisp edges at display size
    im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=85, threshold=2))
    # 7. vignette to focus the eye
    im = vignette(im, s['vignette'])

    for w in WIDTHS:
        out = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        if im.width < w:  # never upscale beyond the 2x master
            out = im
        out.save(OUT / f'{name}-{w}.webp', 'WEBP', quality=84, method=6)
    print(f'{name}: master {im.width}x{im.height} -> {", ".join(str(w) for w in WIDTHS)}')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, settings) in PHOTOS.items():
        process(name, src, settings)
