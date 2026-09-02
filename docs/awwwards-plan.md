# Awwwards plan — desktop `/gym-scan` orchestrator brief

Status: working brief for a director/orchestrator run, not a commitment to submit.
Audience: a fresh orchestrator (and any specialists it spawns) about to decide the desktop Site of the Day cut of `/gym-scan`.
Date: 2026-09-02.

This is the prompt. Paste it into a new session, or spawn a `general-purpose` agent with it as the task. The orchestrator may spawn as many subagents as it wants if that improves the output.

Related: `docs/awards-competitiveness-plan.md` (site-wide awards ladder, integrity, juror graph). `docs/gym-scan-hero/README.md` (what the 3D act already is). This file is the **desktop wow** brief for the gym-scan object. It does not replace the site-wide plan.

---

# ROLE

You are the orchestrator for LIFTAG `/gym-scan`. You do not implement production code in this run unless a tiny throwaway probe is the only way to settle a fact. You DIRECT. You spawn specialists. You return one buildable director’s cut for a **desktop Awwwards Site of the Day** submission.

You did not write the plans below. Do not rubber-stamp any of them. Do not please the authors. The user has now overridden earlier “phone is master” advice: **desktop wow first**. Encode phone as a second cut so we do not paint into a corner, but do not let iPhone fill-rate kill a shot that wins on a 1440×900 fine-pointer jury machine.

You MAY spawn as many subagents as you want, in series or in parallel, of any available type, if it improves the output. Prefer more independent specialists over one long monologue. You MUST independently review their work; never concatenate fan-out as the answer.

# MISSION

Craft the strongest possible **desktop** experience at `https://liftag.fit/gym-scan` (or the production URL that replaces it) such that:

1. A juror on a 27" display, mute, 15 seconds, says this is not a SaaS landing page.
2. A juror who stays 90 seconds does a job (logs a set) and would screenshot one moment unprompted.
3. The URL feels like **one designed object**, not a 3D trailer glued to `index.vue`.
4. The 3D language already paid for in `docs/gym-scan-hero/README.md` is the film stock. Wow is directed continuation of THAT room, not a second renderer, not Lando Norris in a gym, not a warehouse of CAD.

Awwwards weights: Design 40 / Usability 30 / Creativity 20 / Content 10. 2026 SOTDs are full of Three.js scroll films. Spectacle with no job is a ~7. Distinctive lighting + a verb + one object is how you clear 8.

Success is a shot list + wow inventory + implementation sequence a senior engineer can start tomorrow. Not a moodboard.

# USER PRIORITY (this run)

- **Desktop Awwwards first.** Viewport: ~1440×900, `pointer: fine`, WebGL on, DPR cap 1.5 as now.
- **Wow effects are required**, not optional chrome. Every wow beat must still *mean* a product sentence (scan, setup, log, rest, session, coach). Cool that does not teach LIFTAG is a reject.
- Phone/coarse is a **designed later cut** of the same story. Note what degrades. Do not design the desktop film as a phone page that happens to be large.
- Do not submit `/` with SEO nav, `0+` stats, or card grids. This work is the `/gym-scan` object (promote to `/` only if the plan says so as a later phase).

# GROUND IN THE REPO (do not bluff)

Read before you conclude. Spawn readers in parallel if useful.

Must-read:

- `docs/gym-scan-hero/README.md` (sequence, lighting laws, killed techniques, perf numbers, known gaps)
- `docs/awards-competitiveness-plan.md`
- `PRODUCT.md`
- `new_app/pages/gym-scan.vue`
- `new_app/components/GymScanHero.vue`
- `new_app/utils/gymscan/stage.ts`
- `new_app/utils/gymscan/hologram.ts`
- `new_app/utils/gymscan/drop.ts`
- `new_app/utils/gymscan/handoff.ts`
- `new_app/utils/gymscan/composite.ts`
- `new_app/utils/gymscan/machineMaterial.ts`
- `new_app/utils/gymscan/placard.ts`
- `new_app/utils/gymscan/scanApp.ts`
- stills in `docs/gym-scan-hero/*.jpg`

Skim as needed: `HowItWorks.vue` (log theatre, not a real log), `Macbook3D.vue` / `DashboardSection.vue`, `tools/gym3d/export_hero.py`, `export_props.py`, `new_app/public/assets/gym3d/`.

If the dev server is up, look at `/gym-scan`. If not, stills + code are enough; do not block on running the app unless a probe is decisive.

# WHAT ALREADY SHIPS (use, do not rediscover)

Live `/gym-scan` 3D act, 60fps at 1440×900 DPR 1.5, worst frame ~17.7 ms, fragment-bound, mean luminance ~8.3:

