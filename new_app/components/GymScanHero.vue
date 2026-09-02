<template>
  <section
    ref="hostEl"
    class="gs"
    :class="{ 'is-ready': ready }"
    :style="{ height: `calc(100svh * ${stickySvh})` }"
  >
    <div
      ref="stickyEl"
      class="gs__sticky"
      :class="{ 'is-phone-front': heroLive }"
    >
      <canvas
        ref="canvasEl"
        class="gs__canvas"
        aria-hidden="true"
      />

      <div v-if="!ready" class="gs__boot protocol">
        <span class="gs__boot-dot" />INITIALISING ROOM
      </div>

      <NuxtLink
        to="/"
        class="gs__logo"
        :class="{ 'is-out': heroLive }"
        aria-label="LIFTAG home"
      >
        <img
          src="/assets/logo.svg"
          width="24"
          height="24"
          alt=""
        >
      </NuxtLink>

      <div ref="hudEl" class="gs__hud" :class="{ 'is-retired': hudOut }">
        <div class="gs__hint protocol" :class="{ 'is-out': hintOut }">
          <span class="gs__hint-rail"><i /></span>SCROLL
        </div>
      </div>

      <!-- Final hero, revealed once the phone has taken the right half. -->
      <div class="gs__final" :class="{ 'is-on': finalIn }">
        <p class="protocol gs__final-eyebrow">FOR LIFTERS. BY LIFTERS.</p>
        <h1 class="gs__final-title display">SCAN.<br>LIFT.<br>TRACK.</h1>
        <p class="gs__final-sub">
          Sit down, scan the plate in front of you, and the machine opens in
          LIFTAG - loaded, set up and ready to log. No getting back up, no
          searching, no guessing.
        </p>
        <div class="gs__final-cta">
          <a class="gs__btn gs__btn--primary" href="#">Get LIFTAG</a>
          <a class="gs__btn gs__btn--ghost" href="#">For gyms</a>
        </div>
      </div>

      <!-- Real landing hero around the overlay phone. The front device is this
           canvas, not a second Phone3D instance. -->
      <div
        v-if="heroMounted"
        class="gs__hero-layer"
        :class="{ 'is-live': heroLive }"
      >
        <Hero
          ref="heroRef"
          handoff
          :auto-enter="false"
          hide-front-phone
          :play-enter="heroLive"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSharedMouse } from '../composables/useSharedMouse'
import {
  GYM_SCAN_STICKY_SVH,
  heroBodyTargetFromPhoneBox,
} from '../utils/gymscan/handoff'
import { clamp01 } from '../utils/gymscan/timeline'
import type { FrameInfo, GymScanStage } from '../utils/gymscan/stage'

const emit = defineEmits<{
  handoff: [active: boolean]
}>()

type HeroHandoff = {
  enter: () => void
  getFrontPhoneEl: () => HTMLElement | null
}

/** Fraction of the scroll range the choreography actually spans. */
const TIMELINE_TAIL = 0.955
const stickySvh = GYM_SCAN_STICKY_SVH

const hostEl = ref<HTMLElement | null>(null)
const stickyEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const hudEl = ref<HTMLElement | null>(null)

const ready = ref(false)
const finalIn = ref(false)
const hudOut = ref(false)
const hintOut = ref(false)
const heroMounted = ref(false)
const heroLive = ref(false)
const heroRef = ref<HeroHandoff | null>(null)
let handoffActive = false

let stage: GymScanStage | null = null
let scrollRaf = 0
const mouse = useSharedMouse()

function readScroll() {
  const host = hostEl.value
  if (!host || !stage) return
  const rect = host.getBoundingClientRect()
  const total = Math.max(1, host.offsetHeight - window.innerHeight)
  // The timeline is mapped to finish slightly before the sticky runs out of
  // travel. Browsers disagree by a few dozen pixels about what 100svh is worth
  // against a vh-derived section height, and without this tail the final
  // composition unpins for the last handful of scrolled pixels on mobile.
  stage.setProgress(clamp01(-rect.top / total / TIMELINE_TAIL))
}

function measureHeroSlot() {
  const sticky = stickyEl.value
  if (!sticky || !stage) return
  const candidates = [
    heroRef.value?.getFrontPhoneEl(),
    sticky.querySelector<HTMLElement>('.hero-front-sizer'),
    sticky.querySelector<HTMLElement>('.hero-mobile-device'),
  ]
  const s = sticky.getBoundingClientRect()
  for (const phone of candidates) {
    if (!phone) continue
    const r = phone.getBoundingClientRect()
    if (r.width < 8 || r.height < 8) continue
    stage.setHeroSlot(heroBodyTargetFromPhoneBox({
      x: r.left - s.left,
      y: r.top - s.top,
      w: r.width,
      h: r.height,
    }))
    return
  }
}

