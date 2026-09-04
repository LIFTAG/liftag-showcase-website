/**
 * Spring used by the catalog's sticky exercise photo.
 *
 * CSS sticky still owns the layout box. The published offset is extra
 * viewport motion on top of that box:
 *
 *   1. The photo does not copy scroll 1:1. Layout movement is subtracted
 *      from the visual so it trails, then eases onto the box.
 *   2. Scroll that the pin (or release) swallowed is leftover wall
 *      motion: the photo keeps going past the limit, then springs back.
 *
 * Rest is offset 0, i.e. sitting on the CSS sticky box. Units are pixels.
 * `frame` is 1 at 60fps so 120Hz displays do not double the stiffness.
 */

export const STICKY_MOMENTUM = {
  /**
   * How much of this frame's layout motion the visual is allowed to copy.
   * The rest becomes lag. Close to 1 keeps the photo glued to the page;
   * the leftover is a short trail, not a second scroller.
   */
  follow: 0.82,
  /**
   * Fraction of swallowed scroll that becomes overshoot past the pin.
   * 1 is "keep going as if the pin was not there".
   */
  wallImpulse: 0.38,
  /** Extra leftover turned into coasting velocity after the pin catches. */
  wallCoast: 0.1,
  /** Pull toward the sticky box, per 60fps frame. */
  spring: 0.28,
  /** Velocity retain, per 60fps frame. High enough that rest does not bounce. */
  damping: 0.72,
  /** Hard cap on the published offset, px. */
  maxOffset: 16,
  /** Hard cap on velocity, px/frame. */
  maxVelocity: 14,
  settle: 0.08,
} as const

export type StickyMomentumState = {
  offset: number
  velocity: number
}

const FRAME_MS = 1000 / 60
const MIN_FRAME = 0.5
const MAX_FRAME = 2

export function stickyMomentumFrame(dtMs: number): number {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return 1
  return Math.min(MAX_FRAME, Math.max(MIN_FRAME, dtMs / FRAME_MS))
}

/**
 * Viewport motion the sticky box would have taken this frame if it were
 * not clamped, minus the motion CSS actually applied. Zero while the
 * photo is travelling with the page; roughly `-scrollDelta` while pinned.
 */
export function stickyWallLeftover(scrollDelta: number, layoutDelta: number): number {
  return -scrollDelta - layoutDelta
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function stepStickyMomentum(
  state: StickyMomentumState,
  input: {
    scrollDelta: number
    layoutDelta: number
    dtMs?: number
  },
): StickyMomentumState {
  const { follow, wallImpulse, wallCoast, spring, damping, maxOffset, maxVelocity, settle } = STICKY_MOMENTUM
  const frame = stickyMomentumFrame(input.dtMs ?? FRAME_MS)

  let { offset, velocity } = state

  // Keep the visual from inheriting the CSS box 1:1. `follow` is the
  // fraction that still copies; the rest is lag that the spring spends.
  offset -= input.layoutDelta * (1 - follow)

  const leftover = stickyWallLeftover(input.scrollDelta, input.layoutDelta)
  const wallOff = leftover * wallImpulse
  const wallVel = leftover * wallCoast
  const pushingOut = (offset <= -maxOffset && leftover < 0)
    || (offset >= maxOffset && leftover > 0)
  if (!pushingOut) {
    offset += wallOff
    velocity += wallVel
  }

  velocity += -offset * spring * frame
  velocity *= damping ** frame
  velocity = clamp(velocity, -maxVelocity, maxVelocity)

  offset += velocity * frame
  offset = clamp(offset, -maxOffset, maxOffset)

  if (Math.abs(offset) < settle && Math.abs(velocity) < settle) {
    return { offset: 0, velocity: 0 }
  }

  return { offset, velocity }
}
