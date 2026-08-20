<script setup lang="ts">
// Background hero graphs as stacked compositor layers. Each line is its own
// SVG so CSS translate3d slides an already-rasterized bitmap instead of
// re-painting one SVG's internal <g> transforms (which re-rasterizes the
// glow filter every frame).
//
// Mouse motion never enters the template. useLerpVars writes the lerped,
// normalized pointer straight onto the wrapper as --chart-mx / --chart-my.
// Vue does not patch the SVG tree on cursor move.

const W = 1440
const H = 860

function makeChart(
  count: number,
  startY: number,
  endY: number,
  startX: number,
  endX: number,
  seed: number,
): [number, number][] {
  const pts: [number, number][] = []
  let y = startY
  for (let i = 0; i < count; i++) {
    const p = i / (count - 1)
    const x = startX + p * (endX - startX)
    const rng = Math.sin(seed * 137.5 + i * 47.3 + seed * i * 0.8)
    const step = (startY - endY) / count
    const noise = rng * step * 1.8
    y = Math.max(endY, Math.min(startY, y - step + noise))
    pts.push([x, y])
  }
  return pts
}

const x0 = W * 0.38
const x1 = W * 1.02
const l1 = makeChart(22, H * 0.82, H * 0.28, x0, x1, 1)
const l2 = makeChart(18, H * 0.88, H * 0.42, x0 + 40, x1 - 40, 3)
const l3 = makeChart(16, H * 0.78, H * 0.50, x0 + 80, x1, 7)
const l4 = makeChart(14, H * 0.92, H * 0.60, x0, x1 - 80, 11)
const gridYs = [H * 0.30, H * 0.50, H * 0.68, H * 0.84]

function poly(pts: [number, number][]) {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}
function areaD(pts: [number, number][]) {
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `M ${poly(pts)} L ${last[0].toFixed(1)},${H} L ${first[0].toFixed(1)},${H} Z`
}

const dotIdxs = [4, 8, 13, 17, 21]
const heroDotCycleSec = 10.47
function heroDotDelay(i: number) {
  return `${(-(i * 1.4) / (Math.PI * 2)) * heroDotCycleSec}s`
}

const root = ref<HTMLElement | null>(null)
const refL1 = ref<SVGPolylineElement | null>(null)
const refL2 = ref<SVGPolylineElement | null>(null)
const refL3 = ref<SVGPolylineElement | null>(null)
const refL4 = ref<SVGPolylineElement | null>(null)

const rawMouse = useSharedMouse().latest
// Gated on the charts being near the viewport so mousemoves further down the
// page do not wake this loop.
const lerpActive = useNearViewport(root)
useLerpVars(root, rawMouse, 'chart', 0.06, () => lerpActive.value)

// Draw-on-load schedule. Handles are kept so an unmount mid-reveal cannot leave
// timers or an idle callback pointing at a detached SVG.
type IdleCb = (cb: () => void, opts?: { timeout: number }) => number
const revealTimers: ReturnType<typeof setTimeout>[] = []
let idleHandle = 0
let unmounted = false

onMounted(async () => {
  // Chart draw-on-load: the hidden dash state is authored in the SVG markup so
  // first paint cannot flash the fully drawn graph before this reveal runs.
  await nextTick()
  if (unmounted) return
  const scheduleChartReveal = () => {
    const order = [
      { el: refL4.value, delay: 200 },
      { el: refL3.value, delay: 700 },
      { el: refL2.value, delay: 1100 },
      { el: refL1.value, delay: 1500 },
    ]
    order.forEach(({ el, delay }) => {
      if (!el) return
      revealTimers.push(setTimeout(() => {
        el.style.transition = 'stroke-dashoffset 1600ms cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.strokeDashoffset = '0'
      }, delay))
    })
  }
  const ric = (window as unknown as { requestIdleCallback?: IdleCb }).requestIdleCallback
  if (typeof ric === 'function') idleHandle = ric(scheduleChartReveal, { timeout: 600 })
  else revealTimers.push(setTimeout(scheduleChartReveal, 0))
})

onBeforeUnmount(() => {
  unmounted = true
  revealTimers.forEach((id) => clearTimeout(id))
  revealTimers.length = 0
  if (idleHandle !== 0) {
    const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
    if (typeof cic === 'function') cic(idleHandle)
    idleHandle = 0
  }
})
</script>

