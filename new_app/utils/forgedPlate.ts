/**
 * Press choreography for the forged PR plate.
 *
 * The metal has to look like it comes out of a pour, then a press, not like a
 * chrome primitive that faded in. These curves are the only clock the shader
 * reads, so the Vue layer can stay a WebGL host.
 */

export type PlatePhase = {
  /** 1 = still molten and warped, 0 = solid chrome. */
  pour: number
  /** 0..1 how much the body has cooled into a plate. */
  settle: number
  /** 0..1 depth of the stamped depression. */
  stamp: number
  /** 0..1 momentary flatten as the press hits. */
  squash: number
  /** 0..1 shockwave travelling out from the stamp. */
  shock: number
  /** Residual life after the press: iridescence and micro-pour. */
  live: number
}

export const PLATE_PRESS_MS = 2200

const POUR_START_MS = 240
const POUR_END_MS = 1320
const SETTLE_START_MS = 180
const SETTLE_END_MS = 1400
const STAMP_START_MS = 1080
const STAMP_END_MS = 1680
const SQUASH_IN_MS = 1040
const SQUASH_PEAK_MS = 1280
const SQUASH_OUT_MS = 1620
const SHOCK_START_MS = 1200
const SHOCK_END_MS = 2100
const LIVE_START_MS = 1480
const LIVE_END_MS = 2200

export const PLATE_REST_TILT = {
  rotX: 0.48,
  rotY: -0.20,
} as const

const SETTLED_PHASE: PlatePhase = {
  pour: 0,
  settle: 1,
  stamp: 1,
  squash: 0,
  shock: 1,
  live: 0.42,
}

function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t
}

function smootherstep(t: number) {
  const x = clamp01(t)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

function spanProgress(t: number, start: number, end: number) {
  return smootherstep((t - start) / Math.max(1e-6, end - start))
}

export function platePhaseAt(elapsedMs: number, reduceMotion = false): PlatePhase {
  if (reduceMotion) return { ...SETTLED_PHASE, live: 0 }

  const t = Math.max(0, elapsedMs)
  const pour = 1 - spanProgress(t, POUR_START_MS, POUR_END_MS)
  const settle = spanProgress(t, SETTLE_START_MS, SETTLE_END_MS)
  const stamp = spanProgress(t, STAMP_START_MS, STAMP_END_MS)
  const squashIn = spanProgress(t, SQUASH_IN_MS, SQUASH_PEAK_MS)
  const squashOut = spanProgress(t, SQUASH_PEAK_MS, SQUASH_OUT_MS)
  const squash = squashIn * (1 - squashOut)
  const shock = spanProgress(t, SHOCK_START_MS, SHOCK_END_MS)
  const live = 0.12 * settle + 0.48 * spanProgress(t, LIVE_START_MS, LIVE_END_MS)

  return { pour, settle, stamp, squash, shock, live }
}

export function platePointerTilt(mx: number, my: number) {
  return {
    rotX: PLATE_REST_TILT.rotX + my * 0.15,
    rotY: PLATE_REST_TILT.rotY + mx * 0.26,
  }
}

export function plateIdleSway(elapsedMs: number, live: number) {
  const t = elapsedMs * 0.001
  const amount = clamp01(live)
  return {
    rotX: Math.sin(t * 0.33) * 0.028 * amount,
    rotY: Math.cos(t * 0.27) * 0.036 * amount,
  }
}
