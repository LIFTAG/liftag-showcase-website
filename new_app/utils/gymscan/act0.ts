// Timed Act 0 clock. Scroll does not scrub this — skip snaps to the 0D hold.
// 0A hologram sweep → 0B assemble → 0C fly-in (card into POV) → 0D press + hold.
//
// 0A and 0B overlap. The machine does not wait for the whole mat: it is
// released as soon as the ground under its own feet will be solid and still by
// the time the first piece of the rain reaches it, so the frame is already
// falling into the cage while the outer slabs are still snapping in.

import { assembleWindows, firstImpactAt } from './assemble.ts'
import { floorDuration, matDuration } from './floorConstruct.ts'
import { FLOOR_MACHINE_R, floorClearAt } from './floorTiles.ts'
import { PASS_SPAN } from './hologramPass.ts'
import { flyDuration, PRESS_DUR, stickDuration } from './stick.ts'

export type Act0Shot = 'floor' | 'assemble' | 'fly' | 'stick' | 'hold'

export type Act0Windows = {
  floorEnd: number
  /**
   * When the mat is fully open. Later than `floorEnd`: the sweep and the slabs
   * end with the pass, but the plane keeps writing outward into the fog behind
   * them. Must stay under `assembleEnd`, where the fly-in kills the birth.
   */
  matEnd: number
  /** Release. Before `floorEnd`: the mat is still being written behind it. */
  assembleAt: number
  assembleEnd: number
  flyEnd: number
  stickEnd: number
  skipAt: number
  doorsAt: number
}

export type Act0State = {
  t: number
  phone: boolean
  shot: Act0Shot
  /** Seconds into the current shot. */
  localT: number
  /**
   * Seconds into 0A's floor birth, clamped at `matEnd`. Runs on its own clock
   * rather than the shot's, because 0B starts on top of it — and runs past
   * 0A's own end, because the plane is still washing in behind the machine.
   */
  floorT: number
  /** Seconds into 0B, or a planted sentinel once assemble has finished. */
  assembleT: number
  flyT: number
  stickT: number
  skipVisible: boolean
  doorsVisible: boolean
  done: boolean
}

export const ACT0_SKIP_AT = 0.8

export function act0Windows(phone: boolean): Act0Windows {
  const floorEnd = floorDuration(phone)
  // The slab field runs on pass-time; the phone compresses 0A, so scale back.
  const groundReady = (floorClearAt(FLOOR_MACHINE_R) / PASS_SPAN) * floorEnd
  const assembleAt = Math.min(floorEnd, Math.max(0, groundReady - firstImpactAt(phone)))
  const assembleEnd = assembleAt + assembleWindows(phone).doneAt
  const flyEnd = assembleEnd + flyDuration(phone)
  const stickEnd = flyEnd + stickDuration(phone)
  return {
    floorEnd,
    matEnd: matDuration(phone),
    assembleAt,
    assembleEnd,
    flyEnd,
    stickEnd,
    skipAt: ACT0_SKIP_AT,
    doorsAt: flyEnd + PRESS_DUR,
  }
}

export function act0Duration(phone: boolean): number {
  return act0Windows(phone).stickEnd
}

export function act0At(t: number, phone: boolean): Act0State {
  const w = act0Windows(phone)
  // Skip is only a way out of the birth. Once the press lands and 0D holds,
  // there is nothing left to skip — the doors take that slot.
  const skipVisible = t >= w.skipAt && t < w.doorsAt
  const floorT = t < 0 ? 0 : Math.min(t, w.matEnd)
  if (t < 0) {
    return {
      t, phone, shot: 'floor', localT: 0, floorT: 0, assembleT: -1, flyT: -1, stickT: -1,
      skipVisible: false, doorsVisible: false, done: false,
    }
  }
  if (t < w.assembleAt) {
    return {
      t, phone, shot: 'floor', localT: t, floorT, assembleT: -1, flyT: -1, stickT: -1,
      skipVisible, doorsVisible: false, done: false,
    }
  }
  if (t < w.assembleEnd) {
    const local = t - w.assembleAt
    return {
      t, phone, shot: 'assemble', localT: local, floorT, assembleT: local, flyT: -1, stickT: -1,
      skipVisible, doorsVisible: false, done: false,
    }
  }
  if (t < w.flyEnd) {
    const local = t - w.assembleEnd
    return {
      t, phone, shot: 'fly', localT: local, floorT, assembleT: 1e6, flyT: local, stickT: -1,
      skipVisible, doorsVisible: false, done: false,
    }
  }
  if (t < w.doorsAt) {
    const local = t - w.flyEnd
    return {
      t, phone, shot: 'stick', localT: local, floorT, assembleT: 1e6, flyT: 1e6, stickT: local,
      skipVisible, doorsVisible: false, done: false,
    }
  }
  return {
    t, phone, shot: 'hold', localT: t - w.flyEnd, floorT, assembleT: 1e6, flyT: 1e6, stickT: 1e6,
    skipVisible, doorsVisible: true, done: true,
  }
}
