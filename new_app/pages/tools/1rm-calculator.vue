<script setup lang="ts">
import { ONE_RM_DESCRIPTION, ONE_RM_FAQS, ONE_RM_H1, ONE_RM_MARKDOWN_PATH, ONE_RM_PATH, ONE_RM_TITLE } from '~/utils/oneRepMaxPage'
import OneRmCalculator from '~/components/tools/OneRmCalculator.vue'
import OneRmWhy from '~/components/tools/OneRmWhy.vue'
import OneRmGuide from '~/components/tools/OneRmGuide.vue'
import { SITE_URL } from '~/utils/seoSchema'

const ogImage = `${SITE_URL}/api/og/1rm-calculator`
useLiftagSeo({ title: ONE_RM_TITLE, description: ONE_RM_DESCRIPTION, path: ONE_RM_PATH, image: ogImage })
useHead({ link: [{ rel: 'alternate', type: 'text/markdown', href: `${SITE_URL}${ONE_RM_MARKDOWN_PATH}` }] })
useLiftagStructuredData([
  liftagOrganization,
  liftagWebSite,
  liftagWebPage({ path: ONE_RM_PATH, name: ONE_RM_H1, description: ONE_RM_DESCRIPTION, image: ogImage }),
  liftagBreadcrumbs([{ name: 'LIFTAG', path: '/' }, { name: '1RM calculator', path: ONE_RM_PATH }]),
  {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}${ONE_RM_PATH}#application`,
    name: 'LIFTAG 1RM Calculator',
    url: `${SITE_URL}${ONE_RM_PATH}`,
    description: ONE_RM_DESCRIPTION,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript for interactive calculations.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    featureList: ['One-rep max estimation', 'Seven published formulas', 'Kilograms and pounds', 'Training percentages', 'Interactive rep-max curve', 'Approximate strength percentiles for common gym exercises', 'Exercise-specific weight guidance'],
    datePublished: '2026-09-09',
    dateModified: '2026-09-11',
  },
  liftagFAQPage(ONE_RM_FAQS),
])
</script>

<template>
  <article class="one-rm-page">
    <div class="calculator-shell">
      <header class="calculator-header">
        <div>
          <nav class="calculator-crumbs" aria-label="Breadcrumb"><a href="/">LIFTAG</a><span aria-hidden="true">/</span><span aria-current="page">Training tools</span></nav>
          <h1>{{ ONE_RM_H1 }}<span class="title-dot" aria-hidden="true">.</span></h1>
          <p>One hard set. See what you’re capable of.</p>
        </div>
        <div class="header-links">
          <a class="method-link" href="#why">Why this calculator <span aria-hidden="true">↗</span></a>
          <a class="method-link" href="#method">How the estimate works <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      <div id="calculator" class="calculator-stage">
        <OneRmCalculator />
        <noscript>Enable JavaScript to edit the calculator. The example shown is 100 kg × 5 = 116.7 kg using Epley. The formulas and guide below work without JavaScript.</noscript>
      </div>
      <OneRmWhy />
      <div class="app-invitation"><p><strong>Make progress a habit.</strong> Track your sets. Watch your max grow.</p><a href="/get">Track with LIFTAG <span aria-hidden="true">↗</span></a></div>
      <OneRmGuide />
    </div>
  </article>
</template>

<style scoped>
.one-rm-page { min-height: var(--liftag-stable-vh); background: oklch(12% .005 115); color: oklch(96% .007 115); }
.calculator-shell { width: min(100% - 80px, 1120px); margin: 0 auto; padding-top: calc(104px + var(--liftag-safe-top)); }
.calculator-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding-bottom: 26px; }
.calculator-crumbs { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; font-size: 10px; color: oklch(68% .008 115); }
.calculator-crumbs a { color: inherit; text-decoration: none; font-weight: 650; letter-spacing: .08em; }
.calculator-header h1 { margin: 0; font-family: var(--liftag-font-headline); font-size: 40px; line-height: 1.15; font-weight: 500; letter-spacing: -.055em; }
.title-dot { color: var(--liftag-primary); }
.calculator-header p { margin: 10px 0 0; color: oklch(71% .009 115); font-size: 14px; }
.header-links { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-bottom: 2px; }
.method-link { font-size: 11px; color: oklch(71% .009 115); text-decoration: none; white-space: nowrap; }
.method-link:hover { color: oklch(96% .007 115); }
.method-link span { margin-left: 10px; color: var(--liftag-primary); }
.calculator-stage { scroll-margin-top: 90px; }
.app-invitation { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 30px 0; margin-top: 20px; border-bottom: 1px solid oklch(26% .006 115); }
.app-invitation p { margin: 0; font-size: 13px; color: oklch(71% .009 115); line-height: 1.7; }
.app-invitation strong { color: oklch(96% .007 115); font-weight: 500; margin-right: 6px; }
.app-invitation a { flex-shrink: 0; padding: 13px 17px; border: 1px solid oklch(37% .015 115); border-radius: 9px; color: oklch(96% .007 115); font-size: 12px; text-decoration: none; transition: border-color .2s, color .2s; }
.app-invitation a:hover { border-color: var(--liftag-primary); color: var(--liftag-primary); }
a:focus-visible { outline: 2px solid var(--liftag-primary); outline-offset: 5px; }
@media (max-width: 900px) { .header-links { display: none; } }
@media (max-width: 700px) {
  .calculator-shell { width: calc(100% - 32px); padding-top: calc(86px + var(--liftag-safe-top)); }
  .calculator-header { padding-bottom: 20px; }
  .calculator-crumbs { margin-bottom: 10px; }
  .calculator-header h1 { font-size: 27px; }
  .calculator-header p { margin-top: 7px; font-size: 13px; }
  .app-invitation { align-items: flex-start; flex-direction: column; padding: 24px 0; gap: 14px; }
  .app-invitation strong { display: block; }
}
@media (max-width: 360px) { .calculator-header h1 { font-size: 24px; } }
@media (prefers-reduced-motion: reduce) { .app-invitation a { transition: none; } }
</style>
