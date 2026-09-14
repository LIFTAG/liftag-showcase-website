<script setup lang="ts">
import type { DiscoveryExercise, DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
import { preferredCatalogVideoUrl } from '~/utils/catalogVideo'
import { exercisePath } from '~/utils/catalogLocale'
import { discoveryMuscleName } from '~/utils/discoveryMuscles'
const props = defineProps<{ exercise: DiscoveryExercise; locale: DiscoveryLocale }>()
defineEmits<{ close: [] }>()
const videoUrl = computed(() => preferredCatalogVideoUrl(props.exercise.videos, props.locale))
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <DiscoveryDialog :title="exercise.name || copy.exerciseDetails" :locale="locale" @close="$emit('close')">
    <div class="d-stack">
      <img v-if="exercise.image" :src="exercise.image" :alt="exercise.name" class="d-exercise-image" />
      <div v-if="exercise.muscles.length" class="d-chips">
        <span v-for="muscle in exercise.muscles" :key="muscle" class="d-chip">
          {{ discoveryMuscleName(muscle, locale) }}
        </span>
      </div>
      <p v-if="exercise.description && exercise.description !== exercise.instructions" class="d-copy d-muted">
        {{ exercise.description }}
      </p>
      <section v-if="exercise.instructions" class="d-section">
        <h3 class="d-subtitle">{{ copy.instructions }}</h3>
        <p class="d-copy d-small">{{ exercise.instructions }}</p>
      </section>
      <DiscoveryVideo
        v-if="videoUrl"
        :src="videoUrl"
        :poster="exercise.image"
        :title="exercise.name"
        :locale="locale"
      />
      <NuxtLink
        v-if="exercise.templateId"
        :to="exercisePath(exercise.templateId, locale)"
        class="d-button"
        @click="$emit('close')"
      >
        {{ copy.catalogExercise }}
        <DiscoveryIcon name="arrow" />
      </NuxtLink>
    </div>
  </DiscoveryDialog>
</template>
<style scoped>
.d-exercise-image {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 16px;
  background: var(--d-panel);
}
</style>
