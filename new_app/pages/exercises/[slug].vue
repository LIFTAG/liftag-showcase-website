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

const videoUrl = computed(() => preferredCatalogVideoUrl(exercise.value?.videos ?? []))

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

const heroPlaying = ref(false)
</script>

<template>
  <div v-if="exercise" class="ex-detail">
    <main class="ex-main">
      <nav class="container ex-breadcrumb" aria-label="Breadcrumb">
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

      <div class="ex-stage" :class="{ 'is-playing': heroPlaying }">
        <div class="ex-media">
          <CatalogVideoPlayer
            :video-url="videoUrl"
            :poster="exercise.imageUrl"
            :name="name"
            @playing="heroPlaying = $event"
          >
            <template #overlay>
              <div class="ex-hero-ui">
                <div class="ex-hero-scrim" aria-hidden="true" />
                <div class="ex-hero-overlay">
                  <p class="ex-name ex-name--hero" aria-hidden="true">{{ name }}</p>
                  <CatalogMuscleChips
                    compact
                    :primary="exercise.primaryCategory"
                    :secondary="secondaryMuscles"
                  />
                </div>
              </div>
            </template>
          </CatalogVideoPlayer>
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

          <CatalogExpandableNote
            v-if="exercise.description"
            class="ex-description"
            :text="exercise.description"
          />

          <div class="ex-log-panel">
            <p class="protocol ex-log-panel__eyebrow">IN THE APP</p>
            <p class="ex-log-panel__copy">
              Scan the machine's QR tag and this exercise opens ready to log:
              sets, rest timer, PRs, and your whole progression for {{ name }}.
            </p>
            <GetAppBtn label="Get LIFTAG free" />
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

      <section v-if="related.length" class="container ex-related" aria-label="Related exercises">
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
            :preview-video-url="row.previewVideoUrl"
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
  padding-bottom: 48px;
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

.ex-stage {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 44px;
  align-items: start;
  max-width: 1240px;
  margin: 0 auto;
  padding-right: max(32px, var(--liftag-safe-right));
  padding-left: max(32px, var(--liftag-safe-left));
}

.ex-media {
  position: sticky;
  top: 96px;
}

.ex-hero-ui {
  display: none;
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
  .ex-stage {
    gap: clamp(24px, 3.5vw, 36px);
  }

  .ex-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 880px) {
  .ex-stage {
    padding-right: max(20px, var(--liftag-safe-right));
    padding-left: max(20px, var(--liftag-safe-left));
  }
}

@media (max-width: 768px) {
  .ex-detail {
    background: #0e0e0e;
    padding-bottom: 32px;
  }

  .ex-breadcrumb {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .ex-stage {
    display: flex;
    flex-direction: column;
    max-width: none;
    margin: 0;
    padding: 0 !important;
    gap: 0;
  }

  .ex-media {
    position: relative;
    top: auto;
    width: 100%;
    margin: 0;
    overflow: hidden;
  }

  .ex-media :deep(.cat-player:not(.is-cinema)) {
    /* Fill from the top of the navbar, then a 4:3 photo below it. */
    aspect-ratio: auto;
    width: 100%;
    height: calc(var(--liftag-safe-top) + 56px + 100vw * 3 / 4);
    max-height: 78svh;
    min-height: 0;
    border: 0;
    border-radius: 0;
  }

  .ex-media :deep(.cat-player__poster),
  .ex-media :deep(.cat-player__video) {
    object-position: top center;
  }

  .ex-media :deep(.cat-player__cta) {
    left: auto;
    right: max(8px, var(--liftag-safe-right));
    top: auto;
    bottom: 8px;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 8px;
    border: 0;
    background: transparent;
    transform: none;
  }

  .ex-media :deep(.cat-player__cta:hover) {
    box-shadow: none;
  }

  .ex-media :deep(.cat-player__cta-ring) {
    width: 28px;
    height: 28px;
    padding: 0 0 0 2px;
    border: 1px solid rgba(204, 255, 0, 0.62);
    background: rgba(14, 14, 14, 0.78);
    color: var(--liftag-primary);
    box-shadow: 0 0 18px rgba(204, 255, 0, 0.12);
  }

  .ex-media :deep(.cat-player__cta-ring svg) {
    width: 9px;
    height: 11px;
  }

  .ex-media :deep(.cat-player__cta-label) {
    display: none;
  }

  .ex-media :deep(.cat-player__cta:focus-visible) {
    outline: none;
  }

  .ex-media :deep(.cat-player__cta:focus-visible .cat-player__cta-ring) {
    outline: 2px solid var(--liftag-primary);
    outline-offset: 2px;
  }

  .ex-hero-ui {
    position: absolute;
    inset: 0;
    display: block;
  }

  .ex-hero-scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 18%, transparent 32%),
      linear-gradient(to top, rgba(14, 14, 14, 0.92) 0%, rgba(14, 14, 14, 0.4) 28%, transparent 52%);
  }

  .ex-hero-overlay {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    gap: 8px;
    padding: 0 60px 16px 16px;
  }

  .ex-hero-overlay :deep(.muscle-chips) {
    pointer-events: auto;
  }

  .ex-name--hero {
    font-family: var(--liftag-font-headline);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
  }

  .ex-info {
    position: relative;
    z-index: 2;
    margin: 0;
    padding: 20px max(20px, var(--liftag-safe-right)) 0 max(20px, var(--liftag-safe-left));
    background: #0e0e0e;
  }

  .ex-related,
  .ex-machines {
    padding-top: 28px !important;
    padding-bottom: 0 !important;
    overflow: visible !important;
  }

  .ex-info > .ex-name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .ex-info > .ex-muscles {
    display: none;
  }

  .ex-meta {
    margin-top: 0;
  }

  .ex-description {
    margin-top: 16px;
  }

  .ex-related {
    margin-top: 36px;
  }

  .ex-stage.is-playing .ex-media :deep(.cat-player:not(.is-cinema)) {
    height: auto;
    max-height: none;
    aspect-ratio: 16 / 9;
  }

  /* Playback drops the video clear of the nav, and at the top of the page the
     nav is still fully transparent - so this padding strip is what shows
     through it. Left to the page background it reads as a grey bar hanging off
     the top of the screen; black lets the bar disappear into the video frame. */
  .ex-stage.is-playing .ex-media {
    padding-top: calc(var(--liftag-safe-top) + 72px);
    background: #000;
  }

  .ex-stage.is-playing .ex-info > .ex-name {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
    font-size: 22px;
  }

  .ex-stage.is-playing .ex-info > .ex-muscles {
    display: flex;
  }

  .ex-log-panel {
    margin-top: 22px;
    padding: 18px 16px;
  }
}

@media (max-width: 620px) {
  .ex-related-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
