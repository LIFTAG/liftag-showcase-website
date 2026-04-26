<script setup lang="ts">
withDefaults(defineProps<{
  max?: number
}>(), {
  max: 900,
})
</script>

<template>
  <h2
    class="display reveal"
    :style="{ fontSize: 'clamp(40px, 6.4vw, 84px)', maxWidth: `${max}px`, color: '#fff' }"
  >
    <slot />
  </h2>
</template>
