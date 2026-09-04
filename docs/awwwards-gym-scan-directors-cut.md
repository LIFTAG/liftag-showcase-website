# `/gym-scan` director's cut

Status: buildable awards object. Second recut - the ending was cut back to a seam.
Audience: founder + lead engineer. Start tomorrow.
Date: 2026-09-03. Object: `https://liftag.fit/gym-scan` (prototype route today).
Cuts: **FROM THE FLOOR** (desktop ~1440×900, `pointer: fine`) and **FROM THE SEAT** (phone ~390/430, `pointer: coarse`, `hover: none`). Same room. Same grade. Same beats.

This is not Plan A, B, or C. It is a recut of live Act 1 plus locked Act 0. Live `/gym-scan` is not submittable.

---

## 1. Verdict (8 lines)

We build one `/gym-scan` object: a timed hologram-floor birth, a 6–8 group assemble with iron plates, a short legendary fly-in that *presses* onto the beam, a walk-up that ends in the seat reading the plate square on, a QR lock, and then a **match cut back into the site**. Nothing is explained. It is a film about a machine getting a tag and the tag opening an app.

The previous cut put a seated hologram rep between the approach and the lock, and a chapter of HTML after it - a working log, a video header, a map pane, dashboard words. Both are gone. The rep was a second subject in the middle of a one-sentence story. The chapter was a brochure at the exact moment the film had earned the right to say nothing.

**There is no new copy after the scan.** The plate resolves, the room folds onto the glass, the glass flies into the landing hero's own phone, and `/gym-scan` continues as the site. The site already has sections that teach the log, the videos, the map, and the dashboard; it does not need a second set written in a fog grade.

It beats A because A skipped the birth and locked the QR on the way in. It beats B because B had no map, no ours-then-yours video and no Partner of equal craft. It beats C because C skipped Act 0 and inherited a 9 svh hostage.

The screenshot is **0D Physical stick**: vinyl on the live placard mount, this grade, NFC and QR readable, machine planted. Not a floating loot card.

The two verbs are **SCAN** and **PARTNER**.

Do not submit live `/gym-scan`. Do not claim the kit is free. Do not write a word after the lock.

---

## 2. Shot list

Two clocks. Act 0 is **time-based** in the first viewport (autoplay, skip always available). Scroll does **not** scrub Act 0. After the 0D hold, scroll owns the approach, the lock, the fold, and the morph that leaves.

| Cut | Sticky | Act 0 | 1A–1C scroll | Morph tail | After the seam |
|---|---|---|---|---|---|
| FROM THE FLOOR | **6 svh** | 1 svh timed (~10 s, then hold 0D) | 4.2 svh | 0.8 svh | The landing page. Nav fades up |
| FROM THE SEAT | **3.5 svh** | 1 svh timed (~7 s, then hold 0D) | 2.1 svh | 0.4 svh | Same |
| SEAT CROP (768–1024 coarse) | 3.5 svh | Same as phone | Same | Same | Same |
| Reduced motion | 1 svh | Still of 0D complete | none | none | The landing page, directly under the still |
| Class C low-end | 1 svh | Still of 0D complete | none | none | Same |

`Skip` is **on-screen** from 800 ms, lower half, both cuts. Keyboard `S` is the equivalent, not the door. It snaps Act 0 to its hold; scroll still owns everything after it.

`GYM_SCAN_STICKY_SVH = 9` was illegal on phone and is not inherited on desktop either. `SCENE_END` is **0.84**: the tail is the seam, and it is deliberately short - the phone arrives, it is not ferried.

### 0A Hologram floor (one pass, then die)

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | Establishing three-quarter. **Void first** — no rubber mat. **One** idle hologram pass: wire cage, lime travelling front, floor shockwave. The PBR mat is *written* behind that front (radius = the shockwave). Iron is not there yet. Not a looping idle. | Same pass, cheaper rings (12×24), time-scaled. PBR assembled by the same front. |
| Does | Watch, or Skip. No hover required. | Watch, or Skip. No graze. |
| Product | LIFTAG can read a gym as a system. | Same. |
| Teaches | G9. Lifter: you are in a gym. | Same. |
| Technique | Replay `hologram.ts` / `hologramPassAt` once on the birth clock. Same cage, same shockwave as the periodic sweep. Lime only on the front. Wake is `WIRE_RGB`. Camera stays at ESTABLISH. | Same `update()`, cheaper geometry, faster clock. |
| File | `hologram.ts`, `hologramPass.ts`, `floorConstruct.ts` (clock only) | Same, cheaper |
| Time | one pass (`TRAVEL + SPLASH` ≈ 3.06 s) | 2.2 s, same pass time-scaled |
| Kill-gate | Lime flood. Looping shockwave as first paint. Particle sim. A second floor language (footprint ribbons, look-down). | Same. First paint with no path to iron. |
| Recut vs live | Live opens on a dusted silhouette already there. 0A is the *read* of a machine that has not assembled yet. | Live coarse is a darker leftover of that silhouette. |

### 0B Assemble + plates

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | From the hero footprint: **frame plants** (`drop.ts`, theatrical G, two hops), pads lock, horns, hardware (bolts parented, they do not fly), then **plates slide onto horns** (3 per horn, iron). Fused swap at rest. Sled/footplate stay a moving group from the **parts** export. Dust/grime after swap. Neighbours **off** month one. | Hero only. 6–8 groups. **Two plates total.** No pack. |
| Does | Watch, or Skip. Not a physics toy. | Watch, or Skip. |
| Product | A tagged, plate-loaded machine on a read floor. | Same. |
| Teaches | G9, G10, G11. Empty horns would make the later log a lie. | Same. |
| Technique | `export_hero_parts.py` → `hero-machine-parts.glb`. Cluster 25 real islands into `frame`, `pads`, `footplate`, `sled`, `horns`, `hardware`. Week-1 bet: frame, pads, two plates, swap. `InstancedMesh` for plates from `3.002` discs or 32-seg cylinders. Solids use planted PBR. Wire copies may use the hologram front. No lime on powder coat. | 4 groups if p99 dies (frame, pads, sled, plates). |
| File | New `tools/gym3d/export_hero_parts.py`, `utils/gymscan/parts.ts`, `drop.ts`, `stage.ts`. Keep `export_hero.py` for fallback fused. | Same assets, fewer instances |
| Time | 4.0 s | 2.0 s |
| Kill-gate | Shatter, 151 bolts, physics solver, loot-chrome plates, warehouse, fused-swap pop, `createHologramShell` on 25 children. | Same. Draco miss: hold last 0A frame or snap to fused (assemble kill, not story kill). |

