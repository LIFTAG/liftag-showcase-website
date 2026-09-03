<script setup lang="ts">
import {
  HERO_WORDS,
  heroLaserClass,
  isHeroLimeWord,
  useHeroLaser,
} from '../composables/useHeroLaser'

const entered = ref(false)
const showHeroParticles = ref(false)
const loadHero3d = ref(false)
const hasMounted = ref(false)
const keepDesktopHeroPhones = computed(() => hasMounted.value)
const frontPhoneReady = ref(false)

const DESKTOP_PARTICLE_COUNT = 1200
const DESKTOP_PARTICLE_DPR_CAP = 1.75

const props = withDefaults(defineProps<{
  autoEnter?: boolean
  hideFrontPhone?: boolean
  playEnter?: boolean
}>(), {
  autoEnter: true,
  hideFrontPhone: false,
  playEnter: false,
})

const emit = defineEmits<{
  'front-ready': []
}>()

const { setTitleEl, startHeroLaser, cleanupHeroLasers } = useHeroLaser({
  emitSparks: true,
  followFinishedWalls: true,
})

const frontPhoneEl = ref<HTMLElement | null>(null)
let entranceStarted = false

function enter() {
  if (entranceStarted) return
  entranceStarted = true
  entered.value = true
  startHeroLaser()
}

watch(() => props.playEnter, (v) => { if (v) enter() })

defineExpose({ enter, frontPhoneEl })

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

function formatHeroStat(target: number, suffix: string) {
  return (val: number) => {
    if (target >= 1000) return `${(val / 1000).toFixed(1)}k${suffix}`
    return `${val}${suffix}`
  }
}

const stat1 = useCountUp(400, 1600, formatHeroStat(400, '+'))
const stat2 = useCountUp(11, 1600, formatHeroStat(11, ''))
const stat4 = useCountUp(100, 1600, formatHeroStat(100, '%'))

let heroEntranceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (props.autoEnter || props.playEnter) {
    heroEntranceTimer = setTimeout(() => { enter() }, 80)
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const loadDesktop3d = !prefersReducedMotion
  showHeroParticles.value = loadDesktop3d
  loadHero3d.value = loadDesktop3d
  hasMounted.value = true
})

onBeforeUnmount(() => {
  if (heroEntranceTimer) clearTimeout(heroEntranceTimer)
  if (heroVolumeChartRaf) cancelAnimationFrame(heroVolumeChartRaf)
  cleanupHeroLasers()
  heroEntranceTimer = null
})

function parallaxX(mxPx: number) {
  return `calc(var(--hero-mx) * ${mxPx}px)`
}

function parallaxY(myPx: number, scrollPx: number) {
  const sign = scrollPx < 0 ? '-' : '+'
  return `calc(var(--hero-my) * ${myPx}px ${sign} var(--hero-scroll) * ${Math.abs(scrollPx)}px)`
}

const backLeftPhoneTransform = `translate3d(${parallaxX(-18)}, ${parallaxY(-12, 0.12)}, -60px) rotateY(10deg) rotateX(-3deg)`
const syncChipTransform = `translate3d(${parallaxX(-23.4)}, ${parallaxY(-7.2, 0.072)}, 0)`
const backRightPhoneTransform = `translate3d(${parallaxX(10)}, ${parallaxY(10, -0.08)}, -40px) rotateY(-12deg) rotateX(-2deg)`
const volumeChipTransform = `translate3d(${parallaxX(12)}, ${parallaxY(5, -0.04)}, 0)`
const prBadgeTransform = `translate3d(${parallaxX(8)}, ${parallaxY(4, -0.032)}, 0)`
const frontPhoneTransform = `translate3d(calc(-50% + var(--hero-mx) * 26px), ${parallaxY(18, -0.22)}, 0px)`
const nfcTagTransform = `translate3d(${parallaxX(22)}, ${parallaxY(15, -0.12)}, 96px)`
  + ' rotateX(calc(var(--hero-my) * 0.8deg))'
  + ' rotateY(calc(var(--hero-mx) * 0.8deg))'
  + ' rotateZ(calc(var(--hero-mx) * 0.35deg))'
