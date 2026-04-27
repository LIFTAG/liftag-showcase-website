<script setup lang="ts">
interface MockApp {
  key: string
  name: string
  replaces: string
  gradient: string
  accent: string
  glow: string
  x: number
  y: number
  rotate: number
  delay: number
  depth: number
}

const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const liftagRef = ref<HTMLElement | null>(null)

const iconEls: HTMLElement[] = []
const captionEls: HTMLElement[] = []
const vectorEls: HTMLElement[] = []

let targetP = 0
let targetPointerX = 50
let targetPointerY = 50
let scrollP = 0
let pointerX = 50
let pointerY = 50
let stageScale = 1
let rafId = 0
let observer: IntersectionObserver | null = null
let stageResizeObserver: ResizeObserver | null = null
let isVisible = false
let reduceMotion = false

const mockApps: MockApp[] = [
  {
    key: 'set',
    name: 'Set Logger',
    replaces: 'Sets · RPE · notes',
    gradient: 'linear-gradient(145deg, #1cff7a 0%, #0c9f61 48%, #052a1d 100%)',
    accent: '#d7ffe8',
    glow: 'rgba(28,255,122,0.35)',
    x: -239,
    y: -180,
    rotate: -10,
    delay: 0,
    depth: 1.05,
  },
  {
    key: 'timer',
    name: 'Timer',
    replaces: 'Rest intervals',
    gradient: 'linear-gradient(145deg, #fff27a 0%, #ffb32c 50%, #7a3000 100%)',
    accent: '#fff8d2',
    glow: 'rgba(255,179,44,0.34)',
    x: 42,
    y: -248,
    rotate: 5,
    delay: 1,
    depth: 0.92,
  },
  {
    key: 'stopwatch',
    name: 'Stopwatch',
    replaces: 'Timed sets',
    gradient: 'linear-gradient(145deg, #69d6ff 0%, #1763ff 52%, #081541 100%)',
    accent: '#d9f5ff',
    glow: 'rgba(76,151,255,0.34)',
    x: 260,
    y: -164,
    rotate: -6,
    delay: 2,
    depth: 1.08,
  },
  {
    key: 'guides',
    name: 'Exercise Guides',
    replaces: 'Form videos',
    gradient: 'linear-gradient(145deg, #ff75ad 0%, #ff2d55 50%, #4f0617 100%)',
    accent: '#ffe7ef',
    glow: 'rgba(255,45,85,0.34)',
    x: 341,
    y: 30,
    rotate: -7,
    delay: 3,
    depth: 0.96,
  },
  {
    key: 'planner',
    name: 'Workout Planner',
    replaces: 'Routines',
    gradient: 'linear-gradient(145deg, #d8ff7a 0%, #ccff00 48%, #415200 100%)',
    accent: '#0b0f02',
    glow: 'rgba(204,255,0,0.38)',
    x: 226,
    y: 189,
    rotate: 8,
    delay: 4,
    depth: 1.1,
  },
  {
    key: 'progress',
    name: 'Progress Charts',
    replaces: 'Analytics',
    gradient: 'linear-gradient(145deg, #b77cff 0%, #7c3cff 48%, #190b3d 100%)',
    accent: '#f1e7ff',
    glow: 'rgba(124,60,255,0.34)',
    x: -65,
    y: 246,
    rotate: -5,
    delay: 5,
    depth: 0.94,
  },
  {
    key: 'pr',
    name: 'PR Tracker',
    replaces: 'Records',
    gradient: 'linear-gradient(145deg, #ffcb6b 0%, #f59e0b 46%, #5b2200 100%)',
    accent: '#fff5d8',
    glow: 'rgba(245,158,11,0.34)',
    x: -278,
    y: 147,
    rotate: 9,
    delay: 6,
    depth: 1.02,
  },
  {
    key: 'body',
    name: 'Body Metrics',
    replaces: 'Check-ins',
    gradient: 'linear-gradient(145deg, #ff9b6b 0%, #ef4444 48%, #4b0808 100%)',
    accent: '#ffe5dc',
    glow: 'rgba(239,68,68,0.3)',
    x: -343,
    y: -22,
    rotate: -8,
    delay: 7,
    depth: 0.9,
  },
]

