<script setup lang="ts">
import type { LegalContent } from '~/content/legal/privacy'

const props = defineProps<{
  kind: 'privacy' | 'terms'
  content: LegalContent
}>()

const { locale, href } = useSiteLocale()
const basePath = computed(() => (props.kind === 'privacy' ? '/privacy-policy' : '/terms-and-conditions'))
const path = computed(() => href(basePath.value))
const lang = computed(() => (locale.value === 'sk' ? 'sk' : 'en'))
const ogLocale = computed(() => (lang.value === 'sk' ? 'sk_SK' : 'en_US'))

useLiftagSeo(() => ({
  title: props.content.seoTitle,
  description: props.content.seoDescription,
  path: path.value,
  lang: lang.value,
  locale: ogLocale.value,
  alternates: liftagLegalAlternates(props.kind),
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: props.content.breadcrumbName, path: path.value },
  ]),
])
</script>

<template>
  <div class="legal-page">
    <main>
      <article class="legal">
        <header class="legal-hero container">
          <p class="protocol legal-eyebrow">{{ content.eyebrow }}</p>
          <h1 class="display legal-title" v-html="content.titleHtml"></h1>
          <p class="legal-updated">{{ content.updatedLabel }} {{ content.lastUpdated }}</p>
          <LegalLangLinks :kind="kind" />
        </header>

        <div class="container legal-body">
          <section v-for="section in content.sections" :key="section.title" class="legal-section">
            <h2>{{ section.title }}</h2>
            <p v-for="(paragraph, index) in section.body.split('\n\n')" :key="index">{{ paragraph }}</p>
          </section>

          <p class="legal-contact-email">
            <a :href="`mailto:${content.contactEmail}`">{{ content.contactEmail }}</a>
          </p>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%), #000;
  color: #fff;
}

.legal-hero {
  padding: 150px 0 40px;
}
.legal-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}
.legal-title {
  max-width: 920px;
  font-size: clamp(48px, 7.4vw, 112px);
}
.legal-updated {
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 300;
}
.legal-body {
  padding: 24px 0 80px;
  max-width: 820px;
}
.legal-section {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.legal-section h2 {
  margin: 0 0 14px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(22px, 2.8vw, 32px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.1;
}
.legal-section p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  margin: 0;
}
.legal-section p + p {
  margin-top: 1em;
}
.legal-contact-email {
  margin: 18px 0 0;
  font-size: 16px;
}
.legal-contact-email a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}
@media (max-width: 900px) {
  .legal-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}
@media (max-width: 620px) {
  .legal-hero {
    padding: calc(108px + var(--liftag-safe-top)) 0 32px;
  }
}
</style>
