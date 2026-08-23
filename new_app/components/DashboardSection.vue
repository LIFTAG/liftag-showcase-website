<script setup lang="ts">
import {
  DASHBOARD_JOURNEY,
  DASHBOARD_RAIL_SWITCH_AT,
  DASHBOARD_SWAP_MIDPOINT,
  clamp01,
  mapDashboardJourney,
  smootherstep,
  smoothstep,
} from '../utils/dashboardScroll'
import type { ScreenVideoSource } from '../utils/screenVideo'

const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const mountRef = ref<HTMLElement | null>(null)
const coachMountRef = ref<HTMLElement | null>(null)

const openProgress = ref(0)
const zoomProgress = ref(0)
const chromeProgress = ref(1)
const blendProgress = ref(0)
const coachProgress = ref(0)
const cardActive = ref(false)
const armCoachVideo = ref(false)
const entered = ref(false)
const shouldUseDashboardVideo = ref(false)

// Reduced motion releases the pin and stacks the two acts as ordinary blocks,
// which the one shared WebGL laptop cannot follow. It is hidden instead (its
// layer goes display:none, so the init observer never fires and no context is
// ever created) and each act shows a still of its own dashboard.
const staticMode = ref(false)

// Which in-flow box the laptop's rest pose is aligned to. Act 1 parks it on the
// right of the gym copy; act 2 parks it on the left of the coach copy. See the
// swap in tick() for why re-anchoring mid-journey is invisible.
const alignMountRef = ref<HTMLElement | null>(null)

// AV1 first, H.264 as the universal fallback. Same 1440x904 master; the AV1
// encode is roughly half the bytes, so only browsers without AV1 decode (older
// Safari, Intel Macs) pay for the larger file.
const DASHBOARD_VIDEO_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/macbook-dashboard.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/macbook-dashboard.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

// Second act's footage. Same 1440x904 encode settings and the same browser
// window position on screen, which is what lets the cross-fade read as a page
// navigation inside one window rather than a cut between two recordings.
const COACH_VIDEO_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/macbook-coach.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/macbook-coach.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

const COACH_POSTER = '/assets/screens/coach-dashboard-web.webp'

// Returning one of two stable identities matters: a fresh array literal per
// evaluation would retrigger Macbook3D's watcher and tear the video down.
const dashboardVideoSources = computed(() => (
  shouldUseDashboardVideo.value ? DASHBOARD_VIDEO_SOURCES : undefined
))

const coachVideoSources = computed(() => (
  shouldUseDashboardVideo.value ? COACH_VIDEO_SOURCES : undefined
))

const railSwitchPercent = `${(DASHBOARD_RAIL_SWITCH_AT * 100).toFixed(2)}%`

const dashboardMetricChartSvg = ref<SVGSVGElement | null>(null)
const dashboardMetricChartTargetP = ref(1)
const dashboardMetricChartDisplayP = ref(1)
let dashboardMetricChartRaf = 0

const dashboardMetricChartPts: [number, number][] = [
  [0, 18], [12, 15], [24, 16], [36, 11],
  [48, 10], [60, 7], [72, 5], [80, 2],
]

function dashboardMetricPointAt(p: number) {
  const clampedP = clamp01(p)
  const totalLen = dashboardMetricChartPts.length - 1
  const idx = Math.min(clampedP * totalLen, totalLen)
  const i0 = Math.floor(idx)
  const i1 = Math.min(i0 + 1, totalLen)
  const t = idx - i0
  const [x0, y0] = dashboardMetricChartPts[i0]
  const [x1, y1] = dashboardMetricChartPts[i1]

  return {
    x: x0 + (x1 - x0) * t,
    y: y0 + (y1 - y0) * t,
  }
}

const dashboardMetricChartPoint = computed(() => dashboardMetricPointAt(dashboardMetricChartDisplayP.value))
const dashboardMetricChartClipWidth = computed(() => dashboardMetricChartPoint.value.x + 7)
const dashboardMetricChartDotOpacity = computed(() => dashboardMetricChartDisplayP.value > 0.02 ? 1 : 0)
const dashboardMetricUnits = computed(() => Math.round(176 + dashboardMetricChartDisplayP.value * 72))
const dashboardMetricDelta = computed(() => Math.round(4 + dashboardMetricChartDisplayP.value * 20))

function tickDashboardMetricChart() {
  const target = dashboardMetricChartTargetP.value
  const next = dashboardMetricChartDisplayP.value + (target - dashboardMetricChartDisplayP.value) * 0.18

  if (Math.abs(target - next) < 0.001) {
    dashboardMetricChartDisplayP.value = target
    dashboardMetricChartRaf = 0
    return
  }

  dashboardMetricChartDisplayP.value = next
  dashboardMetricChartRaf = requestAnimationFrame(tickDashboardMetricChart)
}

function setDashboardMetricChartTarget(p: number) {
  dashboardMetricChartTargetP.value = Math.max(0.02, Math.min(1, p))
  if (!dashboardMetricChartRaf) dashboardMetricChartRaf = requestAnimationFrame(tickDashboardMetricChart)
}

function handleDashboardMetricChartMove(event: PointerEvent) {
  const rect = dashboardMetricChartSvg.value?.getBoundingClientRect()
    ?? (event.currentTarget as HTMLElement).getBoundingClientRect()
  setDashboardMetricChartTarget((event.clientX - rect.left) / Math.max(1, rect.width))
}

function resetDashboardMetricChartHover() {
  setDashboardMetricChartTarget(1)
}

// Shared singleton - no per-component window listener. useLerpVars' rAF reads
// rawMouse.x/y each frame, so pointing it at the shared `latest` object
// (whose .x/.y are kept in sync by the single global handler) gives identical
// behaviour at zero per-component cost. It publishes --dash-mx / --dash-my on
// the section rather than a ref, so cursor movement never re-renders this
// component - the chip transforms below are constant strings.
const rawMouse = useSharedMouse().latest
const sectionInView = ref(false)
useLerpVars(sectionRef, rawMouse, 'dash', 0.06, () => sectionInView.value)

const chipSpreadStart = 0.12
const chipSpreadEnd = 0.92

// Just ahead of the punch-in, so the ~2.5MB coach encode has a viewport of
// scrolling to arrive before anything needs to show it.
const ARM_COACH_AT = DASHBOARD_JOURNEY.openEnd - 0.04

let observer: IntersectionObserver | null = null
let rafId = 0
let isVisible = false
let reduceMotion = false
let hasEntered = false
let dashboardVideoQuery: MediaQueryList | null = null
let lastTickKey = ''
let idleFrames = 0
let runwayPx = 1
// Edge-triggered page-wide cursor tone: once the coach footage owns the
// MacBook screen, the splash cursor runs red until something else flips it
// back (TrainersSection on entry, or this section on scrolling back up).
let coachToneEmitted = false

function emitCoachTone(active: boolean) {
  window.dispatchEvent(new CustomEvent('liftag:cursor-glow-tone', {
    detail: { tone: active ? 'red' : 'green' },
  }))
}

function exitSlice(p: number, start: number, duration: number) {
  return smoothstep((p - start) / duration)
}

function setExitMotion(section: HTMLElement, key: string, value: number, y: number) {
  section.style.setProperty(`--exit-${key}`, String(value))
  section.style.setProperty(`--exit-${key}-y`, `${value * y}px`)
}

// Both inputs are CSS custom properties written by the loops above - the lerped
// pointer in --dash-mx / --dash-my and the scroll-driven spread in
// --chip-spread - so this returns a constant string. Neither scrolling nor
// moving the cursor re-renders the chips; the compositor re-resolves the calc().
function chipTransform(
  cursorX: number,
  cursorY: number,
  packedX: number,
  packedY: number,
) {
  return 'translate3d('
    + `calc(${packedX}px * (1 - var(--chip-spread)) + var(--dash-mx) * ${cursorX}px), `
    + `calc(${packedY}px * (1 - var(--chip-spread)) + var(--dash-my) * ${cursorY}px), `
    + '0) rotate(0deg) scale(calc(0.9 + var(--chip-spread) * 0.1))'
}

function getScrollProgress() {
  const section = sectionRef.value
  if (!section) return 0
  const rect = section.getBoundingClientRect()
  const viewportH = useStableViewportHeight() || window.innerHeight
  const available = Math.max(1, rect.height - viewportH)
  runwayPx = available
  return clamp01(-rect.top / available)
}