function setElementRef(collection: HTMLElement[], index: number, el: unknown) {
  if (typeof HTMLElement === 'undefined' || !(el instanceof HTMLElement)) return
  collection[index] = el
}

function setIconRef(el: unknown, index: number) {
  setElementRef(iconEls, index, el)
}

function setCaptionRef(el: unknown, index: number) {
  setElementRef(captionEls, index, el)
}

function setVectorRef(el: unknown, index: number) {
  setElementRef(vectorEls, index, el)
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v))
}

function smoothstep(v: number) {
  const t = clamp(v)
  return t * t * (3 - 2 * t)
}

function smootherstep(v: number) {
  const t = clamp(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function logoSpinDegrees(merge: number) {
  const t = smootherstep((merge - 0.68) / 0.36)
  if (t >= 0.985) return 0

  const settle = smoothstep((t - 0.72) / 0.28)
  const overshoot = Math.sin(settle * Math.PI * 2.4) * 8 * (1 - settle)
  return t * 360 + overshoot
}

function getScrollProgress() {
  const section = sectionRef.value
  if (!section) return 0

  const rect = section.getBoundingClientRect()
  const available = Math.max(1, rect.height - window.innerHeight)
  return clamp(-rect.top / available)
}

function updateStageScale() {
  const stage = stageRef.value
  if (!stage) return

  const rect = stage.getBoundingClientRect()
  stageScale = clamp(rect.width / 860, 0.58, 1)
}

function mergeProgress(p: number) {
  return smoothstep((p - 0.22) / 0.58)
}

function finaleProgress(p: number) {
  return smoothstep((p - 0.7) / 0.24)
}

function appMergeProgress(app: MockApp, p: number) {
  return smoothstep((p - 0.24 - app.delay * 0.008) / 0.52)
}

function appMotion(app: MockApp, p: number, finale: number, now: number) {
  const merge = appMergeProgress(app, p)
  const unmerged = 1 - merge
  const orbitBreath = 1 + Math.sin(now * 0.0009 + app.delay * 0.74) * 0.012 * unmerged
  const pointerDriftX = (pointerX - 50) * app.depth * 0.28 * unmerged
  const pointerDriftY = (pointerY - 50) * app.depth * 0.22 * unmerged
  const floatX = Math.cos(now * 0.0011 + app.delay) * 3.5 * unmerged
  const floatY = Math.sin(now * 0.0014 + app.delay * 0.8) * 6 * unmerged
  const x = (app.x * stageScale * orbitBreath + pointerDriftX + floatX) * unmerged
  const y = (app.y * stageScale * orbitBreath + pointerDriftY + floatY) * unmerged
  const scale = 0.98 - merge * 0.46 + finale * 0.035
  const rotate = app.rotate * unmerged + (pointerX - 50) * 0.03 * app.depth * unmerged

  return { merge, x, y, scale, rotate }
}

function applyAppStyles(app: MockApp, index: number, p: number, finale: number, now: number) {
  const motion = appMotion(app, p, finale, now)
  const merge = motion.merge
  const fade = smoothstep((p - 0.67) / 0.22)
  const opacity = 0.98 * (1 - fade * 0.94)
  const blur = merge * 0.7 + fade * 1.8
  const icon = iconEls[index]

  if (icon) {
    icon.style.opacity = String(opacity)
    icon.style.filter = `blur(${blur}px) saturate(${1 + merge * 0.25})`
    icon.style.transform = `translate3d(calc(-50% + ${motion.x}px), calc(-50% + ${motion.y}px), 0) rotate(${motion.rotate}deg) scale(${motion.scale})`
    icon.style.zIndex = String(Math.round(20 + app.depth * 10 - merge * 5))
  }

  const caption = captionEls[index]
  if (caption) {
    const captionOpacity = clamp(1 - merge * 1.65) * (1 - fade * 0.88)
    const captionY = motion.y + 50 + merge * 12
    const captionScale = 0.98 - merge * 0.16

    caption.style.left = `calc(50% + ${motion.x}px)`
    caption.style.top = `calc(50% + ${captionY}px)`
    caption.style.opacity = String(captionOpacity)
    caption.style.transform = `translate3d(-50%, 0, 0) rotate(${motion.rotate}deg) scale(${captionScale})`
  }

  const vector = vectorEls[index]
  if (!vector) return

  const show = smoothstep((p - 0.06 - app.delay * 0.006) / 0.2)
  const vectorFade = smoothstep((p - 0.74) / 0.16)
  const len = Math.hypot(motion.x, motion.y)
  const angle = Math.atan2(motion.y, motion.x) * 180 / Math.PI
  const unitX = len > 0.001 ? motion.x / len : 1
  const unitY = len > 0.001 ? motion.y / len : 0
  const startGap = 62 + merge * 22
  const endGap = 46 * motion.scale
  const lineLen = Math.max(0, len - startGap - endGap)
  const startX = unitX * startGap
  const startY = unitY * startGap
  const draw = show * (1 - vectorFade) * (1 - merge * 0.1)
  const sparkTravel = clamp(0.15 + merge * 0.78 + Math.sin(now * 0.003 + app.delay) * 0.05)
  const sparkOpacity = show * (1 - vectorFade) * (0.34 + merge * 0.5)
  const alpha = show * (1 - vectorFade) * (0.34 + merge * 0.26)

  vector.style.setProperty('--spark-x', `${sparkTravel}px`)
  vector.style.setProperty('--spark-opacity', String(sparkOpacity))
  vector.style.left = `calc(50% + ${startX}px)`
  vector.style.top = `calc(50% + ${startY}px)`
  vector.style.opacity = String(alpha)
  vector.style.transform = `rotate(${angle}deg) scaleX(${lineLen * draw})`
}

function applyLiftagStyle(merge: number, finale: number) {
  const liftag = liftagRef.value
  if (!liftag) return

  const appear = smootherstep((merge - 0.2) / 0.48)
  const spin = logoSpinDegrees(merge)
  const tiltX = -(pointerY - 50) * 0.035 * (0.2 + merge)
  const tiltY = (pointerX - 50) * 0.04 * (0.2 + merge)
  const scale = 0.66 + appear * 0.36 + finale * 0.08

  liftag.style.setProperty('--logo-spin', `${spin}deg`)
  liftag.style.opacity = String(appear)
  liftag.style.transform = `translate3d(-50%, -50%, 0) perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`
}

function updateAnimatedStyles(now = performance.now()) {
  const merge = mergeProgress(scrollP)
  const finale = finaleProgress(scrollP)
  const section = sectionRef.value

  if (section) {
    section.style.setProperty('--merge-p', String(merge))
    section.style.setProperty('--finale-p', String(finale))
    section.style.setProperty('--pointer-x', `${pointerX}%`)
    section.style.setProperty('--pointer-y', `${pointerY}%`)
    section.style.setProperty('--energy', String(0.28 + merge * 0.72))
  }

  mockApps.forEach((app, index) => applyAppStyles(app, index, scrollP, finale, now))
  applyLiftagStyle(merge, finale)
}

function tick(now: number) {
  if (!isVisible && Math.abs(targetP - scrollP) < 0.001) return

  targetP = reduceMotion ? (isVisible ? 1 : targetP) : getScrollProgress()
  const ease = reduceMotion ? 1 : 0.12
  scrollP = lerp(scrollP, targetP, ease)
  pointerX = lerp(pointerX, targetPointerX, 0.16)
  pointerY = lerp(pointerY, targetPointerY, 0.16)
  updateAnimatedStyles(now)

  rafId = requestAnimationFrame(tick)
}

function iconBaseStyle(app: MockApp) {
  return {
    '--icon-gradient': app.gradient,
    '--icon-accent': app.accent,
    '--icon-glow': app.glow,
    opacity: 0.98,
    filter: 'blur(0px) saturate(1)',
    transform: `translate3d(calc(-50% + ${app.x}px), calc(-50% + ${app.y}px), 0) rotate(${app.rotate}deg) scale(0.98)`,
    zIndex: String(Math.round(20 + app.depth * 10)),
  }
}

function captionBaseStyle(app: MockApp) {
  return {
    left: `calc(50% + ${app.x}px)`,
    top: `calc(50% + ${app.y + 50}px)`,
    opacity: 1,
    transform: `translate3d(-50%, 0, 0) rotate(${app.rotate}deg) scale(0.98)`,
    zIndex: '43',
  }
}

function vectorBaseStyle(app: MockApp) {
  return {
    '--line-glow': app.glow,
    '--spark-x': '0px',
    '--spark-opacity': '0',
    opacity: 0,
    transform: 'rotate(0deg) scaleX(0)',
  }
}

const liftagBaseStyle = {
  '--logo-spin': '0deg',
  opacity: 0,
  transform: 'translate3d(-50%, -50%, 0) perspective(900px) rotateX(0deg) rotateY(0deg) scale(0.66)',
}

function handlePointerMove(event: PointerEvent) {
  targetPointerX = clamp(event.clientX / Math.max(window.innerWidth, 1), 0, 1) * 100
  targetPointerY = clamp(event.clientY / Math.max(window.innerHeight, 1), 0, 1) * 100
}

function handlePointerLeave() {
  targetPointerX = 50
  targetPointerY = 50
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updateStageScale()
  updateAnimatedStyles()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting
      if (isVisible) {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(tick)
      }
    })
  }, { threshold: 0 })

  if (sectionRef.value) observer.observe(sectionRef.value)

  if (stageRef.value && typeof ResizeObserver !== 'undefined') {
    stageResizeObserver = new ResizeObserver(() => {
      updateStageScale()
      updateAnimatedStyles()
    })
    stageResizeObserver.observe(stageRef.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  observer?.disconnect()
  stageResizeObserver?.disconnect()
})
</script>