**Geometric law (probed):** shipped `hero-machine.glb` is **one node, one mesh, five primitives**. Islands are welded. You cannot hide a sled inside it. Act 1 static fused (`hero-machine-static.glb`) **omits** sled/footplate islands. Sled + footplate stay from parts. Plates stay instanced. One `createHologramShell` on the rest silhouette (static + sled + footplate + plates).

### 0C Legendary fly-in (short travel, not inspect)

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | **Camera stays at ESTABLISH.** The sticker flies from the gym into the lens (~0.32 m, filling the glass), holds a quarter-turn so foil, NFC coil under vinyl, and dual print read, then travels back to the beam. **One-shot mip-DOF** while it sits in the POV, **off** as it leaves. No camera punch-in. No dress-room orbit. No item frame. No price. | Same travel. Card flies closer along the same look until it fills the portrait width. No real DOF. |
| Does | Watch. Cursor orbit is extra, not required. | Watch. Tap card to skip remainder into 0D. |
| Product | This plate is the kit. | Same. |
| Teaches | G5, G6. | Same. |
| Technique | Unparent placard mesh. Pose is a pure function of seconds along the look vector from ESTABLISH. Foil = roughness 0.42 + grazing sheen, **not** emission ~1.0. NFC = second plane ~0.4 mm under vinyl. DOF = `composite.ts` uniforms `uDof` / `uFocusRect` using the mip chain already on `composer.renderTarget1`. `uDof = 0` before 0D. No permanent `BokehPass`. | Fill-as-commit. `uDof` stays 0. |
| File | `stick.ts`, `placard.ts`, `composite.ts`, `stage.ts` | Same, `uDof` stays 0 |
| Time | 2.4 s | 1.8 s |
| Kill-gate | Camera chase. WoW inspect. Lime lamp. DOF that stays on. 4 s slow turn as the postcard. Price/0€ on the card. Relight for bokeh. | Floating card that never sticks. |

**Screenshot law:** 0C is not the postcard. 0D is.

### 0D Physical stick (THE still)

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | Card presses onto `(0, 1.255, -0.372)`, tilt `-0.10`. Vinyl, air-out, stand-offs, millimetre blank behind rounded corners. Camera at establishing three-quarter. **Hold.** **Get LIFTAG** and **Partner** appear, equal craft. No protocol label: the picture is a machine with a tag on it, and a line of monospace reading `FLOOR · KIT · MAP` over it teaches nobody anything. | Short press. Hold on the planted plate, then the room settles. Same two doors, thumb zone. |
| Does | `Skip`, or scroll into the approach. | Same, thumbs. |
| Product | Gyms put this object on the floor. | Same. |
| Teaches | G5, G6, G10. Mute-15s owner read. G15 doors. | Same. |
| Technique | Analytic local-Z press. Air-out radial in `placard.ts` (~0.6 s). After plant, `uReveal/uResolve/uLock = 0`. `placard.ts` is the planted face for the rest of the film. **`act0CamAt` is constant**: the whole act is one locked-off shot, and a punch-in for the press was written and then cut - it is a move on the thing that is already the subject, which is the same argument 0C makes. The press is small; the shot is a machine being tagged, not a tag. | Same, shorter. |
| File | `placard.ts`, `stage.ts`, `GymScanHero.vue` overlay | Same |
| Time | 2.5 s (includes hold) | 2.0 s hold |
| Kill-gate | Pop-on decal. Hold that is still a floating card. Partner as a corner chip. Get `href="#"`. |

Mute 15s **ends here**. If they never scroll, they still saw a gym floor, a machine assemble, a kit applied to it, and two doors - without reading a word.

### 1A Approach, no QR lock

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | Live Hermite dolly, one move, 6.7 m to 1.6 m. Sticker already on, dim vinyl, scenery. Loaded horns from 0B. Empty floor into fog. **No** module resolve. The L-corners are already on the tag: they hunt the cursor through the 0D hold and acquire the plate inside the first fifth of the dolly, so the rest of the move is the code being carried in already framed, growing inside the brackets. The hologram cage idles under it and the cursor still reveals a patch of it, both retiring by mid-move. It ends **in the seat**, level with the plate, reading it square on. | Abbreviated same path. No graze. Portrait pull tapers to 1.00 by the end (a 22% pull would break the framing). Phone-fill spot on from here as a held phone, not as analysis. Coarse exposure **~1.10**. |
| Does | Scroll is the dolly. | Scroll is the dolly. |
| Product | You walk up to a loaded machine and there is a tag on it. | Same. |
| Teaches | Lifter approach. G9 residue. | Same. |
| Technique | `act1Cam.ts` owns the path; `stage.ts` owns only the schedule. `plateFramingAt` re-derives what the lens sees, and `tests/act1Cam.test.ts` holds the shot to its description rather than to six vectors. Lighting tables follow `camU`. `skipDrop` when `dollyU` past the old 0.16. | Compressed `cameraU`. `LG_LITE`. `mediump`. DPR 1.25 Class A / 1.0 Class B. |
| File | `act1Cam.ts`, `stage.ts` | Same |
| Budget | 2.4 svh / ~4 s | 1.2 svh / ~2 s |
| Kill-gate | A lock during the approach. Relight. Reverse to the horn. **Ending on a slant**: the last frame is the one the glass folds around, so the code has to arrive centred and square. |

