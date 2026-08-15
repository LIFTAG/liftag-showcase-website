<script setup lang="ts">
import { clamp01, mapDashboardScroll, smootherstep, smoothstep } from '../utils/dashboardScroll'
import type { ScreenVideoSource } from '../utils/macbookScreen'

const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const mountRef = ref<HTMLElement | null>(null)

const openProgress = ref(0)
const zoomProgress = ref(0)
const chromeProgress = ref(1)
const entered = ref(false)
const shouldUseDashboardVideo = ref(false)

// AV1 first, H.264 as the universal fallback. Same 1440x904 master; the AV1
// encode is roughly half the bytes, so only browsers without AV1 decode (older
// Safari, Intel Macs) pay for the larger file.
const DASHBOARD_VIDEO_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/macbook-dashboard.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/macbook-dashboard.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

const dashboardVideoSources = computed(() => (
  shouldUseDashboardVideo.value ? DASHBOARD_VIDEO_SOURCES : undefined
))

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

let observer: IntersectionObserver | null = null
let rafId = 0
let isVisible = false
let reduceMotion = false
let hasEntered = false
let dashboardVideoQuery: MediaQueryList | null = null
let lastTickKey = ''
let idleFrames = 0

function exitSlice(p: number, start: number, duration: number) {
  return smoothstep((p - start) / duration)
}

function setExitMotion(section: HTMLElement, key: string, value: number, y: number, blur: number) {
  section.style.setProperty(`--exit-${key}`, String(value))
  section.style.setProperty(`--exit-${key}-y`, `${value * y}px`)
  section.style.setProperty(`--exit-${key}-blur`, `${value * blur}px`)
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

  // Quantized to 1/200 - finer than any of these vars can resolve on screen,
  // and it lets an unchanged frame skip ~25 setProperty calls entirely.
  const p = reduceMotion ? 1 : Math.round(getScrollProgress() * 200) / 200
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

  const mapped = mapDashboardScroll(p, reduceMotion)
  openProgress.value = mapped.open
  zoomProgress.value = mapped.zoom
  chromeProgress.value = mapped.chrome

  const exitT = mapped.exit
  const exitFlow = reduceMotion ? 0 : smoothstep((p - 0.83) / 0.17)
  const exitP = reduceMotion ? -1 : p

  const section = sectionRef.value
  if (section) {
    lastTickKey = tickKey
    section.style.setProperty('--lid-p', String(mapped.open))
    section.style.setProperty('--scroll-p', String(p))
    section.style.setProperty('--zoom-p', String(mapped.zoom))
    section.style.setProperty('--chrome-p', String(mapped.chrome))
    section.style.setProperty('--chip-spread', String(smootherstep(
      (mapped.open - chipSpreadStart) / (chipSpreadEnd - chipSpreadStart),
    )))
    section.style.setProperty('--exit-p', String(exitT))
    section.style.setProperty('--exit-flow-y', `${exitFlow * -92}px`)
    section.style.setProperty('--exit-flow-scale', String(1 - exitFlow * 0.018))
    setExitMotion(section, 'copy', exitSlice(exitP, 0.845, 0.13), -28, 8)
    setExitMotion(section, 'feature-0', exitSlice(exitP, 0.86, 0.12), -20, 5)
    setExitMotion(section, 'feature-1', exitSlice(exitP, 0.88, 0.11), -24, 6)
    setExitMotion(section, 'feature-2', exitSlice(exitP, 0.90, 0.10), -28, 7)
    setExitMotion(section, 'chip-metric', exitSlice(exitP, 0.86, 0.12), -28, 6)
    setExitMotion(section, 'chip-deploy', exitSlice(exitP, 0.88, 0.11), -32, 7)
    setExitMotion(section, 'chip-sync', exitSlice(exitP, 0.90, 0.10), -34, 7)
    setExitMotion(section, 'stage-glow', exitSlice(exitP, 0.855, 0.13), -18, 16)
    setExitMotion(section, 'macbook', exitSlice(exitP, 0.88, 0.12), -46, 10)
    setExitMotion(section, 'bg', exitSlice(exitP, 0.88, 0.12), -30, 3)
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

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
})
</script>

