<script setup lang="ts">
import {
  finishHeroLaserWall,
  publishHeroLaserWall,
  resetHeroParticleField,
  revealedWordBox,
} from '../composables/useHeroParticleField'

// ─── reactive mouse / scroll state ───────────────────────────────────────────
// rawMouse is a reference into the shared singleton - useLerpVars' rAF reads
// .x/.y each frame, so the page-wide single mousemove handler keeps it fresh
// without us owning a per-component listener.
const sharedMouse = useSharedMouse()
const rawMouse = sharedMouse.latest
const entered = ref(false)
// Tone flips on a custom event, not on pointer movement, so it stays reactive.
// The orb's position does not - see --hero-cursor-x / --hero-cursor-y below.
const cursorGlowTone = ref<'green' | 'red'>('green')
// Phones render only the front-center device. Its Three.js path runs in lite,
// non-interactive mode so the stronger 3D framing does not add an idle loop.
const isMobile = ref(false)
// The GPU particle field is desktop-only: on phones its per-frame simulation
// plus a second WebGL context was the bulk of the hero's jank. Starts false so
// SSR and the first client render agree, then desktops switch it on in
// onMounted - phones never mount the component or fetch its three.js chunk.
const showHeroParticles = ref(false)
const heroRoot = ref<HTMLElement | null>(null)

// smooth lerp (factor 0.06 matches React source). Gated on the section being
// near the viewport so mousemoves far down the page do not wake this loop.
// Publishes --hero-mx / --hero-my on the section rather than a ref: the hero has
// by far the most bindings on this page, and re-rendering all of them for every
// frame of the lerp's convergence tail was the most expensive thing the cursor
// could do.
const lerpActive = useNearViewport(heroRoot)
useLerpVars(heroRoot, rawMouse, 'hero', 0.06, () => lerpActive.value)

const heroVolumeChartSvg = ref<SVGSVGElement | null>(null)
const heroVolumeChartTargetP = ref(1)
const heroVolumeChartDisplayP = ref(1)
let heroVolumeChartRaf = 0

const heroVolumeChartPts: [number, number][] = [
  [0, 16], [12, 13], [24, 14], [36, 10],
  [48, 11], [60, 7], [72, 4], [77, 2],
]

function heroVolumePointAt(p: number) {
  const clampedP = Math.max(0, Math.min(1, p))
  const totalLen = heroVolumeChartPts.length - 1
  const idx = Math.min(clampedP * totalLen, totalLen)
  const i0 = Math.floor(idx)
  const i1 = Math.min(i0 + 1, totalLen)
  const t = idx - i0
  const [x0, y0] = heroVolumeChartPts[i0]
  const [x1, y1] = heroVolumeChartPts[i1]

  return {
    x: x0 + (x1 - x0) * t,
    y: y0 + (y1 - y0) * t,
  }
}

const heroVolumeChartPoint = computed(() => heroVolumePointAt(heroVolumeChartDisplayP.value))
const heroVolumeChartClipWidth = computed(() => heroVolumeChartPoint.value.x + 7)
const heroVolumeChartDotOpacity = computed(() => heroVolumeChartDisplayP.value > 0.02 ? 1 : 0)

function tickHeroVolumeChart() {
  const target = heroVolumeChartTargetP.value
  const next = heroVolumeChartDisplayP.value + (target - heroVolumeChartDisplayP.value) * 0.18

  if (Math.abs(target - next) < 0.001) {
    heroVolumeChartDisplayP.value = target
    heroVolumeChartRaf = 0
    return
  }

  heroVolumeChartDisplayP.value = next
  heroVolumeChartRaf = requestAnimationFrame(tickHeroVolumeChart)
}

function setHeroVolumeChartTarget(p: number) {
  heroVolumeChartTargetP.value = Math.max(0.02, Math.min(1, p))
  if (!heroVolumeChartRaf) heroVolumeChartRaf = requestAnimationFrame(tickHeroVolumeChart)
}

function handleHeroVolumeChartMove(event: PointerEvent) {
  const rect = heroVolumeChartSvg.value?.getBoundingClientRect()
    ?? (event.currentTarget as HTMLElement).getBoundingClientRect()
  setHeroVolumeChartTarget((event.clientX - rect.left) / Math.max(1, rect.width))
}

function resetHeroVolumeChartHover() {
  setHeroVolumeChartTarget(1)
}