<template>
  <section
    id="all-in-one"
    ref="sectionRef"
    class="app-merge-section"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div class="app-merge-sticky">
      <div class="merge-background" aria-hidden="true">
        <div class="merge-background-grid"></div>
        <div class="merge-background-pulse pulse-one"></div>
        <div class="merge-background-pulse pulse-two"></div>
        <div class="merge-particle particle-one"></div>
        <div class="merge-particle particle-two"></div>
        <div class="merge-particle particle-three"></div>
      </div>

      <div class="container app-merge-layout">
        <div class="merge-copy">
          <Eyebrow>▸ ONE APP INSTEAD OF TEN</Eyebrow>
          <SectionTitle :max="560">
            All the little gym apps, <span class="lime">folded into LIFTAG.</span>
          </SectionTitle>
          <p class="merge-copy-text reveal">
            Set logging, rest timing, PRs, body metrics, form guides, progress charts, and routines finally live in one place.
          </p>
        </div>

        <div ref="stageRef" class="merge-stage" aria-label="Mock fitness apps merging into LIFTAG">
          <div class="merge-rings" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div
            v-for="(app, i) in mockApps"
            :key="`${app.key}-line`"
            :ref="(el) => setVectorRef(el, i)"
            class="merge-vector"
            :style="vectorBaseStyle(app)"
            aria-hidden="true"
          ></div>

          <div
            v-for="(app, i) in mockApps"
            :key="app.key"
            :ref="(el) => setIconRef(el, i)"
            class="mergeable-app"
            :style="iconBaseStyle(app)"
          >
            <div class="mock-icon">
              <svg class="mock-icon-glyph" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <template v-if="app.key === 'set'">
                  <rect x="11" y="12" width="26" height="25" rx="6" stroke="currentColor" stroke-width="3" />
                  <path d="M17 20h14M17 27h9M17 34h7" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                  <path d="M31 32l3 3 6-7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </template>
                <template v-else-if="app.key === 'timer'">
                  <circle cx="24" cy="25" r="14" stroke="currentColor" stroke-width="3" />
                  <path d="M24 25l8-7M18 7h12M24 7v5" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                  <path d="M14 13l-3-3M34 13l3-3" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                </template>
                <template v-else-if="app.key === 'stopwatch'">
                  <circle cx="24" cy="26" r="14" stroke="currentColor" stroke-width="3" />
                  <path d="M24 26V16M24 26h8M19 7h10M24 7v5" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                  <path d="M24 40a14 14 0 0 1-12-7" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.45" />
                </template>
                <template v-else-if="app.key === 'guides'">
                  <path d="M12 12h11c4 0 7 3 7 7v17H19c-4 0-7-3-7-7V12Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
                  <path d="M30 16h6v20h-6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" />
                  <path d="M21 22l8 5-8 5V22Z" fill="currentColor" />
                </template>
                <template v-else-if="app.key === 'planner'">
                  <rect x="10" y="12" width="28" height="26" rx="6" stroke="currentColor" stroke-width="3" />
                  <path d="M16 9v7M32 9v7M11 20h26" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                  <path d="M18 27h3M26 27h3M18 33h3M26 33h3" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                </template>
                <template v-else-if="app.key === 'progress'">
                  <path d="M10 36h28" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.55" />
                  <path d="M13 31l7-8 6 4 9-13" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="13" cy="31" r="2.5" fill="currentColor" />
                  <circle cx="35" cy="14" r="2.5" fill="currentColor" />
                </template>
                <template v-else-if="app.key === 'pr'">
                  <path d="M17 13h14v6c0 7-3 12-7 12s-7-5-7-12v-6Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
                  <path d="M17 16h-6v3c0 4 3 7 7 7M31 16h6v3c0 4-3 7-7 7M24 31v6M18 38h12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </template>
                <template v-else>
                  <path d="M24 10c6 0 11 5 11 11 0 8-11 17-11 17s-11-9-11-17c0-6 5-11 11-11Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
                  <path d="M18 23h4l3-6 3 12 2-6h4" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </template>
              </svg>
            </div>
          </div>

          <div
            v-for="(app, i) in mockApps"
            :key="`${app.key}-caption`"
            :ref="(el) => setCaptionRef(el, i)"
            class="mock-app-caption"
            :style="captionBaseStyle(app)"
          >
            <span>{{ app.name }}</span>
            <small>{{ app.replaces }}</small>
          </div>

          <div ref="liftagRef" class="liftag-target" :style="liftagBaseStyle" aria-label="LIFTAG app icon">
            <div class="liftag-icon-aura"></div>
            <div class="liftag-icon-shell">
              <img src="/logo.svg" alt="LIFTAG" />
              <div class="liftag-icon-sheen"></div>
            </div>
            <div class="liftag-target-label">
              <span>LIFTAG</span>
              <small>all-in-one gym OS</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-merge-section {
  --merge-p: 0;
  --finale-p: 0;
  --pointer-x: 50%;
  --pointer-y: 50%;
  --energy: 0.28;
  position: relative;
  min-height: 260vh;
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.app-merge-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 760px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.merge-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(520px circle at var(--pointer-x) var(--pointer-y), rgba(204, 255, 0, calc(0.04 + var(--merge-p) * 0.08)), transparent 64%),
    radial-gradient(720px circle at 72% 50%, rgba(204, 255, 0, calc(0.05 + var(--merge-p) * 0.12)), transparent 68%),
    radial-gradient(580px circle at 20% 65%, rgba(255, 45, 85, 0.045), transparent 70%);
}

