// Single window-level mousemove listener shared across the entire page.
// Previously each Phone3D / Macbook3D / DashboardSection / Hero installed its
// own - at 6+ instances and up to 240Hz on modern trackpads, that was a real
// per-event handler tax. This module owns one listener and exposes:
//   • `latest`     - current mouse state (read-on-rAF consumers)
//   • `samples`    - bounded ring buffer for delay-tilted phones
//   • `onMouseEvent(cb)` - subscribe for event-driven consumers (e.g. Vue refs
//     that have to be set explicitly to trigger reactivity)
//
// `latest` exposes both `mx/my` (normalized -1..1, used by 3D tilts) and `x/y`
// aliases (same values, kept for callers like useLerp that read `.x/.y`), plus
// raw `clientX/clientY` for cursor-position consumers.

interface MouseSample {
  time: number
  mx: number
  my: number
}

const SAMPLE_LIMIT = 240

const latest = {
  mx: 0,
  my: 0,
  x: 0,
  y: 0,
  clientX: 0,
  clientY: 0,
}
const samples: MouseSample[] = []
const subscribers = new Set<() => void>()
let installed = false

function ensureListener() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2
    const my = (e.clientY / window.innerHeight - 0.5) * 2
    latest.mx = mx
    latest.my = my
    latest.x = mx
    latest.y = my
    latest.clientX = e.clientX
    latest.clientY = e.clientY
    samples.push({ time: performance.now(), mx, my })
    if (samples.length > SAMPLE_LIMIT) samples.shift()
    subscribers.forEach((cb) => cb())
  }, { passive: true })
}

export function useSharedMouse() {
  ensureListener()
  return { latest, samples }
}

// Subscribe to the underlying mousemove. Returns an unsubscribe function.
// Use only when you need event-driven updates (e.g. setting a Vue ref so
// templates re-render). Most consumers should just read `latest` from their
// own rAF loop.
export function onMouseEvent(cb: () => void): () => void {
  ensureListener()
  subscribers.add(cb)
  return () => { subscribers.delete(cb) }
}

// Linear scan for the sample bracket at `time`. Samples is bounded (≤240),
// so worst case ~240 comparisons per call - trivial. Mirrors the original
// per-instance helper but never shifts (consumers share the array).
export function delayedSampleAt(buffer: MouseSample[], time: number): MouseSample | null {
  if (!buffer.length) return null
  let i = 0
  while (i + 1 < buffer.length && buffer[i + 1].time <= time) i++
  const previous = buffer[i]
  const next = buffer[i + 1]
  if (time < previous.time) return null
  if (!next) return previous
  const span = Math.max(1, next.time - previous.time)
  const t = Math.min(1, Math.max(0, (time - previous.time) / span))
  return {
    time,
    mx: previous.mx + (next.mx - previous.mx) * t,
    my: previous.my + (next.my - previous.my) * t,
  }
}
