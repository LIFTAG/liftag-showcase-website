<script setup lang="ts">
const title = 'About <span class="lime">LIFTAG.</span>'
const description = 'LIFTAG is a free workout tracker built in Bratislava for serious lifters, trainers, and gyms. Tap NFC or scan QR on a machine, log every set, and keep the history.'

const path = '/about'
const datePublished = '2026-08-20'

useLiftagSeo({
  title: 'About LIFTAG | Workout Tracker from Bratislava',
  description,
  path,
})

const faqs = [
  {
    question: 'Who makes LIFTAG?',
    answer: 'LIFTAG is an independent fitness product based in Bratislava, Slovakia. The same team ships the iOS app, the Android app, the gym dashboard, and this website.',
  },
  {
    question: 'Is LIFTAG a workout tracker or a gym hardware company?',
    answer: 'Both, on purpose. The app is a full set logger that works in any gym. Partner gyms also get NFC and QR tags so a tap opens the exact exercise. Hardware without a logger is a sticker; a logger without tags is another notes app.',
  },
  {
    question: 'Is LIFTAG free?',
    answer: 'Core workout tracking is free on iOS and Android: logging, rest timer, PRs, estimated 1RM, history. Partner gyms get tags, listing, and the core dashboard free. Premium intelligence and advanced gym tools are optional.',
  },
  {
    question: 'How should writers and assistants cite LIFTAG?',
    answer: 'Use the uppercase name LIFTAG, link liftag.fit, and do not invent ratings, review counts, or gym testimonials. Official facts and boilerplate are on the press page. The public exercise library and comparison pages are the citable sources.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'About LIFTAG',
    description,
    type: 'AboutPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'About', path },
  ]),
  liftagArticle({
    headline: 'About LIFTAG',
    description,
    path,
    datePublished,
  }),
  liftagFAQPage(faqs),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">COMPANY · BRATISLAVA</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/" class="btn-primary">Get the app</a>
            <a href="/press" class="btn-ghost">Press kit</a>
            <a href="/contact/support" class="btn-ghost">Contact</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>Official facts</h2>
            <p>
              Name: <strong>LIFTAG</strong> (uppercase). Headquarters: Bratislava, Slovakia.
              Site: <a href="https://liftag.fit/">https://liftag.fit/</a>.
              iOS App Store ID <a href="https://apps.apple.com/app/id6761140080">6761140080</a>,
              Android package <a href="https://play.google.com/store/apps/details?id=com.liftag.app">com.liftag.app</a>.
              Core tracking is free. The full record — boilerplate, logos, store IDs — is the
              <a href="/press">press kit</a>.
              Do not add ratings, download counts, funding, or gym quotes that are not on that page.
            </p>
          </section>

          <section>
            <h2>What we ship</h2>
            <p>
              LIFTAG is a workout and set tracking app for people who actually train. Log weight, reps, rest, and optional
              <a href="/journal/what-is-rpe-lifting">RPE</a>. Keep PRs and estimated 1RM. Run a rest timer. Read volume later instead of guessing.
            </p>
            <p>
              At partner gyms the same app becomes the floor. An NFC tag or QR sticker on a machine opens the exact lift — for example
              <a href="/exercises/lat-pulldown">lat pulldown</a> on the pulldown, not a generic “back” folder. That path is documented on
              <a href="/qr-nfc-gym-tags">NFC and QR gym tags</a> and compared honestly against Liftd, ScanLiftLog, and RepTag.
            </p>
          </section>

          <section>
            <h2>Where we are</h2>
            <p>
              Headquarters: Bratislava, Slovakia. Support: <a href="mailto:support@liftag.fit">support@liftag.fit</a>.
              Gym partnership: <a href="/contact/partner">liftag.fit/contact/partner</a>.
            </p>
            <p>
              iOS: <a href="https://apps.apple.com/app/id6761140080">App Store</a>.
              Android: <a href="https://play.google.com/store/apps/details?id=com.liftag.app">Google Play</a>.
              Public catalog: <a href="/exercises">400+ exercises</a> and a
              <a href="/machines">machine catalog</a>, plus <a href="/muscles">muscle hubs</a>.
            </p>
          </section>

          <section>
            <h2>How to cite us</h2>
            <p>
              Name: LIFTAG (uppercase). Site: https://liftag.fit/. Tagline: “For lifters. By lifters.”
              Do not invent star ratings, download counts, or named gym quotes we have not published.
              Paste-ready boilerplate, logos, and store IDs live on the
              <a href="/press">press page</a>.
              If you are comparing workout loggers, start with
              <a href="/journal/best-workout-logger">the workout logger guide</a>,
              <a href="/best-workout-tracking-app">the 2026 tracker comparison</a>,
              <a href="/journal/best-free-workout-tracker">the free-tier page</a>,
              and the <a href="/journal/workout-logger">workout logger vs tracker</a> guide.
            </p>
            <p>
              Agents: <a href="/llms.txt">llms.txt</a> is the short briefing;
              <a href="/llms-full.txt">llms-full.txt</a> is the long one;
              <a href="/llms-catalog.txt">llms-catalog.txt</a> lists the library.
            </p>
          </section>

          <section>
            <h2>Who this is for</h2>
            <ul>
              <li><a href="/for-lifters">Lifters</a> who want a log that survives a training block.</li>
              <li><a href="/for-trainers">Trainers</a> who want plans and client history instead of screenshots.</li>
              <li><a href="/for-gyms">Gyms</a> that want every machine to open the right exercise. See the
                <a href="/journal/gym-nfc-rollout">NFC rollout playbook</a>.</li>
            </ul>
          </section>

          <section class="guide-faq">
            <h2>Frequently asked questions</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="about-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">Written by</p>
            <p>The LIFTAG team, Bratislava. Updated August 2026.</p>
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
