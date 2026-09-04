// Timed Act 0C / 0D: the QR/NFC card flies into the establishing POV, is held
// up to the lens and turned over so the antenna on its back reads, has its
// release liner peeled off that back, turns front-on again and travels to the
// beam to be laid down corner-first. The camera does not move.
//
// Pure function of local seconds. A portrait frame holds further along the
// same look so the card fits the width — including a desktop (floor) cut at a
// phone breakpoint, where the seat-cut flag is false. After plant the pose is
// the live mount.
//
// The shot is five beats inside one fly window, and they are fractions rather
// than seconds so the phone cut is the same choreography at a shorter length:
//
//   IN    card arcs in from off-frame right onto the look, one move
//   TURN  half a revolution onto its back, where the antenna is
//   PEEL  the liner is grabbed at a corner and rolled off that back
//   BACK  the second half of the revolution, print to the lens again
//   OUT   the card curls and leaves for the beam, leading with the corner
//
// The liner being on the back is what fixes this order. A sticker's protective
// film is over its adhesive, not over its print, so the only face it can come
// off is the one the turn is already showing - which turns what used to be a
// dead dwell at the halfway point into the beat the revolution exists for. The
// antenna is under the liner too, so the peel and the reveal are one action.
//
// The liner is released last at the bottom-left corner, and that is the corner
// 0D presses down first. Same axis, same fold line, opposite face and opposite
// direction - the application is the peel run backwards, which is what makes
// the two beats read as one continuous handling of the same object.

import { ESTABLISH } from './station.ts'
import { PEEL_AXIS, PEEL_FLAT, peelSpan, type PeelState } from './peel.ts'
import { clamp01, ease, lerp, smoothstep, vec3HermiteAt, type Vec3Stop } from './timeline.ts'

/**
 * The artwork is 827 x 874, so the sticker is very slightly taller than it is
 * wide. 15.5 cm is a real gym tag: big enough to scan from the seat 0.9 m
 * away, small enough that it is a sticker on a machine rather than signage.
 */
export const PLACARD_H = 0.155
export const PLACARD_W = PLACARD_H * (827 / 874)

export const FLY_DESKTOP = 6.2
export const FLY_PHONE = 5.2
export const STICK_DESKTOP = 2.6
export const STICK_PHONE = 2.2
/** Corner-first press: gap close, then the bend rolls flat. Seconds. */
export const PRESS_DUR = 1.1
/**
 * Fraction of the press at which the tag is on the beam far enough for the
 * scanner to start hunting. Earlier and the L's ride a card still in the air;
 * at 1 they pop on the plant frame with the doors.
 */
export const PRESS_HUNT_U = 0.78
/** Stand-off at the start of the press, metres. The bend does the rest. */
export const PRESS_GAP = 0.012

export const PLACARD_REST = {
  x: 0,
  y: 1.255,
  z: -0.372,
  tiltX: -0.10,
} as const

/** Metres in front of the establishing camera. Desktop ~70% of vertical FOV. */
export const SHOWCASE_DIST = 0.32
/**
 * Portrait hold, including a floor cut at a phone-width breakpoint.
 * 0.75 m is ~61% of width at 9:19.5 — in the hand, not a crop of the code.
 * Seat-cut vs floor-cut only changes timing.
 */
export const SHOWCASE_DIST_PHONE = 0.75
/** Viewport aspect below this uses the portrait hold. Width, not pointer. */
export const SHOWCASE_PORTRAIT_ASPECT = 1

/** Fly-window beats, as fractions of `flyDuration`. */
export const FLY_IN_END = 0.30
/** Half over: the antenna, and the liner on top of it, are square to the lens. */
export const FLY_TURN_END = 0.44
/** Liner off and drifting out of frame. The longest beat, and the hero one. */
export const FLY_PEEL_END = 0.76
/** Revolution complete, print to the lens again, ready to leave. */
export const FLY_BACK_END = 0.88

const IN_END = FLY_IN_END
const TURN_END = FLY_TURN_END
const PEEL_END = FLY_PEEL_END
const BACK_END = FLY_BACK_END

