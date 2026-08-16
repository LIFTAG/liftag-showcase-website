<script setup lang="ts">
/**
 * Manufactured foil security sticker. Not glass, not a spinning prism rim.
 *
 * One rectangle. Viewing angle is a number. Colour is a function of that
 * number. A second image (QR + exercise name) only reconstructs inside a
 * narrow lobe, then settles. Pointer moves never re-render this component:
 * useLerpVars already publishes --<prefix>-mx / --<prefix>-my, and the
 * plate reads them in calc().
 */
import {
  HOLO_AX_WEIGHT,
  HOLO_AY_WEIGHT,
  HOLO_REST_PHASE,
  HOLO_SHEET_SPAN,
  HOLO_SHEET_START,
  HOLO_UNLOCK_HALF,
  HOLO_UNLOCK_PEAK,
} from '~/utils/holoFoil'

const props = withDefaults(defineProps<{
  label?: string
  serial?: string
  live?: boolean
  /** CSS var prefix published by useLerpVars (gym, scan, …). */
  anglePrefix?: string
  qrSrc?: string
  qrSrcset?: string
}>(), {
  label: 'Cable Lat Pulldown',
  serial: '#042',
  live: false,
  anglePrefix: 'gym',
  qrSrc: '/uploads/qr-code-160.webp',
  qrSrcset: '/uploads/qr-code-112.webp 112w, /uploads/qr-code-160.webp 160w, /uploads/qr-code-224.webp 224w, /uploads/qr-code.webp 400w',
})

const plateStyle = computed(() => ({
  '--holo-ax': `var(--${props.anglePrefix}-mx, 0)`,
  '--holo-ay': `var(--${props.anglePrefix}-my, 0)`,
  '--holo-rest': String(HOLO_REST_PHASE),
  '--holo-peak': String(HOLO_UNLOCK_PEAK),
  '--holo-half': String(HOLO_UNLOCK_HALF),
  '--holo-axw': String(HOLO_AX_WEIGHT),
  '--holo-ayw': String(HOLO_AY_WEIGHT),
  '--holo-sheet-start': String(HOLO_SHEET_START),
  '--holo-sheet-span': String(HOLO_SHEET_SPAN),
}))

const faceName = computed(() => props.label.toUpperCase())
</script>

<template>
  <figure
    class="holo"
    :class="{ 'is-live': live }"
    :style="plateStyle"
    :aria-label="`LIFTAG foil machine tag. ${label} appears when the plate is tilted.`"
  >
    <div class="holo-plate">
      <div class="holo-foil" aria-hidden="true" />
      <div class="holo-grain" aria-hidden="true" />
      <div class="holo-mark" aria-hidden="true">LIFTAG</div>

      <div class="holo-sheet holo-sheet--cyan" aria-hidden="true" />
      <div class="holo-sheet holo-sheet--core" aria-hidden="true" />
      <div class="holo-sheet holo-sheet--red" aria-hidden="true" />

      <div class="holo-latent">
        <img
          class="holo-qr"
          :src="qrSrc"
          :srcset="qrSrcset"
          sizes="132px"
          alt=""
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
        >
        <div class="holo-name" aria-hidden="true">{{ faceName }}</div>
      </div>

      <div class="holo-chrome">
        <span class="holo-brand">LIFTAG</span>
        <span class="holo-serial">{{ serial }}</span>
      </div>
      <div class="holo-foot">TAP OR SCAN</div>
    </div>
  </figure>
</template>

<style scoped>
.holo {
  --holo-phase: calc(
    var(--holo-rest) + var(--holo-ax) * var(--holo-axw)
    + var(--holo-ay) * var(--holo-ayw) + var(--holo-demo, 0)
  );
  --holo-lobe: max(0, 1 - abs(var(--holo-phase) - var(--holo-peak)) / var(--holo-half));
  --holo-face: max(var(--holo-reveal, 0), var(--holo-lobe));
  --holo-travel: calc((var(--holo-phase) - var(--holo-sheet-start)) / var(--holo-sheet-span));
  width: 100%;
  height: 100%;
  margin: 0;
}

.holo-plate {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  isolation: isolate;
  background: oklch(0.17 0.014 118);
  box-shadow:
    0 0 0 1px oklch(0.62 0.018 110 / 0.55),
    inset 0 1px 0 oklch(0.48 0.02 110 / 0.45),
    inset 0 -1px 0 oklch(0.1 0.01 118 / 0.7),
    0 22px 48px oklch(0.08 0.01 118 / 0.62);
}

.holo-foil,
.holo-grain,
.holo-mark,
.holo-sheet,
.holo-latent,
.holo-chrome,
.holo-foot {
  position: absolute;
  pointer-events: none;
}

