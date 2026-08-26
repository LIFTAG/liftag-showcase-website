# LIFTAG website awards plan

Status: working plan, not a commitment to submit.
Audience: anyone about to spend craft time on `liftag.fit` because we want award-site recognition.
Source evaluation: an agent review of the live site that called it **not competitive** for Awwwards SOTD or a strong CSS Design Awards score, and only a reasonable shot at CSSWinner / low-tier galleries after polish.

This document turns that review into sequenced work. It does **not** say “add more particles.” The site already has WebGL. The gap is that it still *reads* as a product marketing page.

---

## 1. Verdict we are working from

**Agree with the conclusion. Disagree with several of the reasons.**

The live homepage is a strong gym-tech marketing site: lime/black branding, a clear product loop, real app screens, 3D phones, a 3D NFC tag, a fluid cursor, a scroll-driven MacBook, a merge prism, particle fields. That is already more craft than a typical SaaS template.

Award juries do not score “has Three.js.” They score whether the URL feels like a **single designed object**. Right now liftag.fit still feels like:

> hero → marquee → feature sections → FAQ → download

That structure is why a judge can scroll for 20 seconds, see protocol labels and card grids, glance at `0+` in the hero, click **Guides**, and file it as a landing page.

Until that *feel* changes, Awwwards is a paid public mid-score. CSSDA is an Honorable Mention lottery. CSSWinner is the honest first target.

### What we will not rebuild

The evaluation said “limited custom motion / no WebGL.” That is outdated or a bounce-read. Do not spend a phase adding a second particle engine, a second cursor, or a Rive layer on top of work that already exists.

Already in the tree, and in scope to *use*, not replace:

| Piece | Where |
|---|---|
| Fluid WebGL cursor | `SplashCursor.vue` |
| Hero laser type + particle wall | `HeroDesktop.vue`, `HeroParticles.vue`, `useHeroLaser.ts` |
| 3D phones / MacBook | `Phone3D.vue`, `Macbook3D.vue` |
| 3D NFC tag | `NfcTag3D.vue` (hero + scan) |
| Hologram / forged PR plates | `HologramPlate.vue`, `ForgedPrPlate.vue` |
| Scan footage (AV1 + H.264, faststart) | `ScanSection.vue`, `public/assets/videos/scan-flow.*` |
| Scroll-driven “how it works” | `HowItWorks.vue` |
| App-merge prism | `AppMergeSection.vue` + merge composables |
| Dashboard scroll cinema | `DashboardSection.vue` |
| Magnetic CTAs | `plugins/magnetic.client.ts` |
| Reduced-motion + near-viewport gating | throughout; keep it |

The awards problem is not missing tech. It is **disconnected islands, SaaS section grammar, first-paint integrity, and inner pages that look like SEO.**

---

## 2. How the juries actually score

Awwwards (the expensive one) weights:

| Criterion | Weight | What kills us today |
|---|---|---|
| **Design** | 40% | Strong palette. Weak hierarchy in the middle of the page. Inter + Space Grotesk is a known “tech landing” pair. Card grids in Lifters / Gyms / Trainers. |
| **Usability** | 30% | Silent killer. Hero stats paint as `0+ / 0 / 0%`. Nav sends people into SEO articles. Mobile drops most of the craft. Scan demo autoplays; you do not drive it. |
| **Creativity** | 20% | The NFC/QR hook is original. The *site* is not. No one signature interaction a juror would screenshot. |
| **Content** | 10% | Product story is good. “Thousands of nearby lifters,” FAQ-as-SEO, and empty catalog photos hurt honesty. |

CSS Design Awards is similar, with extra weight on visual wow and special kudos. CSSWinner is a curated gallery with a much lower bar; polish + no placeholders can get us in.

**SOTD-class sites** usually share four traits we currently miss:

1. One idea the whole page is built around (not 12 marketing chapters).
2. One interaction the visitor *does*, not a video they watch.
3. Every linked page at the same craft level, or those links are not in the primary nav.
4. First paint already looks finished. No `0+`, no letter-tile images, no “coming soon.”

---

## 3. Honest audit against the five recommendations

The review listed five fixes. Mapped to the current codebase:

### 3.1 Placeholders, fake-looking numbers, weak media

**Still true, and visible on first paint.**