| Beat | Scroll (approx) |
|---|---|
| Near-black room, silhouette, wire exoskeleton sweep every 4.4s | 0–15% |
| Cursor-driven grazing reveal | 15–30% |
| Approach, HUD, sweep retires | 30–48% |
| QR plate resolves module by module | 48–60% |
| Seated eye point, facing the placard | 60–72% |
| Frame folds into a phone-shaped rect (cover remap, not squash) | 72–86% |
| Phone parks right, headline/CTA, then **dumps into Hero + marketing sections** | 86–100% |

Then `gym-scan.vue` hydrates the normal landing: PartnerMarquee, ScanSection, HowItWorks, Lifters, Progress, Merge, Gyms, Dashboard, Trainers, Roadmap, FAQ, footer. That dump is the awards fail.

Camera: **one** monotonic dolly, 6.5 m → ~1.2 m seated eye. Path is Hermite; `cameraU` is one smoothstep. Velocity is zero only at start and end. End camera ≈ `(0.02, 1.255, 0.86)` looking at plate ≈ `(0, 1.255, -0.372)`. The seated camera **is the head**. Seat pad and weight horns are under/behind that eye. Portrait already backs the camera off; a reverse to show the horn is a phase change.

Hero GLB: seated leg press pack mesh `3.003`, 24,551 tris, 308 KB Draco, no UVs, procedural PBR (dust, grime, mesoscale bump). QR is real LIFTAG sticker artwork. Hologram is a 5% larger outline shell + floor shockwave when the sweep hits the mat (`hologram.ts`). `drop.ts` is a 3.8 m theatrical drop timed to first peel; **stage skips the drop once scene progress > 0.16** because an airborne machine under a dolly is a different shot. Sticky section is `GYM_SCAN_STICKY_SVH = 9`; 3D act is `SCENE_END = 0.845`.

HowItWorks “LOG” is theatre: numbers scrub to 85×9 and the button no-ops unless they land. Do not call that interaction.

Color law: lime names the product (print + reticle corners only). Everything that measures is cool white. Effects on the machine body read as lamps and were deleted. A filled hologram on the seat reads as fog.

# NON-NEGOTIABLES

1. One world. No smash-cut to a home office, apartment, or second lighting setup. Coach, if any, enters THIS fog/grade or exists as data on the phone/HUD.
2. The machine stays a used, dusty, planted object. Do not IKEA-assemble it. Dust vs a 3.8 m birth-drop are contradictory if both claim “always been here.”
3. Lime never lights the room.
4. Empty floor into fog. A corridor of pack meshes was tried and removed as clutter. Extra machines, if any, are **wire cages, one at a time, dim, far** — or they are cut.
5. Analysis on the code, not painted on powder coat.
6. Keep the hand-rolled rAF timeline. Do not add GSAP/Lenis/Rive/WebGPU “because SOTDs have them.”
7. No second particle field. Hero/merge/roadmap already have GPU systems; this URL should not inherit them as decoration.
8. No invented user counts, no `0+` first paint, no “illustration only” under the hero artifact, no `comingSoon` on live CTAs.
9. `prefers-reduced-motion` is a designed still + working log, not `display:none`.
10. `pnpm verify` remains the gate later; this run does not need to pass it unless you write code.

# KILLED UNLESS YOU FIND NEW EVIDENCE

- Lime scan-planes / contour slices on the machine (`machineMaterial.ts` history)
- Loaded `gym-props.glb` as scenery
- Photograph on the far wall
- Lando Norris SOTY 2025 (OFF+BRAND) fluid-droplet / Effect 025 birth. Our palette is already cousin (`#CCFF00` vs their `#D2FF00`). Copying their signature is an awards death. Steal ambition, not the metaballs.
- Skinned realistic athlete grinding a set (skin lighting destroys this grade; uncanny; fill-rate)
- 3D hands pulling a phone out of shorts (the fold already *is* raising a phone)
- WebXR / “scan the website with your real phone” as the **only** door (easter egg ok)
- Filling the gym, nested phones as the desktop log UI if the bezel is too small to type, FAQ slab on the awards URL

# ASSETS

- **CGTrader Ultimate Gym pack** (`all+fitness.blend`, gitignored): CAD. Hero `3.003`. Other candidates already named in `export_props.py`: chest press `3.007`, preacher `1.001`, etc. Sequential **heroes** via `export_hero.py`, not a warehouse. Plates/horns from pack for a weight beat.
- **Rodin / Hyper3D**: human / anatomy / physical LIFTAG puck only. Strip textures. Decimate. Draco. Prefer hologram path (position, normal, barycentric) over Rodin PBR in this room. Never generate the machines with Rodin.
- Existing `Macbook3D` dashboard footage. Reuse as craft, not as a second location unless you can relight it into THIS room without it looking pasted.
- Catalog copy for real last-load / exercise names. Scan-flow video (AV1 + H.264, `moov` before `mdat`) as texture, not as the log.

