<script setup lang="ts">
const scrolled = ref(false)
const open = ref(false)

const navLinks: [string, string][] = [
  ['Lifters', '#lifters'],
  ['Trainers', '#trainers'],
  ['Gyms', '#gyms'],
  ['How it works', '#how'],
]

let _onScroll: (() => void) | null = null

onMounted(() => {
  let queued = false
  _onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      const next = window.scrollY > 40
      if (next !== scrolled.value) scrolled.value = next
    })
  }
  window.addEventListener('scroll', _onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (_onScroll) window.removeEventListener('scroll', _onScroll)
})
</script>

<template>
  <!-- Sticky header -->
  <header
    class="site-nav"
    :class="{ 'is-open': open, 'is-scrolled': scrolled }"
    :style="{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
        background: scrolled || open ? 'rgba(0,0,0,0.68)' : 'transparent',
        backdropFilter: scrolled || open ? 'blur(20px) saturate(1.5)' : 'none',
      borderBottom: scrolled || open ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      transition: 'background-color .35s cubic-bezier(0.16,1,0.3,1), border-color .35s cubic-bezier(0.16,1,0.3,1)',
    }"
  >
    <span class="nav-entry-beam" aria-hidden="true"></span>

    <!-- Logo -->
    <a href="#" class="nav-logo">
      <span class="nav-logo__mark">
        <img
          src="/assets/logo.svg"
          width="28"
          height="28"
          class="nav-logo__img"
          alt="LIFTAG logo"
        />
      </span>
      <span class="nav-logo__wordmark">LIFTAG</span>
    </a>

    <!-- Desktop nav links -->
    <nav class="nav-desktop nav-center-links">
      <a
        v-for="[label, href] in navLinks"
        :key="label"
        :href="href"
        class="nav-link"
      >{{ label }}</a>
    </nav>

    <!-- Right side: CTA + hamburger -->
    <div class="nav-actions" style="display: flex; align-items: center; gap: 12px;">
      <!-- Desktop CTA -->
      <a
        href="#dashboard"
        class="btn-ghost nav-desktop nav-dashboard-cta"
      >
        Dashboard
      </a>
      <button
        class="btn-primary nav-desktop nav-app-cta"
        style="padding: 10px 20px; font-size: 11px; box-shadow: 0 0 24px rgba(204,255,0,0.4);"
      >
        Get the app
      </button>

      <!-- Mobile hamburger -->
      <button
        class="nav-mobile-toggle"
        @click="open = !open"
        :style="{
          display: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          flexDirection: 'column',
          gap: '5px',
        }"
        aria-label="Toggle menu"
      >
        <span
          :style="{
            display: 'block',
            width: '24px',
            height: '2px',
            background: open ? '#CCFF00' : '#fff',
            borderRadius: '2px',
            transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
            transition: 'all 300ms ease',
          }"
        />
        <span
          :style="{
            display: 'block',
            width: '24px',
            height: '2px',
            background: open ? 'transparent' : '#fff',
            borderRadius: '2px',
            transition: 'all 300ms ease',
          }"
        />
        <span
          :style="{
            display: 'block',
            width: '24px',
            height: '2px',
            background: open ? '#CCFF00' : '#fff',
            borderRadius: '2px',
            transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
            transition: 'all 300ms ease',
          }"
        />
      </button>
    </div>
  </header>

  <!-- Mobile drawer -->
  <div
    :style="{
      position: 'fixed',
      top: '60px',
      left: 0,
      right: 0,
      zIndex: 99,
      background: 'rgba(0,0,0,0.96)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: open ? '24px 24px 32px' : '0 24px',
      maxHeight: open ? '400px' : '0',
      overflow: 'hidden',
      transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
    }"
  >
    <nav style="display: flex; flex-direction: column; gap: 0;">
      <a
        v-for="[label, href] in navLinks"
        :key="label"
        :href="href"
        class="nav-drawer-link"
        @click="open = false"
      >{{ label }}</a>
    </nav>
    <a
      href="#dashboard"
      class="nav-dashboard-mobile"
      @click="open = false"
    >
      Dashboard
    </a>
    <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
      <AppStoreBtn store="apple" />
      <AppStoreBtn store="google" />
    </div>
  </div>
</template>

<style scoped>
.site-nav {
  overflow: hidden;
  animation: navShellIn 860ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.site-nav::before,
.site-nav::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.site-nav::before {
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(90deg, transparent 0%, rgba(204, 255, 0, 0.1) 46%, rgba(255, 255, 255, 0.14) 50%, rgba(204, 255, 0, 0.08) 54%, transparent 100%);
  transform: translateX(-120%);
  animation: navLightSweep 1180ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
}

.site-nav::after {
  left: 32px;
  right: 32px;
  bottom: 0;
  z-index: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.78), rgba(255, 255, 255, 0.35), transparent);
  transform: scaleX(0);
  transform-origin: center;
  animation: navLineIn 900ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both;
}

.nav-entry-beam {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 0;
  width: min(420px, 42vw);
  height: 72px;
  pointer-events: none;
  background: radial-gradient(ellipse at center bottom, rgba(204, 255, 0, 0.18), transparent 66%);
  opacity: 0;
  transform: translateX(-50%) scaleX(0.42);
  animation: navBeamBloom 980ms cubic-bezier(0.16, 1, 0.3, 1) 260ms both;
}

.nav-logo,
.nav-center-links,
.nav-actions,
.nav-mobile-toggle {
  position: relative;
  z-index: 2;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  opacity: 0;
  transform: translate3d(-18px, -10px, 0) rotate(-3deg);
  animation: navLogoIn 780ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both;
}