- Hero counters (`HeroDesktop.vue`) SSR as `0+`, `0`, `0%` because `useCountUp()` writes `textContent` only after intersection. A juror who does not wait, or a no-JS/slow-hydrate load, sees placeholder stats. This is the smoking gun behind “placeholders visible.”
- Copy still claims “Get discovered by thousands of nearby lifters” in `GymsSection.vue`. Press policy on `/press` says do not invent ratings or download counts. Same rule applies to gym discovery.
- Catalog tiles and machine pages fall back to a letter when there is no photo (`CatalogExerciseTile.vue`, `pages/machines/[slug].vue`). Judges who open **Exercises** from the nav will see this.
- App screens and scan/dashboard video are already real and high quality. Do not treat “replace screenshots” as a greenfield asset job. The hole is **numbers, claims, and missing catalog photography**, not the phone screens.
- `AppStoreBtn` still has a `comingSoon` mode. Live store buttons on `/get` are real. Never ship that flag on a URL a juror can reach.

### 3.2 Micro-interactions and an interactive NFC/QR → log demo

**Half-true.**

We have an auto-cycled scan video, a How-It-Works log-set panel you can click, magnetic buttons, a splash cursor, tag tilt. What we do **not** have is a single demo where the visitor:

1. approaches a tag,
2. taps / scans it,
3. watches the exact exercise unlock,
4. logs a set themselves,
5. sees a PR / rest timer that feels like the app.

Today that story is split across `ScanSection` (watch) and `HowItWorks` (scroll theatre). The 3D tag is labeled “Illustration only · not the real tag.” That caption is honest and also tells a juror the hero object is a prop.

### 3.3 Elevate motion and scroll storytelling

**True as a *page* problem, false as a *section* problem.**

Individual sections are motion-rich. The page is not one timeline. There is no load sequence, no scene-to-scene handoff, no view transitions off the homepage, no shared scroll progress that makes Scan → HIW → Progress feel like one workout.

Adding GSAP globally on top of the existing rAF loops would fight the PageSpeed work (`nuxt.config.ts` deferred chunks, `hydrate-on-visible`, cursor gated on first pointer). The motion upgrade is **choreography and continuity**, not a new library for its own sake.

### 3.4 Visual hierarchy and text density

**True, and this is the Design-score leak.**

Homepage folds still follow SaaS grammar: protocol eyebrow, two-line display title, paragraph, then a card grid or a tabbed screenshot column.

Worst offenders:

| Surface | Why it reads as a template |
|---|---|
| `LiftersSection.vue` | Feature-card bento. Title restates the screenshot. |
| `TrainersSection.vue` | Tabs + bullets + phone. Classic SaaS “platform” block. |
| `GymsSection.vue` | Four benefit cards + two CTAs including a comparison-page link. |
| `HomeFaq.vue` on `/` | Useful for SEO. Dead weight on an awards URL. |
| `SeoLandingPage.vue` | `/for-gyms`, `/for-lifters`, `/for-trainers` are the same article template. |
| `pages/about.vue` | Guide layout. Fine for journalists, thin for jurors. |
| Nav | `Exercises` and `Guides` are first-class. Jurors will click them. |

### 3.5 Performance and mobile

**True, and in tension with craft.**

Desktop hides the good stuff behind hydrate-on-visible and “near viewport.” Mobile often disables 3D, particles, and the cursor (`pointer: coarse`, `max-width: 768px`, `prefers-reduced-motion`). That is the right Lighthouse move and the wrong awards move if mobile then becomes a stacked brochure.

Known constraints to respect, not throw away:

- Scan LOG video on iPhone needs `moov` before `mdat` (already a hard rule).
- Hero laser left/top was a CLS fail (do not regress).
- Inline SSR CSS is load-bearing for FCP.
- Splash cursor must stay pointer-gated.

Awards still require: 60fps on a mid laptop, no layout jump on first paint, a mobile experience that feels *designed*, and a reduced-motion version that is still beautiful.

---

## 4. North star

**The homepage is one gym session, not a product catalog.**

Visitor arrives. They are at a machine. They tap the tag. The exercise loads. They log. Numbers move. The rest of the site is the consequence of that tap (progress, one app instead of eight, the gym that installed the tag, the coach watching the dashboard).

Working title for the signature interaction:

> **Tap the plate. Log the set.**

If a juror can only remember one moment, it is their cursor (or thumb) hitting the NFC plate and the UI answering like the real app.

Three directions. Pick one before Phase 2. Do not blend them.

