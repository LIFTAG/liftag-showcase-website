<script setup lang="ts">
import { ONE_RM_DATE_PUBLISHED, ONE_RM_DATE_REVIEWED, ONE_RM_SOURCES, workedEpleyKg, workedExampleRows } from '~/utils/oneRepMaxPage'
import { STRENGTH_COMPARISON_COUNT, STRENGTH_STANDARDS } from '~/utils/strengthStandards'
import { en, sk } from '~/i18n/messages/tools'
import { en as guideEn, sk as guideSk } from '~/content/tools/oneRmGuide'
import { localizedExerciseLabel } from '~/content/tools/oneRmExercises'
const { t, d } = useI18n({ useScope: 'local', messages: { en, sk } })
const { href, locale } = useSiteLocale()
const guideCopy = computed(() => locale.value === 'sk' ? guideSk : guideEn)
const reviewedDate = computed(() => d(new Date(`${ONE_RM_DATE_REVIEWED}T00:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' }))
const publishedDate = computed(() => d(new Date(`${ONE_RM_DATE_PUBLISHED}T00:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' }))
const formulaRows = computed(() => workedExampleRows(locale.value))
const epleyKg = computed(() => workedEpleyKg(locale.value))
const faqs = computed(() => guideCopy.value.faqs)
const sourceLabels = computed(() => guideCopy.value.sourceLabels)
const withCount = (copy: string) => copy.replace('{count}', String(STRENGTH_COMPARISON_COUNT))
const withDates = (copy: string) => copy.replace('{reviewed}', reviewedDate.value).replace('{published}', publishedDate.value)
const chapters = computed(() => [
  { id: 'why', label: t('tools.why.eyebrow') }, { id: 'what', label: t('tools.guide.what') }, { id: 'how', label: t('tools.guide.how') },
  { id: 'method', label: t('tools.guide.method') }, { id: 'percentile-method', label: t('tools.guide.percentile') }, { id: 'formulas', label: t('tools.guide.formulas') },
  { id: 'when-wrong', label: t('tools.guide.whenWrong') }, { id: 'faq', label: t('tools.guide.faq') }, { id: 'sources', label: t('tools.guide.sourcesReview') },
])
</script>

<template>
  <div class="guide-layout">
    <aside class="guide-sidebar">
      <p class="guide-eyebrow">{{ t('tools.guide.behind') }}</p>
      <nav :aria-label="t('tools.guide.nav')"><a v-for="chapter in chapters" :key="chapter.id" :href="`#${chapter.id}`">{{ chapter.label }}</a></nav>
      <a class="back-to-calculator" href="#calculator">{{ t('tools.guide.back') }}</a>
    </aside>
    <div class="guide-body">
        <section id="what">
          <h2>{{ t('tools.guide.what') }}</h2>
          <p>{{ guideCopy.whatIntro }}</p>
          <p>{{ guideCopy.whatDetail }}</p>
        </section>

        <section id="how">
          <h2>{{ t('tools.guide.how') }}</h2>
          <h3>{{ t('tools.guide.weight') }}</h3>
          <p>{{ guideCopy.weight }}</p>
          <h3>{{ t('tools.guide.pick') }}</h3>
          <p>{{ withCount(guideCopy.pick) }}</p>
          <h3>{{ t('tools.guide.failure') }}</h3>
          <p>{{ guideCopy.failure }}</p>
        </section>

        <section id="method">
          <h2>{{ t('tools.guide.method') }}</h2>
          <p>{{ guideCopy.methodIntro }}</p>
          <p>{{ guideCopy.methodDetails }}</p>
        </section>

        <section id="percentile-method">
          <h2>{{ t('tools.guide.percentile') }}</h2>
          <p>{{ guideCopy.percentileIntro }}</p>
          <p>{{ guideCopy.percentileAnchors }}</p>
          <p>{{ guideCopy.percentileLimits }}</p>
          <p>{{ guideCopy.equipment }}</p>
          <details class="exercise-sources">
            <summary>{{ withCount(guideCopy.exerciseSourcesSummary) }}</summary>
            <p>{{ guideCopy.exerciseSourcesNote }}</p>
            <ul><li v-for="(standard, standardId) in STRENGTH_STANDARDS" :key="standard.slug"><a :href="`https://strengthlevel.com/strength-standards/${standard.slug}`">{{ localizedExerciseLabel(standardId, standard.label, locale) }}</a></li></ul>
          </details>
        </section>

        <section id="formulas">
          <h2>{{ t('tools.guide.formulas') }}</h2>
          <p>{{ guideCopy.formulasIntro }}</p>
          <p>{{ guideCopy.formulaExample.replace('{value}', epleyKg) }}</p>
          <div class="orm-static-table">
            <table>
              <caption>{{ t('tools.guide.formulas') }}</caption>
              <thead>
                <tr>
                  <th scope="col">{{ t('tools.tables.formula') }}</th>
                  <th scope="col">{{ t('tools.tables.year') }}</th>
                  <th scope="col">{{ t('tools.tables.exact') }}</th>
                  <th scope="col">100 kg × 5</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in formulaRows" :key="row.id">
                  <th scope="row">{{ row.name }}</th>
                  <td>{{ row.year }}</td>
                  <td><code>{{ row.equation }}</code></td>
                  <td>{{ row.kg }} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>{{ guideCopy.epleyHeading }}</h3>
          <p>{{ guideCopy.epleyBody }}</p>
          <h3>{{ guideCopy.brzyckiHeading }}</h3>
          <p>{{ guideCopy.brzyckiBody }}</p>
          <h3>{{ guideCopy.familyHeading }}</h3>
          <p>{{ guideCopy.familyBody }}</p>
        </section>

        <section id="when-wrong">
          <h2>{{ t('tools.guide.whenWrong') }}</h2>
          <ul><li v-for="item in guideCopy.wrong" :key="item">{{ item }}</li></ul>
        </section>

        <section id="lifts">
          <h2>{{ t('tools.guide.lifts') }}</h2>
          <p>{{ guideCopy.liftsIntro }}</p>
          <p>{{ guideCopy.liftsProgram }}</p>
        </section>

        <section id="true-max">
          <h2>{{ t('tools.guide.trueMax') }}</h2>
          <ol><li v-for="item in guideCopy.testing" :key="item">{{ item }}</li></ol>
          <p>{{ guideCopy.trueMaxIntro }}</p>
        </section>

        <section id="app">
          <h2>{{ t('tools.guide.app') }}</h2>
          <p>{{ guideCopy.appIntro }}</p>
          <p><a :href="href('/get')">{{ guideCopy.appGetLabel }}</a>. {{ guideCopy.appGetTail }}</p>
        </section>

        <section id="faq" class="guide-faq">
          <h2>{{ t('tools.guide.faq') }}</h2>
          <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="orm-faq" />
        </section>

        <section id="related">
          <h2>{{ t('tools.guide.related') }}</h2>
          <ul>
            <li><a :href="href('/journal/what-is-rpe-lifting')">{{ t('tools.guide.relatedRpe') }}</a></li>
            <li><a :href="href('/journal/progressive-overload')">{{ t('tools.guide.relatedOverload') }}</a></li>
            <li><a :href="href('/journal/how-to-track-workouts')">{{ t('tools.guide.relatedTrack') }}</a></li>
            <li><a :href="href('/journal/best-workout-app-for-powerlifting')">{{ t('tools.guide.relatedPower') }}</a></li>
            <li><a :href="href('/exercises')">{{ t('tools.guide.exerciseLibrary') }}</a></li>
            <li><a :href="href('/for-lifters')">{{ t('tools.guide.forLifters') }}</a></li>
          </ul>
        </section>

        <section id="sources" class="guide-method">
          <p class="protocol">{{ t('tools.guide.sources') }}</p>
          <p>{{ withDates(guideCopy.sourcesIntro) }} {{ guideCopy.sourcesFacts }} <a :href="href('/about')">{{ t('tools.guide.about') }}</a>, <a :href="href('/press')">{{ t('tools.guide.pressKit') }}</a>. {{ guideCopy.sourcesQuestions }} <a :href="href('/contact/support')">{{ t('tools.guide.support') }}</a>.</p>
          <ul class="orm-sources">
            <li v-for="(source, index) in ONE_RM_SOURCES" :key="source.label">
              <a v-if="source.href" :href="source.href" rel="noopener">{{ sourceLabels[index] }}</a>
              <template v-else>{{ sourceLabels[index] }}</template>
            </li>
          </ul>
        </section>
    </div>
  </div>
</template>

<style scoped>
.exercise-sources { margin-top: 24px; }
.exercise-sources summary { cursor: pointer; font-size: 15px; padding: 12px 0; }
.exercise-sources ul { columns: 2; }
.exercise-sources li { break-inside: avoid; margin-bottom: 8px; }
@media (max-width: 700px) { .exercise-sources ul { columns: 1; } }
.guide-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 68px; padding: 70px 0 100px; }
.guide-sidebar { align-self: start; position: sticky; top: 110px; }
.guide-eyebrow { color: var(--liftag-primary); font-size: 10px; letter-spacing: .13em; text-transform: uppercase; margin: 0 0 22px; }
.guide-sidebar nav { display: flex; flex-direction: column; gap: 0; }
.guide-sidebar nav a { display: block; padding: 10px 0; color: oklch(72% .008 115); font-size: 12px; text-decoration: none; }
.guide-sidebar nav a:hover { color: oklch(96% .007 115); }
.back-to-calculator { display: inline-block; margin-top: 22px; font-size: 12px; color: oklch(96% .007 115); text-underline-offset: 5px; }
.guide-body { min-width: 0; }
.guide-body section { padding: 30px 0 !important; border-top: 1px solid oklch(26% .006 115); scroll-margin-top: 100px; }
.guide-body h2 { margin: 0 0 20px; font-family: var(--liftag-font-headline); font-size: 28px; font-weight: 500; letter-spacing: -.045em; line-height: 1.15; text-wrap: balance; }
.guide-body h3 { margin: 26px 0 10px; font-size: 17px; font-weight: 500; letter-spacing: -.015em; }
.guide-body p, .guide-body li { color: oklch(75% .008 115); font-size: 14px; line-height: 1.85; }
.guide-body p { margin: 0; max-width: 72ch; }
.guide-body p + p { margin-top: 14px; }
.guide-body ul, .guide-body ol { padding-left: 20px; }
.guide-body li { margin-bottom: 10px; }
.guide-body strong { color: oklch(96% .007 115); font-weight: 550; }
.guide-body a { color: inherit; text-decoration-color: oklch(50% .009 115); text-underline-offset: 4px; }
.guide-body a:hover { color: var(--liftag-primary); }
.guide-body code { color: oklch(87% .045 115); font-family: var(--liftag-font-mono); font-size: .85em; overflow-wrap: anywhere; }
.guide-faq-list { margin-top: 24px; }
.guide-method .protocol { margin-bottom: 14px; font-size: 10px; }
.guide-method p, .guide-method li { font-size: 12px; }
.orm-static-table { overflow-x: auto; margin: 24px 0; border: 1px solid oklch(28% .008 115); border-radius: 10px; }
.orm-static-table table { width: 100%; border-collapse: collapse; font-size: 12px; }
.orm-static-table caption { padding: 14px; text-align: left; color: oklch(72% .008 115); font-size: 11px; }
.orm-static-table th, .orm-static-table td { padding: 12px; text-align: left; border-top: 1px solid oklch(28% .008 115); vertical-align: top; }
.orm-static-table tbody th { font-weight: 500; }
.orm-static-table code { white-space: nowrap; }
@media (max-width: 900px) { .guide-layout { grid-template-columns: 180px minmax(0, 1fr); gap: 36px; } }
@media (max-width: 700px) {
  .guide-layout { display: block; padding: 40px 0 60px; }
  .guide-sidebar { position: static; margin-bottom: 32px; }
  .guide-sidebar nav { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  .guide-body h2 { font-size: 25px; }
  .guide-body section { padding: 30px 0 !important; }
}
</style>
