<script setup lang="ts">
// ─── reactive mouse / scroll state ───────────────────────────────────────────
// rawMouse is a reference into the shared singleton — useLerp's rAF reads
// .x/.y each frame, so the page-wide single mousemove handler keeps it fresh
// without us owning a per-component listener.
const sharedMouse = useSharedMouse()
const rawMouse = sharedMouse.latest
const scrollY = ref(0)
const entered = ref(false)
const cursorGlowX = ref(-9999)
const cursorGlowY = ref(-9999)
const cursorGlowTone = ref<'green' | 'red'>('green')
// Drop the WebGL Phone3D path on phones — we only render the front-center
// phone on mobile and the lite path uses a static image instead of Three.js.
const isMobile = ref(false)

// smooth lerp (factor 0.06 matches React source)
const mouse = useLerp(rawMouse, 0.06)

// ─── particles — generated client-side only to avoid SSR mismatch ────────────
interface Particle {
  id: number
  x: number
  y: number
  r: number
  speed: number
  phase: number
  depth: number
}
const particles = ref<Particle[]>([])
const particlesReady = ref(false)

// ─── chart background data (deterministic — safe on server) ──────────────────
const W = 1440, H = 860

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

const x0 = W * 0.38, x1 = W * 1.02
const linesData = {
  l1: makeChart(22, H * 0.82, H * 0.28, x0,      x1,      1),
  l2: makeChart(18, H * 0.88, H * 0.42, x0 + 40, x1 - 40, 3),
  l3: makeChart(16, H * 0.78, H * 0.50, x0 + 80, x1,      7),
  l4: makeChart(14, H * 0.92, H * 0.60, x0,      x1 - 80, 11),
}
const { l1, l2, l3, l4 } = linesData

function poly(pts: [number, number][]) {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}
function areaD(pts: [number, number][]) {
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `M ${poly(pts)} L ${last[0].toFixed(1)},${H} L ${first[0].toFixed(1)},${H} Z`
}
const dotIdxs = [4, 8, 13, 17, 21]

// Pulse cycle in seconds for the 5 SVG dots (matches the original
// Math.sin(tick / 180 * 1.8 + …) period: 2π / (1.8/180) ≈ 628 frames ≈ 10.47s @60Hz)
const heroDotCycleSec = 10.47
function heroDotDelay(i: number) {
  return `${(-(i * 1.4) / (Math.PI * 2)) * heroDotCycleSec}s`
}

// chart SVG refs for draw-on-load animation
const refL1 = ref<SVGPolylineElement | null>(null)
const refL2 = ref<SVGPolylineElement | null>(null)
const refL3 = ref<SVGPolylineElement | null>(null)
const refL4 = ref<SVGPolylineElement | null>(null)

// ─── hero words ───────────────────────────────────────────────────────────────
const words = ['FOR', 'LIFTERS.', 'BY', 'LIFTERS.']
function isLime(word: string) { return word === 'LIFTERS.' }
const heroLaserSequence = [0, 1, 2, 3]
const heroLaserChargeMs = 140
const heroLaserSweepMs = 390
const heroLaserGapMs = 55
const heroLaserDone = ref(false)
const heroDetailsEntered = computed(() => entered.value && heroLaserDone.value)
const heroTitleEls: HTMLElement[] = []
let heroLaserStarted = false
let heroLaserCancelled = false
const heroLaserTimers: ReturnType<typeof setTimeout>[] = []
const heroLaserRafs: number[] = []
const heroLaserNodes = new Set<HTMLElement>()

function setHeroTitleEl(el: Element | null, index: number) {
  if (el instanceof HTMLElement) heroTitleEls[index] = el
}

function heroLaserClass(word: string, index: number) {
  return {
    'hero-laser-reveal': true,
    'hero-laser-green': isLime(word),
    'hero-laser-red': !isLime(word),
    'from-right': index % 2 === 1,
  }
}

function queueHeroLaserTimer(fn: () => void, delay: number) {
  const timer = setTimeout(() => {
    if (!heroLaserCancelled) fn()
  }, delay)
  heroLaserTimers.push(timer)
}

function queueHeroLaserRaf(fn: (now: number) => void) {
  const raf = requestAnimationFrame((now) => {
    if (!heroLaserCancelled) fn(now)
  })
  heroLaserRafs.push(raf)
}