<template>
  <section
    id="dashboard"
    ref="sectionRef"
    class="dashboard-section"
    :class="{ 'is-chrome-hidden': chromeProgress < 0.05 }"
  >
    <div class="dashboard-sticky">
      <div class="dashboard-bg" aria-hidden="true">
        <div class="dashboard-grid"></div>
        <div class="dashboard-pulse pulse-one"></div>
        <div class="dashboard-pulse pulse-two"></div>
      </div>

      <div class="dashboard-macbook-layer" aria-hidden="true">
        <ClientOnly>
          <Macbook3D
            screenshot-src="/assets/screens/dashboard-web.webp"
            :video-sources="dashboardVideoSources"
            :open-progress="openProgress"
            :zoom-progress="zoomProgress"
            :align-el="mountRef"
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
              :style="{
                '--i': i,
                '--exit-row': `var(--exit-feature-${i})`,
                '--exit-row-y': `var(--exit-feature-${i}-y)`,
                '--exit-row-blur': `var(--exit-feature-${i}-blur)`,
              }"
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
              opacity: entered ? 'calc(var(--chrome-p) * (1 - var(--exit-chip-sync)))' : 0,
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
              opacity: entered ? 'calc(var(--chrome-p) * (1 - var(--exit-chip-metric)))' : 0,
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
              opacity: entered ? 'calc(var(--chrome-p) * (1 - var(--exit-chip-deploy)))' : 0,
            }"
            aria-hidden="true"
          >
            <div class="dash-chip-deploy-tag">⚡ DEPLOYED</div>
            <div class="dash-chip-deploy-title">Bratislava · Slovakia</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
  --exit-p: 0;
  --exit-copy: 0;
  --exit-copy-y: 0px;
  --exit-copy-blur: 0px;
  --exit-feature-0: 0;
  --exit-feature-0-y: 0px;
  --exit-feature-0-blur: 0px;
  --exit-feature-1: 0;
  --exit-feature-1-y: 0px;
  --exit-feature-1-blur: 0px;
  --exit-feature-2: 0;
  --exit-feature-2-y: 0px;
  --exit-feature-2-blur: 0px;
  --exit-chip-sync: 0;
  --exit-chip-sync-y: 0px;
  --exit-chip-sync-blur: 0px;
  --exit-chip-metric: 0;
  --exit-chip-metric-y: 0px;
  --exit-chip-metric-blur: 0px;
  --exit-chip-deploy: 0;
  --exit-chip-deploy-y: 0px;
  --exit-chip-deploy-blur: 0px;
  --exit-stage-glow: 0;
  --exit-stage-glow-y: 0px;
  --exit-stage-glow-blur: 0px;
  --exit-macbook: 0;
  --exit-macbook-y: 0px;
  --exit-macbook-blur: 0px;
  --exit-bg: 0;
  --exit-bg-y: 0px;
  --exit-bg-blur: 0px;
  --exit-flow-y: 0px;
  --exit-flow-scale: 1;
  position: relative;
  min-height: 300vh;
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dashboard-section.is-chrome-hidden .dashboard-copy-head,
.dashboard-section.is-chrome-hidden .dashboard-features,
.dashboard-section.is-chrome-hidden .dash-chip,
.dashboard-section.is-chrome-hidden .dashboard-hint {
  pointer-events: none;
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
  display: flex;
  align-items: center;
  padding: 24px 0;
}

.dashboard-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(620px circle at 76% 38%, rgba(204, 255, 0, calc(0.06 + var(--lid-p) * 0.16)), transparent 64%),
    radial-gradient(540px circle at 16% 70%, rgba(255, 45, 85, 0.04), transparent 70%);
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
  transform: perspective(900px) rotateX(60deg) translateY(calc(var(--lid-p) * -60px));
}