.nav-logo__mark {
  position: relative;
  display: grid;
  place-items: center;
}

.nav-logo__mark::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.34);
  box-shadow: 0 0 18px rgba(204, 255, 0, 0.18);
  opacity: 0;
  transform: scale(0.5) rotate(-28deg);
  animation: navMarkRing 880ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both;
}

.nav-logo__img {
  filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5));
  animation: navMarkSnap 760ms cubic-bezier(0.16, 1, 0.3, 1) 260ms both;
}

.nav-logo__wordmark {
  display: inline-block;
  padding-right: 0.16em;
  margin-right: -0.16em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 22px;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
  clip-path: inset(0 100% 0 0);
  animation: navWordReveal 680ms cubic-bezier(0.16, 1, 0.3, 1) 390ms both;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  position: relative;
  opacity: 0;
  transform: translate3d(0, -14px, 0) skewX(-9deg);
  animation: navItemIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: color 200ms ease;
}

.nav-link:nth-child(1) { animation-delay: 360ms; }
.nav-link:nth-child(2) { animation-delay: 430ms; }
.nav-link:nth-child(3) { animation-delay: 500ms; }
.nav-link:nth-child(4) { animation-delay: 570ms; }

.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -10px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #CCFF00, transparent);
  opacity: 0;
  transition: left 240ms ease, right 240ms ease, opacity 240ms ease;
}

.nav-center-links {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 36px;
  transform: translate(-50%, -50%);
}

.nav-link:hover {
  color: #CCFF00;
}

.nav-link:hover::after {
  left: -8px;
  right: -8px;
  opacity: 1;
}

.nav-actions {
  opacity: 0;
  transform: translate3d(22px, -12px, 0);
  animation: navActionsIn 760ms cubic-bezier(0.16, 1, 0.3, 1) 640ms both;
}

.nav-app-cta {
  position: relative;
  overflow: hidden;
}

.nav-app-cta::before {
  content: '';
  position: absolute;
  inset: -1px;
  pointer-events: none;
  background: linear-gradient(100deg, transparent 15%, rgba(255, 255, 255, 0.5), transparent 42%);
  transform: translateX(-150%);
  animation: navCtaSheen 1100ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;
}

.nav-dashboard-cta {
  padding: 10px 18px;
  font-size: 11px;
  line-height: 1;
  text-decoration: none;
}

.nav-drawer-link {
  color: #fff;
  text-decoration: none;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 28px;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: color 200ms ease;
}

.nav-drawer-link:hover {
  color: #CCFF00;
}

.nav-dashboard-mobile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 24px;
  padding: 12px 18px;
  border: 1px solid rgba(204, 255, 0, 0.34);
  border-radius: 999px;
  color: #CCFF00;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@keyframes navShellIn {
  0% {
    opacity: 0;
    transform: translate3d(0, -22px, 0) scaleX(0.92);
    clip-path: inset(0 46% 100% 46% round 999px);
  }
  48% {
    opacity: 1;
    clip-path: inset(0 12% 0 12% round 999px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scaleX(1);
    clip-path: inset(0 0 0 0 round 0);
  }
}

@keyframes navLightSweep {
  0% { opacity: 0; transform: translateX(-120%); }
  22% { opacity: 0.9; }
  100% { opacity: 0; transform: translateX(120%); }
}

@keyframes navLineIn {
  0% { opacity: 0; transform: scaleX(0); }
  58% { opacity: 0.95; }
  100% { opacity: 0.38; transform: scaleX(1); }
}

@keyframes navBeamBloom {
  0% { opacity: 0; transform: translateX(-50%) scaleX(0.42); }
  45% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) scaleX(1.25); }
}

@keyframes navLogoIn {
  0% { opacity: 0; transform: translate3d(-18px, -10px, 0) rotate(-3deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
}

@keyframes navMarkRing {
  0% { opacity: 0; transform: scale(0.5) rotate(-28deg); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.25) rotate(18deg); }
}

@keyframes navMarkSnap {
  0% { transform: scale(0.62) rotate(-24deg); filter: drop-shadow(0 0 0 rgba(204, 255, 0, 0)); }
  62% { transform: scale(1.12) rotate(5deg); }
  100% { transform: scale(1) rotate(0); filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5)); }
}

@keyframes navWordReveal {
  0% { clip-path: inset(0 100% 0 0); transform: translateX(-8px); }
  100% { clip-path: inset(0 -0.16em 0 0); transform: translateX(0); }
}

@keyframes navItemIn {
  0% { opacity: 0; transform: translate3d(0, -14px, 0) skewX(-9deg); filter: blur(5px); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) skewX(0); filter: blur(0); }
}

@keyframes navActionsIn {
  0% { opacity: 0; transform: translate3d(22px, -12px, 0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes navCtaSheen {
  0% { opacity: 0; transform: translateX(-150%); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translateX(150%); }
}

@media (max-width: 1080px) {
  .nav-center-links {
    gap: 24px;
  }

  .nav-link {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
}

@media (max-width: 768px) {
  .nav-actions {
    animation-delay: 420ms;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav,
  .site-nav::before,
  .site-nav::after,
  .nav-entry-beam,
  .nav-logo,
  .nav-logo__mark::before,
  .nav-logo__img,
  .nav-logo__wordmark,
  .nav-link,
  .nav-actions,
  .nav-app-cta::before {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
    filter: none !important;
  }
}
</style>