function emitHeroLaserSparks(el: HTMLElement, posPercent: number, isGreen: boolean) {
  const rect = el.getBoundingClientRect()
  const x = rect.left + (posPercent / 100) * rect.width
  const y = rect.top + rect.height / 2
  const count = 1 + Math.floor(Math.random() * 2)

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div')
    const angle = (Math.random() - 0.5) * Math.PI * 0.9
    const dist = 12 + Math.random() * 28

    spark.className = 'hero-laser-spark'
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    spark.style.background = isGreen ? 'var(--liftag-primary)' : 'var(--liftag-red-neon)'
    spark.style.boxShadow = isGreen
      ? '0 0 4px var(--liftag-primary), 0 0 8px var(--liftag-primary-glow)'
      : '0 0 4px var(--liftag-red-neon), 0 0 8px var(--liftag-red-neon-glow)'
    spark.style.setProperty('--sx', `${Math.cos(angle) * dist * 0.4}px`)
    spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`)
    document.body.appendChild(spark)
    heroLaserNodes.add(spark)

    queueHeroLaserTimer(() => {
      spark.remove()
      heroLaserNodes.delete(spark)
    }, 450)
  }
}

function runHeroLaserReveal(
  el: HTMLElement | undefined,
  fromRight: boolean,
  duration: number,
  onDone?: () => void,
) {
  if (!el || el.classList.contains('reveal-done')) {
    onDone?.()
    return
  }

  const isGreen = el.classList.contains('hero-laser-green')
  const rect = el.getBoundingClientRect()
  const fontSize = Number.parseFloat(window.getComputedStyle(el).fontSize) || rect.height
  const rightClipPad = isGreen && fromRight ? fontSize * 0.14 : 0
  const rightClipInset = rightClipPad > 0 ? `${-rightClipPad}px` : '0'
  const beam = document.createElement('div')

  const syncBeam = (beamPercent: number) => {
    const liveRect = el.getBoundingClientRect()
    const beamTravelWidth = liveRect.width + (fromRight ? rightClipPad : 0)
    const x = liveRect.left + (beamPercent / 100) * beamTravelWidth

    beam.style.left = `${x}px`
    beam.style.top = `${liveRect.top - liveRect.height * 0.2}px`
    beam.style.height = `${liveRect.height * 1.4}px`
  }

  beam.className = `hero-laser-charge-beam ${isGreen ? 'green' : 'red'}`
  syncBeam(fromRight ? 100 : 0)
  document.body.appendChild(beam)
  heroLaserNodes.add(beam)

  queueHeroLaserTimer(() => {
    el.classList.add('sweeping')
    el.style.setProperty('--laser-pos', fromRight ? '100%' : '0%')
    const start = performance.now()
    let lastSparkTime = 0

    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const pos = eased * 100
      const beamPercent = fromRight ? 100 - pos : pos

      if (fromRight) {
        el.style.clipPath = `inset(-20% ${rightClipInset} -20% ${100 - Math.min(pos, 100)}%)`
      } else {
        el.style.clipPath = `inset(-20% ${100 - Math.min(pos, 100)}% -20% 0)`
      }

      el.style.setProperty('--laser-pos', `${beamPercent}%`)
      syncBeam(beamPercent)

      if (now - lastSparkTime > 70 && t > 0.04 && t < 0.92) {
        lastSparkTime = now
        emitHeroLaserSparks(el, beamPercent, isGreen)
      }

      if (t < 1) {
        queueHeroLaserRaf(animate)
        return
      }

      el.classList.remove('sweeping')
      el.classList.add('reveal-done')
      el.style.clipPath = `inset(-20% ${rightClipInset} -20% 0)`
      beam.style.animation = 'heroLaserChargeShrink 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
      queueHeroLaserTimer(() => {
        beam.remove()
        heroLaserNodes.delete(beam)
      }, 300)
      onDone?.()
    }

    queueHeroLaserRaf(animate)
  }, heroLaserChargeMs)
}

function runAllHeroLaserReveals() {
  if (heroLaserStarted) return
  heroLaserStarted = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTitleEls.forEach((el) => el?.classList.add('reveal-done'))
    heroLaserDone.value = true
    return
  }

  const revealNext = (sequenceIndex: number) => {
    const index = heroLaserSequence[sequenceIndex]

    if (index === undefined) {
      heroLaserDone.value = true
      return
    }

    runHeroLaserReveal(heroTitleEls[index], index % 2 === 1, heroLaserSweepMs, () => {
      queueHeroLaserTimer(() => revealNext(sequenceIndex + 1), heroLaserGapMs)
    })
  }

  revealNext(0)
}

function cleanupHeroLasers() {
  heroLaserCancelled = true
  heroLaserTimers.forEach(clearTimeout)
  heroLaserTimers.length = 0
  heroLaserRafs.forEach(cancelAnimationFrame)
  heroLaserRafs.length = 0
  heroLaserNodes.forEach((node) => node.remove())
  heroLaserNodes.clear()
}

// ─── hero stats ───────────────────────────────────────────────────────────────
const stat1 = useCountUp(250, 1600)
const stat2 = useCountUp(11,  1600)
const stat4 = useCountUp(100, 1600)

function fmtStat(val: number, target: number, suffix: string, compact: boolean) {
  if (compact) return (val / 1_000_000).toFixed(2) + 'M'
  if (target >= 1000) return (val / 1000).toFixed(1) + 'k' + suffix
  return val + suffix
}

// ─── lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  heroLaserStarted = false
  heroLaserCancelled = false
  heroLaserDone.value = false
  // entrance delay
  const t = setTimeout(() => { entered.value = true }, 80)

  const mobileMql = window.matchMedia('(max-width: 768px)')
  isMobile.value = mobileMql.matches
  const onMobileChange = (e: MediaQueryListEvent) => { isMobile.value = e.matches }
  mobileMql.addEventListener('change', onMobileChange)

  // particles — client only
  particles.value = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
    depth: Math.random() * 0.8 + 0.2,
  }))
  particlesReady.value = true

  // Cursor orb position needs explicit reactive-ref writes to trigger Vue
  // re-renders. Subscribe to the shared mousemove and rAF-coalesce so we don't
  // bump refs hundreds of times per second on a 240Hz trackpad. Parallax
  // (rawMouse via useLerp) updates without subscribing — useLerp's own rAF
  // picks up sharedMouse.latest changes each frame.
  let cursorRafQueued = false
  const unsubMouse = onMouseEvent(() => {
    if (cursorRafQueued) return
    cursorRafQueued = true
    requestAnimationFrame(() => {
      cursorRafQueued = false
      cursorGlowX.value = sharedMouse.latest.clientX
      cursorGlowY.value = sharedMouse.latest.clientY
    })
  })
  const onCursorGlowTone = (event: Event) => {
    const tone = (event as CustomEvent<{ tone?: 'green' | 'red' }>).detail?.tone
    cursorGlowTone.value = tone === 'red' ? 'red' : 'green'
  }
  window.addEventListener('liftag:cursor-glow-tone', onCursorGlowTone as EventListener)

  let scrollQueued = false
  const onScroll = () => {
    if (scrollQueued) return
    scrollQueued = true
    requestAnimationFrame(() => {
      scrollQueued = false
      scrollY.value = window.scrollY
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  // Chart draw-on-load: the hidden dash state is authored in the SVG markup so
  // first paint cannot flash the fully drawn graph before this reveal runs.
  await nextTick()
  const scheduleChartReveal = () => {
    const order = [
      { el: refL4.value, delay: 200  },
      { el: refL3.value, delay: 700  },
      { el: refL2.value, delay: 1100 },
      { el: refL1.value, delay: 1500 },
    ]
    order.forEach(({ el, delay }) => {
      if (!el) return
      setTimeout(() => {
        el.style.transition      = 'stroke-dashoffset 1600ms cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.strokeDashoffset = '0'
      }, delay)
    })
  }
  type IdleCb = (cb: () => void, opts?: { timeout: number }) => number
  const ric = (window as unknown as { requestIdleCallback?: IdleCb }).requestIdleCallback
  if (typeof ric === 'function') ric(scheduleChartReveal, { timeout: 600 })
  else setTimeout(scheduleChartReveal, 0)

  queueHeroLaserTimer(runAllHeroLaserReveals, 280)

  onBeforeUnmount(() => {
    clearTimeout(t)
    cleanupHeroLasers()
    unsubMouse()
    mobileMql.removeEventListener('change', onMobileChange)
    window.removeEventListener('liftag:cursor-glow-tone', onCursorGlowTone as EventListener)
    window.removeEventListener('scroll', onScroll)
  })
})

// ─── derived scroll values ────────────────────────────────────────────────────
const scrollFade = computed(() => Math.max(0, 1 - scrollY.value / 500))
const scrollUp   = computed(() => scrollY.value * 0.35)

// parallax per-phone (updated reactively from mouse + scroll)
const p1 = computed(() => ({
  x: mouse.value.x * -18,
  y: mouse.value.y * -12 + scrollY.value * 0.12,
}))
const p2 = computed(() => ({
  x: mouse.value.x * 10,
  y: mouse.value.y * 10  - scrollY.value * 0.08,
}))
const p3 = computed(() => ({
  x: mouse.value.x * 26,
  y: mouse.value.y * 18  - scrollY.value * 0.22,
}))
</script>

<template>
  <section
    class="hero-section"
    :style="{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      background: '#000',
      paddingTop: '100px',
      paddingBottom: '80px',
    }"
  >

    <!-- ── Background chart lines ── -->
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
      :style="{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translate(${mouse.x * 6}px, ${mouse.y * 3}px)`,
      }"
    >
      <defs>
        <filter id="hglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="harea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#CCFF00" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#CCFF00" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="hfadex" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="white" stop-opacity="0" />
          <stop offset="36%"  stop-color="white" stop-opacity="0" />
          <stop offset="50%"  stop-color="white" stop-opacity="1" />
          <stop offset="88%"  stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="hmask">
          <rect :width="W" :height="H" fill="url(#hfadex)" />
        </mask>
      </defs>

      <g mask="url(#hmask)">
        <!-- Horizontal grid lines -->
        <line
          v-for="(yv, i) in [H * 0.30, H * 0.50, H * 0.68, H * 0.84]"
          :key="i"
          :x1="W * 0.35" :y1="yv" :x2="W" :y2="yv"
          stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="5 18"
        />

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

        <!-- Gradient area fill under l1 -->
        <path
          :d="areaD(l1)"
          fill="url(#harea)"
          :style="{ opacity: 0, animation: 'heroAreaFadeIn 1000ms 3000ms ease forwards' }"
        />

        <!-- Glow duplicate of l1 -->
        <polyline
          :points="poly(l1)"
          fill="none"
          stroke="#CCFF00"
          stroke-width="5"
          opacity="0.04"
          stroke-linejoin="round"
          filter="url(#hglow)"
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

        <!-- Main l1 line (draw-on-load) -->
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

        <!-- Pulsing dots along l1 — CSS-driven so we don't burn an always-on rAF -->
        <g
          v-for="(idx, i) in dotIdxs"
          :key="i"
          :style="{
            opacity: 0,
            animation: `heroAreaFadeIn 500ms ${3100 + i * 100}ms ease forwards`,
          }"
        >
          <template v-if="l1[idx]">
            <circle
              class="hero-dot-outer"
              :cx="l1[idx][0]"
              :cy="l1[idx][1]"
              fill="none"
              stroke="#CCFF00"
              stroke-width="1"
              :style="{ animationDelay: heroDotDelay(i) }"
            />
            <circle
              class="hero-dot-mid"
              :cx="l1[idx][0]"
              :cy="l1[idx][1]"
              r="2.5"
              fill="#CCFF00"
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
      </g>
    </svg>

    <!-- ── Cursor orb ── -->
    <div
      class="cursor-glow cursor-glow-green"
      :style="{
        transform: `translate3d(${cursorGlowX - 210}px, ${cursorGlowY - 210}px, 0)`,
        opacity: cursorGlowTone === 'red' ? 0 : 1,
      }"
    />
    <div
      class="cursor-glow cursor-glow-red"
      :style="{
        transform: `translate3d(${cursorGlowX - 210}px, ${cursorGlowY - 210}px, 0)`,
        opacity: cursorGlowTone === 'red' ? 1 : 0,
      }"
    />

    <!-- ── Subtle grid ── -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 90% 80% at 60% 40%, black 20%, transparent 80%)',
        opacity: scrollFade,
      }"
    />

    <!-- ── Lime atmosphere glow ── -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 55% at ${58 + mouse.x * 4}% ${40 + mouse.y * 4}%, rgba(204,255,0,0.12), transparent 65%)`,
      }"
    />

    <!-- ── Particle dots (client-only to avoid SSR mismatch) ── -->
    <div
      v-if="particlesReady"
      :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }"
    >
      <div
        v-for="p in particles"
        :key="p.id"
        :style="{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.r * 2}px`,
          height: `${p.r * 2}px`,
          borderRadius: '50%',
          background: p.depth > 0.7 ? '#CCFF00' : 'rgba(255,255,255,0.6)',
          opacity: p.depth * 0.5,
          boxShadow: p.depth > 0.7 ? `0 0 ${p.r * 6}px rgba(204,255,0,0.8)` : 'none',
          transform: `translate3d(${mouse.x * p.depth * 2.5 - scrollY * p.depth * 0.03}vw, ${mouse.y * p.depth * 2 - scrollY * p.speed * 0.04}vh, 0)`,
          willChange: 'transform',
        }"
      />
    </div>

    <!-- ── Main content grid ── -->
    <div
      class="container hero-grid"
      :style="{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        alignItems: 'center',
        gap: '40px',
        minHeight: 'calc(100vh - 180px)',
        position: 'relative',
        zIndex: 3,
        transform: `translateY(-${scrollUp}px)`,
        opacity: scrollFade,
      }"
    >

      <!-- ── LEFT: copy ── -->
      <div class="hero-copy">

        <!-- Beta badge -->
        <div
          :style="{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            border: '1px solid rgba(204,255,0,0.3)',
            borderRadius: '9999px',
            background: 'rgba(204,255,0,0.05)',
            marginBottom: '32px',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 800ms cubic-bezier(0.16,1,0.3,1), transform 800ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          <span
            :style="{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#CCFF00',
              boxShadow: '0 0 10px #CCFF00, 0 0 20px #CCFF00',
            }"
          />
          <span class="protocol" :style="{ color: '#CCFF00', fontSize: '11px' }">PUBLIC BETA · LAUNCHING SOON</span>
        </div>

        <!-- Headline — laser reveal entrance -->
        <h1
          class="hero-title-laser"
          :style="{
            margin: '0 0 28px',
            fontFamily: '\'Space Grotesk\', system-ui, sans-serif',
            fontWeight: 700,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            fontSize: 'clamp(56px, 8.5vw, 128px)',
          }"
        >
          <span
            v-for="(word, i) in words"
            :key="i"
            class="hero-title-line"
          >
            <span
              :ref="(el) => setHeroTitleEl(el as Element | null, i)"
              :class="heroLaserClass(word, i)"
              :style="{
                color: isLime(word) ? '#CCFF00' : '#fff',
              }"
            >
              {{ word }}
            </span>
            <span
              v-if="isLime(word)"
              class="hero-title-glow"
              aria-hidden="true"
            >
              {{ word }}
            </span>
          </span>
        </h1>

        <!-- Sub-headline -->
        <p
          :style="{
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '520px',
            margin: '0 0 36px',
            opacity: heroDetailsEntered ? 1 : 0,
            transform: heroDetailsEntered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 900ms 500ms cubic-bezier(0.16,1,0.3,1), transform 900ms 500ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          Scan any machine. Track every set. Watch your numbers compound.<br />
          <span :style="{ color: 'rgba(255,255,255,0.4)' }">Because serious training deserves more than a notes app.</span>
        </p>

        <!-- App store buttons -->
        <div
          class="hero-badges"
          :style="{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '60px',
            opacity: heroDetailsEntered ? 1 : 0,
            transform: heroDetailsEntered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 900ms 640ms cubic-bezier(0.16,1,0.3,1), transform 900ms 640ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          <AppStoreBtn store="apple" />
          <AppStoreBtn store="google" />
        </div>

        <!-- Stats row -->
        <div
          class="hero-stats"
          :style="{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            opacity: heroDetailsEntered ? 1 : 0,
            transform: heroDetailsEntered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 900ms 800ms cubic-bezier(0.16,1,0.3,1), transform 900ms 800ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          <div :ref="(el) => (stat1.el.value = el as HTMLElement | null)">
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >{{ fmtStat(stat1.val.value, 250, '+', false) }}</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Exercises in library</div>
          </div>

          <div :ref="(el) => (stat2.el.value = el as HTMLElement | null)">
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >{{ fmtStat(stat2.val.value, 11, '', false) }}</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Muscle groups</div>
          </div>

          <div :ref="(el) => (stat4.el.value = el as HTMLElement | null)">
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >{{ fmtStat(stat4.val.value, 100, '%', false) }}</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Free · forever</div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT: 3 phones with parallax ── -->
      <div
        class="hero-phones"
        :style="{ position: 'relative', height: '700px', perspective: '1600px', transform: 'translateY(-32px)' }"
      >

        <!-- Back-left phone -->
        <div
          :style="{
            position: 'absolute', top: '80px', left: 0,
            transform: `translate3d(${p1.x}px, ${p1.y}px, -60px) rotateY(10deg) rotateX(-3deg)`,
            transformStyle: 'preserve-3d',
            opacity: entered ? 0.75 : 0,
            transition: entered ? 'opacity 1200ms 300ms ease' : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))',
          }"
        >
          <Phone src="/assets/screens/progression.png" :scale="0.7" :tilt-delay-ms="140" lite />
        </div>

        <!-- Back-right phone -->
        <div
          :style="{
            position: 'absolute', top: '20px', right: '-10px',
            transform: `translate3d(${p2.x}px, ${p2.y}px, -40px) rotateY(-12deg) rotateX(-2deg)`,
            transformStyle: 'preserve-3d',
            opacity: entered ? 0.68 : 0,
            transition: entered ? 'opacity 1200ms 500ms ease' : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 22px 36px rgba(0,0,0,0.55))',
          }"
        >
          <Phone src="/assets/screens/log-set.png" :scale="0.64" :tilt-delay-ms="230" lite />
        </div>

        <!-- Front center phone (main) -->
        <div
          :style="{
            position: 'absolute', top: 0, left: '50%',
            transform: `translate3d(calc(-50% + ${p3.x}px), ${p3.y}px, 0px)`,
            willChange: 'transform',
            opacity: entered ? 1 : 0,
            transition: entered ? 'opacity 1000ms 100ms ease' : 'none',
          }"
        >
          <!-- Glow behind phone -->
          <div
            :style="{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(204,255,0,0.22) 0%, transparent 65%)',
              filter: 'blur(24px)',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }"
          />
          <Phone src="/assets/screens/home.png" :scale="0.92" :tilt-delay-ms="0" :lite="isMobile" />
          <!-- Reflection streak -->
          <div
            :style="{
              position: 'absolute', top: '8%', left: '10%',
              width: '30%', height: '40%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
              borderRadius: '40px',
              pointerEvents: 'none',
              zIndex: 10,
            }"
          />
        </div>

        <!-- QR chip -->
        <div
          :style="{
            position: 'absolute', bottom: '20px', left: '-24px',
            transform: `translate3d(${p1.x * 1.3}px, ${p1.y * 0.6}px, 0)`,
            background: 'rgba(10,10,10,0.88)',
            border: '1px solid rgba(204,255,0,0.35)',
            borderRadius: '20px',
            padding: '14px 18px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 16px 50px rgba(0,0,0,0.7), 0 0 40px rgba(204,255,0,0.18)',
            display: 'flex', alignItems: 'center', gap: '14px',
            zIndex: 6,
            opacity: entered ? 1 : 0,
            transition: 'opacity 1000ms 900ms ease',
          }"
        >
          <div
            :style="{
              width: '44px', height: '44px',
              borderRadius: '10px',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #CCFF00',
              boxShadow: '0 0 20px rgba(204,255,0,0.6)',
              overflow: 'hidden',
            }"
          >
            <img
              src="/uploads/telegram-cloud-photo-size-4-5904481809322413580-y.jpg"
              alt="LIFTAG QR Code"
              :style="{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }"
            />
          </div>
          <div>
            <div class="protocol" :style="{ color: '#CCFF00', fontSize: '9px' }">QR · MACHINE SYNC</div>
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700, fontSize: '14px',
                fontStyle: 'italic', textTransform: 'uppercase',
                letterSpacing: '-0.02em', marginTop: '2px',
              }"
            >
              SCAN → TRACK
            </div>
          </div>
        </div>

        <!-- Live volume chip -->
        <div
          :style="{
            position: 'absolute', top: '100px', right: '-30px',
            transform: `translate3d(${p2.x * 1.2}px, ${p2.y * 0.5}px, 0)`,
            background: 'rgba(10,10,10,0.92)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px',
            padding: '14px 18px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
            zIndex: 6,
            opacity: entered ? 1 : 0,
            transition: 'opacity 1000ms 1100ms ease',
            minWidth: '160px',
          }"
        >
          <div class="protocol" :style="{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }">VOLUME · TODAY</div>
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800, fontSize: '28px',
              color: '#CCFF00', letterSpacing: '-0.02em', marginTop: '4px',
            }"
          >
            3.2<span :style="{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }"> t</span>
          </div>
          <div
            :style="{
              fontSize: '11px', color: '#22C55E',
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 700, marginTop: '4px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }"
          >
            <span :style="{ color: '#22C55E' }">↑</span> +18% vs last week
          </div>
          <!-- Mini sparkline -->
          <svg viewBox="-3 -3 86 26" :style="{ width: '86px', height: '26px', marginTop: '8px', overflow: 'visible' }">
            <polyline
              points="0,16 12,13 24,14 36,10 48,11 60,7 72,4 77,2"
              fill="none"
              stroke="#CCFF00"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.7"
            />
            <circle cx="77" cy="2" r="2.5" fill="#CCFF00" />
          </svg>
        </div>

        <!-- PR badge -->
        <div
          :style="{
            position: 'absolute', bottom: '160px', right: '20px',
            transform: `translate3d(${p2.x * 0.8}px, ${p2.y * 0.4}px, 0)`,
            background: 'rgba(204,255,0,0.95)',
            borderRadius: '14px', padding: '10px 16px',
            boxShadow: '0 0 40px rgba(204,255,0,0.5)',
            zIndex: 6,
            opacity: entered ? 1 : 0,
            transition: 'opacity 1000ms 1300ms ease',
          }"
        >
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800, fontSize: '11px',
              letterSpacing: '0.15em', color: '#0E0E0E',
            }"
          >🏆 NEW PR</div>
          <div
            :style="{
              fontFamily: '\'Space Grotesk\', sans-serif',
              fontWeight: 700, fontSize: '18px',
              fontStyle: 'italic', color: '#0E0E0E',
              letterSpacing: '-0.03em', textTransform: 'uppercase', marginTop: '2px',
            }"
          >
            140kg Bench
          </div>
        </div>
      </div>
    </div>

    <!-- ── Mobile-first hero composition ── -->
    <div
      class="container hero-mobile-layout"
      :style="{
        position: 'relative',
        zIndex: 4,
        opacity: scrollFade,
      }"
    >
      <div
        class="hero-mobile-copy"
        :style="{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 700ms 120ms cubic-bezier(0.16,1,0.3,1), transform 700ms 120ms cubic-bezier(0.16,1,0.3,1)',
        }"
      >
        <div class="hero-mobile-kicker">
          <span class="hero-mobile-kicker-dot" />
          <span>Public beta</span>
        </div>

        <h1 class="hero-mobile-title">
          <span>Scan.</span>
          <span>Lift.</span>
          <span class="lime">Progress.</span>
        </h1>

        <p class="hero-mobile-copyline">
          Open LIFTAG at the machine. Log the set. Watch real progress compound.
        </p>

        <div class="hero-mobile-actions">
          <a href="#scan" class="hero-mobile-primary">See scan flow</a>
          <span class="hero-mobile-note">Free in beta</span>
        </div>
      </div>

      <div
        class="hero-mobile-visual"
        :style="{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 780ms 260ms cubic-bezier(0.16,1,0.3,1), transform 780ms 260ms cubic-bezier(0.16,1,0.3,1)',
        }"
      >
        <div class="hero-mobile-device">
          <div class="hero-mobile-device-glow" aria-hidden="true" />
          <Phone src="/assets/screens/home.png" :scale="1" :tilt-delay-ms="0" lite />
        </div>

        <div class="hero-mobile-proof" aria-label="LIFTAG launch stats">
          <span><strong>250+</strong> exercises</span>
          <span><strong>QR</strong> machine sync</span>
        </div>
      </div>
    </div>

    <!-- ── Scroll cue ── -->
    <div
      class="hero-scroll-cue"
      :style="{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        opacity: entered ? scrollFade * 0.7 : 0,
        transition: 'opacity 1200ms 1600ms ease',
        zIndex: 5,
      }"
    >
      <span class="protocol" :style="{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }">SCROLL</span>
      <div
        :style="{
          width: '1px', height: '48px',
          background: 'linear-gradient(180deg, #CCFF00 0%, transparent 100%)',
          animation: 'scrollPulse 2s ease-in-out infinite',
        }"
      />
    </div>
  </section>
