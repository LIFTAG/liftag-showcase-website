<script setup lang="ts">
// The phone hero animates with CSS only. Its entrance and the laser title
// reveal start at first paint from server-rendered classes instead of after
// hydration: on a throttled phone hydration lands seconds after the first
// paint, and the headline sat blank (and LCP waited) until it did.
import { en, sk } from '~/i18n/messages/marketing'

const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const heroMobileTitle = computed(() => [[t('marketing.heroMobileTitle.0.0'), t('marketing.heroMobileTitle.0.1')], [t('marketing.heroMobileTitle.1.0'), t('marketing.heroMobileTitle.1.1')]])

const props = withDefaults(defineProps<{
  autoEnter?: boolean
  hideFrontPhone?: boolean
  playEnter?: boolean
}>(), {
  autoEnter: true,
  hideFrontPhone: false,
  playEnter: false,
})

// Server-rendered as entered when the hero owns the page, so the CSS entrance
// runs from first paint. A held hero (autoEnter false) waits for `enter()`.
const entered = ref(props.autoEnter || props.playEnter)
const frontPhoneEl = ref<HTMLElement | null>(null)

function enter() {
  entered.value = true
}

watch(() => props.playEnter, (v) => { if (v) enter() })

defineExpose({ enter, frontPhoneEl })

// Word order of the laser sweep. Odd words are the lime ones and sweep in
// from the right on a green beam; even words sweep from the left on red.
function laserUnitClass(index: number) {
  const accent = index % 2 === 1
  return {
    'hero-mobile-laser--green': accent,
    'hero-mobile-laser--red': !accent,
    'hero-mobile-laser--rtl': accent,
  }
}

const phoneCopyRoot = ref<HTMLElement | null>(null)
const phoneCopyInView = ref(false)
const phoneCopyEntered = computed(() => entered.value && phoneCopyInView.value)
let phoneCopyIo: IntersectionObserver | null = null

