<script setup lang="ts">
const route = useRoute()
const param = String(route.params.slug)

const { data: exercise } = await useAsyncData(
  `catalog-exercise-${param}`,
  () => resolveCatalogExercise(param),
)

if (!exercise.value) {
  throw createError({ statusCode: 404, statusMessage: 'Exercise not found', fatal: true })
}

// UUID (or stale-slug) hits move to the canonical slug URL.
if (exercise.value.slug && exercise.value.slug !== param) {
  await navigateTo(`/exercises/${exercise.value.slug}`, { redirectCode: 301, replace: true })
}

const name = computed(() => exercise.value?.name ?? '')
const canonicalSlug = computed(() => exercise.value?.slug ?? param)

const videoUrl = computed(() => {
  const videos = exercise.value?.videos ?? []
  const preferred = videos
    .filter(video => video.locale === 'en')
    .sort((a, b) => a.displayOrder - b.displayOrder)
  const fallback = [...videos].sort((a, b) => a.displayOrder - b.displayOrder)
  return (preferred[0] ?? fallback[0])?.url ?? null
})

const secondaryMuscles = computed(() => {
  const primarySlug = exercise.value?.primaryCategory?.slug
  return (exercise.value?.categories ?? []).filter(category => category.slug !== primarySlug)
})

const movementLabel = computed(() => {
  if (exercise.value?.isCompound === true) return 'Compound'
  if (exercise.value?.isCompound === false) return 'Isolation'
  return null
})

const loggingLabel = computed(() => {
  const labels: Record<string, string> = {
    weight_reps: 'Weight × reps',
    time: 'Time',
    calories: 'Calories',
  }
  return (exercise.value?.loggingTypes ?? [])
    .map(type => labels[type] ?? type)
    .join(' · ')
})

const machines = computed(() => exercise.value?.machines ?? [])

// Related lifts from the shared search index (same primary muscle).
const { data: index } = await useCatalogIndex()
const related = computed(() => {
  const primary = exercise.value?.primaryCategory?.slug
  if (!primary || !index.value) return []
  return index.value.exercises
    .filter(row => row.primaryCategory === primary && row.id !== exercise.value?.id)
    .slice(0, 4)
})

const pageDescription = computed(() => {
  const raw = exercise.value?.description
    ?? `${name.value}: setup, instruction video, and muscles worked, from the LIFTAG exercise library.`
  return raw.length > 155 ? `${raw.slice(0, 152).trimEnd()}…` : raw
})

useLiftagSeo({
  title: `${name.value} | Muscles Worked, Setup & Video | LIFTAG`,
  description: pageDescription.value,
  path: `/exercises/${canonicalSlug.value}`,
  ...(exercise.value?.imageUrl ? { image: exercise.value.imageUrl } : {}),
})

const structuredData: Record<string, unknown>[] = [
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Exercise Library', path: '/exercises' },
    ...(exercise.value?.primaryCategory
      ? [{
          name: exercise.value.primaryCategory.name,
          path: `/exercises?muscle=${exercise.value.primaryCategory.slug}`,
        }]
      : []),
    { name: name.value, path: `/exercises/${canonicalSlug.value}` },
  ]),
]

if (videoUrl.value && exercise.value) {
  structuredData.push({
    '@type': 'VideoObject',
    'name': `${name.value} instructions`,
    'description': pageDescription.value,
    'thumbnailUrl': exercise.value.imageUrl ?? 'https://liftag.fit/og-image.jpg',
    'contentUrl': videoUrl.value,
    'uploadDate': exercise.value.createdAt,
    'publisher': { '@id': 'https://liftag.fit/#organization' },
  })
}

useLiftagStructuredData(structuredData)
</script>

