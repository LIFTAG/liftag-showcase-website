// Act 0A floor: the mat arrives as 1 m slabs that rise out of the void and
// seat, not as a disc wiped in by the shockwave.
//
// Rooted at the machine's feet and spreading outward with the hologram front,
// but scattered — every tile carries a deterministic jitter on when it starts,
// how long it travels, how deep it starts and how far it is cocked over. The
// boundary is a ragged edge of individual slabs rather than a marching ring,
// and a few break out ahead of their neighbours.
//
// The rise is a damped spring, not a ramp into a stop: a slab is launched out
// of its slot, overshoots a few inches proud of the mat, and snaps back down
// through it before settling. Because the launch order is radial, the ring of
// slabs at their apex travels outward from the machine's feet — the cascade is
// the overshoot, not the arrival. Its cock unwinds over the launch, so it is
// already flat by the time it peaks.
//
// Pure, and allocation-free on the hot path (`floorTilePoseAt` writes into a
// caller-owned pose), so the choreography is unit-testable and the per-frame
// cost in the stage is one instanced draw.

import {
  FLOOR_Y_BOTTOM,
  FLOOR_Y_TOP,
  PASS_SPAN,
  PEEL,
  Y_CONTACT,
  timeAtHeight,
} from './hologramPass.ts'
import { smoothstep } from './timeline.ts'

/** Metres. Matches the seam pitch moulded into the mat maps by createFloorMaps. */
export const TILE_SIZE = 1
/**
 * Slab depth. Thin enough to read as matting, thick enough that the edge
 * catches a highlight on the way up.
 */
export const TILE_THICK = 0.06
/**
 * Half-extent of the square the slabs own, metres. The base plane is discarded
 * inside exactly this box, so the two never overlap and the join is a straight
 * tile edge rather than a circle cutting slabs in half.
 */
export const TILE_FIELD_HALF = 6

const PER_AXIS = Math.round((TILE_FIELD_HALF * 2) / TILE_SIZE)
const CENTRE_MAX = TILE_FIELD_HALF - TILE_SIZE / 2
const CORNER_R = Math.hypot(CENTRE_MAX, CENTRE_MAX)

/**
 * Seconds the tile front runs ahead of the hologram's floor peel. The ground
 * rushes up to meet the descending line rather than waiting for it — and the
 * spring below needs the room, since a slab is in motion far longer than the
 * old ramp-and-stop was.
 */
export const TILE_LEAD = 0.55
/** Pass-time at which the centre slab starts. */
export const TILE_T0 = Math.max(
  0,
  timeAtHeight(Y_CONTACT, FLOOR_Y_TOP, FLOOR_Y_BOTTOM) - PEEL - TILE_LEAD,
)

/** <1: quick off the centre, slowing as it spreads. Same shape as the splash. */
const SPREAD_POW = 0.62
/**
 * Scatter around the nominal front. The early half is what stops it reading as
 * a ring — some slabs break out before the front reaches them.
 */
const CHAOS_EARLY = 0.10
const CHAOS_LATE = 0.20
/**
 * Launch to fully settled, seconds. Kept tight: a spring spends its last third
 * ringing at under a centimetre, and every second reserved for that is a
 * second the cascade cannot use. Short spans buy a longer spread.
 */
const RISE_MIN = 0.34
const RISE_MAX = 0.52
/** How far below the mat a slab starts, metres. Also sets its overshoot. */
const DEPTH_MIN = 0.28
const DEPTH_MAX = 0.55
/**
 * Multiplier on the throw at the far corner of the field. Slabs out there are
 * seen at a grazing angle through most of the fog, where half a metre of rise
 * is a few pixels and reads as an appearance rather than a launch. Throwing
 * them from deeper buys back the travel the perspective takes away, and scales
 * their overshoot with it so the cascade still reads at the back.
 */
const DEPTH_REACH = 2.6
/**
 * Damping ratio of the spring. The first peak lands
 * `exp(-pi*z / sqrt(1-z^2))` of the launch depth proud of the mat, so this
 * band with the depths above puts the overshoot between about 2 and 10 cm.
 */
const ZETA_MIN = 0.48
const ZETA_MAX = 0.62
const YAW_MAX = 0.085
const TILT_MAX = 0.075
/** Where in the span the slab is at the top of its overshoot. */
const APEX_U = 0.30
/** Where the residual ring is faded out so a settled slab is exactly flush. */
const FADE_U = 0.74
/** Slack between the last slab settling and the end of the pass. */
const TILE_TAIL = 0.08
/**
 * Spread budget. Sized from what is left of the pass so the outermost slab is
 * seated and settled before 0A hands the floor back to the plane, whatever the
 * spring and chaos bounds are tuned to.
 */
