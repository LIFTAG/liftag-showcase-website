<script setup lang="ts">
const step = ref(0)
const inView = ref(false)
const sectionRef = ref<HTMLElement | null>(null)

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
      note: "Watch the gym's own instruction video — filmed by their trainers, on their machines.",
    },
  },
]

onMounted(() => {
  if (!sectionRef.value) return

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { inView.value = e.isIntersecting })
    },
    { threshold: 0.3 },
  )
  io.observe(sectionRef.value)

  onBeforeUnmount(() => io.disconnect())
})

let cycleInterval: ReturnType<typeof setInterval> | null = null

watch(inView, (val) => {
  if (val) {
    cycleInterval = setInterval(() => {
      step.value = (step.value + 1) % 2
    }, 3200)
  } else {
    if (cycleInterval !== null) {
      clearInterval(cycleInterval)
      cycleInterval = null
    }
  }
})

onBeforeUnmount(() => {
  if (cycleInterval !== null) clearInterval(cycleInterval)
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
        No more guessing how a cable stack works. Scan the QR code on any partner gym machine —
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
              animation: 'float-y 5s ease-in-out infinite',
            }"
          >
            <Phone :scale="1.05">
              <!-- Screen images — cross-fade -->
              <img
                v-for="(s, i) in steps"
                :key="i"
                :src="s.screen"
                alt=""
                :style="{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: step === i ? 1 : 0,
                  transition: 'opacity 700ms cubic-bezier(0.16,1,0.3,1)',
                }"
              />

              <!-- Scan overlay — only on step 0 -->
              <div
                v-if="step === 0"
                :style="{
                  position: 'absolute',
                  top: '32%',
                  left: '20%',
                  right: '20%',
                  aspectRatio: '1',
                  pointerEvents: 'none',
                }"
              >
                <div
                  :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #CCFF00, transparent)',
                    boxShadow: '0 0 16px #CCFF00',
                    animation: 'scanline 2s ease-in-out infinite',
                  }"
                />
              </div>
            </Phone>
          </div>

          <!-- Decorative QR sticker — rotated -8deg -->
          <div
            class="scan-qr-sticker"
            :style="{
              position: 'absolute',
              bottom: '40px',
              left: '-10px',
              width: '110px',
              height: '110px',
              background: '#fff',
              padding: '10px',
              borderRadius: '10px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(204,255,0,0.2)',
              transform: 'rotate(-8deg)',
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
                bottom: '-18px',
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#CCFF00',
              }"
            >
              LAT PULLDOWN · #042
            </div>
          </div>
        </div>

        <!-- RIGHT: 2-step list -->
        <div>
          <div :style="{ display: 'flex', flexDirection: 'column', gap: 0 }">
            <div
              v-for="(s, i) in steps"
              :key="i"
              :style="{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: '24px',
                padding: '32px 0',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                opacity: step === i ? 1 : 0.4,
                transition: 'opacity 400ms ease',
                cursor: 'pointer',
              }"
              @click="step = i"
              @mouseenter="step = i"
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
                      top: '32%',
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
