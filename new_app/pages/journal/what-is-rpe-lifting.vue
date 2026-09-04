<script setup lang="ts">
const title = 'What is RPE in <span class="lime">lifting.</span>'
const description = 'RPE is a 1–10 rating of how hard a set was. How to use it on the bench, squat, and deadlift, when to log it, and how a workout tracker should store it next to load and rest.'

const path = '/journal/what-is-rpe-lifting'
const datePublished = '2026-08-20'

useLiftagSeo({
  title: 'What is RPE in Lifting? (How to Log It) | LIFTAG',
  description,
  path,
})

const faqs = [
  {
    question: 'What does RPE mean in lifting?',
    answer: 'Rate of Perceived Exertion. A 1–10 scale for how hard a set felt. RPE 10 is no reps left; RPE 7 is about three reps in reserve. It is not a lab measurement. It is a note you can compare week to week.',
  },
  {
    question: 'Do I have to log RPE?',
    answer: 'No. Weight, reps, and rest already explain most of a training block. Log RPE when the program uses it, when you are cutting, or when bar speed lied last week. LIFTAG treats it as optional on every set.',
  },
  {
    question: 'What is the difference between RPE and RIR?',
    answer: 'RIR is reps in reserve. RPE 8 is roughly 2 RIR. Pick one scale and stay on it. Mixing them in the same log is how “easy eight” becomes meaningless in month three.',
  },
  {
    question: 'Which workout tracker logs RPE?',
    answer: 'LIFTAG logs optional RPE on every set, next to load, reps, and rest time. Strong, Hevy, and FitNotes also support RPE or RIR depending on the screen. The useful part is seeing RPE on the same row as the weight, not in a separate notes app.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'What is RPE in lifting',
    description,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Journal', path: '/journal' },
    { name: 'What is RPE in lifting', path },
  ]),
  liftagArticle({
    headline: 'What is RPE in lifting',
    description,
    path,
    datePublished,
  }),
  liftagHowTo({
    name: 'How to log RPE on a working set',
    description: 'Rate the set after the last rep, then store it next to load and rest.',
    steps: [
      'Do the set. Do not guess the RPE during the unrack.',
      'Ask how many clean reps you had left at the last rep.',
      'Convert: 0 left = 10, 1 left = 9, 2 left = 8, 3 left = 7.',
      'Log weight, reps, rest, and that number on the same row.',
    ],
    path,
  }),
  liftagFAQPage(faqs),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow"><a href="/journal">JOURNAL</a> · LIFTING · UPDATED AUG 2026</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/" class="btn-primary">Log sets in LIFTAG</a>
            <a href="/journal/how-to-track-workouts" class="btn-ghost"><HoloPill />How to track workouts</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>The scale, without the mystique</h2>
            <p>
              RPE is a 1–10 score for how hard a set felt. Lifters mostly live between 6 and 10. A top
              <a href="/exercises/barbell-bench-press">bench</a> triple at RPE 9 is a different session from the same triple at RPE 7 with five minutes of rest. The load looks identical in a bad log. It is not identical in your spine.
            </p>
            <p>
              RPE is not magic. It is a second column so next-you can tell whether last week was heavy or just rushed.
            </p>
          </section>

          <section>
            <h2>How to rate a set</h2>
            <ol>
              <li>Finish the set. Rate the last rep, not the unrack.</li>
              <li>Count clean reps you still had. Grindy half-reps do not count as “left.”</li>
              <li>10 = none left. 9 = one. 8 = two. 7 = three. Below 6 is warm-up or you are sandbagging.</li>
              <li>Write it on the same row as the weight. A note in another app is not a log.</li>
            </ol>
            <p>
              If the last rep of a <a href="/exercises/barbell-back-squat">squat</a> was a fight and you would not have made another, that is 9 or 10. Calling it 7 so the spreadsheet looks pretty is how blocks stall.
            </p>
          </section>

          <section>
            <h2>When RPE earns its keep</h2>
            <ul>
              <li>Peaking or fatigue weeks, when the same load feels different on Thursday than on Monday.</li>
              <li>Cuts, travel, bad sleep — load stays, effort does not.</li>
              <li>Programs that prescribe “RPE 8 triples” instead of a fixed kilo.</li>
            </ul>
            <p>
              You do not need RPE on every warmup. You do need it on the work sets you will compare. Pair it with rest time:
              <a href="/journal/how-to-track-workouts">how to track workouts</a> covers that pairing.
            </p>
          </section>

          <section>
            <h2>Logging it in a tracker</h2>
            <p>
              LIFTAG stores optional RPE on the set, next to load, reps, and rest. Estimated 1RM still reads the kilos and reps; RPE is context, not a second formula pretending to be science. If you skip RPE, the log still works. If you log it, the
              <a href="/journal/progressive-overload">overload</a> decision next week is cleaner.
            </p>
          </section>

          <section class="guide-faq">
            <h2>Frequently asked questions</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="rpe-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">Written by</p>
            <p>The LIFTAG team. We log RPE as an optional set field, not a personality test. Updated August 2026.</p>
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
