<script setup lang="ts">
const benefits = [
  {
    tag: 'QR + NFC KIT',
    title: 'Every machine, explained.',
    body: 'Tags and stickers ship free. Members tap, scan, watch, lift.',
  },
  {
    tag: 'YOUR CONTENT',
    title: 'Your trainers in every video.',
    body: 'Record once. Deploy across the whole floor.',
  },
  {
    tag: 'DISCOVERY',
    title: 'Get found by nearby lifters.',
    body: 'Featured on the Liftag map with a verified badge.',
  },
  {
    tag: 'FREE',
    title: '100% free for partner gyms.',
    body: 'No subscription. No setup fee. Just results.',
  },
]

const gymNumbers = [
  { n: '0€', l: 'Setup fee', sub: 'no subscription, ever' },
  { n: 'FREE', l: 'QR + NFC kit', sub: 'we ship it to you' },
  { n: 'MAP', l: 'Featured placement', sub: 'verified gym badge' },
]

const muscleTags = ['BACK', 'LATS', 'BICEPS']
const gymSectionRef = ref<HTMLElement | null>(null)
const gymInView = ref(false)
const reduceMotion = ref(false)
const phoneLayout = ref(false)
let gymObserver: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
let phoneLayoutMql: MediaQueryList | null = null

const rawMouse = useSharedMouse().latest
const mouse = useLerp(rawMouse, 0.06)

function gymMotionTransform(
  xFactor: number,
  yFactor: number,
  rotateFactor = 0,
  base = '',
) {
  if (reduceMotion.value || phoneLayout.value) return base || 'translate3d(0, 0, 0)'
  const x = mouse.value.x * xFactor
  const y = mouse.value.y * yFactor
  const rotate = mouse.value.x * rotateFactor
  return `${base}${base ? ' ' : ''}translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`
}

const gymQrStickerMotion = computed(() => gymMotionTransform(-24, -16, -1.4))
const gymMachineMotion = computed(() => gymMotionTransform(18, 12, 1.1))
const gymBackPhoneMotion = computed(() => gymMotionTransform(14, 10, 0.7))
const gymFrontPhoneMotion = computed(() => gymMotionTransform(-20, -14, -1.1))
const gymQrKitMotion = computed(() => gymMotionTransform(12, -10, 0.45, 'translateX(-50%)'))

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

  if (!gymSectionRef.value) return

  gymObserver = new IntersectionObserver(
    ([entry]) => {
      gymInView.value = entry?.isIntersecting ?? false
    },
    { threshold: 0.28 },
  )
  gymObserver.observe(gymSectionRef.value)
})

onBeforeUnmount(() => {
  gymObserver?.disconnect()
  gymObserver = null
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  phoneLayoutMql?.removeEventListener('change', onPhoneLayoutChange)
  phoneLayoutMql = null
})
</script>

