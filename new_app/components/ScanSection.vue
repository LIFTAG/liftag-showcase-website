<script setup lang="ts">
import type { ScreenVideoSource } from '../utils/screenVideo'

const step = ref(0)
const phoneSwipeDirection = ref<'left' | 'right'>('left')
const screenReplayKey = ref(0)
const videoCycleKey = ref(0)
const hoveredStep = ref<number | null>(null)
const exitingStep = ref<number | null>(null)
const scanCycleMs = 3200
const inView = ref(false)
const documentVisible = ref(true)
const reduceMotion = ref(false)
const phoneLayout = ref(false)
const sectionRef = ref<HTMLElement | null>(null)
let cycleTimer: ReturnType<typeof setTimeout> | null = null
let exitTimer: ReturnType<typeof setTimeout> | null = null
let scanObserver: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
let phoneLayoutMql: MediaQueryList | null = null
let segmentStartedAt = 0
// Hovering parks the cycle without rewinding the footage: the slice plays on to
// its frozen tail and waits there, so releasing the row resumes what is left of
// this step rather than starting it over. Every other pause - scrolled away,
// hidden tab - stops the footage mid-slice instead, and those resume by
// replaying the slice so picture and timer start together again.
let parkedByHover = false

function syncCycleInterval() {
  const borderDrivesCycle = phoneLayout.value && !reduceMotion.value

  if (!inView.value || !documentVisible.value || hoveredStep.value !== null || borderDrivesCycle) {
    parkedByHover = hoveredStep.value !== null
    clearCycleTimer()
    return
  }

  if (parkedByHover) {
    parkedByHover = false
    // A hover held past the end of the slice leaves no time on the clock, so
    // letting go moves straight on to the next step.
    scheduleNextStep(scanCycleMs - (performance.now() - segmentStartedAt))
    return
  }

  restartSegment()
}

function onDocumentVisibilityChange() {
  documentVisible.value = !document.hidden
  syncCycleInterval()
}

const rawMouse = useSharedMouse().latest
// Gated on the section being near the viewport so mousemoves elsewhere on the
// page do not wake this loop.
const lerpActive = useNearViewport(sectionRef)
// Publishes --scan-mx / --scan-my (normalized -1..1) on the section instead of a
// ref, so the transforms below are constant strings that CSS re-evaluates on the
// compositor. Moving the cursor never re-renders this component.
useLerpVars(sectionRef, rawMouse, 'scan', 0.06, () => lerpActive.value)

const steps = [
  {
    tag: 'STEP 01',
    title: 'Tap/scan.',
    body: 'Open Liftag. Tap the NFC tag or aim at the QR sticker on the machine. The exact exercise, variations, and a setup video load instantly. No menus, no searching.',
    brief: 'Tap NFC or scan QR. LIFTAG opens the exact exercise and setup video.',
    screen: '/assets/screens/qr-scan.webp',
    extra: null as null | { label: string; note: string; brief: string },
  },
  {
    tag: 'STEP 02',
    title: 'Log.',
    body: 'Tap weight × reps. Timer auto-runs between sets. RPE optional. Every set is timestamped and saved to your history.',
    brief: 'Tap weight and reps. Rest timer runs, then the set lands in history.',
    screen: '/assets/screens/log-set.webp',
    extra: {
      label: 'OPTIONAL',
      note: "Watch the gym's own instruction video. Filmed by their trainers, on their machines.",
      brief: "Gym's own trainer video is one tap away.",
    },
  },
]

// AV1 first, H.264 as the universal fallback - same cut, and the AV1 encode is
// roughly 40% of the bytes.
const SCAN_VIDEO_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/scan-flow.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/scan-flow.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

// One continuous capture of a real scan, cut so each step owns one `scanCycleMs`
// slice: the viewfinder sweep and lock-on, then the exercise opening and the
// log-set screen settling. The second slice holds on its final frame for the
// last ~0.4s, so a step that stops cycling - hovered, or paused off screen -
// rests on a still rather than on whatever frame it happened to reach.
const SCAN_VIDEO_SEGMENTS = [
  { start: 0, end: 3.2 },
  { start: 3.2, end: 6.4 },
]

