<script setup lang="ts">
import type { CatalogIndexExercise } from '~/types/catalog'

const route = useRoute()
const param = String(route.params.slug)
const hub = muscleHub(param)

if (!hub) {
  throw createError({ statusCode: 404, statusMessage: 'Muscle group not found', fatal: true })
}

const { data: index, error, refresh } = await useCatalogIndex()

const categoryNames = computed(() => {
  const names = new Map<string, string>()
  for (const category of index.value?.categories ?? []) names.set(category.slug, category.name)
  return names
})

const exercises = computed<CatalogIndexExercise[]>(() => {
  const rows = index.value?.exercises ?? []
  return rows.filter(exercise =>
    exercise.primaryCategory === hub.slug || exercise.categories.includes(hub.slug))
})

const primaryFirst = computed(() => {
  const primary = exercises.value.filter(exercise => exercise.primaryCategory === hub.slug)
  const secondary = exercises.value.filter(exercise => exercise.primaryCategory !== hub.slug)
  return [...primary, ...secondary]
})

const visibleCount = ref(48)
const visible = computed(() => primaryFirst.value.slice(0, visibleCount.value))
const listForSchema = computed(() => primaryFirst.value.slice(0, 30))

const otherHubs = MUSCLE_HUBS.filter(item => item.slug !== hub.slug)

const path = musclePath(hub.slug)

useLiftagSeo({
  title: `${hub.name} Exercises: How to Log Them | LIFTAG`,
  description: hub.description,
  path,
})

const cdnOrigin = computed(() => {
  const first = exercises.value.find(exercise => exercise.imageUrl)?.imageUrl
  try {
    return first ? new URL(first).origin : null
  }
  catch {
    return null
  }
})

useHead(() => ({
  link: cdnOrigin.value
    ? [{ rel: 'preconnect', href: cdnOrigin.value, crossorigin: 'anonymous' as const }]
    : [],
}))

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: `${hub.name} exercises`,
    description: hub.description,
    type: 'CollectionPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Exercise Library', path: '/exercises' },
    { name: 'Muscles', path: '/muscles' },
    { name: hub.name, path },
  ]),
  liftagItemList({
    name: `${hub.name} exercises in LIFTAG`,
    items: listForSchema.value.map(exercise => ({
      name: exercise.name,
      url: `https://liftag.fit/exercises/${exercise.slug}`,
    })),
  }),
])
</script>

<template>
  <div class="mu-hub">
    <main>
      <nav class="container mu-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/exercises" class="protocol mu-crumb">EXERCISES</NuxtLink>
        <span class="mu-crumb-sep" aria-hidden="true">/</span>
        <NuxtLink to="/muscles" class="protocol mu-crumb">MUSCLES</NuxtLink>
      </nav>

      <header class="mu-hero container">
        <p class="protocol mu-eyebrow">{{ hub.name.toUpperCase() }} · LIFTAG LIBRARY</p>
        <h1 class="display mu-title">{{ hub.headline.replace('.', '') }}. <span class="lime">Log them.</span></h1>
        <p class="mu-lead">{{ hub.intro }}</p>
        <p class="mu-stats">
          <span>{{ exercises.length }} exercises</span>
          <span class="mu-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/exercises" class="mu-stats-link">Full library</NuxtLink>
          <span class="mu-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/machines" class="mu-stats-link">Machines</NuxtLink>
        </p>
      </header>

      <section class="container mu-results" :aria-label="`${hub.name} exercises`">
        <div v-if="error" class="mu-empty">
          <p>The exercise library did not load.</p>
          <button type="button" class="btn-ghost" @click="() => refresh()">Try again</button>
        </div>

        <div v-else-if="index && exercises.length === 0" class="mu-empty">
          <p>No {{ hub.name.toLowerCase() }} exercises in the catalog yet.</p>
          <NuxtLink to="/exercises" class="btn-ghost">Browse all exercises</NuxtLink>
        </div>

        <template v-else>
          <div class="mu-grid">
            <CatalogExerciseTile
              v-for="exercise in visible"
              :key="exercise.id"
              :to="`/exercises/${exercise.slug}`"
              :name="exercise.name"
              :image-url="exercise.imageUrl"
              :label="exercise.primaryCategory ? categoryNames.get(exercise.primaryCategory) : null"
              :has-video="exercise.hasVideo"
              :preview-video-url="exercise.previewVideoUrl"
            />
          </div>
          <div v-if="primaryFirst.length > visibleCount" class="mu-more">
            <button type="button" class="btn-ghost" @click="visibleCount += 48">
              Show more ({{ primaryFirst.length - visibleCount }} left)
            </button>
          </div>
        </template>
      </section>

      <section class="container mu-others" aria-label="Other muscle groups">
        <h2 class="protocol mu-section-title">OTHER MUSCLE GROUPS</h2>
        <div class="mu-chips">
          <NuxtLink
            v-for="item in otherHubs"
            :key="item.slug"
            :to="musclePath(item.slug)"
            class="mu-chip"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </section>
    </main>

    <AppCtaBar :message="`Track ${hub.name.toLowerCase()} work`" />
  </div>
</template>

<style scoped>
.mu-hub {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 84% 12%, rgba(204, 255, 0, 0.1), transparent 34%),
    radial-gradient(circle at 12% 70%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
  padding-bottom: 48px;
}

.mu-breadcrumb {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 128px 0 0;
}

.mu-crumb {
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
  text-decoration: none;
}

.mu-crumb:hover {
  color: var(--liftag-primary);
}

.mu-crumb-sep {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.mu-hero {
  padding: 26px 0 36px;
}

.mu-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
}

.mu-title {
  margin: 0;
  max-width: 16ch;
  font-size: clamp(48px, 7.4vw, 104px);
  line-height: 0.92;
}

.mu-lead {
  max-width: 58ch;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.mu-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin: 22px 0 0;
  color: var(--liftag-fg-tertiary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mu-stats-dot {
  color: var(--liftag-fg-dim);
}

.mu-stats-link {
  color: inherit;
  text-decoration: none;
}

.mu-stats-link:hover {
  color: var(--liftag-primary);
}

.mu-results {
  padding-bottom: 48px;
}

.mu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.mu-more,
.mu-empty {
  display: grid;
  justify-items: start;
  gap: 16px;
  margin-top: 28px;
}

.mu-empty {
  color: rgba(255, 255, 255, 0.64);
}

.mu-others {
  padding: 12px 0 48px;
}

.mu-section-title {
  margin: 0 0 16px;
  color: var(--liftag-fg-tertiary);
}

.mu-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mu-chip {
  display: inline-flex;
  padding: 7px 14px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: var(--liftag-secondary);
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
}

.mu-chip:hover {
  border-color: rgba(204, 255, 0, 0.45);
  color: var(--liftag-primary);
}

@media (max-width: 1024px) {
  .mu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .mu-breadcrumb {
    padding-top: calc(96px + var(--liftag-safe-top));
    padding-right: max(20px, var(--liftag-safe-right));
    padding-left: max(20px, var(--liftag-safe-left));
  }

  .mu-hero {
    padding-top: 18px;
  }

  .mu-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}

@media (max-width: 620px) {
  .mu-title {
    font-size: clamp(40px, 12vw, 64px);
  }
}
</style>