<template>
  <section
    id="gyms"
    ref="gymSectionRef"
    class="gyms-section"
    :class="{ 'is-live': gymInView }"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Background glow -->
    <div
      class="section-glow is-green"
      style="--glow-top: 40%; --glow-right: -20%; --glow-size: 700px; --glow-blur: 80px;"
    />

    <div class="container" style="position: relative;">
      <SectionHeader :cols="'1.1fr 1fr'" :copy-max="480">
        <template #eyebrow>▸ FOR GYMS</template>
        <template #title>
          Put your gym<br />on the <span class="lime">map.</span>
        </template>
        Tag your floor. Members tap NFC or scan QR, instantly open the right exercise, and watch
        a setup video your trainers recorded. Get discovered by thousands of nearby lifters looking for
        their next gym.
      </SectionHeader>

      <!-- Middle: 3-col layout -->
      <div
        class="gyms-3col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: '40px',
          alignItems: 'center',
        }"
      >
        <!-- LEFT — QR sticker + machine card -->
        <div
          class="reveal gyms-qr"
          :style="{ position: 'relative', height: '560px' }"
        >
          <!-- QR Sticker -->
          <div
            class="gyms-motion-layer gyms-qr-sticker-motion"
            :style="{
              position: 'absolute',
              top: 0,
              left: '10px',
              zIndex: 3,
              transform: gymQrStickerMotion,
            }"
          >
            <div
              class="gyms-qr-sticker-card"
              :style="{
              width: '180px',
              height: '210px',
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(204,255,0,0.15)',
              transform: 'rotate(4deg)',
              animation: 'float-y 6s ease-in-out infinite',
              }"
            >
            <!-- QR sticker header -->
            <div
              :style="{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }"
            >
              <div :style="{ display: 'flex', alignItems: 'center', gap: '5px' }">
                <img src="/assets/logo.svg" width="18" height="18" alt="" />
                <span
                  :style="{
                    fontFamily: '\'Space Grotesk\', sans-serif',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#0E0E0E',
                    letterSpacing: '-0.04em',
                    textTransform: 'uppercase',
                  }"
                >LIFTAG</span>
              </div>
              <div
                :style="{
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontSize: '8px',
                  fontWeight: 700,
                  color: '#666',
                  letterSpacing: '0.2em',
                }"
              >#042</div>
            </div>

            <!-- QR image -->
            <div class="gyms-qr-code" :style="{ width: 'calc(100% - 12px)', aspectRatio: '1', margin: '0 auto 7px', position: 'relative', overflow: 'hidden' }">
              <img
                src="/uploads/telegram-cloud-photo-size-4-5904481809322413580-y.jpg"
                alt="LIFTAG QR Code"
                :style="{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }"
              />
            </div>

            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#999',
                marginTop: 0,
              }"
            >TAP OR SCAN</div>
            </div>
          </div>

          <!-- Machine card -->
          <div
            class="gyms-motion-layer gyms-machine-motion"
            :style="{
              position: 'absolute',
              bottom: '20px',
              right: 0,
              zIndex: 2,
              transform: gymMachineMotion,
            }"
          >
            <div
              class="gyms-machine-card"
              :style="{
              width: '220px',
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              transform: 'rotate(-3deg)',
              }"
            >
            <div :style="{ height: '110px', position: 'relative', overflow: 'hidden' }">
              <img
                src="/assets/img/lat-pulldown.jpeg"
                alt="Lat Pulldown machine"
                :style="{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(0.2) contrast(1.05)',
                }"
              />
              <div
                :style="{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))',
                }"
              />
              <div
                :style="{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(204,255,0,0.9)',
                  color: '#0E0E0E',
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontWeight: 700,
                  fontSize: '8px',
                  letterSpacing: '0.15em',
                }"
              >● LIVE · 3 USING</div>
            </div>
            <div :style="{ padding: '14px' }">
              <div class="protocol" :style="{ color: '#CCFF00', fontSize: '8px' }">MACHINE · #042</div>
              <div
                :style="{
                  fontFamily: '\'Space Grotesk\', sans-serif',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  marginTop: '4px',
                }"
              >Cable Lat Pulldown</div>
              <div :style="{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }">
                <span
                  v-for="tag in muscleTags"
                  :key="tag"
                  :style="{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.06)',
                    fontFamily: '\'JetBrains Mono\', monospace',
                    fontSize: '7px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.6)',
                  }"
                >{{ tag }}</span>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- CENTER — 2 phones -->
        <div
          class="gyms-phones-center"
          :style="{
            position: 'relative',
            height: '620px',
            display: 'flex',
            justifyContent: 'center',
          }"
        >
          <div class="gyms-map-ping ping-one" aria-hidden="true" />
          <div class="gyms-map-ping ping-two" aria-hidden="true" />
          <!-- Back phone — gym detail, rotates 4deg -->
          <div
            class="gyms-motion-layer gyms-back-phone-motion"
            :style="{
              position: 'absolute',
              top: '30px',
              right: '-10px',
              transform: gymBackPhoneMotion,
            }"
          >
            <div
              class="gyms-live-badge"
              :style="{
              transform: 'rotate(4deg)',
              opacity: 0.8,
              animation: 'float-y 7s ease-in-out infinite',
              animationDelay: '1s',
              }"
            >
              <Phone src="/assets/screens/gym-detail.png" :scale="0.72" />
            </div>
          </div>

          <!-- Front phone — explore map, rotates -3deg -->
          <div
            class="gyms-motion-layer gyms-front-phone-motion"
            :style="{
              position: 'absolute',
              top: 0,
              left: '-10px',
              zIndex: 2,
              transform: gymFrontPhoneMotion,
            }"
          >
            <div
              class="gyms-front-phone"
              :style="{
                transform: 'rotate(-3deg)',
                animation: 'float-y 6s ease-in-out infinite',
              }"
            >
              <Phone src="/assets/screens/explore-map.png" :scale="0.88" />
            </div>
          </div>

          <!-- Live badge chip -->
          <div
            class="gyms-motion-layer gyms-qr-kit-chip"
            :style="{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: gymQrKitMotion,
              background: 'rgba(10,10,10,0.92)',
              border: '1px solid rgba(204,255,0,0.3)',
              borderRadius: '14px',
              padding: '10px 18px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(204,255,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 5,
              whiteSpace: 'nowrap',
            }"
          >
            <span
              class="gyms-live-dot"
              :style="{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#CCFF00',
                boxShadow: '0 0 8px #CCFF00',
                flexShrink: 0,
              }"
            />
            <span class="protocol" :style="{ color: '#CCFF00', fontSize: '9px' }">
              FREE QR + NFC KIT · APPLY NOW
            </span>
          </div>
        </div>

        <!-- RIGHT — benefit list -->
        <div class="reveal" :style="{ display: 'flex', flexDirection: 'column', gap: 0 }">
          <div
            v-for="(b, i) in benefits"
            :key="i"
            class="gyms-benefit-row"
            :style="{
              '--benefit-delay': `${i * 150}ms`,
              padding: '20px 0',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }"
          >
            <div class="protocol" :style="{ color: '#CCFF00', fontSize: '9px', marginBottom: '6px' }">
              {{ b.tag }}
            </div>
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: '18px',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#fff',
                lineHeight: 1.1,
              }"
            >
              {{ b.title }}
            </div>
            <div
              :style="{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginTop: '6px',
                fontWeight: 300,
              }"
            >
              {{ b.body }}
            </div>
          </div>

          <div
            :style="{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '24px',
              marginTop: '8px',
            }"
          >
            <div :style="{ display: 'flex', gap: '12px', flexWrap: 'wrap' }">
              <button class="btn-primary" style="padding: 14px 24px; font-size: 12px;">
                Partner with us
              </button>
              <button class="btn-ghost" style="padding: 14px 24px; font-size: 12px;">
                Get the tag kit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Numbers row -->
      <div
        id="pricing"
        class="gyms-numbers reveal"
        :style="{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }"
      >
        <div
          v-for="(s, i) in gymNumbers"
          :key="i"
          :style="{
            padding: '28px 32px',
            background: '#0a0a0a',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }"
        >
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800,
              fontSize: 'clamp(28px, 3vw, 44px)',
              color: '#CCFF00',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }"
          >
            {{ s.n }}
          </div>
          <div class="protocol" :style="{ color: '#fff', fontSize: '10px', marginTop: '10px' }">
            {{ s.l }}
          </div>
          <div :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }">
            {{ s.sub }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gyms-qr-sticker-card,
.gyms-machine-card,
.gyms-live-badge,
.gyms-front-phone,
.gyms-benefit-row {
  position: relative;
}

.gyms-motion-layer {
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform;
}

.gyms-numbers {
  scroll-margin-top: calc(50vh - 96px);
}

.gyms-qr-code::after {
  content: '';
  position: absolute;
  inset: -20% -35%;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 30%, rgba(204, 255, 0, 0.22), rgba(255, 255, 255, 0.68), transparent 64%);
  transform: translateX(-120%) rotate(8deg);
  opacity: 0;
}