// videoCycleKey re-arms the current slice from its start. It advances whenever
// the step timer is re-armed - coming back on screen, or a hover being
// released - so the footage restarts alongside the timer instead of resuming
// mid-slice against a step that starts counting from zero.
const scanVideoSegment = computed(() => ({
  ...(SCAN_VIDEO_SEGMENTS[step.value] ?? SCAN_VIDEO_SEGMENTS[0]),
  key: videoCycleKey.value,
}))

function screenSrcset(src: string) {
  if (!src.startsWith('/assets/screens/') || !src.endsWith('.webp')) return undefined

  const base = src.slice(0, -'.webp'.length)
  return `${base}-360.webp 360w, ${base}-560.webp 560w, ${base}-640.webp 640w, ${src} 800w`
}

function setStep(nextStep: number) {
  if (nextStep === step.value) return
  exitingStep.value = step.value
  if (exitTimer) clearTimeout(exitTimer)
  exitTimer = setTimeout(() => {
    exitingStep.value = null
    exitTimer = null
  }, 320)
  phoneSwipeDirection.value = nextStep > step.value ? 'left' : 'right'
  step.value = nextStep
  // A new step means a new slice of footage, so the clock this step is measured
  // against starts here too.
  segmentStartedAt = performance.now()
}

function selectStep(nextStep: number) {
  // The first pane starts selected, so tapping it does not change `src` and the
  // phone has nothing to transition. On the phone layout, advance a separate
  // key to replay the same screen swipe without altering the selected step.
  if (nextStep === step.value && phoneLayout.value && !reduceMotion.value) {
    screenReplayKey.value += 1
    videoCycleKey.value += 1
    segmentStartedAt = performance.now()
    return
  }

  setStep(nextStep)
  syncCycleInterval()
}

function setHoveredStep(nextStep: number) {
  if (phoneLayout.value) return
  hoveredStep.value = nextStep
  setStep(nextStep)
  syncCycleInterval()
}

function clearHoveredStep(stepIndex: number) {
  if (phoneLayout.value) return
  if (hoveredStep.value !== stepIndex) return
  hoveredStep.value = null
  syncCycleInterval()
}

function onStepBorderAnimationEnd(stepIndex: number, event: AnimationEvent) {
  if (!phoneLayout.value || reduceMotion.value) return
  if (event.pseudoElement !== '::before' || !event.animationName.includes('scanMobilePaneBorderLoad')) return
  if (step.value !== stepIndex || !inView.value || !documentVisible.value || hoveredStep.value !== null) return
  setStep((step.value + 1) % steps.length)
}

const SCAN_PHONE_MOTION = 'translate3d(calc(var(--scan-mx) * 18px), calc(var(--scan-my) * 12px), 0)'
  + ' rotateX(calc(var(--scan-my) * 2.4deg)) rotateY(calc(var(--scan-mx) * -3.2deg))'

// Only the two motion flags can change these, so the bindings recompute on a
// media-query change and never on pointer movement.
const scanPhoneMotionTransform = computed(() => (
  reduceMotion.value || phoneLayout.value ? 'translate3d(0, 0, 0)' : SCAN_PHONE_MOTION
))

function onMotionChange(e: MediaQueryListEvent) {
  reduceMotion.value = e.matches
  syncCycleInterval()
}

function onPhoneLayoutChange(e: MediaQueryListEvent) {
  phoneLayout.value = e.matches
  syncCycleInterval()
}

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)

  phoneLayoutMql = window.matchMedia('(max-width: 768px)')
  phoneLayout.value = phoneLayoutMql.matches
  phoneLayoutMql.addEventListener('change', onPhoneLayoutChange)

  documentVisible.value = !document.hidden
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  if (!sectionRef.value) return

  scanObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { inView.value = e.isIntersecting })
    },
    { threshold: 0.3 },
  )
  scanObserver.observe(sectionRef.value)
})

function clearCycleTimer() {
  if (cycleTimer === null) return
  clearTimeout(cycleTimer)
  cycleTimer = null
}

