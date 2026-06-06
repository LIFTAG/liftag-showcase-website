export function useStableViewportHeight() {
  if (!import.meta.client) return 0

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