function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    readScroll()
  })
}

function handleFrame(info: FrameInfo) {
  const wantHintOut = info.progress > 0.06
  if (wantHintOut !== hintOut.value) hintOut.value = wantHintOut

  // Brief SCAN. LIFT. TRACK. beat while the phone parks right, then it yields
  // to the real landing hero. The overlay phone stays; only the copy changes.
  const wantFinal = info.scene > 0.88 && info.heroMorph < 0.22
  if (wantFinal !== finalIn.value) finalIn.value = wantFinal
  const wantHudOut = info.scene > 0.88
  if (wantHudOut !== hudOut.value) hudOut.value = wantHudOut

  if (info.scene > 0.55 && !heroMounted.value) heroMounted.value = true

  const wantLive = info.heroMorph > 0.16
  if (wantLive !== heroLive.value) heroLive.value = wantLive

  const wantHandoff = info.heroMorph > 0.16
  if (wantHandoff !== handoffActive) {
    handoffActive = wantHandoff
    emit('handoff', wantHandoff)
  }

  // Layout reads here force a style recalc. Doing that while the brackets are
  // still tracking the plate is what made them hitch on scroll; the morph
  // does not need the slot until the 3D act is already over.
  if (heroMounted.value && (info.heroMorph > 0 || info.scene > 0.85)) measureHeroSlot()
}

let pointerRaf = 0
let gyroActive = false
let gyroCleanup: (() => void) | null = null
let tiltMx = 0
let tiltMy = 0
let tiltActive = false

function pumpPointer() {
  pointerRaf = requestAnimationFrame(pumpPointer)
  if (!stage) return
  stage.setPointer(mouse.latest.mx, mouse.latest.my, mouse.latest.hasPointer)
  if (!gyroActive) {
    tiltMx = mouse.latest.mx
    tiltMy = mouse.latest.my
    tiltActive = mouse.latest.hasPointer
  }
  stage.setTilt(tiltMx, tiltMy, tiltActive)
}

function enablePhoneTiltGyro(host: HTMLElement, reduced: boolean) {
  if (reduced) return
  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.gamma == null || event.beta == null) return
    gyroActive = true
    tiltMx = Math.max(-1, Math.min(1, event.gamma / 30))
    tiltMy = Math.max(-1, Math.min(1, (event.beta - 45) / 30))
    tiltActive = true
  }

  const deviceOrientation = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>
  }) | undefined

  if (deviceOrientation && typeof deviceOrientation.requestPermission === 'function') {
    const requestOnTap = () => {
      deviceOrientation.requestPermission?.()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', onDeviceOrientation)
          }
        })
        .catch(() => {})
    }
    host.addEventListener('touchend', requestOnTap, { once: true })
    gyroCleanup = () => {
      host.removeEventListener('touchend', requestOnTap)
      window.removeEventListener('deviceorientation', onDeviceOrientation)
    }
  } else if (deviceOrientation) {
    window.addEventListener('deviceorientation', onDeviceOrientation)
    gyroCleanup = () => window.removeEventListener('deviceorientation', onDeviceOrientation)
  }
}

onMounted(async () => {
  const canvas = canvasEl.value
  if (!canvas) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const { createGymScanStage } = await import('../utils/gymscan/stage')
  stage = createGymScanStage({
    canvas,
    onFrame: handleFrame,
    onReady: () => { ready.value = true },
    reducedMotion: reduced,
  })
  stage.resize()
  stage.start()
  await stage.load()
  stage.resize()
  readScroll()

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  if (stickyEl.value) enablePhoneTiltGyro(stickyEl.value, reduced)
  pointerRaf = requestAnimationFrame(pumpPointer)
})

function onResize() {
  stage?.resize()
  readScroll()
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(scrollRaf)
  cancelAnimationFrame(pointerRaf)
  gyroCleanup?.()
  gyroCleanup = null
  stage?.dispose()
  stage = null
})
</script>

