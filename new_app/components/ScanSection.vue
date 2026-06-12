<script setup lang="ts">
const step = ref(0)
const phoneSwipeDirection = ref<'left' | 'right'>('left')
const hoveredStep = ref<number | null>(null)
const exitingStep = ref<number | null>(null)
const scanCycleMs = 3200
const inView = ref(false)
const documentVisible = ref(true)
const reduceMotion = ref(false)
const phoneLayout = ref(false)
const sectionRef = ref<HTMLElement | null>(null)
let cycleInterval: ReturnType<typeof setInterval> | null = null
let exitTimer: ReturnType<typeof setTimeout> | null = null
let scanObserver: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
let phoneLayoutMql: MediaQueryList | null = null

function syncCycleInterval() {
  if (inView.value && documentVisible.value && hoveredStep.value === null) {
    startCycleInterval()
  } else {
    clearCycleInterval()
  }
}

function onDocumentVisibilityChange() {
  documentVisible.value = !document.hidden
  syncCycleInterval()
}

const rawMouse = useSharedMouse().latest
const mouse = useLerp(rawMouse, 0.06)

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
}

function setHoveredStep(nextStep: number) {
  hoveredStep.value = nextStep
  clearCycleInterval()
  setStep(nextStep)
}

function clearHoveredStep(stepIndex: number) {
  if (hoveredStep.value !== stepIndex) return
  hoveredStep.value = null
  if (inView.value) startCycleInterval()
}

const scanPhoneMotionTransform = computed(() => {
  if (reduceMotion.value || phoneLayout.value) return 'translate3d(0, 0, 0)'
  const x = mouse.value.x * 18
  const y = mouse.value.y * 12
  const rotateX = mouse.value.y * 2.4
  const rotateY = mouse.value.x * -3.2
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
})

