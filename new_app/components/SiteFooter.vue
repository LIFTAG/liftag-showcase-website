<script setup lang="ts">
interface FooterLink {
  label: string
  href: string
}

const productLinks: FooterLink[] = [
  { label: 'For Lifters', href: '#lifters' },
  { label: 'For Trainers', href: '#trainers' },
  { label: 'For Gyms', href: '#gyms' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Roadmap', href: '#roadmap' },
]

const linkColumns: [string, string[]][] = [
  ['Company', ['About', 'Press', 'Careers', 'Contact']],
  ['Legal', ['Terms', 'Privacy', 'Security', 'Cookies']],
]
</script>

<template>
  <footer class="site-footer">
    <div
      class="container footer-grid"
      style="display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 48px;"
    >
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

      <!-- Link columns -->
      <div
        v-for="[heading, items] in linkColumns"
        :key="heading"
      >
        <div class="protocol footer-col-heading">{{ heading }}</div>
        <ul class="footer-link-list">
          <li v-for="item in items" :key="item">
            <a href="#" class="footer-link">{{ item }}</a>
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
      <span class="protocol" style="color: #666;">v1.0 · NOW IN BETA</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 60px 32px 40px;
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
</style>