// A self-scheduling timeout rather than an interval, so a step can be handed a
// part-cycle when it resumes from a hover with time already spent.
function scheduleNextStep(delay: number) {
  clearCycleTimer()
  cycleTimer = setTimeout(() => {
    cycleTimer = null
    setStep((step.value + 1) % steps.length)
    scheduleNextStep(scanCycleMs)
  }, Math.max(0, delay))
}

function restartSegment() {
  videoCycleKey.value += 1
  segmentStartedAt = performance.now()
  scheduleNextStep(scanCycleMs)
}

watch(inView, () => syncCycleInterval())

onBeforeUnmount(() => {
  clearCycleTimer()
  if (exitTimer) clearTimeout(exitTimer)
  scanObserver?.disconnect()
  scanObserver = null
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  phoneLayoutMql?.removeEventListener('change', onPhoneLayoutChange)
  phoneLayoutMql = null
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
})
</script>

<template>
  <section
    id="scan"
    ref="sectionRef"
    class="scan-section"
    :class="{ 'is-live': inView, 'is-hover-locked': hoveredStep !== null }"
    :style="{
      background: '#000',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Lime atmosphere glow -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 50% 40% at 30% 50%, rgba(204,255,0,0.06), transparent 70%)',
      }"
    />

    <div class="container scan-wrap" :style="{ position: 'relative', zIndex: 2 }">
      <div class="scan-intro">
        <Eyebrow>▸ MACHINE SYNC</Eyebrow>
        <SectionTitle>
          Every machine has<br />a manual. <span class="lime">Now it's in your pocket.</span>
        </SectionTitle>

        <p
          class="reveal scan-lede"
          :style="{
            fontSize: '18px',
            fontWeight: 300,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '560px',
            marginTop: '28px',
          }"
        >
          No more guessing how a cable stack works. Tap the NFC tag or scan the QR code on any partner gym machine.
          Liftag opens the right exercise, demo video, and tracking flow in seconds.
        </p>
      </div>

      <figure
        class="scan-token-stage"
        aria-label="LIFTAG NFC tap token. Move to tilt the glass coin."
      >
        <TapTokenCore />
        <figcaption class="scan-token-caption">
          <span class="scan-token-caption-name protocol">NFC machine tag</span>
          <span class="scan-token-caption-note protocol">Optional add-on</span>
          <span class="scan-token-caption-note protocol">(below the QR code sticker)</span>
        </figcaption>
      </figure>

      <div
        class="section-2col scan-grid-2col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '80px',
          marginTop: '100px',
          alignItems: 'center',
        }"
      >
        <!-- LEFT: floating phone -->
        <div class="scan-phone-area" :style="{ position: 'relative', height: '680px' }">
          <div
            class="scan-phone-wrap"
            :style="{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }"
          >
            <div
              class="scan-phone-motion"
              :style="{ transform: scanPhoneMotionTransform }"
            >
              <div class="scan-phone-float">
                <div class="scan-phone-camera">
                  <Phone
                    :src="steps[step].screen"
                    :video-sources="SCAN_VIDEO_SOURCES"
                    :video-segment="scanVideoSegment"
                    :scale="1.05"
                    sizes="(max-width: 768px) 36vw, 280px"
                    screen-transition
                    :screen-transition-direction="phoneSwipeDirection"
                    :screen-transition-key="screenReplayKey"
                  />
                  <div v-if="step === 0" class="scan-phone-laser-overlay" aria-hidden="true">
                    <span class="scan-phone-laser-rail">
                      <span class="scan-phone-laser-line" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: 2-step list -->
        <div class="scan-steps-panel">
          <div class="scan-steps-stack" :style="{ display: 'flex', flexDirection: 'column', gap: 0 }">
            <div
              v-for="(s, i) in steps"
              :key="i"
              class="scan-step-row"
              :class="{ 'is-active': step === i, 'is-exiting': exitingStep === i, 'has-row-below': i < steps.length - 1 }"
              :style="{
                '--cycle-ms': `${scanCycleMs}ms`,
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: '24px',
                padding: '32px 0 32px 20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                opacity: step === i ? 1 : 0.4,
                transform: step === i
                  ? 'translate3d(0,0,0)'
                  : i < step
                    ? 'translate3d(0,-28px,0)'
                    : 'translate3d(0,28px,0)',
                transition: 'opacity 520ms ease, transform 680ms cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
              }"
              @click="selectStep(i)"
              @animationend="onStepBorderAnimationEnd(i, $event)"
              @mouseenter="setHoveredStep(i)"
              @mouseleave="clearHoveredStep(i)"
            >
              <!-- Left col: tag + indicator line -->
              <div>
                <div
                  :style="{
                    fontFamily: '\'JetBrains Mono\', monospace',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.25em',
                    color: step === i ? '#CCFF00' : 'rgba(255,255,255,0.5)',
                    transition: 'color 400ms ease',
                  }"
                >
                  {{ s.tag }}
                </div>
                <div
                  class="scan-step-indicator"
                  :style="{
                    width: step === i ? '50px' : '16px',
                    height: '1px',
                    background: step === i ? '#CCFF00' : 'rgba(255,255,255,0.2)',
                    marginTop: '10px',
                    boxShadow: step === i ? '0 0 8px #CCFF00' : 'none',
                    transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
                  }"
                />
              </div>

              <!-- Right col: title + body + optional extra -->
              <div class="scan-step-copy">
                <h3
                  class="scan-step-title"
                  :style="{
                    margin: 0,
                    fontFamily: '\'Space Grotesk\', sans-serif',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    fontSize: 'clamp(44px, 5vw, 72px)',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    textTransform: 'uppercase',
                    color: '#fff',
                  }"
                >
                  {{ s.title }}
                </h3>

                <!-- Mobile-only inline screen preview for this step -->
                <div
                  class="scan-step-screen"
                  :style="{
                    marginTop: '20px',
                    width: '100%',
                    maxWidth: '240px',
                    aspectRatio: '393 / 852',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    border: '2px solid #2a2a2a',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(204,255,0,0.12)',
                    background: '#000',
                    position: 'relative',
                  }"
                >
                  <img
                    :src="s.screen"
                    :srcset="screenSrcset(s.screen)"
                    sizes="240px"
                    :alt="s.title"
                    loading="lazy"
                    decoding="async"
                    :style="{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }"
                  />

                  <!-- Scan overlay - only on step 0 -->
                  <div
                    v-if="i === 0"
                    :style="{
                      position: 'absolute',
                      top: '35.5%',
                      left: '20%',
                      right: '20%',
                      aspectRatio: '1',
                      pointerEvents: 'none',
                    }"
                  >
                    <div :style="{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, #CCFF00, transparent)', boxShadow:'0 0 16px #CCFF00', animation:'scanline 2s ease-in-out infinite' }" />
                  </div>
                </div>

                <p
                  class="scan-step-body"
                  :style="{
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 300,
                    fontSize: '16px',
                    lineHeight: 1.55,
                    marginTop: '14px',
                    maxWidth: '440px',
                  }"
                >
                  <span class="scan-step-body-full">{{ s.body }}</span>
                  <span class="scan-step-body-brief">{{ s.brief }}</span>
                </p>
                <div
                  v-if="s.extra"
                  class="scan-step-extra"
                  :style="{
                    marginTop: '16px',
                    display: 'inline-flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(204,255,0,0.05)',
                    border: '1px solid rgba(204,255,0,0.2)',
                    borderRadius: '12px',
                  }"
                >
                  <span
                    class="protocol"
                    :style="{
                      color: '#CCFF00',
                      fontSize: '9px',
                      marginTop: '2px',
                      flexShrink: 0,
                    }"
                  >
                    {{ s.extra.label }}
                  </span>
                  <span
                    class="scan-step-extra-note"
                    :style="{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }"
                  >
                    <span class="scan-step-extra-full">{{ s.extra.note }}</span>
                    <span class="scan-step-extra-brief">{{ s.extra.brief }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Bottom border line -->
            <div :style="{ borderTop: '1px solid rgba(255,255,255,0.08)' }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@property --scan-border-progress {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* Lerped pointer, normalized to -1..1 and unitless. useLerpVars overwrites these
   on the section each frame; the defaults keep SSR and first paint correct
   before the first pointer event. */
.scan-section {
  --scan-mx: 0;
  --scan-my: 0;
}

.scan-step-row {
  position: relative;
  overflow: visible;
  border-left: 2px solid transparent;
  will-change: transform, opacity;
}

.scan-step-indicator {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
}

.scan-step-indicator::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #ccff00;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
}

