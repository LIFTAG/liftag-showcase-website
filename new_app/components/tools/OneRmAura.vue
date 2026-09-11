<script setup lang="ts">
import { createAuroraCurtains } from '~/utils/auroraCurtains'

const props = defineProps<{ kg: number | null }>()
const root = useTemplateRef<HTMLElement>('aura')
const canvas = useTemplateRef<HTMLCanvasElement>('curtains')
const inView = shallowRef(false)
const pageVisible = shallowRef(true)
const reducedMotion = shallowRef(false)
const reducedTransparency = shallowRef(false)

// Visual energy, not a strength rating. Canonical kg keeps unit changes identical.
const energy = computed(() => {
  if (props.kg == null || !Number.isFinite(props.kg) || props.kg <= 0) return 0
  return (props.kg / (props.kg + 180)) ** 1.4
})
const auraStyle = computed(() => ({ opacity: energy.value * .55 }))
const running = computed(() => inView.value && pageVisible.value && energy.value > 0
  && !reducedMotion.value && !reducedTransparency.value)
let renderer: ReturnType<typeof createAuroraCurtains> = null
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let transparencyQuery: MediaQueryList | undefined
let frame = 0
let lastFrame = 0
let elapsed = 0
let displayedEnergy = 0

function draw(now: number) {
  frame = 0
  if (!renderer || !running.value) return
  const delta = lastFrame ? Math.min((now - lastFrame) / 1000, .1) : 0
  // Limit this quiet background to 30fps. Interpolate energy without restarting folds.
  if (!lastFrame || delta >= 1 / 30) {
    lastFrame = now
    elapsed += delta * (.55 + displayedEnergy * .65)
    displayedEnergy += (energy.value - displayedEnergy) * (1 - Math.exp(-delta * 5))
    renderer.render(elapsed, displayedEnergy)
  }
  frame = requestAnimationFrame(draw)
}

function syncAnimation() {
  if (!renderer) return
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  lastFrame = 0
  if (running.value) frame = requestAnimationFrame(draw)
  else {
    displayedEnergy = energy.value
    renderer.render(elapsed, displayedEnergy)
  }
}

function syncPreferences() {
  pageVisible.value = !document.hidden
  reducedMotion.value = motionQuery?.matches ?? false
  reducedTransparency.value = transparencyQuery?.matches ?? false
}

watch(running, syncAnimation)
watch(energy, () => {
  if (!running.value) syncAnimation()
})

onMounted(() => {
  if (!root.value || !canvas.value) return
  renderer = createAuroraCurtains(canvas.value)
  if (!renderer) return
  displayedEnergy = energy.value
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  transparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)')
  syncPreferences()
  motionQuery.addEventListener('change', syncPreferences)
  transparencyQuery.addEventListener('change', syncPreferences)
  document.addEventListener('visibilitychange', syncPreferences)
  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry || !renderer) return
    renderer.resize(entry.contentRect.width, entry.contentRect.height)
    renderer.render(elapsed, displayedEnergy)
  })
  resizeObserver.observe(root.value)
  observer = new IntersectionObserver(([entry]) => {
    inView.value = entry?.isIntersecting ?? false
  })
  observer.observe(root.value)
})
onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  observer?.disconnect()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', syncPreferences)
  transparencyQuery?.removeEventListener('change', syncPreferences)
  document.removeEventListener('visibilitychange', syncPreferences)
  renderer = null
})
</script>

<template>
  <div ref="aura" class="result-aura" :class="{ 'is-running': running }" :style="auraStyle" aria-hidden="true">
    <canvas ref="curtains" class="aurora-curtains" />
  </div>
</template>

<style scoped>
.result-aura {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: clip;
  pointer-events: none;
  contain: strict;
  background: oklch(10% .008 160 / .2);
  transition: opacity 450ms cubic-bezier(.22, 1, .36, 1);
  mask-image: linear-gradient(to bottom, transparent, black 5%, black 54%, transparent 85%);
}
.aurora-curtains {
  display: block;
  width: 100%;
  height: 100%;
  /* Keep the folded light, but dissolve individual rays into the existing wash. */
  filter: blur(7px);
}
@media (prefers-reduced-motion: reduce) {
  .result-aura { transition: none; }
}
@media (prefers-reduced-transparency: reduce), (forced-colors: active) {
  .result-aura { display: none; }
}
</style>
