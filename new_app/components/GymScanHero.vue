<template>
  <section
    ref="hostEl"
    class="gs"
    :class="{ 'is-ready': ready, 'is-static': staticMode }"
    :style="stickyVars"
  >
    <div ref="stickyEl" class="gs__sticky" :class="{ 'is-phone-front': heroLive }">
      <canvas
        v-show="!staticMode"
        ref="canvasEl"
        class="gs__canvas"
        aria-hidden="true"
      />
      <div v-if="staticMode" class="gs__still" aria-hidden="true">
        <div class="gs__still-machine">
          <i class="gs__still-rail gs__still-rail--left" />
          <i class="gs__still-rail gs__still-rail--right" />
          <i class="gs__still-footplate" />
          <i class="gs__still-leg gs__still-leg--left" />
          <i class="gs__still-leg gs__still-leg--right" />
          <i class="gs__still-shoe gs__still-shoe--left" />
          <i class="gs__still-shoe gs__still-shoe--right" />
          <img src="/assets/gym3d/qr-sticker.webp" width="827" height="874" alt="">
        </div>
      </div>
      <div v-if="!ready" class="gs__boot protocol">
        <span class="gs__boot-dot" />INITIALISING ROOM
      </div>

      <NuxtLink to="/" class="gs__logo" aria-label="LIFTAG home">
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


      <div
        class="gs__birth"
        :class="{ 'is-on': skipVisible || doorsVisible }"
      >
        <div
          class="gs__doors"
          :class="{ 'is-on': doorsVisible }"
          :inert="!doorsVisible"
          :aria-hidden="doorsVisible ? undefined : true"
        >
          <NuxtLink class="gs__btn gs__btn--primary" to="/get">Get LIFTAG</NuxtLink>
          <GymScanPartnerBtn />
        </div>
        <div v-if="skipVisible" class="gs__skip">
          <button type="button" class="gs__skip-btn" @click="skipBirth">Skip</button>
        </div>
      </div>

      <!-- The landing hero, assembled around the folded phone. Its own front
           device is hidden: this canvas is that device. The glass itself is
           the cut — a full-frame black hold here flashed the live hero out
           the moment the phone arrived. -->
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
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { useSharedMouse } from '../composables/useSharedMouse'
import { detectGymScanDevice, type GymScanDevice } from '../utils/gymscan/device'
import {
  GYM_SCAN_PHONE_STICKY_SVH,
  GYM_SCAN_REDUCED_STICKY_SVH,
  GYM_SCAN_STICKY_SVH,
  heroBodyTargetFromPhoneBox,
} from '../utils/gymscan/handoff'
import { clamp01 } from '../utils/gymscan/timeline'
import type { FrameInfo, GymScanStage } from '../utils/gymscan/stage'

const emit = defineEmits<{
  handoff: [active: boolean]
  'cursor-visible': [active: boolean]
}>()

type HeroHandoff = {
  enter: () => void
  getFrontPhoneEl: () => HTMLElement | null
}

/**
 * Morph value at which the phone has visually arrived in the hero slot.
 * Ease-out quart is already ~1 here, so this is "landed", not "still flying".
 * Used to arm the splash cursor; the glass itself is the cut, not a black hold.
 */
const HERO_ARRIVED = 0.86

const stickyVars = {
  '--gs-floor-svh': String(GYM_SCAN_STICKY_SVH),
  '--gs-seat-svh': String(GYM_SCAN_PHONE_STICKY_SVH),
  '--gs-reduced-svh': String(GYM_SCAN_REDUCED_STICKY_SVH),
}

const hostEl = useTemplateRef<HTMLElement>('hostEl')
const stickyEl = useTemplateRef<HTMLElement>('stickyEl')
const canvasEl = useTemplateRef<HTMLCanvasElement>('canvasEl')

const ready = shallowRef(false)
const hudOut = shallowRef(false)
const hintOut = shallowRef(true)
const skipVisible = shallowRef(false)
const doorsVisible = shallowRef(false)
const reducedMotion = shallowRef(false)
const staticMode = shallowRef(false)
const heroMounted = shallowRef(false)
const heroLive = shallowRef(false)
const scrollReady = shallowRef(false)
const heroRef = shallowRef<HeroHandoff | null>(null)
let stage: GymScanStage | null = null
let scrollRaf = 0
let activeDevice: GymScanDevice | null = null
let handoffActive = false
let cursorActive = false
let visibility: IntersectionObserver | null = null
const mouse = useSharedMouse()