**Why seated.** A standing end point was tried, on the argument that the seat only ever earned the lens because a hologram pressed one rep from it. Rendered, it was wrong: standing puts the eye above the plate and reads the tag at a downward slant, and this is the frame the glass folds around - the code has to already be where the phone's viewfinder will put it. Seated at `y = 1.255`, level with the plate, 1.23 m out, it arrives dead centre at 18% of frame height and 6 degrees off square. The seat is not a POV here; nobody is drawn in it. It is simply the height a phone reads this tag from.

### 1B QR lock (the only thing the approach was for)

| | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| Sees | The dolly is home. Module-by-module resolve on the plate. Dark modules stay dark. Emission print-coloured, threshold 0.50 linear, peak ~0.25. The brackets are already locked on from the top of the approach; they hold through this shot and into the fold, and fade out as the glass finishes forming - they are composited into the gym texture, so they ride the room onto the screen. **No HUD.** `phoneFill` legal here. | Same. |
| Does | Scroll completes it, and nothing else does. Hover-acquire is still live, as it is for the whole approach. | Same, on the shorter budget. |
| Product | Tap or scan. That is the whole interaction. | Same. |
| Teaches | G5, G6, G9. Lifter SCAN. | Same. |
| Technique | `PLACARD_*` and `reticleOverlay.render(..., lockU >= 0.72)` run on a local 0–1 that only exists in this shot. `statusFor` follows the same clock. The reticle does not: `reticleProgress()` maps all three shots onto its own clock so the corners span hunt → acquire → ride the fold. Compile both light-count programs in `load()`. | `lockToMachine` already true on coarse. Keep it. |
| File | `stage.ts`, `placard.ts`, `reticle.ts`, `reticleOverlay.ts` | Same |
| Budget | 1.0 svh / ~2 s | 0.5 svh / ~1 s |
| Kill-gate | Lime panel switched on. Halo the size of the tag. Game toast. **A status label**: a shot that has to print `SCANNING` is a shot that is not showing the scan. **A confirm gate**: a beat the visitor has to be told about in copy is not a silent film. |

### 1C The seam (both cuts)

This is the ending. It is five rules long, and none of them is a word on screen.

| | Rule | Why |
|---|---|---|
| 1 | **Match cut on the square.** The frame folds onto the phone's glass with the scanned plate pinned in place, so the square you were looking at *becomes* the screen. Starts on the frame the lock completes. | A cut between two shapes is an edit. A fade between two pictures is a transition, and a transition here reads as a slide deck. |
| 1b | **The app screen is a second cut, not a reveal.** `appScene` arms the frame the glass finishes forming (`fold >= 1`), so the last thing on the screen is the room with the scanned plate pinned to it, and the LIFTAG screen replaces it QR-on-QR. | Armed part-way through the curl it replaced the room mid-fold, which is a dissolve wearing a cut's clothes: you never see the code land on the glass it is supposed to be opening. |
| 2 | **Cut through black.** Two frames of full black as the glass reaches the hero's slot, before the landing hero plays its own entrance. | Armed by scroll position, released by a clock. A visitor inching the wheel through the seam must still get a cut, not a black screen they are dragging. |
| 3 | **Arrive, don't coast.** The travel is ease-out quart on position, ease-out cubic on scale, so the device lands and shrinks into the slot rather than gliding across the screen. | `heroTravelEase` / `heroScaleEase` in `handoff.ts`. Already written, already tested. |
| 4 | **Nothing dissolves at a seam.** Room chrome - HUD, lock label, logo, doors - is gone on the fold frame with `transition: none`. | A protocol label fading out over the landing hero is exactly the dissolve rules 1–3 exist to avoid. |

Phone folds too. It was going to blit the last frame and kill WebGL at the lock, which left the film with nothing to hand over: it would have had to *change the page* instead of cutting to it. The nested-phone objection was about using a bezel as a **form** - a 156×321 park cannot take 48 px thumbs. It is not an objection to a bezel that exists for 0.4 svh and then becomes the hero's own device.

**Technique.** `composite.ts` cover remap + `phoneOverlay.ts`, `foldSentence` forms and holds (it used to re-open onto the room), `phoneOverlay.setHeroMix(morph)`, `travelPhoneBox(park, slot, morph)`. The slot is the landing hero's real front-phone box, measured through `Hero.getFrontPhoneEl()` and converted by `heroBodyTargetFromPhoneBox`; `fallbackHeroSlot` stands in for the frame before that measurement lands, so the travel starts on time instead of snapping to catch up. `heroMounted` at `scene > 0.55` so the hydrate is not paid for on the frame the glass starts flying.

**Kill-gate.** A dissolve. A fade-to-white. A dead beat between the lock and the hero. A second set of CTAs in the fog. Any sentence of copy.

### After the seam: the site

`/gym-scan` continues as the landing page - `PartnerMarquee`, `ScanSection`, `HowItWorks`, `LiftersSection`, `ProgressSection`, `AppMergeSection`, `GymsSection`, `DashboardSection`, `TrainersSection`, `Roadmap`, `HomeFaq`, `FinalCta`, `SiteFooter`. `SiteNav` is mounted from the start and held off until the handoff fires, so first paint is still a dark gym rather than a page with a menu on it.

The previous cut called this a dump and built a bespoke chapter instead: a working HTML log, a setup-video header with an ours/yours toggle, a map pin, dashboard words, a traveler line, a second pair of CTAs. That chapter was the single densest surface on the URL and it arrived at the exact moment the film had stopped needing words.

