#!/usr/bin/env python3
"""Render tools/gym3d/scan-flow-pivot.html to gym-scan-flow.{mp4,av1.mp4}.

The page is time-driven (`window.setTime(t)`). We step it at 60 fps so the
LOG cut lands on frame 192 (t = 3.2s), matching ScanSection / gym-scan.

  /Users/adrian/anaconda3/bin/python tools/gym3d/record-scan-flow.py
"""
from __future__ import annotations

import os
import sys

# `inspect.py` in this folder shadows the stdlib module Playwright imports.
sys.path[:] = [
    d for d in sys.path
    if os.path.abspath(d or ".") != os.path.dirname(os.path.abspath(__file__))
]

import http.server
import shutil
import subprocess
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = "/tools/gym3d/scan-flow-pivot.html"
OUT_DIR = ROOT / "new_app" / "public" / "assets" / "videos"
STILL_DIR = ROOT / "new_app" / "public" / "assets" / "gym3d"
FPS = 60
DURATION = 6.4
WIDTH = 620
HEIGHT = 1344
FRAMES = int(round(DURATION * FPS))  # 384
LOG_AT = 3.2


def encode(frames_dir: Path, dest: Path, codec: str) -> None:
    # Keyframes at 0s and 3.2s so gym-scan can park on the flattened QR
    # without a same-timestamp seek stalling WebKit.
    vf = (
        f"scale={WIDTH}:{HEIGHT}:flags=lanczos,"
        "format=yuvj420p,"
        "setsar=1"
    )
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", str(frames_dir / "%04d.jpg"),
        "-force_key_frames", f"0,{LOG_AT}",
        "-vf", vf,
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-color_range", "pc",
        "-movflags", "+faststart",
        "-an",
    ]
    if codec == "h264":
        cmd += [
            "-c:v", "libx264",
            "-profile:v", "high",
            "-preset", "slow",
            "-crf", "20",
            "-pix_fmt", "yuvj420p",
        ]
    elif codec == "av1":
        cmd += [
            "-c:v", "libsvtav1",
            "-crf", "32",
            "-preset", "6",
            "-pix_fmt", "yuv420p",
        ]
    else:
        raise ValueError(codec)
    cmd.append(str(dest))
    subprocess.check_call(cmd)


def main() -> int:
    from playwright.sync_api import sync_playwright

    tmp = Path("/tmp/gym-scan-flow-frames")
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True)

    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    # Serve the worktree root so /new_app/public and /tools/gym3d resolve.
    os.chdir(ROOT)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    port = httpd.server_address[1]
    url = f"http://127.0.0.1:{port}{HTML}"
    print(f"serving {ROOT} on {url}", flush=True)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome")
            page = browser.new_page(
                viewport={"width": WIDTH, "height": HEIGHT},
                device_scale_factor=1,
            )
            page.goto(url, wait_until="networkidle")
            page.wait_for_function("() => window.__ready === true", timeout=15000)

            for i in range(FRAMES):
                t = i / FPS
                page.evaluate("(t) => window.setTime(t)", t)
                page.screenshot(
                    path=str(tmp / f"{i:04d}.jpg"),
                    type="jpeg",
                    quality=94,
                )
                if i % 48 == 0:
                    print(f"  frame {i}/{FRAMES}  t={t:.2f}", flush=True)

            browser.close()
    finally:
        httpd.shutdown()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    h264 = OUT_DIR / "gym-scan-flow.mp4"
    av1 = OUT_DIR / "gym-scan-flow.av1.mp4"
    encode(tmp, h264, "h264")
    encode(tmp, av1, "av1")

    still = STILL_DIR / "log-set.webp"
    capture = ROOT / "tools" / "gym3d" / "scan-flow-src" / "log-set.jpg"
    from PIL import Image
    src = capture if capture.exists() else tmp / f"{FRAMES - 1:04d}.jpg"
    Image.open(src).convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(
        still, "WEBP", quality=90, method=6,
    )

    print(h264, h264.stat().st_size, "bytes")
    print(av1, av1.stat().st_size, "bytes")
    print(still, still.stat().st_size, "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