const SCROLL_LOCK_KEYS = new Set([
  ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'PageUp', 'PageDown', 'Home', 'End',
])

function applyScrollLock(lock: boolean) {
  const html = document.documentElement
  const body = document.body
  html.style.overflow = lock ? 'hidden' : ''
  body.style.overflow = lock ? 'hidden' : ''
}

function onLockWheel(e: WheelEvent) {
  if (!scrollReady.value) e.preventDefault()
}

function onLockTouchMove(e: TouchEvent) {
  if (!scrollReady.value) e.preventDefault()
}

function onLockKey(e: KeyboardEvent) {
  if (scrollReady.value) return
  const el = e.target as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
  if (SCROLL_LOCK_KEYS.has(e.key)) e.preventDefault()
}

function pinScroll() {
  if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0)
}

function readScroll() {
  const host = hostEl.value
  if (!host || !stage) return
  if (!scrollReady.value) {
    pinScroll()
    stage.setProgress(0)
    return
  }
  const rect = host.getBoundingClientRect()
  const total = Math.max(1, host.offsetHeight - window.innerHeight)
  stage.setProgress(clamp01(-rect.top / total))
}

function onScroll() {
  if (!scrollReady.value) {
    pinScroll()
    return
  }
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    readScroll()
  })
}

/** Snap Act 0 to its finished hold. Scroll still owns everything after it. */
function skipBirth() {
  stage?.skipAct0()
}

function onBirthKey(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
  if (e.key === 's' || e.key === 'S') skipBirth()
}

/**
 * Measure the landing hero's own front-phone box and hand it to the stage, so
 * the folded glass has somewhere exact to land.
 *
 * Reading layout here forces a style recalc, so the caller only does it once
 * the 3D act is effectively over - doing it while the reticle was still
 * tracking the plate is what used to make the brackets hitch on scroll.
 */
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

function handleFrame(info: FrameInfo) {
  const wantSkip = info.act0.skipVisible && info.scene < 0.02
  if (wantSkip !== skipVisible.value) skipVisible.value = wantSkip
  const wantDoors = info.act0.doorsVisible && info.scene < 0.02
  if (wantDoors !== doorsVisible.value) doorsVisible.value = wantDoors

  if (info.act0.done !== scrollReady.value) {
    scrollReady.value = info.act0.done
    applyScrollLock(!info.act0.done)
  }

  const wantHintOut = !info.act0.done || info.progress > 0.06
  if (wantHintOut !== hintOut.value) hintOut.value = wantHintOut

  // The room's chrome hard-cuts the frame the glass starts forming — which is
  // now the last of the QR zoom, not the exclusive fold shot after it. Letting
  // it ride its own opacity transition across the seam is exactly the dissolve
  // this ending is built to avoid: a HUD label fading over the landing hero.
  const wantHudOut = info.fold > 0
  if (wantHudOut !== hudOut.value) hudOut.value = wantHudOut

  // Mount the hero well before it is needed. Hydrating it on the frame the
  // morph starts would cost a layout pass at the exact moment the glass is
  // supposed to be flying.
  if (info.scene > 0.55 && !heroMounted.value) heroMounted.value = true

  const wantLive = info.heroMorph > 0.16
  if (wantLive !== heroLive.value) heroLive.value = wantLive
  if (wantLive !== handoffActive) {
    handoffActive = wantLive
    emit('handoff', wantLive)
  }

  // Splash cursor matches `/` once the phone has landed — not while the
  // glass is still the film. Reverse-scroll puts the room back in charge.
  const wantCursor = info.heroMorph >= HERO_ARRIVED
  if (wantCursor !== cursorActive) {
    cursorActive = wantCursor
    emit('cursor-visible', wantCursor)
  }

  if (heroMounted.value && (info.heroMorph > 0 || info.scene > 0.9)) measureHeroSlot()
}

function activateStaticCut() {
  staticMode.value = true
  ready.value = true
  hintOut.value = true
  doorsVisible.value = true
  skipVisible.value = false
  scrollReady.value = true
  applyScrollLock(false)
}