</script>

<template>
  <div class="hero-desktop-wrap">
    <ClientOnly>
      <HeroCharts />
    </ClientOnly>

    <div
      v-if="!showHeroParticles"
      class="hero-static-grid hero-fades"
      aria-hidden="true"
    />

    <LazyHeroParticles
      v-if="showHeroParticles"
      :count="DESKTOP_PARTICLE_COUNT"
      :dpr-cap="DESKTOP_PARTICLE_DPR_CAP"
      interactive
      grid-warp
      style="z-index: 2"
    />

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
      <div class="hero-copy">
        <h1
          class="hero-title-laser"
          :style="{
            margin: '0 0 28px',
            fontFamily: 'var(--liftag-font-headline)',
            fontWeight: 700,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            fontSize: 'clamp(56px, 8.5vw, 128px)',
          }"
        >
          <span
            v-for="(word, i) in HERO_WORDS"
            :key="i"
            class="hero-title-line"
          >
            <span
              :ref="(el) => setTitleEl(el as Element | null, i)"
              :class="heroLaserClass(word, i)"
              :style="{
                color: isHeroLimeWord(word) ? '#CCFF00' : '#fff',
              }"
            >
              {{ word }}
            </span>
            <span
              v-if="isHeroLimeWord(word)"
              class="hero-title-glow"
              aria-hidden="true"
              :data-word="word"
            />
          </span>
        </h1>

        <p
          :style="{
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '520px',
            margin: '0 0 36px',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 900ms 500ms cubic-bezier(0.16,1,0.3,1), transform 900ms 500ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          Tap or scan any machine. Track every set. Watch your numbers compound.<br />
          <span :style="{ color: 'rgba(255,255,255,0.4)' }">Core workout tracking is free forever. Premium intelligence is optional.</span>
        </p>

        <div
          class="hero-badges"
          :style="{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '60px',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 900ms 640ms cubic-bezier(0.16,1,0.3,1), transform 900ms 640ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          <div data-magnetic="18" style="display: inline-flex;">
            <GetAppBtn hero label="Get LIFTAG" />
          </div>
        </div>

        <div
          class="hero-stats"
          :style="{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 900ms 800ms cubic-bezier(0.16,1,0.3,1), transform 900ms 800ms cubic-bezier(0.16,1,0.3,1)',
          }"
        >
          <div>
            <div
              :ref="(el) => (stat1.el.value = el as HTMLElement | null)"
              :style="{
                fontFamily: 'var(--liftag-font-mono)',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >0+</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Exercises in library</div>
          </div>

          <div>
            <div
              :ref="(el) => (stat2.el.value = el as HTMLElement | null)"
              :style="{
                fontFamily: 'var(--liftag-font-mono)',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >0</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Muscle groups</div>
          </div>

          <div>
            <div
              :ref="(el) => (stat4.el.value = el as HTMLElement | null)"
              :style="{
                fontFamily: 'var(--liftag-font-mono)',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }"
            >0%</div>
            <div class="protocol" :style="{ color: '#555', marginTop: '8px', fontSize: '9px' }">Core tracking · free forever</div>
          </div>
        </div>
      </div>

      <div
        class="hero-phones"
        :style="{ position: 'relative', height: '700px', perspective: '1600px', transform: 'translateY(-32px)' }"
      >
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
          <Phone v-if="keepDesktopHeroPhones" src="/assets/screens/hero-workout.webp" :scale="0.7" :tilt-delay-ms="140" :static-bezel="false" lite />
        </div>

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
          <Phone v-if="keepDesktopHeroPhones" src="/assets/screens/hero-progress.webp" :scale="0.64" :tilt-delay-ms="230" :static-bezel="false" lite />
        </div>

        <div
          ref="frontPhoneEl"
          :style="{
            position: 'absolute', top: 0, left: '50%',
            transform: frontPhoneTransform,
            willChange: 'transform',
            opacity: entered && frontPhoneReady && !props.hideFrontPhone ? 1 : 0,
            transition: entered && frontPhoneReady && !props.hideFrontPhone
              ? (props.autoEnter ? 'opacity 1000ms 100ms ease' : 'opacity 180ms linear')
              : 'none',
          }"
        >
          <div
            v-if="props.hideFrontPhone"
            class="hero-front-sizer"
            aria-hidden="true"
          />
          <div
            v-if="!props.hideFrontPhone"
            class="pulse-glow-layer"
            :style="{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(204,255,0,0.22) 0%, transparent 65%)',
              filter: 'blur(24px)',
            }"
          />
          <Phone
            v-if="keepDesktopHeroPhones && !props.hideFrontPhone"
            src="/assets/screens/hero-dashboard.webp"
            :scale="0.92"
            :tilt-delay-ms="0"
            :static-bezel="false"
            priority
            @ready="frontPhoneReady = true; emit('front-ready')"
          />
          <div
            v-if="!props.hideFrontPhone"
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
                fontFamily: 'var(--liftag-font-headline)',
                fontWeight: 700, fontSize: '14px',
                fontStyle: 'italic', textTransform: 'uppercase',
                letterSpacing: '-0.02em', marginTop: '2px',
              }"
            >
              TAP / SCAN → TRACK
            </div>
          </div>
        </div>

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
              <LazyNfcTag3D v-if="loadHero3d" />
            </ClientOnly>
          </div>
        </div>

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
              fontFamily: 'var(--liftag-font-mono)',
              fontWeight: 800, fontSize: '28px',
              color: '#CCFF00', letterSpacing: '-0.02em', marginTop: '4px',
            }"
          >
            3.2<span :style="{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }"> t</span>
          </div>
          <div
            :style="{
              fontSize: '11px', color: '#22C55E',
              fontFamily: 'var(--liftag-font-mono)',
              fontWeight: 700, marginTop: '4px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }"
          >
            <span :style="{ color: '#22C55E' }">↑</span> +18% vs last week
          </div>
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
          <div class="hero-pr-tag">
            <svg
              class="hero-pr-icon"
              viewBox="0 0 16 16"
              width="13"
              height="13"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4.1 2.1h7.8v3.2c0 2.15-1.75 3.9-3.9 3.9s-3.9-1.75-3.9-3.9V2.1z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linejoin="round"
              />
              <path
                d="M4.1 3.15H2.55A1.45 1.45 0 0 0 2.55 6c.85 0 1.4-.4 1.55-1"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
              />
              <path
                d="M11.9 3.15h1.55A1.45 1.45 0 0 1 13.45 6c-.85 0-1.4-.4-1.55-1"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
              />
              <path
                d="M8 9.2v2.15M6.15 11.35h3.7M5.2 13.85h5.6"
                fill="none"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
              />
            </svg>
            NEW PR
          </div>
          <div
            :style="{
              fontFamily: 'var(--liftag-font-headline)',
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
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .hero-desktop-wrap {
    display: none !important;
  }
}

.hero-front-sizer {
  width: calc(280px * 0.92);
  aspect-ratio: 393 / 852;
}

.hero-static-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 90% 80% at 60% 40%, black 20%, transparent 80%);
}

@media (min-width: 769px) {
  .hero-static-grid {
    visibility: hidden;
  }
}

@media (min-width: 769px) and (prefers-reduced-motion: reduce) {
  .hero-static-grid {
    visibility: visible;
  }
}

.hero-pr-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--liftag-font-mono);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #0E0E0E;
}

.hero-pr-icon {
  display: block;
  flex-shrink: 0;
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
  top: 400px;
  left: 26px;
  z-index: 8;
  width: 88px;
  height: 88px;
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

@media (prefers-reduced-motion: reduce) {
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
