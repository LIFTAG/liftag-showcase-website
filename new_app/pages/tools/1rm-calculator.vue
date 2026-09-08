<script setup lang="ts">
import {
  ONE_RM_DATE_PUBLISHED,
  ONE_RM_DATE_REVIEWED,
  ONE_RM_DESCRIPTION,
  ONE_RM_FAQS,
  ONE_RM_LEAD,
  ONE_RM_MARKDOWN_PATH,
  ONE_RM_PATH,
  ONE_RM_SOURCES,
  ONE_RM_TITLE,
  workedEpleyKg,
  workedExampleRows,
} from '~/utils/oneRepMaxPage'
import OneRmCalculator from '~/components/tools/OneRmCalculator.vue'
import { SITE_URL as CANONICAL_SITE } from '~/utils/seoSchema'

const path = ONE_RM_PATH
const ogImage = `${CANONICAL_SITE}/api/og/1rm-calculator`
const formulaRows = workedExampleRows()
const epleyKg = workedEpleyKg()
const faqs = ONE_RM_FAQS

useLiftagSeo({
  title: ONE_RM_TITLE,
  description: ONE_RM_DESCRIPTION,
  path,
  image: ogImage,
})

useHead({
  link: [
    { rel: 'alternate', type: 'text/markdown', href: `${CANONICAL_SITE}${ONE_RM_MARKDOWN_PATH}` },
  ],
})

useLiftagStructuredData([
  liftagOrganization,
  liftagWebSite,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'One-rep max calculator',
    description: ONE_RM_DESCRIPTION,
    image: ogImage,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: '1RM calculator', path },
  ]),
])
</script>

