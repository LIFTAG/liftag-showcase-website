<script setup lang="ts">
import type { CoachingState } from '~/utils/gymscan/coachingStage'
import { coachingPose } from '~/utils/gymscan/coachingTimeline'
const props = defineProps<{ reduced: boolean; enhanced: boolean; customError: number; mediaFailed: boolean }>()
const emit = defineEmits<{ kit: []; change: [state: CoachingState] }>()
const root = useTemplateRef<HTMLElement>('story')
const { frame } = useCoachingScroll(root, () => props.reduced)
const paused = shallowRef(false), customSrc = shallowRef(''), customName = shallowRef(''), fileError = shallowRef(''), replay = shallowRef(0)
const fileId = useId()
const pose = computed(() => coachingPose(frame.value))
const stageNote = computed(() => pose.value.docked > .6 ? (customSrc.value ? 'YOUR VIDEO · PREVIEW' : 'TRAINER INSTRUCTION · READY') : pose.value.transfer > .1 ? 'ADDING TO YOUR LOGGER' : pose.value.recording > .1 ? 'RECORDING YOUR INSTRUCTION' : 'PIVOT LEG PRESS · MOVEMENT GUIDE')
const fileNote = computed(() => fileError.value || (customName.value ? `${customName.value} · stays on this device` : 'Your file stays on this device.'))
function clearVideo() { if (customSrc.value) URL.revokeObjectURL(customSrc.value); customSrc.value = ''; customName.value = '' }
function replayMovement() { replay.value++; paused.value = false }
function restoreDemo() { clearVideo(); fileError.value = ''; replayMovement() }
function selectVideo(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('video/')) { fileError.value = 'Choose an MP4, WebM, or MOV video.'; input.value = ''; return }
  clearVideo(); customSrc.value = URL.createObjectURL(file); customName.value = file.name; fileError.value = ''; replayMovement(); input.value = ''
  if (!props.reduced) {
    const owner = root.value?.querySelector<HTMLElement>('#gyms')
    if (owner) window.scrollTo({ top: scrollY + owner.getBoundingClientRect().top + owner.offsetHeight - innerHeight, behavior: 'smooth' })
  }
}
function videoError() { clearVideo(); fileError.value = 'This browser cannot play that file. Try MP4 or WebM.' }
watch(() => props.customError, videoError)
watch([frame, paused, customSrc, replay], () => emit('change', { frame: frame.value, paused: paused.value, customSrc: customSrc.value, replay: replay.value }), { immediate: true })
onBeforeUnmount(clearVideo)
</script>

<template>
  <div ref="story" class="gc-story" :class="{ 'is-reduced': reduced }">
    <div v-if="!reduced" class="gc-visual">
      <GymCoachingStage v-if="!enhanced" :frame="frame" :custom-src="customSrc" @error="videoError" />
      <p v-if="mediaFailed && !customSrc" class="gc-media-unavailable" role="status">Video unavailable. You can still see the movement guide below.</p>
      <div class="gc-stage-note" aria-hidden="true"><span class="gc-status-dot" />{{ stageNote }}</div>
    </div>
    <section id="lifters" class="gc-chapter gc-chapter--member" aria-labelledby="gc-member-title">
      <span id="progress" class="gc-anchor" /><GymCoachingStage v-if="reduced" :frame="{ member: 1, owner: 0, isOwner: false, reduced: true }" />
      <div class="gc-copy-frame"><div class="gc-copy">
        <p class="gx-protocol">03 / GUIDANCE BETWEEN SETS</p>
        <h2 id="gc-member-title">The right movement.<br /><em>Right on the machine.</em></h2>
        <p>Scan the Pivot Leg Press to see its movement guide in the logger, exactly where the next set begins.</p>
        <button v-if="!reduced" class="gc-text-button" :aria-pressed="paused" @click="paused = !paused">{{ paused ? '▷ Play movement' : 'Ⅱ Pause movement' }}</button>
      </div><a class="gc-next gx-protocol" href="#gyms">SEE HOW IT GETS THERE <span>↓</span></a></div>
    </section>
    <section id="gyms" class="gc-chapter gc-chapter--owner" aria-labelledby="gc-owner-title">
      <span id="trainers" class="gc-anchor" /><GymCoachingStage v-if="reduced" :frame="{ member: 1, owner: 1, isOwner: true, reduced: true }" :custom-src="customSrc" @error="videoError" />
      <div class="gc-copy-frame"><div class="gc-copy">
        <p class="gx-protocol">04 / YOUR EQUIPMENT · YOUR EXPERTISE</p>
        <h2 id="gc-owner-title">Film it once.<br /><em>Guide every member.</em></h2>
        <p>Your trainers demonstrate the movement on your own equipment. LIFTAG puts that guidance into every member’s logger.</p>
        <div class="gc-actions">
          <label class="btn-ghost gc-file" :for="fileId">Preview your video<input :id="fileId" type="file" accept="video/*" @change="selectVideo" /></label>
          <button v-if="!reduced" class="btn-ghost gc-replay" @click="replayMovement">Replay movement</button>
          <button v-if="customSrc" class="gc-restore" @click="restoreDemo">Restore demo</button>
        </div>
        <button v-if="!reduced" class="gc-owner-pause" :aria-pressed="paused" :aria-label="paused ? 'Play movement preview' : 'Pause movement preview'" @click="paused = !paused">{{ paused ? '▷' : 'Ⅱ' }}</button>
        <p class="gc-file-note" role="status">{{ fileNote }}</p>
      </div><a class="gc-next gx-protocol" href="#kit" @click="emit('kit')">REQUEST YOUR FREE KIT <span>↗</span></a></div>
    </section>
  </div>
</template>