| Direction | Feel | Cost | Risk |
|---|---|---|---|
| **A. Ritual (recommended)** | 3D plate is the protagonist. Hover/tilt, then a tap that “unlocks” Scan + log as one scene. Scroll continues the same session. | Medium. Reuses `NfcTag3D`, `ScanSection`, `HowItWorks`. | Must not feel like a Lottie sticker on a marketing page. |
| **B. Session-as-scroll** | The whole page is one workout timeline. Scroll position = rest timer / set count / PR. Marketing sections become beats, not chapters. | High. Touches every homepage section. | Easy to make unreadable. Usability 30% suffers if people cannot find Get. |
| **C. Gym floor** | WebGL space you walk; tags light up. | Very high. New scene graph. | Conflicts with Lighthouse budget and current architecture. Only revisit after A ships and still feels small. |

Default: **A now, with B’s continuity rules** (shared session state, no hard cuts between Scan and How-it-works). Not C.

Brand constraints from `PRODUCT.md` still apply: premium, technical, confident. Motion earns its place. Dark luxury, not dark-mode SaaS. No generic card grids. The site *is* the product demo.

---

## 5. Workstreams

Seven workstreams. Each maps to a weakness. They are sequenced in §6; listed here so nothing from the review gets dropped.

### W0 — Integrity (evaluator rec 1)

Make first paint look finished and true.

- [ ] **Hero stats never paint as zero.** SSR the real targets (`250+`, `11`, `100%` or whatever the press-safe numbers are). Animate *from the real number* or clip-reveal the already-correct glyphs. File: `composables/useCountUp.ts`, `HeroDesktop.vue`. Same pattern anywhere else that counts up from `0` in HTML (`HowItWorks` strength / sessions / PRs).
- [ ] **One numbers source.** Press kit, hero, marquee (`250+ · EXERCISES`), lifters card, about page, and catalog count must agree. If the catalog is 400+ on `/about` and 250+ in the hero, pick one and wire it from a single module.
- [ ] **No invented scale.** Rewrite Gyms “thousands of nearby lifters.” Partner count, cities, or “map, when you opt in” only.
- [ ] **Catalog photography.** Any exercise/machine a nav click can reach needs a real still, or the tile does not show a letter. Letter fallbacks are fine for a long-tail SK page a juror will never open; they are not fine on `/exercises` index.
- [ ] **`comingSoon` cannot appear** on production store CTAs. Keep the prop if needed for future stores; grep the live tree before submit.
- [ ] **Tag honesty.** “Illustration only” is correct today. Either commission/photograph the real plate and drop the disclaimer, or treat the 3D tag as a designed object and stop apologizing. A disclaimer under the hero artifact is an awards own-goal.

**Done when:** view-source / disable JS / hard refresh still shows finished hero metrics; no letter tiles on the first screen of `/exercises`; no scale claims the press page would forbid.

### W1 — Signature demo (evaluator rec 2)

The visitor drives NFC/QR → log.

- [ ] Merge the *story* of `ScanSection` + the *interaction* of `HowItWorks` panel 2 into one ritual. Autoplay footage can support; it cannot be the demo.
- [ ] Make `NfcTag3D` tappable / clickable. Success state: plate reacts, nearby phone or overlay opens the exact exercise (reuse scan-flow frames or a live UI replica, not a new marketing illustration).
- [ ] Let the visitor log one set: weight, reps, LOG. Rest timer starts. Optional RPE. PR burst only after *their* log, not as a CSS placeholder sitting in the layout (`hiw-log-pb-placeholder`).
- [ ] Keyboard and reduced-motion path: same flow, no 3D required. Focus order is plate → log controls → continue.
- [ ] Mobile: thumb-sized hit target on the plate or a big **TAP** control. Do not say “use desktop for the nice version.”
- [ ] Keep the real scan video for texture; do not replace it with a fake UI if the footage is stronger. Hybrid is fine: video for lock-on, interactive for log.

**Done when:** a stranger can complete tap → exercise → log without reading body copy, on desktop and on a phone, and would screenshot that moment.

### W2 — Homepage as one object (evaluator recs 3 + 4)

Kill SaaS chapter grammar. Keep conversion.