</template>

<style scoped>
.cursor-glow {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(2px);
  transition: opacity 380ms ease;
  will-change: transform, opacity;
}

.cursor-glow-green {
  background: radial-gradient(circle, rgba(204, 255, 0, 0.08) 0%, transparent 58%);
}

.cursor-glow-red {
  background: radial-gradient(circle, rgba(255, 45, 85, 0.11) 0%, transparent 58%);
}

.hero-chart-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

.hero-chart-outline {
  vector-effect: non-scaling-stroke;
}

.hero-mobile-layout {
  display: none;
}

.hero-mobile-kicker {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  padding: 7px 12px;
  border: 1px solid rgba(204, 255, 0, 0.26);
  border-radius: 999px;
  background: rgba(204, 255, 0, 0.055);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.19em;
  line-height: 1;
  text-transform: uppercase;
}

.hero-mobile-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--liftag-primary);
  box-shadow: 0 0 16px rgba(204, 255, 0, 0.9);
}

.hero-mobile-title {
  display: grid;
  gap: 0;
  margin: 18px 0 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(50px, 15.6vw, 68px);
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.86;
  text-transform: uppercase;
}

.hero-mobile-title span {
  display: block;
}

.hero-mobile-copyline {
  max-width: 22rem;
  margin: 20px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.45;
}

