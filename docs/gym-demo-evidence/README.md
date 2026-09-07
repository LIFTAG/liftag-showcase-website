# Gym demo review evidence

This folder records the production-build review of the immersive `/demo` refresh. The captures are representative checkpoints rather than exhaustive visual snapshots.

## Before and after

| View | Before | After |
|---|---|---|
| Desktop opening | [before-desktop.webp](before-desktop.webp) | [after-desktop.webp](after-desktop.webp) |
| Mobile opening | [before-mobile.webp](before-mobile.webp) | [after-mobile.webp](after-mobile.webp) |
| Trainer recording | [before-recording.webp](before-recording.webp) | [after-recording.webp](after-recording.webp) |
| Full sampled journey | [before-walkthrough.mp4](before-walkthrough.mp4) | [after-walkthrough.mp4](after-walkthrough.mp4) |

Additional final checkpoints:

- [Short laptop opening](after-short-laptop.webp)
- [Earth establishing view](after-earth.webp)
- [Regional cartography](after-map.webp)
- [Floor transformation](after-floor.webp)
- [Mobile recording](after-mobile-recording.webp)
- [Mobile regional map](after-mobile-map.webp)
- [Mobile equipment list](after-mobile-equipment.webp)
- [Mobile inventory](after-mobile-inventory.webp)

Capture metadata is preserved in [before-capture.json](before-capture.json) and [after-capture.json](after-capture.json). Cold-load measurements, recording asset budgets, and reproduction commands are in [performance.md](performance.md).

## Verification performed

The authoritative `pnpm verify` gate passed with 481 tests, TypeScript checking, and the production build. The final release build also scored 1.00 in Lighthouse accessibility with zero failing accessibility audits.

The first hosted build exposed duplicate Nitro function names for the two legacy redirect rules. The redundant trailing-slash rule was removed; the slashless redirect and Nuxt fallback page remain. Deployment verification uses the full `NITRO_PRESET=vercel pnpm verify` gate to match CI.

The journey was checked at desktop 1440×900, short laptop 1366×650, tablet 768×1024, and mobile 360×640 and 390×844. Manual coverage included forward and reverse scrolling, chapter jumps, regional selection persistence, pause and replay, valid and invalid local-video selection, Restore demo, reduced motion, keyboard navigation, and startup with WebGL disabled.

## Limits

The walkthrough is a sampled browser capture and does not prove real-time frame rate. Lighthouse traces cover cold load only; GPU memory, complete-journey frame pacing, and the 60 fps desktop / 30 fps compact targets were not measured on physical devices.

The kit form was inspected without submitting it. Turnstile reports its expected localhost error outside an approved production hostname. Save-data behavior and mid-session WebGL context loss were reviewed in source but were not manually exercised.
