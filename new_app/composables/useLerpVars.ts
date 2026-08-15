// Smooth lerp that lands on CSS custom properties instead of reactive state.
//
// Each frame the loop advances an internal value toward `target` and writes it
// to `--<prefix>-mx` / `--<prefix>-my` on a single element. Consumers express
// their parallax as calc() over those two numbers, so a pointer move costs two
// setProperty calls on one node plus a compositor pass - never a component
// re-render.
//
// This mirrors what Hero's scroll handler already does for --hero-fade and
// --hero-lift. The mouse path used to publish a `ref` instead, which re-rendered
// every consuming component on every frame of a ~120-frame convergence tail:
// Hero alone re-evaluated four phone transforms, four opacity bindings and every
// other inline style object in its template each time. It survived on desktop,
// but it is why a single synthesised iOS mousemove could stall the page for
// seconds.
//
// The published values are unitless and normalized (-1..1), matching the raw
// values on useSharedMouse's `latest`. Consumers scale them in CSS -
// `calc(var(--hero-mx) * -18px)`, `rotateZ(calc(var(--hero-mx) * 0.35deg))` -
// and declare a `0` default on the same element so the properties resolve
// during SSR and before the first pointer event.
//
// The rAF loop pauses once `val` has converged to `target` (delta below
// CONVERGE_EPSILON), and is woken back up whenever the shared mousemove
// listener fires. This keeps the visible motion identical to a forever-rAF
// while leaving the page idle when nothing is moving.
//
// The optional `isActive` gate keeps a far-offscreen section's loop from being
// woken by every mousemove on the page. While it returns false, wake() no-ops
// and the initial start is skipped; the loop is started (and so catches up to
// the current target) as soon as the gate flips true.

import type { Ref } from 'vue'
import { onMouseEvent } from './useSharedMouse'

// Threshold on the normalized (-1..1) value, so it has to be read against the
// largest multiplier any consumer applies: 32px (DashboardSection's deploy
// chip). At 0.005 the final snap moves at most 0.16px - under half a device
// pixel at 3x DPR, on a transform the compositor positions sub-pixel, so it
// cannot show a step. The previous 0.0005 was two orders of magnitude below one
// pixel and spent roughly 40 extra frames per gesture animating nothing.
const CONVERGE_EPSILON = 0.005

// Four decimals is ~0.003px at that same 32px multiplier: finer than the
// convergence threshold, and it keeps the written strings short.
const VAR_PRECISION = 4

export function useLerpVars(
  el: Ref<HTMLElement | null>,
  target: { x: number; y: number },
  prefix: string,
  factor = 0.08,
  isActive?: () => boolean,
) {
  const varX = `--${prefix}-mx`
  const varY = `--${prefix}-my`
  const val = { x: 0, y: 0 }
  let rafId = 0
  let unsubscribe: (() => void) | null = null

  const publish = () => {
    const node = el.value
    if (!node) return
    node.style.setProperty(varX, val.x.toFixed(VAR_PRECISION))
    node.style.setProperty(varY, val.y.toFixed(VAR_PRECISION))
  }

  const tick = () => {
    val.x += (target.x - val.x) * factor
    val.y += (target.y - val.y) * factor

    const dx = target.x - val.x
    const dy = target.y - val.y

    if (Math.abs(dx) < CONVERGE_EPSILON && Math.abs(dy) < CONVERGE_EPSILON) {
      // Snap to target so the published value is the exact resting position,
      // then stop ticking. wake() restarts the loop on the next mouse event.
      val.x = target.x
      val.y = target.y
      publish()
      rafId = 0
      return
    }

    publish()
    rafId = requestAnimationFrame(tick)
  }

  const wake = () => {
    if (isActive && !isActive()) return
    if (rafId === 0) {
      rafId = requestAnimationFrame(tick)
    }
  }

  if (isActive) {
    watch(isActive, (active) => {
      if (active) wake()
    })
  }

  onMounted(() => {
    if (!isActive || isActive()) rafId = requestAnimationFrame(tick)
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
}
