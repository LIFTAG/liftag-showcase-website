<script setup lang="ts">
// Section eyebrow label. On first viewport entry the mono text "decodes":
// characters lock in left to right out of a scramble, one time, ~600ms.
// Screen readers and crawlers always see the real text: the animated copy is
// aria-hidden and a visually hidden duplicate carries the accessible name.
withDefaults(defineProps<{
  color?: string
}>(), {
  color: '#CCFF00',
})

const decodeEl = ref<HTMLElement | null>(null)

const GLYPHS = '#</>*+=%10'
const DECODE_MS = 620
/** Characters that never scramble so the label silhouette stays anchored. */
const STABLE = new Set([' ', '\u00A0', '▸', '·'])

let io: IntersectionObserver | null = null
let rafId = 0

function scrambleFrame(original: string, progress: number) {
  const locked = Math.round(progress * original.length)
  let out = ''
  for (let i = 0; i < original.length; i++) {
    const ch = original[i]
    out += i < locked || STABLE.has(ch)
      ? ch
      : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  }
  return out
}

onMounted(() => {
  const el = decodeEl.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const original = el.textContent ?? ''
  if (!original.trim()) return

  const start = () => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const linear = Math.min(1, (now - t0) / DECODE_MS)
      const eased = 1 - Math.pow(1 - linear, 4)
      if (linear >= 1) {
        el.textContent = original
        rafId = 0
        return
      }
      el.textContent = scrambleFrame(original, eased)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io?.disconnect()
        io = null
        start()
      }
    },
    { threshold: 0.5 },
  )
  io.observe(el)
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
})
</script>

<template>
  <div
    class="protocol reveal"
    :style="{ color, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }"
  >
    <span
      :style="{
        display: 'inline-block',
        width: '24px',
        height: '1px',
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }"
    />
    <span class="sr-only"><slot /></span>
    <span ref="decodeEl" aria-hidden="true"><slot /></span>
  </div>
</template>
