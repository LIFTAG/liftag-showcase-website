<script setup lang="ts">
// Look-through QR beat between Scan and How It Works.
//
// The tag is the subject: black modules stay printed, the white is open, a
// gym sits behind the print. WebGL lives in QrPortalCore. This file is the
// physical card, the copy, and the reduced-motion fallback.

const reduceMotion = ref(false)
const hintGone = ref(false)
const coarsePointer = ref(false)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  coarsePointer.value = window.matchMedia('(hover: none), (pointer: coarse)').matches
})
</script>

<template>
  <section class="qr-portal-section">
    <div
      class="qr-portal-glow"
      aria-hidden="true"
    />

    <div class="container qr-portal-wrap">
      <div class="qr-portal-grid">
        <div class="qr-portal-copy">
          <Eyebrow>▸ MACHINE TAG</Eyebrow>
          <SectionTitle :max="640">
            Look through the <span class="lime">tag.</span>
          </SectionTitle>
          <p class="reveal qr-portal-lede">
            Every partner machine wears one. Scan the print and the setup is waiting.
            Move the card and the floor is already behind it.
          </p>
        </div>

        <figure
          class="qr-portal-stage"
          aria-label="LIFTAG machine tag. Move to look through the QR into a gym."
        >
          <div class="qr-portal-card">
            <div
              class="prism-rim prism-rim--masked qr-portal-rim"
              aria-hidden="true"
            />
            <div class="qr-portal-window">
              <img
                class="qr-portal-fallback"
                src="/uploads/qr-code.webp"
                srcset="/uploads/qr-code-160.webp 160w, /uploads/qr-code-224.webp 224w, /uploads/qr-code.webp 400w"
                sizes="(max-width: 768px) 86vw, 480px"
                alt="LIFTAG QR Code"
                width="400"
                height="400"
                loading="lazy"
                decoding="async"
              />
              <QrPortalCore
                v-if="!reduceMotion"
                @looked="hintGone = true"
              />
            </div>
          </div>
          <p
            class="protocol qr-portal-hint"
            :class="{ 'is-gone': hintGone || reduceMotion }"
            aria-hidden="true"
          >
            {{ coarsePointer ? 'DRAG TO LOOK' : 'MOVE TO LOOK' }}
          </p>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.qr-portal-section {
  background: #000;
  padding: 140px 0 128px;
  overflow: hidden;
}

.qr-portal-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 46% 42% at 72% 48%, rgba(204, 255, 0, 0.07), transparent 70%);
  pointer-events: none;
}

.qr-portal-wrap {
  position: relative;
  z-index: 2;
}

.qr-portal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 72px;
  align-items: center;
}

.qr-portal-lede {
  font-size: 18px;
  font-weight: 300;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.6);
  max-width: 520px;
  margin: 28px 0 0;
}

.qr-portal-stage {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-portal-card {
  position: relative;
  width: min(42vw, 480px);
  aspect-ratio: 1;
  padding: 18px;
  border-radius: 16px;
  background: #f3f3ee;
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.7),
    0 0 48px rgba(204, 255, 0, 0.16);
}

.qr-portal-rim {
  --prism-inset: 6px;
  --prism-radius: 16px;
  --prism-strength: 0.58;
  z-index: 3;
}

.qr-portal-window {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
}

.qr-portal-fallback {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.qr-portal-hint {
  margin: 18px 0 0;
  color: #ccff00;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-shadow: 0 0 14px rgba(204, 255, 0, 0.32);
  transition: opacity 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.qr-portal-hint.is-gone {
  opacity: 0;
}

@media (max-width: 980px) {
  .qr-portal-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .qr-portal-copy {
    order: 2;
  }

  .qr-portal-stage {
    order: 1;
  }

  .qr-portal-card {
    width: min(86vw, 340px);
  }
}

@media (max-width: 768px) {
  .qr-portal-section {
    padding: 88px 0 96px;
  }

  .qr-portal-lede {
    font-size: 16px;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  :global(html[data-liftag-short-viewport="true"] .qr-portal-section) {
    padding-top: 64px;
    padding-bottom: 72px;
  }

  :global(html[data-liftag-short-viewport="true"] .qr-portal-section .display) {
    font-size: clamp(28px, 8vw, 36px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr-portal-hint {
    display: none;
  }
}
</style>
