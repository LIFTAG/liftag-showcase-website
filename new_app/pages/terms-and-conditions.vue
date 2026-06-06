<script setup lang="ts">
const path = '/terms-and-conditions'
const lastUpdated = 'May 2026'

useLiftagSeo({
  title: 'Terms & Conditions | LIFTAG',
  description:
    'The terms governing your use of the LIFTAG workout tracking app — eligibility, account responsibility, content, and acceptable use.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Terms & Conditions', path },
  ]),
])

const sections = [
  {
    title: 'Eligibility',
    body: 'You must be at least 16 years old to use Liftag. By creating or using an account, you confirm that you meet this requirement and that the information you provide is accurate.',
  },
  {
    title: 'Account Responsibility',
    body: 'You are responsible for your account, credentials, profile information, workouts, uploads, and activity in Liftag. Keep your sign-in credentials secure and tell us if you suspect unauthorized access.',
  },
  {
    title: 'No Medical Advice',
    body: 'Liftag provides workout tracking, instructional, and informational content only. It is not medical advice, diagnosis, treatment, or a substitute for professional medical guidance. Talk to a qualified professional before starting or changing an exercise program.',
  },
  {
    title: 'Exercise and Equipment Risk',
    body: 'Exercise and gym equipment involve risk of injury. Use your judgment, follow gym rules and equipment instructions, stop if something feels unsafe, and seek help from qualified staff or medical professionals when needed.',
  },
  {
    title: 'Exercise and Video Content',
    body: 'Exercise descriptions, videos, QR resolutions, routines, statistics, and recommendations are informational and may not fit your body, equipment, or circumstances. You remain responsible for deciding whether and how to perform any activity.',
  },
  {
    title: 'Uploads and User Content',
    body: 'If you upload photos, videos, custom exercises, messages, or other content, you must have the right to share it and it must be lawful, respectful, and safe. We may remove content that violates these Terms or harms the service.',
  },
  {
    title: 'Acceptable Use',
    body: 'Do not misuse Liftag, interfere with the service, attempt unauthorized access, upload malicious content, impersonate others, harass users, or use the app for unlawful activity.',
  },
  {
    title: 'Third-Party Services',
    body: 'Liftag may rely on third-party services such as Supabase, Google, Apple, Sentry, Resend, Cloudflare Turnstile, Strava, YouTube/WebView, maps/location providers, and S3/AWS-style media storage. Their own terms and policies may also apply.',
  },
  {
    title: 'Suspension and Termination',
    body: 'We may suspend or terminate access if you violate these Terms, create risk for other users or the service, or where required by law. You may stop using Liftag or request account deletion from the app.',
  },
  {
    title: 'Changes',
    body: 'We may update these Terms. When changes are material, we may ask you to accept the updated version before continuing to use product features.',
  },
  {
    title: 'Entity and Governing Law',
    body: 'These Terms are governed by applicable law, including any mandatory consumer protections available to you. Any disputes will be handled by the courts or authorities that have jurisdiction under those laws.',
  },
  {
    title: 'Contact',
    body: 'Questions about these Terms can be sent to:',
  },
]

const contactEmail = 'support@liftag.fit'
</script>

<template>
  <div class="legal-page">
    <SiteNav />

    <main>
      <article class="legal">
        <header class="legal-hero container">
          <p class="protocol legal-eyebrow">▸ TERMS & CONDITIONS</p>
          <h1 class="display legal-title">Terms & <span class="lime">Conditions.</span></h1>
          <p class="legal-updated">Last updated: {{ lastUpdated }}</p>
        </header>

        <div class="container legal-body">
          <section
            v-for="section in sections"
            :key="section.title"
            class="legal-section"
          >
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </section>

          <p class="legal-contact-email">
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </p>
        </div>
      </article>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.legal-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

.legal-hero {
  padding: 150px 0 40px;
}

.legal-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.legal-title {
  max-width: 920px;
  font-size: clamp(48px, 7.4vw, 112px);
}

.legal-updated {
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 300;
}

.legal-body {
  padding: 24px 0 80px;
  max-width: 820px;
}

.legal-section {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.legal-section h2 {
  margin: 0 0 14px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(22px, 2.8vw, 32px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.1;
}

.legal-section p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  margin: 0;
}

.legal-contact-email {
  margin: 18px 0 0;
  font-size: 16px;
}

.legal-contact-email a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .legal-hero {
    padding-top: 120px;
  }
}

@media (max-width: 620px) {
  .legal-hero {
    padding: 108px 0 32px;
  }
}
</style>