function updateDashboardVideoPreference() {
  shouldUseDashboardVideo.value = dashboardVideoQuery?.matches ?? false
}

// Re-arms a parked loop. Self-coalescing: once rafId is set, further events
// are no-ops until tick() parks again, so this stays cheap on a scroll storm.
function onWake() {
  if (!isVisible || rafId !== 0) return
  rafId = requestAnimationFrame(tick)
}

function tick() {
  if (!isVisible) {
    rafId = 0
    return
  }

  // Quantized to roughly one scroll pixel, not to a fixed fraction. A fixed
  // 1/200 was fine when this section was 300vh, but the two-act runway is 4.6
  // viewports, which stretched the same step to ~18px of scroll - and the sweep
  // crosses a whole viewport width in under a tenth of the journey, so it moved
  // in 80px jumps. Deriving the step from the runway keeps the resolution
  // constant however long the section gets, and an unchanged frame still parks.
  const raw = getScrollProgress()
  const steps = Math.max(200, Math.round(runwayPx))
  const p = reduceMotion ? 1 : Math.round(raw * steps) / steps
  const tickKey = `${p}|${reduceMotion}`

  if (tickKey === lastTickKey) {
    // Everything below derives from p alone, so nothing can have changed.
    // Park after a couple of identical frames; onWake() re-arms the loop.
    idleFrames += 1
    if (idleFrames >= 2) {
      rafId = 0
      return
    }
    rafId = requestAnimationFrame(tick)
    return
  }

  idleFrames = 0
  rafId = requestAnimationFrame(tick)

  const mapped = mapDashboardJourney(p, reduceMotion)
  openProgress.value = mapped.open
  zoomProgress.value = mapped.zoom
  chromeProgress.value = mapped.chrome
  blendProgress.value = mapped.blend
  coachProgress.value = mapped.coach
  cardActive.value = mapped.card > 0.001

  // Start fetching the coach footage a little before the punch-in rather than
  // on an observer: by the time the camera is inside the screen the file has to
  // be decodable, and that is roughly a viewport of scrolling away from here.
  if (!armCoachVideo.value && !reduceMotion && p >= ARM_COACH_AT) {
    armCoachVideo.value = true
  }

  // The cursor turns red the moment the coach footage takes over, not when
  // TrainersSection arrives a full viewport later.
  const coachOwnsScreen = p >= DASHBOARD_SWAP_MIDPOINT
  if (coachOwnsScreen !== coachToneEmitted) {
    coachToneEmitted = coachOwnsScreen
    emitCoachTone(coachOwnsScreen)
  }

  // Re-anchor the rest pose while the camera is fully inside the screen. At
  // zoom 1 the camera sits on the zoom rig and the start rig contributes
  // nothing to its position, so the swap is invisible - and the un-zoom then
  // travels out to act 2's mount instead of act 1's for free. Scrolling back up
  // crosses the same boundary at the same locked zoom, so it reverses cleanly.
  const anchor = p >= DASHBOARD_JOURNEY.cardOutEnd ? coachMountRef.value : mountRef.value
  if (anchor && alignMountRef.value !== anchor) alignMountRef.value = anchor

  // Act 1's copy leaves on its own channel because the two acts share one
  // sticky: on desktop it rides --chrome-p, but the phone layout keeps the copy
  // in the document flow above the laptop, where --chrome-p is deliberately
  // ignored so it stays readable during the open. It still has to clear out
  // before act 2 arrives, which is what this drives.
  const act1Out = reduceMotion
    ? 0
    : smoothstep((p - DASHBOARD_JOURNEY.openEnd)
      / (DASHBOARD_JOURNEY.zoomEnd - DASHBOARD_JOURNEY.openEnd))

  // Linear, unlike the eased `blend` it accompanies: the sweep is a physical
  // object crossing the frame, so a constant speed is what makes it read as
  // wiping the footage over rather than as a dissolve that happens to move.
  const sweep = reduceMotion
    ? 0
    : clamp01((p - DASHBOARD_JOURNEY.swapStart)
      / (DASHBOARD_JOURNEY.swapEnd - DASHBOARD_JOURNEY.swapStart))

  const exitT = mapped.exit
  const exitFlow = reduceMotion ? 0 : smoothstep((p - 0.928) / 0.072)
  const exitP = reduceMotion ? -1 : p

  const section = sectionRef.value
  if (section) {
    lastTickKey = tickKey
    section.style.setProperty('--lid-p', String(mapped.open))
    section.style.setProperty('--scroll-p', String(p))
    section.style.setProperty('--zoom-p', String(mapped.zoom))
    section.style.setProperty('--chrome-p', String(mapped.chrome))
    section.style.setProperty('--act1-out', String(act1Out))
    section.style.setProperty('--card-p', String(mapped.card))
    section.style.setProperty('--sweep-p', String(sweep))
    section.style.setProperty('--rail-p', String(mapped.rail))
    section.style.setProperty('--blend-p', String(mapped.blend))
    section.style.setProperty('--coach-p', String(mapped.coach))
    section.style.setProperty('--chip-spread', String(smootherstep(
      (mapped.open - chipSpreadStart) / (chipSpreadEnd - chipSpreadStart),
    )))
    section.style.setProperty('--exit-p', String(exitT))
    section.style.setProperty('--exit-flow-y', `${exitFlow * -92}px`)
    section.style.setProperty('--exit-flow-scale', String(1 - exitFlow * 0.018))
    // The exit belongs entirely to act 2 now - act 1's copy is long gone by the
    // time the section starts flowing away into Trainers.
    setExitMotion(section, 'copy', exitSlice(exitP, 0.928, 0.058), -28)
    setExitMotion(section, 'feature-0', exitSlice(exitP, 0.936, 0.052), -20)
    setExitMotion(section, 'feature-1', exitSlice(exitP, 0.944, 0.048), -24)
    setExitMotion(section, 'feature-2', exitSlice(exitP, 0.952, 0.044), -28)
    setExitMotion(section, 'chip-clients', exitSlice(exitP, 0.936, 0.052), -28)
    setExitMotion(section, 'chip-month', exitSlice(exitP, 0.944, 0.048), -32)
    setExitMotion(section, 'chip-focus', exitSlice(exitP, 0.952, 0.044), -34)
    setExitMotion(section, 'stage-glow', exitSlice(exitP, 0.930, 0.058), -18)
    setExitMotion(section, 'macbook', exitSlice(exitP, 0.944, 0.052), -46)
    setExitMotion(section, 'bg', exitSlice(exitP, 0.944, 0.052), -30)
  }
}

const features = [
  {
    tag: 'LOCATIONS',
    title: 'Every gym, one place.',
    body: 'Add new locations, update hours, and edit details across every gym in your brand.',
  },
  {
    tag: 'MACHINE CATALOG',
    title: 'Build once, deploy everywhere.',
    body: 'Define your equipment library once. Provision machines to any gym in a few clicks.',
  },
  {
    tag: 'YOUR TEAM',
    title: 'Invite managers by email.',
    body: 'Send an invite. Your staff get access to the gym you assign. No setup needed.',
  },
]

// Every claim below is a capability that exists in the coach dashboard today.
// Deliberately not repeated from TrainersSection, which already covers trainer
// profiles, the public directory and plan sharing - and deliberately silent on
// payments, scheduling and messaging, none of which the product has.
const coachFeatures = [
  {
    tag: 'CLIENT ROSTER',
    title: 'Invite by email. Coach from day one.',
    body: 'Send an invite, they accept in the app, and their training lands here. Whoever has not logged in a while surfaces first.',
  },
  {
    tag: 'SESSION HISTORY',
    title: 'A month of training at a glance.',
    body: 'Walk the calendar, open any session, and read duration, sets and volume next to how every exercise compares to last time.',
  },
  {
    tag: 'BODY FOCUS',
    title: 'See what they are actually training.',
    body: 'A front-and-back muscle map per month and per session, plus the body-weight trend, so imbalances show up early.',
  },
]

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  staticMode.value = reduceMotion
  alignMountRef.value = mountRef.value
  // Phones get the footage too: the element is muted + playsinline, so iOS and
  // Android autoplay it inline, and Macbook3D still holds the source until the
  // laptop is ~300px from the viewport. Reduced motion keeps the still poster.
  dashboardVideoQuery = window.matchMedia('(prefers-reduced-motion: no-preference)')
  updateDashboardVideoPreference()
  dashboardVideoQuery.addEventListener('change', updateDashboardVideoPreference)

  window.addEventListener('scroll', onWake, { passive: true })
  window.addEventListener('resize', onWake, { passive: true })

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting
      sectionInView.value = isVisible
      if (isVisible) {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(tick)
        if (!hasEntered) {
          hasEntered = true
          entered.value = true
        }
      }
    })
  }, { threshold: 0 })

  if (sectionRef.value) observer.observe(sectionRef.value)

  // Set initial value once mounted
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  if (dashboardMetricChartRaf) cancelAnimationFrame(dashboardMetricChartRaf)
  window.removeEventListener('scroll', onWake)
  window.removeEventListener('resize', onWake)
  observer?.disconnect()
  dashboardVideoQuery?.removeEventListener('change', updateDashboardVideoPreference)
  dashboardVideoQuery = null
  // Release the page-wide red tone if this section unmounts while owning it.
  if (coachToneEmitted) {
    coachToneEmitted = false
    emitCoachTone(false)
  }
})
</script>

