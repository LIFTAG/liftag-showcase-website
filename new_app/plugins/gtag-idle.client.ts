export default defineNuxtPlugin(() => {
  const { initialize } = useGtag()
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    cancelIdleCallback?: (handle: number) => void
  }

  let initialized = false
  let idleHandle: number | null = null
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null

  const start = () => {
    if (initialized) return
    initialized = true

    if (idleHandle !== null) {
      idleWindow.cancelIdleCallback?.(idleHandle)
    }
    if (fallbackTimer) clearTimeout(fallbackTimer)

    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
    window.removeEventListener('touchstart', start)
    initialize()
  }

  const scheduleIdleStart = () => {
    if (initialized) return

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(start, { timeout: 9000 })
      return
    }

    fallbackTimer = setTimeout(start, 9000)
  }

  window.addEventListener('pointerdown', start, { once: true, passive: true })
  window.addEventListener('keydown', start, { once: true })
  window.addEventListener('touchstart', start, { once: true, passive: true })

  if (document.readyState === 'complete') {
    scheduleIdleStart()
  } else {
    window.addEventListener('load', scheduleIdleStart, { once: true })
  }
})
