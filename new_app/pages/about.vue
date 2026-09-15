<script setup lang="ts">
import { en, sk } from '~/content/company/about'
const { locale, href } = useSiteLocale()
const copy = computed(() => locale.value === 'sk' ? sk : en)
const title = computed(() => copy.value.title)
const description = computed(() => copy.value.description)
const localizeHtml = (value: string) => value.replace(/href="(\/(?:[^"#]+))"/g, (_, path: string) => `href="${href(path)}"`)

const path = '/about'
const datePublished = '2026-08-20'

useLiftagSeo(() => ({
  title: copy.value.seoTitle,
  description: description.value,
  path,
}))

const faqs = computed(() => copy.value.faqs)

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path: href(path),
    name: copy.value.structuredName,
    description: description.value,
    type: 'AboutPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: copy.value.breadcrumbName, path: href(path) },
  ]),
  liftagArticle({
    headline: copy.value.articleHeadline,
    description: description.value,
    path: href(path),
    datePublished,
  }),
  liftagFAQPage(faqs.value),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">{{ copy.eyebrow }}</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a :href="href('/')" class="btn-primary">{{ copy.actions.app }}</a>
            <a :href="href('/press')" class="btn-ghost"><HoloPill />{{ copy.actions.press }}</a>
            <a :href="href('/contact/support')" class="btn-ghost"><HoloPill />{{ copy.actions.contact }}</a>
          </div>
        </header>

        <div class="container guide-body">
          <section v-for="section in copy.sections" :key="section.heading">
            <h2>{{ section.heading }}</h2>
            <p v-for="paragraph in section.paragraphs" :key="paragraph" v-html="localizeHtml(paragraph)"></p>
            <ul v-if="section.bullets">
              <li v-for="bullet in section.bullets" :key="bullet" v-html="localizeHtml(bullet)"></li>
            </ul>
          </section>

          <section class="guide-faq">
            <h2>{{ copy.faqHeading }}</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="about-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">{{ copy.writtenBy }}</p>
            <p>{{ copy.updated }}</p>
          </section>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}
.guide-hero { padding: 150px 0 60px; }
.guide-eyebrow { color: var(--liftag-primary); margin: 0 0 18px; }
.guide-eyebrow a { color: inherit; text-decoration: none; }
.guide-title { max-width: 920px; font-size: clamp(48px, 7.4vw, 112px); }
.guide-lead {
  max-width: 760px; margin: 28px 0 0; color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px); font-weight: 300; line-height: 1.55;
}
.guide-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 30px; }
.guide-actions a { text-decoration: none; }
.guide-body { padding: 32px 0 80px; max-width: 880px; }
.guide-body section { padding: 36px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.guide-body h2 {
  margin: 0 0 18px; font-family: var(--liftag-font-headline);
  font-size: clamp(28px, 3.6vw, 44px); font-style: italic; text-transform: uppercase; line-height: 1;
}
.guide-body p, .guide-body li { color: rgba(255, 255, 255, 0.74); font-size: 16.5px; font-weight: 300; line-height: 1.7; }
.guide-body p + p { margin-top: 14px; }
.guide-body ul, .guide-body ol { margin: 12px 0 0; padding: 0 0 0 22px; }
.guide-body li { margin-bottom: 10px; }
.guide-body strong { color: #fff; font-weight: 700; }
.guide-body a {
  color: var(--liftag-primary); text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4); text-underline-offset: 3px;
}
.guide-faq-list { margin-top: 18px; }
.guide-method .protocol { color: var(--liftag-primary); margin: 0 0 10px; }
.guide-method p:last-child { color: rgba(255, 255, 255, 0.55); font-size: 14px; max-width: 780px; }
@media (max-width: 900px) { .guide-hero { padding-top: calc(120px + var(--liftag-safe-top)); } }
@media (max-width: 620px) {
  .guide-hero { padding: 108px 0 48px; }
  .guide-actions { flex-direction: column; }
  .guide-actions a { width: 100%; text-align: center; }
}
</style>