**Every job it did already exists downstream.** The log is `HowItWorks` and `ProgressSection`. The videos are `ScanSection` and the catalog player. The map, the kit and the partner pitch are `GymsSection`. The dashboard is `DashboardSection`. The trainers are `TrainersSection`. Writing a second, worse copy of all of it in a fog grade is not craft, and a juror who scrolls past the seam does not find a brochure - they find the product site, which is the honest thing behind the film.

What the film owes the visitor by the time it cuts: a gym floor, a machine, a kit applied to it, and a tag that resolves. Everything after that is the site's job.

---

## 3. Approach grammar

The film has one subject: a machine with a tag on it. The lens never becomes a person, and no person is drawn.

- Camera ends at `(0.02, 1.255, 0.86)`, level with the plate and inside the machine's own length - the height a phone is held at to read this tag.
- LookAt is the plate itself, `(0, 1.255, -0.372)`, so the code lands dead centre. This is the frame the glass folds around, and a code that is not already centred has nowhere to be pinned.
- At that station the plate reads at 18% of frame height, 1.23 m away, 6 degrees off square, and incidence falls monotonically the whole way in.
- No legs. No torso. No hologram athlete, sparse or otherwise. The first-person POV existed to carry one rep and died with it; the station survives it, because that is where the tag is read from - the lens sits there, nobody does.
- The QR is unresolved scenery for the whole approach and resolves only in its own shot.
- Nothing is drawn on the machine at any point. The analysis layer, the scan plane and the contour slices are all long gone: the scan reads on the plate and in the HUD.

Reduced motion: a still of the assembled machine with the sticker on it, then the site directly beneath.

---

## 4. Gym-advantage map

None dropped. None as a card grid, and none rewritten into the film. **The film teaches the four things only a film can teach; the site teaches the rest, in the sections that already exist.** That split is the point of the recut: a second, worse copy of `GymsSection` rendered in a fog grade is not craft.

| ID | Taught by | Where | Note |
|---|---|---|---|
| G5 Physical kit | **The film** | 0C travel + 0D stick | World-space card, then vinyl press. This is the shot nothing else can do. |
| G6 NFC + QR | **The film** | 0C face, read at the end of the approach | Coil under vinyl, readable on the card. |
| G9 Machine catalog | **The film** | 0A–0B + the lock naming `PIVOT LEG PRESS` | One footprint, one hero, one exact lift. |
| G10 Member onboarding | **The film** | The approach and the tap | The visitor scanning the plate *is* the desk demo. Ten seconds, no words. |
| G1 Map | The site | `GymsSection` | Already has the map story and the partner CTA. |
| G2 Gym detail | The site | `GymsSection` | Same. |
| G3 Video, ours | The site | `ScanSection`, catalog player | Real player, real footage, correct lift labels. |
| G4 Video, yours | The site | `TrainersSection` | The ours/yours upgrade is a trainer story, not a scan story. |
| G7 Core gym software | The site | `GymsSection` + `DashboardSection` | |
| G8 Not a comparison | **Absence** | Nowhere | No cost line, no matrix, on the film or the page. |
| G11 Serious member app | The site | `ProgressSection`, `HowItWorks` | PRs, 1RM, volume, RPE, rest, history. |
| G12 Works without tags | The site | `LiftersSection` | One row, not a card. |
| G13 Dashboard + 1→12 | The site | `DashboardSection` | Real footage, real dashboard. No laptop mesh on the mat. |
| G14 Trainers in the loop | The site | `TrainersSection` | |
| G15 Partner door | **Both** | 0D hold, then `FinalCta` / `GymsSection` | Equal to Get during the hold; the site carries it after. |

Mute 15s owner: 0A floor, 0B machine, 0C/0D kit, both doors on the hold. They can say "this is for my floor" without reading anything.
Mute 90s owner: plus the tag resolving under the brackets, the cut - and then the product site, which is where an owner who is still watching at 90 seconds should be.

**Honesty carries across the seam.** No free-kit claim, no `0€`, no invented user counts - on the film or on the sections it hands to. `/contact/partner` is still a door-break until its free-kit lead is stripped (§8).

---

## 5. Video grammar

**No video plays inside the film.** The setup-video header was the second-densest thing in the deleted chapter and it belonged to a beat that no longer exists.

Video is the site's job, and the site already does it: `ScanSection` carries the scan-flow clip, `DashboardSection` carries the dashboard footage, and the catalog player carries the per-exercise guides. Rules that still bind, wherever a clip plays:

1. Ours first. `LIFTAG GUIDE` on day one; a trainer's own footage is an upgrade, never the launch condition.
2. Never autoplay with sound. The juror is mute at 15 seconds.
3. The footage must match the lift it is labelled with. A scan-flow bench captioned as a Pivot Leg Press is worse than no clip.
4. Encode AV1 + H.264, `playsinline`, and `-movflags +faststart` so the atom order reads `ftyp moov … mdat`. Without it WebKit range-requests the tail before it can decode a frame; that is what used to freeze the ScanSection slice on iPhone.

Banned: a video header stapled to the end of the film. "Film before launch" as a partner requirement.

---

## 6. Wow inventory

**Must-ship** (not in the cut column):

1. 0A one hologram sweep (cage + shockwave), then die
2. 0B part-assemble + iron plates on horns + fused swap
3. 0C short legendary fly-in + desktop DOF **blink** then off
4. 0D physical stick (the still)
5. One monotonic approach that ends square on a readable tag
6. Module-by-module QR lock under the settling brackets
7. **The match cut**: the scanned square becomes the phone's glass
8. **The morph**: that glass flies into the landing hero's own device, through two frames of black
9. Dual CTA Get / Partner on the 0D hold, equal craft

Nine beats. The previous list had twelve and four of them were UI.

**Later**

- One dim far neighbour cage after 0B, retired before 0C
- Dual-device real QR easter egg
- MacBook mesh in this fog (only if it does not read as a second location)
- `/` promotion