<template>
  <section
    id="dashboard"
    ref="sectionRef"
    class="dashboard-section"
    :class="{
      'is-chrome-hidden': chromeProgress < 0.05,
      'is-card-active': cardActive,
      'is-coach-active': coachProgress > 0.5,
    }"
  >
    <!-- `#trainers` is this MacBook handoff, not TrainersSection. Native hash
         scroll can only land at the section's start; JS then seeks cardFull. -->
    <span id="trainers" class="dashboard-trainers-anchor" aria-hidden="true"></span>
    <div class="dashboard-sticky">
      <div class="dashboard-bg" aria-hidden="true">
        <div class="dashboard-grid"></div>
        <!-- Act 2's ambient wash gets its own layer rather than a calc() inside
             the parent's gradient: the two acts key off opposite sides of the
             stage in opposite colours, and cross-fading two static gradients is
             far cheaper than re-resolving one animated gradient every frame. -->
        <div class="dashboard-bg-coach"></div>
        <div class="dashboard-pulse pulse-one"></div>
        <div class="dashboard-pulse pulse-two"></div>
      </div>

      <div class="dashboard-macbook-layer" aria-hidden="true">
        <ClientOnly>
          <!-- Not merely hidden under reduced motion: the progress watchers all
               force a lazy init on their first non-zero value, so leaving it
               mounted would spin up a WebGL context and a Three.js scene for a
               display:none layer nobody will ever see. -->
          <Macbook3D
            v-if="!staticMode"
            screenshot-src="/assets/screens/dashboard-web.webp"
            :screenshot-src-b="COACH_POSTER"
            :video-sources="dashboardVideoSources"
            :video-sources-b="coachVideoSources"
            :screen-blend="blendProgress"
            :arm-secondary="armCoachVideo"
            :open-progress="openProgress"
            :zoom-progress="zoomProgress"
            :align-el="alignMountRef"
          />
        </ClientOnly>
      </div>

      <div class="container dashboard-layout">
        <div class="dashboard-copy">
          <div class="dashboard-copy-head">
            <Eyebrow>▸ FOR GYM OWNERS</Eyebrow>
            <SectionTitle :max="560">
              Run your gyms from <span class="lime">one dashboard.</span>
            </SectionTitle>
            <p class="dashboard-lede reveal">
              Locations, machines, and managers. The core dashboard is free forever; advanced business tools are optional.
            </p>
          </div>

          <ul class="dashboard-features">
            <li
              v-for="(f, i) in features"
              :key="f.tag"
              class="dashboard-feature reveal"
              :style="{ '--i': i }"
            >
              <span class="dashboard-feature-line" aria-hidden="true"></span>
              <span class="protocol dashboard-feature-tag">{{ f.tag }}</span>
              <h3 class="dashboard-feature-title">{{ f.title }}</h3>
              <p class="dashboard-feature-body">{{ f.body }}</p>
            </li>
          </ul>
        </div>

        <div ref="stageRef" class="dashboard-stage" aria-label="Liftag web dashboard mockup">
          <div class="dashboard-stage-glow" aria-hidden="true"></div>
          <div class="dashboard-hint">
            <span class="protocol">SCROLL TO OPEN ↓</span>
          </div>
          <div ref="mountRef" class="dashboard-macbook-mount">
            <ClientOnly>
              <img
                v-if="staticMode"
                src="/assets/screens/dashboard-web.webp"
                srcset="/assets/screens/dashboard-web-360.webp 360w, /assets/screens/dashboard-web-560.webp 560w, /assets/screens/dashboard-web-640.webp 640w, /assets/screens/dashboard-web.webp 1440w"
                sizes="(max-width: 768px) 92vw, 980px"
                alt="Liftag dashboard"
                width="1440"
                height="904"
                loading="lazy"
                decoding="async"
                class="dashboard-fallback-img"
              />
              <template #fallback>
                <img
                  src="/assets/screens/dashboard-web.webp"
                  srcset="/assets/screens/dashboard-web-360.webp 360w, /assets/screens/dashboard-web-560.webp 560w, /assets/screens/dashboard-web-640.webp 640w, /assets/screens/dashboard-web.webp 1440w"
                  sizes="(max-width: 768px) 92vw, 980px"
                  alt="Liftag dashboard"
                  width="1440"
                  height="904"
                  loading="lazy"
                  decoding="async"
                  class="dashboard-fallback-img"
                />
              </template>
            </ClientOnly>
          </div>

          <!-- Catalog sync chip (bottom-left) -->
          <div
            class="dash-chip dash-chip-sync"
            :style="{
              transform: chipTransform(24, 14, -8, -252),
              opacity: entered ? 'var(--chrome-p)' : 0,
            }"
            aria-hidden="true"
          >
            <div class="dash-chip-icon">
              <span class="dash-chip-pulse"></span>
            </div>
            <div>
              <div class="protocol dash-chip-tag">CATALOG · SYNC</div>
              <div class="dash-chip-title">1 → 12 GYMS</div>
            </div>
          </div>

          <!-- Live machine count chip (top-right) -->
          <div
            class="dash-chip dash-chip-metric"
            :style="{
              transform: chipTransform(-18, 10, -108, 46),
              opacity: entered ? 'var(--chrome-p)' : 0,
            }"
            aria-hidden="true"
            @pointermove="handleDashboardMetricChartMove"
            @pointerleave="resetDashboardMetricChartHover"
            @pointercancel="resetDashboardMetricChartHover"
          >
            <div class="protocol dash-chip-mtag">MACHINES · LIVE</div>
            <div class="dash-chip-mvalue">
              {{ dashboardMetricUnits }}<span class="dash-chip-munit"> units</span>
            </div>
            <div class="dash-chip-delta">
              <span>↑</span> +{{ dashboardMetricDelta }} this month
            </div>
            <svg ref="dashboardMetricChartSvg" viewBox="-3 -3 86 26" class="dash-chip-spark">
              <defs>
                <clipPath id="dashboardMetricSparkClip">
                  <rect x="-3" y="-3" :width="dashboardMetricChartClipWidth" height="32" />
                </clipPath>
              </defs>
              <polyline
                points="0,18 12,15 24,16 36,11 48,10 60,7 72,5 80,2"
                fill="none"
                stroke="#CCFF00"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.75"
                clip-path="url(#dashboardMetricSparkClip)"
              />
              <polyline
                points="0,18 12,15 24,16 36,11 48,10 60,7 72,5 80,2"
                fill="none"
                stroke="#CCFF00"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.12"
                clip-path="url(#dashboardMetricSparkClip)"
              />
              <circle
                :cx="dashboardMetricChartPoint.x"
                :cy="dashboardMetricChartPoint.y"
                r="2.5"
                fill="#CCFF00"
                :opacity="dashboardMetricChartDotOpacity"
              />
            </svg>
          </div>

          <!-- Deploy badge (mid-right, lime accent) -->
          <div
            class="dash-chip dash-chip-deploy"
            :style="{
              transform: chipTransform(32, -12, -8, -174),
              opacity: entered ? 'var(--chrome-p)' : 0,
            }"
            aria-hidden="true"
          >
            <div class="dash-chip-deploy-tag">⚡ DEPLOYED</div>
            <div class="dash-chip-deploy-title">Bratislava · Slovakia</div>
          </div>
        </div>
      </div>

      <!-- ── Act 2: the same laptop, re-framed around the coach dashboard ── -->
      <div id="coach-dashboard" class="container coach-layout">
        <div ref="coachMountRef" class="coach-stage" aria-label="Liftag coach dashboard mockup">
          <ClientOnly>
            <img
              v-if="staticMode"
              :src="COACH_POSTER"
              srcset="/assets/screens/coach-dashboard-web-360.webp 360w, /assets/screens/coach-dashboard-web-560.webp 560w, /assets/screens/coach-dashboard-web-640.webp 640w, /assets/screens/coach-dashboard-web.webp 1440w"
              sizes="(max-width: 768px) 92vw, 980px"
              alt="Liftag coach dashboard"
              width="1440"
              height="904"
              loading="lazy"
              decoding="async"
              class="dashboard-fallback-img coach-fallback-img"
            />
            <template #fallback>
              <img
                :src="COACH_POSTER"
                srcset="/assets/screens/coach-dashboard-web-360.webp 360w, /assets/screens/coach-dashboard-web-560.webp 560w, /assets/screens/coach-dashboard-web-640.webp 640w, /assets/screens/coach-dashboard-web.webp 1440w"
                sizes="(max-width: 768px) 92vw, 980px"
                alt="Liftag coach dashboard"
                width="1440"
                height="904"
                loading="lazy"
                decoding="async"
                class="dashboard-fallback-img coach-fallback-img"
              />
            </template>
          </ClientOnly>

          <div
            class="dash-chip coach-chip coach-chip-clients"
            :style="{
              transform: chipTransform(-20, 12, -96, 40),
              opacity: entered ? 'calc(var(--coach-p) * (1 - var(--exit-chip-clients)))' : 0,
            }"
            aria-hidden="true"
          >
            <div class="protocol coach-chip-tag">COACHING · ACTIVE</div>
            <div class="coach-chip-value">4<span class="coach-chip-unit"> clients</span></div>
          </div>

          <div
            class="dash-chip coach-chip coach-chip-month"
            :style="{
              transform: chipTransform(26, -14, -12, 196),
              opacity: entered ? 'calc(var(--coach-p) * (1 - var(--exit-chip-month)))' : 0,
            }"
            aria-hidden="true"
          >
            <div class="protocol coach-chip-tag">MONTH AT A GLANCE</div>
            <div class="coach-chip-row">
              <span><b>5</b> workouts</span>
              <span><b>70</b> sets</span>
              <span><b>13,060</b> kg</span>
            </div>
          </div>

          <div
            class="dash-chip coach-chip coach-chip-focus"
            :style="{
              transform: chipTransform(18, 16, 104, -160),
              opacity: entered ? 'calc(var(--coach-p) * (1 - var(--exit-chip-focus)))' : 0,
            }"
            aria-hidden="true"
          >
            <div class="protocol coach-chip-tag">BODY FOCUS</div>
            <div class="coach-chip-focus-name">Quadriceps</div>
            <div class="coach-chip-bar"><span></span></div>
            <div class="coach-chip-focus-meta">13.3% of volume · 30 sets</div>
          </div>
        </div>

        <div class="coach-copy">
          <div class="coach-copy-head">
            <Eyebrow color="#FF2D55">▸ COACHING · DESKTOP</Eyebrow>
            <SectionTitle :max="560">
              Coaching, on a <span class="coach-accent">big screen.</span>
            </SectionTitle>
            <p class="coach-lede reveal">
              Your clients' training opened up on desktop. Every logged session, every trend, everything you shared - without leaving the browser.
            </p>
          </div>

          <ul class="dashboard-features coach-features">
            <li
              v-for="(f, i) in coachFeatures"
              :key="f.tag"
              class="dashboard-feature coach-feature reveal"
              :style="{
                '--i': i,
                '--exit-row': `var(--exit-feature-${i})`,
                '--exit-row-y': `var(--exit-feature-${i}-y)`,
              }"
            >
              <span class="dashboard-feature-line" aria-hidden="true"></span>
              <span class="protocol dashboard-feature-tag coach-feature-tag">{{ f.tag }}</span>
              <h3 class="dashboard-feature-title">{{ f.title }}</h3>
              <p class="dashboard-feature-body">{{ f.body }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- ── The handoff, played out inside the punched-in screen ────────── -->
      <div class="coach-handoff" aria-hidden="true">
        <div class="coach-handoff-scrim"></div>
        <div class="coach-handoff-copy">
          <span class="protocol coach-handoff-eyebrow">▸ COACHING</span>
          <p class="display coach-handoff-title">
            Even coaches get their own <span class="lime">dashboard.</span>
          </p>
        </div>

        <!-- What the laser leaves behind. An exact duplicate of the copy above,
             clipped to the part of the frame the beam has already crossed, with
             everything transparent except the two words that get re-keyed to
             act 2's red. Duplicating the whole block rather than just the words
             is what guarantees the glyphs land on the same pixels; the
             transparent remainder means no text is ever painted twice. -->
        <div class="coach-handoff-burn">
          <div class="coach-handoff-copy is-burn">
            <span class="protocol coach-handoff-eyebrow">▸ COACHING</span>
            <p class="display coach-handoff-title">
              Even coaches get their own <span>dashboard.</span>
            </p>
          </div>
        </div>

        <div class="coach-handoff-sweep"></div>
      </div>

      <!-- ── Where the handoff lands, so the dwell reads as a pause and not
             as a stuck page. The tick is the moment the footage changes. ── -->
      <div class="coach-rail" aria-hidden="true">
        <div class="coach-rail-labels">
          <span class="protocol coach-rail-label is-gym">GYM DASHBOARD</span>
          <span class="protocol coach-rail-label is-coach">COACH DASHBOARD</span>
        </div>
        <div class="coach-rail-track">
          <span class="coach-rail-fill"></span>
          <span class="coach-rail-tick" :style="{ left: railSwitchPercent }"></span>
        </div>
        <span class="protocol coach-rail-hint">STOP SCROLLING TO WATCH</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-trainers-anchor {
  position: absolute;
  /* DASHBOARD_JOURNEY.cardFull of the pinned runway (section minus one
     viewport). Native `#trainers` scroll then lands on the risen handoff
     card; JS seeks the same Y so a late layout pass can still correct. */
  top: calc(0.435 * (100% - var(--liftag-stable-vh, 100vh)));
  left: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}

.dashboard-section {
  --lid-p: 0;
  --scroll-p: 0;
  --zoom-p: 0;
  --chrome-p: 1;
  /* Lerped pointer, normalized to -1..1 and unitless, plus the scroll-driven
     chip spread. Both are overwritten from rAF; the defaults here keep SSR and
     first paint correct before the first pointer or scroll event. */
  --dash-mx: 0;
  --dash-my: 0;
  --chip-spread: 0;
  /* Act 1 leaves on its own channel, separate from --chrome-p, because the
     phone layout deliberately ignores --chrome-p to keep the copy readable
     while the screen punches in. See tick(). */
  --act1-out: 0;
  /* Act 2: the handoff card, the sweep that appears to wipe the footage over,
     the footage cross-fade itself, the rail that tells the reader when the
     switch lands, and the arrival of the coach copy. */
  --card-p: 0;
  --sweep-p: 0;
  --blend-p: 0;
  --rail-p: 0;
  /* The live handover colour: lime while the gym footage still leads, act 2's
     red once the coach footage has taken over. Defined once because two things
     have to agree on it exactly - the leading edge of the rail's fill and the
     laser that is crossing the frame at the same moment. */
  --handoff-key: color-mix(
    in srgb,
    var(--liftag-primary),
    var(--liftag-red-neon) calc(var(--blend-p) * 100%)
  );
  --coach-p: 0;
  --exit-p: 0;
  --exit-copy: 0;
  --exit-copy-y: 0px;
  --exit-feature-0: 0;
  --exit-feature-0-y: 0px;
  --exit-feature-1: 0;
  --exit-feature-1-y: 0px;
  --exit-feature-2: 0;
  --exit-feature-2-y: 0px;
  --exit-chip-clients: 0;
  --exit-chip-clients-y: 0px;
  --exit-chip-month: 0;
  --exit-chip-month-y: 0px;
  --exit-chip-focus: 0;
  --exit-chip-focus-y: 0px;
  --exit-stage-glow: 0;
  --exit-stage-glow-y: 0px;
  --exit-macbook: 0;
  --exit-macbook-y: 0px;
  --exit-bg: 0;
  --exit-bg-y: 0px;
  --exit-flow-y: 0px;
  --exit-flow-scale: 1;
  position: relative;
  /* Two acts share one pin: the gym punch-in, the handoff inside the screen,
     the dwell, the un-zoom, and the coach reveal. */
  min-height: 560vh;
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dashboard-section.is-chrome-hidden .dashboard-copy-head,
.dashboard-section.is-chrome-hidden .dashboard-features,
.dashboard-section.is-chrome-hidden .dash-chip,
.dashboard-section.is-chrome-hidden .dashboard-hint {
  pointer-events: none;
}

/* Act 2 is stacked on top of act 1, so it has to stay untouchable until it is
   the one on screen - otherwise it would swallow act 1's pointer events. */
.coach-layout {
  pointer-events: none;
}

.dashboard-section.is-coach-active .coach-layout {
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-section {
    min-height: 100vh;
  }
}

.dashboard-sticky {
  position: sticky;
  top: calc(76px + var(--liftag-safe-top));
  height: calc(100vh - 76px - var(--liftag-safe-top));
  min-height: 700px;
  overflow: hidden;
  /* A one-cell grid rather than a flex row: both acts occupy the same cell so
     the second can cross-fade over the first without either leaving the flow
     or needing absolute positioning that the mobile reflow would have to undo. */
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  align-content: center;
  padding: 24px 0;
}

.dashboard-layout,
.coach-layout {
  grid-area: 1 / 1;
  align-self: center;
}

.dashboard-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Act 1's wash sits on a pseudo-element so it can fade out on its own without
   taking the grid, the pulses and the act-2 layer down with it. */
.dashboard-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: calc(1 - var(--coach-p));
  background:
    radial-gradient(620px circle at 76% 38%, rgba(204, 255, 0, calc(0.06 + var(--lid-p) * 0.16)), transparent 64%),
    radial-gradient(540px circle at 16% 70%, rgba(255, 45, 85, 0.04), transparent 70%);
}

/* Mirrored and re-keyed for act 2, where the laptop has crossed to the left. */
.dashboard-bg-coach {
  position: absolute;
  inset: 0;
  opacity: var(--coach-p);
  background:
    radial-gradient(460px circle at 30% 52%, rgba(255, 45, 85, 0.2), transparent 70%),
    radial-gradient(760px circle at 24% 44%, rgba(255, 45, 85, 0.1), transparent 66%),
    radial-gradient(540px circle at 86% 68%, rgba(204, 255, 0, 0.05), transparent 70%);
}

.dashboard-grid {
  position: absolute;
  inset: -20%;
  opacity: calc((0.16 + var(--lid-p) * 0.14) * (1 - var(--zoom-p) * 0.72));
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at 70% 50%, #000 0%, transparent 70%);
  /* The mask travels with the element, so a plain X shift carries the lit
     patch across to follow the laptop into act 2 - no second grid layer and
     no per-frame mask re-resolve. */
  transform:
    perspective(900px)
    rotateX(60deg)
    translateX(calc(var(--coach-p) * -40%))
    translateY(calc(var(--lid-p) * -60px));
}

.dashboard-pulse {
  /* Switched wholesale in act 2 rather than interpolated: the rings are wide,
     soft and slow, so a transitioned colour swap is indistinguishable from a
     lerp and costs nothing per frame. */
  --pulse-rgb: 204, 255, 0;
  position: absolute;
  top: 50%;
  left: 70%;
  width: 540px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(var(--pulse-rgb), calc(0.08 + var(--lid-p) * 0.18));
  box-shadow:
    0 0 36px rgba(var(--pulse-rgb), calc(0.04 + var(--lid-p) * 0.06)),
    inset 0 0 32px rgba(var(--pulse-rgb), calc(0.02 + var(--lid-p) * 0.05));
  transform:
    translate(-50%, -50%)
    translateX(calc(var(--coach-p) * -40vw))
    scale(calc(0.85 + var(--lid-p) * 0.3));
  opacity: calc((0.22 + var(--lid-p) * 0.4) * (1 - var(--zoom-p) * 0.85));
  transition: border-color 500ms linear, box-shadow 500ms linear;
}

.dashboard-section.is-coach-active .dashboard-pulse {
  --pulse-rgb: 255, 45, 85;
}

.pulse-two {
  width: 780px;
  opacity: calc((0.1 + var(--lid-p) * 0.22) * (1 - var(--zoom-p) * 0.85));
  transform:
    translate(-50%, -50%)
    translateX(calc(var(--coach-p) * -40vw))
    scale(calc(0.7 + var(--lid-p) * 0.42));
}

.dashboard-macbook-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: calc(1 - var(--exit-macbook));
  transform: translate3d(0, var(--exit-macbook-y), 0);
}

