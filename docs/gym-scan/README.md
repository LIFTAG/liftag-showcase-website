# LIFTAG — the gym-scan experience

The original machine assembly, NFC macro, bending tag attachment, scanner focus, and 3D phone fold/zoom remain the opening sequence. Black, lime, steel, Space Grotesk, Inter, and JetBrains Mono carry through the page. See [the current story recut](recut.md) for the logo arrival, member and gym shot lists, and their verification boundaries.

## Focused interaction

- Native scrolling advances four member scenes: scan and log, real instruction playback, clearly labeled gym-trainer video placement, and logged progress. Four gym scenes connect the actual app map and listing to equipment, trainers and an illustrative equipment-matched AI workout. Replay controls revisit complete visual scenes. Reduced-motion and no-JavaScript visitors receive all scenes in normal document flow.
- Four equipment choices bring real models forward from the floor. “Whole floor” restores the collection. The layout is explicitly illustrative, not an occupancy system or floor-plan product feature.
- Flat bench → Watch instructions opens the live catalog’s **EZ-Bar Skullcrusher** instruction stream. The movement uses a flat bench plus an EZ bar. This is an equipment-type match; the page does not claim the exact same manufactured bench is in the video.
- Playback uses the existing public exercise endpoint and deterministic catalog-video selector. URLs are resolved when requested, never guessed. Native video controls, HLS support, silent default, explicit sound, loading/error states, Escape dismissal, focus restoration, and cleanup are provided. The 3D loop pauses during the optional video.
- No matched video is offered for the hero leg press, cable station, or treadmill. Their currently public catalog entries had no matching video at the time of inspection.

The `liftag-app` repository was inspected read-only, including `InstructionVideo.tsx`, `WatchInstructionsPill.tsx`, and the onboarding demo sandbox. Its React Native/Expo screens rely on native playback, authentication, stores, and navigation; they are not drop-in Vue components. This revision uses the actual product captures, the app’s compact watch-instructions behavior, and the public catalog media. It does not embed or impersonate a running signed-in app.

## Assets and rendering

The corrected `all_3D_assets` collection replaces the mistakenly supplied athlete scan. That model and its poster are removed. Original source files are untouched.

`tools/gym3d/export-equipment-collection.py` extracts named source objects, decimates them, resizes textures to 256 px, and exports Draco GLBs:

| Asset | Source object | Triangles | Bytes |
|---|---|---:|---:|
| Flat bench | all+fitness / 1.005 | 20,000 | 369,700 |
| Cable station | all+fitness / 4.002 | 24,000 | 597,112 |
| Treadmill | all+cardio / SP3D treadmill | 24,000 | 331,396 |

The new equipment totals **1,298,208 bytes**. The original optimized leg press is reused. Unused preliminary exports are removed. `equipment-manifest.json` records exact provenance; `render-equipment-posters.py` renders the same web models for fallbacks. The large source collections never enter the browser bundle.

`GymExperience.vue` owns semantic chapter composition. `useGymJourney.ts` maps native scrolling to the original stage’s installation and phone phases. `GymCinema.vue` owns progressive imports, readiness, graphics capability, pause/resume, reduced motion, and disposal. `equipmentGallery.ts` uses the stage’s renderer and RAF rather than starting another rendering loop. It loads near the member/owner transition and precompiles before revealing the floor. Initial fonts get a painted frame before WebGL boot; the floor fallback image is deferred to its chapter and retained in a no-JavaScript fallback. Portrait camera distance and fog are composed independently from graphics quality.

Reduced motion, Save-Data, unavailable WebGL, context loss, and model failure retain HTML, equipment posters, app screens, navigation, and kit conversion. The narrative has no scroll locks or required interactions. The optional instruction dialog uses normal modal keyboard behavior.

## Navigation and conversion

The homepage uses the shared experience. `/gym-scan` redirects permanently to `/`; query strings and useful fragment destinations are retained. `#lifters`, `#gyms`, `#trainers`, and legacy aliases remain meaningful. Repeating the current chapter link returns to its beginning, and header offsets are included in chapter/reveal completion.

`GymKitForm.vue` is shared with `/contact/partner`. Name, email, gym, and city are required; equipment count and notes are optional. The existing contact payload and Turnstile integration are preserved. Pending, validation, verification, network, service, rate-limit, and success states retain entered values. No live contact request was submitted during testing.

Existing gtag tracks kit CTA/completion, story chapters/exit, equipment selection, and requested instruction playback. Form contents are never included. No analytics backend contract changed.

See `verification.md` for measured checks and release limitations. Proof captures are local previews; the archived previous direction does not represent this revision. The walkthrough is visual evidence, not a frame-rate benchmark or an award submission.
