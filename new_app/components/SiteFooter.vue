<script setup lang="ts">
interface FooterLink {
  label: string
  href: string
}

const productLinks: FooterLink[] = [
  { label: 'For Lifters', href: '/for-lifters' },
  { label: 'For Trainers', href: '/for-trainers' },
  { label: 'For Gyms', href: '/for-gyms' },
  { label: 'NFC + QR Tags', href: '/qr-nfc-gym-tags' },
  { label: 'Roadmap', href: '/#roadmap' },
  { label: 'Support', href: '/contact/support' },
]

const guideLinks: FooterLink[] = [
  { label: 'Best Workout Tracking App', href: '/best-workout-tracking-app' },
  { label: 'How to Track Workouts', href: '/guides/how-to-track-workouts' },
  { label: 'Best App for Powerlifting', href: '/guides/best-workout-app-for-powerlifting' },
  { label: 'QR + NFC Gym Tracking', href: '/guides/qr-nfc-gym-tracking' },
]
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <!-- Logo + tagline column -->
      <div>
        <div class="footer-brand">
          <img
            src="/assets/logo.svg"
            width="32"
            height="32"
            class="footer-logo-img"
            alt="LIFTAG logo"
          />
          <span class="footer-wordmark">LIFTAG</span>
        </div>
        <p class="footer-tagline">
          Because serious training deserves more than a notes app and a spreadsheet.
        </p>
      </div>

      <div>
        <a href="#all-in-one" class="protocol footer-col-heading footer-heading-link">Product</a>
        <ul class="footer-link-list">
          <li v-for="item in productLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

      <div>
        <span class="protocol footer-col-heading">Guides</span>
        <ul class="footer-link-list">
          <li v-for="item in guideLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Bottom bar -->
    <div
      class="container"
      style="
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      "
    >
      <span class="protocol" style="color: #666;">© 2026 LIFTAG · BRATISLAVA · BUILT BY LIFTERS</span>
      <div class="footer-bottom-actions">
        <a
          href="https://www.instagram.com/liftag.fit/"
          class="footer-social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Liftag on Instagram"
        >
          <svg
            class="footer-social-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="5.25"
              y="5.25"
              width="13.5"
              height="13.5"
              rx="4"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="3.15"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <circle
              cx="16.45"
              cy="7.65"
              r="1.05"
              fill="currentColor"
            />
          </svg>
          <span class="protocol">INSTAGRAM</span>
        </a>
        <span class="protocol" style="color: #666;">v1.0 · NOW IN BETA</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 60px 32px 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) minmax(160px, 0.7fr) minmax(180px, 0.7fr);
  gap: 48px;
}

@media (max-width: 720px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.footer-logo-img {
  filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5));
}

.footer-wordmark {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 24px;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
}

.footer-tagline {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 300;
  line-height: 1.6;
  max-width: 280px;
  margin: 0;
}

.footer-col-heading {
  display: inline-block;
  color: #CCFF00;
  margin-bottom: 16px;
}

.footer-heading-link {
  text-decoration: none;
  transition: color 200ms ease;
}

.footer-heading-link:hover {
  color: #fff;
}

.footer-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: color 200ms ease;
}

.footer-link:hover {
  color: #CCFF00;
}

.footer-bottom-actions {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.54);
  text-decoration: none;
  transition:
    color 200ms ease,
    transform 200ms ease;
}

.footer-social-link:hover {
  color: #CCFF00;
  transform: translateY(-1px);
}

.footer-social-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}
</style>