.dashboard-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(320px, 0.85fr) minmax(540px, 1.15fr);
  gap: clamp(40px, 6vw, 92px);
  align-items: center;
  width: 100%;
}

.dashboard-bg {
  opacity: calc(1 - var(--exit-bg) * 0.82);
  transform: translate3d(0, var(--exit-bg-y), 0);
  will-change: opacity, transform;
}

.dashboard-copy {
  max-width: 560px;
}

.dashboard-copy-head {
  opacity: var(--chrome-p);
  transform: translate3d(
    calc((1 - var(--chrome-p)) * -18px),
    calc((1 - var(--chrome-p)) * -12px),
    0
  );
  will-change: opacity, transform;
}

.dashboard-lede {
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
  max-width: 520px;
}

.dashboard-features {
  margin: 36px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.dashboard-feature {
  --i: 0;
  --exit-row: 0;
  --exit-row-y: 0px;
  position: relative;
  padding: 18px 0;
  will-change: opacity, transform;
}

.dashboard-feature-line,
.dashboard-feature:last-child::before {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.dashboard-feature-line {
  top: 0;
}

.dashboard-feature:last-child::before {
  content: '';
  bottom: 0;
}

.dashboard-feature.reveal {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 480ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 480ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dashboard-feature.reveal.in {
  opacity: var(--chrome-p);
  transform: translate3d(0, calc((1 - var(--chrome-p)) * 10px), 0);
  transition:
    opacity 160ms linear,
    transform 160ms linear;
}

/* Act 2's rows ride --coach-p in and the shared --exit-row stagger out. */
.dashboard-feature.coach-feature.reveal.in {
  opacity: calc(var(--coach-p) * (1 - var(--exit-row)));
  transform: translate3d(0, calc(var(--exit-row-y) + (1 - var(--coach-p)) * 12px), 0);
}

.dashboard-feature-tag {
  color: var(--liftag-primary);
  font-size: 9px;
}

.dashboard-feature-title {
  margin: 6px 0 0;
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #fff;
  line-height: 1.1;
}

.dashboard-feature-body {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 300;
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-feature.reveal,
  .dashboard-feature.reveal.in {
    transform: none;
    transition: none;
  }
}

.dashboard-stage {
  position: relative;
  height: 560px;
  min-height: 480px;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Floating data chips around the macbook ─────────────────────────── */
.dash-chip {
  position: absolute;
  background: rgba(10, 10, 10, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7);
  z-index: 6;
  transition: opacity 140ms linear;
  will-change: transform, opacity;
  pointer-events: none;
}

/* Catalog sync chip - bottom-left, like the QR chip */
.dash-chip-sync {
  bottom: 176px;
  left: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-color: rgba(204, 255, 0, 0.3);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7), 0 0 36px rgba(204, 255, 0, 0.18);
  translate: calc((1 - var(--chrome-p)) * -12px) calc((1 - var(--chrome-p)) * 18px);
}

.dash-chip-sync .dash-chip-icon {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #050505;
  border: 1.5px solid rgba(204, 255, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px rgba(204, 255, 0, 0.45);
}

.dash-chip-sync .dash-chip-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--liftag-primary);
  box-shadow:
    0 0 8px var(--liftag-primary),
    0 0 16px rgba(204, 255, 0, 0.6);
  animation: dashChipPulse 1.6s ease-in-out infinite;
}

@keyframes dashChipPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

.dash-chip-sync .dash-chip-tag {
  color: var(--liftag-primary);
  font-size: 9px;
}

.dash-chip-sync .dash-chip-title {
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #fff;
  margin-top: 2px;
  white-space: nowrap;
}

/* Live machine count chip - top-right, like the volume chip */
.dash-chip-metric {
  top: 28px;
  right: -24px;
  min-width: 168px;
  translate: calc((1 - var(--chrome-p)) * 14px) calc((1 - var(--chrome-p)) * -16px);
  cursor: crosshair;
}

.dash-chip-metric .dash-chip-mtag {
  color: rgba(255, 255, 255, 0.4);
  font-size: 9px;
}

.dash-chip-metric .dash-chip-mvalue {
  font-family: var(--liftag-font-mono);
  font-weight: 800;
  font-size: 26px;
  color: var(--liftag-primary);
  letter-spacing: -0.02em;
  margin-top: 4px;
  line-height: 1;
}

.dash-chip-metric .dash-chip-munit {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
}

.dash-chip-metric .dash-chip-delta {
  font-size: 11px;
  color: #22c55e;
  font-family: var(--liftag-font-mono);
  font-weight: 700;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dash-chip-metric .dash-chip-spark {
  width: 86px;
  height: 26px;
  margin-top: 8px;
  display: block;
  overflow: visible;
  touch-action: none;
}

.dash-chip-metric .dash-chip-spark polyline,
.dash-chip-metric .dash-chip-spark circle {
  filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.42));
}

/* Deploy badge - mid-right, lime accent like the PR badge */
.dash-chip-deploy {
  bottom: 138px;
  right: 24px;
  background: rgba(204, 255, 0, 0.95);
  border: none;
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: 0 0 40px rgba(204, 255, 0, 0.5);
  translate: calc((1 - var(--chrome-p)) * 12px) calc((1 - var(--chrome-p)) * 14px);
}

.dash-chip-deploy .dash-chip-deploy-tag {
  font-family: var(--liftag-font-mono);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #0e0e0e;
}

.dash-chip-deploy .dash-chip-deploy-title {
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-weight: 700;
  font-size: 17px;
  text-transform: uppercase;
  color: #0e0e0e;
  letter-spacing: -0.03em;
  margin-top: 2px;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .dash-chip-sync .dash-chip-pulse {
    animation: none;
  }
}

.dashboard-stage-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(42% 42% at 50% 58%, rgba(204, 255, 0, calc(0.1 + var(--lid-p) * 0.18)), transparent 72%),
    radial-gradient(68% 58% at 50% 62%, rgba(204, 255, 0, calc(0.04 + var(--lid-p) * 0.08)), transparent 76%);
  opacity: calc((0.4 + var(--lid-p) * 0.6) * (1 - var(--exit-stage-glow)) * (1 - var(--zoom-p) * 0.88) * (1 - var(--coach-p)));
  transform: translate3d(0, var(--exit-stage-glow-y), 0);
  will-change: opacity, transform;
}