- [ ] **One idea per fold.** Cut restated titles. If the screenshot shows logging, the heading is not “Two taps. Set logged.” Show, then name.
- [ ] **Rebuild Lifters** so it is not a bento of feature cards. Options: one large live surface (session / history / library) the visitor pages through; or a single “progress not vibes” stage that *is* the section. `LiftersSection.vue`.
- [ ] **Rebuild Trainers** away from tabs-plus-bullets. The MacBook coach chapter in `DashboardSection` is already the stronger trainer story. Consider making Trainers a short coda, not a second platform pitch.
- [ ] **Rebuild Gyms** around the physical kit (hologram sticker + machine + map) which is already the good part. Drop the four identical benefit cards or collapse them into captions on the kit.
- [ ] **FAQ off the awards path.** Keep `HomeFaq` for SEO if needed, but do not leave a full accordion between Roadmap and Final CTA on the submitted URL. Footer link to `/about` or a dedicated FAQ is enough for jurors.
- [ ] **Nav for the experience URL.** Primary: Demo, Gyms, Get. Move Exercises / Guides to footer (they already live there). Jurors click everything in the bar.
- [ ] **Section seams.** Shared atmosphere (grain, cursor, lime) already exists. Add handoffs: Scan’s last frame is HIW’s first state; Progress inherits the set just logged; Merge starts after numbers exist. This is the cheap version of direction B.
- [ ] **Final CTA** already has a charge ritual. Keep it. Make it the end of the session (“rack the bar”), not a new campaign block.

**Done when:** a 15-second mute scroll no longer looks like a template, and a 90-second walkthrough feels like one story.

### W3 — Motion language (evaluator rec 3, without “more WebGL”)

- [ ] **Load sequence.** First 800ms: type, plate, phone, stats already correct. No blank WebGL, no popping 3D over a placeholder image unless the placeholder *is* the final crop. `Phone.vue`’s 3D placeholder is acceptable if it matches the final frame exactly (it should be the same webp).
- [ ] **Do not add a fourth particle field.** Hero, merge, and roadmap already have GPU systems. New motion should be type, plates, the tap ritual, and scroll continuity.
- [ ] **View Transitions** on homepage → `/get` and homepage → `/about`. If Firefox has no cross-document transitions, CSS fallback must still feel intended.
- [ ] **Micro-interactions audit** (buttons, nav chars, accordion, store badges, magnetic). One easing curve family in CSS tokens. Exponential ease-out, no bounce (already the house rule).
- [ ] **Optional, gated sound** on tap / log / PR. Off by default, one control, respect system mute. Easy to do cheesily; skip if it is not excellent.
- [ ] **404 / error** (`error.vue`) should feel like the same object (empty rack, not a guide page). Already closer than About; push it.

**Done when:** reduced-motion is still a designed static page; full motion is one language; nothing new tanks TBT on a 700px Lighthouse run.

### W4 — Mobile as a first-class cut (evaluator rec 5)

- [ ] Design the tap ritual for 390 and 430 widths first, then scale up. `HeroMobile.vue` is a different layout today; that is fine, but it must include the signature moment, not only a static phone + copy.
- [ ] Stop using “disable 3D” as the only mobile strategy. Cheap CSS 3D / a still plate with a tap state beats a brochure.
- [ ] Re-verify iPhone: scan video first pass, laser CLS, nav + keyboard, sticky catalog. Use a real device, not only DevTools.
- [ ] Touch: no hover-only instructions (“MOVE TO TILT” is a desktop line). Offer a tilt *or* a tap affordance.
- [ ] Thumb CTA: Get stays reachable; the demo does not cover it.

**Done when:** a juror on iPhone can complete the signature demo and never feels they are on the “lite” site.

### W5 — Pages jurors will actually open

Awwwards scores the submitted URL, then clicks around. Current traps: `/exercises`, `/guides`, `/for-gyms`, `/about`, `/get`, `/contact/partner`.

Two allowed strategies. Pick one.

**Strategy 1 — Narrow the graph (faster).** Primary nav and hero CTAs only go to crafted pages: `/`, `/get`, maybe `/about` and `/contact/partner`. SEO URLs stay live in the footer and sitemap. Footer can look like a sitemap; the top bar cannot.

**Strategy 2 — Craft the graph (slower, stronger).** `/for-lifters`, `/for-gyms`, `/for-trainers`, `/about`, `/get`, `error.vue` leave `SeoLandingPage` / guide chrome and get the same art direction as `/`. Catalog index gets photography and a designed search, not a letter grid.

Recommendation: **Strategy 1 for CSSWinner. Strategy 2 before Awwwards money.**

Minimum even under Strategy 1:

- [ ] `/get` is a designed install beat (it is close).
- [ ] `/about` is a studio/product page, not a Wikipedia stub in guide CSS.
- [ ] `/contact/partner` looks like a gym-owner would trust it (this is also conversion, not just awards).
- [ ] `error.vue` stays on-brand.

