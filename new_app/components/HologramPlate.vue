<script setup lang="ts">
/**
 * Manufactured foil security sticker. A thin physical card, not glass
 * and not a spinning prism rim.
 *
 * Viewing angle is a number. Colour is a function of that number. A
 * second image (QR + exercise name) only reconstructs inside a narrow
 * lobe. The card itself tilts in 3D so the foil reads as a real tag:
 * desktop uses the cursor relative to the plate, phone breakpoints use
 * scroll through the viewport. Neither path re-renders Vue: the loop
 * writes --holo-tilt-x / --holo-tilt-y and CSS does the rest.
 */
import { onMouseEvent, useSharedMouse } from '../composables/useSharedMouse'
import {
  HOLO_AX_WEIGHT,
  HOLO_AY_WEIGHT,
  HOLO_REST_PHASE,
  HOLO_REST_RX_DEG,
  HOLO_REST_RY_DEG,
  HOLO_TILT_RX_DEG,
  HOLO_TILT_RY_DEG,
  HOLO_UNLOCK_HALF,
  HOLO_UNLOCK_PEAK,
  holoPointerTilt,
  holoScrollTilt,
  holoViewportProgress,
} from '~/utils/holoFoil'

const props = withDefaults(defineProps<{
  label?: string
  serial?: string
  /** CSS var prefix published by useLerpVars (gym, scan, …). Fallback only. */
  anglePrefix?: string
  qrSrc?: string
  qrSrcset?: string
}>(), {
  label: 'Cable Lat Pulldown',
  serial: '#042',
  anglePrefix: 'gym',
  qrSrc: '/uploads/qr-code-160.webp',
  qrSrcset: '/uploads/qr-code-112.webp 112w, /uploads/qr-code-160.webp 160w, /uploads/qr-code-224.webp 224w, /uploads/qr-code.webp 400w',
})

const root = ref<HTMLElement | null>(null)
const near = useNearViewport(root, '160px 0px')

const plateStyle = computed(() => ({
  '--holo-ax': `var(--holo-tilt-x, var(--${props.anglePrefix}-mx, 0))`,
  '--holo-ay': `var(--holo-tilt-y, var(--${props.anglePrefix}-my, 0))`,
  '--holo-rest': String(HOLO_REST_PHASE),
  '--holo-peak': String(HOLO_UNLOCK_PEAK),
  '--holo-half': String(HOLO_UNLOCK_HALF),
  '--holo-axw': String(HOLO_AX_WEIGHT),
  '--holo-ayw': String(HOLO_AY_WEIGHT),
  '--holo-rx': String(HOLO_TILT_RX_DEG),
  '--holo-ry': String(HOLO_TILT_RY_DEG),
  '--holo-rest-rx': String(HOLO_REST_RX_DEG),
  '--holo-rest-ry': String(HOLO_REST_RY_DEG),
}))

const faceName = computed(() => props.label.toUpperCase())

const CONVERGE = 0.005
const LERP = 0.06
const VAR_PRECISION = 4

let stopTilt: (() => void) | null = null

onMounted(() => {
  const el = root.value
  if (!el) return

  const phoneMql = window.matchMedia('(max-width: 768px)')
  const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  const val = { x: 0, y: 0 }
  let rafId = 0

  const publish = (x: number, y: number) => {
    el.style.setProperty('--holo-tilt-x', x.toFixed(VAR_PRECISION))
    el.style.setProperty('--holo-tilt-y', y.toFixed(VAR_PRECISION))
  }

  const clearTilt = () => {
    el.style.removeProperty('--holo-tilt-x')
    el.style.removeProperty('--holo-tilt-y')
  }

  const target = () => {
    if (motionMql.matches) return { ax: 0, ay: 0 }
    if (phoneMql.matches) {
      const rect = el.getBoundingClientRect()
      return holoScrollTilt(holoViewportProgress(rect.top, rect.height, window.innerHeight))
    }
    const mouse = useSharedMouse().latest
    if (!mouse.hasPointer) return { ax: 0, ay: 0 }
    return holoPointerTilt(mouse.clientX, mouse.clientY, el.getBoundingClientRect())
  }

  const tick = () => {
    const next = target()
    val.x += (next.ax - val.x) * LERP
    val.y += (next.ay - val.y) * LERP
    const dx = next.ax - val.x
    const dy = next.ay - val.y
    if (Math.abs(dx) < CONVERGE && Math.abs(dy) < CONVERGE) {
      val.x = next.ax
      val.y = next.ay
      publish(val.x, val.y)
      rafId = 0
      return
    }
    publish(val.x, val.y)
    rafId = requestAnimationFrame(tick)
  }

  const wake = () => {
    if (!near.value || motionMql.matches) return
    if (rafId === 0) rafId = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (rafId !== 0) cancelAnimationFrame(rafId)
    rafId = 0
  }

  const onMotionChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      stop()
      val.x = 0
      val.y = 0
      clearTilt()
      return
    }
    wake()
  }

  const onPhoneChange = () => {
    if (motionMql.matches) return
    wake()
  }

  const onScroll = () => {
    if (phoneMql.matches) wake()
  }

  const stopNear = watch(near, (isNear) => {
    if (isNear) wake()
    else stop()
  })

  motionMql.addEventListener('change', onMotionChange)
  phoneMql.addEventListener('change', onPhoneChange)
  window.addEventListener('scroll', onScroll, { passive: true })
  const unsubMouse = onMouseEvent(wake)
  if (near.value && !motionMql.matches) wake()

  stopTilt = () => {
    stop()
    stopNear()
    motionMql.removeEventListener('change', onMotionChange)
    phoneMql.removeEventListener('change', onPhoneChange)
    window.removeEventListener('scroll', onScroll)
    unsubMouse()
    stopTilt = null
  }
})