**Cut**

- **A chapter after the lock.** HTML log, setup-video header, map pane, dashboard words, traveler line, second CTA pair. All of it.
- **The seated rep.** Hologram legs, `press.ts`, the movable sled travel, POV limbs of any density.
- Any copy written after the scan
- `SCAN. LIFT. TRACK.` as a payoff headline
- A dissolve, a fade-to-white, or a held beat at the seam
- Nested 289 px (desktop) or 156 px (phone) surface used as a **form**
- HowItWorks theatre log leaking into the film
- GymsSection card grid restyled in the fog, 0€, FREE KIT, thousands
- Comparison table
- 0C dress-room orbit as the postcard
- Looping 0A shockwave as first paint
- Persistent wire mat past 0B
- Lime on metal, lime floor slab
- WoW loot UI
- Lando droplets / metaballs / Effect 025
- 3D hands pulling a phone out of shorts
- Fused-mesh shatter / 151 bolts / physics solver
- Pack corridor that stays
- DOF that stays on
- WebXR as the door
- GSAP / Lenis / second renderer / WebGPU
- Laptop on the mat
- Invented user counts
- Class C "tap for film" as the only Act 0

**Not cut, restored on purpose:** the landing page after the act. It was on this list as "homepage dump". It is the ending now - see §1 and "After the seam".

---

## 7. Interaction spec

The whole film has three controls. That is the target, not a shortfall.

| Control | Spec |
|---|---|
| **Scroll** | The dolly, the lock, the fold and the morph. One continuous input from the top of the page to the landing hero. |
| **Skip** | On screen from 800 ms, lower half, both cuts. Keyboard `S`. Snaps Act 0 to its hold; scroll still owns everything after it. It is not a door out of the page. |
| **Acquire the plate early** | Hover it. The brackets latch onto the tag ahead of the scroll. Optional on both cuts; nothing waits for it. |

Nothing else is interactive while the film is running. The doors (`Get LIFTAG`, `Partner`) appear on the 0D hold and retire when the visitor scrolls; the room's chrome is `pointer-events: none`.

**After the seam** the visitor is on the site, and the site's own interaction rules apply. Tab order is the landing page's tab order. `Escape` does nothing special. There is no rest timer, no stepper, no map pin and no second CTA pair to reach, because none of those are on this URL any more.

**Thumb (phone).** Skip chip at `bottom: calc(16px + var(--liftag-safe-bottom))`. Get and Partner 48 px, 50% width each, same type, both in the lower half. There is no plate tap: a confirm gate that has to be explained in copy is not something this cut can afford, and one that is not explained is a film that has stopped for no visible reason.

**Perf.** The canvas survives the seam as the hero's front device, so it can no longer be stopped on a progress threshold. It parks on visibility instead - an `IntersectionObserver` on the section stops the loop once the hero is scrolled past, and restarts it on the way back up.

**Context budget.** That surviving renderer shares the sticky with the landing hero's particle field and its two flanking `Phone3D` scenes, so the seam is the densest point on the site for live WebGL contexts. `HeroParticles` used to treat a lost context as terminal - its only reset was the out-of-view branch of its own observer, which a hero pinned inside this sticky never reaches, so one loss froze the field and its warped grid on the last painted frame for as long as the visitor stayed. It now re-inits on a bounded timer (two attempts, 1.5 s apart) and resets that budget when it does leave the viewport. Anything else mounted into this sticky has to be counted against the same budget.

**HowItWorks must not leak** into the film: scrub 0→85 / 0→9, `handleLogSet` gated on 85×9, placeholder PR, Bench Press, three-panel SCAN/TRACK/PROGRESS. It is a good section, downstream, in its own grade.

**scanApp.ts:** the QR-to-glass morph only, then the glass travels. It is not a UI.

---

## 8. URL object

**`/gym-scan` is one scroll: a film, a cut, and the site.**

Contains:

- The 3D act - Act 0 timed, then scroll-owned approach → lock → fold → morph
- In-room chrome only: `SCROLL`, the lock HUD, `Skip`, and the two doors on the 0D hold
- Reduced-motion and Class C: a designed still, then the site directly beneath
- `layout: false`, so marketing nav does not own first paint
- The landing sections, lazily hydrated below the fold, exactly as `/` composes them

**`/gym-scan` DOES hydrate the landing page.** This reverses the previous cut, which forbade it. The Lazy* mounts stay in `pages/gym-scan.vue`: `PartnerMarquee`, `ScanSection`, `HowItWorks`, `LiftersSection`, `ProgressSection`, `AppMergeSection`, `GymsSection`, `DashboardSection`, `TrainersSection`, `Roadmap`, `HomeFaq`, `FinalCta`, `SiteFooter`.

The old prohibition existed to stop a 3D trailer being glued to a brochure. The answer to that is not to rebuild the brochure in a fog grade - it is to make the join an *edit*, so the film ends on a cut into the product rather than trailing off into it. See §"The seam". A juror who scrolls past the cut should land on the real site; that is the honest thing behind the film, and it is a better page than the chapter that replaced it.

**Nav.** `SiteNav` is mounted from first paint but held invisible until the handoff fires, so 0A–the lock still play in a dark room. It appears with the hero, as part of the cut.

**Doors.** During the 0D hold: Get LIFTAG → `/get` (keep `GetAppBtn` device-aware craft; desktop `/get` is the QR-to-phone handoff), Partner → `/contact/partner`. Both real hrefs, equal type, equal height. No `href="#"`. No label `For gyms`. After the seam the site's own CTAs take over; the film does not add a second pair.

**Replace `/` later, not this month.** `/` still has `0+`, card grids, and SEO nav. Promoting this object to `/` is a later juror-graph problem (`docs/awards-competitiveness-plan.md` W5).

**If they open `/contact/partner`**

