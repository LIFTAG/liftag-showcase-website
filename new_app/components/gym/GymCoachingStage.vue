<script setup lang="ts">
import type { CoachingFrame } from '~/utils/gymscan/coachingTimeline'
defineProps<{ frame: CoachingFrame; customSrc?: string }>()
const emit = defineEmits<{ error: [] }>()
</script>
<template>
  <div class="gc-stage"><div class="gc-fallback-phone" aria-label="LIFTAG logger showing a Pivot Leg Press movement guide above the set table">
    <span class="gc-fallback-island" /><div class="gc-fallback-bar">‹ <span>WORKOUT LOGGER</span> •••</div>
    <h3>Pivot Leg Press</h3><p>Leg press · Machine</p>
    <video v-if="frame.isOwner && customSrc" :src="customSrc" controls playsinline preload="metadata" aria-label="Your selected instruction video" @error="emit('error')" />
    <img v-else src="/assets/gym3d/recording/pivot-leg-press-poster.webp" width="720" height="405" loading="lazy" alt="Trainer demonstrating the Pivot Leg Press on the gym’s machine" />
    <strong>{{ frame.isOwner ? 'YOUR GYM · TRAINER INSTRUCTION' : 'MOVEMENT GUIDE' }}</strong>
    <div class="gc-fallback-sets"><span>SET</span><span>KG</span><span>REPS</span><b>1 ✓</b><b>80</b><b>10</b><b>2</b><b>80</b><b>10</b><b>3</b><b>80</b><b>10</b></div><span class="gc-fallback-log">Log set</span>
  </div></div>
</template>