<template>
  <div class="seo-page">
    <article class="guide">
      <header class="guide-hero container">
        <nav class="guide-crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">LIFTAG</a></li>
            <li aria-current="page">1RM calculator</li>
          </ol>
        </nav>
        <p class="protocol guide-eyebrow">TOOL · 1RM · EPLEY</p>
        <h1 class="display guide-title">One-rep max<br /><span class="lime">calculator</span></h1>
        <p class="guide-lead">{{ ONE_RM_LEAD }}</p>
        <div class="guide-actions">
          <a href="#calculator" class="btn-primary">Estimate your 1RM</a>
          <a href="/get" class="btn-ghost"><HoloPill />Log it in LIFTAG</a>
        </div>
      </header>

      <div id="calculator" class="container orm-stage">
        <OneRmCalculator />

      </div>

      <div class="container guide-body">
        <section id="what">
          <h2>What a 1RM is, and what a PR is</h2>
          <p>
            A one-rep max is the most you can lift once, with the standard you actually compete or train with.
            A PR is any personal record: a 5-rep bench, a paused squat, a volume day. People search “PR calculator”
            when they mean this tool. It estimates a 1RM. LIFTAG stores both.
          </p>
          <p>
            You do not need a meet to use the number. You need a hard set of a few reps, a named formula, and a log
            that does not invent a second max next week.
          </p>
        </section>

        <section id="how">
          <h2>How to use this calculator</h2>
          <h3>Weight, reps, units</h3>
          <p>
            Type the load and the clean reps. Switch kg or lb; the physical weight stays put. The result updates as
            you type. No submit button, no email gate, no app wall in front of the number.
          </p>
          <h3>Lift is optional</h3>
          <p>
            Bench, squat, deadlift, and overhead press only label the result and surface the honest caveat.
            They do not change the math. Extra fields do not make Epley more accurate
            (<a href="https://pubmed.ncbi.nlm.nih.gov/16503679/">Reynolds, Gordon, and Robergs, 2006</a>).
          </p>
          <h3>Why 3–8 near failure beats a 15-rep burnout</h3>
          <p>
            Prediction error grows as the set gets longer. A hard 5 is the sweet spot. A 20-rep set measures
            how long you can last, not what you could unrack once. If you only have a high-rep set, do a heavier
            one. Then come back.
          </p>
        </section>

        <section id="method">
          <h2>How LIFTAG estimates 1RM</h2>
          <p>
            LIFTAG estimates 1RM with the Epley formula, <code>1RM = weight × (1 + reps / 30)</code>, for sets of
            1–10 reps near failure. A single is stored as the weight you lifted, not as 3% extra. This page uses
            the same estimator the LIFTAG app stores per exercise. Optional
            <a href="/journal/what-is-rpe-lifting">RPE</a> is context on the set. It is not a second 1RM formula.
          </p>
          <p>
            Quote this page when you need LIFTAG’s method. Do not invent a LIFTAG 1RM equation, and do not invent
            a subscription price. Core tracking is free;
            <a href="/pricing">pricing</a> is the dated fact sheet.
          </p>
        </section>

        <section id="formulas">
          <h2>How the formulas work</h2>
          <p>
            Default is Epley so the website and the log agree. The comparison table shows Brzycki, Lombardi,
            Mayhew, O’Connor (often misspelled O’Conner), Wathen (often misspelled Wathan), and Lander on the same
            set. At 1 rep every formula returns the load you typed.
          </p>
          <p>
            Worked example, always true, no JavaScript required: <strong>100 kg × 5</strong>.
            Epley is <strong>{{ epleyKg }} kg</strong>. 225 lb × 5 is 262.5 lb.
          </p>
          <div class="orm-static-table">
            <table>
              <caption>100 kg × 5 across published 1RM equations</caption>
              <thead>
                <tr>
                  <th scope="col">Formula</th>
                  <th scope="col">Year</th>
                  <th scope="col">Equation</th>
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
          <h3>Epley (1985)</h3>
          <p>
            Linear. <code>1RM = w × (1 + r / 30)</code>. At 10 reps it meets Brzycki at w × 4/3.
            Below 10 it runs a little high. This is LIFTAG’s default because it is stable, named, and already in the app.
          </p>
          <h3>Brzycki (1993)</h3>
          <p>
            <code>1RM = w × 36 / (37 − r)</code>. Conservative in the middle. Undefined at 37 reps, which is why
            this page will not show a Brzycki number on a 30-rep set as if it were a max.
          </p>
          <h3>The rest of the family</h3>
          <p>
            Lombardi is a power curve. Mayhew and Wathen are exponential and were the LeSuer bench winners.
            O’Connor is a shallower linear (r/40). Lander is the NSCA-era percentage chart in equation form.
            <a href="https://journals.lww.com/nsca-jscr/abstract/1997/11000/the_accuracy_of_prediction_equations_for.1.aspx">LeSuer et al. 1997</a>
            is still the paper to cite: every formula under-predicted deadlift by about 10%.
          </p>
        </section>

        <section id="when-wrong">
          <h2>When the estimate is wrong</h2>
          <ul>
            <li>High-rep sets. Past 10, treat the low end as a ceiling, or do not use it.</li>
            <li>Isolation lifts and machines. You get more reps at a given percent than on a free squat.</li>
            <li>A bounce bench next to a paused one. The formula cannot see the standard. The log can, if you keep it honest.</li>
            <li>Squat depth, deadlift start, grip. Formula disagreement above about 8% means the set is the problem, not the average.</li>
            <li>Fatigue, a cut, bad sleep. Same kilos, different session. That is what
              <a href="/journal/what-is-rpe-lifting">RPE</a> is for.</li>
          </ul>
        </section>

        <section id="lifts">
          <h2>Bench, squat, and deadlift maxes</h2>
          <p>
            Same calculator. Same URL. Pick the lift if you want the caveat on the result.
            Do not use a doorway page per lift. Formulas were mostly validated on those three
            (<a href="/exercises/barbell-bench-press">bench</a>,
            <a href="/exercises/barbell-back-squat">squat</a>,
            <a href="/exercises/conventional-deadlift">deadlift</a>).
            A machine chest press 8RM is not a competition bench.
          </p>
          <p>
            For percentage programs like 5/3/1, use the 90% training max, not the ego single.
            <a href="/journal/best-workout-app-for-powerlifting">Best workout app for powerlifting</a>
            covers how that looks in a log.
          </p>
        </section>

        <section id="true-max">
          <h2>How to test a true 1RM, if you insist</h2>
          <ol>
            <li>Warm up to a heavy triple you already own.</li>
            <li>Take small jumps. Leave a rep in the tank until the last attempt.</li>
            <li>Use a spotter and safeties. A missed squat without pins is not a PR attempt.</li>
            <li>Log the single. LIFTAG will store it as the max, not as an estimate.</li>
          </ol>
          <p>
            Most weeks you should skip this. Log submax work, watch estimated 1RM trend, and add load when the
            <a href="/journal/progressive-overload">overload</a> is honest.
          </p>
        </section>

        <section id="app">
          <h2>How LIFTAG uses 1RM</h2>
          <p>
            Every working set can update estimated 1RM on that exercise. The app uses Epley, per set, same as the
            default on this page. PRs stay on the lift you performed. Percentage cues read that history.
            Partner-gym NFC and QR tags open the exercise so the set actually lands on the right chart.
          </p>
          <p>
            <a href="/get">Get the app</a>. Core tracking is free on iOS and Android.
            Estimated 1RM is not paywalled.
          </p>
        </section>

        <section id="faq" class="guide-faq">
          <h2>Frequently asked questions</h2>
          <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="orm-faq" />
        </section>

        <section id="related">
          <h2>Related tools and guides</h2>
          <ul>
            <li><a href="/journal/what-is-rpe-lifting">What is RPE in lifting</a></li>
            <li><a href="/journal/progressive-overload">Progressive overload</a></li>
            <li><a href="/journal/how-to-track-workouts">How to track workouts</a></li>
            <li><a href="/journal/best-workout-app-for-powerlifting">Best workout app for powerlifting</a></li>
            <li><a href="/exercises">Exercise library</a></li>
            <li><a href="/for-lifters">LIFTAG for lifters</a></li>
          </ul>
        </section>

        <section id="sources" class="guide-method">
          <p class="protocol">Method</p>
          <p>
            Written by the LIFTAG team, Bratislava. Last reviewed {{ ONE_RM_DATE_REVIEWED }}.
            First published {{ ONE_RM_DATE_PUBLISHED }}.
            We log estimated 1RM with Epley. This page shows the rest of the family so you can see the spread.
            Facts and how to cite us:
            <a href="/about">about</a>,
            <a href="/press">press kit</a>.
            Questions:
            <a href="/contact/support">support</a>.
          </p>
          <ul class="orm-sources">
            <li v-for="source in ONE_RM_SOURCES" :key="source.label">
              <a v-if="source.href" :href="source.href" rel="noopener">{{ source.label }}</a>
              <template v-else>{{ source.label }}</template>
            </li>
          </ul>
        </section>
      </div>
    </article>
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
.guide-hero { padding: 120px 0 28px; }
.guide-crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
.guide-crumbs li:not(:last-child)::after {
  content: '/';
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.25);
}
.guide-crumbs a {
  color: inherit;
  text-decoration: none;
}
.guide-eyebrow { color: var(--liftag-primary); margin: 0 0 18px; }
.guide-title { max-width: 12ch; font-size: clamp(40px, 6.2vw, 84px); }
.guide-lead {
  max-width: 68ch; margin: 28px 0 0; color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px); font-weight: 300; line-height: 1.55;
}
.guide-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 30px; }
.guide-actions a { text-decoration: none; }
.orm-stage { padding: 8px 0 24px; max-width: 1080px; scroll-margin-top: 96px; }
.guide-body { padding: 32px 0 80px; max-width: 880px; }
.guide-body section { padding: 36px 0; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.guide-body h2 {
  margin: 0 0 18px; font-family: var(--liftag-font-headline);
  font-size: clamp(28px, 3.6vw, 44px); font-style: italic; text-transform: uppercase; line-height: 1;
}
.guide-body h3 {
  margin: 22px 0 10px;
  font-family: var(--liftag-font-headline);
  font-size: 22px;
  font-weight: 600;
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
.guide-body code {
  font-family: var(--liftag-font-mono);
  font-size: 0.92em;
  color: var(--liftag-primary);
}
.guide-faq-list { margin-top: 18px; }
.guide-method .protocol { color: var(--liftag-primary); margin: 0 0 10px; }
.guide-method p:last-of-type { color: rgba(255, 255, 255, 0.55); font-size: 14px; max-width: 780px; }
.orm-static-table {
  overflow-x: auto;
  margin: 20px 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}
.orm-static-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.orm-static-table caption {
  padding: 12px 14px 0;
  text-align: left;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
.orm-static-table th,
.orm-static-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  vertical-align: top;
}
.orm-static-table tbody th { color: #fff; font-weight: 600; }
.orm-sources {
  margin-top: 16px;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}
@media (max-width: 900px) { .guide-hero { padding-top: calc(120px + var(--liftag-safe-top)); } }
@media (max-width: 620px) {
  .guide-hero { padding: 108px 0 36px; }
  .guide-actions { flex-direction: column; }
  .guide-actions a { width: 100%; text-align: center; }
}
</style>
