// Screen-space lock-on brackets.
//
// The L-corners are the one piece of HUD chrome that is unambiguously LIFTAG
// talking, so they wait for the machine to plant and then hunt: they must not
// sit in the empty room, or ride the falling mesh. On a fine pointer they
// follow the cursor with a slow in/out pulse until the approach; on a phone
// they frame the whole machine and sit still. Hovering the QR plate acquires
// it early, so the lock does not wait for the scroll station if the pointer
// already found the code. Otherwise they morph onto the plate at the same
// station the previous overlay used to appear.

import { clamp01, damp, ease, lerp } from './timeline.ts'

export interface ScreenRect {
  x: number
  y: number
  w: number
  h: number
}

export interface ReticleBox extends ScreenRect {
  arm: number
  /** 1 while hunting / locked. Scroll-driven fade just before the phone fold. */
  opacity: number
}

/** Scroll window where the seek box flies onto the QR plate. Lands at 0.42,
 *  which is where the corners used to first appear. */
export const RETICLE_MORPH_START = 0.28
export const RETICLE_MORPH_END = 0.44
/**
 * Let the acquired QR hold into the phone fold, then retire it before the app
 * capture takes over. The reticle is composited into the gym texture now, so
 * it remains attached to the QR while that texture shrinks onto the 3D phone.
 */
export const RETICLE_OUT_START = 0.770
export const RETICLE_OUT_END = 0.820

const SEEK_IN = 62
const SEEK_OUT = 84
const SEEK_REST = 72
const DESKTOP_ARM = 16
const LOCK_ARM = 14

export interface ReticleUpdate {
  dt: number
  elapsed: number
  progress: number
  pointer: { x: number, y: number, active: boolean }
  width: number
  height: number
  qr: ScreenRect | null
  machine: ScreenRect | null
  reducedMotion: boolean
  /** Phone / coarse layout: frame the whole machine instead of the cursor. */
  lockToMachine: boolean
  folded: boolean
  /** False while the entry drop is still in the air (or the GLB has not
   *  arrived). The brackets stay off until the machine is planted. */
  landed: boolean
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function mixRect(a: ScreenRect, b: ScreenRect, t: number): ScreenRect {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
  }
}

function copyRect(r: ScreenRect): ScreenRect {
  return { x: r.x, y: r.y, w: r.w, h: r.h }
}

/** Matches the gym-scan sticky layout and GymScanHero's max-width: 900px sheet. */
export const PHONE_FRAME_MAX_WIDTH = 900

/**
 * Turn a projected world AABB into a viewfinder around the machine.
 *
 * A world-axis box of a three-quarter silhouette always over-covers: empty
 * corners of the AABB project to the viewport edges, which is how the L's
 * used to sit on the bezel rather than on the frame. Shrink toward a point
 * slightly below the AABB centre (the near base is the part the 8 corners
 * miss) and never let the box go full-bleed. On a phone the same AABB also
 * eats empty floor, so the L's sit on the tiles; lift the box so it reads
 * around the machine rather than under it.
 */
export function frameMachine(r: ScreenRect, width: number, height: number): ScreenRect {
  const cx = r.x + r.w * 0.5
  const cy = r.y + r.h * 0.58
  const w = Math.min(Math.max(r.w * 0.68, 96), width * 0.78)
  const h = Math.min(Math.max(r.h * 0.86, 96), height * 0.62)
  const margin = Math.min(36, Math.max(22, width * 0.07))
  const lift = width < PHONE_FRAME_MAX_WIDTH ? Math.min(48, height * 0.055) : 0
  let x = cx - w / 2
  let y = cy - h / 2 - lift
  x = Math.min(Math.max(x, margin), width - margin - w)
  y = Math.min(Math.max(y, margin), height - margin - h)
  return {
    x,
    y,
    w: Math.max(96, Math.min(w, width - margin - x)),
    h: Math.max(96, Math.min(h, height - margin - y)),
  }
}

function fallbackMachine(width: number, height: number): ScreenRect {
  const marginX = width * 0.10
  const marginY = height * 0.16
  return {
    x: marginX,
    y: marginY,
    w: width - marginX * 2,
    h: height - marginY * 2,
  }
}

function pulse01(elapsed: number): number {
  // ~3.2s cycle with a quiet second harmonic so it is not a metronome.
  // Dwell comes from damping the size toward this, not from easing the sine.
  const a = 0.5 + 0.5 * Math.sin(elapsed * Math.PI * 0.62)
  const b = 0.5 + 0.5 * Math.sin(elapsed * Math.PI * 1.05 + 1.1)
  return clamp01(a * 0.88 + b * 0.12)
}

