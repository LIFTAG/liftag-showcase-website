<script setup lang="ts">
/**
 * Outline hologram overlay. Drop inside a rounded button; the parent is the
 * mesh bounds and the pointer target. The mesh clips to the host radius so
 * stadium CTAs and square chips share one overlay. Class `is-holo` lives on
 * the canvas so Vue class patches on the button cannot wipe the fade-out flag.
 */
const holoEl = useTemplateRef<HTMLCanvasElement>('holoEl')
const { holoOn } = useHoloPill(holoEl)
</script>

<template>
  <canvas
    ref="holoEl"
    class="holo-pill-canvas"
    :class="{ 'is-holo': holoOn }"
    aria-hidden="true"
  />
</template>
