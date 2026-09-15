<script setup lang="ts">
import RoutineExerciseCard from '~/components/discovery/RoutineExerciseCard.vue'
import type { DiscoveryExercise, PublicRoutine } from '~/types/discovery'
import { discoveryCount, discoveryLabel, discoveryRating } from '~/utils/discoveryCopy'
import { discoveryMuscleName } from '~/utils/discoveryMuscles'
const props = defineProps<{ id: string }>()
const { locale, copy, href } = useDiscoveryLocale()
const {
  data: routine,
  error,
  status,
  refresh,
} = await useDiscoveryResource<PublicRoutine>(() => `/api/explore/routines/${props.id}`, locale)
const selected = shallowRef<DiscoveryExercise | null>(null),
  gate = shallowRef(false)
// Keep exercise order. A group heading introduces its first member.
const groupStarts = computed(
  () =>
    new Map(
      routine.value?.groups.map((group) => [
        routine.value!.exercises.find((e) => e.groupId === group.id)?.id,
        group,
      ]) ?? [],
    ),
)
useDiscoverySeo({
  name: () => routine.value?.name ?? copy.value.publicWorkout,
  description: () => routine.value?.description ?? copy.value.routines,
  locale,
  photo: () => routine.value?.image,
})
</script>
<template>
  <main id="discovery-content" class="d-wrap">
    <nav class="d-breadcrumb" :aria-label="copy.back">
      <NuxtLink :to="href('/explore')">
        <DiscoveryIcon name="back" />
        {{ copy.explore }}
      </NuxtLink>
      <span>/</span>
      <span>{{ copy.routines }}</span>
    </nav>
    <DiscoveryState
      v-if="!routine || error"
      :locale="locale"
      :loading="status === 'pending'"
      :error="Boolean(error)"
      :unavailable="error?.statusCode === 404"
      @retry="refresh()"
    />
    <div v-else class="d-routine-layout">
      <header class="d-routine-heading">
        <img
          v-if="routine.image"
          :src="routine.image"
          :alt="routine.name"
          fetchpriority="high"
          class="d-routine-cover"
        />
        <div class="d-section">
          <span class="d-link d-small">{{ copy.publicWorkout }}</span>
          <h1 class="d-title">{{ routine.name }}</h1>
          <div v-if="routine.author" class="d-row d-small">
            <img v-if="routine.authorAvatar" :src="routine.authorAvatar" alt="" class="d-author-avatar" />
            <span>{{ routine.author }}</span>
          </div>
          <div class="d-chips">
            <span v-if="routine.duration !== null" class="d-chip">
              <DiscoveryIcon name="clock" :size="15" />
              {{ routine.duration }} {{ copy.minutes }}
            </span>
            <span v-if="routine.difficulty" class="d-chip">
              {{ discoveryLabel(routine.difficulty, locale) }}
            </span>
            <span v-if="routine.rating !== null" class="d-chip d-stars">
              <DiscoveryIcon name="star" :size="15" />
              {{ discoveryRating(routine.rating, locale) }}
              <span v-if="routine.ratingCount !== null" class="d-muted">({{ routine.ratingCount }})</span>
            </span>
            <span v-if="routine.copyCount !== null" class="d-chip">
              {{ discoveryCount(routine.copyCount, 'copies', locale) }}
            </span>
          </div>
        </div>
      </header>
      <aside class="d-routine-actions">
        <button class="d-button d-button--primary d-button--wide" @click="gate = true">
          <DiscoveryIcon name="play" />
          {{ copy.startRoutine }}
        </button>
        <div class="d-routine-secondary">
          <button class="d-button" @click="gate = true">
            <DiscoveryIcon name="bookmark" :size="17" />
            {{ copy.saveRoutine }}
          </button>
          <button class="d-button" @click="gate = true">
            <DiscoveryIcon name="copy" :size="17" />
            {{ copy.copyRoutine }}
          </button>
          <button class="d-button" @click="gate = true">
            <DiscoveryIcon name="star" :size="17" />
            {{ copy.rateRoutine }}
          </button>
        </div>
        <DiscoveryAppGate v-if="gate" kind="routine" :locale="locale" @close="gate = false" />
        <div v-if="routine.muscles.length" class="d-section">
          <h2 class="d-subtitle">{{ copy.muscles }}</h2>
          <div class="d-chips">
            <span v-for="muscle in routine.muscles" :key="muscle" class="d-chip">
              {{ discoveryMuscleName(muscle, locale) }}
            </span>
          </div>
        </div>
      </aside>
      <div class="d-routine-content">
        <p v-if="routine.description" class="d-copy d-muted">{{ routine.description }}</p>
        <section class="d-section">
          <h2 class="d-subtitle">
            {{ copy.exercises }}
            <span class="d-muted">({{ routine.exercises.length }})</span>
          </h2>
          <p v-if="!routine.exercises.length" class="d-muted">{{ copy.noExercises }}</p>
          <ol v-else class="d-routine-exercises">
            <li
              v-for="(exercise, index) in routine.exercises"
              :key="exercise.id"
              :class="{ 'd-group-member': exercise.groupId }"
            >
              <div v-if="groupStarts.has(exercise.id)" class="d-superset-heading">
                <strong>{{ groupStarts.get(exercise.id)?.name || copy.superset }}</strong>
                <span>
                  <template v-if="groupStarts.get(exercise.id)?.rounds !== null">
                    {{ discoveryCount(groupStarts.get(exercise.id)?.rounds ?? 0, 'rounds', locale) }}
                  </template>
                  <template v-if="groupStarts.get(exercise.id)?.rest !== null">
                    <template v-if="groupStarts.get(exercise.id)?.rounds !== null">·</template>
                    {{ copy.rest }} {{ groupStarts.get(exercise.id)?.rest }} {{ copy.seconds }}
                  </template>
                </span>
              </div>
              <RoutineExerciseCard
                :exercise="exercise"
                :position="index + 1"
                :locale="locale"
                @select="selected = exercise"
              />
            </li>
          </ol>
        </section>
      </div>
    </div>
    <DiscoveryExercisePanel v-if="selected" :exercise="selected" :locale="locale" @close="selected = null" />
  </main>
</template>
<style scoped>
.d-routine-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 36px 48px;
}
.d-routine-heading {
  grid-column: 1/-1;
  display: flex;
  align-items: center;
  gap: 28px;
}
.d-routine-cover {
  width: 240px;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 20px;
}
.d-author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.d-routine-actions {
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  position: sticky;
  top: calc(var(--liftag-nav-h, 80px) + 24px);
  display: grid;
  gap: 20px;
}
.d-routine-secondary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.d-routine-secondary .d-button {
  flex-direction: column;
  font-size: 0.75rem;
  padding: 12px 6px;
}
.d-routine-content {
  grid-row: 2;
  display: grid;
  gap: 32px;
  min-width: 0;
}
.d-routine-exercises {
  padding: 0;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 16px;
}
.d-group-member {
  padding-left: 14px;
  border-left: 2px solid var(--d-accent);
}
.d-superset-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--d-accent);
  padding: 2px 0 14px;
  font-size: 0.8125rem;
}
.d-superset-heading > span {
  font-size: 0.6875rem;
  color: var(--d-muted);
}
@media (max-width: 767px) {
  .d-routine-layout {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .d-routine-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .d-routine-cover {
    width: 100%;
    aspect-ratio: 16/9;
  }
  .d-routine-actions {
    position: static;
    align-self: stretch;
  }
  .d-superset-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