Live page is a door-break: lead and SEO still say "free QR + NFC kit." Same `ContactPage` as support. Success "Back to home" dumps them onto `/`.

Required this month (awards graph + conversion):

- Strip every free/price claim from lead, SEO title, SEO description.
- Keep "Put your gym on the map."
- Form prompts for gym, city, floor. Locked subject may stay `Gym partnership inquiry`.
- Success stays, or returns to `/gym-scan`, not `/`.
- Real submit (Turnstile fine). No `comingSoon`.
- Partner control on `/gym-scan` must be the gym-side twin of `GetAppBtn`: same height, same type, no store marks, no "Apply for the free kit."

---

## 9. Desktop vs phone

Not enrichment vs degrade. Two cuts, and they now end the same way.

| Beat | FROM THE FLOOR | FROM THE SEAT |
|---|---|---|
| 0A | One hologram sweep (cage + shockwave), camera still | Same pass, cheaper rings, PBR on |
| 0B | 6–8 groups, 2–4 plates/horn | Hero only, two plates |
| 0C | Card flies into ESTABLISH POV, DOF on hold, then off | Same travel, no real DOF |
| 0D | Stick + hold, both doors | Stick + hold, both doors, thumb |
| 1A Approach | Full Hermite, ends square on the plate, brackets locked from the top, cage idle + cursor reveal | Abbreviated, distance pull tapers to 1.00 |
| 1B Lock | Module lock under the settling brackets, hover-acquire | Same, shorter |
| 1C Seam | Match cut → fold → black → hero slot | **Same** |
| Sticky | 6 svh (4.2 act + 0.8 tail) | 3.5 svh (2.1 act + 0.4 tail) |
| After | The landing page | The landing page |
| Low-end | Keep WebGL | Class C: 0D still, then the site |
| Free kit | Never | Never |

**The phone folds too.** The previous cut blitted the last frame at the lock and disposed WebGL, which left the film with nothing to hand over - it would have had to change the page instead of cutting to it. The nested-phone objection was always about using a bezel as a *form*: at 390 a 156×321 park cannot take 48 px thumbs, and no form is asked for any more. A bezel that exists for 0.4 svh and then becomes the hero's own device is a shot, not a UI.

Cost of that decision: the phone pays for the fold instead of a blit. The fold is a cheap phase - the room is already graded into the composer target and the glass renders from it - but it is not free, and it is what the Class B/C gate now protects.

**Device classes (phone)**

| Class | Detect | 3D | Through the seam |
|---|---|---|---|
| A high-end | WebGL2, maxTex ≥4096, no Save-Data | Full film. DPR 1.25. No bloom/shadow/MSAA. Exposure ~1.10 | Fold + morph |
| B mid | WebGL2, not A | Cheaper: 4 groups, no cage after 0A, Lambert floor after 0B, DPR 1.0 | Fold + morph |
| C low-end | no WebGL2, Save-Data, compile fail, or first-30-frame p99 >33 ms | **Do not start the stage.** LCP is the 0D still | No seam. The site sits directly under the still |

Kill-gate demotes A→B→C. Never restart a dead stage. `hardwareConcurrency <= 4` is **not** a Class C gate by itself (it would eat real iPhones).

**Tablet:** `(pointer: coarse) and (hover: none) and (min-width: 768px)` = SEAT CROP. `(pointer: fine)` any width = FROM THE FLOOR. Cut selection is a device contract, not a width guess.

---

## 10. Build order (~1 month SOTD slice)

Integrity first, every week: no GSAP, no free-kit copy, no copy after the scan, `pnpm verify` before any "done."

**Week 1 — parts bet** (`blender-web-pipeline`, `threejs-loaders`, `threejs-animation`, `three-best-practices` draw-call/mobile/dispose only)

- `tools/gym3d/export_hero_parts.py`. Copy rest-pose contract from `export_hero.py` (XY centre, base Z=0, Z −90°, LIFTAG materials, planar 2.5°, no collapse decimate on parts).
- Parent `<50` vert islands onto nearest ≥200. Groups: `frame`, `pads`, `footplate`, `sled`, `horns`, `hardware`.
- Also write `hero-machine-static.glb` (no sled/footplate).
- Plate mesh from `3.002` or cylinder. `InstancedMesh`.
- Prototype in `stage.ts`: frame plants, pads lock, two plates slide, rest-pose swap. Sled exported even if it does not travel yet.
- Diagnostics: per-island JSON, aabb vs hero < 2 mm, horn axis, `renderer.info.render.calls` at explode vs planted.
- Fail the exporter if assembled aabb drifts > 2 mm.

**Week 2 — birth** (`threejs-postprocessing`, `threejs-shaders`, `threejs-materials`)

- 0A one hologram sweep (same `hologram.ts` pass as the idle). Lime only on the front. Steps aside for 0C/0D, comes back as the periodic idle under the approach, retires by mid-move.
- 0C card flies into ESTABLISH POV. Mip DOF while it sits in the lens, then `uDof = 0`. Foil without emission ~1.0; the travelling liner highlight is weighted by depth into the roll, or a curled sheet returns one shine per winding and reads as several sheets. NFC plane, neutral substrate under a bronze coil. Camera does not punch in - **and neither does 0D**.
- 0D press onto mount. Hold. Overlay: `Skip` and both doors.
- Sticker artwork: TAP/SCAN + NFC under vinyl. Live `SCAN · TRAIN · TRACK` is QR-only and fails G6.

**Week 3 — the ending** (`threejs-interaction`, `threejs-shaders`, `vue-best-practices`, `nuxt`)

