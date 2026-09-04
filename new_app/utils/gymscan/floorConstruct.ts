// Timed Act 0A: one hologram sweep writes the gym floor, then dies.
//
// Reuses `hologramPassAt` — the same cage line and floor shockwave as the
// periodic idle. First paint is void: no PBR mat. Lime only on the front;
// wake is cool-white.
//
// The rubber itself is not wiped in by the front. Inside the tile field the
// mat is built out of physical slabs that rise and seat (see `floorTiles.ts`);
// this module owns the clock they run on and the base plane behind them.
//
// One front, not two. The plane does not wait on the shockwave — the shockwave
// stops at `maxR`, well inside what the camera can see, so anything keyed to
// it leaves most of the ground with nothing to arrive on. Instead the plane
// picks up `tileFrontR`, the slab field's own radial spread, where the slabs
// run out at the field corner, and carries the same curve on into the fog.
// The far mat starts writing while the slabs are still going up, and the join
// at the field edge is a slab and a plane cell arriving together.
//
// The sweep and the slabs still end with the pass; the plane keeps going for a
// short tail past it (`matDuration`) on the momentum the front had. Behind the
// front is `pbrBand` — a depth of ground still coming up — which the shader
// stages cell by cell so the far mat is a scatter of squares rather than a
// circle inflating through the fog.

import { tileFrontR } from './floorTiles.ts'
import {
  FLOOR_Y_BOTTOM,
  FLOOR_Y_TOP,
  hologramPassAt,
  PASS_SPAN,
  type HologramPass,
} from './hologramPass.ts'
import { clamp01 } from './timeline.ts'

/** Cage bounds the birth sweep runs between. Defined with the pass; re-exported
 *  here because this is where callers have always found them. */
export { FLOOR_Y_BOTTOM, FLOOR_Y_TOP }

export const FLOOR_DESKTOP = PASS_SPAN
export const FLOOR_PHONE = 2.2
export const FLOOR_STEM_R = 0.32
export const FLOOR_MAX_R = 6.20
/** Shader clip is off above this. Full 90 m plane after 0A. */
export const PBR_OPEN = 1e6
/**
 * Radius the front runs out to before the clip is switched off altogether —
 * the plane's `uBirthR < PBR_TAIL_R` guard makes the discard a no-op at or
 * above it, so the stage reads this constant rather than repeating the number
 * in GLSL.
 *
 * Kept only a little past the fog rather than out at the plane's own 45 m
 * half-width. FogExp2 at 0.08 leaves ~1% transmittance here, and the mat is
 * about 4% luminance out that far, so the ground between this and the rim is
 * four ten-thousandths of full and switching it on in one frame is free. Every
 * metre added here is a metre the escape has to cross in the same time, which
 * is paid for by compressing the fade on the last ground that can still be
 * seen — the deep field is cheap to skip and expensive to animate.
 */
export const PBR_TAIL_R = 26
/**
 * Extra time the plane keeps writing after the sweep dies, as a fraction of
 * 0A's own duration so the phone's compressed pass scales with it.
 *
 * The shockwave only reaches `maxR`. Every metre past that — which is most of
 * the ground the camera can see — has to be written in what is left, and what
 * was left was a third of a second. This buys back another half of one. It
 * cannot grow much further: 0B is already falling by then, and `act0` kills
 * the birth outright when the fly-in starts, so the mat must be open before
 * `assembleEnd`. `act0.test.ts` pins that.
 */
const MAT_TAIL = 0.10
/**
 * Metres of ragged, fading ground behind the plane's leading edge — how long a
 * cell takes to come up, expressed as the distance the front travels while it
 * does.
 *
 * Sized against the front's speed where it leaves the slab field (~8 m/s) so a
 * plane cell fades up in about as long as a slab takes to rise and seat. The
 * per-cell spread on it, in the shader, widens that to roughly the slabs' own
 * 0.34–0.52 s.
 */
export const PBR_BAND = 3.5

export type FloorConstructOpts = {
  phone: boolean
  stemR?: number
  maxR?: number
  yTop?: number
  yBottom?: number
  /** True once 0B has swapped — the birth sweep must not survive into 1B. */
  kill?: boolean
}