/** One complete revolution. Anything less and the back is a glimpse. */
const TURN_TOTAL = Math.PI * 2

/** Card-plane extent along the peel diagonal, corner to opposite corner. */
const SPAN = peelSpan(PLACARD_W, PLACARD_H)
/** Far enough past the corner that no vertex is on the roll. */
const FLAT_FRONT = SPAN.max + 0.004
/** Fold line once the whole face has passed over the roll. */
const PEELED_FRONT = SPAN.min - 0.010
/**
 * The liner winds into a tight roll. Nothing here is keyframed: `peel.ts`
 * solves the wrap from the arc length actually off the card, so the roll
 * fattens because film has gone onto it, which is what a roll is.
 *
 * Two failure modes bracket this, and both shipped before the roll grew.
 *
 * Too little wrap and the free end never closes - it leaves along the tangent
 * as a long flat sheet, which from this camera projects straight across the
 * frame and buries the card under a grey sail. That is what a clamped radius
 * produces, and by the end of the pull it was six centimetres of it.
 *
 * Too much, at a constant radius, and every winding lands exactly on the one
 * below. On a transparent material that is the milky-slab failure, and on any
 * material it is z-fighting.
 *
 * A spiral has neither problem, and needs no cap: the wrap can run as long as
 * the film does.
 */
/**
 * Core the liner winds onto - the radius the very first curl has. Bigger than
 * it looks like it should be, because the camera ends up close to axial on
 * this roll: end-on, the innermost turns are what you see, and a tight core
 * puts several radians between neighbouring vertices there.
 */
const FOIL_CORE = 0.0070
/**
 * Metres of roll radius per radian of wrap. Times 2*PI this is the gap
 * between one winding and the next: 2.6 mm, which is a dozen times a real
 * liner and deliberately so. It has to be wide enough that the windings are
 * separate surfaces on screen rather than the same surface twice - a clear
 * film stacked on itself with nothing between is the milky-slab failure - and
 * narrow enough that four turns still fit inside a roll a fifth the width of
 * the card.
 */
const FOIL_GROW = 0.0026 / (Math.PI * 2)
/** Well past the four-and-a-bit turns the whole liner comes to. */
const FOIL_MAX_TURN = Math.PI * 12

/**
 * Outer radius of a roll holding `wound` metres of film on a `FOIL_CORE`
 * core. Falls straight out of integrating the spiral: the wound length is the
 * area swept between the two radii, so R = sqrt(core^2 + 2 * grow * wound).
 * Sizing it this way rather than keyframing it is what stops the two failure
 * modes above from being reachable at all.
 */
function foilOuter(wound: number): number {
  return Math.sqrt(FOIL_CORE * FOIL_CORE + 2 * FOIL_GROW * Math.max(wound, 0))
}

/**
 * Where the fold line sits when the card arrives at the beam: past the
 * leading corner, so that corner is already flat and everything behind it is
 * still off the surface.
 */
const BEND_FRONT0 = SPAN.min + 0.022
/** Vinyl bends, it does not roll. A radius this large is a 40-degree arc. */
const BEND_R0 = 0.50
const BEND_R1 = 0.26
const BEND_MAX_TURN = 1.3

/** Same rack on both cuts. Tap count is the budget; the iris stays wide open. */
export const DOF_PHONE_SCALE = 1

function camDir(): { x: number, y: number, z: number, len: number } {
  const dx = ESTABLISH.tx - ESTABLISH.x
  const dy = ESTABLISH.ty - ESTABLISH.y
  const dz = ESTABLISH.tz - ESTABLISH.z
  const len = Math.hypot(dx, dy, dz) || 1
  return { x: dx / len, y: dy / len, z: dz / len, len }
}

function alongLook(dist: number): { x: number, y: number, z: number } {
  const d = camDir()
  return {
    x: ESTABLISH.x + d.x * dist,
    y: ESTABLISH.y + d.y * dist,
    z: ESTABLISH.z + d.z * dist,
  }
}

