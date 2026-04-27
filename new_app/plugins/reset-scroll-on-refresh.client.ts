export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const isReload = navigation?.type === 'reload'

  if (!isReload) return

  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    )
  }

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  scrollToTop()
  requestAnimationFrame(scrollToTop)
  window.setTimeout(scrollToTop, 0)
  window.setTimeout(scrollToTop, 120)
})