function onDeviceClassChange(deviceClass: GymScanDevice['deviceClass']) {
  if (activeDevice) activeDevice.deviceClass = deviceClass
  if (deviceClass !== 'C') return
  queueMicrotask(() => {
    stage?.dispose()
    stage = null
    activateStaticCut()
  })
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
  reducedMotion.value = reduced
  window.addEventListener('keydown', onBirthKey)
  window.addEventListener('keydown', onLockKey)
  window.addEventListener('wheel', onLockWheel, { passive: false })
  window.addEventListener('touchmove', onLockTouchMove, { passive: false })
  window.addEventListener('scroll', onScroll, { passive: true })

  if (reduced) {
    activateStaticCut()
    return
  }

  applyScrollLock(true)

  activeDevice = detectGymScanDevice()
  if (!activeDevice.startStage) {
    activateStaticCut()
    return
  }

  try {
    const { createGymScanStage } = await import('../utils/gymscan/stage')
    stage = createGymScanStage({
      canvas,
      device: activeDevice,
      onDeviceClassChange,
      onFrame: handleFrame,
      onReady: () => { ready.value = true },
      reducedMotion: false,
    })
    stage.resize()
    stage.start()
    await stage.load()
    stage.resize()
    readScroll()
  }
  catch (error) {
    console.warn('[gymscan] falling back to the static seated cut', error)
    stage?.dispose()
    stage = null
    activateStaticCut()
    return
  }

  window.addEventListener('resize', onResize, { passive: true })
  if (stickyEl.value) enablePhoneTiltGyro(stickyEl.value, reduced)
  pointerRaf = requestAnimationFrame(pumpPointer)

  // The canvas survives the seam as the hero's front phone, so it can no
  // longer be stopped on a progress threshold the way the old ending stopped
  // it at the lock. Park it on visibility instead: scrolled past the hero,
  // there is nothing on screen to pay for.
  visibility = new IntersectionObserver(([entry]) => {
    if (!stage || !entry) return
    if (entry.isIntersecting) stage.start()
    else stage.stop()
  }, { rootMargin: '10% 0px' })
  visibility.observe(hostEl.value!)
})