.dashboard-hint {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%) translateY(calc((1 - var(--chrome-p)) * -8px));
  pointer-events: none;
  z-index: 3;
  opacity: calc((1 - var(--lid-p)) * var(--chrome-p) * (1 - var(--coach-p)));
  transition: opacity 140ms linear;
}

.dashboard-hint .protocol {
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(204, 255, 0, 0.7);
}

.dashboard-macbook-mount {
  position: relative;
  width: min(100%, 760px);
  aspect-ratio: 1.3 / 1;
  z-index: 2;
  pointer-events: none;
}

.dashboard-fallback-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

/* ── Act 2: the coach dashboard ─────────────────────────────────────────
   Mirrored against act 1 - laptop on the left, copy on the right - and keyed
   red rather than lime. The mirror is what the un-zoom reveals (the laptop
   travels across the stage as the camera pulls back), and the red both marks
   act 2 as its own thing and hands the page over to TrainersSection, which
   picks the same accent up immediately after. */
.coach-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(540px, 1.15fr) minmax(320px, 0.85fr);
  gap: clamp(40px, 6vw, 92px);
  align-items: center;
  width: 100%;
  transform: translate3d(0, var(--exit-flow-y), 0) scale(var(--exit-flow-scale));
  transform-origin: center center;
  will-change: transform;
}

