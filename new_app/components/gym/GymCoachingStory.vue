<script setup lang="ts">
import type { CoachingState } from '~/utils/gymscan/coachingStage';
const props = defineProps<{ reduced: boolean; enhanced: boolean; customError: number; mediaFailed: boolean }>();
const emit = defineEmits<{ kit: []; change: [state: CoachingState] }>();
const root = useTemplateRef<HTMLElement>('story');
const { frame, playRewrite: fillRewrite } = useCoachingScroll(root, () => props.reduced);
const paused = shallowRef(false);
const customSrc = shallowRef('');
const customName = shallowRef('');
const fileError = shallowRef('');
const replay = shallowRef(0);
const fileId = useId();
const rewritten = computed(() => frame.value.owner > .55);
const stageNote = computed(() => {
  if (!frame.value.isOwner || !rewritten.value) return 'INSTRUCTIONS, RIGHT IN THE LOGGER.';
  return customSrc.value ? 'YOUR VIDEO. THEIR NEXT SET.' : 'A SLOT FOR YOUR TRAINER.';
});
const fileNote = computed(() => {
  if (fileError.value) return fileError.value;
  if (customName.value) return `${customName.value} · preview stays on this device`;
  return rewritten.value
    ? 'Trainer slot is in the logger. Preview your own, locally.'
    : 'Sample clip shown. Preview your own, locally.';
});
function clearVideo() {
  if (customSrc.value) URL.revokeObjectURL(customSrc.value);
  customSrc.value = ''; customName.value = '';
}
function playRewrite() {
  replay.value++;
  fillRewrite();
}
function selectVideo(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) { fileError.value = 'Choose a video file, such as MP4 or WebM.'; input.value = ''; return; }
  clearVideo();
  customSrc.value = URL.createObjectURL(file);
  customName.value = file.name;
  fileError.value = '';
  paused.value = false;
  playRewrite();
  input.value = '';
}
function videoError() { clearVideo(); fileError.value = 'This browser can’t play that file. Try an MP4 or WebM video.'; }
watch(() => props.customError, videoError);
watch([frame, paused, customSrc, replay], () => emit('change', { frame: frame.value, paused: paused.value, customSrc: customSrc.value, replay: replay.value }), { immediate: true });
onBeforeUnmount(clearVideo);
</script>

<template>
  <div ref="story" class="gc-story" :class="{ 'is-reduced': reduced }">
    <div v-if="!reduced" class="gc-visual">
      <GymCoachingStage v-if="!enhanced" :frame="frame" />
      <p v-if="mediaFailed && !customSrc" class="gc-media-unavailable" role="status">Instruction preview unavailable. Showing the exercise still.</p>
      <div class="gc-stage-note" aria-hidden="true"><span class="gc-status-dot" />{{ stageNote }}</div>
    </div>
    <section id="lifters" class="gc-chapter" aria-labelledby="gc-member-title" tabindex="-1">
      <span id="progress" class="gc-anchor" />
      <GymCoachingStage v-if="reduced" :frame="{ member: 0, owner: 0, isOwner: false, reduced: true }" />
      <div class="gc-copy-frame">
        <div class="gc-copy">
          <p class="gx-protocol"><GymEntry mode="holo" row>03 / GUIDANCE BETWEEN SETS</GymEntry></p>
          <h2 id="gc-member-title">
            <GymEntry :delay="70">Watch. </GymEntry><br /><GymEntry from="right" lime :delay="150"><em>Then lift.</em></GymEntry>
          </h2>
          <p><GymEntry mode="holo" :delay="230">Exercise instructions, right in the logger.<br /> Watch the movement. Log your next set.</GymEntry></p>
          <button v-if="!reduced" class="gc-text-button" :aria-pressed="paused" @click="paused = !paused">{{ paused ? '▷ Play instructions' : 'Ⅱ Pause instructions' }}</button>
        </div>
        <a class="gc-next gx-protocol" href="#gyms"><GymEntry mode="holo" row :delay="300">MAKE IT YOURS</GymEntry> <span>↓</span></a>
      </div>
    </section>
    <section id="gyms" class="gc-chapter gc-chapter--owner" aria-labelledby="gc-owner-title" tabindex="-1">
      <span id="trainers" class="gc-anchor" />
      <GymCoachingStage v-if="reduced" :frame="{ member: 1, owner: 1, isOwner: true, reduced: true }" />
      <div class="gc-copy-frame">
        <div class="gc-copy">
          <p class="gx-protocol"><GymEntry mode="holo" row>04 / MADE FOR YOUR GYM</GymEntry></p>
          <h2 id="gc-owner-title">
            <GymEntry :delay="70">Your gym. </GymEntry><br /><GymEntry from="right" lime :delay="150"><em>Your instructions.</em></GymEntry>
          </h2>
          <p><GymEntry mode="holo" :delay="230">Replace our video with your trainer’s.<br /> Your equipment. Your expertise. Every member.</GymEntry></p>
          <div class="gc-actions">
            <label v-if="!reduced" class="btn-primary gc-file" :for="fileId">Try your own video<input :id="fileId" type="file" accept="video/*" @change="selectVideo" /></label>
            <button v-if="!reduced" class="btn-ghost gc-replay" @click="playRewrite">{{ rewritten ? 'Replay the replacement' : 'Watch the replacement' }}</button>
            <a v-else class="btn-primary" href="#kit" @click="emit('kit')">Bring LIFTAG to your gym</a>
          </div>
          <button v-if="!reduced" class="gc-owner-pause" :aria-pressed="paused" :aria-label="paused ? 'Play video preview' : 'Pause video preview'" @click="paused = !paused">{{ paused ? '▷' : 'Ⅱ' }}</button>
          <p v-if="!reduced" class="gc-file-note" role="status">{{ fileNote }}</p>
        </div>
        <a class="gc-next gx-protocol" href="#kit" @click="emit('kit')"><GymEntry mode="holo" row :delay="300">CONNECT YOUR GYM</GymEntry> <span>↗</span></a>
      </div>
    </section>
  </div>
</template>

<style src="~/assets/css/gym-coaching.css"></style>
