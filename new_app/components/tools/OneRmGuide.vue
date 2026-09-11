<script setup lang="ts">
import { ONE_RM_DATE_PUBLISHED, ONE_RM_DATE_REVIEWED, ONE_RM_FAQS, ONE_RM_SOURCES, workedEpleyKg, workedExampleRows } from '~/utils/oneRepMaxPage'
import { STRENGTH_COMPARISON_COUNT, STRENGTH_STANDARDS } from '~/utils/strengthStandards'
const formulaRows = workedExampleRows()
const epleyKg = workedEpleyKg()
const faqs = ONE_RM_FAQS
const chapters = [
  { id: 'why', label: 'Why this calculator' },
  { id: 'what', label: 'Understand your 1RM' },
  { id: 'how', label: 'Using the calculator' },
  { id: 'method', label: 'Our method' },
  { id: 'percentile-method', label: 'Strength percentiles' },
  { id: 'formulas', label: 'The seven formulas' },
  { id: 'when-wrong', label: 'Accuracy & limitations' },
  { id: 'faq', label: 'Common questions' },
  { id: 'sources', label: 'Sources & review' },
]
</script>

<template>
  <div class="guide-layout">
    <aside class="guide-sidebar">
      <p class="guide-eyebrow">Behind the numbers</p>
      <nav aria-label="Calculator guide"><a v-for="chapter in chapters" :key="chapter.id" :href="`#${chapter.id}`">{{ chapter.label }}</a></nav>
      <a class="back-to-calculator" href="#calculator">Back to calculator ↑</a>
    </aside>
    <div class="guide-body">
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
          <h3>Pick an exercise to compare your strength</h3>
          <p>
            In See where you stand, search from {{ STRENGTH_COMPARISON_COUNT }} common gym exercises with strength benchmarks, across barbell, dumbbell, cable, and machine lifts.
            Choose a lift, enter your bodyweight, and select a comparison group to see an approximate
            “stronger than X% of lifters” ranking. Exercise selection changes the comparison, not the 1RM equation.
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
            The formula, assumptions, and worked example are also available in a
            <a href="/tools/1rm-calculator.md">plain Markdown version</a> for readers and search assistants. Core tracking is free;
            <a href="/pricing">pricing</a> is the dated fact sheet.
          </p>
        </section>

        <section id="percentile-method">
          <h2>How the strength percentile works</h2>
          <p>
            Your estimated 1RM divided by your bodyweight gives your strength-to-bodyweight ratio.
            We compare it with the published male or female ratios from Strength Level for
            the selected exercise. All {{ STRENGTH_COMPARISON_COUNT }} supported exercises have male and female benchmarks.
          </p>
          <p>
            The benchmark anchors are the 5th (beginner), 20th (novice), 50th (intermediate),
            80th (advanced), and 95th (elite) percentiles. LIFTAG linearly interpolates between
            those anchors and shows the result as “You are stronger than X% of lifters.”
            Below the 5th we show “fewer than 5%”. Past elite, lifts with a sourced all-time
            raw world-record ratio stretch that last 5% to the record as 100%. Other lifts
            keep a modeled tail and never claim 100%.
          </p>
          <p>
            This is an approximate benchmark comparison, not a measured population percentile or
            Strength Level’s exact-bodyweight calculator. The source reflects people who log lifts,
            not all people. Broad ratios do not account for age, body proportions, or all differences
            across bodyweights. Comparisons use your estimated 1RM for any valid set (1–30 reps)
            and bodyweights of 30–300 kg. Past 10 reps the 1RM is a rougher estimate, so the ranking
            is too. A result ranks the selected exercise only, not your overall fitness.
          </p>
          <p>Dumbbell loads and results are per dumbbell, including the handle; goblet squats and dumbbell pullovers use one weight.
            Machine designs and pulley ratios vary, making machine comparisons especially approximate.
            Pull-ups, chin-ups, and dips use bodyweight plus added weight for a total-load 1RM estimate;
            they do not receive a percentile because compatible bodyweight-ratio benchmarks are unavailable here.
            All training loads for these exercises include bodyweight too. “Other exercise” also gives an estimate only.</p>
          <details class="exercise-sources">
            <summary>All {{ STRENGTH_COMPARISON_COUNT }} exercise benchmarks & sources</summary>
            <p>Strength Level standards, reviewed 9 September 2026.</p>
            <ul><li v-for="standard in STRENGTH_STANDARDS" :key="standard.slug"><a :href="`https://strengthlevel.com/strength-standards/${standard.slug}`">{{ standard.label }}</a></li></ul>
          </details>
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
            <li>High-rep sets. Past 10, uncertainty increases. Use a lower-rep set before making training decisions.</li>
            <li>Isolation lifts and machines. You get more reps at a given percent than on a free squat.</li>
            <li>A bounce bench next to a paused one. The formula cannot see the standard. The log can, if you keep it honest.</li>
            <li>Squat depth, deadlift start, grip. Formula disagreement is not a confidence interval and cannot diagnose the quality of a set.</li>
            <li>Fatigue, a cut, bad sleep. Same kilos, different session. That is what
              <a href="/journal/what-is-rpe-lifting">RPE</a> is for.</li>
          </ul>
        </section>

        <section id="lifts">
          <h2>Bench, squat, and deadlift maxes</h2>
          <p>
            Select your exercise in the calculator for lift-specific context and strength benchmarks.
            The 1RM formulas remain the same. Most validation studies focus on
            <a href="/exercises/barbell-bench-press">bench</a>,
            <a href="/exercises/barbell-back-squat">squat</a>,
            <a href="/exercises/conventional-deadlift">deadlift</a>.
            A machine chest press 8RM is not a competition bench.
          </p>
          <p>
            For percentage programs like 5/3/1, use the 90% training max, as a conservative reference.
            <a href="/journal/best-workout-app-for-powerlifting">Best workout app for powerlifting</a>
            covers how that looks in a log.
          </p>
        </section>

        <section id="true-max">
          <h2>How to test a true 1RM</h2>
          <ol>
            <li>Warm up to a heavy triple you already own.</li>
            <li>Take small jumps. Leave a rep in the tank until the last attempt.</li>
            <li>Use a spotter and safeties. Set the safety pins before adding load.</li>
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
