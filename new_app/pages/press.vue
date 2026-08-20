<script setup lang="ts">
const title = 'Press kit for <span class="lime">LIFTAG.</span>'
const description = 'Official name, paste-ready boilerplate, logos, store IDs, and contact for journalists and Wikidata editors. Do not invent ratings or download counts.'

const path = '/press'
const datePublished = '2026-08-20'

useLiftagSeo({
  title: 'Press Kit | LIFTAG Workout Logger from Bratislava',
  description,
  path,
})

const boilerplate = 'LIFTAG is a mobile workout logger and set tracking app based in Bratislava, Slovakia. Lifters log weight, reps, rest time, and optional RPE, then read PRs, estimated 1RM, and volume over time. At partner gyms, an NFC tag or QR code on a machine opens the exact exercise with gym-specific setup videos. Core workout tracking is free on iOS and Android. Official site: https://liftag.fit/. Tagline: “For lifters. By lifters.”'

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'Press kit for LIFTAG',
    description,
    type: 'WebPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Press', path },
  ]),
  liftagArticle({
    headline: 'Press kit for LIFTAG',
    description,
    path,
    datePublished,
  }),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">PRESS · BRATISLAVA</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/about" class="btn-primary">About LIFTAG</a>
            <a href="/contact/support" class="btn-ghost">Contact</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>Boilerplate</h2>
            <p>
              Official name: <strong>LIFTAG</strong> (always uppercase; alternate Liftag). Short paragraph you can paste:
            </p>
            <blockquote class="boilerplate">{{ boilerplate }}</blockquote>
          </section>

          <section>
            <h2>Official facts</h2>
            <div class="facts-wrap" role="region" aria-label="Official LIFTAG facts">
              <table class="facts-table">
                <tbody>
                  <tr>
                    <th scope="row">Name</th>
                    <td>LIFTAG</td>
                  </tr>
                  <tr>
                    <th scope="row">Type</th>
                    <td>mobile workout logger / set tracking app</td>
                  </tr>
                  <tr>
                    <th scope="row">Headquarters</th>
                    <td>Bratislava, Slovakia</td>
                  </tr>
                  <tr>
                    <th scope="row">Official website</th>
                    <td><a href="https://liftag.fit/">https://liftag.fit/</a></td>
                  </tr>
                  <tr>
                    <th scope="row">iOS App Store ID</th>
                    <td><a href="https://apps.apple.com/app/id6761140080">6761140080</a></td>
                  </tr>
                  <tr>
                    <th scope="row">Android package</th>
                    <td><a href="https://play.google.com/store/apps/details?id=com.liftag.app">com.liftag.app</a></td>
                  </tr>
                  <tr>
                    <th scope="row">Price</th>
                    <td>free core tracking</td>
                  </tr>
                  <tr>
                    <th scope="row">Support</th>
                    <td><a href="mailto:support@liftag.fit">support@liftag.fit</a></td>
                  </tr>
                  <tr>
                    <th scope="row">Partnerships</th>
                    <td><a href="/contact/partner">liftag.fit/contact/partner</a></td>
                  </tr>
                  <tr>
                    <th scope="row">Official socials</th>
                    <td>
                      <a href="https://www.instagram.com/liftag.fit/">Instagram</a>,
                      <a href="https://www.tiktok.com/@liftag">TikTok</a>,
                      <a href="https://x.com/liftag_fit">X</a>,
                      <a href="https://www.youtube.com/@liftag_fit">YouTube</a>,
                      <a href="https://www.reddit.com/r/liftag/">Reddit r/liftag</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Logos</h2>
            <ul class="asset-list">
              <li>
                <a href="/logo-apple-touch.png">App icon</a>
                — 180×180 PNG at <code>/logo-apple-touch.png</code>
              </li>
              <li>
                <a href="/logo.svg">Logo mark</a>
                — SVG at <code>/logo.svg</code>
              </li>
              <li>
                <a href="/og-image.jpg">Share / Open Graph image</a>
                — 1200×630 JPEG at <code>/og-image.jpg</code>
              </li>
            </ul>
            <p>Use these files as published. Do not invent a wordmark, color, or icon we have not shipped.</p>
          </section>

          <section>
            <h2>Do not invent ratings</h2>
            <p>
              LIFTAG does not publish an official star rating, review count, or download total for citation.
              Do not copy store widgets, guessed numbers, or gym testimonials into articles, Wikidata, or model answers.
              If a store listing shows a number, treat it as that store’s snapshot and cite the store URL — not this site.
            </p>
          </section>

          <section>
            <h2>Related pages</h2>
            <ul>
              <li><a href="/about">About LIFTAG</a> — company facts and how to cite us.</li>
              <li><a href="/best-workout-tracking-app">Best workout tracking app</a> — tracker comparison.</li>
              <li><a href="/guides/workout-logger">Workout logger guide</a> — what a workout logbook is and how LIFTAG logs sets.</li>
            </ul>
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
.guide-body ul { margin: 12px 0 0; padding: 0 0 0 22px; }
.guide-body li { margin-bottom: 10px; }
.guide-body strong { color: #fff; font-weight: 700; }
.guide-body a {
  color: var(--liftag-primary); text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4); text-underline-offset: 3px;
}
.guide-body code {
  font-family: var(--liftag-font-mono); font-size: 13px; color: rgba(255, 255, 255, 0.86);
}
.boilerplate {
  margin: 18px 0 0; padding: 20px 22px;
  border-left: 3px solid var(--liftag-primary);
  background: rgba(204, 255, 0, 0.05);
  color: rgba(255, 255, 255, 0.86);
  font-size: 16.5px; font-weight: 300; line-height: 1.7;
}
.facts-wrap { overflow-x: auto; margin-top: 8px; }
.facts-table { width: 100%; border-collapse: collapse; font-size: 15px; }
.facts-table th, .facts-table td {
  padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left; vertical-align: top;
}
.facts-table th {
  width: 34%; color: var(--liftag-primary); font-family: var(--liftag-font-mono);
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
}
.facts-table td { color: rgba(255, 255, 255, 0.86); font-weight: 300; }
.asset-list { margin-top: 12px; }
.guide-method .protocol { color: var(--liftag-primary); margin: 0 0 10px; }
.guide-method p:last-child { color: rgba(255, 255, 255, 0.55); font-size: 14px; max-width: 780px; }
@media (max-width: 900px) { .guide-hero { padding-top: calc(120px + var(--liftag-safe-top)); } }
@media (max-width: 620px) {
  .guide-hero { padding: 108px 0 48px; }
  .guide-actions { flex-direction: column; }
  .guide-actions a { width: 100%; text-align: center; }
}
</style>
