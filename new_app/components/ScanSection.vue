<script setup lang="ts">
const step = ref(0)
const phoneSwipeDirection = ref<'left' | 'right'>('left')
const hoveredStep = ref<number | null>(null)
const cyclePulse = ref(0)
const scanCycleMs = 3200
const inView = ref(false)
const sectionRef = ref<HTMLElement | null>(null)
let cycleInterval: ReturnType<typeof setInterval> | null = null

const steps = [
  {
    tag: 'STEP 01',
    title: 'Point.',
    body: 'Open Liftag. Aim at any QR sticker on the machine. The exact exercise, variations, and a setup video load instantly. No menus, no searching.',
    screen: '/assets/screens/qr-scan.png',
    extra: null as null | { label: string; note: string },
  },
  {
    tag: 'STEP 02',
    title: 'Log.',
    body: 'Tap weight × reps. Timer auto-runs between sets. RPE optional. Every set is timestamped and saved to your history.',
    screen: '/assets/screens/log-set.png',
    extra: {
      label: 'OPTIONAL',
      note: "Watch the gym's own instruction video. Filmed by their trainers, on their machines.",
    },
  },
]

function setStep(nextStep: number) {
  if (nextStep === step.value) return
  phoneSwipeDirection.value = nextStep > step.value ? 'left' : 'right'
  step.value = nextStep
  cyclePulse.value += 1
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

onMounted(() => {
  if (!sectionRef.value) return

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { inView.value = e.isIntersecting })
    },
    { threshold: 0.3 },
  )
  io.observe(sectionRef.value)

  onBeforeUnmount(() => {
    io.disconnect()
  })
})

function clearCycleInterval() {
  if (cycleInterval === null) return
  clearInterval(cycleInterval)
  cycleInterval = null
}

function startCycleInterval() {
  clearCycleInterval()
  cyclePulse.value += 1
  cycleInterval = setInterval(() => {
    if (hoveredStep.value !== null) return
    setStep((step.value + 1) % 2)
  }, scanCycleMs)
}

watch(inView, (val) => {
  if (val && hoveredStep.value === null) startCycleInterval()
  else clearCycleInterval()
})

onBeforeUnmount(() => {
  clearCycleInterval()
})
</script>

<template>
  <section
    id="scan"
    ref="sectionRef"
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
        class="reveal"
        :style="{
          fontSize: '18px',
          fontWeight: 300,
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '560px',
          marginTop: '28px',
        }"
      >
        No more guessing how a cable stack works. Scan the QR code on any partner gym machine.
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
            :style="{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }"
          >
            <div class="scan-phone-float">
              <div class="scan-phone-camera">
                <Phone
                  :src="steps[step].screen"
                  :scale="1.05"
                  screen-transition
                  :screen-transition-direction="phoneSwipeDirection"
                />
                <div v-if="step === 0" class="scan-phone-laser-overlay" aria-hidden="true">
                  <span class="scan-phone-laser-line" />
                </div>
                <div
                  class="scan-cycle-indicator"
                  :class="{ 'is-paused': hoveredStep !== null }"
                  :style="{ '--cycle-ms': `${scanCycleMs}ms` }"
                  aria-hidden="true"
                >
                  <span :key="`scan-cycle-${cyclePulse}`" />
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative QR sticker — rotated -8deg -->
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
              transform: 'rotate(-8deg)',
              zIndex: 4,
            }"
          >
            <img
              src="/uploads/telegram-cloud-photo-size-4-5904481809322413580-y.jpg"
              alt="LIFTAG QR Code"
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
              Easy to spot qr codes
            </div>
          </div>
        </div>

        <!-- RIGHT: 2-step list -->
        <div>
          <div :style="{ display: 'flex', flexDirection: 'column', gap: 0 }">
            <div
              v-for="(s, i) in steps"
              :key="i"
              class="scan-step-row"
              :style="{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: '24px',
                padding: '32px 0',
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
              <div>
                <h3
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
                    alt=""
                    :style="{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }"
                  />

                  <!-- Scan overlay — only on step 0 -->
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
                  :style="{
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 300,
                    fontSize: '16px',
                    lineHeight: 1.55,
                    marginTop: '14px',
                    maxWidth: '440px',
                  }"
                >
                  {{ s.body }}
                </p>
                <div
                  v-if="s.extra"
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
                    :style="{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }"
                  >
                    {{ s.extra.note }}
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
.scan-step-row {
  will-change: transform, opacity;
}

.scan-phone-float {
  animation: float-y 5s ease-in-out infinite;
  transform-origin: center;
}

.scan-phone-camera {
  position: relative;
  width: 280px;
  aspect-ratio: 393 / 852;
  transform-origin: center;
  will-change: transform;
}

.scan-cycle-indicator {
  position: absolute;
  left: 50%;
  bottom: -26px;
  z-index: 15;
  width: 92px;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
  transform: translateX(-50%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  transition: opacity 260ms ease, filter 260ms ease;
}

.scan-cycle-indicator span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(204, 255, 0, 0.48), #ccff00);
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.44);
  transform: scaleX(0);
  transform-origin: left center;
  animation: scanCycleFill var(--cycle-ms, 3200ms) linear forwards;
}

.scan-cycle-indicator.is-paused {
  opacity: 0.34;
  filter: saturate(0.65);
}

.scan-cycle-indicator.is-paused span {
  animation-play-state: paused;
}

.scan-phone-laser-overlay {
  position: absolute;
  top: 35.5%;
  left: 20%;
  right: 20%;
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

@keyframes scanCycleFill {
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scan-step-row {
    transition: none !important;
    transform: none !important;
  }

  .scan-phone-float,
  .scan-cycle-indicator span,
  .scan-phone-laser-line {
    animation: none;
  }
}
</style>