onBeforeUnmount(() => {
  if (heroVolumeChartRaf) cancelAnimationFrame(heroVolumeChartRaf)
})

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

type HeroLaserWallTrack = { leadX: number; now: number }

function publishHeroLaserWallFromEl(
  el: HTMLElement,
  fromRight: boolean,
  progress: number,
  strength: number,
  now: number,
  track: HeroLaserWallTrack | null,
): HeroLaserWallTrack {
  const box = revealedWordBox(el.getBoundingClientRect(), fromRight, progress)
  const vx = track && now > track.now
    ? (box.leadingX - track.leadX) / ((now - track.now) / 1000)
    : 0
  publishHeroLaserWall(box, vx, strength, fromRight ? -1 : 1)
  return { leadX: box.leadingX, now }
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

  const chargeStart = performance.now()
  let charging = true
  let wallTrack: HeroLaserWallTrack | null = null

  const charge = (now: number) => {
    if (!charging) return
    const t = Math.min((now - chargeStart) / heroLaserChargeMs, 1)
    wallTrack = publishHeroLaserWallFromEl(el, fromRight, 0, t, now, wallTrack)
    if (t < 1) queueHeroLaserRaf(charge)
  }
  queueHeroLaserRaf(charge)

  queueHeroLaserTimer(() => {
    charging = false
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
      wallTrack = publishHeroLaserWallFromEl(el, fromRight, eased, 1, now, wallTrack)

      if (now - lastSparkTime > 70 && t > 0.04 && t < 0.92) {
        lastSparkTime = now
        emitHeroLaserSparks(el, beamPercent, isGreen)
      }

      if (t < 1) {
        queueHeroLaserRaf(animate)
        return
      }

      finishHeroLaserWall()
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

  if (isMobile.value || window.matchMedia('(max-width: 768px)').matches) {
    resetHeroParticleField()
    heroTitleEls.forEach((el) => el?.classList.add('reveal-done'))
    heroLaserDone.value = true
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resetHeroParticleField()
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
  resetHeroParticleField()
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
let heroEntranceTimer: ReturnType<typeof setTimeout> | null = null
let cursorGlowRaf = 0
let heroMobileMql: MediaQueryList | null = null
let onHeroMobileChange: ((event: MediaQueryListEvent) => void) | null = null
let unsubHeroMouse: (() => void) | null = null
let onHeroCursorGlowTone: EventListener | null = null
let onHeroScroll: (() => void) | null = null

onMounted(() => {
  heroLaserStarted = false
  heroLaserCancelled = false
  heroLaserDone.value = false
  // entrance delay
  heroEntranceTimer = setTimeout(() => { entered.value = true }, 80)

  heroMobileMql = window.matchMedia('(max-width: 768px)')
  isMobile.value = heroMobileMql.matches
  showHeroParticles.value = !heroMobileMql.matches
  onHeroMobileChange = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches
    showHeroParticles.value = !e.matches
    if (e.matches) {
      cleanupHeroLasers()
      heroLaserDone.value = true
    }
  }
  heroMobileMql.addEventListener('change', onHeroMobileChange)

  // Cursor orb position rides the same CSS-variable path as the parallax: the
  // orb is a fixed, compositor-positioned layer, so all it needs is a transform.
  // It used to bump two refs instead, which re-rendered the whole hero once per
  // rAF for as long as the pointer was moving - the exact cost the parallax
  // rewrite removes, so leaving it here would have undone most of the win.
  // Still rAF-coalesced: a 240Hz trackpad fires far more often than we paint.
  unsubHeroMouse = onMouseEvent(() => {
    if (cursorGlowRaf !== 0) return
    cursorGlowRaf = requestAnimationFrame(() => {
      cursorGlowRaf = 0
      const root = heroRoot.value
      if (!root) return
      root.style.setProperty('--hero-cursor-x', String(sharedMouse.latest.clientX))
      root.style.setProperty('--hero-cursor-y', String(sharedMouse.latest.clientY))
    })
  })
  onHeroCursorGlowTone = (event: Event) => {
    const tone = (event as CustomEvent<{ tone?: 'green' | 'red' }>).detail?.tone
    cursorGlowTone.value = tone === 'red' ? 'red' : 'green'
  }
  window.addEventListener('liftag:cursor-glow-tone', onHeroCursorGlowTone)

  let scrollQueued = false
  onHeroScroll = () => {
    if (scrollQueued) return
    scrollQueued = true
    requestAnimationFrame(() => {
      scrollQueued = false
      const y = window.scrollY

      // The fade, lift and parallax offset are CSS custom properties, not
      // reactive state. Three style writes on one element per frame, inherited
      // by everything that reads them, and opacity/transform stay on the
      // compositor. Bumping a ref instead re-rendered the whole hero — 28
      // particle style objects, four phone parallax transforms and four opacity
      // bindings — every frame, which is what made the fade stutter on phones.
      // Phones do none of this. The full hero scrolls normally so the device
      // remains fully visible on short viewports, and we avoid repainting its
      // blur and masked background while the user scrolls.
      if (isMobile.value) return

      const root = heroRoot.value
      if (root) {
        root.style.setProperty('--hero-fade', String(Math.max(0, 1 - y / 500)))
        root.style.setProperty('--hero-lift', `${y * 0.35}px`)
        root.style.setProperty('--hero-scroll', String(y))
      }
    })
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true })

  queueHeroLaserTimer(runAllHeroLaserReveals, 280)
})

onBeforeUnmount(() => {
  if (heroEntranceTimer) clearTimeout(heroEntranceTimer)
  if (cursorGlowRaf !== 0) cancelAnimationFrame(cursorGlowRaf)
  cursorGlowRaf = 0
  cleanupHeroLasers()
  unsubHeroMouse?.()

  if (heroMobileMql && onHeroMobileChange) {
    heroMobileMql.removeEventListener('change', onHeroMobileChange)
  }
  if (onHeroCursorGlowTone) {
    window.removeEventListener('liftag:cursor-glow-tone', onHeroCursorGlowTone)
  }
  if (onHeroScroll) {
    window.removeEventListener('scroll', onHeroScroll)
  }

  heroEntranceTimer = null
  heroMobileMql = null
  onHeroMobileChange = null
  unsubHeroMouse = null
  onHeroCursorGlowTone = null
  onHeroScroll = null
})

// ─── parallax ─────────────────────────────────────────────────────────────────
// Both inputs are CSS custom properties on the section: --hero-mx / --hero-my
// (the lerped pointer, normalized to -1..1) and --hero-scroll (window.scrollY in
// px, unitless). Every transform below is therefore a constant string, and the
// same string the old computeds produced numerically. Neither the cursor nor the
// scroll wheel re-renders this component any more; the browser re-resolves the
// calc()s and the transforms stay on the compositor.
function parallaxX(mxPx: number) {
  return `calc(var(--hero-mx) * ${mxPx}px)`
}

function parallaxY(myPx: number, scrollPx: number) {
  const sign = scrollPx < 0 ? '-' : '+'
  return `calc(var(--hero-my) * ${myPx}px ${sign} var(--hero-scroll) * ${Math.abs(scrollPx)}px)`
}

// Back-left phone, and the machine-sync chip that trails it at 1.3x / 0.6x.
const backLeftPhoneTransform = `translate3d(${parallaxX(-18)}, ${parallaxY(-12, 0.12)}, -60px) rotateY(10deg) rotateX(-3deg)`
const syncChipTransform = `translate3d(${parallaxX(-23.4)}, ${parallaxY(-7.2, 0.072)}, 0)`

// Back-right phone, and the volume chip / PR badge that trail it.
const backRightPhoneTransform = `translate3d(${parallaxX(10)}, ${parallaxY(10, -0.08)}, -40px) rotateY(-12deg) rotateX(-2deg)`
const volumeChipTransform = `translate3d(${parallaxX(12)}, ${parallaxY(5, -0.04)}, 0)`
const prBadgeTransform = `translate3d(${parallaxX(8)}, ${parallaxY(4, -0.032)}, 0)`

// Front-center phone, which also carries its own -50% centring offset.
const frontPhoneTransform = `translate3d(calc(-50% + var(--hero-mx) * 26px), ${parallaxY(18, -0.22)}, 0px)`

// Desktop-only NFC tag: the only element that tilts as well as translates.
const nfcTagTransform = `translate3d(${parallaxX(22)}, ${parallaxY(15, -0.12)}, 96px)`
  + ' rotateX(calc(var(--hero-my) * 0.8deg))'
  + ' rotateY(calc(var(--hero-mx) * 0.8deg))'
  + ' rotateZ(calc(var(--hero-mx) * 0.35deg))'

// Lime atmosphere glow: the gradient's centre drifts with the cursor.
const atmosphereGlow = 'radial-gradient(ellipse 70% 55%'
  + ' at calc(58% + var(--hero-mx) * 4%) calc(40% + var(--hero-my) * 4%),'
  + ' rgba(204,255,0,0.12), transparent 65%)'
</script>

<template>
  <section
    ref="heroRoot"
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

    <!-- ── Background chart lines (independent depth layers) ── -->
    <HeroCharts />

    <!-- ── Cursor orb ── -->
    <div
      class="cursor-glow cursor-glow-green"
      :style="{ opacity: cursorGlowTone === 'red' ? 0 : 1 }"
    />
    <div
      class="cursor-glow cursor-glow-red"
      :style="{ opacity: cursorGlowTone === 'red' ? 1 : 0 }"
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
      }"
      class="hero-fades"
    />

    <!-- ── Lime atmosphere glow ── -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: atmosphereGlow,
      }"
    />

    <!-- ── GPU particle field (single draw call, self-gating) ── -->
    <!-- Lazy: keeps three.js out of the eager chunk (see index.vue idle warmup).
         Desktop only - phones drop the field entirely rather than render a
         reduced one. -->
    <LazyHeroParticles
      v-if="showHeroParticles"
      :count="1200"
      :dpr-cap="1.75"
      style="z-index: 2"
    />

    <!-- ── Main content grid ── -->
    <div
      class="container hero-grid hero-fades hero-lifts"
      :style="{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        alignItems: 'center',
        gap: '40px',
        minHeight: 'calc(100vh - 180px)',
        position: 'relative',
        zIndex: 3,
      }"
    >

      <!-- ── LEFT: copy ── -->
      <div class="hero-copy">

        <!-- Headline - laser reveal entrance -->
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
          Tap or scan any machine. Track every set. Watch your numbers compound.<br />
          <span :style="{ color: 'rgba(255,255,255,0.4)' }">Core workout tracking is free forever. Premium intelligence is optional.</span>
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
          <div data-magnetic="18" style="display: inline-flex;">
            <GetAppBtn hero label="Get LIFTAG" />
          </div>
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
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Core tracking · free forever</div>
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
            transform: backLeftPhoneTransform,
            transformStyle: 'preserve-3d',
            opacity: entered ? 0.75 : 0,
            transition: entered ? 'opacity 1200ms 300ms ease' : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))',
          }"
        >
          <Phone src="/assets/screens/progression.webp" :scale="0.7" :tilt-delay-ms="140" :static-bezel="false" lite />
        </div>

        <!-- Back-right phone -->
        <div
          :style="{
            position: 'absolute', top: '20px', right: '-10px',
            transform: backRightPhoneTransform,
            transformStyle: 'preserve-3d',
            opacity: entered ? 0.68 : 0,
            transition: entered ? 'opacity 1200ms 500ms ease' : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 22px 36px rgba(0,0,0,0.55))',
          }"
        >
          <Phone src="/assets/screens/log-set.webp" :scale="0.64" :tilt-delay-ms="230" :static-bezel="false" lite />
        </div>

        <!-- Front center phone (main) -->
        <div
          :style="{
            position: 'absolute', top: 0, left: '50%',
            transform: frontPhoneTransform,
            willChange: 'transform',
            opacity: entered ? 1 : 0,
            transition: entered ? 'opacity 1000ms 100ms ease' : 'none',
          }"
        >
          <!-- Glow behind phone -->
          <div
            class="pulse-glow-layer"
            :style="{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(204,255,0,0.22) 0%, transparent 65%)',
              filter: 'blur(24px)',
            }"
          />
          <Phone src="/assets/screens/home-hero-no-qr.webp" :scale="0.92" :tilt-delay-ms="0" :static-bezel="false" :lite="isMobile" priority />
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

        <!-- Machine sync chip -->
        <div
          :style="{
            position: 'absolute', bottom: '20px', left: '-24px',
            transform: syncChipTransform,
            background: 'rgba(10,10,10,0.96)',
            border: '1px solid rgba(204,255,0,0.35)',
            borderRadius: '20px',
            padding: '14px 18px',
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
              src="/uploads/qr-code-112.webp"
              srcset="/uploads/qr-code-112.webp 112w, /uploads/qr-code-160.webp 160w, /uploads/qr-code-224.webp 224w, /uploads/qr-code.webp 400w"
              sizes="44px"
              alt="LIFTAG QR Code"
              width="44"
              height="44"
              :style="{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }"
            />
          </div>
          <div>
            <div class="protocol" :style="{ color: '#CCFF00', fontSize: '9px' }">NFC + QR · MACHINE SYNC</div>
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700, fontSize: '14px',
                fontStyle: 'italic', textTransform: 'uppercase',
                letterSpacing: '-0.02em', marginTop: '2px',
              }"
            >
              TAP / SCAN → TRACK
            </div>
          </div>
        </div>

        <!-- Desktop-only dark NFC tag model -->
        <div
          class="hero-nfc-model"
          aria-hidden="true"
          :style="{
            transform: nfcTagTransform,
            opacity: entered ? 1 : 0,
            transition: entered ? 'opacity 1000ms 760ms ease' : 'none',
          }"
        >
          <div class="hero-nfc-tag-3d">
            <ClientOnly>
              <LazyNfcTag3D />
            </ClientOnly>
          </div>
        </div>

        <!-- Live volume chip -->
        <div
          class="hero-volume-chip"
          :style="{
            position: 'absolute', top: '100px', right: '-30px',
            transform: volumeChipTransform,
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px',
            padding: '14px 18px',
            boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
            zIndex: 6,
            opacity: entered ? 1 : 0,
            transition: 'opacity 1000ms 1100ms ease',
            minWidth: '160px',
          }"
          @pointermove="handleHeroVolumeChartMove"
          @pointerleave="resetHeroVolumeChartHover"
          @pointercancel="resetHeroVolumeChartHover"
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
          <svg
            ref="heroVolumeChartSvg"
            class="hero-volume-sparkline"
            viewBox="-3 -3 86 26"
            :style="{ width: '86px', height: '26px', marginTop: '8px', overflow: 'visible' }"
          >
            <defs>
              <clipPath id="heroVolumeSparkClip">
                <rect x="-3" y="-3" :width="heroVolumeChartClipWidth" height="32" />
              </clipPath>
            </defs>
            <polyline
              points="0,16 12,13 24,14 36,10 48,11 60,7 72,4 77,2"
              fill="none"
              stroke="#CCFF00"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.7"
              clip-path="url(#heroVolumeSparkClip)"
            />
            <polyline
              points="0,16 12,13 24,14 36,10 48,11 60,7 72,4 77,2"
              fill="none"
              stroke="#CCFF00"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.12"
              clip-path="url(#heroVolumeSparkClip)"
            />
            <circle
              :cx="heroVolumeChartPoint.x"
              :cy="heroVolumeChartPoint.y"
              r="2.5"
              fill="#CCFF00"
              :opacity="heroVolumeChartDotOpacity"
            />
          </svg>
        </div>

        <!-- PR badge -->
        <div
          :style="{
            position: 'absolute', bottom: '160px', right: '20px',
            transform: prBadgeTransform,
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
      class="container hero-mobile-layout hero-fades"
      :style="{
        position: 'relative',
        zIndex: 4,
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
        <p class="hero-mobile-title">
          <span>For <span class="lime">lifters.</span></span>
          <span>By <span class="lime">lifters.</span></span>
        </p>

        <p class="hero-mobile-copyline">
          Tap NFC or scan QR at the machine. Core workout tracking is free forever. Premium intelligence is optional.
        </p>

        <div class="hero-mobile-actions">
          <GetAppBtn hero label="Get LIFTAG" />
          <a href="#scan" class="hero-mobile-secondary">See how it works</a>
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
        <div class="hero-mobile-rail">
          <div class="hero-mobile-proof" aria-label="LIFTAG tap, scan, and tracking flow">
            <span><strong>Tap</strong> NFC tag</span>
            <span><strong>Scan</strong> machine QR</span>
            <span><strong>Log</strong> sets fast</span>
          </div>

        </div>

        <div class="hero-mobile-device">
          <div class="hero-mobile-device-glow" aria-hidden="true" />
          <Phone
            src="/assets/screens/home-hero-no-qr.webp"
            :scale="1"
            :tilt-delay-ms="0"
            lite
            enable-mobile3d
            :interactive3d="false"
            :static-bezel="false"
            crisp3d
            idle3d
            priority
          />
        </div>
      </div>
    </div>

    <!-- ── Scroll cue ── -->
    <div
      class="hero-scroll-cue"
      :class="{ 'is-visible': entered }"
      :style="{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        transition: 'opacity 1200ms 1600ms ease',
        zIndex: 5,
      }"
    >
      <span class="protocol" :style="{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }">SCROLL</span>
      <div
        class="hero-scroll-pulse"
        :style="{
          width: '1px', height: '48px',
          background: 'linear-gradient(180deg, #CCFF00 0%, transparent 100%)',
        }"
      />
    </div>
  </section>
