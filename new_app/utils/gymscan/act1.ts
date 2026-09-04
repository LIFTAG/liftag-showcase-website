// Scroll-owned Act 1: approach -> QR lock -> the fold that leaves the room.
// The input is normalized across the cut's complete sticky scroll budget.
//
// There is no rep here any more. The film's argument is "a tagged machine, a
// plate you scan, and the app it opens", and a hologram athlete pressing once
// between the approach and the lock was a second subject in the middle of that
// sentence. Approach, lock, leave.

import { clamp01, ease } from './timeline.ts'

export type Act1Shot = 'approach' | 'lock' | 'fold'

export interface Act1State {
  shot: Act1Shot
  dollyU: number
  lockU: number
  foldU: number
}

export interface Act1Windows {
  approachEnd: number
  lockEnd: number
  /**
   * Scene progress where the glass starts forming. Before `approachEnd`: the
   * last of the zoom onto the plate is already the phone arriving, not a
   * parked close-up that then waits for a bezel.
   */
  foldStart: number
  foldEnd: number
}

// Both cuts end on the fold: it is the match cut onto the phone, and the phone
// is what travels into the landing hero. A cut that stops at the lock has
// nowhere to go.
//
// The lock is a beat, not a chapter. It was a parked camera while a status
// label counted modules, which is the film stopping to narrate itself - the
// whole read is "the corners settle on the code and the room folds". The glass
// does not wait for that blink: it starts as the dolly commits to the plate so
// the zoom is already a viewfinder, not a close-up that then grows a bezel.
// Most of the budget belongs to the move.
const DESKTOP_SPANS = [2.9, 0.12, 0.48] as const
const PHONE_SPANS = [1.45, 0.06, 0.24] as const

/**
 * Dolly progress at which the phone starts forming.
 *
 * `0.52` is just after the 0.46 approach stop — the close onto the plate,
 * not the last of the zoom. The viewfinder has to be on while the code is
 * still growing in frame, or the overlap reads as a parked close-up.
 */
export const FOLD_AT_DOLLY = 0.52

export function act1Windows(phone: boolean): Act1Windows {
  const [approach, lock, fold] = phone ? PHONE_SPANS : DESKTOP_SPANS
  const total = approach + lock + fold
  const approachEnd = approach / total
  return {
    approachEnd,
    lockEnd: (approach + lock) / total,
    foldStart: approachEnd * FOLD_AT_DOLLY,
    foldEnd: 1,
  }
}

function phaseU(value: number, start: number, end: number): number {
  if (end <= start) return value < end ? 0 : 1
  return clamp01((value - start) / (end - start))
}

/**
 * Phone-screen fill on the planted plate, 0–1.
 *
 * The glass starts forming at `dollyU = 0.52`. The first cut ramped this
 * from 0.74–0.94 and killed it with `foldU` 0–0.40 — windows that do not
 * overlap, so the light never came on. The zoomed code was then lit only
 * by a room key whose cone no longer reaches the plate, which is the dim
 * close-up. Comes on with the viewfinder zoom, holds through the lock,
 * dies as the glass covers the gym.
 */
export function phoneFillAmp(dollyU: number, foldU: number): number {
  return ease(dollyU, 0.62, 0.80) * (1 - ease(foldU, 0.78, 0.96))
}

/** Candela. Tuned against the 0.85 m seated eye-to-plate distance. */
export const PHONE_FILL_INTENSITY = 1.45

/** Sample Act 1 at normalized sticky-scroll progress. */
export function act1At(progress: number, phone: boolean): Act1State {
  const u = clamp01(progress)
  const w = act1Windows(phone)
  const dollyU = phaseU(u, 0, w.approachEnd)
  const lockU = phaseU(u, w.approachEnd, w.lockEnd)
  const foldU = phaseU(u, w.foldStart, w.foldEnd)

  if (u < w.approachEnd) {
    return { shot: 'approach', dollyU, lockU, foldU }
  }
  if (u < w.lockEnd) {
    return { shot: 'lock', dollyU, lockU, foldU }
  }
  return { shot: 'fold', dollyU, lockU, foldU }
}
