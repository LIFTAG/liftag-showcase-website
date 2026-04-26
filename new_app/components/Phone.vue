<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  glow?: boolean
  scale?: number
  style?: Record<string, string>
}>(), {
  glow: false,
  scale: 1,
})
</script>

<template>
  <div
    class="phone"
    :style="{
      transform: `scale(${props.scale})`,
      transformOrigin: 'center',
      animation: props.glow ? 'pulse-glow 4s ease-in-out infinite' : undefined,
      ...props.style,
    }"
  >
    <img v-if="props.src" :src="props.src" alt="LIFTAG screen" />
    <slot />
  </div>
</template>
