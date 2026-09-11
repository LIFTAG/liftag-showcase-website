import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import { consumeScrubDelta, horizontalWheelDelta, NUMBER_SCRUB_THRESHOLD } from '~/utils/numberScrub'

const AXIS_LOCK_PX = 8

/**
 * Horizontal trackpad / touch travel on a number field steps the value.
 * Vertical motion is left to the page. No overflow, so no scrollbar.
 */
export function useNumberScrub(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: {
    step: (steps: number) => void
    onActivate?: () => void
    threshold?: number
  },
) {
  if (!import.meta.client) return

  watch(
    () => toValue(target),
    (el, _previous, onCleanup) => {
      if (!el) return
      onCleanup(bindNumberScrub(el, options))
    },
    { flush: 'post', immediate: true },
  )
}

function bindNumberScrub(
  host: HTMLElement,
  options: {
    step: (steps: number) => void
    onActivate?: () => void
    threshold?: number
  },
) {
  const threshold = options.threshold ?? NUMBER_SCRUB_THRESHOLD
  let remainder = 0
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let lastX = 0
  let axis: 'x' | 'y' | null = null

  function apply(delta: number) {
    const next = consumeScrubDelta(remainder, delta, threshold)
    remainder = next.remainder
    if (next.steps) options.step(next.steps)
  }

  function fromControl(event: Event) {
    const node = event.target
    return node instanceof Element && !node.closest('button, input, textarea')
  }

  function onWheel(event: WheelEvent) {
    const delta = horizontalWheelDelta(event)
    if (delta == null) return
    event.preventDefault()
    apply(delta)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    if (!fromControl(event)) return
    pointerId = event.pointerId
    startX = lastX = event.clientX
    startY = event.clientY
    axis = null
    remainder = 0
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    const dx = event.clientX - lastX
    if (!axis) {
      const travelX = event.clientX - startX
      const travelY = event.clientY - startY
      if (Math.hypot(travelX, travelY) < AXIS_LOCK_PX) return
      axis = Math.abs(travelX) > Math.abs(travelY) ? 'x' : 'y'
      if (axis !== 'x') return
      try { host.setPointerCapture(event.pointerId) }
      catch { /* capture is best-effort on older WebKit */ }
      lastX = event.clientX
      apply(travelX)
      return
    }
    if (axis !== 'x') return
    lastX = event.clientX
    apply(dx)
  }

  function endPointer(event: PointerEvent, activate: boolean) {
    if (event.pointerId !== pointerId) return
    const tapped = activate && axis === null
    pointerId = null
    axis = null
    try { host.releasePointerCapture(event.pointerId) }
    catch { /* already released */ }
    if (tapped) options.onActivate?.()
  }

  function onPointerUp(event: PointerEvent) {
    endPointer(event, true)
  }

  function onPointerCancel(event: PointerEvent) {
    endPointer(event, false)
  }

  function onTouchMove(event: TouchEvent) {
    if (axis === 'x') event.preventDefault()
  }

  host.addEventListener('wheel', onWheel, { passive: false })
  host.addEventListener('pointerdown', onPointerDown)
  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerup', onPointerUp)
  host.addEventListener('pointercancel', onPointerCancel)
  host.addEventListener('touchmove', onTouchMove, { passive: false })

  return () => {
    host.removeEventListener('wheel', onWheel)
    host.removeEventListener('pointerdown', onPointerDown)
    host.removeEventListener('pointermove', onPointerMove)
    host.removeEventListener('pointerup', onPointerUp)
    host.removeEventListener('pointercancel', onPointerCancel)
    host.removeEventListener('touchmove', onTouchMove)
  }
}