const SPREAD_SPAN = PASS_SPAN - TILE_T0 - (CHAOS_LATE + RISE_MAX + TILE_TAIL)

/**
 * Fraction of the rise a slab spends growing to full size, and the size it
 * starts at. A slab appears deep in an unlit void, but 144 boxes arriving is
 * still 144 pops — this turns each one into a flicker.
 */
const GROW_U = 0.18
const GROW_MIN = 0.55

/**
 * Fraction of the span over which a slab carries the light it was written
 * with, fading to nothing as it seats.
 *
 * The lamps are over the machine. Out at the back of the field the mat sits at
 * about 4% luminance, so a slab moving there changes almost nothing on screen
 * however far it is thrown — it reads as appearing, not arriving. Emissive is
 * not attenuated by distance from a lamp, only by fog, so one constant carry
 * is a faint accent on a well-lit slab near the camera and the only thing
 * making a slab at ten metres legible at all.
 */
const GLOW_SPAN = 0.62
/**
 * Carry at the centre relative to the corner. Slabs near the camera are
 * already lit and want only a trace; the falloff this is compensating for is
 * entirely at the back. Because the field launches as a radial wave, only one
 * radius is ever in flight at once, so the gradient never shows as a gradient.
 */
const GLOW_NEAR = 0.28

export type FloorTile = {
  /** Seated centre, world XZ. */
  x: number
  z: number
  r: number
  /** Pass-time at which this slab is launched. */
  delay: number
  /** Launch to fully settled, seconds. */
  dur: number
  /** How far below the mat it starts, metres. */
  depth: number
  /** Damping ratio of its spring. Lower overshoots further. */
  zeta: number
  /** Peak write-in light this slab carries, by how little reaches it. */
  glowGain: number
  yaw: number
  tiltX: number
  tiltZ: number
}

export type FloorTilePose = {
  /** Draw this instance. False before the slab has been called. */
  live: boolean
  /** Top face relative to the mat plane, metres. 0 = seated, + is proud. */
  lift: number
  yaw: number
  tiltX: number
  tiltZ: number
  /** XZ scale while the slab materialises. 1 once it is up to size. */
  grow: number
  /** Write-in light it is still carrying. 1 at launch, 0 once seated. */
  glow: number
  seated: boolean
}

/**
 * Deterministic per-slab noise. Integer grid coords in, so the field is
 * byte-identical between runs and between server and client.
 */
function hash01(ix: number, iz: number, salt: number): number {
  let h = Math.imul(ix + 0x9e37, 0x85ebca6b)
    ^ Math.imul(iz + 0x79b9, 0xc2b2ae35)
    ^ Math.imul(salt + 1, 0x27d4eb2f)
  h = Math.imul(h ^ (h >>> 15), 0x2545f491)
  h ^= h >>> 13
  return (h >>> 0) / 4294967296
}

/**
 * Fraction of the launch depth a slab peaks at above the mat, for a damping
 * ratio. The standard second-order overshoot.
 */
export function tileOvershoot(zeta: number): number {
  return Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta))
}

/**
 * Underdamped step response, 1 at launch (fully down) to 0 seated, in units of
 * the launch depth. Goes negative through the first swing — that is the slab
 * standing proud of the mat — then rings back down.
 *
 * The natural frequency is derived from `APEX_U` rather than given, so the top
 * of the overshoot always lands at the same point in the slab's span whatever
 * its damping. Past `FADE_U` the residual is under a couple of millimetres and
 * is windowed off, so a settled slab is exactly flush and the plane can take
 * over from it unnoticed.
 */
export function tileSpring(u: number, zeta: number): number {
  if (u <= 0) return 1
  if (u >= 1) return 0
  const wd = Math.PI / APEX_U
  const w = wd / Math.sqrt(1 - zeta * zeta)
  const ring = Math.exp(-zeta * w * u)
    * (Math.cos(wd * u) + ((zeta * w) / wd) * Math.sin(wd * u))
  return u <= FADE_U
    ? ring
    : ring * (1 - smoothstep((u - FADE_U) / (1 - FADE_U)))
}

/**
 * Nominal front radius at a pass-time — the inverse of the delay law above,
 * with the per-slab chaos left out.
 *
 * Exported because the mat has one front, not two. The slabs ride it inside
 * the field; `floorConstruct` carries the same curve straight on past the
 * field corner and the base plane rides it out into the fog. Anything else
 * gives the far ground a schedule of its own, which is what used to leave it
 * waiting on the shockwave and then arriving all at once.
 */
export function tileFrontR(sweepT: number): number {
  const u = (sweepT - TILE_T0) / SPREAD_SPAN
  return u <= 0 ? 0 : CORNER_R * u ** (1 / SPREAD_POW)
}

