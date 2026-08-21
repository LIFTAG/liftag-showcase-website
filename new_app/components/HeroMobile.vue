<script setup lang="ts">
import {
  HERO_MOBILE_TITLE_LINES,
  heroLaserClass,
  isHeroLimeWord,
  useHeroLaser,
} from '../composables/useHeroLaser'

const entered = ref(false)
const { setTitleEl, startHeroLaser, cleanupHeroLasers } = useHeroLaser({
  emitSparks: false,
  followFinishedWalls: false,
})

const heroMobileDetailsStyle = computed(() => ({
  opacity: entered.value ? 1 : 0,
  transform: entered.value ? 'translateY(0)' : 'translateY(14px)',
  pointerEvents: (entered.value ? 'auto' : 'none') as 'auto' | 'none',
  transition: 'opacity 700ms 120ms cubic-bezier(0.16,1,0.3,1), transform 700ms 120ms cubic-bezier(0.16,1,0.3,1)',
}))

const phoneCopyRoot = ref<HTMLElement | null>(null)
const phoneCopyInView = ref(false)
const phoneCopyEntered = computed(() => entered.value && phoneCopyInView.value)
let phoneCopyIo: IntersectionObserver | null = null
let heroEntranceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  heroEntranceTimer = setTimeout(() => { entered.value = true }, 80)
  startHeroLaser()

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    phoneCopyInView.value = true
  }
  else if (phoneCopyRoot.value) {
    phoneCopyIo = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        phoneCopyInView.value = true
        phoneCopyIo?.disconnect()
      },
      { threshold: 0.15 },
    )
    phoneCopyIo.observe(phoneCopyRoot.value)
  }
})

onBeforeUnmount(() => {
  if (heroEntranceTimer) clearTimeout(heroEntranceTimer)
  cleanupHeroLasers()
  phoneCopyIo?.disconnect()
  phoneCopyIo = null
  heroEntranceTimer = null
})
</script>

