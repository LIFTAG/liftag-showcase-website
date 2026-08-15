// Shared, non-reactive buffer from the merge-section rAF into the particle rAF.
// Written as plain fields so a 60fps merge never re-renders AppMergeSection.
//
// World mapping matches clientToParticleWorld / wallToParticleWorld in
// useHeroParticleField (kept local so Node tests and Nuxt typecheck agree).

type ClientRect = {
  left: number
  top: number
  width: number
  height: number
}

function clientToParticleWorld(
  clientX: number,
  clientY: number,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const nx = ((clientX - canvas.left) / Math.max(canvas.width, 1)) * 2 - 1
  const ny = ((clientY - canvas.top) / Math.max(canvas.height, 1)) * 2 - 1
  return { x: nx * halfW || 0, y: -ny * halfH || 0 }
}

export const MERGE_BODY_COUNT = 9
export const MERGE_LOGO_INDEX = 8

export type MergeFieldBody = {
  cx: number
  cy: number
  radius: number
  vx: number
  vy: number
  spin: number
  strength: number
}

export type MergeFieldWell = {
  cx: number
  cy: number
  strength: number
}

export type MergeBodyPose = {
  x: number
  y: number
  spin: number
}

export type MergeFieldStorm = {
  tornado: number
  burst: number
  settle: number
  spin: number
}

/**
 * Drive state for the refractive prism core. Same non-reactive contract as the
 * particle field: AppMergeSection writes it from its rAF, MergePrismCore reads
 * it from its own, and Vue never re-renders in between.
 *
 * `icons[i]` is how much light app `i` is currently feeding the crystal — it
 * rises as the icon flies in and spikes as it is absorbed.
 */
export type MergeFieldCore = {
  /** Icons converging, 0..1. Drives fade-in, facet sharpness, spin rate. */
  charge: number
  /** LIFTAG logo intro, 0..1. Blows the shell open and whites out the core. */
  ignite: number
  /** Sharp bloom pulse at the detonation. */
  flash: number
  /** Overall visibility, folds in the section exit. */
  fade: number
  /** Pointer tilt, -1..1. */
  tiltX: number
  tiltY: number
  icons: number[]
}

function emptyBody(): MergeFieldBody {
  return { cx: 0, cy: 0, radius: 0, vx: 0, vy: 0, spin: 0, strength: 0 }
}

function emptyWell(): MergeFieldWell {
  return { cx: 0, cy: 0, strength: 0 }
}

function emptyStorm(): MergeFieldStorm {
  return { tornado: 0, burst: 0, settle: 0, spin: 0 }
}

function emptyCore(): MergeFieldCore {
  return {
    charge: 0,
    ignite: 0,
    flash: 0,
    fade: 0,
    tiltX: 0,
    tiltY: 0,
    icons: Array.from({ length: MERGE_BODY_COUNT - 1 }, () => 0),
  }
}

function writeBody(target: MergeFieldBody, source: MergeFieldBody) {
  target.cx = source.cx
  target.cy = source.cy
  target.radius = source.radius
  target.vx = source.vx
  target.vy = source.vy
  target.spin = source.spin
  target.strength = source.strength
}

function writeWell(target: MergeFieldWell, source: MergeFieldWell) {
  target.cx = source.cx
  target.cy = source.cy
  target.strength = source.strength
}

function writeStorm(target: MergeFieldStorm, source: MergeFieldStorm) {
  target.tornado = source.tornado
  target.burst = source.burst
  target.settle = source.settle
  target.spin = source.spin
}

