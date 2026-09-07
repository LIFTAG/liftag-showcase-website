# Local verification — 5 September 2026

- `pnpm verify`: **passed** — 430 tests, Nuxt typecheck, and production build. The tests cover original animation math, native journey boundaries and header-offset chapter jumps, graphics capability selection, deferred media/error fallback, public/legacy anchors, optimized equipment GLB integrity and size, kit validation, and the contact composable with a mocked transport.
- `git diff --check`: passed.
- Graphify refreshed: **1,310 nodes / 1,816 edges**, report dated 2026-09-05.
- `/gym-scan/?utm_source=review`: **308** to `/?utm_source=review` on the local production server.
- Final browser viewport checks: 1440×900, 390×844, and 320×740. No horizontal overflow was observed. Equipment buttons remain 58 px high on the narrow layout. The earlier 844×390 landscape and form validation checks are retained as baseline checks; real-device rotation remains outstanding.
- Exercised native forward scrolling, reversal/chapter jumps, repeated current-chapter links, direct Progress/Coach destinations, product-view switching, all-floor/individual model transitions, native click selection, reduced motion on/off, and return to the rendered scene. The final browser console showed no scene errors during capture.
- Actual public EZ-Bar Skullcrusher HLS video played on desktop and mobile layouts (15.08 seconds). Verified silent default, native controls, Escape/close, keyboard focus restoration to Watch instructions, and unchanged document scroll after modal closure. No camera permission or account was requested. Instruction-stream failure handling is implemented; deliberate browser-level network failure was not exercised.
- An isolated Lighthouse browser with `--disable-webgl` completed with automated accessibility 100 and no runtime error. This covers unavailable WebGL at startup; mid-session context loss remains a separate release check.
- Reduced motion selects matching equipment stills and keeps the same controls and conversion path. The screenshot `mobile-reduced-motion.png` records this state.
- The shared `/contact/partner` form renders without the cinematic canvas. Earlier local Turnstile checks reported an unauthorized/unavailable host. No successful request was sent to the live contact API.

## Loading audit

Final three-run median: **performance 87; automated accessibility 100; LCP 3.13 s; total blocking time 258 ms; CLS 0**. Initial transfer is approximately **1.19 MiB**, above the 1 MB budget; simulated LCP also remains above the 2.5 s target. Font paint now precedes graphics initialization, and the floor fallback waits for its chapter.

The JSON summary in `verification/lighthouse-mobile.json` records production Lighthouse mobile simulations. The other browser is kept on the contact page during these runs to avoid competing 3D workloads. These are lab results, not field p75 metrics or sustained 60/120 Hz measurements.

The new, deferred source equipment is **1,298,208 bytes**. The original hero is reused. All four gallery models together are guarded by a **1.7 MB** test budget; full source collections and unused preliminary exports are excluded. Extended instruction streaming only begins after an explicit request.

## Visual evidence

`proof/signature-desktop.mp4` is a **45-second sampled browser walkthrough** of the opening, tag, phone reveal, and corrected floor interaction. It combines 514 browser screenshots; idle gaps between recording calls are shortened. It demonstrates sequence and composition, not rendering frame rate. Current desktop/mobile captures are alongside it. The `previous-direction/` archive is explicitly superseded.

## Outstanding release checks

Real iOS Safari/Android Chrome and desktop Safari/Firefox; physical-device sustained frame-time checks; actual 200% browser zoom; mid-session WebGL context loss and instruction-network blocking; five-owner comprehension testing; successful Turnstile and kit delivery on an authorized hostname; and production Core Web Vitals. The initial-transfer and LCP targets must be assessed against the recorded lab results before an award/release claim. This local experience has not been deployed or submitted to an award.
