<script setup lang="ts">
import type { CatalogLocale } from '~/utils/catalogLocale'

const props = withDefaults(defineProps<{
  locale?: CatalogLocale
  param: string
}>(), {
  locale: 'en',
})

const locale = props.locale
const param = props.param
const chrome = catalogChrome(locale)
const isSk = locale === 'sk'

const { data: exercise } = await useAsyncData(
  isSk ? `catalog-exercise-sk-${param}` : `catalog-exercise-${param}`,
  () => resolveCatalogExercise(param, locale),
)

if (!exercise.value) {
  throw createError({ statusCode: 404, statusMessage: 'Exercise not found', fatal: true })
}

// UUID (or stale-slug) hits move to the canonical slug URL.
if (exercise.value.slug && exercise.value.slug !== param) {
  await navigateTo(exercisePath(exercise.value.slug, locale), { redirectCode: 301, replace: true })
}

const name = computed(() => exercise.value?.name ?? '')
const canonicalSlug = computed(() => exercise.value?.slug ?? param)
const overlay = computed(() => (isSk ? null : exerciseOverlay(canonicalSlug.value)))
const path = computed(() => exercisePath(canonicalSlug.value, locale))
const indexPath = computed(() => exerciseIndexPath(locale))

const videoUrl = computed(() => preferredCatalogVideoUrl(exercise.value?.videos ?? []))

const secondaryMuscles = computed(() => {
  const primarySlug = exercise.value?.primaryCategory?.slug
  return (exercise.value?.categories ?? []).filter(category => category.slug !== primarySlug)
})

const anatomySecondary = computed(() =>
  secondaryMuscles.value.map(muscle => ({
    slug: muscle.slug,
    name: muscleName(muscle.slug, muscle.name),
  })),
)

const showAnatomy = computed(() =>
  hasExerciseAnatomy(
    exercise.value?.primaryCategory?.slug,
    anatomySecondary.value.map(muscle => muscle.slug),
  ),
)

function muscleName(slug: string, fallback: string): string {
  return muscleDisplayName(slug, fallback, locale)
}

function muscleTo(slug: string): string {
  return muscleChipPath(slug, locale)
}

const movementKind = computed(() => {
  if (exercise.value?.isCompound === true) return chrome.compound
  if (exercise.value?.isCompound === false) return chrome.isolation
  return null
})

const loggingLabel = computed(() => {
  const labels: Record<string, string> = {
    weight_reps: chrome.weightReps,
    time: chrome.time,
    calories: chrome.calories,
  }
  return (exercise.value?.loggingTypes ?? [])
    .map(type => labels[type] ?? type)
    .join(' · ')
})

const machines = computed(() => exercise.value?.machines ?? [])

const steps = computed(() => {
  if (overlay.value?.steps?.length) return overlay.value.steps
  return descriptionToHowToSteps(exercise.value?.description)
})

const overview = computed(() => {
  const description = exercise.value?.description?.trim()
  if (!description) return null
  if (overlay.value?.steps?.length) return description
  const leftover = splitSentences(description).filter(sentence => !steps.value.includes(sentence))
  return leftover.length ? leftover.join(' ') : null
})

const faqs = computed(() => {
  const primaryName = exercise.value?.primaryCategory
    ? muscleName(exercise.value.primaryCategory.slug, exercise.value.primaryCategory.name)
    : null
  const secondaryNames = secondaryMuscles.value.map(muscle => muscleName(muscle.slug, muscle.name))
  const machineNames = machines.value.map(machine => machine.name)
  if (isSk) {
    return defaultExerciseFaqsSk({
      name: name.value,
      primaryMuscle: primaryName,
      secondaryMuscles: secondaryNames,
      machines: machineNames,
      loggingLabel: loggingLabel.value || null,
    })
  }
  const generated = defaultExerciseFaqs({
    name: name.value,
    primaryMuscle: exercise.value?.primaryCategory?.name,
    secondaryMuscles: secondaryMuscles.value.map(muscle => muscle.name),
    machines: machineNames,
    loggingLabel: loggingLabel.value || null,
  })
  const extra = overlay.value?.faqs ?? []
  const seen = new Set(extra.map(item => item.question.toLowerCase()))
  return [...extra, ...generated.filter(item => !seen.has(item.question.toLowerCase()))]
})

