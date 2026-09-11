<script setup lang="ts">
const features = [
  'NFC + QR · MACHINE SYNC', 'AUTO · 1RM', '400+ · EXERCISES',
  '12 · MUSCLE GROUPS', 'COACH · DIRECTORY', 'GYM · MAP',
  'ROUTINES · SUPERSETS', 'WORKOUT · HISTORY', 'PRs · AUTO-DETECTED',
  'EN · SK',
]

const sectionRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null
let rafId = 0
let inView = false
let documentVisible = true
let reduceMotion = false
let offset = 0
let halfWidth = 0
let lastFrame = 0
let lastScrollY = 0
let velocity = 0

const LOOP_MS = 40_000
const MAX_DT = 48
const VEL_LERP = 0.14
const SPEED_GAIN = 1.15
const SKEW_GAIN = 7.5
const SKEW_MAX = 6

function measureHalf() {
  const track = trackRef.value
  if (!track) return
  const first = track.firstElementChild
  if (!(first instanceof HTMLElement)) return
  const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
  halfWidth = first.offsetWidth + gap
}

function applyTransform() {
  const track = trackRef.value
  if (!track) return
  if (reduceMotion) {
    track.style.transform = ''
    return
  }
  const skew = Math.max(-SKEW_MAX, Math.min(SKEW_MAX, -velocity * SKEW_GAIN))
  track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`
}

function tick(now: number) {
  if (!inView || !documentVisible || reduceMotion) {
    rafId = 0
    return
  }

  rafId = requestAnimationFrame(tick)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, MAX_DT)
  lastFrame = now

  const scrollY = window.scrollY
  const rawV = dt > 0 ? (scrollY - lastScrollY) / dt : 0
  lastScrollY = scrollY
  velocity += (rawV - velocity) * VEL_LERP

  if (halfWidth <= 0) return

  const baseSpeed = halfWidth / LOOP_MS
  const speed = baseSpeed * (1 + Math.min(2.5, Math.abs(velocity) * SPEED_GAIN))
  offset -= speed * dt
  if (offset <= -halfWidth) offset += halfWidth
  applyTransform()
}

function startLoop() {
  if (rafId || reduceMotion || !inView || !documentVisible) return
  lastFrame = 0
  lastScrollY = window.scrollY
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function onDocumentVisibilityChange() {
  documentVisible = !document.hidden
  if (documentVisible) startLoop()
  else stopLoop()
}

function onMotionChange() {
  reduceMotion = Boolean(motionMql?.matches)
  if (reduceMotion) {
    stopLoop()
    offset = 0
    velocity = 0
    applyTransform()
  } else {
    startLoop()
  }
}

onMounted(() => {
  documentVisible = !document.hidden
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)

  measureHalf()
  if (trackRef.value) {
    resizeObserver = new ResizeObserver(() => {
      const prev = halfWidth
      measureHalf()
      if (prev > 0 && halfWidth > 0) offset = (offset / prev) * halfWidth
    })
    resizeObserver.observe(trackRef.value)
  }

  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting ?? false
      if (inView) startLoop()
      else stopLoop()
    },
    { threshold: 0 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  stopLoop()
  observer?.disconnect()
  observer = null
  resizeObserver?.disconnect()
  resizeObserver = null
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="partner-marquee"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '36px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Left fade -->
    <div
      class="marquee-fade marquee-fade--left"
      :style="{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '200px',
        background: 'linear-gradient(90deg, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }"
    />
    <!-- Right fade -->
    <div
      class="marquee-fade marquee-fade--right"
      :style="{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '200px',
        background: 'linear-gradient(-90deg, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }"
    />

    <div ref="trackRef" class="marquee-track">
      <div class="marquee-group">
        <div
          v-for="(item, i) in features"
          :key="`a-${i}`"
          class="marquee-item"
        >
          <span>{{ item }}</span>
          <span class="marquee-dot" />
        </div>
      </div>
      <div class="marquee-group" aria-hidden="true">
        <div
          v-for="(item, i) in features"
          :key="`b-${i}`"
          class="marquee-item"
        >
          <span>{{ item }}</span>
          <span class="marquee-dot" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  animation: none !important;
  will-change: transform;
}

.marquee-group {
  display: flex;
  align-items: center;
  /* Keep each dot visually centered between the preceding and following
     labels. The track's larger gap is only for separating its duplicate
     groups, not the items within a group. */
  gap: 24px;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 24px;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 22px;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.marquee-dot {
  width: 6px;
  height: 6px;
  background: #CCFF00;
  border-radius: 50%;
  box-shadow: 0 0 8px #CCFF00;
}

@media (max-width: 768px) {
  .partner-marquee {
    padding: 20px 0 !important;
  }

  .marquee-fade {
    width: 76px !important;
  }

  .marquee-fade--left {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.76), transparent) !important;
  }

  .marquee-fade--right {
    background: linear-gradient(-90deg, rgba(0, 0, 0, 0.76), transparent) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    transform: none !important;
    will-change: auto;
  }
}
</style>