.merge-background-grid {
  position: absolute;
  inset: -20%;
  opacity: calc(0.22 + var(--merge-p) * 0.16);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at 65% 50%, #000 0%, transparent 68%);
  transform: perspective(900px) rotateX(62deg) translateY(calc(var(--merge-p) * -70px));
}

.merge-background-pulse {
  position: absolute;
  top: 50%;
  left: 66%;
  width: 520px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(204, 255, 0, calc(0.08 + var(--merge-p) * 0.2));
  box-shadow:
    0 0 40px rgba(204, 255, 0, calc(0.04 + var(--merge-p) * 0.08)),
    inset 0 0 38px rgba(204, 255, 0, calc(0.02 + var(--merge-p) * 0.05));
  transform: translate(-50%, -50%) scale(calc(0.85 + var(--merge-p) * 0.35));
  opacity: calc(0.24 + var(--merge-p) * 0.48);
}

.pulse-two {
  width: 760px;
  opacity: calc(0.12 + var(--merge-p) * 0.26);
  transform: translate(-50%, -50%) scale(calc(0.72 + var(--merge-p) * 0.45));
}

.merge-particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--liftag-primary);
  box-shadow: 0 0 18px rgba(204, 255, 0, 0.8);
  opacity: calc(0.15 + var(--merge-p) * 0.65);
}