/** Face +Z of the plane at the camera (printed side readable). */
function faceCam(): { rotX: number, rotY: number } {
  const d = camDir()
  const toCamX = -d.x
  const toCamY = -d.y
  const toCamZ = -d.z
  return {
    rotX: -Math.atan2(toCamY, Math.hypot(toCamX, toCamZ)),
    rotY: Math.atan2(toCamX, toCamZ),
  }
}

export const SHOWCASE = alongLook(SHOWCASE_DIST)
export const SHOWCASE_PHONE = alongLook(SHOWCASE_DIST_PHONE)
export const FACE_CAM = faceCam()

function camRight(): { x: number, z: number } {
  const d = camDir()
  const rx = -d.z
  const rz = d.x
  const len = Math.hypot(rx, rz) || 1
  return { x: rx / len, z: rz / len }
}

/** Camera up: right x forward, so it tilts with the look rather than being +Y. */
function camUp(): { x: number, y: number, z: number } {
  const d = camDir()
  const r = camRight()
  return {
    x: -r.z * d.y,
    y: r.z * d.x - r.x * d.z,
    z: r.x * d.y,
  }
}

/**
 * Where the 0C key hangs relative to a card pose: up and camera-left, a
 * little toward the lens. Close enough that inverse-square dies before the
 * machine, frontal enough that the print is a readable page rather than a
 * raking streak on one edge.
 *
 * Pass the card's current position so the offset (and therefore the
 * irradiance) stays put as the card commits to the lens. A key pinned at
 * SHOWCASE while the card flew 50 cm toward it is what flashed the print
 * on the last metres of the IN beat.
 */
export function showcaseKeyPos(
  phone: boolean,
  at?: { x: number, y: number, z: number },
): { x: number, y: number, z: number } {
  const show = at ?? (phone ? SHOWCASE_PHONE : SHOWCASE)
  const d = camDir()
  const r = camRight()
  const u = camUp()
  const side = -0.18
  const lift = 0.24
  const back = 0.22
  return {
    x: show.x + r.x * side + u.x * lift - d.x * back,
    y: show.y + u.y * lift - d.y * back,
    z: show.z + r.z * side + u.z * lift - d.z * back,
  }
}

/** Candela. Tuned against toneMappingExposure 0.82 and the print's albedo. */
export const SHOWCASE_KEY_INTENSITY = 0.40

/**
 * Camera-space point: metres along the look, camera-right, and world-up lift.
 *
 * The IN start is off the look, from camera-right, and outside the
 * establishing frustum. A start that is merely "to the right" still sits
 * inside a 38° 16:9 frame — atan(0.92 / 3.15) is 16°, and half the horizontal
 * FOV is 31°. The card was therefore already on screen the frame it became
 * visible, which is a pop. Side on the first knot is sized so the whole 15 cm
 * card is past the right edge at 16:9 and 21:9 (~43° off the look); the IN
 * beat then travels it in.
 */
function camPoint(dist: number, side: number, lift: number) {
  const d = camDir()
  const r = camRight()
  return {
    x: ESTABLISH.x + d.x * dist + r.x * side,
    y: ESTABLISH.y + d.y * dist + lift,
    z: ESTABLISH.z + d.z * dist + r.z * side,
  }
}

type CamKey = readonly [u: number, dist: number, side: number, lift: number]

/**
 * IN path in camera space. One Hermite through these, one ease over the
 * whole beat — the same split of shape and timing the scroll dolly uses.
 *
 * Two eased lerps (off-screen → hang, hang → lens) were the previous
 * version. Velocity hit zero at the hang, so a travel that was meant to be
 * one arc arrived as a slide and then a punch-in. Interior knots stay off
 * the enter→showcase chord so the path actually curves, and they keep a
 * side component while distance closes so the second half is not a pure
 * dolly. Timing is a separate job: `flyInEase` gets the card onto the look
 * quickly, then fades the last centimetres out instead of parking them.
 */
const IN_CAM_DESK: readonly CamKey[] = [
  [0.00, 3.15, 2.85, 0.42],
  [0.36, 2.00, 1.10, 0.22],
  [0.64, 1.05, 0.38, 0.10],
  [1.00, SHOWCASE_DIST, 0, 0],
]

