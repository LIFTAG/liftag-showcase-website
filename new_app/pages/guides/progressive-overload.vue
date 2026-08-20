<script setup lang="ts">
const title = 'Progressive <span class="lime">overload.</span>'
const description = 'Progressive overload is adding a small, honest demand over time: load, reps, or sets. How to do it on the big lifts without inflating the log, and how a workout tracker makes the next jump obvious.'

const path = '/guides/progressive-overload'
const datePublished = '2026-08-20'

useLiftagSeo({
  title: 'Progressive Overload: How to Add Load Without Lying | LIFTAG',
  description,
  path,
})

const faqs = [
  {
    question: 'What is progressive overload?',
    answer: 'Doing a bit more over time than the same lift used to cost you: more weight, more reps at the same weight, another set, or the same work with less cheating. It is not adding 5 kg every Monday until the bar slows to a stop.',
  },
  {
    question: 'Should I add weight every session?',
    answer: 'Only while the reps stay clean. A failed grind that you still log as a PR is not overload. It is noise. Add a rep first, then load, on lifts like bench and squat.',
  },
  {
    question: 'How does a workout tracker help with overload?',
    answer: 'It shows last week’s top set before you unrack. LIFTAG keeps PRs, estimated 1RM, rest, and optional RPE on the same exercise, so you are not guessing whether the jump is real.',
  },
  {
    question: 'What if I stall?',
    answer: 'Change one variable. Pause the bench. Swap to a close-grip. Drop to 3s and rebuild. Logging the variation as a note — or as its own lift — keeps the stall visible instead of hidden in a mixed average.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'Progressive overload',
    description,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: 'Progressive overload', path },
  ]),
  liftagArticle({
    headline: 'Progressive overload',
    description,
    path,
    datePublished,
  }),
  liftagHowTo({
    name: 'How to overload a lift without faking the log',
    description: 'Pick one lever, beat last week, then write it down.',
    steps: [
      'Open last week’s work sets for that lift before you warm up.',
      'Pick one lever: a rep, a kilo, or a set. Not all three.',
      'Hit it with the same rest and the same standard (pause, depth, lockout).',
      'Log the set. If you failed the standard, do not mark a PR.',
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
          <p class="protocol guide-eyebrow"><a href="/guides">GUIDES</a> · LIFTING · UPDATED AUG 2026</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/" class="btn-primary">Track the next jump</a>
            <a href="/guides/what-is-rpe-lifting" class="btn-ghost">What is RPE</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>The actual job</h2>
            <p>
              Progressive overload is not a personality. It is a rule: this week’s
              <a href="/exercises/conventional-deadlift">deadlift</a> should cost the body a little more than last week’s, or you are maintaining. Maintaining is fine. Calling it a peak is not.
            </p>
            <p>
              The log exists so you can see the lever you pulled. Without it, “I went harder” is indistinguishable from “I bounced the bench.”
            </p>
          </section>

          <section>
            <h2>Levers that count</h2>
            <ul>
              <li><strong>Load</strong> — smallest plate that does not wreck the reps.</li>
              <li><strong>Reps</strong> — 3×5 becoming 3×6 at the same kilo is overload. Chase this before ego loading a
                <a href="/exercises/barbell-bench-press">bench</a>.</li>
              <li><strong>Sets</strong> — another work set, not another warmup you relabel.</li>
              <li><strong>Quality</strong> — pause, full depth, locked elbows. Harder with the same number still counts if you write the standard down.</li>
            </ul>
            <p>
              Rest is not a lever to shorten so the session looks denser. Shorter rest with worse reps is a different workout. Log rest if you change it. See
              <a href="/guides/how-to-track-workouts">how to track workouts</a>.
            </p>
          </section>

          <section>
            <h2>How to add without lying</h2>
            <ol>
              <li>Read last week before you unrack. That is the whole point of a tracker.</li>
              <li>Change one thing. A kilo and two extra reps and a dropped rest is three experiments.</li>
              <li>Keep the standard. If last week’s squat hit depth, this week’s PR has to as well.</li>
              <li>If it fails, log the fail. A skipped row is how stalls hide.</li>
            </ol>
            <p>
              LIFTAG keeps the last working sets, PRs, and estimated 1RM on the lift you actually performed — the
              <a href="/exercises">library</a> is the same catalog as the app. Estimated 1RM is a trend, not a meet attempt.
            </p>
          </section>

          <section>
            <h2>When the lift stalls</h2>
            <p>
              Swap the variation, not the story. Close-grip instead of the main bench. Front squat instead of another ugly high-bar week. Log it as the variation’s own page —
              <a href="/exercises/close-grip-bench-press">close-grip bench</a>,
              <a href="/exercises/barbell-front-squat">front squat</a> —
              so the main lift’s PR chart stays honest.
            </p>
          </section>

          <section class="guide-faq">
            <h2>Frequently asked questions</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="overload-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">Written by</p>
            <p>The LIFTAG team. We built a log so overload is a row, not a mood. Updated August 2026.</p>
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