<template>
  <div v-if="exercise" class="ex-detail">
    <main class="container">
      <nav class="ex-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/exercises" class="protocol ex-crumb">EXERCISES</NuxtLink>
        <span class="ex-crumb-sep" aria-hidden="true">/</span>
        <NuxtLink
          v-if="exercise.primaryCategory"
          :to="`/exercises?muscle=${exercise.primaryCategory.slug}`"
          class="protocol ex-crumb"
        >
          {{ exercise.primaryCategory.name }}
        </NuxtLink>
      </nav>

      <div class="ex-layout">
        <div class="ex-media">
          <CatalogVideoPlayer
            :video-url="videoUrl"
            :poster="exercise.imageUrl"
            :name="name"
          />
        </div>

        <div class="ex-info">
          <h1 class="display ex-name">{{ name }}</h1>

          <p class="protocol ex-meta">
            <template v-if="movementLabel">{{ movementLabel }} · </template>{{ loggingLabel }}
          </p>

          <CatalogMuscleChips
            class="ex-muscles"
            :primary="exercise.primaryCategory"
            :secondary="secondaryMuscles"
          />

          <p v-if="exercise.description" class="ex-description">{{ exercise.description }}</p>

          <div class="ex-log-panel">
            <p class="protocol ex-log-panel__eyebrow">IN THE APP</p>
            <p class="ex-log-panel__copy">
              Scan the machine's QR tag and this exercise opens ready to log:
              sets, rest timer, PRs, and your whole progression for {{ name }}.
            </p>
            <GetAppBtn label="Get LIFTAG free" idle-rim />
          </div>

          <section v-if="machines.length" class="ex-machines" aria-label="Machines for this exercise">
            <h2 class="protocol ex-section-title">FOUND ON THESE MACHINES</h2>
            <ul class="ex-machine-list">
              <li v-for="machine in machines" :key="machine.id">
                <NuxtLink :to="machinePath(machine)" class="ex-machine-link">
                  <img
                    v-if="machine.photoUrl"
                    :src="machine.photoUrl"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class="ex-machine-link__img"
                  >
                  <span>{{ machine.name }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section v-if="related.length" class="ex-related" aria-label="Related exercises">
        <h2 class="protocol ex-section-title">
          MORE {{ exercise.primaryCategory?.name?.toUpperCase() }} EXERCISES
        </h2>
        <div class="ex-related-grid">
          <CatalogExerciseTile
            v-for="row in related"
            :key="row.id"
            :to="`/exercises/${row.slug}`"
            :name="row.name"
            :image-url="row.imageUrl"
            :has-video="row.hasVideo"
          />
        </div>
      </section>
    </main>

    <AppCtaBar :message="`Track ${name}`" />
  </div>
</template>

<style scoped>
.ex-detail {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 80% 6%, rgba(204, 255, 0, 0.08), transparent 30%),
    #000;
  color: #fff;
  padding-bottom: 120px;
}

.ex-breadcrumb {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 128px 0 26px;
}

.ex-crumb {
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
  text-decoration: none;
}

.ex-crumb:hover {
  color: var(--liftag-primary);
}

.ex-crumb-sep {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.ex-layout {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 44px;
  align-items: start;
}

.ex-media {
  position: sticky;
  top: 96px;
}

.ex-name {
  margin: 0;
  font-size: clamp(34px, 4.6vw, 60px);
}

.ex-meta {
  margin: 16px 0 0;
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
}

.ex-muscles {
  margin-top: 18px;
}

.ex-description {
  margin: 26px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  white-space: pre-line;
}

.ex-log-panel {
  display: grid;
  gap: 14px;
  justify-items: start;
  margin-top: 34px;
  padding: 24px 26px;
  border: 1px solid rgba(204, 255, 0, 0.22);
  border-radius: var(--liftag-r-xl);
  background:
    radial-gradient(circle at 100% 0%, rgba(204, 255, 0, 0.08), transparent 46%),
    var(--liftag-surface-dark);
}

.ex-log-panel__eyebrow {
  margin: 0;
  color: var(--liftag-primary);
}

.ex-log-panel__copy {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.6;
}

.ex-section-title {
  margin: 0 0 16px;
  color: var(--liftag-fg-tertiary);
}

.ex-machines {
  margin-top: 36px;
}

.ex-machine-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ex-machine-link {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-md);
  background: var(--liftag-secondary);
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 200ms ease;
}

.ex-machine-link:hover {
  border-color: rgba(204, 255, 0, 0.45);
}

.ex-machine-link__img {
  width: 52px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--liftag-surface-dark);
}

.ex-related {
  margin-top: 74px;
}

.ex-related-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1024px) {
  .ex-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .ex-media {
    position: static;
  }

  .ex-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 620px) {
  .ex-breadcrumb {
    padding-top: calc(104px + var(--liftag-safe-top));
  }
}
</style>
