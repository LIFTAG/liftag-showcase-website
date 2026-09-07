# Homepage recut: machines, members, gym discovery

## Shot list

| Shot | Picture | Product sentence | Works on mute |
| --- | --- | --- | --- |
| Arrival | Supplied logo draws from its original geometry, travels into the header while the two covers open onto the gym | These physical machines connect to LIFTAG | Yes |
| Machine / tag | Existing floor assembly, flying sticker, attachment, QR capture and phone fold | Put a QR/NFC tag on the machine; members scan or tap it | Yes |
| Member 1 | Leg press remains beside its real log screen | The tag opens that machine, ready to log | Yes |
| Member 2 | Flat bench beside a phone playing the real EZ-bar skullcrusher instruction | Members can watch how to use the equipment | Yes |
| Member 3 | Same bench and phone; LIFTAG source becomes a marked trainer-upload placement | A gym can replace catalog guidance with its trainer's own video | Yes, with an explicit upload-placement label |
| Member 4 | Real logged-set capture connects to the real progression capture | Logged sets become visible progress | Yes |
| Gym 1 | Dimensional map made from the real app capture; selected listing rises beside it | People can discover the gym and look inside | Yes |
| Gym 2 | Listing clears the frame to reveal the existing selectable 3D collection | The listing includes the gym's equipment | Yes |
| Gym 3 | Gym detail and trainer profile captures share the scene | See the gym, hours, reviews and trainers before arriving | Yes |
| Gym 4 | Equipment-matched example plan assembles beside the same floor; mobile connects each station picture directly to its exercise | Knowing the gym's equipment makes a relevant AI workout possible | Yes |

## Implementation boundaries

`GymExperience` composes the narrative. `useGymJourney` reads native section geometry and selects the four member and four owner beats. Replay controls demonstrate the picture itself; scrolling advances the sequence without needing controls. The opening film's timing and rendering architecture are retained.

`GymArrival` is a bounded, optional introduction driven by readiness. It never locks scrolling. It releases after drawing when the scene is ready, or after a 2.8-second deadline, and its exit lasts 0.85 seconds. Scrolling or Enter the gym skips immediately. Repeat route visits, direct hashes, Save-Data and reduced motion bypass it. `GymLogoEntry` samples the supplied geometry into native SVG animation; no React dependency or additional JavaScript animation loop is introduced.

`GymCinema` retains the single renderer and existing stage loop. HTML product shots pause the renderer after the equipment has prepared; the optional instruction dialog pauses both the stage and inline preview. The equipment gallery resumes for its visible shots. Selection, resize, teardown and existing graphics fallbacks are preserved.

Reduced motion and no JavaScript render all eight beats as independent illustrated scenes, not a hidden animation. The 15,276-byte instruction still was obtained from the verified public EZ-bar skullcrusher catalog response on 2026-09-05. Video URLs are still resolved at playback from the public endpoint and selected by the existing catalog helper. No new video file was added.

## Honesty and limits

- The trainer upload is an explicitly marked placement example. No gym-owned recording was supplied, and the site never relabels LIFTAG's catalog recording as a gym's own recording.
- The gym and trainer captures remain demonstration data. The gym capture retains its actual zero reviews. No review totals, new testimonials, usage counts or prices were invented.
- The AI scene is an illustrative equipment-matched plan, not a live AI request. The bench exercise is an incline push-up so the example does not require an unlisted EZ bar. The separate instruction remains the verified bench + EZ-bar exercise.
- A decorative globe was unnecessary: the actual app map establishes discovery and leads directly to the listing and floor.
- At roughly 15 seconds, the intended takeaway is tags on machines and scan/watch/log. By roughly 90 seconds of scrolling, the sequence also teaches gym-owned guidance, discovery, trainers/hours/reviews and equipment-aware workout planning. These are design targets, not measured visitor-comprehension results.

## Verification

The root `pnpm verify` gate includes the repository's current 431 tests, typecheck and production build. Browser checks cover desktop, tablet and phone compositions, native scrolling, chapter anchors, equipment selection, real video playback, dialog Escape/focus restoration, reduced-motion stills and kit validation. The public partner/get routes are checked separately.

No contact request is sent during testing. The local Cloudflare challenge reports an unavailable connection; the existing verification error and email fallback remain visible. A successful production form delivery is not claimed.
