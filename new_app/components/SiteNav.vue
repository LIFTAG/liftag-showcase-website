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
  _onScroll = () => { scrolled.value = window.scrollY > 40 }
  window.addEventListener('scroll', _onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (_onScroll) window.removeEventListener('scroll', _onScroll)
})
</script>

<template>
  <!-- Sticky header -->
  <header
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
      background: scrolled || open ? 'rgba(0,0,0,0.9)' : 'transparent',
      backdropFilter: scrolled || open ? 'blur(20px) saturate(1.4)' : 'none',
      borderBottom: scrolled || open ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      transition: 'all .35s cubic-bezier(0.16,1,0.3,1)',
    }"
  >
    <!-- Logo -->
    <a href="#" class="nav-logo">
      <img
        src="/assets/logo.svg"
        width="28"
        height="28"
        class="nav-logo__img"
        alt="LIFTAG logo"
      />
      <span class="nav-logo__wordmark">LIFTAG</span>
    </a>

    <!-- Desktop nav links -->
    <nav class="nav-desktop" style="display: flex; gap: 36px;">
      <a
        v-for="[label, href] in navLinks"
        :key="label"
        :href="href"
        class="nav-link"
      >{{ label }}</a>
    </nav>

    <!-- Right side: CTA + hamburger -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <!-- Desktop CTA -->
      <button
        class="btn-primary nav-desktop"
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
    <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
      <AppStoreBtn store="apple" />
      <AppStoreBtn store="google" />
    </div>
  </div>
</template>

<style scoped>
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.nav-logo__img {
  filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5));
}

.nav-logo__wordmark {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 22px;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: color 200ms ease;
}

.nav-link:hover {
  color: #CCFF00;
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
</style>