.hero-mobile-actions {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 22px;
}

.hero-mobile-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--liftag-primary);
  color: var(--liftag-fg-on-primary);
  box-shadow: 0 0 30px rgba(204, 255, 0, 0.34);
  font-family: var(--liftag-font-body);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.hero-mobile-note {
  color: rgba(255, 255, 255, 0.46);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-mobile-visual {
  position: relative;
  min-height: 286px;
}

.hero-mobile-device {
  position: absolute;
  top: 0;
  right: clamp(4px, 4vw, 22px);
  width: min(47vw, 184px);
  aspect-ratio: 393 / 852;
}

.hero-mobile-device :deep(.phone) {
  width: 100% !important;
}

.hero-mobile-device-glow {
  position: absolute;
  inset: 10% -28% 3%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 52% 35%, rgba(204, 255, 0, 0.25), transparent 57%),
    linear-gradient(180deg, rgba(204, 255, 0, 0.09), rgba(255, 45, 85, 0.08));
  filter: blur(22px);
  opacity: 0.95;
}

.hero-mobile-proof {
  position: absolute;
  left: 0;
  bottom: 18px;
  display: grid;
  gap: 8px;
  width: min(50vw, 184px);
}

.hero-mobile-proof span {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(8, 10, 6, 0.78);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.38);
  color: rgba(255, 255, 255, 0.58);
  font-family: var(--liftag-font-mono);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.hero-mobile-proof strong {
  color: var(--liftag-primary);
  font-size: 15px;
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 100svh !important;
    overflow-x: clip !important;
    overflow-y: visible !important;
    padding-top: 84px !important;
    padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
  }

  .hero-grid {
    display: none !important;
  }

  .hero-mobile-layout {
    display: grid;
    grid-template-rows: auto minmax(360px, 1fr);
    gap: 20px;
    min-height: calc(100svh - 112px);
    padding-top: 22px;
  }

  .hero-mobile-visual {
    min-height: 360px;
  }

  .hero-scroll-cue {
    display: none !important;
  }
}