<template>
  <div class="hero-mobile-wrap">
    <div
      class="hero-static-grid hero-fades"
      aria-hidden="true"
    />

    <div
      class="container hero-mobile-layout hero-fades"
      :style="{
        position: 'relative',
        zIndex: 4,
      }"
    >
      <div class="hero-mobile-copy">
        <p class="hero-mobile-title">
          <span
            v-for="(line, lineIndex) in HERO_MOBILE_TITLE_LINES"
            :key="lineIndex"
            class="hero-title-line"
          >
            <template v-for="(word, wordIndex) in line" :key="wordIndex">
              <span v-if="wordIndex > 0">{{ ' ' }}</span>
              <span v-if="isHeroLimeWord(word)" class="hero-mobile-lime-word">
                <span
                  :ref="(el) => setTitleEl(el as Element | null, lineIndex * 2 + wordIndex)"
                  :class="heroLaserClass(word, lineIndex * 2 + wordIndex)"
                  :style="{ color: '#CCFF00' }"
                >{{ word }}</span>
                <span class="hero-title-glow" aria-hidden="true">{{ word }}</span>
              </span>
              <span
                v-else
                :ref="(el) => setTitleEl(el as Element | null, lineIndex * 2 + wordIndex)"
                :class="heroLaserClass(word, lineIndex * 2 + wordIndex)"
                :style="{ color: '#fff' }"
              >{{ word }}</span>
            </template>
          </span>
        </p>

        <div class="hero-mobile-details" :style="heroMobileDetailsStyle">
          <p class="hero-mobile-kicker">Your all-in-one fitness app.</p>

          <p class="hero-mobile-copyline hero-mobile-copyline--tablet">
            Tap NFC or scan QR at the machine. Core workout tracking is free forever. Premium intelligence is optional.
          </p>

          <div class="hero-mobile-actions">
            <GetAppBtn hero label="Get LIFTAG" />
            <a href="#scan" class="hero-mobile-secondary">See how it works</a>
          </div>
        </div>
      </div>

      <div
        class="hero-mobile-visual"
        :class="{ 'is-entered': entered }"
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
          <div class="hero-mobile-phone-stage">
            <Phone
              src="/assets/screens/hero-dashboard.webp"
              :scale="1"
              :tilt-delay-ms="0"
              lite
              :static-bezel="false"
              sizes="(max-width: 768px) min(46vw, 180px), 280px"
              priority
            />
          </div>
        </div>
      </div>

      <p
        ref="phoneCopyRoot"
        class="hero-mobile-copyline hero-mobile-copyline--phone"
        :class="{ 'is-entered': phoneCopyEntered }"
      >
        <span class="hero-mobile-copybeat" style="--beat: 0">
          <span class="hero-mobile-copybeat-scan" aria-hidden="true" />
          <span class="hero-mobile-copybeat-text">
            Tap <span class="hero-mobile-copykey">NFC</span> or scan <span class="hero-mobile-copykey">QR</span> at the machine.
          </span>
        </span>
        <span class="hero-mobile-copybeat" style="--beat: 1">
          <span class="hero-mobile-copybeat-scan" aria-hidden="true" />
          <span class="hero-mobile-copybeat-text">
            Core workout tracking is <span class="hero-mobile-copykey">free forever</span>.
          </span>
        </span>
        <span class="hero-mobile-copybeat" style="--beat: 2">
          <span class="hero-mobile-copybeat-scan" aria-hidden="true" />
          <span class="hero-mobile-copybeat-text">
            Premium intelligence is optional.
          </span>
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 769px) {
  .hero-mobile-wrap {
    display: none !important;
  }
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

.hero-mobile-layout {
  display: none;
}

.hero-mobile-title {
  display: grid;
  gap: 0;
  margin: 0;
  overflow: visible;
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
  overflow: visible;
  white-space: nowrap;
}

.hero-mobile-title .hero-laser-reveal,
.hero-mobile-lime-word {
  display: inline-block;
}

.hero-mobile-title .hero-laser-reveal {
  padding-right: 0.22em;
  margin-right: -0.22em;
}

.hero-mobile-lime-word {
  position: relative;
  overflow: visible;
}

.hero-mobile-kicker {
  display: none;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-family: var(--liftag-font-headline);
  font-size: clamp(16px, 4.4vw, 19px);
  font-style: italic;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero-mobile-copyline {
  max-width: 22rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.45;
}

.hero-mobile-copybeat,
.hero-mobile-copybeat-scan,
.hero-mobile-copybeat-text {
  display: contents;
}

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

.hero-mobile-phone-stage {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  perspective: 1100px;
  transform-origin: 50% 88%;
}

.hero-mobile-device :deep(.phone) {
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
  .hero-mobile-layout {
    display: grid;
    grid-template-rows: auto auto;
    gap: 36px;
    min-height: 0;
    padding-top: 8px;
  }

  .hero-mobile-title {
    line-height: 0.98;
  }

  .hero-mobile-copyline {
    margin-top: 28px;
  }

  .hero-mobile-copyline--phone {
    display: none;
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
    opacity: 0;
    will-change: transform, opacity;
  }

  .hero-mobile-device::before {
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }

  .hero-mobile-device::after {
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }

  .hero-mobile-visual.is-entered .hero-mobile-device::before {
    background-image: url('/assets/screens/hero-workout-360.webp');
    animation:
      heroPhoneLeftEnter 1080ms 70ms cubic-bezier(0.16, 1, 0.3, 1) both,
      heroRearLeftIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-mobile-visual.is-entered .hero-mobile-device::after {
    background-image: url('/assets/screens/hero-progress-360.webp');
    animation:
      heroPhoneRightEnter 1180ms 360ms cubic-bezier(0.22, 1, 0.32, 1) both,
      heroRearRightIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-mobile-rail {
    opacity: 0;
    transform: translate3d(-10px, 12px, 0);
  }

  .hero-mobile-visual.is-entered .hero-mobile-rail {
    opacity: 1;
    transform: none;
    transition:
      opacity 700ms 240ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 700ms 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes heroPhoneLeftEnter {
  from {
    opacity: 0;
    transform: translate3d(-128%, 22%, 0) perspective(900px) rotateY(42deg) rotateZ(-12deg) scale(0.68);
  }

  to {
    opacity: 0.62;
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }
}

@keyframes heroPhoneRightEnter {
  from {
    opacity: 0;
    transform: translate3d(24%, 16%, 0) perspective(900px) rotateY(-44deg) rotateZ(11deg) scale(0.66);
  }

  to {
    opacity: 0.56;
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }
}

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
  .hero-mobile-device::after,
  .hero-mobile-phone-stage,
  .hero-mobile-device-glow,
  .hero-mobile-rail {
    animation: none;
    transition: none;
    will-change: auto;
    opacity: 1;
    transform: none;
  }

  .hero-mobile-device::before {
    background-image: url('/assets/screens/hero-workout-360.webp');
    opacity: 0.62;
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }

  .hero-mobile-device::after {
    background-image: url('/assets/screens/hero-progress-360.webp');
    opacity: 0.56;
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }

  .hero-mobile-device-glow {
    opacity: 0.95;
  }
}

:global(html[data-liftag-nav-open="true"] .hero-mobile-device::before),
:global(html[data-liftag-nav-open="true"] .hero-mobile-device::after),
:global(html[data-liftag-nav-open="true"] .hero-mobile-phone-stage),
:global(html[data-liftag-nav-open="true"] .hero-mobile-device-glow) {
  animation-play-state: paused;
}

@media (max-width: 699px) {
  .hero-mobile-secondary {
    display: none;
  }

  .hero-mobile-kicker {
    display: block;
  }

  .hero-mobile-layout {
    grid-template-rows: auto auto auto;
    row-gap: 28px;
  }

  .hero-mobile-copyline--tablet {
    display: none;
  }

  .hero-mobile-copyline--phone {
    display: grid;
    justify-items: center;
    gap: 0.5em;
    justify-self: center;
    margin: 0;
    text-align: center;
  }

  .hero-mobile-copybeat {
    position: relative;
    display: block;
    width: fit-content;
    max-width: 100%;
  }

  .hero-mobile-copybeat-scan {
    position: absolute;
    top: -2px;
    right: auto;
    bottom: -2px;
    left: 0;
    display: block;
    width: 100%;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }

  .hero-mobile-copybeat-scan::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
    border-radius: 1px;
    background: #fff;
    box-shadow:
      0 0 5px #fff,
      0 0 14px var(--liftag-primary),
      0 0 32px var(--liftag-primary);
  }

  .hero-mobile-copybeat-text {
    display: inline-block;
    max-width: 100%;
    clip-path: inset(0 100% 0 -0.16em);
    transform: translate3d(0, 0.42em, 0);
  }

  .hero-mobile-copykey {
    font-weight: 500;
    color: inherit;
  }

  .hero-mobile-copyline--phone.is-entered .hero-mobile-copybeat-text {
    animation: heroPhoneCopyReveal 640ms calc(50ms + var(--beat) * 150ms) cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .hero-mobile-copyline--phone.is-entered .hero-mobile-copybeat-scan {
    animation: heroPhoneCopyScan 640ms calc(50ms + var(--beat) * 150ms) cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .hero-mobile-copyline--phone.is-entered .hero-mobile-copykey {
    animation: heroPhoneCopyKey 760ms calc(240ms + var(--beat) * 150ms) cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@media (max-width: 420px) {
  .hero-mobile-layout {
    grid-template-rows: auto auto auto;
    row-gap: 26px;
    min-height: 0;
    padding-top: 6px;
  }

  .hero-mobile-title {
    font-size: clamp(44px, 13vw, 54px);
  }

  .hero-mobile-copyline {
    max-width: 19rem;
    margin-top: 26px;
    font-size: 15px;
  }

  .hero-mobile-copyline--phone {
    margin-top: 0;
  }

  .hero-mobile-actions {
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  :global(html[data-liftag-short-viewport="true"] .hero-mobile-layout) {
    grid-template-rows: auto auto;
    gap: 26px;
    min-height: 0;
    padding-top: 8px;
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

@media (max-width: 699px) {
  :global(html[data-liftag-short-viewport="true"] .hero-mobile-layout) {
    grid-template-rows: auto auto auto;
    row-gap: 20px;
  }

  :global(html[data-liftag-short-viewport="true"] .hero-mobile-copyline--phone) {
    margin-top: 0;
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

@media (prefers-reduced-motion: reduce) {
  .hero-mobile-copybeat-text,
  .hero-mobile-copybeat-scan,
  .hero-mobile-copykey {
    animation: none !important;
  }

  .hero-mobile-copybeat-text {
    clip-path: none !important;
    transform: none !important;
  }

  .hero-mobile-copybeat-scan {
    display: none !important;
  }

  .hero-mobile-copykey {
    color: rgba(255, 255, 255, 0.9);
  }
}

@keyframes heroPhoneCopyReveal {
  from {
    clip-path: inset(0 100% 0 -0.16em);
    transform: translate3d(0, 0.42em, 0);
  }

  to {
    clip-path: inset(0 -0.22em 0 -0.16em);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes heroPhoneCopyScan {
  0% {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }

  14% {
    opacity: 1;
  }

  78% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes heroPhoneCopyKey {
  0%,
  42% {
    color: var(--liftag-primary);
  }

  100% {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
