import type { Ref } from 'vue'
import { placeContentGlyphs } from '~/utils/gymGlyphMesh'
import { gymCopyReducedKey } from './useGymCopyReveal'

type Point = { x: number; y: number }
type Facet = { points: Point[]; start: number; drift: number }
const DURATION = 1600
const clamp = (n: number) => Math.max(0, Math.min(1, n))

/**
 * Builds run one per idle slice. Every hero entry used to build in its own
 * `document.fonts.ready` continuation, and those all resolve in the same task:
 * eleven glyph rasters + getImageData + facet scans in one long task, right as
 * the opening logo animates. A build is only needed by the time its entry arms
 * (the opening waits for the arrival doors and the first sweep), and an entry
 * that arms first builds on the spot.
 */
type IdleJob = () => void
const idleJobs: IdleJob[] = []
let idlePending = false
function pumpIdle(deadline?: IdleDeadline) {
  idlePending = false
  do {
    idleJobs.shift()?.()
  } while (idleJobs.length && deadline && !deadline.didTimeout && deadline.timeRemaining() > 8)
  if (idleJobs.length) scheduleIdle()
}
function scheduleIdle() {
  if (idlePending) return
  idlePending = true
  if (typeof requestIdleCallback === 'function') requestIdleCallback(pumpIdle, { timeout: 400 })
  else setTimeout(pumpIdle, 16)
}
function queueIdle(job: IdleJob): () => void {
  idleJobs.push(job)
  scheduleIdle()
  return () => {
    const at = idleJobs.indexOf(job)
    if (at >= 0) idleJobs.splice(at, 1)
  }
}

