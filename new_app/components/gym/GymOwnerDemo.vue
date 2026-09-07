<script setup lang="ts">
import { gymEquipment, type GymEquipment } from '~/utils/gymscan/equipment';
const props = defineProps<{ selected: GymEquipment | null; step: number; still: boolean }>();
const emit = defineEmits<{ select: [value: GymEquipment | null]; watch: []; kit: []; step: [value: number] }>();
const beats = [
  { title: 'Your gym. On their map.', copy: 'People can look inside before they walk in.', label: 'Find your gym' },
  { title: 'Let them see what’s inside.', copy: 'Your actual machines, ready to explore.', label: 'The machines' },
  { title: 'A gym they can get to know.', copy: 'Your trainers. Your hours. Your reviews.', label: 'Your people' },
  { title: 'AI plans for this floor.', copy: 'A workout on the machines you actually have.', label: 'Plan a workout' },
];
const exercises = ['Leg press', 'Incline push-up', 'Cable row', 'Treadmill walk'];
const visibleBeats = computed(() => beats.map((beat, index) => ({ beat, index })).filter(item => props.still || item.index === props.step));
</script>
<template>
  <div class="gx-owner-story" :class="{ 'is-still': still }">
    <article v-for="{ beat, index } in visibleBeats" :key="beat.label" class="gx-owner-beat" :class="`gx-owner-beat--${index}`">
      <GymDiscovery v-if="index === 0 || index === 2" :inside="index === 2" />
      <template v-else>
        <div v-if="index === 1 && !still" class="gx-listing-leaf" aria-hidden="true"><img src="/assets/screens/gym-detail-560.webp" width="560" height="1212" alt="" /></div>
        <img v-if="still" class="gx-owner-floor-still" src="/assets/gym3d/equipment/floor.webp" width="1100" height="850" alt="Illustrative floor with the four machines listed in the workout" loading="lazy" />
        <div class="gx-floor-identity gx-protocol"><span class="gx-dot" /> YOUR GYM <span>INSIDE THE LISTING</span></div>
        <div v-if="index === 1" class="gx-floor-selection" role="group" aria-label="Explore the machines in this gym">
          <button v-for="(machine, i) in gymEquipment" :key="machine.id" :aria-pressed="selected === machine.id" @click="emit('select', machine.id)">
            <span class="gx-protocol">0{{ i + 1 }}</span><img :src="machine.poster" width="900" height="900" alt="" loading="lazy" /><span>{{ machine.name }}</span><i>↗</i>
          </button>
          <button class="gx-floor-reset" :disabled="!selected" @click="emit('select', null)">↖ Whole floor</button>
          <button v-if="selected === 'flat-bench'" class="btn-ghost gx-watch" @click="emit('watch')"><HoloPill />Watch real bench instructions</button>
        </div>
        <div v-if="index === 3" class="gx-plan-stations" aria-label="Equipment used by the example plan">
          <div v-for="machine in gymEquipment" :key="machine.id"><img :src="machine.poster" width="900" height="900" :alt="machine.name" loading="lazy" /><span aria-hidden="true">→</span></div>
        </div>
        <div v-if="index === 3" class="gx-workout">
          <p class="gx-workout-request">“Build a workout for this gym.”</p>
          <div class="gx-workout-input gx-protocol">4 MACHINES ON THIS FLOOR <span>↓</span></div>
          <ol aria-label="Illustrative equipment-matched workout">
            <li v-for="(machine, i) in gymEquipment" :key="machine.id" :style="{ '--station': i }">
              <button :aria-pressed="selected === machine.id" @click="emit('select', machine.id)"><img :src="machine.poster" width="900" height="900" alt="" loading="lazy" /><span><small>{{ machine.name }}</small>{{ exercises[i] }}</span><b aria-label="Equipment available">✓</b></button>
            </li>
          </ol>
          <p class="gx-workout-result">Your equipment → their workout.</p>
          <small>Example plan · illustrative layout</small>
        </div>
      </template>
      <div class="gx-owner-caption">
        <p class="gx-protocol">04 / YOUR GYM IN LIFTAG <span>0{{ index + 1 }} / 04</span></p>
        <h2>{{ beat.title }}</h2><p>{{ beat.copy }}</p>
        <p v-if="index === 2" class="gx-owner-planning">Choose a gym. Meet its trainers.<br />Plan a routine before you arrive.</p>
        <a v-if="index === 3" class="btn-primary" href="#kit" @click="emit('kit')">Put your gym in LIFTAG</a>
        <small v-if="index === 1" class="gx-floor-note">Illustrative gym layout</small>
      </div>
    </article>
    <div v-if="!still" class="gx-beat-controls" role="group" aria-label="Replay the gym demonstration"><button v-for="(beat, index) in beats" :key="beat.label" :aria-pressed="step === index" @click="emit('step', index)"><span>0{{ index + 1 }}</span>{{ beat.label }}</button></div>
  </div>
</template>
