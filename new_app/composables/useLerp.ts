// Smooth lerp composable — drives cursor orb and phone parallax in Hero.
// Returns a reactive `out` object whose x/y trail the given `target` each RAF frame.
//
// The rAF loop pauses once `val` has converged to `target` (delta below
// CONVERGE_EPSILON), and is woken back up whenever the shared mousemove
// listener fires. This keeps the visible motion identical to a forever-rAF
// while leaving the page idle when nothing is moving.

import { onMouseEvent } from './useSharedMouse'

const CONVERGE_EPSILON = 0.0005

export function useLerp(target: { x: number; y: number }, factor = 0.08) {
  const val = { x: 0, y: 0 }
  const out = ref({ x: 0, y: 0 })
  let rafId = 0
  let unsubscribe: (() => void) | null = null

  const tick = () => {
    val.x += (target.x - val.x) * factor
    val.y += (target.y - val.y) * factor

    const dx = target.x - val.x
    const dy = target.y - val.y

    if (Math.abs(dx) < CONVERGE_EPSILON && Math.abs(dy) < CONVERGE_EPSILON) {
      // Snap to target so out.value reflects the final resting position,
      // then stop ticking. wake() restarts the loop on the next mouse event.
      val.x = target.x
      val.y = target.y
      out.value = { x: val.x, y: val.y }
      rafId = 0
      return
    }

    out.value = { x: val.x, y: val.y }
    rafId = requestAnimationFrame(tick)
  }

  const wake = () => {
    if (rafId === 0) {
      rafId = requestAnimationFrame(tick)
    }
  }

  onMounted(() => {
    rafId = requestAnimationFrame(tick)
    unsubscribe = onMouseEvent(wake)
  })

  onBeforeUnmount(() => {
    if (rafId !== 0) cancelAnimationFrame(rafId)
    rafId = 0
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  })

  return out
}
