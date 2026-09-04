<script setup lang="ts">
interface SeoMetric {
  value: string
  label: string
}

interface SeoSection {
  title: string
  body: string
}

interface SeoFaq {
  question: string
  answer: string
}

defineProps<{
  eyebrow: string
  title: string
  lead: string
  metrics: SeoMetric[]
  sections: SeoSection[]
  faqs: SeoFaq[]
  ctaLabel?: string
  ctaHref?: string
}>()
</script>

<template>
  <div class="seo-page">
    <main>
      <section class="seo-hero">
        <div class="container seo-hero-grid">
          <div class="seo-copy">
            <p class="protocol seo-eyebrow">{{ eyebrow }}</p>
            <h1 class="display seo-title" v-html="title"></h1>
            <p class="seo-lead">{{ lead }}</p>
            <div class="seo-actions">
              <a :href="ctaHref ?? '/#scan'" class="btn-primary">{{ ctaLabel ?? 'See the flow' }}</a>
              <a href="/" class="btn-ghost"><HoloPill />Back to showcase</a>
            </div>
          </div>

          <div class="seo-metrics" aria-label="LIFTAG product facts">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="seo-metric"
            >
              <strong>{{ metric.value }}</strong>
              <span class="protocol">{{ metric.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="seo-content">
        <div class="container seo-content-grid">
          <article
            v-for="section in sections"
            :key="section.title"
            class="seo-panel"
          >
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </article>
        </div>
      </section>

      <div v-if="$slots.default" class="seo-extra">
        <slot />
      </div>

      <section class="seo-faq">
        <div class="container">
          <p class="protocol seo-eyebrow">Common questions</p>
          <h2 class="display seo-faq-title">Common <span class="lime">questions.</span></h2>
          <FaqAccordion
            class="seo-faq-list"
            :items="faqs"
            id-prefix="seo-faq"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.11), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.045), transparent 36%),
    #000;
  color: #fff;
}

.seo-hero {
  padding: 150px 0 72px;
  overflow: hidden;
}

.seo-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.52fr);
  gap: clamp(40px, 7vw, 96px);
  align-items: center;
}

.seo-copy {
  max-width: 780px;
}

.seo-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.seo-title {
  max-width: 820px;
  font-size: clamp(54px, 8.7vw, 128px);
}

.seo-lead {
  max-width: 680px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 300;
  line-height: 1.55;
}

.seo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.seo-actions a {
  text-decoration: none;
}

.seo-metrics {
  display: grid;
  gap: 12px;
}

.seo-metric {
  min-height: 112px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(11, 18, 21, 0.72);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
}

.seo-metric strong {
  display: block;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 32px;
  line-height: 1;
}

.seo-metric span {
  display: block;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 9px;
  letter-spacing: 0.24em;
}

.seo-content,
.seo-extra,
.seo-faq {
  padding: 72px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.seo-content-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.seo-panel {
  min-height: 270px;
  padding: clamp(24px, 3vw, 36px);
  background: rgba(5, 8, 9, 0.96);
}

.seo-panel h2 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(25px, 2.8vw, 40px);
  font-style: italic;
  line-height: 0.98;
  letter-spacing: 0;
  text-transform: uppercase;
}

.seo-panel p {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
}

.seo-faq-title {
  max-width: 16ch;
  margin: 0 0 8px;
  font-size: clamp(36px, 5vw, 64px);
}

.seo-faq-list {
  margin-top: 24px;
}

@media (max-width: 900px) {
  .seo-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }

  .seo-hero-grid,
  .seo-content-grid {
    grid-template-columns: 1fr;
  }

  .seo-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .seo-hero {
    padding: 108px 0 54px;
  }

  .seo-metrics {
    grid-template-columns: 1fr;
  }

  .seo-actions {
    flex-direction: column;
  }

  .seo-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