.holo-foil {
  inset: 0;
  background:
    linear-gradient(165deg, oklch(0.28 0.02 118 / 0.55), transparent 42%),
    repeating-linear-gradient(
      108deg,
      oklch(0.22 0.016 118 / 0.18) 0 1px,
      transparent 1px 3px
    ),
    linear-gradient(180deg, oklch(0.2 0.016 118), oklch(0.14 0.012 118));
}

.holo-foil::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background: linear-gradient(
    118deg,
    rgb(150, 255, 225) 0%,
    rgb(204, 255, 0) 42%,
    rgb(255, 246, 190) 62%,
    rgb(255, 178, 30) 80%,
    rgb(255, 45, 85) 100%
  );
  background-size: 240% 100%;
  background-position: calc(var(--holo-phase) * 100%) 50%;
  mix-blend-mode: overlay;
}

.holo-grain {
  inset: 0;
  opacity: 0.22;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23g)'/></svg>");
  background-size: 160px 160px;
  mix-blend-mode: overlay;
}

.holo-mark {
  inset: 18% 8% 38%;
  display: grid;
  place-items: center;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 34px;
  letter-spacing: -0.06em;
  text-transform: uppercase;
  color: oklch(0.72 0.03 110 / 0.16);
  opacity: calc(0.9 - var(--holo-face) * 0.55);
}

.holo-sheet {
  top: -28%;
  bottom: -28%;
  width: 46%;
  left: 0;
  transform: translate3d(calc(var(--holo-travel) * 210% - 70%), 0, 0) rotate(18deg);
  mix-blend-mode: plus-lighter;
  will-change: transform;
}

.holo-sheet--core {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(150, 255, 225) 18%,
    rgb(204, 255, 0) 42%,
    rgb(255, 246, 190) 56%,
    rgb(255, 178, 30) 72%,
    rgb(255, 45, 85) 86%,
    transparent 100%
  );
  opacity: 0.72;
}

.holo-sheet--core::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -18deg,
    transparent 0 1px,
    oklch(0.95 0.04 110 / 0.14) 1px 2px
  );
}

.holo-sheet--cyan {
  width: 38%;
  background: linear-gradient(90deg, transparent, rgb(150, 255, 225), transparent);
  opacity: 0.38;
  transform: translate3d(
    calc(var(--holo-travel) * 210% - 74% + var(--holo-ax) * -6px),
    0,
    0
  ) rotate(18deg);
}

.holo-sheet--red {
  width: 38%;
  background: linear-gradient(90deg, transparent, rgb(255, 45, 85), transparent);
  opacity: 0.32;
  transform: translate3d(
    calc(var(--holo-travel) * 210% - 66% + var(--holo-ax) * 6px),
    0,
    0
  ) rotate(18deg);
}

.holo-latent {
  inset: 28px 16px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  opacity: var(--holo-face);
}

.holo-qr {
  width: 72%;
  max-width: 124px;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  filter: invert(1) contrast(1.18);
  mix-blend-mode: screen;
}

.holo-name {
  max-width: 100%;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 13px;
  line-height: 1.05;
  letter-spacing: -0.04em;
  text-align: center;
  text-transform: uppercase;
  color: oklch(0.94 0.09 118);
  text-shadow:
    calc(var(--holo-ax) * -2.4px) 0 rgb(255, 45, 85),
    calc(var(--holo-ax) * 2.4px) 0 rgb(150, 255, 225);
  mix-blend-mode: plus-lighter;
}

.holo-chrome {
  top: 12px;
  right: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.holo-brand,
.holo-serial,
.holo-foot {
  font-family: var(--liftag-font-mono);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: oklch(0.78 0.03 110 / 0.38);
}

.holo-brand {
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-size: 11px;
  letter-spacing: -0.04em;
}

.holo-serial {
  font-size: 8px;
}

.holo-foot {
  right: 12px;
  bottom: 12px;
  left: 12px;
  font-size: 8px;
  letter-spacing: 0.18em;
}

.holo.is-live {
  animation: holoUnlock 8s var(--ease-out-expo) infinite;
}

@keyframes holoUnlock {
  0%, 8% {
    --holo-demo: 0;
    --holo-reveal: 0;
  }
  24% {
    --holo-demo: 0.1;
    --holo-reveal: 0;
  }
  36% {
    --holo-demo: 0.22;
    --holo-reveal: 0.4;
  }
  44%, 68% {
    --holo-demo: 0.2;
    --holo-reveal: 1;
  }
  84% {
    --holo-demo: 0.06;
    --holo-reveal: 0.2;
  }
  100% {
    --holo-demo: 0;
    --holo-reveal: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .holo,
  .holo.is-live {
    animation: none;
    --holo-demo: 0.22;
    --holo-reveal: 0.92;
  }

  .holo-sheet {
    will-change: auto;
  }
}
</style>
