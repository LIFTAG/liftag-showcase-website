/**
 * Viewing-angle math for the gym-kit hologram sticker.
 *
 * The sticker is a thin physical card. Colour is a function of viewing
 * angle (thin-film interference). A second image (QR + name) only
 * reconstructs inside a narrow lobe. Pointer and scroll space are the
 * same unitless -1..1; HologramPlate publishes those as CSS variables
 * and the foil reads them in calc(), so a move never re-renders Vue.
 */

/** Resting view: pointer at the viewport centre (0, 0). */
export const HOLO_REST_PHASE = 0.5

/**
 * Off-axis peak where the latent image reconstructs. A real foil mark does
 * not unlock looking straight at it; you have to tilt past rest.
 */
export const HOLO_UNLOCK_PEAK = 0.72

/**
 * Half-width of the unlock lobe. Rest (0.5) must sit outside this window
 * so the plate is dark until the sheet arrives.
 */
export const HOLO_UNLOCK_HALF = 0.16

/** How much horizontal pointer tilt walks the phase. */
export const HOLO_AX_WEIGHT = 0.35

/** How much vertical pointer tilt walks the phase. */
export const HOLO_AY_WEIGHT = 0.15

/**
 * Demo addend that carries a still pointer from rest to the unlock peak.
 * 0.5 + 0.22 = 0.72.
 */
export const HOLO_DEMO_UNLOCK = HOLO_UNLOCK_PEAK - HOLO_REST_PHASE

/** Phase where the rainbow sheet starts entering from the left.
 *  Rest (0.5) sits just before this so the plate is dark until the tilt. */
export const HOLO_SHEET_START = 0.535

/** Phase span over which the sheet travels across the plate. */
export const HOLO_SHEET_SPAN = 0.35

/**
 * Physical card tilt. Kept in the same range as the site phones
 * (about 8–12deg) so the foil nods instead of swinging on edge.
 */
export const HOLO_TILT_RX_DEG = 7
export const HOLO_TILT_RY_DEG = 12

/** Small rest pose, same idea as Phone3D's 0.08 / -0.12 rad idle. */
export const HOLO_REST_RX_DEG = 3
export const HOLO_REST_RY_DEG = -4

/**
 * Half-size of the sticker used as the pointer range. 1 means the left
 * and right edges of the plate are ax = ±1, so sweeping across the face
 * walks the unlock lobe the way tilting a real tag in your hand would.
 */
export const HOLO_POINTER_RANGE = 1.8

/**
 * Scroll progress → tilt. 0 is the plate centre at the bottom of the
 * viewport, 1 is the top. Mid-viewport (0.5) is tuned to the unlock
 * peak so the QR reconstructs while the sticker is on screen.
 */
export const HOLO_SCROLL_AX_START = -0.15
export const HOLO_SCROLL_AX_SPAN = 1.56
export const HOLO_SCROLL_AY_SPAN = 0.85

export function clampHoloAxis(n: number): number {
  if (n < -1) return -1
  if (n > 1) return 1
  return n
}

export function holoPhase(ax: number, ay: number, demo = 0): number {
  return HOLO_REST_PHASE + ax * HOLO_AX_WEIGHT + ay * HOLO_AY_WEIGHT + demo
}

/** 0..1 reconstruction amount at this phase. 0 at rest, 1 at the peak. */
export function holoUnlock(phase: number): number {
  const t = 1 - Math.abs(phase - HOLO_UNLOCK_PEAK) / HOLO_UNLOCK_HALF
  return t < 0 ? 0 : t > 1 ? 1 : t
}

/** Sticky face: the demo settle, or the live lobe, whichever is brighter. */
export function holoFace(phase: number, reveal = 0): number {
  const lobe = holoUnlock(phase)
  return reveal > lobe ? reveal : lobe
}

/**
 * 0..1 travel of the rainbow sheet. 0 is off-left, 1 is off-right.
 * Rest sits just after the sheet starts to peek; the peak has it mid-cross.
 */
export function holoSheetTravel(phase: number): number {
  return (phase - HOLO_SHEET_START) / HOLO_SHEET_SPAN
}

/** Where on the shared prism ramp this viewing angle sits. */
export function holoHueT(phase: number): number {
  if (phase <= 0) return 0
  if (phase >= 1) return 1
  return phase
}

/** 0 when the plate centre is at the bottom of the viewport, 1 at the top. */
export function holoViewportProgress(
  rectTop: number,
  rectHeight: number,
  viewHeight: number,
): number {
  const h = viewHeight > 0 ? viewHeight : 1
  return 1 - (rectTop + rectHeight / 2) / h
}

export function holoScrollTilt(progress: number): { ax: number; ay: number } {
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress
  return {
    ax: clampHoloAxis(HOLO_SCROLL_AX_START + p * HOLO_SCROLL_AX_SPAN),
    ay: clampHoloAxis((p - 0.5) * HOLO_SCROLL_AY_SPAN),
  }
}

export function holoPointerTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { ax: number; ay: number } {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const hx = (rect.width / 2) * HOLO_POINTER_RANGE || 1
  const hy = (rect.height / 2) * HOLO_POINTER_RANGE || 1
  return {
    ax: clampHoloAxis((clientX - cx) / hx),
    ay: clampHoloAxis((clientY - cy) / hy),
  }
}