<template>
  <div
    ref="root"
    class="hero-charts"
    aria-hidden="true"
  >
    <!-- Static floor so moving lines read as depth against a fixed grid. -->
    <svg
      class="hero-chart-layer hero-chart-grid"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <line
        v-for="(yv, i) in gridYs"
        :key="i"
        :x1="W * 0.35"
        :y1="yv"
        :x2="W"
        :y2="yv"
        stroke="rgba(255,255,255,0.04)"
        stroke-width="1"
        stroke-dasharray="5 18"
      />
    </svg>

    <svg
      class="hero-chart-layer hero-chart-l4"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <polyline
        class="hero-chart-outline"
        :points="poly(l4)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1"
        opacity="0.026"
        stroke-linejoin="round"
      />
      <polyline
        ref="refL4"
        class="hero-chart-draw"
        :points="poly(l4)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1"
        opacity="0.07"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      class="hero-chart-layer hero-chart-l3"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <polyline
        class="hero-chart-outline"
        :points="poly(l3)"
        fill="none"
        stroke="#ffffff"
        stroke-width="1"
        opacity="0.032"
        stroke-linejoin="round"
      />
      <polyline
        ref="refL3"
        class="hero-chart-draw"
        :points="poly(l3)"
        fill="none"
        stroke="#ffffff"
        stroke-width="1"
        opacity="0.09"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      class="hero-chart-layer hero-chart-l2"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <polyline
        class="hero-chart-outline"
        :points="poly(l2)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1"
        opacity="0.042"
        stroke-linejoin="round"
      />
      <polyline
        ref="refL2"
        class="hero-chart-draw"
        :points="poly(l2)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1"
        opacity="0.13"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      class="hero-chart-layer hero-chart-l1"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="hero-chart-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hero-chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#CCFF00" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#CCFF00" stop-opacity="0" />
        </linearGradient>
      </defs>

      <path
        :d="areaD(l1)"
        fill="url(#hero-chart-area)"
        :style="{ opacity: 0, animation: 'heroAreaFadeIn 1000ms 3000ms ease forwards' }"
      />

      <polyline
        :points="poly(l1)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="5"
        opacity="0.04"
        stroke-linejoin="round"
        filter="url(#hero-chart-glow)"
      />

      <polyline
        class="hero-chart-outline"
        :points="poly(l1)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1.5"
        opacity="0.08"
        stroke-linejoin="round"
      />

      <polyline
        ref="refL1"
        class="hero-chart-draw"
        :points="poly(l1)"
        fill="none"
        stroke="#CCFF00"
        stroke-width="1.5"
        opacity="0.32"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Own layer, deliberately: the pulsing dots are the only thing in this
         component that repaints after the entrance finishes, and while they
         lived alongside the blur-filtered polyline above, each pulse frame
         re-ran that feGaussianBlur over a viewport-sized SVG. Same viewBox and
         the same --depth as l1, drawn immediately after it, so the composition
         is pixel-identical - only the paint damage is now the dots themselves.
         The dots are also the last thing painted either way. -->
    <svg
      class="hero-chart-layer hero-chart-dots"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        v-for="(idx, i) in dotIdxs"
        :key="i"
        :style="{
          opacity: 0,
          animation: `heroAreaFadeIn 500ms ${3100 + i * 100}ms ease forwards`,
        }"
      >
        <template v-if="l1[idx]">
          <!-- r/opacity are authored as attributes, not left to the keyframes:
               they are the resting pose whenever the pulse is off (phones,
               reduced motion). The pulse itself scales via transform so it
               stays composited; CSS `r` is not. -->
          <circle
            class="hero-dot-outer"
            :cx="l1[idx][0]"
            :cy="l1[idx][1]"
            r="6.5"
            fill="none"
            stroke="#CCFF00"
            stroke-width="1"
            opacity="0.06"
            :style="{ animationDelay: heroDotDelay(i) }"
          />
          <circle
            class="hero-dot-mid"
            :cx="l1[idx][0]"
            :cy="l1[idx][1]"
            r="2.5"
            fill="#CCFF00"
            opacity="0.34"
            :style="{ animationDelay: heroDotDelay(i) }"
          />
          <circle
            :cx="l1[idx][0]"
            :cy="l1[idx][1]"
            r="1"
            fill="#fff"
            opacity="0.7"
          />
        </template>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hero-charts {
  /* Lerped pointer, normalized to -1..1 and unitless so each layer can scale it
     by its own depth. Defaults here keep first paint and SSR correct before the
     first pointer event. */
  --chart-mx: 0;
  --chart-my: 0;
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Fixed screen-edge fade: lines slide under it instead of taking the mask. */
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    transparent 36%,
    #000 50%,
    #000 88%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    transparent 36%,
    #000 50%,
    #000 88%,
    transparent 100%
  );
}

.hero-chart-layer {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  transform: translate3d(
    calc(var(--chart-mx) * var(--depth, 0) * 1px),
    calc(var(--chart-my) * var(--depth-y, 0) * 1px),
    0
  );
}

.hero-chart-grid {
  --depth: 0;
  --depth-y: 0;
  transform: none;
}

.hero-chart-l4 {
  --depth: 4;
  --depth-y: 2;
}

.hero-chart-l3 {
  --depth: 8;
  --depth-y: 4;
}

.hero-chart-l2 {
  --depth: 14;
  --depth-y: 7;
}

.hero-chart-l1,
.hero-chart-dots {
  --depth: 22;
  --depth-y: 11;
}

.hero-chart-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

.hero-chart-outline {
  vector-effect: non-scaling-stroke;
}

@media (min-width: 769px) {
  .hero-chart-l4,
  .hero-chart-l3,
  .hero-chart-l2,
  .hero-chart-l1,
  .hero-chart-dots {
    will-change: transform;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-chart-layer {
    transform: none;
    will-change: auto;
  }
}

@keyframes heroDotOuterPulse {
  0%, 100% { transform: scale(0.77); opacity: 0.04; }
  50%      { transform: scale(1.23); opacity: 0.08; }
}
@keyframes heroDotMidPulse {
  0%, 100% { opacity: 0.28; }
  50%      { opacity: 0.40; }
}
.hero-dot-outer {
  transform-box: fill-box;
  transform-origin: center;
  animation: heroDotOuterPulse 10.47s ease-in-out infinite;
}
.hero-dot-mid   { animation: heroDotMidPulse   10.47s ease-in-out infinite; }

/* Phones hold the dots at their resting pose. `r` and `opacity` are not
   compositable, so each pulse frame is a main-thread repaint inside a
   viewport-sized SVG that sits directly behind the fixed nav and its mobile
   drawer - the one piece of the hero that never stopped repainting, and the
   reason the nav and the marquee below it stuttered while the hero was on
   screen. The frozen pose is a mid-cycle frame of the same animation: on a
   phone these are two background dots drifting between 4% and 8% opacity over
   ten seconds, so holding them reads as identical. */
@media (max-width: 768px), (prefers-reduced-motion: reduce) {
  .hero-dot-outer,
  .hero-dot-mid {
    animation: none;
  }
}
</style>
