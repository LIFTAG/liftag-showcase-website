<script setup lang="ts">
const title = 'NFC tags for <span class="lime">gym equipment.</span>'
const description = 'What to put on each gym machine in 2026: NFC vs QR, tag placement, NTAG types, and how a tap opens the right exercise in a workout tracker.'

const path = '/guides/nfc-tags-for-gym-equipment'
const datePublished = '2026-08-19'

useLiftagSeo({
  title: 'NFC Tags for Gym Equipment (2026) | LIFTAG',
  description,
  path,
})

const faqs = [
  {
    question: 'What NFC tag should a gym put on machines?',
    answer: 'NTAG213 is enough for a URL. NTAG215/216 give more memory if you later store extra records. LIFTAG ships a dual NFC + QR kit, so the gym does not have to source chips, print stickers, and hope they encode the same exercise.',
  },
  {
    question: 'Where should the tag go on the machine?',
    answer: 'On a flat, clean surface at hand height, away from the weight stack’s deepest metal well if you can. The lifter should tap without crouching into the footplate. Same spot on every machine in the club so the habit transfers.',
  },
  {
    question: 'Do iPhones read gym NFC tags?',
    answer: 'iPhone XS and later read NFC tags from the lock screen and from an open app. Older iPhones and any phone with NFC disabled can still scan the QR on the same sticker.',
  },
  {
    question: 'Why not QR only?',
    answer: 'QR works everywhere and fails in glare, busy cameras, and with gym members who will not open a camera app between sets. NFC is one tap. Using both is how you cover every phone without arguing about it at the front desk.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'NFC tags for gym equipment',
    description,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: 'NFC tags for gym equipment', path },
  ]),
  liftagArticle({
    headline: 'NFC tags for gym equipment',
    description,
    path,
    datePublished,
  }),
  liftagHowTo({
    name: 'How to tag a gym machine with NFC and QR',
    description: 'Place a dual NFC + QR tag so a tap or scan opens the correct exercise.',
    steps: [
      'Pick the exercise that machine actually hosts in the catalog.',
      'Encode the NFC chip and print the QR to the same destination.',
      'Clean a flat, hand-height surface and stick the dual tag.',
      'Tap with a phone. Confirm the right lift, video, and logger open.',
      'Repeat the same placement language across the floor.',
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
          <p class="protocol guide-eyebrow"><a href="/guides">GUIDES</a> · GYM TECH · UPDATED AUG 2026</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/contact/partner" class="btn-primary">Partner with LIFTAG</a>
            <a href="/best-gym-qr-nfc-app" class="btn-ghost">Compare gym QR apps</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>The job of a tag</h2>
            <p>
              A tag on a machine is not decoration. It is the shortest path from “I am standing at this frame” to “the set is in the log.” If the tap opens a generic homepage, you wasted the sticker. If it opens
              <a href="/exercises/machine-chest-press">machine chest press</a>
              on that exact chest press, the floor starts to teach itself.
            </p>
            <p>
              LIFTAG is built around that path. The <a href="/qr-nfc-gym-tags">NFC and QR gym tags</a> page is the product view. This guide is the physical one: chips, placement, and why you ship both radios.
            </p>
          </section>

          <section>
            <h2>NFC vs QR on gym equipment</h2>
            <ul>
              <li><strong>NFC</strong> — tap, no camera, works in glare. Needs an NFC phone and a chip the gym does not peel off in month two.</li>
              <li><strong>QR</strong> — every smartphone, including the ones with NFC turned off. Needs a camera and a sticker that still scans after a year of chalk.</li>
              <li><strong>Both on one plate</strong> — the only setup that does not create a support ticket per phone brand.</li>
            </ul>
            <p>
              In the small machine-tag category, LIFTAG is the one that ships NFC + QR as the default kit. Liftd can do NFC if the gym supplies tags. ScanLiftLog and RepTag are QR-first. Details live in the
              <a href="/best-gym-qr-nfc-app">gym QR comparison</a>.
            </p>
          </section>

          <section>
            <h2>How to tag a machine</h2>
            <ol>
              <li>Decide the exercise. One primary lift per tag. A lat pulldown is <a href="/exercises/lat-pulldown">lat pulldown</a>, not “back machine.”</li>
              <li>Encode NFC and QR to the same destination so a tap and a scan never disagree.</li>
              <li>Clean a flat, hand-height surface. Avoid the greasiest plate and the deepest metal pocket you can.</li>
              <li>Stick the dual tag. Press it on. If it lifts in week one, the floor will finish the job.</li>
              <li>Tap it. Confirm the right lift, the gym’s video if you filmed one, and the logger.</li>
              <li>Use the same height and side of the frame across the club. Habits do not survive a scavenger hunt.</li>
            </ol>
          </section>

          <section>
            <h2>Chip notes without the folklore</h2>
            <p>
              NTAG213 is enough for a URL. Step up only if you have a reason. Do not buy mystery eBay chips and hope they survive a squat rack. Durability is the sticker laminate and the adhesive, not the NFC forum type number on a spreadsheet.
            </p>
            <p>
              If you do not want to source any of that, that is the kit LIFTAG sends partner gyms: both radios, mapped to the catalog, free at the core. <a href="/contact/partner">Ask for a rollout</a>.
            </p>
          </section>

          <section class="guide-faq">
            <h2>Frequently asked questions</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="nfc-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">Written by</p>
            <p>
              The LIFTAG team. We ship the tags this guide describes. Updated August 2026.
            </p>
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
