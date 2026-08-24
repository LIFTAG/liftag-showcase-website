<script setup lang="ts">
withDefaults(defineProps<{
  max?: number
  as?: 'h1' | 'h2'
}>(), {
  max: 900,
  as: 'h2',
})
</script>

<template>
  <component
    :is="as"
    class="display reveal plate-title"
    :style="{ fontSize: 'clamp(40px, 6.4vw, 84px)', maxWidth: `${max}px`, color: '#fff' }"
  >
    <span class="plate-wipe"><slot /></span>
  </component>
</template>
