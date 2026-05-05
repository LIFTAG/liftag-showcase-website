<script setup lang="ts">
const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)

const openProgress = ref(0)
const entered = ref(false)
const shouldUseDashboardVideo = ref(false)

const DASHBOARD_VIDEO_SRC = '/assets/videos/macbook-dashboard.mp4'

const dashboardVideoSrc = computed(() => (
  shouldUseDashboardVideo.value ? DASHBOARD_VIDEO_SRC : undefined
))

// Shared singleton — no per-component window listener. useLerp's rAF reads
// rawMouse.x/y each frame, so pointing it at the shared `latest` object
// (whose .x/.y are kept in sync by the single global handler) gives identical
// behaviour at zero per-component cost.
const rawMouse = useSharedMouse().latest
const mouse = useLerp(rawMouse, 0.06)

const c1 = computed(() => ({
  x: mouse.value.x * 24,
  y: mouse.value.y * 14,
}))
const c2 = computed(() => ({
  x: mouse.value.x * -18,
  y: mouse.value.y * 10,
}))
const c3 = computed(() => ({
  x: mouse.value.x * 32,
  y: mouse.value.y * -12,
}))

const chipSpreadStart = 0.12
const chipSpreadEnd = 0.92

const chipSpread = computed(() => smootherstep(
  (openProgress.value - chipSpreadStart) / (chipSpreadEnd - chipSpreadStart),
))

