// Act 1 camera: the approach, and the geometry that says where it may stop.
//
// Its own module for the same reason `act0Cam.ts` is one - the path is a claim
// about framing ("you end up in the seat, reading the plate square on"), and a
// claim that lives as six vectors inside a 2000-line renderer is a claim
// nobody can check. `plateFramingAt` re-derives what the lens actually sees
// from those vectors, so `tests/act1Cam.test.ts` can hold the shot to its
// description instead of to the numbers, which is what has to survive the
// next retune.
import { PLACARD_H, PLACARD_REST } from './stick.ts'
import { vec3HermiteAt, type Vec3Stop } from './timeline.ts'

/** Vertical field of view of the stage camera, degrees. */
export const CAM_FOV_Y = 38

/**
 * `u` runs 0..1 from a wide three-quarter read of the whole machine to the
 * seated eye point - where the athlete's head would be, so the placard is
 * found from the training position rather than from a flattering angle no
 * user will ever occupy.
 *
 * The first three stops are the film's original three-quarter approach.
 * A standing end was tried and rejected: it put the eye above the plate and
 * read it at a downward slant. The last shot has to arrive square on, at the
 * height and the angle a phone held in the seat would see it. The eye ends
 * level with the plate at y = 1.255, about 0.85 m out — a phone held out
 * from the seat, close enough to read the 15.5 cm tag, not so close that the
 * code eats the frame. The target lands on the plate itself so the folded
 * glass has the QR already centred in its viewfinder.
 *
 * The path is monotonic: it closes on the plate and never backs off. A
 * reversal is a phase change however smoothly it is interpolated.
 */
export const APPROACH_PATH: readonly Vec3Stop[] = [
  [0.00, [3.98, 2.22, 4.96]],
  [0.22, [3.20, 2.04, 4.14]],
  [0.46, [2.28, 1.82, 3.20]],
  [0.68, [1.18, 1.48, 1.78]],
  [0.86, [0.36, 1.31, 0.92]],
  [1.00, [0.02, 1.255, 0.48]],
]

/**
 * Land on the plate itself, so the code is dead centre and square at the end
 * of the move - the frame the phone folds around.
 */
export const APPROACH_TARGET_PATH: readonly Vec3Stop[] = [
  [0.00, [0.05, 0.88, -0.04]],
  [0.46, [0.02, 0.94, -0.14]],
  [0.72, [0.00, 1.02, -0.24]],
  [1.00, [0.00, 1.255, -0.372]],
]

export type PlateFraming = {
  /** Metres from the eye to the centre of the mounted plate. */
  distance: number
  /** Plate height as a fraction of the full frame height. */
  heightFraction: number
  /**
   * Plate centre away from frame centre, in units of half the frame *height*
   * for both axes - so `ndcY` of 1 is the top edge, and `ndcX` is comparable
   * to it without having to pick an aspect ratio.
   */
  ndcX: number
  ndcY: number
  /** Degrees between the plate's normal and the eye. 0 is dead square on. */
  incidenceDeg: number
}

function unit(v: number[]): number[] {
  const n = Math.hypot(v[0]!, v[1]!, v[2]!) || 1
  return [v[0]! / n, v[1]! / n, v[2]! / n]
}

function cross(a: number[], b: number[]): number[] {
  return [
    a[1]! * b[2]! - a[2]! * b[1]!,
    a[2]! * b[0]! - a[0]! * b[2]!,
    a[0]! * b[1]! - a[1]! * b[0]!,
  ]
}

function dot(a: number[], b: number[]): number {
  return a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!
}

/**
 * What the lens sees of the mounted plate at approach parameter `u`.
 *
 * Mirrors the stage exactly: sample both Hermite paths, look from one at the
 * other with world up, and project. The pointer parallax and the phone's
 * distance pull are deliberately not modelled - both are small, both taper to
 * nothing by the end of the approach, and neither may be what makes the plate
 * fit in frame.
 */
export function plateFramingAt(u: number): PlateFraming {
  const eye = { x: 0, y: 0, z: 0 }
  const tgt = { x: 0, y: 0, z: 0 }
  vec3HermiteAt(APPROACH_PATH, u, eye)
  vec3HermiteAt(APPROACH_TARGET_PATH, u, tgt)

  const forward = unit([tgt.x - eye.x, tgt.y - eye.y, tgt.z - eye.z])
  const right = unit(cross(forward, [0, 1, 0]))
  const up = cross(right, forward)

  const toPlate = [
    PLACARD_REST.x - eye.x,
    PLACARD_REST.y - eye.y,
    PLACARD_REST.z - eye.z,
  ]
  const distance = Math.hypot(toPlate[0]!, toPlate[1]!, toPlate[2]!)
  const depth = dot(toPlate, forward)
  const tanHalf = Math.tan((CAM_FOV_Y * Math.PI) / 360)

  // The plate faces +Z, rotated about X by its mount tilt.
  const normal = [0, -Math.sin(PLACARD_REST.tiltX), Math.cos(PLACARD_REST.tiltX)]
  const toEye = unit([-toPlate[0]!, -toPlate[1]!, -toPlate[2]!])

  return {
    distance,
    heightFraction: PLACARD_H / (2 * depth * tanHalf),
    ndcX: dot(toPlate, right) / (depth * tanHalf),
    ndcY: dot(toPlate, up) / (depth * tanHalf),
    incidenceDeg: (Math.acos(Math.min(1, Math.max(-1, dot(normal, toEye)))) * 180) / Math.PI,
  }
}
