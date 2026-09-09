<script setup lang="ts">
const props = defineProps<{ gymVideo: boolean; customSrc?: string; paused?: boolean; reduced?: boolean }>();
const emit = defineEmits<{ customError: [] }>();
const video = useTemplateRef<HTMLVideoElement>('video');
function syncVideo() {
  if (props.paused || props.reduced || !props.gymVideo || document.hidden) video.value?.pause();
  else video.value?.play().catch(() => {});
}
watch(() => [props.paused, props.reduced, props.gymVideo], syncVideo);
onMounted(() => document.addEventListener('visibilitychange', syncVideo));
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', syncVideo);
  video.value?.pause();
});
</script>
<template>
  <div class="gc-stage">
    <div class="gc-fallback-phone" aria-label="LIFTAG logger with the exercise video on the workout screen">
      <span class="gc-fallback-island" />
      <video
        v-if="customSrc && gymVideo"
        ref="video"
        class="gc-fallback-video"
        :src="customSrc"
        controls
        muted
        playsinline
        loop
        preload="metadata"
        @loadeddata="syncVideo"
        @error="emit('customError')"
      />
      <img
        v-else
        class="gc-fallback-video"
        :class="{ 'is-placeholder': gymVideo }"
        src="/assets/gym3d/bench-instruction.webp"
        width="1080"
        height="603"
        alt="EZ-Bar Skullcrusher video guide inside the workout"
      />
      <h3>EZ-Bar Skullcrusher</h3>
      <p>Flat bench · EZ bar</p>
      <strong>{{ gymVideo ? (customSrc ? 'Your gym’s video' : 'Your gym · preview') : 'Included LIFTAG guide' }}</strong>
      <div class="gc-fallback-sets">
        <b><span>WEIGHT</span>20 kg</b>
        <b><span>REPS</span>12</b>
      </div>
      <span class="gc-fallback-log">Log set</span>
    </div>
  </div>
</template>