.scan-step-body-brief,
.scan-step-extra-brief {
  display: none;
}

.scan-step-row::before {
  content: '';
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: 6px;
  width: 2px;
  border-radius: 999px;
  pointer-events: none;
  background: rgba(204, 255, 0, 0.2);
  opacity: 0;
  transform: translateZ(0);
  clip-path: inset(0 0 55% 0);
  transition: opacity 260ms ease, clip-path 260ms ease, background 260ms ease;
}

/* Rows below the active one are translated down 28px while inactive,
   creating a visual gap below the bar. Extend the bar past the row's
   bottom so it kisses the visually-shifted next row's top border.
   (-29px = 28px shift + 1px original overshoot.) */
.scan-step-row.has-row-below::before {
  bottom: -29px;
}

/* The inactive row is translated 28px clear of the active one, so between the
   two boxes sits a band that belongs to neither and swallows the pointer on the
   way across. Extend the upper row's target down by exactly that offset - the
   two rows then meet whichever of them is currently the translated one. */
@media (min-width: 769px) and (prefers-reduced-motion: no-preference) {
  .scan-step-row.has-row-below::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    height: 28px;
  }
}

.scan-step-row.is-active::before {
  opacity: 1;
  background: linear-gradient(180deg, #f0ff8a 0%, #ccff00 72%, rgba(204, 255, 0, 0.4) 100%);
  box-shadow:
    0 0 10px rgba(204, 255, 0, 0.62),
    0 0 22px rgba(204, 255, 0, 0.24);
  clip-path: inset(0 0 100% 0);
  animation: scanStepLineLoad calc(var(--cycle-ms, 3200ms) - 160ms) linear forwards;
}

.scan-step-row.is-exiting::before {
  opacity: 1;
  background: linear-gradient(180deg, #f0ff8a 0%, #ccff00 72%, rgba(204, 255, 0, 0.28) 100%);
  box-shadow:
    0 0 8px rgba(204, 255, 0, 0.44),
    0 0 18px rgba(204, 255, 0, 0.18);
  transform: translateZ(0);
  clip-path: inset(0 0 0 0);
  animation: scanStepLineExit 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.scan-section:not(.is-live) .scan-step-row.is-active::before {
  animation-play-state: paused;
}

.scan-section.is-hover-locked .scan-step-row.is-active::before {
  animation: none;
  opacity: 0.46;
  clip-path: inset(0 0 0 0);
  box-shadow:
    0 0 8px rgba(204, 255, 0, 0.32),
    0 0 16px rgba(204, 255, 0, 0.14);
}

.scan-phone-float {
  animation: float-y 5s ease-in-out infinite;
  transform-origin: center;
}

.scan-phone-wrap {
  perspective: 900px;
}

.scan-phone-motion {
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform;
}

.scan-wrap {
  --scan-grid-top: 100px;
  --scan-phone-h: 680px;
  --scan-token: 280px;
  --scan-token-lift: 36px;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
}

.scan-intro {
  grid-column: 1 / -1;
}

.scan-grid-2col {
  grid-column: 1 / -1;
  grid-row: 2;
}

.scan-phone-area {
  overflow: visible;
}

.scan-token-stage {
  position: relative;
  z-index: 4;
  grid-column: 1;
  grid-row: 2;
  align-self: start;
  justify-self: start;
  width: var(--scan-token);
  min-height: var(--scan-token);
  margin: calc(var(--scan-grid-top) + var(--scan-phone-h) - var(--scan-token) - var(--scan-token-lift)) 0 0;
  aspect-ratio: 1;
  filter: drop-shadow(0 28px 40px rgba(0, 0, 0, 0.72)) drop-shadow(0 0 36px rgba(204, 255, 0, 0.16));
}

.scan-token-caption {
  position: absolute;
  left: 50%;
  bottom: -40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: max-content;
  pointer-events: none;
  transform: translateX(-50%);
}

.scan-token-caption-name {
  color: #ccff00;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 14px rgba(204, 255, 0, 0.32);
}

.scan-token-caption-note {
  color: rgba(255, 255, 255, 0.32);
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.scan-phone-camera {
  position: relative;
  width: 280px;
  aspect-ratio: 393 / 852;
  transform-origin: center;
  will-change: transform;
}

/* Registered on the scan frame the footage draws for itself, so the sweep runs
   inside those corner brackets instead of alongside them. The insets are
   measured off the rendered 3D phone rather than derived from the screenshot's
   flat geometry - the screen mesh sits inside the bezel and carries a resting
   tilt, so the footage does not land where a plain 393x852 box would put it.
   There is deliberately no frame of our own here: the recording has one. */
.scan-phone-laser-overlay {
  position: absolute;
  top: 36.9%;
  left: 18.1%;
  right: 18.7%;
  aspect-ratio: 1;
  overflow: hidden;
  pointer-events: none;
  z-index: 14;
  border-radius: 18px;
  mix-blend-mode: screen;
}

/* The sweep translates a full-height rail (translateY% of the rail equals the
   old container-relative top%), so the motion stays on the compositor instead
   of re-laying out `top` every frame. Opacity/scaleX pulse stays on the line,
   sharing the rail's duration and easing so the combined motion is unchanged. */
.scan-phone-laser-rail {
  position: absolute;
  inset: 0;
  transform: translateY(8%);
  pointer-events: none;
  animation: scan-phone-laser-sweep 1.85s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

.scan-phone-laser-line {
  position: absolute;
  top: 0;
  left: 7%;
  right: 7%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.9),
    #ccff00,
    rgba(255, 255, 255, 0.9),
    transparent
  );
  box-shadow:
    0 0 10px rgba(204, 255, 0, 0.95),
    0 0 26px rgba(204, 255, 0, 0.58);
  animation: scan-phone-laser-line-pulse 1.85s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

.scan-phone-laser-line::after {
  content: '';
  position: absolute;
  top: -22px;
  left: 0;
  right: 0;
  height: 46px;
  background: linear-gradient(180deg, rgba(204, 255, 0, 0.16), transparent);
  filter: blur(7px);
}

@keyframes scan-phone-laser-sweep {
  0%,
  100% {
    transform: translateY(8%);
  }

  50% {
    transform: translateY(88%);
  }
}

@keyframes scan-phone-laser-line-pulse {
  0%,
  100% {
    opacity: 0.32;
    transform: scaleX(0.78);
  }

  13%,
  87% {
    opacity: 1;
  }

  50% {
    opacity: 0.95;
    transform: scaleX(1);
  }
}

@keyframes scanStepLineLoad {
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes scanStepLineExit {
  0% {
    opacity: 1;
    transform: translateZ(0);
    clip-path: inset(0 0 0 0);
  }

  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateZ(0);
    clip-path: inset(100% 0 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scan-step-row {
    transition: none !important;
    transform: none !important;
  }

  .scan-phone-float,
  .scan-phone-motion,
  .scan-phone-laser-rail,
  .scan-phone-laser-line {
    animation: none;
  }

  .scan-step-row.is-active::before {
    animation: none;
    clip-path: inset(0 0 0 0);
  }

  .scan-step-row.is-exiting::before {
    animation: none;
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .scan-section {
    padding: 76px 0 104px !important;
  }

  .scan-section :deep(.display) {
    max-width: 20rem !important;
    font-size: clamp(30px, 8.8vw, 36px) !important;
    line-height: 0.98 !important;
  }

  .scan-section :deep(.eyebrow) {
    margin-bottom: 18px !important;
  }

  .scan-lede {
    display: none !important;
  }

  .scan-wrap {
    grid-template-columns: minmax(126px, 37vw) minmax(0, 1fr);
    column-gap: clamp(14px, 4vw, 22px);
  }

  .scan-intro {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .scan-token-stage {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
    align-self: center;
    width: min(78vw, 320px);
    min-height: min(78vw, 320px);
    margin: 28px auto 48px;
    filter: drop-shadow(0 22px 32px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 28px rgba(204, 255, 0, 0.14));
  }

  .scan-token-caption {
    bottom: -38px;
  }

  .scan-grid-2col {
    grid-column: 1 / -1;
    grid-row: 3;
    display: grid !important;
    grid-template-columns: minmax(126px, 37vw) minmax(0, 1fr) !important;
    gap: clamp(14px, 4vw, 22px) !important;
    margin-top: 12px !important;
    align-items: start !important;
  }

  /* Reserved box + explicit display: the NFC token PR dropped both, and the
     phone column collapsed next to STEP 01 / STEP 02. */
  .scan-phone-area {
    display: block !important;
    height: 332px !important;
    min-height: 332px !important;
  }

  .scan-phone-wrap {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    width: fit-content;
    margin: 8px auto 0;
    transform: none !important;
  }

  .scan-phone-float {
    animation-duration: 6.5s;
  }

  .scan-phone-camera {
    width: min(36vw, 142px) !important;
  }

  .scan-phone-camera :deep(.phone) {
    width: 100% !important;
    border-radius: 24px !important;
    border-width: 2px !important;
  }

  /* The phone layout draws the footage flat at the device's own aspect, so here
     the insets are the frame's position in the recording plus the 2px bezel. */
  .scan-phone-laser-overlay {
    top: 35.2%;
    left: 18.4%;
    right: 18.4%;
    border-radius: 10px;
  }

  .scan-steps-panel {
    min-width: 0;
  }

  .scan-steps-stack {
    gap: 10px !important;
  }

  .scan-step-row {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
    min-width: 0;
    padding: 12px 12px 13px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 14px;
    background: rgba(8, 10, 6, 0.58);
    opacity: 1 !important;
    overflow: hidden;
    isolation: isolate;
    contain: paint;
    transform: none !important;
    transition:
      border-color 260ms ease,
      background 260ms ease,
      box-shadow 260ms ease !important;
  }

  .scan-step-row.is-active {
    border-color: rgba(204, 255, 0, 0.14) !important;
    background: rgb(15, 19, 0);
    box-shadow:
      0 18px 34px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 0 1px rgba(204, 255, 0, 0.06);
  }

  .scan-step-row::before {
    display: none !important;
  }

  .scan-step-row.is-active::before {
    content: '';
    display: block !important;
    position: absolute;
    z-index: 0;
    top: 50%;
    left: 50%;
    width: 190%;
    aspect-ratio: 1;
    border-radius: 0;
    pointer-events: none;
    --scan-border-progress: 0deg;
    background: conic-gradient(
      from -0.25turn,
      rgba(204, 255, 0, 0.46) 0turn,
      rgba(204, 255, 0, 0.62) calc(var(--scan-border-progress) - 0.09turn),
      rgba(204, 255, 0, 0.8) calc(var(--scan-border-progress) - 0.032turn),
      rgba(204, 255, 0, 0.93) calc(var(--scan-border-progress) - 0.012turn),
      #f0ff8a calc(var(--scan-border-progress) - 0.004turn),
      #ccff00 var(--scan-border-progress),
      transparent var(--scan-border-progress),
      transparent 1turn
    );
    /* The glow follows the drawn arc rather than illuminating the whole card,
       so the trail can approach the tip's energy without reading as a static
       border. */
    filter:
      drop-shadow(0 0 3px rgba(204, 255, 0, 0.86))
      drop-shadow(0 0 9px rgba(204, 255, 0, 0.58));
    opacity: 1;
    transform: translate3d(-50%, -50%, 0);
    transform-origin: center;
    backface-visibility: hidden;
    will-change: --scan-border-progress;
    clip-path: none;
    animation: scanMobilePaneBorderLoad var(--cycle-ms, 3200ms) linear 1 both;
  }

  .scan-step-row.is-active::after {
    content: '';
    position: absolute;
    z-index: 1;
    inset: 2px;
    border-radius: 12px;
    background: rgb(15, 19, 0);
    box-shadow: inset 0 0 14px rgba(204, 255, 0, 0.08);
    pointer-events: none;
  }

  .scan-step-row > * {
    position: relative;
    z-index: 2;
  }

  .scan-step-row > div:first-child {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0;
    min-width: 0;
  }

  .scan-step-row > div:first-child > div:first-child {
    min-width: 0;
    font-size: 9px !important;
    letter-spacing: 0.16em !important;
    white-space: nowrap;
  }

  .scan-step-row > div:first-child > div:last-child {
    display: none;
  }

  .scan-section:not(.is-live) .scan-step-row.is-active::before {
    animation-play-state: paused;
  }

  .scan-step-title {
    font-size: clamp(28px, 8.4vw, 34px) !important;
    line-height: 0.92 !important;
    letter-spacing: 0 !important;
  }

  .scan-step-body {
    margin-top: 9px !important;
    max-width: none !important;
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 12px !important;
    line-height: 1.38 !important;
  }

  .scan-step-body-full,
  .scan-step-extra-full,
  .scan-step-screen {
    display: none !important;
  }

  .scan-step-body-brief,
  .scan-step-extra-brief {
    display: inline;
  }

  .scan-step-extra {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px !important;
    margin-top: 10px !important;
    padding: 9px 10px !important;
    border-radius: 10px !important;
  }

  .scan-step-extra .protocol {
    font-size: 8px !important;
    letter-spacing: 0.12em !important;
  }

  .scan-step-extra-note {
    font-size: 11px !important;
    line-height: 1.35 !important;
  }
}

@media (max-width: 390px) {
  .scan-wrap {
    grid-template-columns: minmax(116px, 34vw) minmax(0, 1fr);
    column-gap: 12px;
  }

  .scan-grid-2col {
    grid-template-columns: minmax(116px, 34vw) minmax(0, 1fr) !important;
    gap: 12px !important;
  }

  .scan-token-stage {
    width: min(82vw, 300px);
    min-height: min(82vw, 300px);
    margin-top: 20px;
  }

  .scan-phone-area {
    height: 306px !important;
    min-height: 306px !important;
  }

  .scan-phone-camera {
    width: min(34vw, 126px) !important;
  }

  .scan-step-row {
    padding: 11px 10px !important;
  }

  .scan-step-title {
    font-size: 28px !important;
  }

  .scan-step-body {
    font-size: 11px !important;
  }
}

@media (max-width: 768px) {
  :deep(html[data-liftag-short-viewport="true"] .scan-section) {
    padding-top: 68px !important;
  }

  :deep(html[data-liftag-short-viewport="true"] .scan-token-stage) {
    width: min(70vw, 260px);
    min-height: min(70vw, 260px);
    margin-top: 16px;
    margin-bottom: 40px;
  }

  :deep(html[data-liftag-short-viewport="true"] .scan-phone-area) {
    height: 286px !important;
    min-height: 286px !important;
  }

  :deep(html[data-liftag-short-viewport="true"] .scan-phone-camera) {
    width: min(32vw, 118px) !important;
  }

  :deep(html[data-liftag-short-viewport="true"] .scan-step-row) {
    gap: 7px !important;
    padding: 9px !important;
  }

  :deep(html[data-liftag-short-viewport="true"] .scan-step-title) {
    font-size: 24px !important;
  }

  .scan-step-body {
    margin-top: 7px !important;
    font-size: 10.5px !important;
    line-height: 1.32 !important;
  }

  .scan-step-extra {
    margin-top: 8px !important;
    padding: 7px 8px !important;
  }

  .scan-step-extra-note {
    font-size: 10px !important;
  }
}

@keyframes scanMobilePaneBorderLoad {
  to {
    --scan-border-progress: 1turn;
  }
}

@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
  .scan-step-row.is-active::before {
    animation: none;
    --scan-border-progress: 1turn;
  }
}
</style>
