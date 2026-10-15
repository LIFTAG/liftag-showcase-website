import type { Ref } from 'vue'

/**
 * Calls `schedule` on window scroll only while `target` is within `margin` of
 * the viewport, and once more on every enter and leave.
 *
 * The demo's pinned chapters each measure their section on scroll (a layout
 * read) and then write CSS variables. With every chapter listening for the
 * whole page, each scroll frame ran four or five read-then-write passes in
 * separate rAF callbacks, so every read after the first forced a synchronous
 * style + layout of whatever the previous callback had just written - even
 * for chapters screens away whose values were already clamped. Away from the
 * viewport those values are at their clamped ends, which the leave callback
 * writes, so nothing is lost by not listening.
 *
 * `schedule` is expected to coalesce into a rAF itself.
 */
export function useGymNearScroll(
  target: Ref<HTMLElement | null>,
  schedule: () => void,
  margin = '50% 0px',
) {
  const near = shallowRef(false)
  let io: IntersectionObserver | null = null
  let listening = false

  function listen(on: boolean) {
    if (on === listening) return
    listening = on
    if (on) window.addEventListener('scroll', schedule, { passive: true })
    else window.removeEventListener('scroll', schedule)
  }

  onMounted(() => {
    io = new IntersectionObserver(([entry]) => {
      const next = entry?.isIntersecting ?? false
      if (next === near.value) return
      near.value = next
      listen(next)
      // Settle at the edge: the last scroll frames before leaving may have
      // been skipped, and the first after entering not yet arrived.
      schedule()
    }, { rootMargin: margin })
    if (target.value) io.observe(target.value)
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
    listen(false)
  })

  return near
}
