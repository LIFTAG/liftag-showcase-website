// Cursor-proximity pull for primary CTAs. Mark a wrapper with
// `data-magnetic` (optional numeric strength, default 14). The wrapper
// should not own its own transform. Client-only so SSR stays directive-free.
interface MagneticState {
  rafId: number
  targetX: number
  targetY: number
  x: number
  y: number
  inside: boolean
  strength: number
  centerX: number
  centerY: number
  halfW: number
  halfH: number
  onEnter: (e: PointerEvent) => void
  onMove: (e: PointerEvent) => void
  onLeave: () => void
}

const attached = new WeakSet<HTMLElement>()

function magneticAllowed() {
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function tick(el: HTMLElement, state: MagneticState) {
  const lerp = 0.16
  state.x += (state.targetX - state.x) * lerp
  state.y += (state.targetY - state.y) * lerp

  const settled = !state.inside
    && Math.abs(state.x) < 0.1
    && Math.abs(state.y) < 0.1

  if (settled) {
    state.x = 0
    state.y = 0
    state.rafId = 0
    el.style.transform = ''
    el.style.willChange = ''
    return
  }

  el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
  state.rafId = requestAnimationFrame(() => tick(el, state))
}

function wake(el: HTMLElement, state: MagneticState) {
  if (state.rafId === 0) {
    state.rafId = requestAnimationFrame(() => tick(el, state))
  }
}

function attach(el: HTMLElement) {
  if (attached.has(el)) return
  attached.add(el)

  const parsed = Number.parseFloat(el.dataset.magnetic || '')
  const state: MagneticState = {
    rafId: 0,
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    inside: false,
    strength: Number.isFinite(parsed) && parsed > 0 ? parsed : 14,
    centerX: 0,
    centerY: 0,
    halfW: 1,
    halfH: 1,
    onEnter: (e) => {
      if (!magneticAllowed()) return
      const rect = el.getBoundingClientRect()
      state.centerX = rect.left + rect.width / 2
      state.centerY = rect.top + rect.height / 2
      state.halfW = Math.max(1, rect.width / 2)
      state.halfH = Math.max(1, rect.height / 2)
      state.inside = true
      el.style.willChange = 'transform'
      state.onMove(e)
    },
    onMove: (e) => {
      if (!state.inside) return
      const nx = Math.max(-1, Math.min(1, (e.clientX - state.centerX) / state.halfW))
      const ny = Math.max(-1, Math.min(1, (e.clientY - state.centerY) / state.halfH))
      state.targetX = nx * state.strength
      state.targetY = ny * state.strength * 0.6
      wake(el, state)
    },
    onLeave: () => {
      state.inside = false
      state.targetX = 0
      state.targetY = 0
      wake(el, state)
    },
  }

  el.addEventListener('pointerenter', state.onEnter, { passive: true })
  el.addEventListener('pointermove', state.onMove, { passive: true })
  el.addEventListener('pointerleave', state.onLeave, { passive: true })
  el.addEventListener('pointercancel', state.onLeave, { passive: true })
}

function scan() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(attach)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    if (!magneticAllowed()) return

    scan()

    // Hero and nav magnets exist on first paint. Below-fold CTAs (FinalCta)
    // hydrate later; wait for idle before walking the whole tree on every
    // mutation so the observer does not compete with LCP / TBT.
    const startObserver = () => {
      const mo = new MutationObserver(scan)
      mo.observe(document.body, { childList: true, subtree: true })
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    }
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(startObserver, { timeout: 4000 })
      return
    }

    window.setTimeout(startObserver, 1)
  })
})