onMounted(() => {
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
  phoneCopyIo?.disconnect()
  phoneCopyIo = null
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
        <div
          class="hero-mobile-title"
          :class="{ 'is-revealing': entered }"
          aria-hidden="true"
        >
          <span
            v-for="(line, lineIndex) in heroMobileTitle"
            :key="lineIndex"
            class="hero-title-line"
          >
            <template v-for="(word, wordIndex) in line" :key="wordIndex">
              <span v-if="wordIndex > 0">{{ ' ' }}</span>
              <span
                class="hero-mobile-laser"
                :class="laserUnitClass(lineIndex * 2 + wordIndex)"
                :style="{ '--laser-i': lineIndex * 2 + wordIndex }"
              >
                <span
                  class="hero-mobile-laser-word"
                  :style="{ color: wordIndex === 1 ? '#CCFF00' : '#fff' }"
                >{{ word }}<span class="hero-mobile-laser-track" /></span>
                <!-- Halo for the lime words. Painted from blurred boxes, not
                     from a text-shadow: a 120px text-shadow inflated the
                     glyph rect past the hero phone and made this late-fading
                     bloom the page's LCP element. -->
                <span v-if="wordIndex === 1" class="hero-mobile-laser-glow" />
              </span>
            </template>
          </span>
        </div>

        <div class="hero-mobile-details" :class="{ 'is-entered': entered }">
          <p class="hero-mobile-kicker">{{ t('marketing.hero.kicker') }}</p>

          <p class="hero-mobile-copyline hero-mobile-copyline--tablet">
            {{ t('marketing.hero.machineHint') }} {{ t('marketing.hero.free') }}
          </p>

          <div class="hero-mobile-actions">
            <GetAppBtn hero />
            <a href="#scan" class="hero-mobile-secondary">{{ t('marketing.hero.how') }}</a>
          </div>
        </div>
      </div>

      <div
        class="hero-mobile-visual"
        :class="{ 'is-entered': entered }"
      >
        <div class="hero-mobile-rail">
          <div class="hero-mobile-proof" :aria-label="t('marketing.hero.flow')">
            <span>{{ t('marketing.hero.tapTag') }}</span>
            <span>{{ t('marketing.hero.scanQr') }}</span>
            <span>{{ t('marketing.hero.logSets') }}</span>
          </div>
        </div>

        <div
          ref="frontPhoneEl"
          class="hero-mobile-device"
          :class="{ 'is-slot-only': props.hideFrontPhone }"
        >
          <!-- Rear phones are <img>, not pseudo-element backgrounds: Chrome
               scored the two backgrounds as one ~130k px² LCP candidate on
               this element, larger than the preloaded front phone, so the
               page's LCP waited on these decorative screenshots. Lazy keeps
               them unfetched on desktop, where this layout is display:none. -->
          <img
            class="hero-mobile-rear hero-mobile-rear--left"
            src="/assets/screens/hero-workout-360.webp"
            width="360"
            height="781"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          >
          <img
            class="hero-mobile-rear hero-mobile-rear--right"
            src="/assets/screens/hero-progress-360.webp"
            width="360"
            height="781"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          >
          <div class="hero-mobile-device-glow" aria-hidden="true" />
          <div class="hero-mobile-phone-stage">
            <Phone
              v-if="!props.hideFrontPhone"
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
            {{ t('marketing.hero.machineHint') }}
          </span>
        </span>
        <span class="hero-mobile-copybeat" style="--beat: 1">
          <span class="hero-mobile-copybeat-scan" aria-hidden="true" />
          <span class="hero-mobile-copybeat-text">
            {{ t('marketing.hero.freeCore') }}
          </span>
        </span>
        <span class="hero-mobile-copybeat" style="--beat: 2">
          <span class="hero-mobile-copybeat-scan" aria-hidden="true" />
          <span class="hero-mobile-copybeat-text">
            {{ t('marketing.hero.optional') }}
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

/* ── Laser title reveal ──
   CSS port of useHeroLaser (desktop keeps the JS version, which also feeds
   the particle field). Per word: a charge beam grows on the start edge
   (140ms), the clip and a beam line sweep across (390ms, easeInOutQuad),
   a beam shrinks off the end edge (300ms), 55ms gap, next word. */
.hero-mobile-laser {
  --laser-t0: calc(300ms + var(--laser-i) * 585ms);
  --laser-rgb: 255, 45, 85;
  --laser-glow: var(--liftag-red-neon-glow);
  /* Beam x as an offset into the unit: start edge, then end edge. */
  --laser-from: 0px;
  --laser-to: calc(100% + 0.22em);

  position: relative;
  display: inline-block;
  overflow: visible;
}

.hero-mobile-laser--green {
  --laser-rgb: 204, 255, 0;
  --laser-glow: var(--liftag-primary-glow);
}

.hero-mobile-laser--rtl {
  --laser-from: calc(100% + 0.4em);
  --laser-to: 0px;
}

.hero-mobile-laser-word {
  position: relative;
  z-index: 2;
  display: inline-block;
  padding-right: 0.22em;
  margin-right: -0.22em;
  clip-path: inset(-20% 100% -20% 0);
  /* Inherited from the old .hero-laser-reveal: layout containment drops the
     inline-block's text baseline, so it sits on its bottom edge. The title's
     line spacing was designed around that. */
  contain: layout;
}

.hero-mobile-laser--rtl .hero-mobile-laser-word {
  clip-path: inset(-20% 0 -20% 100%);
}

/* Charge and discharge beams. They sit outside the clip, like the fixed
   charge beam of the JS version. */
.hero-mobile-laser::before,
.hero-mobile-laser::after {
  position: absolute;
  top: -20%;
  z-index: 3;
  width: 2px;
  height: 140%;
  content: '';
  pointer-events: none;
  background: #fff;
  box-shadow:
    0 0 6px #fff,
    0 0 20px rgb(var(--laser-rgb)),
    0 0 50px rgb(var(--laser-rgb)),
    0 0 100px var(--laser-glow);
  opacity: 0;
  transform: translateX(-50%);
  transform-origin: top center;
}

.hero-mobile-laser::before {
  left: var(--laser-from);
}

.hero-mobile-laser::after {
  left: var(--laser-to);
}

/* The sweeping line rides a box as wide as the travel and is drawn on its
   right edge, so the sweep is a compositor transform of that box. Being a
   child of the word, it is clipped with it, as the JS ::after line was. */
.hero-mobile-laser-track {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 100%;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-100%);
}

.hero-mobile-laser--rtl .hero-mobile-laser-track {
  width: calc(100% + 0.18em);
  transform: none;
}

.hero-mobile-laser-track::before,
.hero-mobile-laser-track::after {
  position: absolute;
  content: '';
}

.hero-mobile-laser-track::after {
  top: 0;
  right: -1px;
  bottom: 0;
  width: 2px;
  border-radius: 1px;
  background: #fff;
  box-shadow:
    0 0 6px #fff,
    0 0 20px rgb(var(--laser-rgb)),
    0 0 50px rgb(var(--laser-rgb)),
    0 0 100px rgb(var(--laser-rgb)),
    0 0 150px var(--laser-glow),
    -8px 0 30px var(--laser-glow),
    8px 0 30px var(--laser-glow);
}

.hero-mobile-laser-track::before {
  top: -28.6%;
  right: -40px;
  bottom: -28.6%;
  width: 80px;
  background: radial-gradient(
    ellipse 50% 45% at center,
    rgba(var(--laser-rgb), 0.35) 0%,
    rgba(var(--laser-rgb), 0.08) 50%,
    transparent 70%
  );
}

.hero-mobile-laser-glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
}

