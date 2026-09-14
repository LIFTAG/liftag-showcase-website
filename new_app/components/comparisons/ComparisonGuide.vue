<script setup lang="ts">
import { localizeContentLinks } from '~/utils/localizeContentLinks'
import type { ComparisonContent } from '~/content/comparisons/comparisonContent'
const props = defineProps<{
  content: ComparisonContent
  href: (path: string) => string
  idPrefix: string
  competitor: string
}>()
const localHtml = (html: string) => localizeContentLinks(html, props.href)
</script>
<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">{{ content.eyebrow }}</p>
          <h1 class="display guide-title" v-html="content.title" />
          <p class="guide-lead">{{ content.description }}</p>
          <div class="guide-actions">
            <a :href="href('/get')" class="btn-primary">{{ content.cta }}</a
            ><a :href="href(competitor === 'Hevy' ? '/vs/strong' : '/alternatives/hevy')" class="btn-ghost"
              ><HoloPill />{{ content.other }}</a
            >
          </div>
        </header>
        <div class="container guide-body">
          <section>
            <h2>{{ content.short }}</h2>
            <p v-for="x in content.shortBody" :key="x" v-html="localHtml(x)" />
          </section>
          <section>
            <h2>{{ competitor }}: {{ content.pricing }}</h2>
            <p v-for="x in content.pricingBody" :key="x" v-html="localHtml(x)" />
          </section>
          <section>
            <h2>{{ content.features }}</h2>
            <div
              class="guide-table-wrap"
              role="region"
              tabindex="0"
              :aria-label="`${content.features}: ${competitor}`"
            >
              <table class="guide-table">
                <thead>
                  <tr>
                    <th>{{ content.needHeader }}</th>
                    <th>{{ competitor }}</th>
                    <th>LIFTAG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in content.rows" :key="row.need">
                    <th>{{ row.need }}</th>
                    <td>{{ row.competitor }}</td>
                    <td>{{ row.liftag }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2>{{ content.wins }}</h2>
            <ul>
              <li v-for="x in content.competitorWins" :key="x">{{ x }}</li>
            </ul>
          </section>
          <section>
            <h2>{{ content.liftagWinsHeading }}</h2>
            <ul>
              <li v-for="x in content.liftagWins" :key="x">{{ x }}</li>
            </ul>
            <p v-html="localHtml(content.winsNote)" />
          </section>
          <section>
            <h2>{{ content.switch }}</h2>
            <p v-for="x in content.switchingBody" :key="x" v-html="localHtml(x)" />
          </section>
          <section>
            <h2>{{ content.comparisons }}</h2>
            <p v-for="x in content.comparisonsBody" :key="x" v-html="localHtml(x)" />
          </section>
          <section class="guide-faq">
            <h2>{{ content.faq }}</h2>
            <FaqAccordion class="guide-faq-list" :items="content.faqs" :id-prefix="idPrefix" />
          </section>
          <section class="guide-method">
            <p class="protocol">{{ content.sources }}</p>
            <p v-for="x in content.sourceBody" :key="x" v-html="localHtml(x)" />
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
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%), #000;
  color: #fff;
}

/* Block-direction only: a `padding` shorthand here would wipe the horizontal
   padding .container sets per breakpoint, and on a phone that leaves the copy
   flush against the screen edge. */
.guide-hero {
  padding-top: 150px;
  padding-bottom: 60px;
}

.guide-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.guide-title {
  max-width: 920px;
  font-size: clamp(44px, 6.6vw, 100px);
}

.guide-lead {
  max-width: 760px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 300;
  line-height: 1.55;
}

.guide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.guide-actions a {
  text-decoration: none;
}

.guide-body {
  padding-top: 32px;
  padding-bottom: 80px;
  max-width: 880px;
}

.guide-body section {
  padding: 36px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.guide-body h2 {
  margin: 0 0 18px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(28px, 3.6vw, 44px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
}

.guide-body p,
.guide-body li {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16.5px;
  font-weight: 300;
  line-height: 1.7;
}

.guide-body p + p {
  margin-top: 14px;
}

.guide-body ul {
  margin: 12px 0 0;
  padding: 0 0 0 22px;
}

.guide-body li {
  margin-bottom: 10px;
}

.guide-body :deep(strong) {
  color: #fff;
  font-weight: 700;
}

.guide-body :deep(a) {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

.guide-table-wrap {
  overflow-x: auto;
  margin-top: 8px;
}

.guide-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 14px;
}

.guide-table th,
.guide-table td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  vertical-align: top;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 300;
}

.guide-table thead th {
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.guide-table tbody th {
  color: #fff;
  font-weight: 700;
}

/* LIFTAG is the last column, so the tint marks our own claims rather than
   letting the reader assume the table is neutral. */
.guide-table tbody td:last-child {
  background: rgba(204, 255, 0, 0.04);
  color: rgba(255, 255, 255, 0.82);
}

.guide-table thead th:last-child {
  background: rgba(204, 255, 0, 0.06);
}

.guide-faq-list {
  margin-top: 18px;
}

.guide-method .protocol {
  color: var(--liftag-primary);
  margin: 0 0 10px;
}

.guide-method p:not(.protocol) {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  max-width: 780px;
}

@media (max-width: 900px) {
  .guide-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}

@media (max-width: 620px) {
  .guide-hero {
    padding-top: 108px;
    padding-bottom: 48px;
  }

  .guide-actions {
    flex-direction: column;
  }

  .guide-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
