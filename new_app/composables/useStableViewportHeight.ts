// Resolves the stable viewport height (the `--liftag-stable-vh-px` CSS var when
// present, otherwise the largest live viewport measurement).
//
// getComputedStyle() forces a style recalc, and four section rAF loops call this
// once per frame, so the resolved value is cached in module scope. The cache is
// dropped on window resize and on visualViewport resize (mobile URL-bar
// collapse), which are the only moments the answer can change. Listeners are
// installed lazily on the first client call and live for the page lifetime,
// matching the singleton shape of useSharedMouse.

let cachedHeight = 0
let listenersInstalled = false

function invalidate() {
  cachedHeight = 0
}

function installInvalidationListeners() {
  if (listenersInstalled) return
  listenersInstalled = true
  window.addEventListener('resize', invalidate, { passive: true })
  window.visualViewport?.addEventListener('resize', invalidate, { passive: true })
}

function measureStableViewportHeight() {
  const root = document.documentElement
  const cssHeight = Number.parseFloat(
    getComputedStyle(root).getPropertyValue('--liftag-stable-vh-px'),
  )

  if (Number.isFinite(cssHeight) && cssHeight > 0) {
    return cssHeight
  }

  return Math.max(
    window.visualViewport?.height || 0,
    window.innerHeight || 0,
    root.clientHeight || 0,
  )
}

export function useStableViewportHeight() {
  if (!import.meta.client) return 0

  installInvalidationListeners()

  // 0 doubles as the "not measured yet" sentinel: a degenerate 0 measurement is
  // simply re-taken next frame, which is what the uncached version did anyway.
  if (cachedHeight > 0) return cachedHeight

  cachedHeight = measureStableViewportHeight()
  return cachedHeight
}