.dashboard-pulse {
  position: absolute;
  top: 50%;
  left: 70%;
  width: 540px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(204, 255, 0, calc(0.08 + var(--lid-p) * 0.18));
  box-shadow:
    0 0 36px rgba(204, 255, 0, calc(0.04 + var(--lid-p) * 0.06)),
    inset 0 0 32px rgba(204, 255, 0, calc(0.02 + var(--lid-p) * 0.05));
  transform: translate(-50%, -50%) scale(calc(0.85 + var(--lid-p) * 0.3));
  opacity: calc((0.22 + var(--lid-p) * 0.4) * (1 - var(--zoom-p) * 0.85));
}

.pulse-two {
  width: 780px;
  opacity: calc((0.1 + var(--lid-p) * 0.22) * (1 - var(--zoom-p) * 0.85));
  transform: translate(-50%, -50%) scale(calc(0.7 + var(--lid-p) * 0.42));
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
  transform: translate3d(0, var(--exit-flow-y), 0) scale(var(--exit-flow-scale));
  transform-origin: center center;
  will-change: transform;
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
  opacity: calc(var(--chrome-p) * (1 - var(--exit-copy)));
  transform: translate3d(
    calc((1 - var(--chrome-p)) * -18px),
    calc(var(--exit-copy-y) + (1 - var(--chrome-p)) * -12px),
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
  --exit-row-blur: 0px;
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
  opacity: calc(var(--chrome-p) * (1 - var(--exit-row)));
  transform: translate3d(0, calc(var(--exit-row-y) + (1 - var(--chrome-p)) * 10px), 0);
  transition:
    opacity 160ms linear,
    transform 160ms linear;
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
  translate: calc((1 - var(--chrome-p)) * -12px) calc(var(--exit-chip-sync-y) + (1 - var(--chrome-p)) * 18px);
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
  translate: calc((1 - var(--chrome-p)) * 14px) calc(var(--exit-chip-metric-y) + (1 - var(--chrome-p)) * -16px);
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
  translate: calc((1 - var(--chrome-p)) * 12px) calc(var(--exit-chip-deploy-y) + (1 - var(--chrome-p)) * 14px);
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
  opacity: calc((0.4 + var(--lid-p) * 0.6) * (1 - var(--exit-stage-glow)) * (1 - var(--zoom-p) * 0.88));
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
  opacity: calc((1 - var(--lid-p)) * var(--chrome-p));
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

@media (max-width: 980px) {
  .dashboard-section {
    min-height: var(--liftag-stable-vh-300);
  }

  .dashboard-sticky {
    top: calc(64px + var(--liftag-safe-top));
    height: calc(var(--liftag-stable-vh) - 64px - var(--liftag-safe-top));
    min-height: 820px;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 36px;
    align-content: center;
  }

  .dashboard-copy {
    max-width: 620px;
  }

  .dashboard-stage {
    height: 460px;
    min-height: 460px;
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
}

@media (max-width: 620px) {
  .dash-chip {
    display: none;
  }

  .dashboard-section {
    min-height: var(--liftag-stable-vh-300);
  }

  .dashboard-sticky {
    top: calc(64px + var(--liftag-safe-top));
    height: calc(var(--liftag-stable-vh) - 64px - var(--liftag-safe-top));
    min-height: 0;
    align-items: flex-start;
    padding: 18px 0 max(18px, var(--liftag-safe-bottom));
  }

  .dashboard-layout {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
    height: 100%;
    overflow: hidden;
    transform-origin: top center;
  }

  .dashboard-copy {
    display: contents;
    max-width: none;
  }

  .dashboard-copy-head {
    order: 1;
    max-width: 360px;
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
    height: clamp(258px, var(--liftag-stable-vh-39), 320px);
    min-height: 258px;
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

  .dashboard-macbook-mount {
    width: min(100%, 450px);
    margin-top: 18px;
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
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-section {
    min-height: var(--liftag-stable-vh);
  }
}
</style>