</template>

<style scoped>
/* Scroll- and pointer-driven hero motion. Every value here is written straight
   to the section's inline style once per rAF (--hero-fade / --hero-lift /
   --hero-scroll from onHeroScroll, --hero-mx / --hero-my from useLerpVars)
   rather than flowing through Vue, so both gestures cost a few property writes
   instead of a full component re-render. --hero-scroll is window.scrollY in
   pixels and --hero-mx / --hero-my are the normalized -1..1 pointer, both
   unitless so each consumer can scale them itself. Defaults here keep first
   paint and SSR correct before any scroll or pointer event happens. */
.hero-section {
  --hero-fade: 1;
  --hero-lift: 0px;
  --hero-scroll: 0;
  --hero-mx: 0;
  --hero-my: 0;
  --hero-cursor-x: -9999;
  --hero-cursor-y: -9999;
}

.hero-fades {
  opacity: var(--hero-fade);
}

/* Hidden until the entrance finishes, then fades out with the rest of the hero. */
.hero-scroll-cue {
  opacity: 0;
}

.hero-scroll-cue.is-visible {
  opacity: calc(var(--hero-fade) * 0.7);
}

.hero-lifts {
  transform: translate3d(0, calc(var(--hero-lift) * -1), 0);
}

.cursor-glow {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 380ms ease;
  will-change: transform, opacity;
  /* Half the 420px orb, so the variables carry the raw client coordinates and
     the orb centres on them. The -9999 default parks it off screen until the
     first mousemove, exactly as the old ref default did. */
  transform: translate3d(
    calc(var(--hero-cursor-x) * 1px - 210px),
    calc(var(--hero-cursor-y) * 1px - 210px),
    0
  );
}

