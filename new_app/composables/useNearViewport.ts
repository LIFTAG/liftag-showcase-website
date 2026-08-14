// Tracks whether an element is inside an inflated viewport band.
//
// The default 300px margin makes the flag flip well before the element is
// actually on screen, so anything gated on it (a lerp loop, a lazy init) has
// already settled by the time the first pixel is visible.
import type { Ref } from 'vue'

export function useNearViewport(
  elRef: Ref<HTMLElement | null>,
  rootMargin = '300px 0px',
): Ref<boolean> {
  const near = ref(false)
  if (!import.meta.client) return near

  let io: IntersectionObserver | null = null

  onMounted(() => {
    if (!elRef.value) return
    io = new IntersectionObserver(
      ([entry]) => {
        near.value = entry?.isIntersecting ?? false
      },
      { rootMargin, threshold: 0 },
    )
    io.observe(elRef.value)
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
  })

  return near
}