let observer: IntersectionObserver | null = null
let rafId = 0
let isVisible = false
let reduceMotion = false
let hasEntered = false
let dashboardVideoQuery: MediaQueryList | null = null

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function smoothstep(v: number) {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

function smootherstep(v: number) {
  const t = clamp01(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function exitSlice(p: number, start: number, duration: number) {
  return smoothstep((p - start) / duration)
}

function setExitMotion(section: HTMLElement, key: string, value: number, y: number, blur: number) {
  section.style.setProperty(`--exit-${key}`, String(value))
  section.style.setProperty(`--exit-${key}-y`, `${value * y}px`)
  section.style.setProperty(`--exit-${key}-blur`, `${value * blur}px`)
}

function chipTransform(
  cursor: { x: number, y: number },
  packedX: number,
  packedY: number,
) {
  const packed = 1 - chipSpread.value
  const x = cursor.x + packedX * packed
  const y = cursor.y + packedY * packed
  const scale = 0.9 + chipSpread.value * 0.1

  return `translate3d(${x}px, ${y}px, 0) rotate(0deg) scale(${scale})`
}

function getScrollProgress() {
  const section = sectionRef.value
  if (!section) return 0
  const rect = section.getBoundingClientRect()
  const available = Math.max(1, rect.height - window.innerHeight)
  return clamp01(-rect.top / available)
}

function updateDashboardVideoPreference() {
  shouldUseDashboardVideo.value = dashboardVideoQuery?.matches ?? false
}

function tick() {
  if (!isVisible) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(tick)

  const p = reduceMotion ? 1 : getScrollProgress()

  // Map raw scroll progress to lid open progress.
  //   p < 0.10        : closed (entry hold)
  //   0.10 → 0.62     : lid opens
  //   0.62 → 0.80     : hold at fully open
  //   0.80 → 1.00     : content keeps drifting upward while fading out
  const lidT = smoothstep((p - 0.1) / 0.52)
  const exitT = reduceMotion ? 0 : smoothstep((p - 0.8) / 0.2)
  const exitFlow = reduceMotion ? 0 : smoothstep((p - 0.78) / 0.22)
  const exitP = reduceMotion ? -1 : p
  openProgress.value = lidT

  const section = sectionRef.value
  if (section) {
    section.style.setProperty('--lid-p', String(lidT))
    section.style.setProperty('--scroll-p', String(p))
    section.style.setProperty('--exit-p', String(exitT))
    section.style.setProperty('--exit-flow-y', `${exitFlow * -92}px`)
    section.style.setProperty('--exit-flow-scale', String(1 - exitFlow * 0.018))
    setExitMotion(section, 'copy', exitSlice(exitP, 0.805, 0.17), -28, 8)
    setExitMotion(section, 'feature-0', exitSlice(exitP, 0.825, 0.16), -20, 5)
    setExitMotion(section, 'feature-1', exitSlice(exitP, 0.85, 0.145), -24, 6)
    setExitMotion(section, 'feature-2', exitSlice(exitP, 0.875, 0.125), -28, 7)
    setExitMotion(section, 'chip-metric', exitSlice(exitP, 0.825, 0.16), -28, 6)
    setExitMotion(section, 'chip-deploy', exitSlice(exitP, 0.85, 0.145), -32, 7)
    setExitMotion(section, 'chip-sync', exitSlice(exitP, 0.875, 0.125), -34, 7)
    setExitMotion(section, 'stage-glow', exitSlice(exitP, 0.835, 0.165), -18, 16)
    setExitMotion(section, 'macbook', exitSlice(exitP, 0.86, 0.14), -46, 10)
    setExitMotion(section, 'bg', exitSlice(exitP, 0.86, 0.14), -30, 3)
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
  dashboardVideoQuery = window.matchMedia('(min-width: 621px) and (prefers-reduced-motion: no-preference)')
  updateDashboardVideoPreference()
  dashboardVideoQuery.addEventListener('change', updateDashboardVideoPreference)

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting
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
  >
    <div class="dashboard-sticky">
      <div class="dashboard-bg" aria-hidden="true">
        <div class="dashboard-grid"></div>
        <div class="dashboard-pulse pulse-one"></div>
        <div class="dashboard-pulse pulse-two"></div>
      </div>

      <div class="container dashboard-layout">
        <div class="dashboard-copy">
          <div class="dashboard-copy-head">
            <Eyebrow>▸ FOR GYM OWNERS</Eyebrow>
            <SectionTitle :max="560">
              Run your gyms from <span class="lime">one dashboard.</span>
            </SectionTitle>
            <p class="dashboard-lede reveal">
              Locations, machines, and managers. Run your whole brand from one screen.
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
              <span class="dashboard-feature-scan" aria-hidden="true"></span>
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
          <div class="dashboard-macbook-mount">
            <ClientOnly>
              <Macbook3D
                screenshot-src="/assets/screens/dashboard-web.webp"
                :video-src="dashboardVideoSrc"
                :open-progress="openProgress"
              />
              <template #fallback>
                <img
                  src="/assets/screens/dashboard-web.webp"
                  alt="Liftag dashboard"
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
              transform: chipTransform(c1, -8, -252),
              opacity: entered ? 'calc(1 - var(--exit-chip-sync))' : 0,
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
              transform: chipTransform(c2, -108, 46),
              opacity: entered ? 'calc(1 - var(--exit-chip-metric))' : 0,
            }"
            aria-hidden="true"
          >
            <div class="protocol dash-chip-mtag">MACHINES · LIVE</div>
            <div class="dash-chip-mvalue">
              248<span class="dash-chip-munit"> units</span>
            </div>
            <div class="dash-chip-delta">
              <span>↑</span> +24 this month
            </div>
            <svg viewBox="-3 -3 86 26" class="dash-chip-spark">
              <polyline
                points="0,18 12,15 24,16 36,11 48,10 60,7 72,5 80,2"
                fill="none"
                stroke="#CCFF00"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.75"
              />
              <circle cx="80" cy="2" r="2.5" fill="#CCFF00" />
            </svg>
          </div>

          <!-- Deploy badge (mid-right, lime accent) -->
          <div
            class="dash-chip dash-chip-deploy"
            :style="{
              transform: chipTransform(c3, -8, -174),
              opacity: entered ? 'calc(1 - var(--exit-chip-deploy))' : 0,
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
  min-height: 240vh;
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dashboard-sticky {
  position: sticky;
  top: 76px;
  height: calc(100vh - 76px);
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
  opacity: calc(0.16 + var(--lid-p) * 0.14);
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
  opacity: calc(0.22 + var(--lid-p) * 0.4);
}

.pulse-two {
  width: 780px;
  opacity: calc(0.1 + var(--lid-p) * 0.22);
  transform: translate(-50%, -50%) scale(calc(0.7 + var(--lid-p) * 0.42));
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
  opacity: calc(1 - var(--exit-copy));
  transform: translate3d(0, var(--exit-copy-y), 0);
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
  --rev-delay: calc(var(--i) * 140ms);
  --exit-row: 0;
  --exit-row-y: 0px;
  --exit-row-blur: 0px;
  position: relative;
  padding: 18px 0;
  will-change: opacity, transform;
}

/* Animated top divider: gray line that draws in left→right */
.dashboard-feature-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 760ms cubic-bezier(0.7, 0, 0.2, 1) var(--rev-delay);
  pointer-events: none;
}

/* Last feature also gets a closing divider */
.dashboard-feature:last-child::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 760ms cubic-bezier(0.7, 0, 0.2, 1) calc(var(--rev-delay) + 120ms);
  pointer-events: none;
}

/* Lime scan head that sweeps across the row */
.dashboard-feature-scan {
  position: absolute;
  top: -3px;
  left: -90px;
  width: 90px;
  height: 7px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(204, 255, 0, 0.0) 20%,
    rgba(204, 255, 0, 0.95) 50%,
    rgba(204, 255, 0, 0.0) 80%,
    transparent 100%
  );
  filter: drop-shadow(0 0 6px rgba(204, 255, 0, 0.7))
          drop-shadow(0 0 14px rgba(204, 255, 0, 0.35));
  opacity: 0;
  pointer-events: none;
  will-change: left, opacity;
}

/* Override the global .reveal so we don't translateY — we drive our own motion */
.dashboard-feature.reveal {
  opacity: 0;
  transform: none;
  transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--rev-delay) + 180ms);
}
.dashboard-feature.reveal.in {
  opacity: calc(1 - var(--exit-row));
  transform: translate3d(0, var(--exit-row-y), 0);
}

