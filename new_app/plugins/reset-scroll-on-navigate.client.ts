/**
 * Re-asserts the top of the page after an in-app navigation.
 *
 * The router already asks for `{ top: 0 }` on a route change, and in a desktop
 * browser that is the end of it. On a phone it is not: a tap that lands while a
 * fling is still decelerating leaves the momentum running, and the browser keeps
 * applying it after the router has set the position - so the new page opens part
 * way down, with the nav already wearing its scrolled blur and the hero image cut
 * off. Same class of problem the reload plugin next door solves, so the same
 * shape of answer: pin the top across the few frames the browser can still move
 * us in, rather than once.
 *
 * Deliberately narrow. Back and forward restore their own position, hash links
 * own their target, and a query-only change (the catalog filters rewriting `?q=`)
 * is not a navigation at all.
 */
const REASSERT_DELAYS_MS = [0, 60, 160]

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let historyNavigation = false

  const onPopState = () => {
    historyNavigation = true
  }
  window.addEventListener('popstate', onPopState)

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  const clearTimers = () => {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }

  router.afterEach((to, from) => {
    const restoringHistory = historyNavigation
    historyNavigation = false

    if (restoringHistory || to.hash || to.path === from.path) return

    clearTimers()
    scrollToTop()
    requestAnimationFrame(scrollToTop)
    for (const delay of REASSERT_DELAYS_MS) {
      const timer = setTimeout(() => {
        timers.delete(timer)
        scrollToTop()
      }, delay)
      timers.add(timer)
    }
  })

  // A user scroll before the last re-assert fires is an intent to be somewhere
  // else, and fighting it would trap them at the top of the page.
  window.addEventListener('wheel', clearTimers, { passive: true })
  window.addEventListener('touchstart', clearTimers, { passive: true })
})