onBeforeUnmount(() => {
  stopTilt?.()
})
</script>

<template>
  <figure
    ref="root"
    class="holo"
    :style="plateStyle"
    :aria-label="`LIFTAG foil machine tag. ${label} appears when the plate is tilted.`"
  >
    <div class="holo-shadow" aria-hidden="true" />
    <div class="holo-body">
      <div class="holo-edge" aria-hidden="true" />
      <div class="holo-plate">
        <div class="holo-foil" aria-hidden="true" />
        <div class="holo-grain" aria-hidden="true" />
        <div class="holo-mark" aria-hidden="true">LIFTAG</div>

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
        </div>

        <div class="holo-spec" aria-hidden="true" />
        <div class="holo-fresnel" aria-hidden="true" />

        <div class="holo-chrome">
          <span class="holo-brand">LIFTAG</span>
          <span class="holo-serial">{{ serial }}</span>
        </div>
        <div class="holo-foot">TAP OR SCAN</div>
      </div>
      <div class="holo-name" aria-hidden="true">
        <span class="holo-name-layer holo-name-layer--back">{{ faceName }}</span>
        <span class="holo-name-layer holo-name-layer--mid">{{ faceName }}</span>
        <span class="holo-name-layer holo-name-layer--face">{{ faceName }}</span>
      </div>
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
  --holo-glint: calc(abs(var(--holo-ax)) * 0.55 + abs(var(--holo-ay)) * 0.35);
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  perspective: 900px;
  perspective-origin:
    calc(50% + var(--holo-ax) * 8%)
    calc(42% + var(--holo-ay) * 6%);
  transform-style: preserve-3d;
}

.holo-shadow,
.holo-body,
.holo-edge,
.holo-plate {
  position: absolute;
  inset: 0;
}

.holo-shadow {
  inset: 14% 10% 2%;
  border-radius: 18px;
  background: oklch(0.08 0.012 118 / 0.5);
  filter: blur(14px);
  /* Keep the unrotated shadow plane behind every point of the tilted card. */
  transform: translate3d(
    calc(var(--holo-ax) * 8px),
    calc(12px + var(--holo-ay) * 6px),
    -32px
  );
  pointer-events: none;
}

.holo-body {
  transform-style: preserve-3d;
  transform:
    rotateX(calc(var(--holo-rest-rx) * 1deg + var(--holo-ay) * var(--holo-rx) * 1deg))
    rotateY(calc(var(--holo-rest-ry) * 1deg + var(--holo-ax) * var(--holo-ry) * -1deg));
  pointer-events: none;
}

.holo-edge {
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      oklch(0.52 0.04 110) 0%,
      oklch(0.22 0.018 118) 38%,
      oklch(0.11 0.01 118) 100%
    );
  transform: translate3d(
    calc(1px + var(--holo-ax) * 1.6px),
    calc(1.5px + var(--holo-ay) * 1.2px),
    -3px
  );
  box-shadow: 0 0 0 1px oklch(0.58 0.03 110 / 0.28);
}

.holo-plate {
  overflow: hidden;
  border-radius: 16px;
  isolation: isolate;
  background: oklch(0.17 0.014 118);
  transform: translateZ(0.5px);
  box-shadow:
    0 0 0 1px oklch(0.62 0.018 110 / 0.55),
    inset 0 1px 0 oklch(0.48 0.02 110 / 0.45),
    inset 0 -1px 0 oklch(0.1 0.01 118 / 0.7),
    inset calc(var(--holo-ax) * -6px) calc(var(--holo-ay) * -4px) 10px oklch(0.92 0.05 110 / 0.12),
    inset calc(var(--holo-ax) * 5px) calc(var(--holo-ay) * 3px) 8px oklch(0.08 0.01 118 / 0.32),
    0 22px 48px oklch(0.08 0.01 118 / 0.62);
}

.holo-foil,
.holo-grain,
.holo-mark,
.holo-latent,
.holo-name,
.holo-spec,
.holo-fresnel,
.holo-chrome,
.holo-foot {
  position: absolute;
  pointer-events: none;
}

