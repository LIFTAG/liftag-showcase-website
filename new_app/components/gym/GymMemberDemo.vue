<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo'
const { t, tm, rt } = useI18n({ useScope: 'local', messages: { en, sk } })
const { href } = useSiteLocale()
const props = defineProps<{ step: number; still: boolean; active: boolean; paused: boolean }>()
const emit = defineEmits<{ watch: []; step: [value: number] }>()
const beats = computed(() =>
  (tm('member.beats') as unknown[]).map((value) => {
    const item = value as { title: string; copy: string; label: string }
    return { title: rt(item.title), copy: rt(item.copy), label: rt(item.label) }
  }),
)
const visibleBeats = computed(() =>
  beats.value
    .map((beat, index) => ({ beat, index }))
    .filter((item) => props.still || item.index === props.step),
)
</script>
<template>
  <div class="gx-member-story" :class="{ 'is-still': still }">
    <article v-for="{ beat, index } in visibleBeats" :key="beat.label" class="gx-product-beat">
      <GymMemberFrame
        :step="index"
        :active="active && !paused && (still || step === index)"
        :reduced="still"
        @watch="emit('watch')"
      />
      <div class="gx-beat-caption">
        <p class="gx-protocol">
          03 / {{ t('member.protocol') }} <span>0{{ index + 1 }} / 04</span>
        </p>
        <h2>{{ beat.title }}</h2>
        <p>{{ beat.copy }}</p>
        <NuxtLink :to="href('/get')" class="btn-ghost"><HoloPill />{{ t('member.app') }}</NuxtLink>
      </div>
    </article>
    <div v-if="!still" class="gx-beat-controls" :aria-label="t('member.replay')" role="group">
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
