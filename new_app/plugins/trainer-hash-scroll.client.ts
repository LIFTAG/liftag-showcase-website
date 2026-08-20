import type { RouterScrollBehavior } from 'vue-router'
import {
  isTrainersHash,
  scrollToTrainerHandoff,
  trainerHandoffScrollTarget,
} from '~/utils/dashboardScroll'

const SEEK_MS = 8000
const RETRY_DELAYS_MS = [0, 80, 200, 480, 1000, 2000]

let stopActiveSeek: (() => void) | null = null

function seekTrainerHandoff() {
  if (!isTrainersHash(window.location.hash)) return

  stopActiveSeek?.()

  const timers: number[] = []
  let observer: MutationObserver | null = null
  let stopped = false

  const stop = () => {
    if (stopped) return
    stopped = true
    observer?.disconnect()
    observer = null
    for (const timer of timers) window.clearTimeout(timer)
    timers.length = 0
    if (stopActiveSeek === stop) stopActiveSeek = null
  }

  const attempt = () => {
    if (stopped) return true
    if (!scrollToTrainerHandoff()) return false
    stop()
    return true
  }

  stopActiveSeek = stop
  if (attempt()) return

  observer = new MutationObserver(() => {
    attempt()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  for (const delay of RETRY_DELAYS_MS) {
    timers.push(window.setTimeout(() => {
      attempt()
    }, delay))
  }

  timers.push(window.setTimeout(stop, SEEK_MS))
}

export default defineNuxtPlugin((nuxtApp) => {
  // First load: Vue Router skips scrollBehavior at START_LOCATION, and
  // scrollRestoration is manual, so the browser will not honour `#trainers`.
  // DashboardSection is also lazy, so the target may appear a beat later.
  nuxtApp.hook('app:mounted', () => {
    const router = useRouter()
    const original = router.options.scrollBehavior as RouterScrollBehavior | undefined

    router.options.scrollBehavior = (to, from, savedPosition) => {
      if (isTrainersHash(to.hash) && to.path === '/') {
        return new Promise((resolve) => {
          const started = Date.now()
          const run = () => {
            const target = trainerHandoffScrollTarget()
            if (target) {
              resolve(target)
              return
            }
            if (document.getElementById('trainers')) {
              resolve({ el: '#trainers', top: 0, behavior: 'auto' })
              return
            }
            if (Date.now() - started > SEEK_MS) {
              resolve(original ? original(to, from, savedPosition) : { el: to.hash, top: 0 })
              return
            }
            requestAnimationFrame(run)
          }
          run()
        })
      }
      return original?.(to, from, savedPosition)
    }

    seekTrainerHandoff()
  })

  nuxtApp.hook('page:finish', () => {
    seekTrainerHandoff()
  })
})
