<script setup lang="ts">
import { en, sk } from '~/content/company/press'
const { locale, href } = useSiteLocale()
const copy = computed(() => locale.value === 'sk' ? sk : en)
const title = computed(() => copy.value.title)
const description = computed(() => copy.value.description)

const path = '/press'
const datePublished = '2026-08-20'

useLiftagSeo(() => ({
  title: copy.value.seoTitle,
  description: description.value,
  path,
}))

const boilerplate = computed(() => copy.value.boilerplate)
const factHref = (link: string) => link.startsWith('/') ? href(link) : link

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: copy.value.structuredName,
    description: description.value,
    type: 'WebPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: copy.value.breadcrumbName, path },
  ]),
  liftagArticle({
    headline: copy.value.articleHeadline,
    description: description.value,
    path,
    datePublished,
  }),
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
            <a :href="href('/about')" class="btn-primary">{{ copy.actions.about }}</a>
            <a :href="href('/contact/support')" class="btn-ghost"><HoloPill />{{ copy.actions.contact }}</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>{{ copy.boilerplateLabel }}</h2>
            <p v-html="copy.boilerplateIntro"></p>
            <blockquote class="boilerplate">{{ boilerplate }}</blockquote>
          </section>

          <section>
            <h2>{{ copy.factsLabel }}</h2>
            <div class="facts-wrap" role="region" :aria-label="copy.factsLabel">
              <table class="facts-table">
                <tbody>
                  <tr v-for="fact in copy.facts" :key="fact.label">
                    <th scope="row">{{ fact.label }}</th>
                    <td>
                      <template v-if="fact.links">
                        <template v-for="(link, linkIndex) in fact.links" :key="link.href">
                          <a :href="link.href">{{ link.label }}</a><span v-if="linkIndex < fact.links.length - 1">, </span>
                        </template>
                      </template>
                      <template v-else-if="fact.href"><a :href="factHref(fact.href)">{{ fact.value }}</a></template>
                      <template v-else>{{ fact.value }}</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>{{ copy.logos }}</h2>
            <ul class="asset-list">
              <li v-for="(item, index) in copy.logoItems" :key="item.label">
                <a :href="['/logo-apple-touch.png', '/logo.svg', '/og-image.jpg'][index]!">{{ item.label }}</a>
                — {{ item.detail }}
              </li>
            </ul>
            <p>{{ copy.logoNote }}</p>
          </section>

          <section>
            <h2>{{ copy.ratings }}</h2>
            <p>{{ copy.ratingsBody }}</p>
          </section>

          <section>
            <h2>{{ copy.related }}</h2>
            <ul>
              <li v-for="item in copy.relatedItems" :key="item.href"><a :href="href(item.href)">{{ item.label }}</a> — {{ item.description }}</li>
            </ul>
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
.guide-body ul { margin: 12px 0 0; padding: 0 0 0 22px; }
.guide-body li { margin-bottom: 10px; }
.guide-body strong { color: #fff; font-weight: 700; }
.guide-body a {
  color: var(--liftag-primary); text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4); text-underline-offset: 3px;
}
.guide-body code {
  font-family: var(--liftag-font-mono); font-size: 13px; color: rgba(255, 255, 255, 0.86);
}
.boilerplate {
  margin: 18px 0 0; padding: 20px 22px;
  border-left: 3px solid var(--liftag-primary);
  background: rgba(204, 255, 0, 0.05);
  color: rgba(255, 255, 255, 0.86);
  font-size: 16.5px; font-weight: 300; line-height: 1.7;
}
.facts-wrap { overflow-x: auto; margin-top: 8px; }
.facts-table { width: 100%; border-collapse: collapse; font-size: 15px; }
.facts-table th, .facts-table td {
  padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left; vertical-align: top;
}
.facts-table th {
  width: 34%; color: var(--liftag-primary); font-family: var(--liftag-font-mono);
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
}
.facts-table td { color: rgba(255, 255, 255, 0.86); font-weight: 300; }
.asset-list { margin-top: 12px; }
.guide-method .protocol { color: var(--liftag-primary); margin: 0 0 10px; }
.guide-method p:last-child { color: rgba(255, 255, 255, 0.55); font-size: 14px; max-width: 780px; }
@media (max-width: 900px) { .guide-hero { padding-top: calc(120px + var(--liftag-safe-top)); } }
@media (max-width: 620px) {
  .guide-hero { padding: 108px 0 48px; }
  .guide-actions { flex-direction: column; }
  .guide-actions a { width: 100%; text-align: center; }
}
</style>
