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

function emptyBody(): MergeFieldBody {
  return { cx: 0, cy: 0, radius: 0, vx: 0, vy: 0, spin: 0, strength: 0 }
}

function emptyWell(): MergeFieldWell {
  return { cx: 0, cy: 0, strength: 0 }
}

function emptyStorm(): MergeFieldStorm {
  return { tornado: 0, burst: 0, settle: 0, spin: 0 }
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

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function smoothstep(v: number) {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

function smootherstep(v: number) {
  const t = clamp01(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

const field = {
  bodies: Array.from({ length: MERGE_BODY_COUNT }, emptyBody),
  well: emptyWell(),
  storm: emptyStorm(),
  pinned: false,
}

export function useMergeParticleField() {
  return field
}

export function resetMergeParticleField() {
  for (const body of field.bodies) writeBody(body, emptyBody())
  writeWell(field.well, emptyWell())
  writeStorm(field.storm, emptyStorm())
  field.pinned = false
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

export function publishMergePinned(pinned: boolean) {
  field.pinned = pinned
}

export function mergeSectionPinned(
  sectionTop: number,
  sectionBottom: number,
  viewportH: number,
) {
  return sectionTop <= 0.5 && sectionBottom > Math.max(viewportH, 1)
}

export function mergeStormFromProgress(
  merge: number,
  logoIntro: number,
  logoExit: number,
): MergeFieldStorm {
  const m = clamp01(merge)
  const intro = clamp01(logoIntro)
  const exit = clamp01(logoExit)

  const tornadoFade = smoothstep((intro - 0.04) / 0.22)
  const tornado = m * 0.4 * (1 - tornadoFade) * (1 - exit)
  const burst = Math.sin(clamp01(intro / 0.3) * Math.PI) * (1 - exit)
  const settle = smootherstep((intro - 0.3) / 0.52) * (1 - exit)
  const spin = tornado * 1.05 + burst * 2.1 + settle * 0.42

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