### W6 — Performance, a11y, submit hygiene (evaluator rec 5)

- [ ] `pnpm verify` stays the gate. Awards work that cannot typecheck + build does not ship.
- [ ] Budget: homepage TBT on mobile lab cannot collapse back to the pre-defer state. New 3D stays `hydrate-on-visible` / near-viewport. The tap ritual can be the exception that loads earlier, because it *is* the first impression.
- [ ] CLS: hero stats, laser titles, 3D phone swap, fonts. Measure, do not guess.
- [ ] `prefers-reduced-motion` is a designed mode, not `display: none` on the demo.
- [ ] Contrast on lime-on-black and muted protocol labels (`#555` on black in hero stats is a fail waiting to happen).
- [ ] Keyboard through nav, demo, Get, FAQ (if still on page).
- [ ] Custom cursor must not steal the real pointer on text/inputs; already gated to fine pointer, keep it that way.
- [ ] No public staging leaks: `comingSoon`, debug outlines, “illustration only” if we promised otherwise, env banners.

**Done when:** a mid-range Android holds 50fps+ on the demo; desktop 60; Lighthouse is not the product but we do not ship a 20 TBT regression to look fancy.

---

## 6. Phases and order

Do not parallelize “add wow” with “fix 0+.” Integrity first. Signature second. Structure third. Mobile is not a cleanup pass at the end; it rides with the signature demo.

```text
Phase 0  Integrity + numbers          3–5 days     W0
Phase 1  Signature tap → log          1.5–3 weeks  W1 + W4 (mobile cut of the same demo)
Phase 2  Homepage structure           1–2 weeks    W2
Phase 3  Motion language + 404/get    ~1 week      W3
Phase 4  Juror graph                  1–2 weeks    W5
Phase 5  Perf / a11y freeze           3–5 days     W6
Phase 6  Submit                       calendar     §8
```

Phase 0 is the only phase that is “just polish.” It is also the only phase that should happen even if we never submit anywhere.

**Exit checklist after Phase 2** (CSSWinner go / no-go):

- Hero never shows `0+`.
- Tap → log works on desktop and a real iPhone.
- Lifters / Gyms / Trainers no longer look like a card template.
- FAQ is not a slab on `/`.
- Nav does not dump jurors into `/guides`.
- Mute 15-second scroll test: someone who has not seen the Figma still says “gym tech,” not “SaaS template.”

**Exit checklist after Phase 5** (CSSDA / Awwwards go / no-go):

- Everything in the Phase 2 list.
- `/about` and `/get` match the homepage’s craft.
- No letter tiles on `/exercises` first screen (or Exercises is not in the bar).
- Reduced-motion walkthrough recorded.
- One juror-style pass: cold load, desktop, then phone, then click every nav item.

If Phase 2 fails the mute test, do not buy Awwwards.

---

## 7. File map (where the work actually lives)

Homepage composition: `new_app/pages/index.vue`.

| Goal | Touch first |
|---|---|
| Hero numbers / first paint | `HeroDesktop.vue`, `HeroMobile.vue`, `useCountUp.ts` |
| Signature plate | `NfcTag3D.vue`, `ScanSection.vue`, `HowItWorks.vue`, `TapTokenCore.vue`, `HologramPlate.vue` |
| Card-grid feel | `LiftersSection.vue`, `GymsSection.vue`, `TrainersSection.vue` |
| Scroll cinema already strong | `AppMergeSection.vue`, `DashboardSection.vue`, `ProgressSection.vue`, `Roadmap.vue` — choreograph, do not restyle from zero |
| Cursor / CTA physics | `SplashCursor.vue`, `plugins/magnetic.client.ts` |
| Nav graph | `SiteNav.vue`, `SiteFooter.vue` |
| SEO inner pages | `SeoLandingPage.vue`, `pages/for-*.vue`, `pages/about.vue`, `pages/guides/*` |
| Catalog holes | `components/catalog/*`, `pages/exercises/*`, `pages/machines/*` |
| Install | `pages/get.vue`, `GetAppBtn.vue`, `AppStoreBtn.vue` |
| Error | `error.vue` |
| Perf shells | `nuxt.config.ts` deferred-chunk regex, `pages/index.vue` `hydrate-on-visible` |
| Tokens / type | `assets/css/main.css`, `PRODUCT.md` |

Do not revive Next.js artifacts under `out/` or root `public/`.

