<script setup lang="ts">
// ─── reactive mouse / scroll state ───────────────────────────────────────────
// rawMouse is a plain object (not a ref) passed to useLerp by reference.
// We mutate its x/y in-place so useLerp's RAF loop sees updates without
// needing to re-subscribe.
const rawMouse = { x: 0, y: 0 }
const scrollY = ref(0)
const entered = ref(false)
const cursorGlowX = ref(-9999)
const cursorGlowY = ref(-9999)

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

// dot-pulse tick (drives Math.sin animation each RAF)
const tick = ref(0)
let tickRaf = 0

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

  // mouse + scroll
  const onMove = (e: MouseEvent) => {
    // mutate in-place — useLerp holds a reference to this object
    rawMouse.x = (e.clientX / window.innerWidth - 0.5) * 2
    rawMouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    cursorGlowX.value = e.clientX
    cursorGlowY.value = e.clientY
  }
  const onScroll = () => { scrollY.value = window.scrollY }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('scroll', onScroll, { passive: true })

  // dot tick RAF
  const runTick = () => {
    tick.value++
    tickRaf = requestAnimationFrame(runTick)
  }
  tickRaf = requestAnimationFrame(runTick)

  // chart draw-on-load: apply dash animation after DOM paint
  await nextTick()
  const order = [
    { el: refL4.value, delay: 200  },
    { el: refL3.value, delay: 700  },
    { el: refL2.value, delay: 1100 },
    { el: refL1.value, delay: 1500 },
  ]
  order.forEach(({ el, delay }) => {
    if (!el) return
    const len = el.getTotalLength()
    el.style.strokeDasharray  = String(len)
    el.style.strokeDashoffset = String(len)
    setTimeout(() => {
      el.style.transition      = 'stroke-dashoffset 1600ms cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.strokeDashoffset = '0'
    }, delay)
  })

  queueHeroLaserTimer(runAllHeroLaserReveals, 280)

  onBeforeUnmount(() => {
    clearTimeout(t)
    cleanupHeroLasers()
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(tickRaf)
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
          ref="refL4"
          :points="poly(l4)"
          fill="none"
          stroke="#CCFF00"
          stroke-width="1"
          opacity="0.07"
          stroke-linejoin="round"
        />
        <polyline
          ref="refL3"
          :points="poly(l3)"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
          opacity="0.09"
          stroke-linejoin="round"
        />
        <polyline
          ref="refL2"
          :points="poly(l2)"
          fill="none"
          stroke="#CCFF00"
          stroke-width="1"
          opacity="0.13"
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

        <!-- Main l1 line (draw-on-load) -->
        <polyline
          ref="refL1"
          :points="poly(l1)"
          fill="none"
          stroke="#CCFF00"
          stroke-width="1.5"
          opacity="0.32"
          stroke-linejoin="round"
        />

        <!-- Pulsing dots along l1 -->
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
              :cx="l1[idx][0]"
              :cy="l1[idx][1]"
              :r="5 + (0.5 + Math.sin(tick / 180 * 1.8 + i * 1.4) * 0.5) * 3"
              fill="none"
              stroke="#CCFF00"
              stroke-width="1"
              :opacity="0.04 + (0.5 + Math.sin(tick / 180 * 1.8 + i * 1.4) * 0.5) * 0.04"
            />
            <circle
              :cx="l1[idx][0]"
              :cy="l1[idx][1]"
              r="2.5"
              fill="#CCFF00"
              :opacity="0.28 + (0.5 + Math.sin(tick / 180 * 1.8 + i * 1.4) * 0.5) * 0.12"
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
      :style="{
        position: 'fixed',
        left: `${cursorGlowX}px`,
        top: `${cursorGlowY}px`,
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 58%)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1,
        filter: 'blur(2px)',
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
        transition: 'background 0.1s',
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
          left: `${p.x + mouse.x * p.depth * 2.5 - scrollY * p.depth * 0.03}%`,
          top: `${p.y + mouse.y * p.depth * 2 - scrollY * p.speed * 0.04}%`,
          width: `${p.r * 2}px`,
          height: `${p.r * 2}px`,
          borderRadius: '50%',
          background: p.depth > 0.7 ? '#CCFF00' : 'rgba(255,255,255,0.6)',
          opacity: p.depth * 0.5,
          boxShadow: p.depth > 0.7 ? `0 0 ${p.r * 6}px rgba(204,255,0,0.8)` : 'none',
          transition: 'left 200ms ease, top 200ms ease',
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
      <div>

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
          }"
        >
          <Phone src="/assets/screens/progression.png" :scale="0.7" :tilt-delay-ms="140" />
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
          }"
        >
          <Phone src="/assets/screens/log-set.png" :scale="0.64" :tilt-delay-ms="230" />
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
          <Phone src="/assets/screens/home.png" :scale="0.92" :tilt-delay-ms="0" />
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

    <!-- ── Scroll cue ── -->
    <div
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
