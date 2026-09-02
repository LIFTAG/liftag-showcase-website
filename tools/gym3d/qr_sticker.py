# Turn the exported LIFTAG QR sticker artwork into the texture the hero loads.
#
#   python3 tools/gym3d/qr_sticker.py <artwork.png>
#
# The artwork ships as a rounded-rect sticker sitting on an opaque white page.
# Three things have to happen to it:
#
#   * the white surround has to go, and it has to go *before* the downscale -
#     resampled afterwards it bleeds a white fringe around the corner arcs;
#   * the corner alpha is generated analytically at the output size rather than
#     resampled, so the arc stays clean at any resolution;
#   * the palette comes down to 64 colours. The artwork is black, white, lime
#     and antialiasing, so this is invisible, and it is most of the file.
#
# Lossless WebP with exact=True keeps the result bit-identical to the quantised
# RGBA while costing a third of the equivalent PNG. 104 kB in, 12 kB out.
import os
import sys

# `tools/gym3d/inspect.py` shadows the standard library's `inspect` for anything
# run out of this directory, and numpy imports it on the way up. Drop the script
# directory from the search path before importing anything third-party.
sys.path[:] = [
    d for d in sys.path
    if os.path.abspath(d or ".") != os.path.dirname(os.path.abspath(__file__))
]

import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

# Measured off the artwork: the body's corner radius is 75 px in an 827 px
# frame. Expressed as a fraction so a re-export at another size still works.
RADIUS_FRAC = 75.0 / 827.0
OUT_WIDTH = 512
COLOURS = 64

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DST = os.path.join(ROOT, "new_app", "public", "assets", "gym3d", "qr-sticker.webp")


def rrect_alpha(w, h, r, ss=4):
    """Anti-aliased rounded-rect coverage, supersampled from the exact SDF."""
    ys, xs = np.mgrid[0:h * ss, 0:w * ss]
    x = (xs + 0.5) / ss
    y = (ys + 0.5) / ss
    hw, hh = w / 2.0, h / 2.0
    qx = np.abs(x - hw) - (hw - r)
    qy = np.abs(y - hh) - (hh - r)
    d = np.minimum(np.maximum(qx, qy), 0) + np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) - r
    return (d < 0).astype(np.float32).reshape(h, ss, w, ss).mean(axis=(1, 3))


def main(src):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    r = RADIUS_FRAC * w

    flat = (np.asarray(im).astype(np.float32) * rrect_alpha(w, h, r, ss=2)[..., None])
    ow = OUT_WIDTH
    oh = int(round(h * ow / w))
    small = Image.fromarray(flat.astype(np.uint8), "RGB").resize((ow, oh), Image.LANCZOS)

    rgb = np.asarray(small.quantize(colors=COLOURS, method=Image.FASTOCTREE).convert("RGB"))
    alpha = (rrect_alpha(ow, oh, r * ow / w, ss=4) * 255).round().astype(np.uint8)

    out = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    out.save(DST, "WEBP", lossless=True, quality=100, method=6, exact=True)
    print("%s  %d bytes  %dx%d" % (DST, os.path.getsize(DST), ow, oh))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "pivot-leg-press-qr.png")