.particle-one {
  top: 22%;
  left: 72%;
  animation: mergeParticleOne 7s ease-in-out infinite;
}

.particle-two {
  top: 68%;
  left: 52%;
  animation: mergeParticleTwo 8s ease-in-out infinite;
}

.particle-three {
  top: 40%;
  left: 87%;
  animation: mergeParticleThree 9s ease-in-out infinite;
}

.app-merge-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(540px, 1.18fr);
  gap: clamp(40px, 6vw, 92px);
  align-items: center;
  width: 100%;
}

.merge-copy {
  max-width: 620px;
}

.merge-copy-text {
  max-width: 520px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
}

.merge-stage {
  position: relative;
  height: 690px;
  min-height: 590px;
  isolation: isolate;
  transform-style: preserve-3d;
}

.merge-rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translateZ(0);
}

.merge-rings span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(210px + var(--merge-p) * 80px);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(204, 255, 0, 0.12);
  box-shadow: inset 0 0 40px rgba(204, 255, 0, 0.035);
  transform: translate(-50%, -50%) scale(calc(1 + var(--merge-p) * 0.26));
  opacity: calc(0.22 + var(--merge-p) * 0.44);
}

.merge-rings span:nth-child(2) {
  width: calc(390px + var(--merge-p) * 90px);
  border-color: rgba(255, 255, 255, 0.08);
  opacity: calc(0.16 + var(--merge-p) * 0.3);
}

