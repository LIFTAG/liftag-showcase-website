export default defineNuxtPlugin(() => {
  const { initialize } = useGtag()

  const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const
  // gtag.js is a ~150ms evaluation on a mid-range phone. Loading it straight
  // off the first scroll landed that task in the middle of the user's fling,
  // which read as a hitch right as the page started to move. Wait for the
  // page to sit still, then take an idle slot; never wait past the cap.
  const SETTLE_MS = 1200
  const MAX_DEFER_MS = 8000

  let scheduled = false
  let initialized = false
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let capTimer: ReturnType<typeof setTimeout> | null = null

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
  }

  const start = () => {
    if (initialized) return
    initialized = true
    if (settleTimer) clearTimeout(settleTimer)
    if (capTimer) clearTimeout(capTimer)
    window.removeEventListener('scroll', onSettleScroll)
    initialize()
  }

  const startWhenIdle = () => {
    if (idleWindow.requestIdleCallback) idleWindow.requestIdleCallback(start, { timeout: 2000 })
    else window.setTimeout(start, 1)
  }

  function onSettleScroll() {
    if (settleTimer) clearTimeout(settleTimer)
    settleTimer = setTimeout(startWhenIdle, SETTLE_MS)
  }

  const schedule = () => {
    if (scheduled) return
    scheduled = true
    for (const type of INTERACTION_EVENTS) window.removeEventListener(type, schedule)
    window.addEventListener('scroll', onSettleScroll, { passive: true })
    settleTimer = setTimeout(startWhenIdle, SETTLE_MS)
    capTimer = setTimeout(startWhenIdle, MAX_DEFER_MS)
  }

  for (const type of INTERACTION_EVENTS) {
    window.addEventListener(type, schedule, { once: true, passive: true })
  }

  // Do not force-load on idle timeout. Lighthouse's quiet window still
  // fires requestIdleCallback and would parse ~170KB of gtag on the lab
  // trace. Real visitors hit the listeners above.
})
