<script setup lang="ts">
const route = useRoute()
const param = String(route.params.slug)

const { data: machine } = await useAsyncData(
  `catalog-machine-${param}`,
  () => resolveCatalogMachine(param),
)

if (!machine.value) {
  throw createError({ statusCode: 404, statusMessage: 'Machine not found', fatal: true })
}

// UUID (or stale-slug) hits move to the canonical slug URL once the API
// exposes machine slugs.
if (machine.value.slug && machine.value.slug !== param) {
  await navigateTo(`/machines/${machine.value.slug}`, { redirectCode: 301, replace: true })
}

const name = computed(() => machine.value?.name ?? '')
const canonicalParam = computed(() => machine.value?.slug ?? machine.value?.id ?? param)

const photos = computed(() => {
  const list = machine.value?.photoUrls ?? []
  if (list.length > 0) return list
  return machine.value?.photoUrl ? [machine.value.photoUrl] : []
})
const activePhoto = ref(0)

const exercises = computed(() => machine.value?.exercises ?? [])

const pageDescription = computed(() => {
  const raw = machine.value?.description
    ?? `${name.value}: exercises, setup photos, and instruction videos from the LIFTAG machine catalog.`
  return raw.length > 155 ? `${raw.slice(0, 152).trimEnd()}…` : raw
})

useLiftagSeo({
  title: `${name.value} | Exercises & Setup | LIFTAG`,
  description: pageDescription.value,
  path: `/machines/${canonicalParam.value}`,
  ...(photos.value[0] ? { image: photos.value[0] } : {}),
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Machines', path: '/machines' },
    { name: name.value, path: `/machines/${canonicalParam.value}` },
  ]),
  ...(exercises.value.length
    ? [{
        '@type': 'ItemList',
        'name': `Exercises on the ${name.value}`,
        'itemListElement': exercises.value.map((exercise, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': exercise.name,
          'url': `https://liftag.fit/exercises/${exercise.slug ?? exercise.id}`,
        })),
      }]
    : []),
])
</script>

<template>
  <div v-if="machine" class="ma-detail">
    <main class="container">
      <nav class="ma-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/machines" class="protocol ma-crumb">MACHINES</NuxtLink>
        <span class="ma-crumb-sep" aria-hidden="true">/</span>
        <span class="protocol ma-crumb ma-crumb--current">{{ name }}</span>
      </nav>

      <div class="ma-layout">
        <div class="ma-media">
          <div class="ma-photo">
            <img
              v-if="photos[activePhoto]"
              :src="photos[activePhoto]"
              :alt="name"
              fetchpriority="high"
              decoding="async"
            >
            <span v-else class="ma-photo__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
          </div>
          <div v-if="photos.length > 1" class="ma-thumbs" role="tablist" aria-label="Machine photos">
            <button
              v-for="(photo, photoIndex) in photos"
              :key="photo"
              type="button"
              class="ma-thumb"
              :class="{ 'is-active': photoIndex === activePhoto }"
              :aria-label="`Photo ${photoIndex + 1}`"
              @click="activePhoto = photoIndex"
            >
              <img :src="photo" alt="" loading="lazy" decoding="async">
            </button>
          </div>
        </div>

        <div class="ma-info">
          <h1 class="display ma-name">{{ name }}</h1>

          <CatalogMuscleChips
            v-if="machine.categories.length"
            class="ma-muscles"
            :secondary="machine.categories"
          />

          <CatalogExpandableNote
            v-if="machine.description"
            class="ma-description"
            :text="machine.description"
          />

          <div class="ma-scan-panel">
            <p class="protocol ma-scan-panel__eyebrow">AT A PARTNER GYM?</p>
            <p class="ma-scan-panel__copy">
              This is the screen the app opens when you scan the QR tag on a
              {{ name }} — pick the exercise, watch the setup, log your sets.
            </p>
            <GetAppBtn label="Get LIFTAG free" idle-rim />
          </div>
        </div>
      </div>

      <section class="ma-exercises" aria-label="Exercises on this machine">
        <h2 class="protocol ma-section-title">
          EXERCISES ON THIS MACHINE
          <span v-if="exercises.length" class="ma-section-count">{{ exercises.length }}</span>
        </h2>

        <div v-if="exercises.length" class="ma-ex-grid">
          <CatalogExerciseTile
            v-for="exercise in exercises"
            :key="exercise.id"
            :to="`/exercises/${exercise.slug ?? exercise.id}`"
            :name="exercise.name"
            :image-url="exercise.imageUrl"
            :label="exercise.primaryCategory?.name"
            :has-video="exercise.videos.length > 0"
            :preview-video-url="preferredCatalogVideoUrl(exercise.videos)"
          />
        </div>

        <div v-else class="ma-ex-empty">
          <p>The exercise list for this machine is on its way.</p>
          <NuxtLink to="/exercises" class="btn-ghost">Browse all exercises</NuxtLink>
        </div>
      </section>
    </main>

    <AppCtaBar :message="`Scan the ${name} tag`" />
  </div>
</template>

<style scoped>
.ma-detail {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 14% 8%, rgba(204, 255, 0, 0.08), transparent 30%),
    #000;
  color: #fff;
  padding-bottom: 120px;
}

.ma-breadcrumb {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 128px 0 26px;
}

.ma-crumb {
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
  text-decoration: none;
}

a.ma-crumb:hover {
  color: var(--liftag-primary);
}

.ma-crumb--current {
  color: var(--liftag-fg-dim);
}

.ma-crumb-sep {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.ma-layout {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 44px;
  align-items: start;
}

.ma-photo {
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-xl);
  background: var(--liftag-surface-dark);
}

.ma-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ma-photo__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(204, 255, 0, 0.3);
  font-family: var(--liftag-font-headline);
  font-size: 120px;
  font-style: italic;
  font-weight: 700;
}

.ma-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.ma-thumb {
  width: 76px;
  height: 58px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--liftag-border);
  border-radius: 10px;
  background: var(--liftag-surface-dark);
  cursor: pointer;
  opacity: 0.6;
  transition: border-color 200ms ease, opacity 200ms ease;
}

.ma-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ma-thumb.is-active {
  border-color: rgba(204, 255, 0, 0.6);
  opacity: 1;
}

.ma-name {
  margin: 0;
  font-size: clamp(34px, 4.6vw, 60px);
}

.ma-muscles {
  margin-top: 18px;
}

.ma-description {
  margin: 26px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  white-space: pre-line;
}

.ma-scan-panel {
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

.ma-scan-panel__eyebrow {
  margin: 0;
  color: var(--liftag-primary);
}

.ma-scan-panel__copy {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.6;
}

.ma-exercises {
  margin-top: 74px;
}

.ma-section-title {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin: 0 0 16px;
  color: var(--liftag-fg-tertiary);
}

.ma-section-count {
  color: var(--liftag-primary);
}

.ma-ex-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ma-ex-empty {
  display: grid;
  gap: 18px;
  justify-items: center;
  padding: 46px 0;
  border: 1px dashed var(--liftag-border);
  border-radius: var(--liftag-r-xl);
  color: var(--liftag-fg-muted);
  text-align: center;
}

.ma-ex-empty p {
  margin: 0;
  font-size: 16px;
  font-weight: 300;
}

.ma-ex-empty a {
  text-decoration: none;
}

@media (max-width: 1024px) {
  .ma-layout {
    gap: clamp(24px, 3.5vw, 36px);
  }

  .ma-ex-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .ma-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .ma-breadcrumb {
    padding-top: calc(104px + var(--liftag-safe-top));
  }
}
</style>