.holo-foil {
  inset: 0;
  background:
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
  opacity: calc(0.06 + var(--holo-face) * 0.16 + var(--holo-glint) * 0.12);
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

.holo-plate::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background: radial-gradient(ellipse 78% 72% at 50% 46%, transparent 42%, oklch(0.12 0.012 118 / 0.55) 100%);
}

.holo-grain {
  inset: 0;
  opacity: 0.28;
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
  color: oklch(0.7 0.02 110 / 0.07);
  opacity: calc(1 - var(--holo-face) * 0.7);
  transform: translate3d(
    calc(var(--holo-ax) * 4px),
    calc(var(--holo-ay) * 3px),
    0
  );
}

.holo-spec {
  inset: 0;
  z-index: 3;
  background: radial-gradient(
    120% 90% at
      calc(42% + var(--holo-ax) * -34%)
      calc(28% + var(--holo-ay) * -26%),
    oklch(0.98 0.02 110 / 0.38) 0%,
    oklch(0.9 0.04 110 / 0.1) 28%,
    transparent 52%
  );
  mix-blend-mode: overlay;
  opacity: calc(0.35 + var(--holo-glint) * 0.55);
}

.holo-fresnel {
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  background: linear-gradient(
    calc(118deg + var(--holo-ax) * 18deg),
    oklch(0.95 0.03 110 / calc(var(--holo-glint) * 0.16)) 0%,
    transparent 36%,
    transparent 62%,
    oklch(0.2 0.02 118 / calc(0.12 + var(--holo-glint) * 0.18)) 100%
  );
  box-shadow:
    inset 0 0 0 1px oklch(0.86 0.04 110 / calc(0.12 + var(--holo-glint) * 0.28));
}

.holo-latent {
  inset: 28px 16px 52px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: var(--holo-face);
}

.holo-qr {
  width: 58%;
  max-width: 104px;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  transform: translate3d(
    calc(var(--holo-ax) * -5px),
    calc(var(--holo-ay) * -4px),
    0
  );
  filter:
    invert(1) contrast(1.22)
    drop-shadow(calc(var(--holo-ax) * -2px) 0 0 rgb(255, 45, 85))
    drop-shadow(calc(var(--holo-ax) * 2px) 0 0 rgb(150, 255, 225));
  mix-blend-mode: screen;
}

.holo-name {
  --name-ex: calc(var(--holo-face) * (3px + var(--holo-glint) * 5px));
  right: 12px;
  bottom: 28px;
  left: 12px;
  z-index: 8;
  display: grid;
  place-items: center;
  opacity: var(--holo-face);
  transform: translate3d(
    calc(var(--holo-ax) * -3px),
    calc(var(--holo-ay) * -2px),
    10px
  );
}

.holo-name-layer {
  grid-area: 1 / 1;
  max-width: 9.4em;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 12px;
  line-height: 1.08;
  letter-spacing: -0.045em;
  text-align: center;
  text-transform: uppercase;
  text-wrap: balance;
}

.holo-name-layer--back {
  color: oklch(0.2 0.03 118);
  transform: translate3d(
    calc(var(--holo-ax) * var(--name-ex)),
    calc(var(--holo-ay) * var(--name-ex) * 0.75),
    0
  );
}

.holo-name-layer--mid {
  color: rgb(204, 255, 0);
  transform: translate3d(
    calc(var(--holo-ax) * var(--name-ex) * 0.5),
    calc(var(--holo-ay) * var(--name-ex) * 0.38),
    0
  );
  opacity: calc(0.35 + var(--holo-glint) * 0.4);
}

.holo-name-layer--face {
  color: oklch(0.97 0.03 110);
  text-shadow:
    calc(var(--holo-ax) * -2px) 0 0 rgb(255, 45, 85),
    calc(var(--holo-ax) * 2px) 0 0 rgb(150, 255, 225),
    calc(var(--holo-ax) * var(--name-ex) * 0.35) calc(var(--holo-ay) * var(--name-ex) * 0.25) 0 oklch(0.55 0.12 118),
    calc(var(--holo-ax) * var(--name-ex) * 0.7) calc(var(--holo-ay) * var(--name-ex) * 0.5) 0 oklch(0.32 0.08 118);
}

.holo-chrome {
  top: 12px;
  right: 12px;
  left: 12px;
  z-index: 5;
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
  z-index: 5;
  font-size: 8px;
  letter-spacing: 0.18em;
}

@media (prefers-reduced-motion: reduce) {
  .holo {
    --holo-reveal: 1;
    perspective: none;
  }

  .holo-body,
  .holo-edge,
  .holo-shadow,
  .holo-mark,
  .holo-latent,
  .holo-qr,
  .holo-name,
  .holo-name-layer {
    transform: none;
  }
}
</style>
