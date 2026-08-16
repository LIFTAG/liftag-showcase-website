/**
 * Thin-film viewing-angle math for the gym-kit hologram plate.
 *
 * A security hologram is two cheap ingredients, not a 3D object:
 *   1. a colour that is a function of viewing angle (interference)
 *   2. a second image that only reconstructs inside a narrow angle lobe
 *
 * Pointer space is the same unitless -1..1 that useLerpVars publishes.
 * HologramPlate.vue binds these constants as CSS variables and repeats the
 * same sums in calc(), so a pointer move never re-renders the component.
 * If you change a number here, the plate's CSS vars follow automatically.
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
