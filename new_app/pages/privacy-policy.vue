<script setup lang="ts">
const path = '/privacy-policy'
const lastUpdated = 'May 2026'

useLiftagSeo({
  title: 'Privacy Policy | LIFTAG',
  description:
    'How LIFTAG collects, uses, stores, and protects your personal data when you use the LIFTAG workout tracking app.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Privacy Policy', path },
  ]),
])

const sections = [
  {
    title: 'Introduction',
    body: 'Liftag is a fitness tracking application operated by LIFTAG. This Privacy Policy explains what personal data we collect, how we use it, and how you can exercise your rights.',
  },
  {
    title: 'Data We Collect',
    body: 'We may collect account data such as name, email, sign-in provider, date of birth, gender, preferred units, profile settings, and support messages; body metrics such as height and weight; workout data such as sessions, exercises, sets, reps, weights, duration, routines, plans, goals, progress, and trainer-sharing choices; uploads such as custom exercise media; approximate or precise location when you enable gym detection or map features; device, app, diagnostics, crash, and session replay data.',
  },
  {
    title: 'How We Use Your Data',
    body: 'We use your data to create and secure your account, provide workout tracking and QR/gym features, sync data across devices, show history and progress, support trainer and sharing features, process support requests, prevent abuse, troubleshoot crashes, improve app quality, and comply with legal obligations.',
  },
  {
    title: 'Data Storage & Security',
    body: 'Data is stored with service providers including Supabase and S3/AWS-style media storage. We use technical and organizational safeguards such as authenticated API access and encryption in transit, but no service can guarantee absolute security.',
  },
  {
    title: 'Third-Party Services',
    body: 'We use third-party services including Supabase for authentication, database, and storage; Google and Apple for sign-in; Sentry, including session replay, for diagnostics; Resend for email; Cloudflare Turnstile for abuse prevention; Strava if you connect it; YouTube/WebView for video content; maps/location providers for gym discovery; and S3/AWS-style storage for uploaded media.',
  },
  {
    title: 'Your Rights',
    body: 'Depending on where you live, you may have rights to access, correct, delete, export, restrict, or object to processing of your personal data, and to withdraw consent where processing is based on consent. You can request account deletion in the app or contact us.',
  },
  {
    title: 'Data Retention',
    body: 'We keep personal data for as long as needed to provide Liftag, maintain security, resolve disputes, comply with law, and preserve legitimate business records. When you delete your account, we delete or anonymize account data unless retention is required or permitted by law.',
  },
  {
    title: "Children's Privacy",
    body: 'Liftag is not intended for anyone under 16. We do not knowingly allow users under 16 to create accounts or use product features. If you are under 16, do not use Liftag.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. When changes are material, we may notify you in the app or ask you to accept the updated version before continuing to use product features.',
  },
  {
    title: 'Contact Us',
    body: 'If you have questions about this Privacy Policy or your personal data, please contact us at:',
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
          <p class="protocol legal-eyebrow">▸ PRIVACY POLICY</p>
          <h1 class="display legal-title">Privacy <span class="lime">Policy.</span></h1>
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