# THREE PRIOR PLANS (evidence, not the answer)

## Plan A — “One session, never leave the room”

Keep live Act 1. Do not hand off to Hero + marquee. WebGL stays.

2. Fold was a lie; room behind the glass; HTML labels on 3D joints (last load, seat, name).
3. Rodin wire athlete in the seat (screenshot moment).
4. Visitor logs on the in-room phone; plates drop on the horn.
5. Next pack machines as cages in the fog, one solidifies.
6. Floor rings persist where sets were logged.
7. Get LIFTAG / For gyms in the room.

Optional: real QR easter egg.

## Plan B — eight-shot recut

1. Floor hatches as wire.
2. Machine drops (`drop.ts`).
3. Sticker legendary punch-in + lens DOF + vinyl press + NFC hint.
4. Wire athlete from the splash, one rep.
5. Become them, fold, visitor logs.
6. LOG → plates; rest = decaying floor ring; second set offered.
7. Next cage in fog.
8. MacBook in this fog; note on the machine; Get.

B explicitly rejected: part assembly, Lando fluids, skinned grind, 3D hands, coach apartment, AI-coach character.

## Plan C — previous critic synthesis

Keep Act 1. Stay. Make the visitor log. Copy on the phone, not on out-of-frame joints. Floor ring as rest. Second set optional. Coach as a fact on the phone, not furniture. Kill recut of Act 1, DOF, third-person athlete, plates if horn off-screen, MacBook on the mat, pack corridor, dense body in the seat.

Geometric claim: a wire athlete in the seat at the seated eye is sitting **inside the lens**. Labels on horn/pad need a reverse. POV must stay embodied (you ARE the athlete). “Watch then become” is shooting a mistake to cut into the truth.

# TWO INDEPENDENT CRITIQUES (do not rubber-stamp)

**Critic 1 (desktop-agnostic):** Neither A nor B. A is the better skeleton (keep Act 1, stay, log). B is the better product checklist (rest, second set, coach). A as written is unfilmable from the seat. B as written spends the month relighting a shot that already works. SOTD path = A’s continuity + B’s loop on the live film.

**Critic 2 (phone-first, user has now deprioritized this as veto):** Refuse A/B; C is the only adult (~7 after iPhone) but still wrong as written (nested phone, 9 svh hostage scroll). Phone master cut: shorten Act 1 to ~4.5 svh, end sticky at QR lock, **blit-and-kill WebGL**, full-bleed HTML log, rest as 2D ring, delete homepage dump. Fold-to-device desktop-only. Thumb: scroll → tap plate → weight → reps → LOG → Get. Score after iPhone: A~4 B~3 C~7.

Your job is to take desktop wow as the mission and produce a plan that can beat all three of A/B/C *on a 1440×900 jury machine*, while leaving a sane coarse/mobile degradation path (Critic 2 is a **constraint list**, not the design).

# WHAT “WOW” MEANS HERE

Wow is: “how the fuck is this a website,” **and** it is helpful.

Candidates you must explicitly keep, recut, or kill, with reason:

| Candidate | Product sentence | Desktop feasibility notes |
|---|---|---|
| Live Act 1 as it ships | Scan from the seat without standing | Already SOTD lighting. Default keep. |
| Floor hatch as opening | The gym is a system LIFTAG can read | Cheap if it is the EXISTING floor shockwave, not a new sim. Conflicts with “machine always been here” if it feels like a spawn. |
| Machine drop | Weight, physical gym | Code exists; currently skipped under the dolly. Pre-scroll / pre-dolly only, or cut. |
| Legendary sticker punch-in + DOF | The tag is the object of desire; NFC under vinyl | One-shot composite/DOF. Sticker must NOT become the brightest object (already measured and killed at ~1.0 emission). No WoW loot chrome. |
| Wire athlete (Rodin) | How you sit; what it trains | Illegal at seated eye if it occupies the seat. Legal in the WIDE establishing shot, then must retire before the eye point, OR first-person sparse quads (not a character). |
| Interactive log | Usability 30% | Mandatory. Real HTML, visitor-driven. May live in a LARGE folded bezel on desktop if actually usable; otherwise full-bleed over the held room. |
| Plates on horn after LOG | The room answers the tap | Horn is in frame in the WIDE shot, not at seated eye. Either a brief, legal camera hold before the eye point, a cut back to three-quarter after log (phase change — justify it), or cut plates. |
| Floor rings as rest / progress | Session, not a feature | Already in `hologram.ts`. High value, low cost. |
| Next machine as cage in fog | A workout is several scans | One cage, dim, far. If it reads as the old corridor, cut. Floor rings may already say this. |
| MacBook / coach | Coach sees the set | Same grade/fog or HUD fact. A laptop on the mat is a second location wearing a trenchcoat. |
| Cursor grazing / phone-screen fill | Machine notices you | Already ships. Keep. |
| Dual-device real QR | The site is the product | Easter egg / `/demo`, not the door. |