// Related lifts: overlay order first (English only), then same primary muscle.
const { data: index } = await useCatalogIndex(locale)
const related = computed(() => {
  const rows = index.value?.exercises ?? []
  const currentId = exercise.value?.id
  const bySlug = new Map(rows.map(row => [row.slug, row]))
  const picked: typeof rows = []
  const seen = new Set<string>()

  for (const slug of overlay.value?.relatedSlugs ?? []) {
    const row = bySlug.get(slug)
    if (!row || row.id === currentId || seen.has(row.id)) continue
    picked.push(row)
    seen.add(row.id)
  }

  const primary = exercise.value?.primaryCategory?.slug
  if (primary) {
    for (const row of rows) {
      if (picked.length >= 8) break
      if (row.id === currentId || seen.has(row.id)) continue
      if (row.primaryCategory !== primary) continue
      picked.push(row)
      seen.add(row.id)
    }
  }

  return picked.slice(0, 8)
})

const pageDescription = computed(() => {
  if (isSk) {
    return exerciseMetaDescriptionSk({
      name: name.value,
      description: exercise.value?.description,
      isCompound: exercise.value?.isCompound,
      primaryMuscle: exercise.value?.primaryCategory
        ? muscleName(exercise.value.primaryCategory.slug, exercise.value.primaryCategory.name)
        : null,
    })
  }
  return exerciseMetaDescription({
    name: name.value,
    overlay: overlay.value?.metaDescription,
    description: exercise.value?.description,
    isCompound: exercise.value?.isCompound,
    primaryMuscle: exercise.value?.primaryCategory?.name,
  })
})

const imageAlt = computed(() => {
  if (isSk) {
    return exerciseImageAltSk({
      name: name.value,
      primaryMuscle: exercise.value?.primaryCategory
        ? muscleName(exercise.value.primaryCategory.slug, exercise.value.primaryCategory.name)
        : null,
      isCompound: exercise.value?.isCompound,
    })
  }
  return exerciseImageAlt({
    name: name.value,
    primaryMuscle: exercise.value?.primaryCategory?.name,
    isCompound: exercise.value?.isCompound,
  })
})

const muscleHubSlug = computed(() => exercise.value?.primaryCategory?.slug ?? null)
const muscleHubName = computed(() => {
  const category = exercise.value?.primaryCategory
  if (!category) return null
  return muscleName(category.slug, category.name)
})

const seoTitle = computed(() => {
  if (isSk) return exerciseTitleSk(name.value)
  return overlay.value?.title ?? exerciseTitle(name.value)
})

useLiftagSeo({
  title: seoTitle.value,
  description: pageDescription.value,
  path: path.value,
  alternates: liftagExerciseAlternates(canonicalSlug.value),
  ...(isSk ? { lang: 'sk', locale: 'sk_SK' } : {}),
  ...(exercise.value?.imageUrl ? { image: exercise.value.imageUrl } : {}),
})

const imageObject = computed(() => exercise.value?.imageUrl
  ? liftagImageObject({
      url: exercise.value.imageUrl,
      name: imageAlt.value,
      caption: imageAlt.value,
      description: pageDescription.value,
    })
  : null)

