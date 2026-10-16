<script setup lang="ts">
import { en, sk } from '~/i18n/messages/muscles'
import { muscleHubsForLocale } from '~/utils/muscles'

const { locale, href } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const description = computed(() => t('indexDescription'))

useLiftagSeo(() => ({
  title: t('indexSeoTitle'),
  description: description.value,
  path: '/muscles',
}))

const { data: index } = await useCatalogIndex(locale)
const hubs = computed(() => muscleHubsForLocale(locale.value))

const counts = computed(() => {
  const map = new Map<string, number>()
  for (const exercise of index.value?.exercises ?? []) {
    for (const slug of new Set([exercise.primaryCategory, ...exercise.categories])) {
      if (!slug) continue
      map.set(slug, (map.get(slug) ?? 0) + 1)
    }
  }
  return map
})

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path: href('/muscles'),
    name: t('indexWebPageName'),
    description: description.value,
    type: 'CollectionPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('library'), path: href('/exercises') },
    { name: t('muscles'), path: href('/muscles') },
  ]),
  liftagItemList({
    name: t('indexWebPageName'),
    items: hubs.value.map(hub => ({
      name: hub.name,
      url: `https://liftag.fit${href(musclePath(hub.slug))}`,
    })),
  }),
])
</script>

<template>
  <div class="mu-index">
    <main>
      <header class="mu-hero container">
        <p class="protocol mu-eyebrow">{{ t('indexEyebrow') }}</p>
        <h1 class="display mu-title">{{ t('indexTitleLead') }}<span class="lime">{{ t('indexTitleLime') }}</span></h1>
        <p class="mu-lead">{{ description }}</p>
      </header>

      <section class="container mu-grid" :aria-label="t('indexAria')">
        <NuxtLink
          v-for="hub in hubs"
          :key="hub.slug"
          :to="href(musclePath(hub.slug))"
          class="mu-card"
        >
          <p class="protocol mu-card-eyebrow">{{ hub.name.toUpperCase() }}</p>
          <h2>{{ hub.headline }}</h2>
          <p>{{ hub.intro }}</p>
          <p v-if="index" class="protocol mu-card-count">
            {{ t('indexCount', { count: counts.get(hub.slug) ?? 0 }) }}
          </p>
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mu-index {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.1), transparent 34%),
    radial-gradient(circle at 14% 72%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

.mu-hero {
  padding: 150px 0 48px;
}

.mu-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
}

.mu-title {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(52px, 8vw, 112px);
  line-height: 0.92;
}

.mu-lead {
  max-width: 54ch;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.mu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 0 96px;
}

.mu-card {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 240px;
  padding: 28px 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(11, 18, 21, 0.72);
  color: inherit;
  text-decoration: none;
  transition: border-color 200ms ease;
}

.mu-card:hover {
  border-color: rgba(204, 255, 0, 0.4);
}

.mu-card-eyebrow {
  margin: 0;
  color: var(--liftag-primary);
}

.mu-card h2 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(26px, 3vw, 36px);
  font-style: italic;
  line-height: 1;
  text-transform: uppercase;
}

.mu-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
}

.mu-card-count {
  margin-top: auto;
  color: var(--liftag-fg-tertiary);
}

@media (max-width: 900px) {
  .mu-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }

  .mu-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .mu-hero {
    padding: 108px 0 36px;
  }

  .mu-card {
    min-height: 0;
  }
}
</style>