.hero-mobile-laser-glow::before,
.hero-mobile-laser-glow::after {
  position: absolute;
  inset: 18% 4% 12% 6%;
  border-radius: 0.2em;
  content: '';
  background: var(--liftag-primary);
}

.hero-mobile-laser-glow::before {
  opacity: 0.22;
  filter: blur(30px);
}

.hero-mobile-laser-glow::after {
  opacity: 0.1;
  filter: blur(60px);
}

.hero-mobile-title.is-revealing .hero-mobile-laser::before {
  animation: heroMobileLaserCharge 200ms var(--laser-t0) cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-mobile-title.is-revealing .hero-mobile-laser::after {
  animation: heroMobileLaserDischarge 300ms calc(var(--laser-t0) + 530ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-mobile-title.is-revealing .hero-mobile-laser-word {
  /* forwards, not both: the hidden base state must hold through the delay. */
  animation: heroMobileLaserClipLtr 390ms calc(var(--laser-t0) + 140ms) cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
}

.hero-mobile-title.is-revealing .hero-mobile-laser--rtl .hero-mobile-laser-word {
  animation-name: heroMobileLaserClipRtl;
}

.hero-mobile-title.is-revealing .hero-mobile-laser-track {
  animation: heroMobileLaserSweepLtr 390ms calc(var(--laser-t0) + 140ms) cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
}

.hero-mobile-title.is-revealing .hero-mobile-laser--rtl .hero-mobile-laser-track {
  animation-name: heroMobileLaserSweepRtl;
}

.hero-mobile-title.is-revealing .hero-mobile-laser-glow {
  animation: heroMobileLaserGlow 700ms calc(var(--laser-t0) + 610ms) cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroMobileLaserCharge {
  0% { opacity: 0; transform: translateX(-50%) scaleY(0); }
  70% { opacity: 1; transform: translateX(-50%) scaleY(0.9); }
  100% { opacity: 0; transform: translateX(-50%) scaleY(1); }
}

@keyframes heroMobileLaserDischarge {
  0% { opacity: 1; transform: translateX(-50%) scaleY(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(100%) scaleY(0); }
}

/* The last step drops the clip so italic overhang is never trimmed. The
   right inset trails the line by the italic hang, as in the JS version. */
@keyframes heroMobileLaserClipLtr {
  0% { clip-path: inset(-20% calc(100% - 0.18em) -20% 0); }
  99.9% { clip-path: inset(-20% -0.18em -20% 0); }
  100% { clip-path: none; }
}

@keyframes heroMobileLaserClipRtl {
  0% { clip-path: inset(-20% -0.18em -20% 100%); }
  99.9% { clip-path: inset(-20% -0.18em -20% 0); }
  100% { clip-path: none; }
}

@keyframes heroMobileLaserSweepLtr {
  0% { opacity: 1; transform: translateX(-100%); }
  99.9% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(0); }
}

@keyframes heroMobileLaserSweepRtl {
  0% { opacity: 1; transform: translateX(0); }
  99.9% { opacity: 1; transform: translateX(-100%); }
  100% { opacity: 0; transform: translateX(-100%); }
}

@keyframes heroMobileLaserGlow {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-mobile-laser-word,
  .hero-mobile-laser--rtl .hero-mobile-laser-word {
    clip-path: none;
    animation: none !important;
  }

  .hero-mobile-laser::before,
  .hero-mobile-laser::after,
  .hero-mobile-laser-track {
    display: none;
  }

  .hero-mobile-laser-glow {
    opacity: 1;
    animation: none !important;
  }
}

.hero-mobile-details {
  opacity: 0;
  pointer-events: none;
  transform: translateY(14px);
}

.hero-mobile-details.is-entered {
  pointer-events: auto;
  animation: heroMobileDetailsIn 700ms 120ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroMobileDetailsIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-mobile-details.is-entered {
    opacity: 1;
    transform: none;
    animation: none;
  }
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

.hero-mobile-device.is-slot-only .hero-mobile-phone-stage,
.hero-mobile-device.is-slot-only .hero-mobile-device-glow {
  opacity: 0;
  pointer-events: none;
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

  .hero-mobile-rear {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-width: none;
    border: 1px solid oklch(0.28 0.008 120 / 0.96);
    border-radius: 15.5% / 7.2%;
    pointer-events: none;
    object-fit: contain;
    backface-visibility: hidden;
    filter: drop-shadow(0 22px 34px rgba(0, 0, 0, 0.58));
    opacity: 0;
    will-change: transform, opacity;
  }

  .hero-mobile-rear--left {
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }

  .hero-mobile-rear--right {
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }

  .hero-mobile-visual.is-entered .hero-mobile-rear--left {
    animation:
      heroPhoneLeftEnter 1080ms 70ms cubic-bezier(0.16, 1, 0.3, 1) both,
      heroRearLeftIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-mobile-visual.is-entered .hero-mobile-rear--right {
    animation:
      heroPhoneRightEnter 1180ms 360ms cubic-bezier(0.22, 1, 0.32, 1) both,
      heroRearRightIdle var(--hero-phone-cycle) var(--hero-phone-motion-delay) linear infinite;
  }

  .hero-mobile-rail {
    opacity: 0;
    transform: translate3d(-10px, 12px, 0);
  }

  .hero-mobile-visual.is-entered .hero-mobile-rail {
    animation: heroMobileRailIn 700ms 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@keyframes heroMobileRailIn {
  from { opacity: 0; transform: translate3d(-10px, 12px, 0); }
  to { opacity: 1; transform: none; }
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
  .hero-mobile-rear,
  .hero-mobile-phone-stage,
  .hero-mobile-device-glow,
  .hero-mobile-rail {
    animation: none;
    transition: none;
    will-change: auto;
    opacity: 1;
    transform: none;
  }

  .hero-mobile-rear--left {
    opacity: 0.62;
    transform: translate3d(-100%, 8%, 0) perspective(900px) rotateY(19deg) rotateZ(-6deg) scale(0.84);
  }

  .hero-mobile-rear--right {
    opacity: 0.56;
    transform: translate3d(0, 5%, 0) perspective(900px) rotateY(-19deg) rotateZ(6deg) scale(0.84);
  }

  .hero-mobile-device-glow {
    opacity: 0.95;
  }
}

:global(html[data-liftag-nav-open="true"] .hero-mobile-rear),
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

/* The longer Slovak title must fit both phone and split tablet columns. */
@media (max-width: 699px) {
  :global(html[lang="sk"] .hero-mobile-title) {
    font-size: clamp(32px, 11vw, 54px);
  }
}

@media (min-width: 700px) and (max-width: 768px) {
  :global(html[lang="sk"] .hero-mobile-title) {
    font-size: clamp(30px, 4.7vw, 36px);
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
