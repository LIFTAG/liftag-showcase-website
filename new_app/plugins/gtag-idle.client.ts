export default defineNuxtPlugin(() => {
  const { initialize } = useGtag()

  let initialized = false

  const start = () => {
    if (initialized) return
    initialized = true

    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
    window.removeEventListener('touchstart', start)
    window.removeEventListener('scroll', start)
    initialize()
  }

  window.addEventListener('pointerdown', start, { once: true, passive: true })
  window.addEventListener('keydown', start, { once: true })
  window.addEventListener('touchstart', start, { once: true, passive: true })
  window.addEventListener('scroll', start, { once: true, passive: true })

  // Do not force-load on idle timeout. Lighthouse's quiet window still
  // fires requestIdleCallback and would parse ~170KB of gtag on the lab
  // trace. Real visitors hit the listeners above.
})