<style scoped>
.gs {
  position: relative;
  /* Section length and sticky height are kept in the same unit on purpose. With
     the section in vh and the sticky in svh, mobile's smaller svh made the
     sticky run out of travel before the scroll did, and it detached at p=1. */
  /* Height is bound from GYM_SCAN_STICKY_SVH so the 3D act and the morph tail
     stay in lockstep with SCENE_END. Fallback keeps a dark page before bind. */
  height: 900vh;
  background: #000;
  /* Beat the global mobile `section { padding-top: 80px }` rule. That gap is
     nav clearance for marketing blocks; this opener is full-bleed, and the
     deferred nav overlays it later. `overflow-x: clip` on the same rule would
     also compute overflow-y away from visible and break `position: sticky`. */
  padding: 0 !important;
  overflow: visible !important;
}
.gs__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  isolation: isolate;
}
.gs__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* --- boot ---------------------------------------------------------------- */
.gs__boot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  letter-spacing: 0.18em;
}
.gs__boot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ccff00;
  animation: gs-pulse 1.4s ease-in-out infinite;
}
@keyframes gs-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }

/* --- HUD ----------------------------------------------------------------- */
.gs__hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease 0.2s;
}
.gs.is-ready .gs__hud { opacity: 1; }
.gs__hud.is-retired .gs__hint { opacity: 0; }
.gs__hint { transition: opacity 0.5s ease; }

.protocol {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}
.display {
  font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
}

.gs__logo {
  position: absolute;
  top: calc(20px + var(--liftag-safe-top));
  left: calc(20px + var(--liftag-safe-left));
  z-index: 4;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  text-decoration: none;
  opacity: 0.82;
  transition: opacity 0.35s ease;
}
.gs__logo.is-out {
  opacity: 0;
  pointer-events: none;
}
.gs__logo:hover,
.gs__logo:focus-visible {
  opacity: 1;
}
.gs__logo:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: 3px;
}
.gs__logo img {
  display: block;
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 10px rgba(204, 255, 0, 0.4));
}

/* --- scroll hint --------------------------------------------------------- */
.gs__hint {
  position: absolute;
  right: calc(32px + var(--liftag-safe-right));
  bottom: calc(34px + var(--liftag-safe-bottom));
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.32);
  transition: opacity 0.5s ease;
}
.gs__hint.is-out { opacity: 0; }
.gs__hint-rail {
  position: relative;
  display: block;
  width: 44px;
  height: 1px;
  background: rgba(255, 255, 255, 0.16);
  overflow: hidden;
}
.gs__hint-rail i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 14px;
  background: rgba(255, 255, 255, 0.75);
  animation: gs-rail 2.2s ease-in-out infinite;
}
@keyframes gs-rail {
  0% { transform: translateX(-14px); }
  100% { transform: translateX(44px); }
}

/* --- final hero ---------------------------------------------------------- */
.gs__final {
  position: absolute;
  left: 6vw;
  top: 50%;
  transform: translateY(-50%) translateX(-24px);
  max-width: min(520px, 40vw);
  opacity: 0;
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.gs__final.is-on { opacity: 1; transform: translateY(-50%) translateX(0); pointer-events: auto; }
.gs__final-eyebrow { margin: 0 0 18px; font-size: 10px; color: #ccff00; }
.gs__final-title {
  margin: 0;
  font-size: clamp(42px, 6.4vw, 86px);
  font-weight: 700;
  line-height: 0.94;
  letter-spacing: -0.035em;
  color: #fff;
}
.gs__final-sub {
  margin: 22px 0 30px;
  max-width: 38ch;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
}
.gs__final-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.gs__btn {
  display: inline-flex;
  align-items: center;
  padding: 13px 24px;
  border-radius: 9999px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}
.gs__btn--primary { background: #ccff00; color: #0e0e0e; }
.gs__btn--ghost { border: 1px solid rgba(255, 255, 255, 0.18); color: #fff; }

.gs__hero-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.gs__hero-layer.is-live {
  opacity: 1;
  pointer-events: auto;
}
.gs__sticky.is-phone-front .gs__canvas {
  z-index: 6;
  background: transparent;
}

@media (max-width: 900px) {
  .gs__final {
    left: 0;
    right: 0;
    top: auto;
    /* Sits under the phone, which phoneTarget() parks in the upper third on
       narrow viewports. */
    bottom: 5vh;
    max-width: none;
    padding: 0 24px;
    text-align: center;
    transform: translateY(16px);
  }
  .gs__final-title { line-height: 0.98; }
  .gs__final-sub { display: none; }
  .gs__final.is-on { transform: translateY(0); }
  .gs__final-title { font-size: clamp(34px, 11vw, 54px); }
  .gs__final-sub { margin-inline: auto; font-size: 14px; }
  .gs__final-cta { justify-content: center; }
  .gs__hint { transform: scale(0.88); transform-origin: right bottom; }
}

@media (prefers-reduced-motion: reduce) {
  .gs__boot-dot, .gs__hint-rail i { animation: none; }
  .gs__final, .gs__hud, .gs__hero-layer, .gs__logo { transition-duration: 0.01ms; }
}
</style>
