<script setup lang="ts">
// Shell only: atmosphere, scroll fade, and the two layout islands. Desktop and
// mobile hydrate on matching media queries so a PageSpeed desktop run never
// evaluates the phone layout (and vice versa). The cursor effect lives in
// SplashCursor.vue, mounted page-wide by index.vue.

const rawMouse = useSharedMouse().latest
const heroRoot = ref<HTMLElement | null>(null)

const lerpActive = useNearViewport(heroRoot)
useLerpVars(heroRoot, rawMouse, 'hero', 0.06, () => lerpActive.value)

const atmosphereGlow = 'radial-gradient(ellipse 70% 55%'
  + ' at calc(58% + var(--hero-mx) * 4%) calc(40% + var(--hero-my) * 4%),'
  + ' rgba(204,255,0,0.12), transparent 65%)'

let onHeroScroll: (() => void) | null = null

onMounted(() => {
  let scrollQueued = false
  onHeroScroll = () => {
    if (scrollQueued) return
    scrollQueued = true
    requestAnimationFrame(() => {
      scrollQueued = false
      if (window.matchMedia('(max-width: 768px)').matches) return

      const root = heroRoot.value
      const y = window.scrollY
      if (root) {
        root.style.setProperty('--hero-fade', String(Math.max(0, 1 - y / 500)))
        root.style.setProperty('--hero-lift', `${y * 0.35}px`)
        root.style.setProperty('--hero-scroll', String(y))
      }
    })
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (onHeroScroll) {
    window.removeEventListener('scroll', onHeroScroll)
  }
  onHeroScroll = null
})
</script>

<template>
  <section
    ref="heroRoot"
    class="hero-section"
    :style="{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      background: '#000',
      paddingTop: '100px',
      paddingBottom: '80px',
    }"
  >
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: atmosphereGlow,
      }"
    />

    <LazyHeroDesktop hydrate-on-media-query="(min-width: 769px)" />
    <LazyHeroMobile hydrate-on-media-query="(max-width: 768px)" />
  </section>
</template>

<style scoped>
.hero-section {
  --hero-fade: 1;
  --hero-lift: 0px;
  --hero-scroll: 0;
  --hero-mx: 0;
  --hero-my: 0;
}

:deep(.hero-fades) {
  opacity: var(--hero-fade);
}

:deep(.hero-lifts) {
  transform: translate3d(0, calc(var(--hero-lift) * -1), 0);
}

@media (max-width: 768px) {
  .hero-section {
    min-height: var(--liftag-stable-vh) !important;
    overflow-x: clip !important;
    overflow-y: visible !important;
    padding-top: calc(84px + var(--liftag-safe-top)) !important;
    padding-bottom: max(20px, var(--liftag-safe-bottom)) !important;
  }
}

@media (max-width: 768px) {
  :global(html[data-liftag-short-viewport="true"] .hero-section) {
    padding-top: calc(76px + var(--liftag-safe-top)) !important;
    padding-bottom: max(16px, var(--liftag-safe-bottom)) !important;
  }
}

@media (min-width: 700px) and (max-width: 768px) {
  .hero-section {
    padding-top: calc(76px + var(--liftag-safe-top)) !important;
  }
}

</style>