function seekArm(box: ScreenRect, lockToMachine: boolean): number {
  const side = Math.min(box.w, box.h)
  if (lockToMachine) return clamp(side * 0.18, 36, 72)
  return DESKTOP_ARM
}

function lockArm(box: ScreenRect): number {
  return clamp(Math.min(box.w, box.h) * 0.12, LOCK_ARM, 22)
}

function contains(r: ScreenRect, x: number, y: number, pad: number): boolean {
  return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad
}

function overlaps(a: ScreenRect, b: ScreenRect, pad: number): boolean {
  return a.x < b.x + b.w + pad && a.x + a.w > b.x - pad
    && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad
}

/** Hit pad around the plate. Distant tags are tiny; the hunting box is ~72px,
 *  so a floor keeps a far sticker acquirable without a pixel-perfect hover. */
export function qrAcquirePad(qr: ScreenRect, latched: boolean): number {
  const base = Math.max(24, Math.min(qr.w, qr.h) * 0.45)
  return latched ? base + 18 : base
}

export function createReticleTracker() {
  let cx = 0
  let cy = 0
  let size = SEEK_REST
  let booted = false
  let lastW = 0
  let lastH = 0
  let frozen: ScreenRect | null = null
  let frozenArm = DESKTOP_ARM
  let hoverAmt = 0
  let hoverLatched = false

  function update(input: ReticleUpdate): ReticleBox | null {
    const { progress } = input
    if (!input.landed || input.folded || progress >= RETICLE_OUT_END) {
      hoverAmt = 0
      hoverLatched = false
      return null
    }

    const {
      width, height, dt, elapsed, pointer,
      reducedMotion, lockToMachine,
    } = input

    if (booted && lastW > 0 && lastH > 0 && (width !== lastW || height !== lastH)) {
      cx *= width / lastW
      cy *= height / lastH
    }
    lastW = width
    lastH = height

    const mx = (pointer.x * 0.5 + 0.5) * width
    const my = (pointer.y * 0.5 + 0.5) * height
    const follow = pointer.active && !lockToMachine
    const targetX = follow ? mx : width * 0.5
    const targetY = follow ? my : height * 0.5

    if (!booted) {
      cx = targetX
      cy = targetY
      size = SEEK_REST
      booted = true
    }

    const morph = ease(progress, RETICLE_MORPH_START, RETICLE_MORPH_END)

    if (morph <= 0) {
      frozen = null
      if (reducedMotion) {
        cx = targetX
        cy = targetY
        size = SEEK_REST
      } else if (follow) {
        cx = damp(cx, targetX, 0.18, dt)
        cy = damp(cy, targetY, 0.18, dt)
        size = damp(size, lerp(SEEK_IN, SEEK_OUT, pulse01(elapsed)), 0.07, dt)
      } else {
        cx = targetX
        cy = targetY
        size = SEEK_REST
      }
    }

    const live: ScreenRect = lockToMachine
      ? (input.machine ? frameMachine(input.machine, width, height) : fallbackMachine(width, height))
      : { x: cx - size / 2, y: cy - size / 2, w: size, h: size }

    const qr = input.qr
    if (follow && qr) {
      const pad = qrAcquirePad(qr, hoverLatched)
      const over = contains(qr, mx, my, pad) || overlaps(live, qr, pad)
      const want = over || hoverLatched ? 1 : 0
      hoverAmt = reducedMotion ? want : damp(hoverAmt, want, 0.14, dt)
      if (hoverAmt > 0.9) hoverLatched = true
    } else if (!hoverLatched) {
      hoverAmt = reducedMotion ? 0 : damp(hoverAmt, 0, 0.14, dt)
    }

    let seek: ScreenRect
    let fromArm: number
    if (morph <= 0) {
      seek = live
      fromArm = seekArm(live, lockToMachine)
    } else {
      if (!frozen) {
        frozen = copyRect(live)
        frozenArm = seekArm(live, lockToMachine)
      }
      seek = frozen
      fromArm = frozenArm
    }

    const mix = Math.max(morph, hoverAmt)
    const box = mix > 0 && qr ? mixRect(seek, qr, mix) : seek
    const arm = qr ? lerp(fromArm, lockArm(qr), mix) : fromArm
    const opacity = 1 - ease(progress, RETICLE_OUT_START, RETICLE_OUT_END)

    return { x: box.x, y: box.y, w: box.w, h: box.h, arm, opacity }
  }

  return { update }
}
