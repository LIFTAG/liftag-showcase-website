// Counts up to `target` once the bound element enters view, then idles.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

export function useCountUp(target: number, duration = 1400): { val: Ref<number>; el: Ref<HTMLElement | null> } {
  const val = ref(0)
  const el = ref<HTMLElement | null>(null)

  onMounted(() => {
    if (!el.value || !import.meta.client) return
    let started = false
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true
            const t0 = performance.now()
            const tick = (now: number) => {
              const k = Math.min(1, (now - t0) / duration)
              const eased = 1 - Math.pow(1 - k, 3)
              val.value = Math.floor(eased * target)
              if (k < 1) requestAnimationFrame(tick)
              else val.value = target
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el.value)
    onBeforeUnmount(() => io.disconnect())
  })

  return { val, el }
}
