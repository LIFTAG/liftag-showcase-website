<script setup lang="ts">
/**
 * The frame every scannable LIFTAG QR code sits in: an off-white panel, the
 * prism rim spinning behind it and the app icon in the middle. The code goes in
 * the default slot. The icon hides the code's centre, so the code needs high
 * error correction.
 */
const props = withDefaults(defineProps<{
  size?: string
  padding?: string
  radius?: string
  /** Icon side, as a length or a percentage of the panel's padding box. */
  markSize?: string
}>(), {
  size: '260px',
  padding: '18px',
  radius: 'var(--liftag-r-xl)',
  markSize: '23%',
})

const panelStyle = computed(() => ({
  '--qr-frame-size': props.size,
  '--qr-frame-padding': props.padding,
  '--qr-frame-radius': props.radius,
  '--qr-frame-mark': props.markSize,
}))
</script>

<template>
  <div class="qr-frame">
    <div class="qr-frame__panel" :style="panelStyle">
      <div class="prism-rim qr-frame__rim" aria-hidden="true" />
      <slot />
      <span class="qr-frame__mark" aria-hidden="true">
        <img src="/assets/qr/app-icon.png" width="60" height="60" alt="LIFTAG">
      </span>
    </div>
  </div>
</template>

<style scoped>
.qr-frame {
  display: grid;
  place-items: center;
  isolation: isolate;
}

.qr-frame__panel {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: content-box;
  width: var(--qr-frame-size);
  padding: var(--qr-frame-padding);
  border-radius: var(--qr-frame-radius);
  background: #fbfdf5;
  box-shadow:
    0 0 0 1px rgba(204, 255, 0, 0.28),
    0 24px 70px rgba(0, 0, 0, 0.55),
    0 0 44px rgba(204, 255, 0, 0.14);
}

.qr-frame__rim {
  z-index: -1;
  --prism-inset: 5px;
  --prism-radius: calc(var(--qr-frame-radius) + var(--prism-inset));
  --prism-strength: 0.85;
}

.qr-frame__mark {
  position: absolute;
  display: grid;
  place-items: center;
  width: var(--qr-frame-mark);
  aspect-ratio: 1;
  border-radius: 24%;
  background: #fbfdf5;
}

.qr-frame__mark img {
  display: block;
  width: 86%;
  height: auto;
  border-radius: 22%;
}
</style>
