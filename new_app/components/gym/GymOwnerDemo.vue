<script setup lang="ts">
import { gymEquipment, type GymEquipment } from '~/utils/gymscan/equipment'
import { en, sk } from '~/i18n/messages/gymDemo'
const { t, tm, rt } = useI18n({ useScope: 'local', messages: { en, sk } })
const props = defineProps<{ selected: GymEquipment | null; step: number; still: boolean }>()
const emit = defineEmits<{
  select: [value: GymEquipment | null]
  watch: []
  kit: []
  step: [value: number]
}>()
const beats = computed(() =>
  (tm('owner.beats') as unknown[]).map((value) => {
    const item = value as { title: string; copy: string; label: string }
    return { title: rt(item.title), copy: rt(item.copy), label: rt(item.label) }
  }),
)
const exercises = computed(() => (tm('owner.exerciseNames') as string[]).map((item) => rt(item)))
const machineName = (id: GymEquipment) => t(`ownerMachineNames.${id}`)
const visibleBeats = computed(() =>
  beats.value
    .map((beat, index) => ({ beat, index }))
    .filter((item) => props.still || item.index === props.step),
)
</script>
<template>
  <div class="gx-owner-story" :class="{ 'is-still': still }">
    <article
      v-for="{ beat, index } in visibleBeats"
      :key="beat.label"
      class="gx-owner-beat"
      :class="`gx-owner-beat--${index}`"
    >
      <GymDiscovery v-if="index === 0 || index === 2" :inside="index === 2" />
      <template v-else>
        <div v-if="index === 1 && !still" class="gx-listing-leaf" aria-hidden="true">
          <img src="/assets/screens/gym-detail-560.webp" width="560" height="1212" alt="" />
        </div>
        <img
          v-if="still"
          class="gx-owner-floor-still"
          src="/assets/gym3d/equipment/floor.webp"
          width="1100"
          height="850"
          :alt="t('owner.floorAlt')"
          loading="lazy"
        />
        <div class="gx-floor-identity gx-protocol">
          <span class="gx-dot" /> {{ t('coaching.ownerEyebrow') }} <span>{{ t('owner.inside') }}</span>
        </div>
        <div v-if="index === 1" class="gx-floor-selection" :aria-label="t('owner.floorAria')" role="group">
          <button
            v-for="(machine, i) in gymEquipment"
            :key="machine.id"
            :aria-pressed="selected === machine.id"
            @click="emit('select', machine.id)"
          >
            <span class="gx-protocol">0{{ i + 1 }}</span
            ><img :src="machine.poster" width="900" height="900" alt="" loading="lazy" /><span>{{
              machineName(machine.id)
            }}</span
            ><i>↗</i>
          </button>
          <button class="gx-floor-reset" :disabled="!selected" @click="emit('select', null)">
            {{ t('owner.wholeFloor') }}
          </button>
          <button v-if="selected === 'flat-bench'" class="btn-ghost gx-watch" @click="emit('watch')">
            <HoloPill />{{ t('owner.watch') }}
          </button>
        </div>
        <div v-if="index === 3" class="gx-plan-stations" :aria-label="t('owner.planAria')">
          <div v-for="machine in gymEquipment" :key="machine.id">
            <img
              :src="machine.poster"
              width="900"
              height="900"
              :alt="machineName(machine.id)"
              loading="lazy"
            /><span aria-hidden="true">→</span>
          </div>
        </div>
        <div v-if="index === 3" class="gx-workout">
          <p class="gx-workout-request">{{ t('owner.request') }}</p>
          <div class="gx-workout-input gx-protocol">{{ t('owner.machineCount') }} <span>↓</span></div>
          <ol :aria-label="t('owner.workoutAria')">
            <li v-for="(machine, i) in gymEquipment" :key="machine.id" :style="{ '--station': i }">
              <button :aria-pressed="selected === machine.id" @click="emit('select', machine.id)">
                <img :src="machine.poster" width="900" height="900" alt="" loading="lazy" /><span
                  ><small>{{ machineName(machine.id) }}</small
                  >{{ exercises[i] }}</span
                ><b :aria-label="t('owner.available')">✓</b>
              </button>
            </li>
          </ol>
          <p class="gx-workout-result">{{ t('owner.result') }}</p>
          <small>{{ t('owner.plan') }}</small>
        </div>
      </template>
      <div class="gx-owner-caption">
        <p class="gx-protocol">
          04 / {{ t('owner.protocol') }} <span>0{{ index + 1 }} / 04</span>
        </p>
        <h2>{{ beat.title }}</h2>
        <p>{{ beat.copy }}</p>
        <p v-if="index === 2" class="gx-owner-planning">{{ t('owner.planning') }}</p>
        <a v-if="index === 3" class="btn-primary" href="#kit" @click="emit('kit')">{{ t('owner.put') }}</a>
        <small v-if="index === 1" class="gx-floor-note">{{ t('owner.floorNote') }}</small>
      </div>
    </article>
    <div v-if="!still" class="gx-beat-controls" role="group" :aria-label="t('owner.replay')">
      <button
        v-for="(beat, index) in beats"
        :key="beat.label"
        :aria-pressed="step === index"
        @click="emit('step', index)"
      >
        <span>0{{ index + 1 }}</span
        >{{ beat.label }}
      </button>
    </div>
  </div>
</template>