@media (max-width: 420px) {
  .hero-mobile-layout {
    grid-template-rows: auto minmax(360px, 1fr);
    gap: 16px;
    min-height: calc(100svh - 106px);
    padding-top: 18px;
  }

  .hero-mobile-title {
    font-size: clamp(46px, 14.5vw, 58px);
  }

  .hero-mobile-copyline {
    max-width: 19rem;
    font-size: 15px;
  }

  .hero-mobile-device {
    width: min(48vw, 166px);
  }

  .hero-mobile-proof {
    width: min(51vw, 174px);
  }
}

@media (max-width: 768px) and (max-height: 740px) {
  .hero-section {
    padding-top: 76px !important;
    padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
  }

  .hero-mobile-layout {
    grid-template-rows: auto minmax(286px, 1fr);
    gap: 8px;
    min-height: calc(100svh - 92px);
    padding-top: 12px;
  }

  .hero-mobile-kicker {
    padding: 6px 10px;
    font-size: 9px;
  }

  .hero-mobile-title {
    margin-top: 14px;
    font-size: clamp(42px, 12vw, 48px);
    line-height: 0.84;
  }

  .hero-mobile-copyline {
    max-width: 18rem;
    margin-top: 14px;
    font-size: 14px;
    line-height: 1.36;
  }

  .hero-mobile-actions {
    gap: 10px;
    margin-top: 16px;
  }

  .hero-mobile-primary {
    min-height: 40px;
    padding: 0 16px;
    font-size: 11px;
  }

  .hero-mobile-note {
    font-size: 9px;
  }

  .hero-mobile-visual {
    min-height: 286px;
    margin-top: -18px;
  }

  .hero-mobile-device {
    right: clamp(0px, 3vw, 12px);
    width: min(36vw, 126px);
  }

  .hero-mobile-proof {
    bottom: 20px;
    width: min(51vw, 160px);
  }

  .hero-mobile-proof span {
    padding: 8px 10px;
    font-size: 8px;
  }

  .hero-mobile-proof strong {
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .hero-mobile-title {
    font-size: 46px;
  }

  .hero-mobile-actions {
    gap: 10px;
  }

  .hero-mobile-primary {
    padding: 0 14px;
    font-size: 11px;
  }

  .hero-mobile-note {
    font-size: 9px;
  }
}

/* Pulse the chart dots in pure CSS — replaces an always-on rAF that bumped a
   reactive ref every frame just to drive sin-based opacity/r updates. Period
   matches 2π / (1.8/180) ≈ 10.47s; per-dot animation-delay reproduces the
   original i*1.4 rad phase offset. */
@keyframes heroDotOuterPulse {
  0%, 100% { r: 5; opacity: 0.04; }
  50%      { r: 8; opacity: 0.08; }
}
@keyframes heroDotMidPulse {
  0%, 100% { opacity: 0.28; }
  50%      { opacity: 0.40; }
}
.hero-dot-outer { animation: heroDotOuterPulse 10.47s ease-in-out infinite; }
.hero-dot-mid   { animation: heroDotMidPulse   10.47s ease-in-out infinite; }
</style>