.cursor-glow-green {
  background: radial-gradient(circle, rgba(204, 255, 0, 0.08) 0%, transparent 58%);
}

.cursor-glow-red {
  background: radial-gradient(circle, rgba(255, 45, 85, 0.11) 0%, transparent 58%);
}

.hero-volume-chip {
  cursor: crosshair;
}

.hero-volume-sparkline {
  touch-action: none;
}

.hero-volume-sparkline polyline,
.hero-volume-sparkline circle {
  filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.42));
}

.hero-nfc-model {
  position: absolute;
  top: 380px;
  left: 6px;
  z-index: 8;
  width: 128px;
  height: 128px;
  pointer-events: none;
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.hero-nfc-tag-3d {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: heroNfcFloat 5.8s ease-in-out infinite;
}

.hero-mobile-layout {
  display: none;
}

.hero-mobile-title {
  display: grid;
  gap: 0;
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(48px, 13.6vw, 62px);
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.94;
  text-transform: uppercase;
}

.hero-mobile-title > span {
  display: block;
}

.hero-mobile-title .lime {
  display: inline;
}

.hero-mobile-copyline {
  max-width: 22rem;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.45;
}

/* The install CTA is the page's conversion action, so on phones it leads:
   full width, directly under the lead, with the scroll link demoted beneath it.
   It used to sit in the 132px proof rail beside the phone, where it was both
   the smallest control on screen and the least reachable. */
.hero-mobile-actions {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.hero-mobile-actions :deep(.get-app-btn) {
  width: 100%;
  max-width: none;
}

.hero-mobile-secondary {
  justify-self: start;
  color: rgba(255, 255, 255, 0.56);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  border-bottom: 1px solid rgba(204, 255, 0, 0.34);
  padding-bottom: 3px;
}

.hero-mobile-visual {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  max-width: 360px;
  min-height: 286px;
}

.hero-mobile-device {
  position: relative;
  flex: 0 0 auto;
  margin-top: 4px;
  width: min(46vw, 180px);
  aspect-ratio: 393 / 852;
}

.hero-mobile-device :deep(.phone) {
  position: relative;
  z-index: 2;
  width: 100% !important;
}

.hero-mobile-device :deep(.phone--static-mockup) {
  box-shadow:
    0 26px 64px rgba(0, 0, 0, 0.72),
    0 0 40px rgba(204, 255, 0, 0.1) !important;
}

.hero-mobile-device :deep(.phone-static-screen) {
  object-fit: contain;
}

.hero-mobile-device-glow {
  position: absolute;
  z-index: 0;
  inset: 10% -28% 3%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 52% 35%, rgba(204, 255, 0, 0.25), transparent 57%),
    linear-gradient(180deg, rgba(204, 255, 0, 0.09), rgba(255, 45, 85, 0.08));
  filter: blur(22px);
  opacity: 0.95;
}

.hero-mobile-rail {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  width: clamp(132px, 39vw, 156px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 22px;
}

.hero-mobile-proof {
  display: grid;
  gap: 9px;
}

.hero-mobile-proof span {
  display: grid;
  gap: 4px;
  padding: 11px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(8, 10, 6, 0.78);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.38);
  color: rgba(255, 255, 255, 0.58);
  font-family: var(--liftag-font-mono);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.08;
  text-transform: uppercase;
}

.hero-mobile-proof strong {
  color: var(--liftag-primary);
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-nfc-model {
    display: none !important;
  }

  .hero-section {
    min-height: var(--liftag-stable-vh) !important;
    overflow-x: clip !important;
    overflow-y: visible !important;
    padding-top: calc(84px + var(--liftag-safe-top)) !important;
    padding-bottom: max(20px, var(--liftag-safe-bottom)) !important;
  }

  .hero-grid {
    display: none !important;
  }

  .hero-mobile-layout {
    display: grid;
    grid-template-rows: auto auto;
    gap: 36px;
    min-height: 0;
    padding-top: 40px;
  }

  .hero-mobile-title {
    line-height: 0.98;
  }

  .hero-mobile-copyline {
    margin-top: 28px;
  }

  .hero-mobile-actions {
    margin-top: 32px;
  }

  .hero-mobile-visual {
    justify-content: center;
    width: 100%;
    max-width: none;
    min-height: 0;
  }

  .hero-mobile-rail {
    display: none;
  }

  .hero-mobile-device {
    --hero-phone-cycle: 10.5s;
    --hero-phone-motion-delay: 3.2s;

    width: min(46vw, 180px);
    margin-top: 0;
    isolation: isolate;
  }

  /* The centre device remains the single lightweight Three.js scene. These
     two rear devices are pre-rendered 180px WebPs, so their choreography adds
     no canvases, input listeners, or JavaScript animation loops. */
  .hero-mobile-device::before,
  .hero-mobile-device::after {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 1px solid oklch(0.28 0.008 120 / 0.96);
    border-radius: 15.5% / 7.2%;
    content: '';
    pointer-events: none;
    background-clip: padding-box;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    backface-visibility: hidden;
    filter: drop-shadow(0 22px 34px rgba(0, 0, 0, 0.58));
    will-change: transform;
  }

  .hero-mobile-device::before {
    background-image: url('/assets/screens/mobile-hero-rear-left.webp');
    opacity: 0.62;
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
    animation: heroRearLeftIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-mobile-device::after {
    background-image: url('/assets/screens/mobile-hero-rear-right.webp');
    opacity: 0.56;
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
    animation: heroRearRightIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-scroll-cue {
    display: none !important;
  }
}

/* The rear devices make one quiet out-and-back drift while the centre phone
   turns through its glare. Two-keyframe arcs keep velocity continuous and the
   smaller deltas stop the background phones competing with the real model. */
@keyframes heroRearLeftIdle {
  0%,
  24%,
  100% {
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }

  0% {
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }

  12% {
    transform: translate3d(-100.6%, 7.2%, 0) perspective(900px) rotateY(17.8deg) rotateZ(-6.3deg) scale(0.844);
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }
}

@keyframes heroRearRightIdle {
  0%,
  3%,
  27%,
  100% {
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }

  3% {
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }

  14% {
    transform: translate3d(0.4%, 4.4%, 0) perspective(900px) rotateY(-17.9deg) rotateZ(6.25deg) scale(0.844);
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }
}

@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
  .hero-mobile-device::before,
  .hero-mobile-device::after {
    animation: none;
    will-change: auto;
  }
}

/* Held, not cancelled: the open drawer hides these completely, and every frame
   they move underneath it is a frame the drawer's backdrop blur has to redo.
   `paused` keeps their place in the shared 10.5s cadence, so closing the drawer
   resumes the choreography rather than restarting it. */
:global(html[data-liftag-nav-open="true"] .hero-mobile-device::before),
:global(html[data-liftag-nav-open="true"] .hero-mobile-device::after) {
  animation-play-state: paused;
}

@media (max-width: 699px) {
  .hero-mobile-secondary {
    display: none;
  }
}

@media (max-width: 420px) {
  .hero-mobile-layout {
    grid-template-rows: auto auto;
    gap: 34px;
    min-height: 0;
    padding-top: 36px;
  }

  .hero-mobile-title {
    font-size: clamp(44px, 13vw, 54px);
  }

  .hero-mobile-copyline {
    max-width: 19rem;
    margin-top: 26px;
    font-size: 15px;
  }

  .hero-mobile-actions {
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  :global(html[data-liftag-short-viewport="true"] .hero-section) {
    padding-top: calc(76px + var(--liftag-safe-top)) !important;
    padding-bottom: max(16px, var(--liftag-safe-bottom)) !important;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-layout) {
    grid-template-rows: auto auto;
    gap: 26px;
    min-height: 0;
    padding-top: 24px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-title) {
    margin-top: 0;
    font-size: clamp(39px, 11.4vw, 46px);
    line-height: 0.96;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-copyline) {
    max-width: 18rem;
    margin-top: 22px;
    font-size: 14px;
    line-height: 1.36;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-actions) {
    gap: 10px;
    margin-top: 24px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-visual) {
    min-height: 0;
    margin-top: 0;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-device) {
    margin-top: 0;
    width: min(37vw, 142px);
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-rail) {
    width: clamp(140px, 43vw, 166px);
    padding-top: 10px;
    gap: 10px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-proof) {
    gap: 7px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-proof span) {
    padding: 8px 10px;
    font-size: 8px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-proof strong) {
    font-size: 13px;
  }
}

@media (min-width: 700px) and (max-width: 768px) {
  .hero-section {
    padding-top: calc(76px + var(--liftag-safe-top)) !important;
  }

  .hero-mobile-layout {
    grid-template-columns: minmax(0, 0.92fr) minmax(320px, 1.08fr);
    grid-template-rows: 1fr;
    align-items: center;
    gap: 22px;
    min-height: calc(var(--liftag-stable-vh) - 96px);
    padding-top: 0;
  }

  .hero-mobile-copy {
    align-self: start;
    max-width: 340px;
    padding-top: clamp(54px, 9vw, 72px);
  }

  .hero-mobile-title {
    font-size: clamp(44px, 7vw, 56px);
    line-height: 0.9;
  }

  .hero-mobile-copyline {
    max-width: 20rem;
    margin-top: 18px;
    font-size: 15px;
  }

  .hero-mobile-actions {
    gap: 11px;
    margin-top: 20px;
  }

  .hero-mobile-visual {
    justify-self: end;
    width: min(100%, 372px);
    max-width: none;
    min-height: 468px;
    align-items: center;
    gap: 12px;
  }

  .hero-mobile-rail {
    display: flex;
    width: clamp(138px, 20vw, 156px);
    padding-top: 0;
    gap: 12px;
  }

  .hero-mobile-device {
    width: min(24vw, 178px);
    margin-top: 0;
  }

}

@media (min-width: 700px) and (max-width: 768px) {
  :global(html[data-liftag-short-viewport="true"] .hero-mobile-layout) {
    grid-template-columns: minmax(0, 0.92fr) minmax(304px, 1.08fr);
    grid-template-rows: 1fr;
    min-height: calc(var(--liftag-stable-vh) - 84px);
    padding-top: 0;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-title) {
    font-size: clamp(40px, 6.3vw, 48px);
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-copy) {
    padding-top: clamp(42px, 7vw, 54px);
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-copyline) {
    max-width: 18.5rem;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-visual) {
    min-height: 420px;
  }
}

@media (max-width: 360px) {
  .hero-mobile-title {
    font-size: 39px;
  }

  .hero-mobile-actions {
    gap: 10px;
  }

}

.hero-scroll-pulse {
  animation: scrollPulse 2s ease-in-out infinite;
}

/* Desktop reduced-motion: the mobile block below already covers <=768px. */
@media (prefers-reduced-motion: reduce) {
  .hero-scroll-pulse {
    animation: none;
    opacity: 1;
  }

  .hero-nfc-tag-3d {
    animation: none;
  }
}

@keyframes heroNfcFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -7px, 8px);
  }
}
</style>