.coach-stage {
  position: relative;
  width: min(100%, 760px);
  justify-self: center;
  aspect-ratio: 1.3 / 1;
  isolation: isolate;
  /* Doubles as the laptop's act-2 alignment box, so it must keep a real
     measurable rect at all times: never display: none, and no opacity of its
     own either - each child fades on --coach-p individually so the chips are
     not faded twice. */
}

/* Act 2 deliberately has no in-stage glow element. `.coach-layout` carries a
   z-index, so anything inside it composites *over* the WebGL canvas, and a red
   wash at that depth greys the coach footage out instead of lighting it -
   mix-blend-mode cannot help, because blending is confined to the nearest
   stacking context and the canvas is outside it. The act-2 ambient therefore
   lives in `.dashboard-bg-coach`, which sits genuinely behind the laptop. */

.coach-fallback-img {
  position: absolute;
  inset: 0;
  opacity: var(--coach-p);
}

.coach-copy {
  max-width: 560px;
}

.coach-copy-head {
  opacity: calc(var(--coach-p) * (1 - var(--exit-copy)));
  transform: translate3d(
    calc((1 - var(--coach-p)) * 18px),
    calc(var(--exit-copy-y) + (1 - var(--coach-p)) * 14px),
    0
  );
  will-change: opacity, transform;
}

.coach-accent {
  color: var(--liftag-red-neon);
}

.coach-lede {
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
  max-width: 520px;
}

.coach-feature-tag {
  color: var(--liftag-red-neon);
}

.coach-chip {
  border-color: rgba(255, 45, 85, 0.28);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7), 0 0 34px rgba(255, 45, 85, 0.14);
}

.coach-chip-tag {
  font-size: 9px;
  color: rgba(255, 45, 85, 0.85);
}

/* Clear of the lid: the whole point of act 2 is the screen, so nothing floats
   over the part of it the reader is meant to be reading. */
.coach-chip-clients {
  top: 24px;
  right: -20px;
  min-width: 150px;
}

.coach-chip-value {
  margin-top: 4px;
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-weight: 700;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff;
}

.coach-chip-unit {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.45);
}

.coach-chip-month {
  bottom: 118px;
  right: 60px;
}

.coach-chip-row {
  margin-top: 6px;
  display: flex;
  gap: 14px;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.coach-chip-row b {
  color: #fff;
  font-weight: 700;
}

.coach-chip-focus {
  bottom: 172px;
  left: 8px;
  min-width: 180px;
}

.coach-chip-focus-name {
  margin-top: 5px;
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-weight: 700;
  font-size: 17px;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: #fff;
}

.coach-chip-bar {
  margin-top: 7px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  overflow: hidden;
}

.coach-chip-bar span {
  display: block;
  width: 62%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--liftag-red-neon), rgba(204, 255, 0, 0.85));
}

.coach-chip-focus-meta {
  margin-top: 6px;
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.42);
}

/* ── The handoff, staged inside the punched-in screen ───────────────────
   At full zoom the display fills the frame, so this overlay reads as content
   on the laptop rather than as page furniture on top of it. */
.coach-handoff {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: var(--card-p);
  overflow: hidden;
}

.coach-handoff-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(72% 62% at 50% 50%, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0.88) 78%);
}

/* A full-viewport backdrop blur is far too expensive to leave mounted for the
   whole section, so it is attached only while the card is actually on screen. */
.dashboard-section.is-card-active .coach-handoff-scrim {
  /* Fixed radius. Animating the blur radius makes the browser regenerate the
     blurred backdrop from scratch every frame; the parent's opacity already
     fades the whole scrim in, so the radius never needs to move. */
  backdrop-filter: blur(16px) saturate(1.1);
  -webkit-backdrop-filter: blur(16px) saturate(1.1);
}

.coach-handoff-copy {
  position: relative;
  z-index: 1;
  max-width: min(860px, 84vw);
  text-align: center;
  transform: translate3d(0, calc((1 - var(--card-p)) * 26px), 0);
}

.coach-handoff-eyebrow {
  display: block;
  font-size: 10px;
  color: var(--liftag-primary);
}

.coach-handoff-title {
  margin: 18px 0 0;
  font-size: clamp(34px, 5.4vw, 76px);
  color: #fff;
}

/* Full-bleed so the clip can be expressed against the frame the beam crosses
   rather than against the centred copy box, which would need its own offset
   maths. The inner copy re-centres itself exactly as the original does. */
.coach-handoff-burn {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  pointer-events: none;
  clip-path: inset(0 calc(100% - var(--sweep-p) * 100vw) 0 0);
}