function onResize() {
  stage?.resize()
  readScroll()
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onBirthKey)
  window.removeEventListener('keydown', onLockKey)
  window.removeEventListener('wheel', onLockWheel)
  window.removeEventListener('touchmove', onLockTouchMove)
  applyScrollLock(false)
  cancelAnimationFrame(scrollRaf)
  cancelAnimationFrame(pointerRaf)
  visibility?.disconnect()
  visibility = null
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
  height: calc(100svh * var(--gs-floor-svh, 6));
  background: #000;
  /* Beat the global mobile `section { padding-top: 80px }` rule. That gap is
     nav clearance for marketing blocks; this opener is full-bleed, and the
     deferred nav overlays it later. `overflow-x: clip` on the same rule would
     also compute overflow-y away from visible and break `position: sticky`. */
  padding: 0 !important;
  overflow: visible !important;
}
.gs.is-static { height: 100svh; }
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
.gs__still {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 68%, oklch(34% .025 250 / .24), transparent 33%),
    linear-gradient(180deg, #000 0 47%, oklch(10% .01 245) 100%);
}
.gs__still::after {
  position: absolute;
  inset: 48% -10% -20%;
  content: '';
  background:
    repeating-linear-gradient(90deg, transparent 0 78px, oklch(55% .01 245 / .08) 79px 80px),
    repeating-linear-gradient(0deg, transparent 0 78px, oklch(55% .01 245 / .08) 79px 80px);
  transform: perspective(520px) rotateX(62deg) scale(1.35);
  transform-origin: 50% 0;
}
.gs__still-machine {
  position: absolute;
  inset: 0;
  filter: drop-shadow(0 24px 38px #000);
}
.gs__still-machine::before,
.gs__still-machine::after,
.gs__still-rail,
.gs__still-footplate,
.gs__still-leg,
.gs__still-shoe {
  position: absolute;
  content: '';
  background: oklch(38% .025 245 / .38);
}
.gs__still-machine::before {
  top: 18%;
  right: 19%;
  left: 19%;
  height: 8px;
  border: 1px solid oklch(72% .018 245 / .16);
}
.gs__still-machine::after {
  top: 21%;
  left: 50%;
  width: clamp(74px, 9vw, 108px);
  height: clamp(92px, 12vw, 138px);
  transform: translateX(-50%);
  border: 1px solid oklch(74% .018 245 / .22);
  background: oklch(15% .014 245 / .78);
}
.gs__still-rail {
  top: 18%;
  bottom: 7%;
  width: 7px;
  transform-origin: top;
  box-shadow: 0 0 1px oklch(88% .018 245 / .24);
}
.gs__still-rail--left { left: 20%; transform: rotate(-10deg); }
.gs__still-rail--right { right: 20%; transform: rotate(10deg); }
.gs__still-footplate {
  top: 40%;
  left: 50%;
  width: min(48vw, 560px);
  height: min(24vw, 260px);
  transform: translateX(-50%) perspective(520px) rotateX(52deg);
  border: 1px solid oklch(72% .018 245 / .2);
  background:
    repeating-linear-gradient(90deg, transparent 0 18px, oklch(75% .01 245 / .07) 19px 20px),
    oklch(20% .018 245 / .82);
  clip-path: polygon(13% 0, 87% 0, 100% 100%, 0 100%);
}
.gs__still-leg {
  bottom: -7%;
  width: clamp(22px, 3.2vw, 42px);
  height: 48%;
  transform-origin: 50% 100%;
  border: 1px solid oklch(82% .018 245 / .32);
  border-radius: 999px 999px 30% 30%;
  background: oklch(74% .015 245 / .06);
}
.gs__still-leg--left { left: 38%; transform: rotate(12deg); }
.gs__still-leg--right { right: 38%; transform: rotate(-12deg); }
.gs__still-shoe {
  top: 48%;
  width: clamp(48px, 6vw, 78px);
  height: clamp(64px, 8vw, 98px);
  border: 1px solid oklch(82% .018 245 / .32);
  border-radius: 50% 50% 18px 18px;
  background: oklch(72% .015 245 / .08);
}
.gs__still-shoe--left { left: 36%; transform: rotate(10deg); }
.gs__still-shoe--right { right: 36%; transform: rotate(-10deg); }
.gs__still-machine img {
  position: absolute;
  top: 23%;
  left: 50%;
  z-index: 1;
  width: clamp(58px, 7vw, 84px);
  height: auto;
  transform: translateX(-50%);
  filter: brightness(.76) saturate(.55);
}
/* --- the seam ------------------------------------------------------------ */
/* Room chrome is gone the frame the fold starts. No transition: a label that
   fades out over the landing hero is the dissolve this ending refuses. */
.gs__sticky.is-phone-front .gs__logo,
.gs__sticky.is-phone-front .gs__hud,
.gs__sticky.is-phone-front .gs__birth {
  opacity: 0;
  transition: none;
  pointer-events: none;
}
/* Once the glass is the hero's front phone it has to sit *in front of* the
   landing hero, not behind it: the canvas is the device, and a device painted
   under the section it belongs to reads as a washed-out ghost of one. */
.gs__sticky.is-phone-front .gs__canvas {
  z-index: 6;
  background: transparent;
}
/* The landing hero, assembled behind the flying glass. It is inert until the
   morph is under way so a stray pointer cannot hit a CTA mid-film. */
.gs__hero-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0;
  pointer-events: none;
  /* Hard cut: fading this layer is a dissolve of the assembled page, and
     reverse-scroll would fade the hero out to black. The phone is the seam. */
  transition: none;
}
.gs__hero-layer.is-live {
  opacity: 1;
  pointer-events: auto;
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
.gs__birth {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 20px calc(28px + var(--liftag-safe-bottom));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.45s ease;
}
.gs__birth.is-on {
  opacity: 1;
  pointer-events: none;
}
.gs__doors,
.gs__skip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  pointer-events: auto;
}
.gs__doors {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: calc(48px + 12px + 28px + var(--liftag-safe-bottom));
  pointer-events: none;
}
.gs__doors .gs__btn {
  min-height: 48px;
  min-width: 48px;
  opacity: 0;
  transform: translateY(8px) scale(0.97);
  pointer-events: none;
  transition:
    opacity 0.46s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.46s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 220ms cubic-bezier(0.23, 1, 0.32, 1),
    color 220ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 220ms cubic-bezier(0.23, 1, 0.32, 1);
}
.gs__doors.is-on {
  pointer-events: none;
}
.gs__doors.is-on .gs__btn {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.gs__doors.is-on .gs__btn:nth-child(2) {
  transition-delay: 70ms;
}
.gs__doors.is-on .gs__btn:hover,
.gs__doors.is-on .gs__btn:focus-visible,
.gs__doors.is-on .gs__btn:active {
  transition-delay: 0ms;
}
.gs__skip-btn {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 16px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}
.gs__skip-btn:hover,
.gs__skip-btn:focus-visible {
  color: #fff;
}
.gs__skip-btn:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: 3px;
}
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

