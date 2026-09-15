<script setup lang="ts">
import { en, sk } from '~/content/journal/index'
import { en as messagesEn, sk as messagesSk } from '~/i18n/messages/journal'

const { locale, href } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en: messagesEn, sk: messagesSk } })
const guides = computed(() => locale.value === 'sk' ? sk : en)
const description = computed(() => t('journal.indexDescription'))

useLiftagSeo(() => ({
  title: t('journal.seoTitle'),
  description: description.value,
  path: '/journal',
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: t('journal.breadcrumb'), path: href('/journal') },
  ]),
  {
    '@type': 'CollectionPage',
    '@id': `https://liftag.fit${href('/journal')}#page`,
    name: t('journal.collectionName'),
    url: `https://liftag.fit${href('/journal')}`,
    description: description.value,
    isPartOf: { '@id': 'https://liftag.fit/#website' },
    hasPart: guides.value.map(guide => ({
      '@type': 'WebPage', name: guide.title, url: `https://liftag.fit${href(guide.href)}`, description: guide.body,
    })),
  },
])
</script>

<template>
  <div class="guides-hub">
    <main>
      <header class="guides-hero container">
        <p class="protocol guides-eyebrow">{{ t('journal.indexEyebrow') }}</p>
        <h1 class="display guides-title" v-html="t('journal.indexTitle')" />
        <p class="guides-lead">{{ description }}</p>
      </header>

      <section class="container guides-grid" :aria-label="t('journal.indexAria')">
        <article v-for="guide in guides" :key="guide.href" class="guides-card">
          <p class="protocol guides-card-eyebrow">{{ guide.eyebrow }}</p>
          <h2>{{ guide.title }}</h2>
          <p>{{ guide.body }}</p>
          <a :href="href(guide.href)" class="guides-card-link">{{ guide.eyebrow === 'TOOL' || guide.eyebrow === 'NÁSTROJ' ? t('journal.open') : t('journal.read') }}</a>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.guides-hub { min-height: var(--liftag-stable-vh); background: radial-gradient(circle at 82% 18%, rgba(204,255,0,.11), transparent 34%), radial-gradient(circle at 18% 76%, rgba(255,45,85,.045), transparent 36%), #000; color:#fff; }
.guides-hero { padding:150px 0 48px; }
.guides-eyebrow { color:var(--liftag-primary); margin:0 0 18px; }
.guides-title { max-width:14ch; margin:0; font-size:clamp(52px,8vw,112px); line-height:.92; }
.guides-lead { max-width:52ch; margin:24px 0 0; color:rgba(255,255,255,.64); font-size:17px; font-weight:300; line-height:1.65; }
.guides-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; padding:0 0 96px; }
.guides-card { display:grid; align-content:start; gap:14px; min-height:280px; padding:28px 28px 24px; border:1px solid rgba(255,255,255,.08); border-radius:16px; background:rgba(11,18,21,.72); }
.guides-card-eyebrow { color:var(--liftag-primary); margin:0; }
.guides-card h2 { margin:0; font-family:var(--liftag-font-headline); font-size:clamp(24px,3vw,38px); line-height:1; }
.guides-card p:not(.protocol) { margin:0; color:rgba(255,255,255,.64); font-size:15px; line-height:1.6; }
.guides-card-link { align-self:end; color:var(--liftag-primary); font-family:var(--liftag-font-mono); font-size:11px; letter-spacing:.14em; text-decoration:none; text-transform:uppercase; }
@media (max-width:700px) { .guides-hero { padding-top:calc(120px + var(--liftag-safe-top)); } .guides-grid { grid-template-columns:1fr; } }
</style>