const structuredData = computed(() => {
  const crumbs = [
    { name: 'LIFTAG', path: '/' },
    { name: chrome.libraryCrumb, path: indexPath.value },
  ]
  if (muscleHubSlug.value && muscleHubName.value) {
    crumbs.push({ name: muscleHubName.value, path: muscleTo(muscleHubSlug.value) })
  }
  crumbs.push({ name: name.value, path: path.value })

  const graph: Record<string, unknown>[] = [
    liftagOrganization,
    liftagSoftwareApplication,
    liftagWebPage({
      path: path.value,
      name: name.value,
      description: pageDescription.value,
      image: exercise.value?.imageUrl ?? undefined,
      aboutId: `https://liftag.fit${path.value}#exercise`,
      primaryImage: imageObject.value ?? undefined,
      inLanguage: isSk ? 'sk' : 'en',
    }),
    liftagBreadcrumbs(crumbs),
    liftagPhysicalActivity({
      name: name.value,
      description: pageDescription.value,
      path: path.value,
      image: exercise.value?.imageUrl,
      category: muscleHubName.value,
      muscles: [
        muscleHubName.value,
        ...secondaryMuscles.value.map(muscle => muscleName(muscle.slug, muscle.name)),
      ].filter((item): item is string => Boolean(item)),
    }),
  ]

  if (imageObject.value) graph.push(imageObject.value)

  if (videoUrl.value && exercise.value) {
    graph.push(liftagVideoObject({
      name: chrome.videoName(name.value),
      description: pageDescription.value,
      contentUrl: videoUrl.value,
      thumbnailUrl: exercise.value.imageUrl ?? 'https://liftag.fit/og-image.jpg',
      uploadDate: exercise.value.createdAt,
    }))
  }

  if (steps.value.length) {
    graph.push(liftagHowTo({
      name: chrome.howToName(name.value),
      description: pageDescription.value,
      steps: steps.value,
      image: exercise.value?.imageUrl ?? undefined,
      videoUrl: videoUrl.value,
      path: path.value,
      stepName: index => chrome.stepName(index),
      inLanguage: isSk ? 'sk' : 'en',
    }))
  }

  if (faqs.value.length) graph.push(liftagFAQPage(faqs.value))

  if (related.value.length) {
    graph.push(liftagItemList({
      name: isSk
        ? `Súvisiace cviky${muscleHubName.value ? ` — ${muscleHubName.value}` : ''}`
        : `Related ${muscleHubName.value ?? ''} exercises`.replace(/\s+/g, ' ').trim(),
      items: related.value.map(row => ({
        name: row.name,
        url: `https://liftag.fit${exercisePath(row.slug, locale)}`,
      })),
    }))
  }

  return graph
})

useLiftagStructuredData(structuredData.value)

const heroPlaying = ref(false)
</script>

