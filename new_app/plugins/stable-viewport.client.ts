const MOBILE_BREAKPOINT_PX = 768
const SHORT_VIEWPORT_HEIGHT_PX = 740
const WIDTH_CHANGE_THRESHOLD_PX = 24
const MAX_REASONABLE_MOBILE_SCREEN_HEIGHT_PX = 1600

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const root = document.documentElement
  let stableHeight = 0
  let lastWidth = 0
  let lastOrientation = ''
  let raf = 0

  function readViewport() {
    const visualViewport = window.visualViewport
    const width = Math.round(
      visualViewport?.width
      || window.innerWidth
      || root.clientWidth
      || 0,
    )
    const height = Math.round(Math.max(
      visualViewport?.height || 0,
      window.innerHeight || 0,
      root.clientHeight || 0,
    ))

    return { width, height }
  }

  function readStableHeight(width: number, height: number) {
    const screenWidth = window.screen?.width || 0
    const screenHeight = window.screen?.height || 0
    const usableScreenHeight = width <= MOBILE_BREAKPOINT_PX
      && screenWidth > 0
      && screenWidth <= MOBILE_BREAKPOINT_PX
      && screenHeight >= height
      && screenHeight <= MAX_REASONABLE_MOBILE_SCREEN_HEIGHT_PX
      ? screenHeight
      : 0

    return Math.round(Math.max(height, usableScreenHeight))
  }

  function applyViewportVars(forceReset = false) {
    raf = 0

    const { width, height } = readViewport()
    if (!width || !height) return

    const orientation = width > height ? 'landscape' : 'portrait'
    const widthChanged = Math.abs(width - lastWidth) > WIDTH_CHANGE_THRESHOLD_PX
    const orientationChanged = orientation !== lastOrientation
    const nextHeight = readStableHeight(width, height)

    stableHeight = forceReset || !stableHeight || widthChanged || orientationChanged
      ? nextHeight
      : Math.max(stableHeight, nextHeight)

    lastWidth = width
    lastOrientation = orientation

    root.style.setProperty('--liftag-stable-vh-px', `${stableHeight}px`)
    root.style.setProperty('--liftag-stable-vh-unit', `${stableHeight / 100}px`)

    root.style.setProperty('--liftag-stable-vh', `${stableHeight}px`)
    root.style.setProperty('--liftag-stable-vh-39', `${stableHeight * 0.39}px`)
    root.style.setProperty('--liftag-stable-vh-185', `${stableHeight * 1.85}px`)
    root.style.setProperty('--liftag-stable-vh-220', `${stableHeight * 2.2}px`)
    root.style.setProperty('--liftag-stable-vh-300', `${stableHeight * 3}px`)
    root.style.setProperty('--liftag-stable-vh-340', `${stableHeight * 3.4}px`)
    root.style.setProperty('--liftag-stable-vh-380', `${stableHeight * 3.8}px`)
    root.style.setProperty('--liftag-stable-vh-470', `${stableHeight * 4.7}px`)

    root.dataset.liftagShortViewport = stableHeight <= SHORT_VIEWPORT_HEIGHT_PX ? 'true' : 'false'
  }

  function scheduleViewportUpdate(forceReset = false) {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => applyViewportVars(forceReset))
  }

  applyViewportVars(true)

  window.addEventListener('resize', () => scheduleViewportUpdate(), { passive: true })
  window.addEventListener('orientationchange', () => scheduleViewportUpdate(true), { passive: true })
  window.visualViewport?.addEventListener('resize', () => scheduleViewportUpdate(), { passive: true })
})