const IN_CAM_PHONE: readonly CamKey[] = [
  [0.00, 2.40, 2.20, 0.28],
  [0.36, 1.70, 0.90, 0.16],
  [0.64, 1.12, 0.32, 0.08],
  [1.00, SHOWCASE_DIST_PHONE, 0, 0],
]

function pathFromCam(keys: readonly CamKey[]): Vec3Stop[] {
  return keys.map(([u, dist, side, lift]) => {
    const p = camPoint(dist, side, lift)
    return [u, [p.x, p.y, p.z]]
  })
}

const IN_PATH = pathFromCam(IN_CAM_DESK)
const IN_PATH_PHONE = pathFromCam(IN_CAM_PHONE)

/** Pitch/yaw offsets from FACE_CAM, same knots as the IN path. */
const IN_ROT: readonly Vec3Stop[] = [
  [0.00, [0.22, 0.95, 0]],
  [0.36, [0.14, 0.50, 0]],
  [0.64, [0.05, 0.16, 0]],
  [1.00, [0.00, 0.00, 0]],
]

const _inP = { x: 0, y: 0, z: 0 }
const _inR = { x: 0, y: 0, z: 0 }

export type StickPose = {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
  /** 0–1 mix into the composite bokeh close-up. */
  dof: number
  /** 0–1 key on the card. */
  showLight: number
  /** Where that key hangs. Null while it is off. */
  keyPos: { x: number, y: number, z: number } | null
  /** 0–1 squeegee line riding the bend front during the press. */
  squeegee: number
  /** The card's own fold - flat everywhere until it curls for the beam. */
  bend: PeelState
  /** The release liner's fold, on the back face. */
  foil: PeelState
  foilVisible: boolean
  foilOpacity: number
  /** Rigid drift of the rolled-up liner, card-local metres plus a spin. */
  foilDrift: { x: number, y: number, z: number, spin: number }
  nfcVisible: boolean
  /** The blank and struts the card is being applied to. */
  mountVisible: boolean
  planted: boolean
  /**
   * The scanner may hunt. True once the press has put the tag on the beam,
   * including the last stretch of the roll so the L's can fade in instead of
   * waiting for the plant frame.
   */
  hunting: boolean
  visible: boolean
}

const FLAT: PeelState = { front: PEEL_FLAT, radius: BEND_R1, maxTurn: BEND_MAX_TURN, grow: 0 }
const NO_DRIFT = { x: 0, y: 0, z: 0, spin: 0 }

const HIDDEN: StickPose = {
  x: PLACARD_REST.x,
  y: PLACARD_REST.y,
  z: PLACARD_REST.z,
  rotX: PLACARD_REST.tiltX,
  rotY: 0,
  rotZ: 0,
  dof: 0,
  showLight: 0,
  keyPos: null,
  squeegee: 0,
  bend: FLAT,
  foil: FLAT,
  foilVisible: false,
  foilOpacity: 0,
  foilDrift: NO_DRIFT,
  nfcVisible: false,
  mountVisible: false,
  planted: false,
  hunting: false,
  visible: false,
}

const PLANTED: StickPose = {
  ...HIDDEN,
  nfcVisible: true,
  mountVisible: true,
  planted: true,
  hunting: true,
  visible: true,
}

export function flyDuration(phone: boolean): number {
  return phone ? FLY_PHONE : FLY_DESKTOP
}

export function stickDuration(phone: boolean): number {
  return phone ? STICK_PHONE : STICK_DESKTOP
}

function easeOutCubic(t: number): number {
  const x = clamp01(t)
  return 1 - (1 - x) * (1 - x) * (1 - x)
}