---

## 8. Submission strategy

Spend money in this order. The original review was right about the ladder, wrong that CSSWinner is the *goal*. It is a **probe**.

| Step | Cost | When | Why |
|---|---|---|---|
| 1. CSSWinner (and/or free CSS galleries: One Page Love, Godly, httpster if they still fit) | ~$15 | After Phase 2 checklist | Cheap public eyes. If they bounce, Awwwards will too. |
| 2. CSS Design Awards | ~$50 | After Phase 4–5 if CSSWinner feedback is “close” | Honorable Mention / Special Kudos is a real possible outcome. WOTD is still unlikely until the signature demo is the site. |
| 3. Awwwards | ~$65+ | Only after Phase 5 go/no-go | Public score. A 5–6 is worse than not submitting. |

Submit **`https://liftag.fit/`** only, after production has the phases. Do not submit a preview URL, a blog post, or `/best-workout-tracking-app`.

Before pay:

- [ ] Production = the branch we designed, not an older SEO-only deploy.
- [ ] Record desktop + iPhone captures of the tap ritual (for our own review, and for nomination videos if a gallery asks).
- [ ] Decide credits (design, dev, music) so the submission form is not improvised.

---

## 9. What we will not do

- Will not add GSAP/Rive/WebGPU “because award sites have them.”
- Will not put a particle field in every remaining section.
- Will not restyle SEO guides into awards pages in Phase 0–2. Footer is enough.
- Will not change the lime / black / red system for novelty. The brand is a strength.
- Will not swap Inter / Space Grotesk in Phase 0. A display-face change is a Phase 3 *maybe*, and only if we find a cut that still reads LIFTAG, not “agency portfolio.” Default is keep the faces, use them harder (scale, italic, mono as data).
- Will not sacrifice the Lighthouse deferral architecture for a 4K hero canvas that janks on iPhone.
- Will not invent user counts, ratings, or gym testimonials to look “real.”
- Will not ship the signature demo hover-only.

---

## 10. Decisions that block later phases

Need a human call before Phase 1 is more than a prototype:

1. **Signature direction A / B / C** (default A).
2. **Nav strategy 1 vs 2** for juror graph.
3. **Real NFC plate:** photograph the hardware and drop “illustration only,” or commit to the 3D object as the icon and stop labeling it a fake.
4. **Homepage FAQ:** remove vs relocate vs keep collapsed.
5. **Whether `/` may get heavier** (the tap ritual loading earlier) in exchange for a small TBT hit. Recommendation: yes, cap it, measure on a 700px lab run.

Until those five are decided, Phase 0 can still ship.

---

## 11. How we will know it worked

Not “we added motion.” Use these tests on a production-like build:

| Test | Pass |
|---|---|
| **Mute 15s** | Palette + plate + product readable with sound off and no scrolling past the fold. Stats are real. |
| **Stranger tap** | Unbriefed person completes tap → log on desktop without help. |
| **Phone tap** | Same on a real iPhone. |
| **Nav crawl** | Every primary-nav URL looks like the same company. |
| **Reduced motion** | Demo still understandable; no broken 3D holes. |
| **Honest numbers** | Every stat matches the press kit / catalog module. |
| **Perf floor** | No obvious jank on the demo; no CLS on load; `pnpm verify` green. |
| **Template test** | If you screenshot Lifters / Gyms / Trainers, they do not look like a Framer SaaS kit. |

If Mute 15s and Stranger tap both pass, CSSWinner is in play. If Nav crawl and Template test also pass, CSSDA is in play. Awwwards needs all of them plus a moment people send to each other unprompted.

---

## 12. Relationship to the rest of the site

This plan is **homepage craft + juror graph**. It is not a rewrite of the catalog, the Slovak/CS legal pages, OG image pipeline, or IndexNow. Those stay. Awards work that breaks SEO routing, hreflang, or the exercise library is a failed change even if it looks cooler.

Conversion still matters. Get the app, partner with us, become a coach stay visible. The point is that they sit inside an experience, not at the end of a brochure.

---

## 13. Immediate next actions

1. Land Phase 0 (hero stats, claims, coming-soon grep, catalog first-screen photos).
2. Confirm decisions in §10, especially A vs B vs C.
3. Prototype the tap ritual in isolation against `NfcTag3D` + the How-it-works log panel before restyling Lifters.
4. Only then open the homepage structure.

Phase 0 can start without a meeting. Phase 1 should not.