.coach-handoff-copy.is-burn,
.coach-handoff-copy.is-burn .coach-handoff-title {
  color: transparent;
}

/* Everything the beam has passed is re-keyed to act 2's accent - it arrives
   burnt in, ahead of the section it belongs to. */
.coach-handoff-copy.is-burn .coach-handoff-eyebrow,
.coach-handoff-copy.is-burn .coach-handoff-title > span {
  color: var(--liftag-red-neon);
  text-shadow: 0 0 22px rgba(255, 45, 85, 0.55);
}

/* The sweep is what the eye credits for the change: the footage cross-fade
   happens behind it, so a single object crossing the frame reads as a wipe
   rather than as a dissolve. It also covers the case where the second encode
   is still buffering when the swap is due. */
.coach-handoff-sweep {
  position: absolute;
  z-index: 3;
  top: -10%;
  bottom: -10%;
  left: 0;
  width: 3px;
  /* Keyed to --handoff-key, so the beam is always exactly the colour the tip
     of the rail is showing at that instant: lime on the way in, red by the
     time it has finished crossing. The core stays white-hot regardless.
     This is the one thing here that repaints rather than just recompositing,
     but it is a 3px line and only for the span of the swap. */
  background: linear-gradient(180deg, transparent, var(--handoff-key) 18%, #fff 50%, var(--handoff-key) 82%, transparent);
  box-shadow:
    0 0 24px 6px color-mix(in srgb, transparent, var(--handoff-key) 55%),
    0 0 90px 26px color-mix(in srgb, transparent, var(--handoff-key) 22%);
  transform: translate3d(calc(var(--sweep-p) * 100vw), 0, 0);
  /* Only lit while it is actually travelling. */
  opacity: calc(4 * var(--sweep-p) * (1 - var(--sweep-p)));
  will-change: transform, opacity;
}

/* ── Handoff rail ──────────────────────────────────────────────────────
   The dwell is a deliberate pause, but an unexplained pause just reads as a
   page that stopped responding. This shows how much scroll is left before the
   footage hands over, marks the exact handover point, and says outright that
   standing still leaves the recording playing. */
.coach-rail {
  position: absolute;
  left: 50%;
  bottom: max(38px, calc(var(--liftag-safe-bottom) + 16px));
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(340px, 76vw);
  padding: 12px 18px 11px;
  pointer-events: none;
  /* It is read against whatever the recording happens to be showing, which is
     often a bright chart or a white panel, so it carries its own plate rather
     than trusting the footage to stay dark behind it. */
  background: rgba(6, 6, 6, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--liftag-r-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  /* No backdrop-filter here on purpose: unlike the handoff card this is on
     screen for the entire locked window - the most expensive stretch of the
     section - and at 82% opacity the blur was buying nothing. */
  /* Rides the punch-in: appears as the camera dives into the screen and is
     gone again by the time it has pulled back out. */
  opacity: var(--zoom-p);
  transform: translate3d(-50%, calc((1 - var(--zoom-p)) * 12px), 0);
  will-change: opacity, transform;
}

.coach-rail-labels {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 9px;
}

.coach-rail-label {
  font-size: 9px;
  letter-spacing: 0.24em;
  transition: color 200ms linear;
}

.coach-rail-label.is-gym {
  color: rgba(204, 255, 0, calc(0.4 + (1 - var(--blend-p)) * 0.55));
}

.coach-rail-label.is-coach {
  color: rgba(255, 105, 135, calc(0.4 + var(--blend-p) * 0.55));
}

.coach-rail-track {
  position: relative;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.coach-rail-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: calc(var(--rail-p) * 100%);
  border-radius: inherit;
  background: linear-gradient(90deg, var(--liftag-primary), var(--handoff-key));
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.45);
}

.coach-rail-tick {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 10px;
  margin-left: -1px;
  border-radius: 1px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.3);
  /* Lights up in the act-2 accent as the footage it marks actually changes. */
  background: color-mix(in srgb, rgba(255, 255, 255, 0.3), var(--liftag-red-neon) calc(var(--blend-p) * 100%));
  box-shadow: 0 0 calc(var(--blend-p) * 14px) rgba(255, 45, 85, var(--blend-p));
}

/* Floated below the plate rather than sitting inside it: it fades out once the
   handover has happened, and an invisible row inside the pill would leave the
   plate looking bottom-heavy for the rest of the dwell. */
.coach-rail-hint {
  position: absolute;
  top: 100%;
  margin-top: 9px;
  font-size: 8px;
  letter-spacing: 0.26em;
  color: rgba(255, 255, 255, 0.45);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  opacity: calc(1 - var(--blend-p));
}

/* Short desktop viewports (unmaximized browser windows, 13"-14" laptops with
   browser chrome eating vertical space, etc.) - the copy column's fixed-size
   title/lede/feature rows can exceed the sticky container's height, and since
   the layout is vertically centered with overflow:hidden, both the headline
   top and the last feature row's bottom get clipped. Shrink the text block
   with height-aware clamps so it always fits; wide/tall desktops keep the
   original full-size design untouched. */
@media (min-width: 981px) and (max-height: 980px) {
  .dashboard-copy-head :deep(.protocol) {
    margin-bottom: clamp(6px, 1.4vh, 18px) !important;
  }

  .dashboard-copy-head :deep(.display) {
    font-size: clamp(28px, min(6vw, 4.8vh), 84px) !important;
    line-height: 0.96 !important;
  }

  .dashboard-lede {
    margin-top: clamp(8px, 1.8vh, 28px);
    font-size: clamp(13px, 1.3vh, 17px);
    line-height: 1.4;
  }

  .dashboard-features {
    margin-top: clamp(10px, 2vh, 36px);
  }

  .dashboard-feature {
    padding: clamp(6px, 1.3vh, 18px) 0;
  }

  .dashboard-feature-title {
    margin-top: clamp(2px, 0.5vh, 6px);
    font-size: clamp(15px, 1.5vh, 18px);
  }

  .dashboard-feature-body {
    margin-top: clamp(2px, 0.4vh, 6px);
    font-size: clamp(11px, 1.1vh, 13px);
    line-height: 1.35;
  }

  .coach-copy-head :deep(.protocol) {
    margin-bottom: clamp(6px, 1.4vh, 18px) !important;
  }

  .coach-copy-head :deep(.display) {
    font-size: clamp(28px, min(6vw, 4.8vh), 84px) !important;
    line-height: 0.96 !important;
  }

  .coach-lede {
    margin-top: clamp(8px, 1.8vh, 28px);
    font-size: clamp(13px, 1.3vh, 17px);
    line-height: 1.4;
  }

  .coach-features {
    margin-top: clamp(10px, 2vh, 36px);
  }
}

@media (max-width: 980px) {
  .dashboard-section {
    min-height: var(--liftag-stable-vh-560);
  }

  .dashboard-sticky {
    top: calc(64px + var(--liftag-safe-top));
    height: calc(var(--liftag-stable-vh) - 64px - var(--liftag-safe-top));
    min-height: 820px;
  }

  .dashboard-layout,
  .coach-layout {
    grid-template-columns: 1fr;
    gap: 36px;
    align-content: center;
  }

  .dashboard-copy,
  .coach-copy {
    max-width: 620px;
  }

  .dashboard-stage {
    height: 460px;
    min-height: 460px;
  }

  /* The tablet tier stacks act 2 the same way act 1 stacks, laptop first. */
  .coach-stage {
    order: -1;
    width: min(100%, 620px);
    justify-self: start;
  }

  .dashboard-features {
    margin-top: 24px;
  }

  .dash-chip-sync {
    bottom: 122px;
    left: 24px;
  }
  .dash-chip-metric {
    top: 8px;
    right: -8px;
    min-width: 148px;
  }
  .dash-chip-deploy {
    bottom: 88px;
    right: 8px;
  }

  .coach-chip-clients {
    top: 4px;
    right: -8px;
    min-width: 140px;
  }
  .coach-chip-month {
    bottom: 40px;
    right: 4px;
  }
  .coach-chip-focus {
    bottom: 84px;
    left: 10px;
    min-width: 168px;
  }
}

