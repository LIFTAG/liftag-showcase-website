<script setup lang="ts">
import Phone3D from './Phone3D.vue'

const props = withDefaults(defineProps<{
  src?: string
  glow?: boolean
  scale?: number
  tiltDelayMs?: number
  screenTransition?: boolean
  screenTransitionDirection?: 'up' | 'down' | 'left' | 'right'
  style?: Record<string, string>
}>(), {
  glow: false,
  scale: 1,
  tiltDelayMs: 0,
  screenTransition: false,
  screenTransitionDirection: 'up',
})
</script>

<template>
  <div
    class="phone"
    :class="{ 'phone--3d': props.src }"
    :style="{
      transform: `scale(${props.scale})`,
      transformOrigin: 'center',
      animation: props.glow ? 'pulse-glow 4s ease-in-out infinite' : undefined,
      ...props.style,
    }"
  >
    <ClientOnly v-if="props.src">
      <Phone3D
        :screenshot-src="props.src"
        :tilt-delay-ms="props.tiltDelayMs"
        :screen-transition="props.screenTransition"
        :screen-transition-direction="props.screenTransitionDirection"
      />
      <template #fallback>
        <img :src="props.src" alt="LIFTAG screen" />
      </template>
    </ClientOnly>
    <slot v-else />
  </div>
</template>