- Delete the rep: `legs.ts`, `press.ts`, the `press` shot, `partsRig.setPress`. `act1.ts` becomes approach → lock → fold.
- Move the path into `act1Cam.ts` and pin the framing with `plateFramingAt` so the shot is held to its description, not to six vectors. The end station stays where the film shipped it - level with the plate, square on - after a standing recut was tried and rejected on a rendered frame. `KEY_SIZE` / `KEY_LEVEL` still retire to nothing: the shot ends inside the machine and the phone's own fill takes the screen a beat later.
- Split the lock onto its own local clock. Confirm-to-resolve on both cuts.
- The seam: `foldSentence` forms and holds, `SCENE_END = 0.84`, `setHeroSlot`, `travelPhoneBox`, `setHeroMix`, the black cut frame, chrome hard-cut with `transition: none`.

**Week 4 — the site under it** (`impeccable`, `web-design-guidelines`, `accessibility`, `review-animations`)

- Restore the landing composition in `pages/gym-scan.vue` with `SiteNav deferred`. Delete `components/gymscan/` - log, gym pane, setup header, post-lock.
- Park the canvas on visibility so the marketing sections below are not paying for a hidden renderer.
- Strip Partner free-kit copy.
- Verify: 1440×900 DPR 1.5 **and** WebKit 390 and 430, `pointer: coarse`, `hover: none`. Reduced-motion path. Class C forced. Atom-dump every video: `ftyp moov` before `mdat`.
- Watch the seam at three scroll speeds - flick, steady, and a slow inch through it. The cut has to survive all three, which is why the black frame is armed by position and released by a clock.

Skills live in `.agents/skills/`. Do not install GSAP, Lenis, TresJS, R3F, motion-v, Nuxt UI, particles, or `awwwards-animations`.

---

## 11. Risks

**Geometric**

- **Where the move stops.** The last frame of the approach is the frame the glass folds around, so it is a geometric requirement, not a taste call: the plate centred, square, and at reading size. `tests/act1Cam.test.ts` re-derives all three from the path with `plateFramingAt`, and also holds incidence monotonic - a rise means the dolly is arcing off the plate's normal at the moment it is meant to be reading it.
- **Ending on upholstery.** The failure mode of a close seated approach is that the last frame is a metre of vinyl rather than the tag. The plate at 18% of frame height, dead centre, is what rules that out.
- Fused swap pop: plant parts to identity, wait one frame, toggle. Shared `HERO_MATERIALS`. If aabb fails, freeze parts and skip static fused; lighting identity > a second GLB.
- The carriage group survives the rep's deletion because `hero-machine-static.glb` omits the sled and footplate islands. It groups them; it no longer moves them. Deleting it drops two islands off the machine after the swap.

**Perf**

- Worst frame 17.7 ms, fragment-bound, DPR cap 1.5. Do not raise DPR.
- 0B risk is draw calls + overdraw during explode, not tris. Budget ≤40 submits. Hide a group the frame it plants. If p99 > 20 ms: merge groups, cut plates, skip neighbours.
- 0C: mip lod in the existing composite. `BokehPass` only if stills fail **and** p99 still < 20 ms, enabled for 0C only, then disposed.
- **The phone now pays for the fold** rather than blitting out at the lock. The room stops rendering once the app screen has taken the glass over, so the expensive stretch is the fold itself. If Class A p99 breaks there, demote to B before shortening the fold - the fold is the cut.
- **The canvas outlives the film.** It is the hero's front device, so it cannot be stopped on a progress threshold. Without the visibility observer, every marketing section below is scrolled over a live WebGL loop.

**Seam**

- **Reading as a dissolve.** Any opacity transition surviving across the fold frame undoes rules 1–4. Chrome is `transition: none`.
- **The slow scroll.** A black frame gated purely on scroll position becomes a black screen the visitor is dragging. Arm on position, release on a clock.
- **The unmeasured slot.** If `getFrontPhoneEl()` has not laid out when the tail starts, the glass travels to a fallback box and then snaps when the real one arrives. Mount the hero at `scene > 0.55` and let `fallbackHeroSlot` carry the first frames.
- **A dead beat.** If the fold finishes and the morph has not started, the visitor sits looking at a phone in the middle of a black frame. `SCENE_END` and the fold window have to abut.

**Awards**

- 0C inspect is the most dangerous beloved shot. Short travel. 0D is the postcard.
- Looping 0A on phone reads as Effect 025 in a cousin palette. One pass, then iron.
- WoW UI, Lando fluids, QR lock on the way in: still illegal.
- Lime `#CCFF00` vs Lando `#D2FF00`: steal ambition, not the signature.
- **The join is now the judged moment.** A film that cuts into a real product site is stronger than one that trails into a bespoke chapter - but only if it is a cut. Done badly it is the "3D trailer glued to a landing page" the previous cut was written to avoid.

**Narrative**

- Warehouse after 0B: neighbours off month one.
- Sticker pop-on: millimetre blank + stand-offs + air-out are load-bearing.
- Holodeck: 0A dies after 0B. Nothing holographic exists after it.
- **Silence has to be legible.** With no copy after the scan, the film carries its whole argument in pictures. If a mute viewer cannot say "a machine got a tag and the tag opened the app", the recut has failed and no amount of HUD text will rescue it.

**Conversion**

- A gym owner reads this as a consumer app site if mute-15s is a lifter reel and Partner is a chip. Hold 0D. Equal doors.
- `/contact/partner` free-kit lead undoes the honesty of the film.
- The site under the seam has to be worth landing on: `0+`, card grids and invented counts are now *inside* the judged scroll, not on a different URL.

**Mobile**

- 9 svh hostage. A secret key as the only skip. A bezel used as a form. Class C with Act 0 deleted. All recut above.

---

## 12. Subagent log

Spawned seven independent specialists, then one fresh adversarial critic. I did not concatenate them. I directed.