export type FloorConstructState = {
  t: number
  phone: boolean
  /** Seconds into the hologram pass (0…PASS_SPAN). Phone is time-scaled. */
  sweepT: number
  envelope: number
  /** Drive `holo.update(sweepT, envelope)`. */
  draw: boolean
  /**
   * World-XZ radius of visible PBR rubber. 0 = void (first paint).
   * Follows the hologram shockwave, then washes outward across the tail, then
   * `PBR_OPEN`.
   */
  pbrR: number
  /**
   * Metres of fade behind `pbrR`. The plane's front is a band, not an edge:
   * the shader stages each 1 m cell across it so the far mat arrives as
   * scattered squares coming up out of the void. 0 once the mat is open.
   */
  pbrBand: number
  /**
   * True while the rising slabs own the centre of the mat. The stage clips the
   * base plane out of that square so the two are never both drawn.
   */
  tiles: boolean
  done: boolean
  pass: HologramPass
}

function passOpts(opts: FloorConstructOpts) {
  return {
    yTop: opts.yTop ?? FLOOR_Y_TOP,
    yBottom: opts.yBottom ?? FLOOR_Y_BOTTOM,
    stemR: opts.stemR ?? FLOOR_STEM_R,
    maxR: opts.maxR ?? FLOOR_MAX_R,
  }
}

export function floorDuration(phone: boolean): number {
  return phone ? FLOOR_PHONE : FLOOR_DESKTOP
}

/**
 * When the mat is finally, fully open — the sweep's duration plus the tail the
 * plane keeps writing across. The slabs and the hologram still end at
 * `floorDuration`; only the plane runs on past them.
 */
export function matDuration(phone: boolean): number {
  return floorDuration(phone) * (1 + MAT_TAIL)
}

/** Pass-seconds the front keeps running after the pass. Phone-invariant. */
const ESCAPE_SPAN = PASS_SPAN * MAT_TAIL
/** Where the shared front has reached when the pass ends, and how fast. */
const FRONT_AT_END = tileFrontR(PASS_SPAN)
const FRONT_SPEED_AT_END = (FRONT_AT_END - tileFrontR(PASS_SPAN - 0.05)) / 0.05
/**
 * Shape of the escape. Ease-*in* on top of the speed the front already has, so
 * it leaves the pass at the pace it was travelling and only runs away once it
 * is deep in the fog, where the last twenty metres cost nothing to skip.
 */
const ESCAPE_POW = 2.0

/**
 * The slabs stop at the end of the pass; the ground does not. Past `PASS_SPAN`
 * the front keeps going on the momentum it had, accelerating out to the radius
 * where the clip switches off.
 *
 * `u` is 0 at the end of the pass and 1 at `matDuration`. Derived from the
 * spread law rather than given, so retuning the slab field retunes this with
 * it and the two never part company.
 */
function escapeRadius(u: number): number {
  const lead = FRONT_SPEED_AT_END * ESCAPE_SPAN
  return lead * u + Math.max(0, PBR_TAIL_R - FRONT_AT_END - lead) * u ** ESCAPE_POW
}

export function floorConstructAt(t: number, opts: FloorConstructOpts): FloorConstructState {
  const phone = opts.phone
  const dur = floorDuration(phone)
  const matEnd = matDuration(phone)
  const geometry = passOpts(opts)
  const offPass = hologramPassAt(1e6, 0, geometry)
  if (t < 0 || opts.kill) {
    return {
      t,
      phone,
      sweepT: 0,
      envelope: 0,
      draw: false,
      pbrR: PBR_OPEN,
      pbrBand: 0,
      tiles: false,
      done: true,
      pass: offPass,
    }
  }

  // Everything below runs on pass-time, unclamped past the end of the pass, so
  // the phone's compressed 0A scales the mat's front for free.
  const passT = (t / dur) * PASS_SPAN
  const sweepT = Math.min(passT, PASS_SPAN)
  const envelope = t >= dur ? 0 : 1
  const pass = hologramPassAt(sweepT, envelope, geometry)
  const draw = envelope > 0
  const open = t >= matEnd
  // One front for the whole mat. The plane does not wait for the shockwave —
  // the shockwave stops at `maxR`, well inside what the camera can see — it
  // picks up the slab field's own radial spread where the slabs run out and
  // carries it on into the fog.
  const pbrR = open
    ? PBR_OPEN
    : tileFrontR(sweepT) + escapeRadius(clamp01((passT - PASS_SPAN) / ESCAPE_SPAN))

  return {
    t,
    phone,
    sweepT,
    envelope,
    draw,
    pbrR,
    pbrBand: open ? 0 : PBR_BAND,
    tiles: t < dur,
    done: open,
    pass,
  }
}
