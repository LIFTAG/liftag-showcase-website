// Sticky-pin follow-through for catalog media. CSS sticky still does the
// pinning; this only writes `--stick-y` onto the host so the photo can
// trail scroll, coast past the pin, and spring back. Compositor only: no
// Vue renders on the scroll path.
//
// The loop is asleep until a scroll event, and goes back to sleep once the
// spring has converged. Reduced-motion and non-sticky layouts (the stacked
// phone hero) never start it.

import type { Ref } from 'vue'
import {
  stepStickyMomentum,
  type StickyMomentumState,
} from '~/utils/stickyMomentum'

const VAR_Y = '--stick-y'

export function useStickyMomentum(el: Ref<HTMLElement | null>) {
  let rafId = 0
  let looping = false
  let lastScrollY = 0
  let lastLayoutTop: number | null = null
  let lastTime = 0
  let lastPublished = ''
  let isSticky = false
  let reduceMotion = false
  let documentVisible = true
  let inView = true
  const state: StickyMomentumState = { offset: 0, velocity: 0 }

  let motionMql: MediaQueryList | null = null
  let io: IntersectionObserver | null = null

  const host = () => el.value

  const readSticky = () => {
    const node = host()
    isSticky = Boolean(node && getComputedStyle(node).position === 'sticky')
  }

  const allowed = () => !reduceMotion && documentVisible && inView && isSticky

  const layoutTop = () => host()?.getBoundingClientRect().top ?? 0

  const publish = (offset: number) => {
    const node = host()
    if (!node) return
    const y = offset.toFixed(2)
    if (y === lastPublished) return
    lastPublished = y
    node.style.setProperty(VAR_Y, y)
  }

  const reset = () => {
    state.offset = 0
    state.velocity = 0
    lastScrollY = window.scrollY
    lastLayoutTop = null
    publish(0)
  }

  const tick = (now: number) => {
    looping = true
    if (!allowed()) {
      looping = false
      rafId = 0
      reset()
      return
    }

    const dtMs = lastTime === 0 ? 16.667 : now - lastTime
    lastTime = now

    const scrollY = window.scrollY
    const scrollDelta = scrollY - lastScrollY
    lastScrollY = scrollY

    const top = layoutTop()
    if (lastLayoutTop === null) {
      lastLayoutTop = top
      publish(state.offset)
      rafId = requestAnimationFrame(tick)
      return
    }

    const layoutDelta = top - lastLayoutTop
    lastLayoutTop = top

    const next = stepStickyMomentum(state, {
      scrollDelta,
      layoutDelta,
      dtMs,
    })
    state.offset = next.offset
    state.velocity = next.velocity
    publish(state.offset)

    if (state.offset === 0 && state.velocity === 0) {
      looping = false
      rafId = 0
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  const wake = () => {
    if (looping || rafId !== 0 || !allowed()) return
    lastTime = 0
    // Apply this scroll now so the photo does not sit a frame behind the
    // wheel. tick() keeps the fade-out running on rAF if it has not settled.
    tick(performance.now())
  }

  const stop = () => {
    if (rafId !== 0) cancelAnimationFrame(rafId)
    rafId = 0
    looping = false
  }

  const onScroll = () => wake()

  const onResize = () => {
    readSticky()
    if (!allowed()) {
      stop()
      reset()
      return
    }
    lastLayoutTop = layoutTop()
    wake()
  }

  const onVisibility = () => {
    documentVisible = !document.hidden
    if (documentVisible) wake()
    else stop()
  }

  const onMotionChange = () => {
    reduceMotion = Boolean(motionMql?.matches)
    if (reduceMotion) {
      stop()
      reset()
      return
    }
    wake()
  }

  onMounted(() => {
    documentVisible = !document.hidden
    document.addEventListener('visibilitychange', onVisibility)

    motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion = motionMql.matches
    motionMql.addEventListener('change', onMotionChange)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    const node = host()
    if (node) {
      io = new IntersectionObserver(
        ([entry]) => {
          inView = entry?.isIntersecting ?? false
          if (inView) wake()
          else {
            stop()
            reset()
          }
        },
        { threshold: 0 },
      )
      io.observe(node)
    }

    readSticky()
    lastScrollY = window.scrollY
    lastLayoutTop = layoutTop()
    publish(0)
    if (allowed()) wake()
  })

  onBeforeUnmount(() => {
    stop()
    io?.disconnect()
    io = null
    motionMql?.removeEventListener('change', onMotionChange)
    motionMql = null
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  })
}
