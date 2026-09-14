<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
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
    <div class="gc-fallback-phone" :aria-label="t('coaching.fallbackLabel')">
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
        :alt="t('coaching.fallbackAlt')"
      />
      <h3>{{ t('canvas.exercise') }}</h3>
      <p>{{ t('member.equipment') }}</p>
      <strong>{{ gymVideo ? (customSrc ? t('coaching.gymVideo') : t('coaching.gymPreview')) : t('coaching.included') }}</strong>
      <div class="gc-fallback-sets">
        <b><span>{{ t('canvas.weight') }}</span>20 kg</b>
        <b><span>{{ t('canvas.reps') }}</span>12</b>
      </div>
      <span class="gc-fallback-log">{{ t('coaching.log') }}</span>
    </div>
  </div>
</template>
