#!/usr/bin/env python3
"""Capture the live gym-scan lock as tools/gym3d/scan-flow-src/gym-scene.png.

Seeks the desktop cut to the last frame before the scan-flow LOG blend, then
blits the phone-screen UVs (QR already steered onto VIDEO_QR_ANCHOR) to the
same 620 x 1344 still the recorder composites under the morph.

The Nuxt dev server must already be running:

  /Users/adrian/anaconda3/bin/python tools/gym3d/capture-gym-scene.py
"""
from __future__ import annotations

import base64
import os
import sys

# `inspect.py` in this folder shadows the stdlib module Playwright imports.
sys.path[:] = [
    d for d in sys.path
    if os.path.abspath(d or ".") != os.path.dirname(os.path.abspath(__file__))
]

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tools" / "gym3d" / "scan-flow-src" / "gym-scene.png"
URL = os.environ.get("GYM_SCAN_URL", "http://localhost:3000/gym-scan")
WIDTH = 1440
HEIGHT = 900
# Fold just past 1, camera parked, reticle and lock-scan gone, app mix still
# 0 on the first frames. Scene 0.869 → sticky progress 0.73.
LOCK_PROGRESS = 0.73
OUT_W = 620
OUT_H = 1344


def main() -> int:
    from playwright.sync_api import sync_playwright

    OUT.parent.mkdir(parents=True, exist_ok=True)
    print(f"capturing {URL} → {OUT}", flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=2,
        )
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_function(
            "() => window.__gymscan && window.__gymscan.api && document.querySelector('.gs.is-ready')",
            timeout=90000,
        )
        page.evaluate(
            """() => {
              const g = window.__gymscan
              g.skipAct0()
              g.api.setPointer(0, 0, false)
              g.api.setTilt(0, 0, false)
            }"""
        )
        page.wait_for_function(
            "() => window.__gymscan.act0 && window.__gymscan.act0.done === true",
            timeout=15000,
        )
        page.evaluate(
            """(p) => {
              const host = document.querySelector('.gs')
              const total = Math.max(1, host.offsetHeight - window.innerHeight)
              window.scrollTo(0, p * total)
              window.__gymscan.api.setProgress(p)
            }""",
            LOCK_PROGRESS,
        )
        page.wait_for_function(
            """(p) => {
              const g = window.__gymscan
              if (!g || !g.act1) return false
              const host = document.querySelector('.gs')
              const total = Math.max(1, host.offsetHeight - window.innerHeight)
              window.scrollTo(0, p * total)
              g.api.setProgress(p)
              return g.act1.shot === 'fold' && g.api.progress > p - 0.04
            }""",
            arg=LOCK_PROGRESS,
            timeout=15000,
        )
        page.wait_for_timeout(250)
        result = page.evaluate(
            """({w, h, p}) => {
              const g = window.__gymscan
              g.api.setProgress(p)
              g.api.setPointer(0, 0, false)
              g.api.setTilt(0, 0, false)
              return {
                dataUrl: g.capturePhoneScreen(w, h),
                progress: g.api.progress,
                act1: g.act1,
              }
            }""",
            {"w": OUT_W, "h": OUT_H, "p": LOCK_PROGRESS},
        )
        print("progress", result.get("progress"), "act1", result.get("act1"), flush=True)
        data_url = result.get("dataUrl")
        browser.close()

    if not data_url or not str(data_url).startswith("data:image/png;base64,"):
        print("capture returned nothing — is /gym-scan in dev?", file=sys.stderr)
        return 1

    raw = base64.b64decode(str(data_url).split(",", 1)[1])
    OUT.write_bytes(raw)
    print(OUT, OUT.stat().st_size, "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
