<script setup lang="ts">
import type { CoachingFrame } from '~/utils/gymscan/coachingTimeline';
const props = defineProps<{ frame: CoachingFrame; customSrc?: string; paused?: boolean }>();
const emit = defineEmits<{ customError: [] }>();
const video = useTemplateRef<HTMLVideoElement>('video');
const gymVideo = computed(() => props.frame.isOwner && props.frame.owner >= .42);
function syncVideo() {
  if (props.paused || props.frame.reduced || !gymVideo.value || document.hidden) video.value?.pause();
  else video.value?.play().catch(() => {});
}
watch(() => [props.paused, props.frame.reduced, gymVideo.value], syncVideo);
onMounted(() => document.addEventListener('visibilitychange', syncVideo));
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', syncVideo);
  video.value?.pause();
});
</script>
<template>
  <div class="gc-stage">
    <div class="gc-fallback-phone" aria-label="LIFTAG logger with exercise instructions above the set table">
      <span class="gc-fallback-island" />
      <div class="gc-fallback-bar">‹ <span>WORKOUT LOGGER</span> •••</div>
      <h3>EZ-Bar Skullcrusher</h3><p>Flat bench · EZ bar</p>
      <video v-if="customSrc && gymVideo" ref="video" :src="customSrc" controls muted playsinline loop preload="metadata" @loadeddata="syncVideo" @error="emit('customError')" />
      <img v-else src="/assets/gym3d/bench-instruction.webp" width="1080" height="603" alt="EZ-Bar Skullcrusher video guide inside the workout" />
      <strong>{{ gymVideo ? (customSrc ? 'Your gym’s video' : 'Your own video goes here') : 'Included LIFTAG guide' }}</strong>
      <div class="gc-fallback-sets"><span>SET</span><span>KG</span><span>REPS</span><b>1 ✓</b><b>20</b><b>12</b><b>2</b><b>20</b><b>12</b><b>3</b><b>20</b><b>12</b></div>
      <span class="gc-fallback-log">Log set</span>
    </div>
  </div>
</template>