export function buildFloorTiles(): FloorTile[] {
  const out: FloorTile[] = []
  for (let iz = 0; iz < PER_AXIS; iz++) {
    for (let ix = 0; ix < PER_AXIS; ix++) {
      const x = -CENTRE_MAX + ix * TILE_SIZE
      const z = -CENTRE_MAX + iz * TILE_SIZE
      const r = Math.hypot(x, z)
      const front = SPREAD_SPAN * (r / CORNER_R) ** SPREAD_POW
      const chaos = hash01(ix, iz, 0) * (CHAOS_EARLY + CHAOS_LATE) - CHAOS_EARLY
      out.push({
        x,
        z,
        r,
        delay: Math.max(0, TILE_T0 + front + chaos),
        dur: RISE_MIN + hash01(ix, iz, 1) * (RISE_MAX - RISE_MIN),
        depth: (DEPTH_MIN + hash01(ix, iz, 2) * (DEPTH_MAX - DEPTH_MIN))
          * (1 + (DEPTH_REACH - 1) * (r / CORNER_R)),
        zeta: ZETA_MIN + hash01(ix, iz, 6) * (ZETA_MAX - ZETA_MIN),
        glowGain: GLOW_NEAR + (1 - GLOW_NEAR) * (r / CORNER_R),
        yaw: (hash01(ix, iz, 3) - 0.5) * 2 * YAW_MAX,
        tiltX: (hash01(ix, iz, 4) - 0.5) * 2 * TILT_MAX,
        tiltZ: (hash01(ix, iz, 5) - 0.5) * 2 * TILT_MAX,
      })
    }
  }
  return out
}

export function emptyTilePose(): FloorTilePose {
  return { live: false, lift: 0, yaw: 0, tiltX: 0, tiltZ: 0, grow: 1, glow: 0, seated: false }
}

/**
 * One slab at one pass-time. `sweepT` is the same clock `floorConstructAt`
 * reports, so the phone's compressed 0A scales the whole field for free.
 */
export function floorTilePoseAt(
  tile: FloorTile,
  sweepT: number,
  out: FloorTilePose = emptyTilePose(),
): FloorTilePose {
  const t = sweepT - tile.delay
  if (t < 0) {
    out.live = false
    out.lift = -tile.depth
    out.yaw = tile.yaw
    out.tiltX = tile.tiltX
    out.tiltZ = tile.tiltZ
    out.grow = GROW_MIN
    out.glow = tile.glowGain
    out.seated = false
    return out
  }
  if (t >= tile.dur) {
    // Settled. Exact zeros, not the -0 that falls out of scaling by zero:
    // downstream this is a transform, and a seated slab must be flush.
    out.live = true
    out.lift = 0
    out.yaw = 0
    out.tiltX = 0
    out.tiltZ = 0
    out.grow = 1
    out.glow = 0
    out.seated = true
    return out
  }
  const u = t / tile.dur
  // The cock unwinds over the launch alone, so the slab is already flat when
  // it peaks and the ring that follows is pure vertical.
  const rest = 1 - Math.min(1, u / APEX_U)
  out.live = true
  out.lift = -tile.depth * tileSpring(u, tile.zeta)
  out.yaw = tile.yaw * rest
  out.tiltX = tile.tiltX * rest
  out.tiltZ = tile.tiltZ * rest
  out.grow = u >= GROW_U ? 1 : GROW_MIN + (1 - GROW_MIN) * (u / GROW_U)
  out.glow = u >= GLOW_SPAN ? 0 : tile.glowGain * (1 - smoothstep(u / GLOW_SPAN))
  out.seated = false
  return out
}

/**
 * The field, built once. `buildFloorTiles` stays exported so the determinism
 * of the jitter can be checked against a fresh build.
 */
export const FLOOR_TILES: readonly FloorTile[] = buildFloorTiles()

/**
 * Radius of the machine's footprint, metres. Comfortably outside the leg
 * press's base so the ground under every foot counts.
 */
export const FLOOR_MACHINE_R = 1.5

/**
 * Pass-time by which every slab whose square overlaps a disc of `radius` has
 * settled — the moment there is solid, still ground out to there. Act 0 uses
 * it to release the machine while the rest of the mat is still being written.
 */
export function floorClearAt(radius: number): number {
  let clear = 0
  for (const tile of FLOOR_TILES) {
    const dx = Math.max(0, Math.abs(tile.x) - TILE_SIZE / 2)
    const dz = Math.max(0, Math.abs(tile.z) - TILE_SIZE / 2)
    if (dx * dx + dz * dz > radius * radius) continue
    clear = Math.max(clear, tile.delay + tile.dur)
  }
  return clear
}