| Agent | Took | Rejected |
|---|---|---|
| **Awwwards juror** (`plan`) | Live is ~4.6, unsubmittable. 0C-as-inspect is the wrong postcard once loot costume creeps in. Dead `#` CTAs. Partner page is on the graph. Phone ~4 if 9 svh + brochure. LOG is the score. | Submitting live. `SCAN. LIFT. TRACK.` as payoff. Averaging with “keep the dump but nicer.” |
| **Lighting guardian** | Law card. 0A extends shockwave, not a new sim. DOF is composite, one shot, then off. Legs offset off vinyl, cool white. Neighbours retire. Coarse compensation is exposure, not lime. Cage `visible=false` is not a perf piggy bank. | Lime shin during 1B (wow cinematographer wanted it). Relight for 1B. Restoring cursor point light. Permanent BokehPass. |
| **Wow cinematographer** | Desktop shot grammar. World-space card. Fold then yield because 289 px cannot log. Keyboard path. Must-ship list. Skip-to-log. Neighbours off month one. | 15 svh sticky. 4 s 0C inspect as the poster. Act 0 scroll-scrub *and* autoplay (two directors). Nested fold as a 2.5 s photograph. |
| **Phone cinematographer** | Named FROM THE SEAT. 1D skip. Blit-and-kill. Device classes. Thumb 48 px. Skip-to-gyms. SEAT CROP. PBR floor off in 0A. `gym-scan-flow` is not the phone log. WebKit verification list. | 4.8 svh of *scroll-tied* Act 0 (became a timed prologue). Class C tap-to-play as the only Act 0. `hardwareConcurrency <= 4` as a Class C gate. |
| **Feasibility** (`senior-software-engineer`) | **Shipped GLB is one welded mesh; static fused must omit sled/footplate.** Exporter spec. `dollyU` vs placard split. Mip DOF vs BokehPass budget. Week map. Settled vs still-to-run probes. Sticky math from `handoff.ts`. | Physics solver, shatter, WebGPU, raising DPR, mounting `CatalogVideoPlayer` inside WebGL, disposing parts mid-film for frame time. |
| **Lifter product** | Real log spec. Empty fields. HowItWorks leak list. G4 must not gate the lifter. Skip-to-log. Get → `/get`. Copy deck. | G4 hidden until after first LOG (owner skip-to-gyms would miss it). Weight starting at a “plausible” fake working set. |
| **Gym-owner product** | G1–G15 map with live holes. Honesty: steal map/videos/NFC/dashboard/1→12, leave free kit / thousands / matrix. Partner page rewrite. Mute 15s cannot open on `FOR LIFTERS`. NFC must read on the 0C face. | GymsSection grid restyled in the fog. G4 as launch. Corner-chip Partner as the gym door (critic agreed). |
| **Adversarial critic** (fresh, no A/B/C) | Fatal: 0C inspect as postcard; looping 0A on phone; hologram stack into 1B; mute 15s without doors; 90s as lifter-only; 10 svh + secret `L`; Class C deleting Act 0. Recut once. | Deleting 0C fly-in, deleting desktop DOF, deleting 1D fold, deleting 1B legs. Those recut, they do not die. Fold stays a 1.2 s sentence. DOF stays a blink. Fly-in stays short travel. |

**Director picks that are not an average**

- Postcard is **0D**, not 0C. 0C remains a short legendary travel with a DOF blink.
- Act 0 is **timed**, then hold. Scroll starts at the approach. Two clocks, one director.
- Sticky **6 svh desktop / 3.5 svh phone**, `Skip` on screen from 800 ms.
- Partner equals Get from the 0D hold.
- Static fused omits sled. Feasibility wins over the brief’s “show hero-machine.glb and keep the sled” sentence, because that sentence is geometrically false.

### Second recut (owner call, after the panel)

The panel above argued itself into two things it should not have: a hologram athlete pressing one rep in the middle of a one-sentence film, and a chapter of HTML written to avoid landing on the site. The owner cut both.

- **No rep.** Everything the panel defended about 1B - sparse limbs, cool white, no torso, no relight - is moot, not compromised. The seated *station* survives the rep it was written for, because it is also simply where this tag is read from; nobody is drawn in it.
- **No chapter.** The log, the video header, the map pane and the dashboard words all exist downstream already, in sections built for them. The film ends on a match cut into that site.
- **The phone folds.** The phone cinematographer's blit-and-kill was right for an ending that stayed in the room and wrong for one that hands a device to the hero.
- **The "homepage dump" is the ending.** The juror and the critic were both right that a trailer trailing off into a brochure loses. They concluded "build a better brochure". The owner's answer is to make the join an edit instead.

What survived every pass unchanged: Act 0 in full, the delayed lock, 0D as the postcard, the honesty rules, and the ban on GSAP, loot UI and free-kit copy.

---

## Copy lock (user-facing)

The complete word list for the film. Four items, three of them one word. It got shorter when the lock's status label went: a shot that has to print `SCANNING` is a shot that is not showing the scan.

`SCROLL` · `Skip` · `Get LIFTAG` · `Partner`

Everything else the URL says is said by the landing sections after the cut, in their own voice, where it has always been said.

Never: any new sentence after the scan · `SCAN. LIFT. TRACK.` as a payoff · `FLOOR · KIT · MAP` or any other protocol label that teaches nothing · `For gyms` · `NEW PR! +5kg` · `Last session:` on first paint · thousands of nearby lifters · free kit / 0€ / shipped free · Coming soon · Seated Leg Press if the plate says Pivot.

---

## First command tomorrow

```bash
blender -b all+fitness.blend -P tools/gym3d/export_hero_parts.py
# keep: blender -b all+fitness.blend -P tools/gym3d/export_hero.py -- 1.0
```

First prototype that proves the bet: frame plants, pads lock, two plates slide on, rest-pose swap, sled still a group. If that swap pops, freeze parts and skip the static fused. Do not wait for 25 islands. Do not wait for a loot inspect.

Then the only question that matters: watch the film mute, once, and say out loud what happened. If it is not "a machine got a tag, and the tag opened the app", nothing after the lock can fix it.