function easeInOut(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

/**
 * Critically damped step, normalised to hit 1 at t=1. No overshoot, no
 * bounce: a spring that settles on the first try. `omega` is how hard it
 * pulls — 6 on a smoothstep time-warp is snappy without dumping the
 * off-screen travel in the first frames.
 */
function critDamp01(t: number, omega: number): number {
  const x = clamp01(t)
  const n = 1 - Math.exp(-omega) * (1 + omega)
  const w = omega * x
  return (1 - Math.exp(-w) * (1 + w)) / n
}

/**
 * IN timing. Slow out of the wings (the card must stay off the right edge
 * for the first fifth), then a spring pull onto the look, then a short
 * fade of the last centimetres. A symmetric in-out spent the second half
 * of the beat creeping a card that was already large.
 */
function flyInEase(t: number): number {
  return critDamp01(smoothstep(t), 6)
}

function showcaseOf(narrow: boolean) {
  return narrow ? SHOWCASE_PHONE : SHOWCASE
}

/** Portrait / phone-breakpoint frame: the foil-peel hold has to fit the width. */
export function stickFrameNarrow(aspect: number): boolean {
  return aspect < SHOWCASE_PORTRAIT_ASPECT
}

/** Approach pose: a few millimetres in front of the mount, along local +Z. */
function approachPose(): { x: number, y: number, z: number } {
  const tilt = PLACARD_REST.tiltX
  return {
    x: PLACARD_REST.x,
    y: PLACARD_REST.y + PRESS_GAP * Math.sin(tilt),
    z: PLACARD_REST.z + PRESS_GAP * Math.cos(tilt),
  }
}

/**
 * Turn phase at fly progress `u`, 0..1 of a full revolution.
 *
 * The peel used to freeze the card at 0.5 so the liner came off a face that
 * was square to the lens. That read as a stopped turntable. Speed is now a
 * single envelope: high onto the back, a crawl across it while the liner
 * comes off (still on-camera, just not locked), then high again through
 * the second half so it is print-to-lens as it leaves for the beam.
 * Smoothstep blends at the joints, so the downshift and the upshift are
 * one spin, not three.
 *
 * The crawl is ~5% of peak rate, which is ~20° across the peel beat —
 * enough to read as still turning, tight enough that the antenna does
 * not walk off the lens.
 */
const TURN_SLOW = 0.05
const TURN_BLEND = 0.05
const TURN_LUT_N = 256
const TURN_LUT: number[] = (() => {
  const span = BACK_END - IN_END
  const dt = span / TURN_LUT_N
  const speed = (u: number) => {
    const amp = ease(u, TURN_END - TURN_BLEND, TURN_END) * (1 - ease(u, PEEL_END, PEEL_END + TURN_BLEND))
    return 1 - (1 - TURN_SLOW) * amp
  }
  const cumul = [0]
  let acc = 0
  for (let i = 1; i <= TURN_LUT_N; i++) {
    const a = IN_END + (i - 1) * dt
    const b = IN_END + i * dt
    acc += 0.5 * (speed(a) + speed(b)) * dt
    cumul.push(acc)
  }
  const total = cumul[TURN_LUT_N]!
  return cumul.map(c => c / total)
})()

export function turnPhase(u: number): number {
  const x = clamp01(u)
  if (x <= IN_END) return 0
  if (x >= BACK_END) return 1
  const t = (x - IN_END) / (BACK_END - IN_END) * TURN_LUT_N
  const i = Math.min(TURN_LUT_N - 1, Math.floor(t))
  const f = t - i
  return TURN_LUT[i]! * (1 - f) + TURN_LUT[i + 1]! * f
}

/** 0..1 through the peel beat, or -1 outside it. */
function peelPhase(u: number): number {
  if (u < TURN_END || u > PEEL_END) return -1
  return (u - TURN_END) / (PEEL_END - TURN_END)
}

/**
 * Full during the close-up - the turn and the peel both - then off as the card
 * leaves the lens for the beam.
 */
export function flyDof(u: number, phone: boolean): number {
  const t = clamp01(u)
  const amp = phone ? DOF_PHONE_SCALE : 1
  // Open as the card commits to the lens, not while it is still a small
  // object sliding in from the gym — that would blur the machine for a
  // sticker that has not arrived yet. The IN ease is snappy, so this
  // window sits on the spring pull rather than on a late creep.
  return amp * ease(t, IN_END * 0.48, IN_END * 0.88) * (1 - ease(t, BACK_END - 0.01, BACK_END + 0.08))
}

/** 0–1 showcase key. On as the card enters the frame, off as it leaves for the beam. */
export function flyShowLight(u: number): number {
  const t = clamp01(u)
  return ease(t, IN_END * 0.12, IN_END * 0.48) * (1 - ease(t, BACK_END - 0.01, 0.97))
}

/** The liner's fold line and roll radius at fly progress `u`. */
export function foilAt(u: number): {
  peel: PeelState
  visible: boolean
  opacity: number
  drift: { x: number, y: number, z: number, spin: number }
} {
  const t = peelPhase(u)
  if (t < 0) {
    // Before the beat the liner is on and flat; after it, it is gone.
    const before = u < TURN_END
    return {
      peel: { front: FLAT_FRONT, radius: FOIL_CORE, maxTurn: FOIL_MAX_TURN, grow: FOIL_GROW },
      visible: before,
      opacity: before ? 1 : 0,
      drift: NO_DRIFT,
    }
  }
  // 0.00-0.08 is the grab: the corner lifts a millimetre and nothing else
  // moves, which is what stops the pull from starting at full speed.
  const grab = smoothstep(clamp01(t / 0.08))
  const pull = easeInOut(clamp01((t - 0.08) / 0.68))
  const front = lerp(FLAT_FRONT - grab * 0.013, PEELED_FRONT, pull)
  const away = easeOutCubic(clamp01((t - 0.76) / 0.24))
  return {
    peel: {
      front,
      radius: foilOuter(SPAN.max - front),
      maxTurn: FOIL_MAX_TURN,
      grow: FOIL_GROW,
    },
    visible: away < 1,
    opacity: 1 - smoothstep(away),
    drift: {
      x: PEEL_AXIS.x * 0.26 * away,
      y: PEEL_AXIS.y * 0.26 * away + 0.05 * away,
      // Card-local -Z, because the liner is on the back. During the slow
      // spin that face is still pointed at the lens, so the roll leaves
      // toward it.
      z: -0.10 * away,
      spin: 0.9 * away,
    },
  }
}

/** The card's own fold. Flat until it commits to the beam, then it curls. */
function bendAt(u: number): PeelState {
  const t = ease(u, BACK_END, 1)
  if (t <= 0) return FLAT
  return {
    front: lerp(FLAT_FRONT, BEND_FRONT0, t),
    radius: lerp(BEND_R0, BEND_R1, t),
    maxTurn: BEND_MAX_TURN,
    grow: 0,
  }
}

function flyAt(local: number, phone: boolean, aspect: number): StickPose {
  const dur = flyDuration(phone)
  const u = clamp01(local / dur)
  const narrow = stickFrameNarrow(aspect)
  const show = showcaseOf(narrow)
  const end = approachPose()
  const face = FACE_CAM
  const foil = foilAt(u)

  let x: number
  let y: number
  let z: number
  let rotX: number
  let rotY: number
  if (u < IN_END) {
    // Slow start so the card stays off the right edge, then a spring
    // pull onto the look. A symmetric in-out left the last metres as a
    // long creep on a card that was already filling the frame.
    const a = flyInEase(u / IN_END)
    vec3HermiteAt(narrow ? IN_PATH_PHONE : IN_PATH, a, _inP)
    vec3HermiteAt(IN_ROT, a, _inR)
    x = _inP.x
    y = _inP.y
    z = _inP.z
    rotX = face.rotX + _inR.x
    rotY = face.rotY + _inR.y
  }
  else if (u < BACK_END) {
    const phase = turnPhase(u)
    x = show.x
    y = show.y
    z = show.z
    // A little pitch through the revolution so it reads as a hand turning the
    // card over rather than a part on a turntable. Keyed to the phase, so the
    // crawl across the back stays nearly flat while the liner comes off.
    rotX = face.rotX + Math.sin(phase * Math.PI * 2) * 0.06
    rotY = face.rotY + phase * TURN_TOTAL
  }
  else {
    const a = easeInOut((u - BACK_END) / (1 - BACK_END))
    x = lerp(show.x, end.x, a)
    y = lerp(show.y, end.y, a)
    z = lerp(show.z, end.z, a)
    rotX = lerp(face.rotX, PLACARD_REST.tiltX, a)
    // The revolution finished a whole turn ago, so dropping the 2*PI here is
    // not a cut - it is the same orientation, stated without the winding.
    rotY = lerp(face.rotY, 0, a)
  }

  return {
    x,
    y,
    z,
    rotX,
    rotY,
    rotZ: Math.sin(clamp01(u) * Math.PI) * (phone ? 0.03 : 0.05),
    dof: flyDof(u, phone),
    showLight: flyShowLight(u),
    // Ride the card through the close-up so inverse-square does not spike as
    // it commits to the lens. Pin at SHOWCASE once it leaves for the beam:
    // a 1.4 m cutoff following the card onto the mount would relight the
    // machine the establishing shot just built.
    keyPos: showcaseKeyPos(narrow, u < BACK_END ? { x, y, z } : undefined),
    squeegee: 0,
    bend: bendAt(u),
    foil: foil.peel,
    foilVisible: foil.visible,
    foilOpacity: foil.opacity,
    foilDrift: foil.drift,
    nfcVisible: true,
    // The empty bracket is on the machine for the whole of 0C. It is out of
    // focus behind the card for most of it, and what it buys is that the
    // sticker arrives somewhere rather than at a spot that grows hardware the
    // moment it lands.
    mountVisible: true,
    planted: false,
    hunting: false,
    visible: true,
  }
}

/**
 * 0D. The corner touches first and the fold line is driven up the diagonal
 * until the whole face is down - the peel run backwards. The gap closes in
 * the first fifth so contact happens once, at the corner, and everything
 * after it is the vinyl being rolled onto the blank rather than a plate
 * arriving flat.
 */
function pressAt(local: number): StickPose {
  const u = clamp01(local / PRESS_DUR)
  const contact = easeOutCubic(clamp01(u / 0.20))
  const roll = easeInOut(clamp01((u - 0.16) / 0.84))
  const from = approachPose()
  return {
    x: lerp(from.x, PLACARD_REST.x, contact),
    y: lerp(from.y, PLACARD_REST.y, contact),
    z: lerp(from.z, PLACARD_REST.z, contact),
    rotX: PLACARD_REST.tiltX,
    rotY: 0,
    rotZ: 0,
    dof: 0,
    // Room light only. A close spot here was meant to read the vinyl, but
    // inverse-square from a lamp next to the mount also paints a travelling
    // specular on the front cage tube - the steel bar sitting in front of
    // the code - and that highlight dies the frame the press key goes out.
    // The 0C key stays at the lens for the same reason: a 1.4 m cutoff on
    // the machine relights the establishing shot.
    showLight: 0,
    keyPos: null,
    squeegee: ease(u, 0.10, 0.24) * (1 - ease(u, 0.88, 1)),
    bend: u >= 1
      ? FLAT
      : { front: lerp(BEND_FRONT0, FLAT_FRONT, roll), radius: BEND_R1, maxTurn: BEND_MAX_TURN, grow: 0 },
    foil: FLAT,
    foilVisible: false,
    foilOpacity: 0,
    foilDrift: NO_DRIFT,
    nfcVisible: true,
    mountVisible: true,
    planted: u >= 1,
    hunting: u >= PRESS_HUNT_U,
    visible: true,
  }
}

export type StickShot = 'fly' | 'stick' | 'hold'

export function stickAt(
  local: number,
  shot: StickShot,
  phone: boolean,
  aspect?: number,
): StickPose {
  const frame = aspect ?? (phone ? 9 / 19.5 : 16 / 9)
  if (shot === 'hold') return PLANTED
  if (shot === 'fly') return flyAt(local, phone, frame)
  if (local < 0) return flyAt(1e6, phone, frame)
  if (local < PRESS_DUR) return pressAt(local)
  return PLANTED
}

export function stickHidden(): StickPose {
  return HIDDEN
}