.merge-rings span:nth-child(3) {
  width: calc(560px + var(--merge-p) * 90px);
  border-color: rgba(255, 45, 85, 0.12);
  opacity: calc(0.1 + var(--merge-p) * 0.22);
}

.merge-vector {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 2px;
  pointer-events: none;
  transform-origin: 0 50%;
  border-radius: 999px;
  background:
    linear-gradient(90deg, transparent 0%, rgba(204, 255, 0, 0.62) 18%, var(--line-glow) 62%, transparent 100%);
  box-shadow:
    0 0 12px var(--line-glow),
    0 0 30px rgba(204, 255, 0, 0.06);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.merge-vector::before {
  content: '';
  position: absolute;
  inset: -7px 0;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--line-glow), transparent);
  filter: blur(7px);
  opacity: 0.42;
}

.merge-vector::after {
  content: '';
  position: absolute;
  top: 50%;
  left: var(--spark-x, 0);
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--liftag-primary);
  box-shadow:
    0 0 12px rgba(204, 255, 0, 0.9),
    0 0 28px var(--line-glow);
  opacity: var(--spark-opacity, 0);
  transform: translate(-50%, -50%) scale(calc(0.72 + var(--merge-p) * 0.34));
}

.mergeable-app {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  will-change: transform, opacity, filter;
  transform-origin: center;
}

.mock-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 76px;
  height: 76px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: var(--icon-accent);
  background: var(--icon-gradient);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.44),
    0 0 30px var(--icon-glow),
    inset 0 1px 1px rgba(255, 255, 255, 0.44),
    inset 0 -18px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  transform: translate(-50%, -50%);
}

.mock-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(80px 50px at 32% 10%, rgba(255, 255, 255, 0.45), transparent 58%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 44%);
  pointer-events: none;
}

.mock-icon-glyph {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  color: currentColor;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22));
}

.mock-app-caption {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  width: 118px;
  text-align: center;
  padding: 7px 8px;
  border-radius: 12px;
  background: rgba(6, 6, 6, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.34);
  opacity: var(--caption-opacity, 1);
  transform: translate(
    calc(-50% + var(--label-x, 0px)),
    calc(-50% + var(--label-y, 72px) + var(--caption-y, 0px))
  );
  transition: none;
  transform-origin: 50% 0;
  white-space: normal;
}