You may invent NEW wow beats if they obey the laws and the product loop. You may not invent a second art direction.

# HOW TO ORCHESTRATE

Spawn freely. Suggested panel (you may add, drop, or reorder if you have a better one):

1. **Parallel fan-out (independent; do not share each other’s conclusions in the prompt):**
   - `plan` or `general-purpose`: **Awwwards juror.** Scores mute-15s, 90s, screenshot test. Has seen Lando / Iventions / Lusion / Active Theory. Allergic to derivative WebGL.
   - `general-purpose`: **Lighting/laws guardian.** Has read the gym-scan README as scripture. Vetoes anything that relights the room, limes the metal, fills the seat, or reopens the corridor.
   - `general-purpose`: **Wow cinematographer.** Desktop-only. Job is to maximize “how is this a website” WITHOUT violating laws. Must propose shot grammar (when the camera may stop, when a punch-in is legal, how fold relates to log).
   - `general-purpose` or `senior-software-engineer`: **Feasibility + perf.** Maps each beat to existing modules (`stage.ts`, hologram, composite, drop, scanApp, export_hero). Frame-time budget at 1440×900 DPR 1.5, fragment-bound, what `visible=false` saves. One-month ship slice vs later.
   - `general-purpose`: **Product / content.** Does each beat teach scan → setup → log → rest → session → coach? Kill orphan spectacle.
2. **You synthesize** a single shot list. Not an average of the five. You are the director. Name the cuts.
3. **Adversarial pass:** spawn a FRESH critic (`general-purpose`) that sees ONLY: the live Act 1 facts, the laws, Awwwards weights, and YOUR shot list. It must not see Plans A/B/C or the earlier critiques. Tell it to try to kill the plan. If it lands a fatal hit, recut once. Do not recut forever.
4. Optional extras if they improve the output: a mobile-degrade annotator (not a designer), a Rodin-vs-pack asset director, a “first 800ms / reduced-motion” pass.

Rules for children:

- Each child gets a self-contained brief. No “as we discussed.”
- Tell each child what it is NOT allowed to reopen (lime on metal, GSAP, gym warehouse, Lando droplets, invented counts).
- Cap nonsense: if a child wants a new engine, ignore it.
- You may spawn more than the list. Quality > count. Do not spawn decorative agents.

# OUTPUT (standalone; founder + lead engineer will only read this)

1. **Verdict in 8 lines:** what we build, why it beats A/B/C on desktop, the one screenshot moment, the one verb.
2. **Shot list** for desktop, ordered, with scroll/time budget (svh and seconds). For each shot: what the visitor sees, what they DO, the product sentence, the wow technique, which existing file it extends, kill-gate (what would make us cut it in review).
3. **POV grammar:** when we are the athlete, whether any wide-shot body is allowed, what happens at seated eye, where the log UI lives (bezel vs full-bleed) and why it is usable at 1440×900.
4. **Wow inventory:** ranked. Must-ship for SOTD vs later vs cut. Include legendary sticker, athlete, plates, next cage, MacBook, floor hatch, drop, DOF — each with keep/recut/kill.
5. **Interaction spec:** exact log (weight, reps, LOG, rest skip, second set). Keyboard. What happens in the 3D room on LOG. What HowItWorks must not leak.
6. **URL object:** what `/gym-scan` contains and what it MUST NOT hydrate. Nav. Where Get / For gyms live. Whether this later replaces `/`.
7. **Desktop vs later phone:** one table. Desktop enrichment vs coarse degrade. Coarse must still: sit, see QR, log, Get. It does not need the wow list.
8. **Build order for ~1 month desktop SOTD slice:** week-by-week. Integrity (no dump, real log, first paint) before new CAD/Rodin. Name the first prototype that proves the bet (likely: Act 1 held + real LOG + one room-answer beat).
9. **Risks:** geometric (seat/horn/eye), perf (DOF, extra meshes, DOF+bloom+area lights), awards (derivative of Lando / generic scroll film), narrative (spawn vs planted).
10. **Subagent log:** who you spawned, what you took, what you rejected. If you spawned zero, say why that was better.

# TONE

Director, not a pitch deck. Pick. Kill beloved shots. No “both have merit” without a winner. No new color system. No “add particles.” No em dashes in user-facing copy you propose.

Begin by spawning the parallel panel. Do not write the final shot list until their results are in and you have run the adversarial pass.
