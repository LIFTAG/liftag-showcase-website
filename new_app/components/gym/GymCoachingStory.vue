<script setup lang="ts">
import type { CoachingState } from '~/utils/gymscan/coachingStage';
const props = defineProps<{ reduced: boolean; enhanced: boolean; customError: number; mediaFailed: boolean }>();
const emit = defineEmits<{ kit: []; change: [state: CoachingState] }>();
const root = useTemplateRef<HTMLElement>('story');
const { frame, ui, selectSource } = useCoachingScroll(root, () => props.reduced);
const { customSrc, customName, fileError, selectVideo, clearVideo, videoError } = useCoachingVideo(() => props.customError);
const paused = shallowRef(false);
const replay = shallowRef(0);
const fileId = useId();
function chooseSource(gym: boolean) { selectSource(gym); paused.value = false; }
function replayTransfer() { replay.value++; }
function previewVideo(event: Event) { if (selectVideo(event)) chooseSource(true); }
watch([frame, paused, customSrc, replay], () => emit('change', {
  frame: frame.value, paused: paused.value, customSrc: customSrc.value, replay: replay.value,
}), { immediate: true });
</script>

<template>
  <div ref="story" class="gc-story" :class="{ 'is-reduced': reduced, 'is-owner': ui.isOwner, 'is-gym-video': ui.isGymVideo, 'is-docked': ui.docked }">
    <div class="gc-sticky">
      <GymCoachingStage v-if="!enhanced || reduced" :gym-video="ui.isGymVideo" :custom-src="customSrc" :paused="paused" :reduced="reduced" @custom-error="videoError" />
      <div class="gc-copy">
        <header class="gc-heading">
          <p class="gc-eyebrow"><span class="gc-chapter-number">{{ ui.isOwner ? '04' : '03' }}</span>{{ ui.isOwner ? 'YOUR GYM' : 'VIDEO GUIDE' }}</p>
          <Transition name="gc-copy" mode="out-in">
            <div :key="ui.isOwner ? 'owner' : 'member'">
              <h2 v-if="ui.isOwner">Your trainer.<br /><em>This machine.</em></h2>
              <h2 v-else>The setup,<br /><em>on the machine.</em></h2>
              <p class="gc-description">{{ ui.isOwner
                ? 'Every tagged machine starts with a LIFTAG guide. Swap it for a clip of your own trainer, filmed on your floor.'
                : 'Scan a tag. The movement plays in the workout, then you log the set.' }}</p>
            </div>
          </Transition>
        </header>
        <div class="gc-controls">
          <div v-if="!ui.isOwner" class="gc-member-actions">
            <a class="gc-link" href="#gyms">Put your trainer on this screen <span aria-hidden="true">↓</span></a>
          </div>
          <div v-else class="gc-owner-actions">
            <div class="gc-switch" role="group" aria-label="Instruction video source">
              <button type="button" :aria-pressed="!ui.isGymVideo" @click="chooseSource(false)">LIFTAG guide</button>
              <button type="button" :aria-pressed="ui.isGymVideo" @click="chooseSource(true)">Your gym</button>
            </div>
            <Transition name="gc-copy" mode="out-in">
              <p :key="ui.isGymVideo ? 'gym' : 'library'" class="gc-result">{{ ui.isGymVideo ? (customSrc ? 'Same tag. Your trainer is what they watch.' : 'Same tag. This screen is waiting for your trainer.') : 'Every tagged machine starts with this library clip.' }}</p>
            </Transition>
            <div class="gc-preview-actions">
              <label class="gc-file-btn" :for="fileId">Preview a clip<input :id="fileId" type="file" accept="video/*" @change="previewVideo" /></label>
              <button v-if="ui.isGymVideo" type="button" class="gc-text-btn" @click="replayTransfer">Replay</button>
              <button v-if="customSrc" type="button" class="gc-text-btn" @click="clearVideo">Remove clip</button>
              <button
                v-if="!reduced && enhanced && customSrc"
                type="button"
                class="gc-text-btn"
                :aria-pressed="paused"
                @click="paused = !paused"
              >{{ paused ? 'Play preview' : 'Pause preview' }}</button>
            </div>
            <p class="gc-file-note" :class="{ 'is-alert': !!fileError }" role="status">{{ fileError || (customName ? `${customName} · stays on this device` : 'Try a clip from your device. Nothing is uploaded.') }}</p>
          </div>
        </div>
      </div>
      <p v-if="mediaFailed && !customSrc" class="gc-media-unavailable" role="status">Video unavailable. Showing the exercise still.</p>
    </div>
    <section id="lifters" class="gc-chapter" aria-label="Video instructions for members" tabindex="-1"><span id="progress" class="gc-anchor" /></section>
    <section id="gyms" class="gc-chapter gc-chapter--owner" aria-label="Add your gym’s own instruction videos" tabindex="-1"><span id="trainers" class="gc-anchor" /></section>
  </div>
</template>

<style src="~/assets/css/gym-coaching.css"></style>
