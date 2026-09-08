<script setup lang="ts">
import type { CoachingState } from '~/utils/gymscan/coachingStage';
const props = defineProps<{ reduced: boolean; enhanced: boolean; customError: number; mediaFailed: boolean }>();
const emit = defineEmits<{ kit: []; change: [state: CoachingState] }>();
const root = useTemplateRef<HTMLElement>('story');
const { frame, selectSource, playRewrite } = useCoachingScroll(root, () => props.reduced);
const { customSrc, customName, fileError, selectVideo, clearVideo, videoError } = useCoachingVideo(() => props.customError);
const paused = shallowRef(false);
const replay = shallowRef(0);
const fileId = useId();
const isGymVideo = computed(() => frame.value.isOwner && frame.value.owner >= .42);
const docked = computed(() => frame.value.isOwner && frame.value.owner > .88);
const progressStyle = computed(() => ({ '--gc-progress': String(frame.value.isOwner ? frame.value.owner : frame.value.member) }));
function chooseSource(gym: boolean) { selectSource(gym); paused.value = false; }
function replayTransfer() { replay.value++; playRewrite(); }
function previewVideo(event: Event) { if (selectVideo(event)) chooseSource(true); }
watch([frame, paused, customSrc, replay], () => emit('change', {
  frame: frame.value, paused: paused.value, customSrc: customSrc.value, replay: replay.value,
}), { immediate: true });
</script>

<template>
  <div ref="story" class="gc-story" :class="{ 'is-reduced': reduced, 'is-owner': frame.isOwner, 'is-gym-video': isGymVideo, 'is-docked': docked }" :style="progressStyle">
    <div class="gc-sticky">
      <GymCoachingStage v-if="!enhanced || reduced" :frame="frame" :custom-src="customSrc" :paused="paused" @custom-error="videoError" />
      <header class="gc-heading">
        <p class="gc-eyebrow"><span class="gc-chapter-number">{{ frame.isOwner ? '04' : '03' }}</span>{{ frame.isOwner ? 'YOUR GYM, ON SCREEN' : 'FROM SCAN TO FIRST REP' }}</p>
        <Transition name="gc-copy" mode="out-in">
          <div :key="frame.isOwner ? 'owner' : 'member'">
            <h2 v-if="frame.isOwner">Your trainer.<br /><em>On every scan.</em></h2>
            <h2 v-else>Watch it.<br /><em>Then lift.</em></h2>
            <p class="gc-description">{{ frame.isOwner
              ? 'Replace the included guide with a video of your own trainer, on your own equipment.'
              : 'Scan the machine. A video shows you the movement, right inside your workout.' }}</p>
          </div>
        </Transition>
      </header>
      <div class="gc-screen-label" aria-hidden="true"><span class="gc-label-line" /><span>{{ docked ? 'READY ON THE NEXT SCAN' : 'ON YOUR MEMBER’S PHONE' }}</span></div>
      <div class="gc-bottom">
        <div v-if="!frame.isOwner" class="gc-member-actions">
          <p class="gc-takeaway"><span class="gc-play-symbol" aria-hidden="true">▷</span>Watch the guide.<br /><strong>Start your set with confidence.</strong></p>
          <a class="gc-link" href="#gyms">Put your own trainer on screen <span aria-hidden="true">↓</span></a>
        </div>
        <div v-else class="gc-owner-actions">
          <div class="gc-source-switch" role="group" aria-label="Compare instruction videos">
            <button :aria-pressed="!isGymVideo" @click="chooseSource(false)"><span class="gc-source-icon" aria-hidden="true">▷</span>Included guide</button>
            <span class="gc-switch-arrow" aria-hidden="true">→</span>
            <button :aria-pressed="isGymVideo" @click="chooseSource(true)"><span class="gc-source-icon" aria-hidden="true">▷</span>Your gym’s video</button>
          </div>
          <p class="gc-result">{{ isGymVideo ? 'Members scan the same tag. Now they learn from your team.' : 'Every machine starts with a guide from the LIFTAG library.' }}</p>
          <div class="gc-preview-actions">
            <label class="gc-file" :for="fileId"><span aria-hidden="true">＋</span> Preview your own video<input :id="fileId" type="file" accept="video/*" @change="previewVideo" /></label>
            <button class="gc-replay" @click="replayTransfer"><span aria-hidden="true">↻</span> Replay</button>
            <button v-if="customSrc" class="gc-replay" @click="clearVideo">Remove</button>
          </div>
          <p class="gc-file-note" role="status">{{ fileError || (customName ? `${customName} · stays on this device` : 'Try a clip from your device. Nothing is uploaded.') }}</p>
        </div>
        <button v-if="!reduced && enhanced" class="gc-pause" :aria-pressed="paused" :aria-label="paused ? 'Play video preview' : 'Pause video preview'" @click="paused = !paused">{{ paused ? '▷' : 'Ⅱ' }}</button>
      </div>
      <p v-if="mediaFailed && !customSrc" class="gc-media-unavailable" role="status">Video unavailable. Showing the exercise preview.</p>
      <div class="gc-progress" aria-hidden="true"><span /></div>
    </div>
    <section id="lifters" class="gc-chapter" aria-label="Video instructions for members" tabindex="-1"><span id="progress" class="gc-anchor" /></section>
    <section id="gyms" class="gc-chapter gc-chapter--owner" aria-label="Add your gym’s own instruction videos" tabindex="-1"><span id="trainers" class="gc-anchor" /></section>
  </div>
</template>

<style src="~/assets/css/gym-coaching.css"></style>
