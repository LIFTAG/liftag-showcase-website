<script setup lang="ts">
const sectionRef = ref<HTMLElement | null>(null)
const chargeAnchor = ref<HTMLElement | null>(null)
const chargeP = ref(0)
const charged = ref(false)

let observer: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
let rafId = 0
let inView = false
let documentVisible = true
let reduceMotion = false
let latched = false

const chargeLabel = computed(() => {
  const n = Math.round(chargeP.value * 100)
  return latched || charged.value
    ? 'CHARGE ▸ 100% · READY'
    : `CHARGE ▸ ${n}%`
})

function updateCharge() {
  const btn = chargeAnchor.value
  if (!btn || latched) return

  const rect = btn.getBoundingClientRect()
  const vh = window.innerHeight
  const btnMid = rect.top + rect.height / 2
  const start = vh * 0.92
  const end = vh * 0.5
  const p = Math.min(1, Math.max(0, (start - btnMid) / Math.max(1, start - end)))
  chargeP.value = p

  if (p >= 1) {
    latched = true
    charged.value = true
    chargeP.value = 1
    stopLoop()
  }
}

function tick() {
  if (!inView || !documentVisible || reduceMotion || latched) {
    rafId = 0
    return
  }
  updateCharge()
  if (!latched) rafId = requestAnimationFrame(tick)
}

function startLoop() {
  if (rafId || reduceMotion || latched || !inView || !documentVisible) return
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function onDocumentVisibilityChange() {
  documentVisible = !document.hidden
  if (documentVisible) startLoop()
  else stopLoop()
}

function onMotionChange() {
  reduceMotion = Boolean(motionMql?.matches)
  if (reduceMotion) {
    stopLoop()
    latched = true
    charged.value = true
    chargeP.value = 1
  } else if (!latched) {
    startLoop()
  }
}

onMounted(() => {
  documentVisible = !document.hidden
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)
  if (reduceMotion) {
    latched = true
    charged.value = true
    chargeP.value = 1
  }

  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting ?? false
      if (inView) startLoop()
      else stopLoop()
    },
    { threshold: 0 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  stopLoop()
  observer?.disconnect()
  observer = null
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="final-cta-section"
    :class="{ 'is-charged': charged }"
    :style="{
      background: '#000',
      padding: '160px 0 120px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Radial glow background -->
    <div
      class="final-cta-grid"
      :style="{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(204,255,0,0.18), transparent 60%)',
      }"
    />

    <!-- Grid mask -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Logo -->
      <div class="final-logo-wrap">
        <span class="final-logo-ring ring-one" aria-hidden="true" />
        <span class="final-logo-ring ring-two" aria-hidden="true" />
        <img
          src="/assets/logo.svg"
          width="100"
          height="100"
          :style="{
            filter: 'drop-shadow(0 0 40px rgba(204,255,0,0.7))',
          }"
          alt="LIFTAG logo"
        />
      </div>

      <!-- Main heading -->
      <h2
        class="display reveal"
        :style="{
          fontSize: 'clamp(56px, 9vw, 140px)',
          color: '#fff',
        }"
      >
        STOP <span class="lime">GUESSING</span>.<br />
        START <span class="lime">LIFTING</span>.
      </h2>

      <p
        class="reveal"
        :style="{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '18px',
          fontWeight: 300,
          maxWidth: '540px',
          margin: '32px auto 0',
          lineHeight: 1.55,
        }"
      >
        Track real progress. Tap or scan real machines. Skip the spreadsheet.<br />
        Free to download. Open now on iOS and Android.
      </p>

      <div class="final-charge" aria-hidden="true">
        <div class="protocol final-charge-label">{{ chargeLabel }}</div>
        <div class="final-charge-track">
          <div
            class="final-charge-bar"
            :style="{ transform: `scaleX(${chargeP})` }"
          />
        </div>
      </div>

      <!-- Store buttons -->
      <div
        class="reveal final-store-buttons"
        :style="{
          marginTop: '20px',
          display: 'flex',
          gap: '14px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }"
      >
        <div ref="chargeAnchor" data-magnetic="16" class="final-cta-magnet">
          <GetAppBtn idle-rim />
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.final-cta-section::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(360px circle at 50% 48%, rgba(204, 255, 0, 0.12), transparent 70%);
  animation: finalAuraBreathe 6.2s ease-in-out infinite;
}

.final-cta-grid {
  animation: finalGridDrift 18s linear infinite;
}

.final-logo-wrap {
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto 40px;
  display: grid;
  place-items: center;
  animation: float-y 4s ease-in-out infinite;
}

.final-logo-ring {
  position: absolute;
  inset: 8px;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.18);
  box-shadow: inset 0 0 26px rgba(204, 255, 0, 0.06);
  animation: finalLogoRing 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.final-logo-ring.ring-two {
  inset: -8px;
  opacity: 0.55;
  animation-delay: 1.4s;
}

.final-charge {
  display: grid;
  justify-items: center;
  gap: 10px;
  margin: 36px auto 0;
}

.final-charge-label {
  color: rgba(255, 255, 255, 0.42);
  font-size: 10px;
}

.final-charge-track {
  width: min(220px, 70vw);
  height: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.final-charge-bar {
  width: 100%;
  height: 100%;
  background: var(--liftag-primary);
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.45);
  transform: scaleX(0);
  transform-origin: left center;
}

.final-cta-magnet {
  display: inline-flex;
}

.final-store-buttons {
  position: relative;
}

.final-store-buttons::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(560px, 90vw);
  height: 88px;
  pointer-events: none;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.11), transparent);
  transform: translate(-50%, -50%);
  filter: blur(16px);
  animation: finalStoreGlow 5.6s ease-in-out infinite;
}

.final-cta-section.is-charged .final-cta-magnet :deep(.get-app-btn) {
  animation: finalChargeBloom 900ms cubic-bezier(0.16, 1, 0.3, 1) 1;
}

.final-cta-section.is-charged .final-charge-label {
  color: var(--liftag-primary);
}

@keyframes finalChargeBloom {
  0% { box-shadow: 0 0 0 rgba(204, 255, 0, 0); }
  40% { box-shadow: 0 0 48px rgba(204, 255, 0, 0.55); }
  100% { box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34); }
}

@keyframes finalAuraBreathe {
  0%, 100% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes finalGridDrift {
  from {
    background-position: 0 0, 0 0;
  }
  to {
    background-position: 80px 80px, 80px 80px;
  }
}

@keyframes finalLogoRing {
  0% {
    opacity: 0;
    transform: scale(0.74);
  }
  24% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: scale(1.34);
  }
}

@keyframes finalStoreGlow {
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.78;
  }
}

@media (prefers-reduced-motion: reduce) {
  .final-cta-section::after,
  .final-cta-grid,
  .final-logo-wrap,
  .final-logo-ring,
  .final-store-buttons::before,
  .final-cta-section.is-charged .final-cta-magnet :deep(.get-app-btn) {
    animation: none;
  }
}
</style>
