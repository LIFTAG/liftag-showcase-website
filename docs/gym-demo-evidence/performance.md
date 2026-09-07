# Gym demo performance evidence

The refreshed demo was measured against the previous production build with three equivalent cold-load Lighthouse runs per desktop and mobile profile. Both builds ran locally on the same machine. Values below are medians followed by the observed range.

## Lighthouse cold load

| Profile | Performance | LCP | TBT | CLS | Transfer |
|---|---:|---:|---:|---:|---:|
| Desktop before | 0.58 (0.39–0.93) | 1,179 ms (1,133–4,279) | 1,122 ms (10–2,660) | 0.00039 | 1,657,921 B |
| Desktop final | 0.97 (0.97–0.98) | 671 ms (595–834) | 11 ms (1–48) | 0 | 1,647,364 B |
| Mobile before | 0.61 (0.56–0.71) | 4,369 ms (3,570–4,443) | 709 ms (587–804) | 0 | 1,299,100 B |
| Mobile final | 0.68 (0.68–0.89) | 4,454 ms (2,712–4,495) | 361 ms (272–388) | 0 | 1,288,014 B |

Desktop median LCP improved by 43%, TBT fell by 99%, and transfer fell by 10,557 bytes. Mobile median TBT improved by 49% and transfer fell by 11,086 bytes; median LCP was 85 ms slower, within a wide baseline range. All six final runs measured zero CLS. This last result verifies that the demo CSS is present for the initial server-rendered paint rather than arriving during hydration.

## Cold-load frame pacing and heap

The Lighthouse traces were also sampled for `DrawFrame` intervals on the busiest renderer thread and `UpdateCounters.jsHeapSizeUsed`. Each cell is the median of the three runs, followed by the run range.

| Profile | Median frame interval | p95 frame interval | Intervals over 20 ms | Intervals over 34 ms | Peak sampled JS heap |
|---|---:|---:|---:|---:|---:|
| Desktop before | 16.687 ms (16.652–16.695) | 20.628 ms (17.669–25.854) | 24 (10–48) | 12 (3–17) | 46.3 MiB (36.6–50.8) |
| Desktop final | 16.647 ms (16.632–16.668) | 19.134 ms (17.619–19.193) | 8 (5–10) | 3 (1–4) | 42.4 MiB (41.6–43.0) |
| Mobile before | 16.665 ms (16.612–16.710) | 18.293 ms (17.735–27.053) | 10 (5–14) | 3 (2–4) | 50.4 MiB (43.7–50.4) |
| Mobile final | 16.664 ms (16.657–16.665) | 18.303 ms (17.314–18.846) | 7 (5–9) | 1 (0–2) | 43.9 MiB (41.1–50.1) |

Desktop cold-load pacing became more consistent: the median p95 interval improved by 1.49 ms, intervals over 20 ms fell from 24 to 8, and intervals over 34 ms fell from 12 to 3. The mobile median interval and p95 were effectively unchanged while the number of longer intervals fell. Peak sampled JavaScript heap fell by 3.9 MiB on desktop and 6.5 MiB on mobile.

## Recording asset budgets

| Asset | Shipped size | Budget |
|---|---:|---:|
| Rigged mannequin GLB | 126,516 B | 500 KB |
| VP9 WebM | 35,959 B | 750 KB |
| H.264 MP4 | 33,126 B | 750 KB |
| WebP poster | 6,642 B | 80 KB |

The GLB contains one skinned mesh with 3,336 triangles, 15 nodes, one skin, and the 4.8-second `PivotLegPressCycle` animation. Automated asset checks verify the rig, duration, articulated shin and foot movement, and both feet following the machine carriage vector.

## Reproduction

Build and serve the production output, then run each profile three times against the local `/demo` URL:

```bash
pnpm build
NITRO_HOST=127.0.0.1 NITRO_PORT=3000 VERCEL_ENV=preview node new_app/.output/server/index.mjs
pnpm dlx lighthouse http://127.0.0.1:3000/demo --only-categories=performance --preset=desktop --output=json --save-assets --chrome-flags='--headless --no-sandbox'
pnpm dlx lighthouse http://127.0.0.1:3000/demo --only-categories=performance --output=json --save-assets --chrome-flags='--headless --no-sandbox'
```

Use a fresh output path for each run. Preserve the previous production output before rebuilding so both revisions are tested under the same host and command settings.

## Limits

These are cold-load lab measurements. The traces do not cover the complete scroll journey, and `DrawFrame` spacing is a renderer-thread proxy rather than a physical display FPS guarantee. The heap samples exclude GPU memory. Lighthouse mobile uses throttling and emulation on the development machine, so it does not prove the compact-device 30 fps target. Complete-journey tracing and testing on physical desktop and mobile hardware remain future verification work.

A release audit against the final frozen build scored 1.00 for Lighthouse accessibility with zero failing accessibility audits. Automated results supplement the manual keyboard, reduced-motion, and responsive checks described in the evidence index; they do not replace assistive-technology testing.