.gs__btn {
  display: inline-flex;
  align-items: center;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 13px 24px;
  border-radius: 9999px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}
.gs__btn--primary {
  background: #ccff00;
  color: #0e0e0e;
  box-shadow: 0 0 0 1px rgba(204, 255, 0, 0.22);
}
.gs__btn--ghost {
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}
.gs__btn::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  pointer-events: none;
  opacity: 0;
  z-index: 1;
}
/* Get LIFTAG: foil glint, the same language as the card vinyl. */
.gs__btn--primary::after {
  top: -30%;
  bottom: -30%;
  width: 38%;
  background: linear-gradient(
    105deg,
    transparent 0%,
    rgba(255, 255, 255, 0.62) 48%,
    transparent 100%
  );
  transform: translateX(-140%) skewX(-18deg);
}
.gs__btn--partner::after {
  display: none;
}
.gs__btn:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: 3px;
}
.gs__doors.is-on .gs__btn:active {
  transform: translateY(0) scale(0.97);
  transition-duration: 120ms;
}

@media (hover: hover) and (pointer: fine) {
  .gs__doors.is-on .gs__btn--primary:hover,
  .gs__doors.is-on .gs__btn--primary:focus-visible {
    transform: translateY(-2px);
    box-shadow:
      0 10px 28px rgba(204, 255, 0, 0.3),
      0 0 34px rgba(204, 255, 0, 0.48);
  }
  .gs__doors.is-on .gs__btn--primary:hover::after,
  .gs__doors.is-on .gs__btn--primary:focus-visible::after {
    animation: gs-btn-foil 680ms cubic-bezier(0.23, 1, 0.32, 1) 1;
  }
  .gs__doors.is-on .gs__btn--partner:hover,
  .gs__doors.is-on .gs__btn--partner:focus-visible,
  .gs__doors.is-on .gs__btn--partner:has(> .holo-pill-canvas.is-holo) {
    transform: translateY(-2px);
    color: #e8f4ff;
    border-color: rgba(204, 255, 0, 0.58);
    background: rgba(6, 10, 14, 0.55);
    box-shadow:
      0 0 22px rgba(158, 204, 255, 0.2),
      0 0 30px rgba(204, 255, 0, 0.18);
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.85),
      0 0 14px rgba(204, 255, 0, 0.28);
  }
}
@keyframes gs-btn-foil {
  0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
  14% { opacity: 0.95; }
  100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
}

@media (pointer: coarse) and (hover: none) {
  .gs {
    height: calc(100svh * var(--gs-seat-svh, 3.5));
  }
  .gs__birth {
    align-items: stretch;
    padding-inline: max(16px, var(--liftag-safe-left), var(--liftag-safe-right));
  }
  .gs__doors {
    left: max(16px, var(--liftag-safe-left), var(--liftag-safe-right));
    right: max(16px, var(--liftag-safe-left), var(--liftag-safe-right));
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(100%, 430px);
    margin-inline: auto;
  }
  .gs__doors .gs__btn {
    justify-content: center;
    padding-inline: 12px;
  }
  .gs__skip {
    width: min(100%, 430px);
    margin-inline: auto;
  }
  .gs__skip-btn {
    flex: 1 1 140px;
  }
  .gs__hint { transform: scale(0.88); transform-origin: right bottom; }
}

@media (prefers-reduced-motion: reduce) {
  .gs {
    height: calc(100svh * var(--gs-reduced-svh, 1));
  }
  .gs__boot-dot, .gs__hint-rail i { animation: none; }
  .gs__hud, .gs__logo, .gs__birth, .gs__hero-layer,
  .gs__doors .gs__btn { transition-duration: 0.01ms; transition-delay: 0ms; }
  .gs__doors.is-on .gs__btn:hover,
  .gs__doors.is-on .gs__btn:focus-visible,
  .gs__doors.is-on .gs__btn:active {
    transform: none;
  }
  .gs__doors.is-on .gs__btn--primary:hover::after,
  .gs__doors.is-on .gs__btn--primary:focus-visible::after {
    animation: none;
  }
}
</style>