function writeCore(target: MergeFieldCore, source: MergeFieldCore) {
  target.charge = source.charge
  target.ignite = source.ignite
  target.flash = source.flash
  target.fade = source.fade
  target.tiltX = source.tiltX
  target.tiltY = source.tiltY
  for (let i = 0; i < target.icons.length; i++) {
    target.icons[i] = source.icons[i] ?? 0
  }
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

const field = {
  bodies: Array.from({ length: MERGE_BODY_COUNT }, emptyBody),
  well: emptyWell(),
  storm: emptyStorm(),
  core: emptyCore(),
  armed: false,
}

export function useMergeParticleField() {
  return field
}

export function resetMergeParticleField() {
  for (const body of field.bodies) writeBody(body, emptyBody())
  writeWell(field.well, emptyWell())
  writeStorm(field.storm, emptyStorm())
  writeCore(field.core, emptyCore())
}

export function publishMergeBody(index: number, body: MergeFieldBody) {
  if (index < 0 || index >= MERGE_BODY_COUNT) return
  const slot = field.bodies[index]
  if (!slot) return
  writeBody(slot, body)
}

export function publishMergeWell(well: MergeFieldWell) {
  writeWell(field.well, well)
}

export function publishMergeStorm(storm: MergeFieldStorm) {
  writeStorm(field.storm, storm)
}

export function publishMergeCore(core: MergeFieldCore) {
  writeCore(field.core, core)
}

export function publishMergeArmed(armed: boolean) {
  field.armed = armed
}

/**
 * Prism-core choreography, derived from the same progress values the icons and
 * the burst halo already use so the crystal, the shockwave, and the logo stay
 * locked to one another.
 *
 * charge  starts the moment the icons start converging (merge > 0)
 * ignite  hands the centre over to the LIFTAG logo
 * flash   is the single detonation frame-band the halo fires on
 */
export function mergeCoreFromProgress(
  merge: number,
  logoIntro: number,
  exit: number,
): Omit<MergeFieldCore, 'icons' | 'tiltX' | 'tiltY'> {
  const m = clamp01(merge)
  const intro = clamp01(logoIntro)
  const rise = clamp01((intro - 0.02) / 0.055)
  const fall = 1 - clamp01((intro - 0.08) / 0.34)

  return {
    charge: m,
    ignite: intro,
    flash: rise * rise * (3 - 2 * rise) * fall,
    fade: 1 - clamp01(exit),
  }
}

/** Light each icon feeds the crystal: a glow on approach, a spike on contact. */
export function mergeCoreIconEnergy(iconMerge: number, ignite: number) {
  const m = clamp01(iconMerge)
  const approach = clamp01((m - 0.02) / 0.45)
  const contact = clamp01((m - 0.5) / 0.45)
  const energy = 0.2 * approach * approach * (3 - 2 * approach)
    + 0.85 * contact * contact * (3 - 2 * contact)
  return energy * (1 - clamp01(ignite) * 0.72)
}

export function mergeStormFromProgress(
  merge: number,
  logoIntro: number,
  logoExit: number,
): MergeFieldStorm {
  const m = clamp01(merge)
  const intro = clamp01(logoIntro)
  const exit = clamp01(logoExit)
  const live = 1 - exit

  // One outward curve through the whole logo spin (snaps at intro 0.995).
  // A fast first flight, then a long tail. Burst never drops, so the
  // field cannot pull back in and change direction.
  const t = clamp01((intro - 0.08) / 0.915)
  const bang = 1 - (1 - clamp01(t / 0.24)) ** 2.2
  const expand = bang * 0.45 + t * 0.55
  const settle = t * live
  const burst = expand * 0.84 * live
  const tornado = m * 0.82 * (1 - bang) * live
  const spin = tornado * 0.48

  return { tornado, burst, settle, spin }
}

export function mergeBodyVelocity(
  previous: MergeBodyPose,
  next: MergeBodyPose,
  dtMs: number,
) {
  const dt = Math.max(dtMs, 1) / 1000
  return {
    vx: (next.x - previous.x) / dt,
    vy: (next.y - previous.y) / dt,
    spin: (next.spin - previous.spin) / dt,
  }
}

export function bodyToParticleWorld(
  body: MergeFieldBody,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(body.cx, body.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    radius: (body.radius / Math.max(canvas.width, 1)) * 2 * halfW,
    vx: (body.vx / Math.max(canvas.width, 1)) * 2 * halfW,
    vy: -(body.vy / Math.max(canvas.height, 1)) * 2 * halfH,
    spin: body.spin,
    strength: body.strength,
  }
}

export function wellToParticleWorld(
  well: MergeFieldWell,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(well.cx, well.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    strength: well.strength,
  }
}
