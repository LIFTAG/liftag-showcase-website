<script setup lang="ts">
</script>

<template>
  <section
    class="final-cta-section"
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
        Track real progress. Scan real machines. Skip the spreadsheet.<br />
        Public beta. Open now on iOS, Android coming soon.
      </p>

      <!-- Store buttons -->
      <div
        class="reveal final-store-buttons"
        :style="{
          marginTop: '48px',
          display: 'flex',
          gap: '14px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }"
      >
        <AppStoreBtn store="apple" />
        <AppStoreBtn store="google" />
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
  .final-logo-ring,
  .final-store-buttons::before {
    animation: none;
  }
}
</style>
