<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: string
  padding?: string
  radius?: string
}>(), {
  size: '260px',
  padding: '18px',
  radius: 'var(--liftag-r-xl)',
})

const panelStyle = computed(() => ({
  '--install-qr-size': props.size,
  '--install-qr-padding': props.padding,
  '--install-qr-radius': props.radius,
}))
</script>

<template>
  <div class="install-qr">
    <div class="install-qr__panel" :style="panelStyle">
      <div class="prism-rim install-qr__rim" aria-hidden="true" />
      <img
        src="/assets/qr/get.svg"
        width="260"
        height="260"
        alt="QR code that opens the LIFTAG install page"
        class="install-qr__code"
      >
      <span class="install-qr__mark" aria-hidden="true">
        <img src="/assets/qr/app-icon.png" width="60" height="60" alt="LIFTAG">
      </span>
    </div>
  </div>
</template>

<style scoped>
.install-qr {
  display: grid;
  place-items: center;
  isolation: isolate;
}

.install-qr__panel {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: content-box;
  width: var(--install-qr-size);
  padding: var(--install-qr-padding);
  border-radius: var(--install-qr-radius);
  background: #fbfdf5;
  box-shadow:
    0 0 0 1px rgba(204, 255, 0, 0.28),
    0 24px 70px rgba(0, 0, 0, 0.55),
    0 0 44px rgba(204, 255, 0, 0.14);
}

.install-qr__rim {
  z-index: -1;
  --prism-inset: 5px;
  --prism-radius: calc(var(--install-qr-radius) + var(--prism-inset));
  --prism-strength: 0.85;
}

.install-qr__code {
  display: block;
  width: 100%;
  height: auto;
}

.install-qr__mark {
  position: absolute;
  display: grid;
  place-items: center;
  width: 23%;
  aspect-ratio: 1;
  border-radius: 24%;
  background: #fbfdf5;
}

.install-qr__mark img {
  display: block;
  width: 86%;
  height: auto;
  border-radius: 22%;
}
</style>