@media (max-width: 620px) {
  .dash-chip {
    display: none;
  }

  .dashboard-section {
    min-height: var(--liftag-stable-vh-560);
  }

  .dashboard-sticky {
    top: calc(64px + var(--liftag-safe-top));
    height: calc(var(--liftag-stable-vh) - 64px - var(--liftag-safe-top));
    min-height: 0;
    align-content: start;
    padding: 18px 0 max(18px, var(--liftag-safe-bottom));
  }

  .dashboard-layout,
  .coach-layout {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
    height: 100%;
    overflow: hidden;
    transform-origin: top center;
  }

  .dashboard-copy,
  .coach-copy {
    display: contents;
    max-width: none;
  }

  .dashboard-copy-head {
    order: 1;
    max-width: 360px;
    /* On phones the copy sits in the document flow above the laptop, so it
       should remain readable while the screen punches in. Desktop still fades
       its overlapping chrome through --chrome-p. */
    opacity: calc(1 - var(--act1-out));
    transform: translate3d(0, calc(var(--act1-out) * -26px), 0);
  }

  .dashboard-copy-head :deep(.display) {
    font-size: clamp(34px, 10.8vw, 46px) !important;
    line-height: 0.96 !important;
    letter-spacing: 0 !important;
    max-width: 330px !important;
  }

  .dashboard-copy-head :deep(.protocol) {
    margin-bottom: 12px !important;
  }

  .dashboard-lede {
    margin-top: 14px;
    max-width: 20.5rem;
    font-size: 14px;
    line-height: 1.48;
  }

  .dashboard-stage {
    order: 2;
    width: calc(100% + 24px);
    height: clamp(276px, calc(var(--liftag-stable-vh-39) * 1.12), 340px);
    min-height: 276px;
    margin: -2px -12px 0;
    align-items: flex-start;
  }

  .dashboard-stage-glow {
    inset: -18px 0 -8px;
  }

  .dashboard-hint {
    top: 0;
  }

  .dashboard-hint .protocol {
    font-size: 8px;
    letter-spacing: 0.18em;
  }

  /* Matches .coach-stage's height below rather than deriving it from the
     1.3:1 aspect-ratio the desktop tier uses, so the gym and coach acts'
     laptops - which the 3D layer sizes off this rect - land the same size
     on a phone instead of the coach one reading smaller. */
  .dashboard-macbook-mount {
    width: min(100%, 450px);
    height: clamp(276px, calc(var(--liftag-stable-vh-39) * 1.12), 340px);
    aspect-ratio: auto;
    margin-top: 8px;
  }

  /* The 3D canvas fills .dashboard-sticky and frames the laptop centered
     within it regardless of where the (invisible) mount/stage rect sits, so
     nudging the canvas itself - rather than the mount - is what actually
     moves the rendered laptop. The extra (1 - --zoom-p) lift is rest-pose
     only: the punch-in stays on the existing -26px so the screen does not
     drift while zoomed. */
  .dashboard-macbook-layer {
    transform: translate3d(
      0,
      calc(var(--exit-macbook-y) - 26px - (1 - var(--zoom-p)) * 36px),
      0
    );
  }

  .dashboard-features {
    order: 3;
    width: 100%;
    margin-top: 0;
    gap: 0;
  }

  .dashboard-feature {
    padding: 9px 0;
  }

  .dashboard-feature.reveal.in {
    opacity: calc(1 - var(--act1-out));
    transform: translate3d(0, calc(var(--act1-out) * -20px), 0);
  }

  .dashboard-feature-title {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.12;
    letter-spacing: 0;
  }

  .dashboard-feature-tag {
    font-size: 7px;
    letter-spacing: 0.2em;
  }

  .dashboard-feature-body {
    display: none;
  }

  /* Act 2 reuses act 1's proven phone stack: copy head, then the laptop, then
     the feature rows - the chips are already hidden by the .dash-chip rule at
     the top of this block. */
  .coach-copy-head {
    order: 1;
    max-width: 360px;
  }

  .coach-copy-head :deep(.display) {
    font-size: clamp(34px, 10.8vw, 46px) !important;
    line-height: 0.96 !important;
    letter-spacing: 0 !important;
    max-width: 330px !important;
  }

  .coach-copy-head :deep(.protocol) {
    margin-bottom: 12px !important;
  }

  .coach-lede {
    margin-top: 14px;
    max-width: 20.5rem;
    font-size: 14px;
    line-height: 1.48;
  }

  .coach-stage {
    order: 2;
    width: calc(100% + 24px);
    height: clamp(276px, calc(var(--liftag-stable-vh-39) * 1.12), 340px);
    min-height: 276px;
    margin: -2px -12px 0;
    aspect-ratio: auto;
    justify-self: stretch;
  }

  .coach-features {
    order: 3;
    width: 100%;
    margin-top: 0;
    gap: 0;
  }

  /* Phones show the whole rail width but it must not crowd the laptop. */
  .coach-rail {
    width: min(280px, 82vw);
    bottom: max(14px, var(--liftag-safe-bottom));
    gap: 7px;
  }

  .coach-rail-label {
    font-size: 7px;
    letter-spacing: 0.18em;
  }

  .coach-rail-hint {
    font-size: 7px;
    letter-spacing: 0.18em;
  }

  .coach-handoff-title {
    font-size: clamp(28px, 8.4vw, 44px);
  }

  .coach-handoff-copy {
    max-width: 88vw;
  }

  /* backdrop-filter over a full phone viewport is the single most expensive
     thing this section could do mid-scroll, and the scrim alone reads the
     same at this size. */
  .dashboard-section.is-card-active .coach-handoff-scrim {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: radial-gradient(80% 70% at 50% 50%, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.93) 76%);
  }
}

/* Short phones (Safari/Chrome with visible chrome, small Android screens):
   the sticky column stacks copy-head -> stage -> features with overflow:
   hidden, so on short viewports the whole "YOUR TEAM" row (last in the
   stack) can fall entirely outside the visible box. Tighten spacing so all
   three feature rows stay on screen; taller phones are unaffected. */
@media (max-width: 620px) and (max-height: 760px) {
  .dashboard-sticky {
    padding: 10px 0 max(10px, var(--liftag-safe-bottom));
  }

  .dashboard-layout,
  .coach-layout {
    gap: 8px;
  }

  .dashboard-copy-head :deep(.protocol),
  .coach-copy-head :deep(.protocol) {
    margin-bottom: 6px !important;
  }

  .dashboard-copy-head :deep(.display),
  .coach-copy-head :deep(.display) {
    font-size: clamp(26px, 8.4vw, 38px) !important;
  }

  .dashboard-lede,
  .coach-lede {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.35;
  }

  .dashboard-stage,
  .coach-stage {
    height: clamp(150px, 26vh, 230px);
    min-height: 150px;
    margin: 0 -12px 0;
  }

  .dashboard-macbook-mount {
    height: clamp(150px, 26vh, 230px);
    margin-top: 6px;
  }

  .dashboard-macbook-layer {
    transform: translate3d(
      0,
      calc(var(--exit-macbook-y) - 26px - (1 - var(--zoom-p)) * 18px),
      0
    );
  }

  .dashboard-features {
    margin-top: 0;
    gap: 0;
  }

  .dashboard-feature {
    padding: 4px 0;
  }

  .dashboard-feature-tag {
    font-size: 6px;
  }

  .dashboard-feature-title {
    margin-top: 2px;
    font-size: 11px;
  }

  .coach-rail {
    bottom: max(6px, var(--liftag-safe-bottom));
    gap: 5px;
  }
}

/* Reduced motion drops the camera performance entirely. Two acts cannot share
   one pinned viewport without it, so the sticky is released and they stack as
   ordinary blocks, each showing its own still. The WebGL laptop goes with it:
   the alternative was pinning act 1 and leaving act 2 with nothing to look at. */
@media (prefers-reduced-motion: reduce) {
  .dashboard-section {
    min-height: 0;
  }

  .dashboard-sticky {
    position: static;
    display: block;
    height: auto;
    min-height: 0;
    overflow: visible;
    padding: 96px 0;
  }

  .dashboard-macbook-layer,
  .coach-handoff,
  .coach-rail,
  .dashboard-hint {
    display: none;
  }

  .dashboard-layout,
  .coach-layout {
    grid-area: auto;
  }

  .coach-layout {
    margin-top: 120px;
  }

  .dashboard-stage :deep(.macbook-3d-mount),
  .coach-stage :deep(.macbook-3d-mount) {
    display: none;
  }

  .dashboard-fallback-img,
  .coach-fallback-img {
    opacity: 1;
  }
}
</style>