.dashboard-feature.reveal.in .dashboard-feature-line,
.dashboard-feature.reveal.in:last-child::before {
  transform: scaleX(1);
}

.dashboard-feature.reveal.in .dashboard-feature-scan {
  animation: dashScanSweep 1100ms cubic-bezier(0.65, 0, 0.2, 1) var(--rev-delay) forwards;
}

@keyframes dashScanSweep {
  0% {
    left: -90px;
    opacity: 0;
  }
  14% {
    opacity: 1;
  }
  68% {
    opacity: 1;
  }
  78% {
    left: calc(100% - 18px);
    opacity: 0.72;
  }
  100% {
    left: calc(100% + 58px);
    opacity: 0;
  }
}

/* Each piece of text rises in just behind the scan head */
.dashboard-feature-tag,
.dashboard-feature-title,
.dashboard-feature-body {
  display: block;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dashboard-feature.reveal.in .dashboard-feature-tag {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--rev-delay) + 220ms);
}
.dashboard-feature.reveal.in .dashboard-feature-title {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--rev-delay) + 320ms);
}
.dashboard-feature.reveal.in .dashboard-feature-body {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--rev-delay) + 420ms);
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
  .dashboard-feature-line,
  .dashboard-feature:last-child::before {
    transform: scaleX(1);
    transition: none;
  }
  .dashboard-feature-scan {
    display: none;
  }
  .dashboard-feature-tag,
  .dashboard-feature-title,
  .dashboard-feature-body {
    opacity: 1;
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
  transition: opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  pointer-events: none;
}

/* Catalog sync chip — bottom-left, like the QR chip */
.dash-chip-sync {
  bottom: 176px;
  left: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-color: rgba(204, 255, 0, 0.3);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7), 0 0 36px rgba(204, 255, 0, 0.18);
  transition-delay: 700ms;
  translate: 0 var(--exit-chip-sync-y);
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

/* Live machine count chip — top-right, like the volume chip */
.dash-chip-metric {
  top: 28px;
  right: -24px;
  min-width: 168px;
  transition-delay: 900ms;
  translate: 0 var(--exit-chip-metric-y);
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
}

/* Deploy badge — mid-right, lime accent like the PR badge */
.dash-chip-deploy {
  bottom: 138px;
  right: 24px;
  background: rgba(204, 255, 0, 0.95);
  border: none;
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: 0 0 40px rgba(204, 255, 0, 0.5);
  transition-delay: 1100ms;
  translate: 0 var(--exit-chip-deploy-y);
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
  opacity: calc((0.4 + var(--lid-p) * 0.6) * (1 - var(--exit-stage-glow)));
  transform: translate3d(0, var(--exit-stage-glow-y), 0);
  will-change: opacity, transform;
}

.dashboard-hint {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 3;
  opacity: calc((1 - var(--lid-p)) * (1 - var(--exit-copy)));
  transition: opacity 0.4s ease;
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
  opacity: calc(1 - var(--exit-macbook));
  transform: translate3d(0, var(--exit-macbook-y), 0) scale(calc(1 - var(--exit-macbook) * 0.035));
  will-change: opacity, transform;
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
    min-height: 220vh;
  }

  .dashboard-sticky {
    top: 64px;
    height: calc(100svh - 64px);
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
    min-height: 185vh;
  }

  .dashboard-sticky {
    top: 64px;
    height: calc(100svh - 64px);
    min-height: 0;
    align-items: flex-start;
    padding: 18px 0 max(18px, env(safe-area-inset-bottom));
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
    height: clamp(258px, 39svh, 320px);
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
    width: min(116vw, 450px);
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

  .dashboard-feature-scan {
    width: 58px;
  }
}
</style>
