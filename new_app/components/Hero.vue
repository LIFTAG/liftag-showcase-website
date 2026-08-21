<script setup lang="ts">
// Shell only: cursor orb, atmosphere, scroll fade, and the two layout
// islands. Desktop and mobile hydrate on matching media queries so a
// PageSpeed desktop run never evaluates the phone layout (and vice versa).

const sharedMouse = useSharedMouse()
const rawMouse = sharedMouse.latest
const heroRoot = ref<HTMLElement | null>(null)

const lerpActive = useNearViewport(heroRoot)
useLerpVars(heroRoot, rawMouse, 'hero', 0.06, () => lerpActive.value)

const atmosphereGlow = 'radial-gradient(ellipse 70% 55%'
  + ' at calc(58% + var(--hero-mx) * 4%) calc(40% + var(--hero-my) * 4%),'
  + ' rgba(204,255,0,0.12), transparent 65%)'

let heroEntranceTimer: ReturnType<typeof setTimeout> | null = null
let cursorGlowRaf = 0
let unsubHeroMouse: (() => void) | null = null
let onHeroCursorGlowTone: EventListener | null = null
let onHeroScroll: (() => void) | null = null

onMounted(() => {
  heroEntranceTimer = setTimeout(() => {
    heroRoot.value?.querySelector('.hero-scroll-cue')?.classList.add('is-visible')
  }, 80)

  unsubHeroMouse = onMouseEvent(() => {
    if (cursorGlowRaf !== 0) return
    cursorGlowRaf = requestAnimationFrame(() => {
      cursorGlowRaf = 0
      const root = heroRoot.value
      if (!root) return
      root.style.setProperty('--hero-cursor-x', String(sharedMouse.latest.clientX))
      root.style.setProperty('--hero-cursor-y', String(sharedMouse.latest.clientY))
    })
  })
  onHeroCursorGlowTone = (event: Event) => {
    const tone = (event as CustomEvent<{ tone?: 'green' | 'red' }>).detail?.tone
    heroRoot.value?.classList.toggle('hero-cursor-red', tone === 'red')
  }
  window.addEventListener('liftag:cursor-glow-tone', onHeroCursorGlowTone)

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
  if (heroEntranceTimer) clearTimeout(heroEntranceTimer)
  if (cursorGlowRaf !== 0) cancelAnimationFrame(cursorGlowRaf)
  cursorGlowRaf = 0
  unsubHeroMouse?.()
  if (onHeroCursorGlowTone) {
    window.removeEventListener('liftag:cursor-glow-tone', onHeroCursorGlowTone)
  }
  if (onHeroScroll) {
    window.removeEventListener('scroll', onHeroScroll)
  }
  heroEntranceTimer = null
  unsubHeroMouse = null
  onHeroCursorGlowTone = null
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
    <div class="cursor-glow cursor-glow-green" />
    <div class="cursor-glow cursor-glow-red" />

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

    <div
      class="hero-scroll-cue"
      :style="{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        transition: 'opacity 1200ms 1600ms ease',
        zIndex: 5,
      }"
    >
      <span class="protocol" :style="{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }">SCROLL</span>
      <div
        class="hero-scroll-pulse"
        :style="{
          width: '1px', height: '48px',
          background: 'linear-gradient(180deg, #CCFF00 0%, transparent 100%)',
        }"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  --hero-fade: 1;
  --hero-lift: 0px;
  --hero-scroll: 0;
  --hero-mx: 0;
  --hero-my: 0;
  --hero-cursor-x: -9999;
  --hero-cursor-y: -9999;
}

:deep(.hero-fades) {
  opacity: var(--hero-fade);
}

.hero-scroll-cue {
  opacity: 0;
}

.hero-scroll-cue.is-visible {
  opacity: calc(var(--hero-fade) * 0.7);
}

:deep(.hero-lifts) {
  transform: translate3d(0, calc(var(--hero-lift) * -1), 0);
}

.cursor-glow {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 380ms ease;
  will-change: transform, opacity;
  transform: translate3d(
    calc(var(--hero-cursor-x) * 1px - 210px),
    calc(var(--hero-cursor-y) * 1px - 210px),
    0
  );
}

.cursor-glow-green {
  background: radial-gradient(circle, rgba(204, 255, 0, 0.08) 0%, transparent 58%);
}

.cursor-glow-red {
  background: radial-gradient(circle, rgba(255, 45, 85, 0.11) 0%, transparent 58%);
  opacity: 0;
}

.hero-section.hero-cursor-red .cursor-glow-green {
  opacity: 0;
}

.hero-section.hero-cursor-red .cursor-glow-red {
  opacity: 1;
}

@media (max-width: 768px) {
  .hero-section {
    min-height: var(--liftag-stable-vh) !important;
    overflow-x: clip !important;
    overflow-y: visible !important;
    padding-top: calc(84px + var(--liftag-safe-top)) !important;
    padding-bottom: max(20px, var(--liftag-safe-bottom)) !important;
  }

  .hero-scroll-cue {
    display: none !important;
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

.hero-scroll-pulse {
  transform-origin: top center;
  animation: scrollPulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-scroll-pulse {
    animation: none;
    opacity: 1;
  }
}
</style>