.gyms-section.is-live .gyms-qr-code::after {
  animation: gymsQrSweep 3.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.gyms-qr-sticker-card::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 24px;
  pointer-events: none;
  border: 1px solid rgba(204, 255, 0, 0.18);
  opacity: 0;
}

.gyms-section.is-live .gyms-qr-sticker-card::after {
  animation: gymsStickerHalo 4.6s ease-in-out infinite;
}

.gyms-machine-card::after,
.gyms-benefit-row::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 20%, rgba(204, 255, 0, 0.1), transparent 48%);
  transform: translateX(-130%);
  opacity: 0;
}

.gyms-section.is-live .gyms-machine-card::after,
.gyms-section.is-live .gyms-benefit-row::after {
  animation: gymsRowGlint 6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  animation-delay: var(--benefit-delay, 0ms);
}

.gyms-map-ping {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 260px;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.18);
  transform: translate(-50%, -50%) scale(0.55);
  opacity: 0;
  pointer-events: none;
}

.gyms-section.is-live .gyms-map-ping {
  animation: gymsMapPing 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.gyms-section.is-live .gyms-map-ping.ping-two {
  animation-delay: 1.7s;
}

.gyms-live-dot {
  animation: gymsLiveDot 1600ms ease-in-out infinite;
}

@keyframes gymsQrSweep {
  0%, 45% {
    opacity: 0;
    transform: translateX(-120%) rotate(8deg);
  }
  58% {
    opacity: 0.85;
  }
  78%, 100% {
    opacity: 0;
    transform: translateX(120%) rotate(8deg);
  }
}

@keyframes gymsStickerHalo {
  0%, 100% {
    opacity: 0;
    transform: scale(0.96);
  }
  46% {
    opacity: 0.75;
    transform: scale(1.04);
  }
}

@keyframes gymsRowGlint {
  0%, 68% {
    opacity: 0;
    transform: translateX(-130%);
  }
  82% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateX(130%);
  }
}

@keyframes gymsMapPing {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.55);
  }
  18% {
    opacity: 0.46;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes gymsLiveDot {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gyms-section.is-live .gyms-qr-code::after,
  .gyms-section.is-live .gyms-qr-sticker-card::after,
  .gyms-section.is-live .gyms-machine-card::after,
  .gyms-section.is-live .gyms-benefit-row::after,
  .gyms-section.is-live .gyms-map-ping,
  .gyms-live-dot,
  .gyms-qr-sticker-card,
  .gyms-live-badge,
  .gyms-front-phone {
    animation: none !important;
  }
}
</style>