.mock-app-caption span,
.liftag-target-label span {
  display: block;
  font-family: var(--liftag-font-headline);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #fff;
}

.mock-app-caption small,
.liftag-target-label small {
  display: block;
  margin-top: 5px;
  font-family: var(--liftag-font-mono);
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.1;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.liftag-target {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  will-change: transform, opacity;
  transform-style: preserve-3d;
  z-index: 44;
  pointer-events: none;
}

.liftag-icon-aura {
  position: absolute;
  inset: -76px -74px 18px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(204, 255, 0, calc(0.1 + var(--merge-p) * 0.22)), transparent 64%),
    radial-gradient(circle, rgba(255, 45, 85, calc(var(--finale-p) * 0.09)), transparent 70%);
  filter: blur(18px);
  transform: translateZ(-1px) scale(calc(0.78 + var(--merge-p) * 0.36));
}

.liftag-icon-shell {
  width: 156px;
  height: 156px;
  border-radius: 34px;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(145deg, #161616 0%, #020202 48%, #181d05 100%);
  border: 1px solid rgba(204, 255, 0, calc(0.16 + var(--merge-p) * 0.34));
  box-shadow:
    0 32px 90px rgba(0, 0, 0, 0.64),
    0 0 calc(34px + var(--merge-p) * 42px) rgba(204, 255, 0, calc(0.18 + var(--merge-p) * 0.28)),
    inset 0 1px 2px rgba(255, 255, 255, 0.28),
    inset 0 -28px 48px rgba(0, 0, 0, 0.5);
}

.liftag-icon-shell img {
  width: 73%;
  height: 73%;
  object-fit: contain;
  filter:
    drop-shadow(0 0 18px rgba(204, 255, 0, 0.35))
    drop-shadow(0 12px 22px rgba(0, 0, 0, 0.4));
  transform: rotate(var(--logo-spin, 0deg)) scale(calc(0.92 + var(--finale-p) * 0.05));
  transform-origin: center;
  will-change: transform;
}

.liftag-icon-sheen {
  position: absolute;
  inset: -40% -80% auto;
  height: 86%;
  background: linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.28), transparent 58%);
  transform: translateX(calc(-20% + var(--merge-p) * 105%)) rotate(8deg);
  opacity: calc(0.18 + var(--merge-p) * 0.5);
}

.liftag-target-label {
  text-align: center;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.54);
  border: 1px solid rgba(204, 255, 0, calc(0.08 + var(--merge-p) * 0.18));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.42);
  opacity: calc(0.4 + var(--merge-p) * 0.6);
}

@keyframes mergeParticleOne {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-90px, 70px, 0); }
}

@keyframes mergeParticleTwo {
  0%, 100% { transform: translate3d(0, 0, 0) scale(0.8); }
  50% { transform: translate3d(120px, -55px, 0) scale(1.2); }
}

@keyframes mergeParticleThree {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-150px, 35px, 0) scale(0.74); }
}

@media (max-width: 980px) {
  .app-merge-sticky {
    height: 100svh;
    min-height: 880px;
  }

  .app-merge-layout {
    grid-template-columns: 1fr;
    gap: 34px;
    align-content: center;
  }

  .merge-copy {
    max-width: 620px;
  }

  .merge-copy-text {
    max-width: 560px;
    font-size: 16px;
  }

  .merge-stage {
    height: 500px;
    min-height: 500px;
  }

  .merge-background-pulse {
    left: 50%;
  }
}

@media (max-width: 620px) {
  .app-merge-section {
    min-height: 245vh;
  }

  .app-merge-sticky {
    min-height: 820px;
  }

  .merge-stage {
    height: 410px;
    min-height: 410px;
  }

  .mock-icon {
    width: 64px;
    height: 64px;
    border-radius: 17px;
  }

  .mock-icon-glyph {
    width: 38px;
    height: 38px;
  }

  .mock-app-caption {
    display: none;
  }

  .liftag-icon-shell {
    width: 126px;
    height: 126px;
    border-radius: 28px;
  }

  .liftag-target-label {
    padding: 9px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .merge-particle {
    animation: none;
  }
}
</style>
