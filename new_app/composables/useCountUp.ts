// Counts up to `target` once the bound element enters view, then idles.
// Writes textContent directly so the animation does not re-render the host
// component (~60 Vue patches/sec on the hero for 1.6s, which is the TBT window).
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

export function useCountUp(
  target: number,
  duration = 1400,
  format: (val: number) => string = String,
): { el: Ref<HTMLElement | null> } {
  const el = ref<HTMLElement | null>(null)
  let io: IntersectionObserver | null = null
  let raf = 0

  onMounted(() => {
    const node = el.value
    if (!node || !import.meta.client) return
    let started = false
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started) return
          started = true
          io?.disconnect()
          io = null
          const t0 = performance.now()
          const tick = (now: number) => {
            const k = Math.min(1, (now - t0) / duration)
            const eased = 1 - Math.pow(1 - k, 3)
            const next = k < 1 ? Math.floor(eased * target) : target
            node.textContent = format(next)
            raf = k < 1 ? requestAnimationFrame(tick) : 0
          }
          raf = requestAnimationFrame(tick)
        })
      },
      { threshold: 0.4 },
    )
    io.observe(node)
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
    if (raf) cancelAnimationFrame(raf)
  })

  return { el }
}