<template>
  <div v-if="exercise" class="ex-detail">
    <main class="ex-main">
      <nav class="container ex-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink :to="indexPath" class="protocol ex-crumb">{{ chrome.breadcrumbExercises }}</NuxtLink>
        <span class="ex-crumb-sep" aria-hidden="true">/</span>
        <NuxtLink
          v-if="exercise.primaryCategory"
          :to="muscleTo(exercise.primaryCategory.slug)"
          class="protocol ex-crumb"
        >
          {{ muscleName(exercise.primaryCategory.slug, exercise.primaryCategory.name) }}
        </NuxtLink>
      </nav>

      <div class="ex-stage" :class="{ 'is-playing': heroPlaying }">
        <div class="ex-media">
          <CatalogVideoPlayer
            :video-url="videoUrl"
            :poster="exercise.imageUrl"
            :name="imageAlt"
            @playing="heroPlaying = $event"
          >
            <template #overlay>
              <div class="ex-hero-ui">
                <div class="ex-hero-scrim" aria-hidden="true" />
                <div class="ex-hero-overlay">
                  <p class="ex-name ex-name--hero" aria-hidden="true">{{ name }}</p>
                </div>
              </div>
            </template>
          </CatalogVideoPlayer>
        </div>

        <div class="ex-info">
          <h1 class="display ex-name">{{ name }}</h1>

          <p class="protocol ex-meta">
            <template v-if="movementKind">{{ movementKind }} · </template>{{ loggingLabel }}
          </p>

          <CatalogMuscleChips
            class="ex-muscles"
            :primary="exercise.primaryCategory"
            :secondary="secondaryMuscles"
            :aria-label="chrome.musclesAria"
            :name-for="muscleName"
            :to-for="muscleTo"
          />

          <section v-if="showAnatomy" class="ex-anatomy">
            <div class="ex-anatomy__head">
              <h2 class="protocol ex-section-title">{{ chrome.anatomyHeading }}</h2>
              <ul class="protocol ex-anatomy__legend">
                <li>
                  <span class="ex-anatomy__swatch ex-anatomy__swatch--primary" aria-hidden="true" />
                  {{ chrome.anatomyPrimary }}
                </li>
                <li>
                  <span class="ex-anatomy__swatch ex-anatomy__swatch--secondary" aria-hidden="true" />
                  {{ chrome.anatomySecondary }}
                </li>
              </ul>
            </div>
            <div class="ex-anatomy__stage">
              <ClientOnly>
                <CatalogExerciseAnatomy
                  :primary-slug="exercise.primaryCategory?.slug ?? null"
                  :primary-name="exercise.primaryCategory
                    ? muscleName(exercise.primaryCategory.slug, exercise.primaryCategory.name)
                    : null"
                  :secondary="anatomySecondary"
                  :to-for="muscleTo"
                  :name-for="muscleName"
                />
                <template #fallback>
                  <div class="ex-anatomy__placeholder" aria-hidden="true" />
                </template>
              </ClientOnly>
            </div>
          </section>

          <p v-if="overview" class="ex-description">{{ overview }}</p>

          <div class="ex-log-panel">
            <p class="protocol ex-log-panel__eyebrow">{{ chrome.inTheApp }}</p>
            <GetAppBtn :label="chrome.getLiftag" />
            <p class="ex-log-panel__copy">
              {{ chrome.logCopy(name) }}
            </p>
          </div>

          <section v-if="machines.length" class="ex-machines" :aria-label="chrome.machinesAria">
            <h2 class="protocol ex-section-title">{{ chrome.machinesHeading }}</h2>
            <ul class="ex-machine-list">
              <li v-for="machine in machines" :key="machine.id">
                <NuxtLink :to="machinePath(machine)" class="ex-machine-link">
                  <img
                    v-if="machine.photoUrl"
                    :src="machine.photoUrl"
                    :alt="chrome.machineAlt(machine.name, name)"
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

      <article class="container ex-article">
        <section v-if="steps.length" class="ex-block" :aria-label="chrome.howToAria">
          <h2 class="protocol ex-section-title">{{ chrome.howToHeading(name) }}</h2>
          <ol class="ex-steps">
            <li v-for="(step, stepIndex) in steps" :key="stepIndex">{{ step }}</li>
          </ol>
        </section>

        <section v-if="overlay?.mistakes?.length" class="ex-block">
          <h2 class="protocol ex-section-title">COMMON MISTAKES</h2>
          <ul class="ex-prose-list">
            <li v-for="mistake in overlay.mistakes" :key="mistake.title">
              <strong>{{ mistake.title }}.</strong>
              {{ mistake.body }}
            </li>
          </ul>
        </section>

        <section v-if="overlay?.variations?.length" class="ex-block">
          <h2 class="protocol ex-section-title">VARIATIONS</h2>
          <ul class="ex-link-list">
            <li v-for="variation in overlay.variations" :key="variation.slug">
              <NuxtLink :to="`/exercises/${variation.slug}`">{{ variation.name }}</NuxtLink>
              — {{ variation.note }}
            </li>
          </ul>
        </section>

        <section v-if="overlay?.progressions?.length" class="ex-block">
          <h2 class="protocol ex-section-title">PROGRESSIONS</h2>
          <ol class="ex-steps">
            <li v-for="(item, itemIndex) in overlay.progressions" :key="itemIndex">{{ item }}</li>
          </ol>
        </section>

        <section v-if="overlay?.programming" class="ex-block">
          <h2 class="protocol ex-section-title">PROGRAMMING NOTES</h2>
          <p class="ex-prose">{{ overlay.programming }}</p>
        </section>

        <section v-if="overlay?.equipmentAlternatives?.length" class="ex-block">
          <h2 class="protocol ex-section-title">EQUIPMENT ALTERNATIVES</h2>
          <ul class="ex-link-list">
            <li v-for="item in overlay.equipmentAlternatives" :key="item.slug">
              <NuxtLink :to="`/exercises/${item.slug}`">{{ item.name }}</NuxtLink>
              — {{ item.note }}
            </li>
          </ul>
        </section>

        <section v-if="faqs.length" class="ex-block" :aria-label="chrome.faqsAria">
          <h2 class="protocol ex-section-title">{{ chrome.faqsHeading }}</h2>
          <FaqAccordion class="ex-faq" :items="faqs" id-prefix="ex-faq" />
        </section>
      </article>

      <section v-if="related.length" class="container ex-related" :aria-label="chrome.relatedAria">
        <h2 class="protocol ex-section-title">
          {{ chrome.relatedHeading(exercise.primaryCategory ? muscleName(exercise.primaryCategory.slug, exercise.primaryCategory.name) : '') }}
        </h2>
        <div class="ex-related-grid">
          <CatalogExerciseTile
            v-for="row in related"
            :key="row.id"
            :to="exercisePath(row.slug, locale)"
            :name="row.name"
            :image-url="row.imageUrl"
            :has-video="row.hasVideo"
            :preview-video-url="row.previewVideoUrl"
          />
        </div>
      </section>
    </main>

    <AppCtaBar :message="chrome.ctaTrack(name)" />
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

