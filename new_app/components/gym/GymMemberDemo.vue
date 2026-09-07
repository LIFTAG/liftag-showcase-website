<script setup lang="ts">
const props = defineProps<{ step: number; still: boolean; active: boolean; paused: boolean }>();
const emit = defineEmits<{ watch: []; step: [value: number] }>();
const beats = [
  { title: 'Scan the machine. Log the set.', copy: 'The tag opens this machine in LIFTAG.', label: 'Scan → log' },
  { title: 'Watch how to use it.', copy: 'At the flat bench: a real LIFTAG instruction.', label: 'Watch' },
  { title: 'Make it your trainer’s video.', copy: 'Upload your own. Members see it after the scan.', label: 'Make it yours' },
  { title: 'Every set adds to their progress.', copy: 'Log the workout. See what changed.', label: 'See progress' },
];
const visibleBeats = computed(() => beats.map((beat, index) => ({ beat, index })).filter(item => props.still || item.index === props.step));
</script>
<template>
  <div class="gx-member-story" :class="{ 'is-still': still }">
    <article v-for="{ beat, index } in visibleBeats" :key="beat.label" class="gx-product-beat">
      <GymMemberFrame :step="index" :active="active && !paused && (still || step === index)" :reduced="still" @watch="emit('watch')" />
      <div class="gx-beat-caption">
        <p class="gx-protocol">03 / THE MEMBER’S NEXT SET <span>0{{ index + 1 }} / 04</span></p>
        <h2>{{ beat.title }}</h2>
        <p>{{ beat.copy }}</p>
        <NuxtLink to="/get" class="btn-ghost"><HoloPill />Get the app</NuxtLink>
      </div>
    </article>
    <div v-if="!still" class="gx-beat-controls" role="group" aria-label="Replay the member demonstration">
      <button v-for="(beat, index) in beats" :key="beat.label" :aria-pressed="step === index" @click="emit('step', index)"><span>0{{ index + 1 }}</span>{{ beat.label }}</button>
    </div>
  </div>
</template>