const scanQrMotionTransform = computed(() => {
  if (reduceMotion.value || phoneLayout.value) return 'rotate(-8deg)'
  const x = mouse.value.x * -28
  const y = mouse.value.y * -18
  const rotate = -8 + mouse.value.x * -2.2 + mouse.value.y * 0.8
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`
})

function onMotionChange(e: MediaQueryListEvent) {
  reduceMotion.value = e.matches
}

function onPhoneLayoutChange(e: MediaQueryListEvent) {
  phoneLayout.value = e.matches
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

function clearCycleInterval() {
  if (cycleInterval === null) return
  clearInterval(cycleInterval)
  cycleInterval = null
}

function startCycleInterval() {
  clearCycleInterval()
  cycleInterval = setInterval(() => {
    if (hoveredStep.value !== null) return
    setStep((step.value + 1) % 2)
  }, scanCycleMs)
}

watch(inView, () => syncCycleInterval())

onBeforeUnmount(() => {
  clearCycleInterval()
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

    <div class="container" :style="{ position: 'relative', zIndex: 2 }">
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
                    :scale="1.05"
                    sizes="(max-width: 768px) 36vw, 280px"
                    screen-transition
                    :screen-transition-direction="phoneSwipeDirection"
                  />
                  <div v-if="step === 0" class="scan-phone-laser-overlay" aria-hidden="true">
                    <span class="scan-phone-laser-line" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative QR sticker - rotated -8deg -->
          <div
            class="scan-qr-sticker"
            :style="{
              position: 'absolute',
              bottom: '76px',
              left: '8px',
              width: '122px',
              height: '122px',
              background: '#fff',
              padding: '11px',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(204,255,0,0.2)',
              transform: scanQrMotionTransform,
              zIndex: 4,
            }"
          >
            <img
              src="/uploads/qr-code-160.webp"
              srcset="/uploads/qr-code-112.webp 112w, /uploads/qr-code-160.webp 160w, /uploads/qr-code-224.webp 224w, /uploads/qr-code.webp 400w"
              sizes="100px"
              alt="LIFTAG QR Code"
              width="160"
              height="160"
              loading="lazy"
              decoding="async"
              :style="{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }"
            />
            <div
              :style="{
                position: 'absolute',
                bottom: '-31px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'max-content',
                textAlign: 'center',
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#CCFF00',
                textTransform: 'uppercase',
                textShadow: '0 0 14px rgba(204,255,0,0.32)',
              }"
            >
              QR + NFC machine tags
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
              @click="setStep(i)"
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
                    alt=""
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
@property --scan-mobile-border-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
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

.scan-phone-motion,
.scan-qr-sticker {
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform;
}

.scan-phone-camera {
  position: relative;
  width: 280px;
  aspect-ratio: 393 / 852;
  transform-origin: center;
  will-change: transform;
}

.scan-phone-laser-overlay {
  position: absolute;
  top: 36%;
  left: 22.4%;
  right: 22.4%;
  aspect-ratio: 1;
  overflow: hidden;
  pointer-events: none;
  z-index: 14;
  border-radius: 18px;
  mix-blend-mode: screen;
}

.scan-phone-laser-overlay::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(204, 255, 0, 0.34);
  border-radius: 16px;
  box-shadow:
    inset 0 0 18px rgba(204, 255, 0, 0.12),
    0 0 22px rgba(204, 255, 0, 0.14);
}

.scan-phone-laser-line {
  position: absolute;
  top: 8%;
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
  animation: scan-phone-laser-sweep 1.85s cubic-bezier(0.45, 0, 0.2, 1) infinite;
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
    top: 8%;
    opacity: 0.32;
    transform: scaleX(0.78);
  }

  13%,
  87% {
    opacity: 1;
  }

  50% {
    top: 88%;
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

  .scan-grid-2col {
    grid-template-columns: minmax(126px, 37vw) minmax(0, 1fr) !important;
    align-items: start !important;
    gap: clamp(14px, 4vw, 22px) !important;
    margin-top: 30px !important;
  }

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
    margin: 0 auto;
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

  .scan-phone-laser-overlay {
    top: 34.8%;
    left: 21%;
    right: 21%;
    border-radius: 10px;
  }

  .scan-steps-panel {
    min-width: 0;
  }

  .scan-steps-stack {
    gap: 10px !important;
  }

  .scan-step-row {
    --scan-mobile-border-angle: 0deg;
    grid-template-columns: 1fr !important;
    gap: 10px !important;
    min-width: 0;
    padding: 12px 12px 13px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 14px;
    background: rgba(8, 10, 6, 0.58);
    opacity: 1 !important;
    transform: none !important;
    transition:
      border-color 260ms ease,
      background 260ms ease,
      box-shadow 260ms ease !important;
  }

  .scan-step-row.is-active {
    border-color: rgba(204, 255, 0, 0.14) !important;
    background: rgba(204, 255, 0, 0.075);
    box-shadow:
      0 18px 34px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 0 1px rgba(204, 255, 0, 0.06);
  }

  .scan-step-row::before {
    display: none !important;
  }

  .scan-step-row.is-active::before,
  .scan-step-row.is-exiting::before {
    content: '';
    display: block !important;
    position: absolute;
    inset: -1px;
    width: auto;
    padding: 2px;
    border-radius: inherit;
    pointer-events: none;
    background: conic-gradient(
      from -90deg,
      #f0ff8a 0deg,
      #ccff00 var(--scan-mobile-border-angle),
      transparent calc(var(--scan-mobile-border-angle) + 0.4deg),
      transparent 360deg
    );
    box-shadow: none;
    opacity: 1;
    transform: none;
    clip-path: none;
    animation: scanMobilePaneBorderLoad calc(var(--cycle-ms, 3200ms) - 160ms) linear forwards;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    filter:
      drop-shadow(0 0 7px rgba(204, 255, 0, 0.66))
      drop-shadow(0 0 16px rgba(204, 255, 0, 0.28));
  }

  .scan-step-row.is-exiting::before {
    display: block !important;
    --scan-mobile-border-angle: 360deg;
    opacity: 0.7;
    animation: scanMobilePaneBorderExit 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

  .scan-section.is-hover-locked .scan-step-row.is-active::before {
    --scan-mobile-border-angle: 360deg;
    animation: none;
    opacity: 0.72;
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
  .scan-grid-2col {
    grid-template-columns: minmax(116px, 34vw) minmax(0, 1fr) !important;
    gap: 12px !important;
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

  :deep(html[data-liftag-short-viewport="true"] .scan-grid-2col) {
    margin-top: 24px !important;
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
    --scan-mobile-border-angle: 360deg;
  }
}

@keyframes scanMobilePaneBorderExit {
  to {
    opacity: 0;
  }
}

@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
  .scan-step-row.is-active::before {
    --scan-mobile-border-angle: 360deg;
    animation: none;
    opacity: 1;
  }

  .scan-step-row.is-exiting::before {
    animation: none;
    opacity: 0;
  }
}
</style>