/* Chip list resets margin to 0; :deep beats that so this gap actually shows. */
.ex-info :deep(.ex-muscles) {
  margin-top: 22px;
}

.ex-anatomy {
  --anatomy-h: 230px;
  margin-top: 22px;
  padding: 0;
}

.ex-anatomy__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 8px;
}

.ex-anatomy .ex-section-title {
  margin: 0;
}

/* Height matches --anatomy-h so the ClientOnly fallback does not shift layout. */
.ex-anatomy__stage {
  min-height: var(--anatomy-h);
  height: var(--anatomy-h);
  overflow: hidden;
}

.ex-anatomy__placeholder {
  min-height: var(--anatomy-h);
  height: var(--anatomy-h);
}

.ex-anatomy__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--liftag-fg-tertiary);
}

.ex-anatomy__legend li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.ex-anatomy__swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.ex-anatomy__swatch--primary {
  background: #ccff00;
}

.ex-anatomy__swatch--secondary {
  background: #5e7814;
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

.ex-article {
  max-width: 880px;
  margin-top: 64px;
}

.ex-block {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.ex-block:first-child {
  border-top: 0;
  padding-top: 0;
}

.ex-steps,
.ex-prose-list,
.ex-link-list {
  margin: 0;
  padding: 0 0 0 22px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
}

.ex-steps li,
.ex-prose-list li,
.ex-link-list li {
  margin-bottom: 12px;
}

.ex-prose {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
}

.ex-link-list a {
  color: var(--liftag-primary);
  text-decoration: none;
}

.ex-link-list a:hover {
  text-decoration: underline;
}

.ex-faq {
  margin-top: 8px;
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

  .ex-media :deep(.cat-player__cta-ring--replay) {
    padding: 0;
  }

  .ex-media :deep(.cat-player__cta-ring--replay svg) {
    width: 13px;
    height: 13px;
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
    padding: 0 60px 16px 16px;
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
    padding: 16px max(20px, var(--liftag-safe-right)) 0 max(20px, var(--liftag-safe-left));
    background: #0e0e0e;
  }

  .ex-related,
  .ex-machines,
  .ex-article {
    padding-top: 28px !important;
    padding-bottom: 0 !important;
    overflow: visible !important;
  }

  .ex-article {
    margin-top: 12px;
  }

  .ex-info > .ex-name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .ex-meta {
    margin-top: 0;
  }

  .ex-info :deep(.ex-muscles) {
    margin-top: 12px;
  }

  .ex-anatomy {
    --anatomy-h: 220px;
    margin-top: 20px;
    /* Global `section` on this breakpoint is 80px !important. */
    padding: 0 !important;
  }

  .ex-anatomy__head {
    margin-bottom: 4px;
  }

  .ex-stage.is-playing .ex-anatomy {
    margin-top: 14px;
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

  .ex-stage.is-playing .ex-meta {
    margin-top: 8px;
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