/** A short-lived canvas projection, sampled from the actual laid-out glyphs. */
export function useGymGlyphMesh(
  host: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  delay: () => number,
) {
  const ready = shallowRef(false)
  const playing = shallowRef(false)
  const done = shallowRef(false)
  const reduced = inject(gymCopyReducedKey, null)
  let raf = 0
  let disposed = false
  let finished = false
  let started = 0
  let width = 0
  let height = 0
  let facets: Facet[] = []
  let observer: MutationObserver | undefined
  let resize: ResizeObserver | undefined
  let motion: MediaQueryList | undefined
  let ctx: CanvasRenderingContext2D | null = null
  let building = false
  let cancelQueued: (() => void) | null = null
  // Scratch for the per-facet vertex offsets in draw(); no per-frame garbage.
  const xs = new Float64Array(3)
  const ys = new Float64Array(3)

  function finish() {
    finished = true
    cancelQueued?.()
    cancelQueued = null
    cancelAnimationFrame(raf)
    observer?.disconnect()
    resize?.disconnect()
    ready.value = false
    playing.value = false
    done.value = true
    ctx?.clearRect(0, 0, width, height)
  }

  function build() {
    if (building) return false
    const root = host.value
    const surface = canvas.value
    const content = root?.querySelector<HTMLElement>('.gx-hero-entry__content')
    if (!root || !surface || !content) return false
    const box = root.getBoundingClientRect()
    width = Math.ceil(box.width)
    height = Math.ceil(box.height)
    if (!width || !height) return false
    building = true
    try {
      const mask = document.createElement('canvas')
      mask.width = width
      mask.height = height
      const ink = mask.getContext('2d', { willReadFrequently: true })
      ctx = surface.getContext('2d')
      if (!ink || !ctx) return false
      const dpr = Math.min(devicePixelRatio || 1, 2)
      surface.width = Math.ceil(width * dpr)
      surface.height = Math.ceil(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ink.fillStyle = 'white'
      ink.textAlign = 'left'
      ink.textBaseline = 'alphabetic'
      const glyphs = placeContentGlyphs(content, box)
      let largestFont = 12
      for (const glyph of glyphs) {
        largestFont = Math.max(largestFont, glyph.fontSize)
        ink.font = glyph.font
        ink.fillText(glyph.char, glyph.x, glyph.y)
      }
      if (!glyphs.length) return false
      const pixels = ink.getImageData(0, 0, width, height).data
      const cell = Math.max(2.5, Math.min(6, largestFont / 9))
      const rowHeight = cell * .866
      const inside = (x: number, y: number) => {
        const ix = Math.round(x), iy = Math.round(y)
        return ix >= 0 && iy >= 0 && ix < width && iy < height && pixels[(iy * width + ix) * 4 + 3]! > 90
      }
      facets = []
      for (let row = 0; row * rowHeight < height; row++) {
        const y = row * rowHeight
        const shift = row % 2 ? cell / 2 : 0
        for (let x = -cell; x < width; x += cell) {
          const a = { x: x + shift, y }
          const b = { x: x + shift + cell, y }
          const c = { x: x + shift + cell / 2, y: y + rowHeight }
          const d = { x: x + shift - cell / 2, y: y + rowHeight }
          for (const points of [[a, b, c], [a, c, d]]) {
            const cx = points.reduce((sum, p) => sum + p.x, 0) / 3
            const cy = points.reduce((sum, p) => sum + p.y, 0) / 3
            // Centroid sampling leaves a faceted edge around each letter, while
            // retaining the empty counters instead of meshing the text's box.
            if (!inside(cx, cy)) continue
            const seed = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453
            const noise = seed - Math.floor(seed)
            facets.push({ points, start: cx / width * .28 + noise * .1, drift: (noise - .5) * cell * 1.8 })
          }
        }
      }
      return facets.length > 0
    } finally {
      building = false
    }
  }

  function draw(now: number) {
    if (finished || disposed || !ctx) return
    const t = (now - started - delay()) / DURATION
    ctx.clearRect(0, 0, width, height)
    if (t >= 1) { finish(); return }
    if (t >= 0) {
      const settle = Math.pow(1 - clamp(t / .7), 3)
      const fade = 1 - clamp((t - .62) / .36)
      ctx.lineWidth = .65
      // Same colour for every facet in a frame: parse it once, not per facet.
      // Each facet keeps its own path + stroke, so shared edges still
      // composite twice exactly as before.
      ctx.strokeStyle = `rgba(174, 215, 244, ${fade * .68})`
      for (const facet of facets) {
        const progress = clamp((t - facet.start) / .22)
        if (!progress) continue
        const shift = facet.drift * settle
        const p = facet.points
        xs[0] = p[0]!.x + shift; ys[0] = p[0]!.y + shift * .5
        xs[1] = p[1]!.x - shift; ys[1] = p[1]!.y + shift * .5
        xs[2] = p[2]!.x + shift; ys[2] = p[2]!.y - shift
        ctx.beginPath()
        ctx.moveTo(xs[0], ys[0])
        for (let edge = 0; edge < 3; edge++) {
          const amount = clamp(progress * 3 - edge)
          const b = (edge + 1) % 3
          ctx.lineTo(xs[edge]! + (xs[b]! - xs[edge]!) * amount, ys[edge]! + (ys[b]! - ys[edge]!) * amount)
          if (amount < 1) break
        }
        ctx.stroke()
      }
    }
    raf = requestAnimationFrame(draw)
  }

  function start() {
    if (started || finished || !ready.value || !host.value?.classList.contains('is-in')) return
    playing.value = true
    started = performance.now()
    raf = requestAnimationFrame(draw)
  }
  /** Build (once) and, if the entry is already armed, play. */
  function prepare() {
    cancelQueued?.()
    cancelQueued = null
    if (disposed || finished || ready.value) return
    try {
      if (!build()) {
        // Same outcome as before: no mesh, the CSS contour entrance remains.
        observer?.disconnect()
        resize?.disconnect()
        return
      }
      ready.value = true
      start()
    } catch {
      // Font/canvas failure retains the CSS contour entrance and native links.
      finish()
    }
  }
  function onClass() {
    // Arming before the idle build ran: build now so the mesh starts with
    // the CSS entrance, exactly as when every entry built up front.
    if (!ready.value && host.value?.classList.contains('is-in')) prepare()
    else start()
  }
  function onMotion() {
    if (motion?.matches || reduced?.value) finish()
  }
  watch(() => reduced?.value, onMotion)
  onMounted(async () => {
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', onMotion)
    host.value?.addEventListener('focusin', finish)
    if (motion.matches || reduced?.value) { finish(); return }
    await document.fonts.ready
    if (disposed || finished || !host.value) return
    observer = new MutationObserver(onClass)
    observer.observe(host.value, { attributes: true, attributeFilter: ['class'] })
    resize = new ResizeObserver(() => {
      // Sticky pin/URL-bar motion resizes the host. Rebuilding the mesh
      // mid-scroll is what made the tag and map copy shiver on a phone.
      // Before the first build there is nothing to redo, and the initial
      // notification (same size as the build just measured) is not a change;
      // rebuilding on it used to double every entry's start-up cost.
      if (!ready.value || started || finished || building || !host.value) return
      const box = host.value.getBoundingClientRect()
      if (Math.ceil(box.width) === width && Math.ceil(box.height) === height) return
      try {
        if (!build()) finish()
      } catch {
        finish()
      }
    })
    resize.observe(host.value)
    if (host.value.classList.contains('is-in')) prepare()
    else cancelQueued = queueIdle(prepare)
  })
  onBeforeUnmount(() => {
    disposed = true
    cancelQueued?.()
    cancelQueued = null
    cancelAnimationFrame(raf)
    observer?.disconnect()
    resize?.disconnect()
    motion?.removeEventListener('change', onMotion)
    host.value?.removeEventListener('focusin', finish)
  })
  return { ready, playing, done }
}
