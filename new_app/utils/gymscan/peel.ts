// One deformation, used three times.
//
// The card sequence needs a surface that *rolls* rather than one that bends:
// a protective film coming off a print, and then the print itself being laid
// down corner-first. Both are the same physical thing - material past a moving
// fold line wrapping onto a cylinder tangent to the plane - so both are this.
//
// Arc length is preserved across the fold, which is the whole point. A vertex
// shader that lifts Y by a curve stretches the film as it lifts, and the print
// on it visibly smears; wrapping at constant radius moves every vertex exactly
// as far along the surface as it was, so the artwork stays the size it was
// printed. That is the difference between a sticker being peeled and a texture
// being warped, and the eye reads it instantly.
//
//     s    = distance along the peel axis, in card-plane metres
//     t    = s - front, so t <= 0 is still flat and t > 0 is on the roll
//     turn = wrap angle, solved from t so arc length is preserved
//     grow = metres of radius gained per radian of wrap; 0 is a plain cylinder
//     side = which face the roll is on: +1 rolls toward +Z, -1 toward -Z
//
// `grow` is what makes a roll a roll. At a constant radius the arc length a
// wrap can absorb is R*turn, so a film long enough to matter forces either a
// huge R or a turn count that makes every winding land on the one below it -
// and both were shipped and both were wrong. The liner is 22 cm of material:
// as a cylinder it needs a 3.8 cm radius, which is a rolled carpet next to a
// 15 cm card, and clamping the radius instead throws the surplus off the end
// as a flat tangent sheet several centimetres long. Letting the radius climb
// with the wrap gives the real answer: 4-odd turns of a 1.2 cm roll, with the
// windings held apart by their own spiral so they neither z-fight nor stack.
//
// `side` exists because the two rolls in the sequence happen on opposite
// faces of the same card. The release liner is on the *back*, so it curls
// away from the print; the card itself bends toward the viewer as it is laid
// down. Mirroring the deformation through z = 0 is exact - the plane
// coordinates, the fold line and the arc length are all untouched, so both
// faces peel from the same corner along the same diagonal.
//
// Past `maxTurn` the surface leaves the cylinder along its tangent instead of
// spiralling through itself forever. In practice the callers grow `radius` as
// the peel advances - a real roll gets fatter as film winds onto it - so the
// tangent tail is only ever a few millimetres.
//
// The TS below and the GLSL further down are the same function written twice.
// Tests exercise the TS; the shader is what ships. Keep them in step.
import * as THREE from 'three'

/** Card-plane peel direction. The diagonal: films are grabbed by a corner. */
export const PEEL_AXIS = Object.freeze({ x: Math.SQRT1_2, y: Math.SQRT1_2 })

export interface PeelParams {
  axisX: number
  axisY: number
  /** Fold-line position along the axis, metres. Material past it is rolled. */
  front: number
  /** Roll radius at the fold line, metres. The outer radius when it grows. */
  radius: number
  /** Radians of wrap before the surface continues along the tangent. */
  maxTurn: number
  /** Metres of radius gained per radian. 0 is a constant-radius cylinder. */
  grow: number
  /** +1 rolls off the front face, -1 off the back. Mirrors the roll in z. */
  side: number
  /** Offset along the deformed normal - keeps stacked layers registered. */
  thickness: number
}

export interface PeelSample {
  x: number
  y: number
  z: number
  nx: number
  ny: number
  nz: number
  /** Wrap angle at this point, radians. 0 means still flat. */
  turn: number
}

/**
 * Half-extents of the axis coordinate over a `w` x `h` card, so callers can
 * drive `front` from "nothing peeled" to "nothing left" without restating the
 * geometry. The diagonal axis puts the extremes on opposite corners.
 */
export function peelSpan(w: number, h: number, axisX = PEEL_AXIS.x, axisY = PEEL_AXIS.y): {
  min: number
  max: number
} {
  const half = Math.abs(axisX) * (w / 2) + Math.abs(axisY) * (h / 2)
  return { min: -half, max: half }
}

/**
 * Arc length from the fold line to wrap angle `turn`.
 *
 * `radius` is the roll's *outer* radius and the wrap is measured from the
 * fold, so the material nearest the fold is the outermost layer - which is
 * the right way round: on a peel, the last film onto the roll is the last
 * film off the card. Winding inwards is why this subtracts.
 */
export function peelArc(turn: number, radius: number, grow: number): number {
  return radius * turn - 0.5 * grow * turn * turn
}

/**
 * Wrap angle that consumes exactly `t` of arc length - the inverse of
 * `peelArc`. A quadratic when the roll grows, a plain division when it does
 * not, and the two agree in the limit. Solving it rather than stepping it is
 * what keeps the surface from stretching; see the arc-length tests.
 */
export function peelTurn(t: number, radius: number, grow: number): number {
  if (t <= 0) return 0
  if (grow > 1e-9) {
    const disc = radius * radius - 2 * grow * t
    // Past this the roll has no core left to wind onto. Callers size the
    // outer radius from the film they actually have, so it does not arise.
    if (disc <= 0) return radius / grow
    return (radius - Math.sqrt(disc)) / grow
  }
  return t / radius
}

export function peelAt(px: number, py: number, p: PeelParams): PeelSample {
  const s = px * p.axisX + py * p.axisY
  const t = s - p.front
  let turn = 0
  let sOut = s
  let zOut = 0
  let rolled = p.radius
  if (t > 0 && p.radius > 1e-5) {
    turn = Math.min(peelTurn(t, p.radius, p.grow), p.maxTurn)
    rolled = p.radius - p.grow * turn
    const rest = t - peelArc(turn, p.radius, p.grow)
    sOut = p.front + rolled * Math.sin(turn) + rest * Math.cos(turn)
    // Measured from the roll's centre, which sits one outer radius off the
    // plane and stays put. That fixed centre is the whole point: windings a
    // turn apart end up `grow * 2PI` apart instead of both passing back
    // through the fold, which is what a radius-about-the-fold-line does.
    zOut = p.radius - rolled * Math.cos(turn) + rest * Math.sin(turn)
  }
  // Perpendicular to the true spiral tangent, not to the circle's. The two
  // differ by the roll's own pitch - a couple of degrees - and using the
  // circle's would put that error straight into every lighting term.
  const sn = Math.sin(turn)
  const cn = Math.cos(turn)
  const tanS = rolled * cn - p.grow * sn
  const tanZ = rolled * sn + p.grow * cn
  const tl = Math.hypot(tanS, tanZ) || 1
  const nx = -p.axisX * (tanZ / tl)
  const ny = -p.axisY * (tanZ / tl)
  const nz = (tanS / tl) * p.side
  const d = sOut - s
  return {
    x: px + p.axisX * d + nx * p.thickness,
    y: py + p.axisY * d + ny * p.thickness,
    z: zOut * p.side + nz * p.thickness,
    nx,
    ny,
    nz,
    turn,
  }
}

/** The three numbers that move during a peel. Axis, side and thickness are fixed. */
export interface PeelState {
  front: number
  radius: number
  maxTurn: number
  /** Metres of radius per radian. 0 for a bend; the liner's roll fattens. */
  grow: number
}

export interface PeelUniforms {
  uPeelAxis: { value: THREE.Vector2 }
  uPeelFront: { value: number }
  uPeelRadius: { value: number }
  uPeelMaxTurn: { value: number }
  uPeelGrow: { value: number }
  uPeelSide: { value: number }
  uPeelThickness: { value: number }
}

/** `front` this far past the card's far corner means "flat everywhere". */
export const PEEL_FLAT = 9

/**
 * `thickness` is metres along the layer's own deformed normal, so a stack
 * stays registered on the roll. `side` picks the face: -1 mirrors the whole
 * deformation through the card plane, which is how the back's liner rolls
 * away from the print instead of through it.
 */
export function createPeelUniforms(thickness = 0, side: 1 | -1 = 1): PeelUniforms {
  return {
    uPeelAxis: { value: new THREE.Vector2(PEEL_AXIS.x, PEEL_AXIS.y) },
    uPeelFront: { value: PEEL_FLAT },
    uPeelRadius: { value: 0.02 },
    uPeelMaxTurn: { value: Math.PI },
    uPeelGrow: { value: 0 },
    uPeelSide: { value: side },
    uPeelThickness: { value: thickness },
  }
}

export function writePeel(u: PeelUniforms, state: PeelState): void {
  u.uPeelFront.value = state.front
  u.uPeelRadius.value = state.radius
  u.uPeelMaxTurn.value = state.maxTurn
  u.uPeelGrow.value = state.grow
}

/**
 * Declarations plus `lgPeel`. Needed verbatim by the vertex stage; the
 * fragment stage of a layer that wants the fold line takes
 * `PEEL_FRAGMENT_HEAD` instead, which shares the same uniforms.
 */
export const PEEL_VERTEX_HEAD = /* glsl */`
  uniform vec2 uPeelAxis;
  uniform float uPeelFront;
  uniform float uPeelRadius;
  uniform float uPeelMaxTurn;
  uniform float uPeelGrow;
  uniform float uPeelSide;
  uniform float uPeelThickness;
  varying vec2 vLgPlane;
  varying float vLgTurn;

  void lgPeel(in vec2 p, out vec3 pos, out vec3 nrm, out float turn) {
    float s = dot(p, uPeelAxis);
    float t = s - uPeelFront;
    turn = 0.0;
    float sOut = s;
    float zOut = 0.0;
    float rolled = uPeelRadius;
    if (t > 0.0 && uPeelRadius > 1e-5) {
      // Same quadratic as peelTurn(): the wrap angle that eats exactly t of
      // arc length, winding inward from an outer radius of uPeelRadius.
      float raw;
      if (uPeelGrow > 1e-9) {
        float disc = uPeelRadius * uPeelRadius - 2.0 * uPeelGrow * t;
        raw = disc <= 0.0
          ? uPeelRadius / uPeelGrow
          : (uPeelRadius - sqrt(disc)) / uPeelGrow;
      }
      else {
        raw = t / uPeelRadius;
      }
      turn = min(raw, uPeelMaxTurn);
      rolled = uPeelRadius - uPeelGrow * turn;
      float rest = t - (uPeelRadius * turn - 0.5 * uPeelGrow * turn * turn);
      sOut = uPeelFront + rolled * sin(turn) + rest * cos(turn);
      zOut = uPeelRadius - rolled * cos(turn) + rest * sin(turn);
    }
    // Perpendicular to the spiral tangent, not the circle's, and mirrored in
    // z by uPeelSide. Only the out-of-plane half flips: the in-plane part is
    // the same either way, which is what makes this an exact mirror rather
    // than a second, differently-behaved roll.
    float tanS = rolled * cos(turn) - uPeelGrow * sin(turn);
    float tanZ = rolled * sin(turn) + uPeelGrow * cos(turn);
    float tl = max(length(vec2(tanS, tanZ)), 1e-9);
    nrm = vec3(-uPeelAxis * (tanZ / tl), (tanS / tl) * uPeelSide);
    pos = vec3(p + uPeelAxis * (sOut - s), zOut * uPeelSide) + nrm * uPeelThickness;
  }
`

export const PEEL_FRAGMENT_HEAD = /* glsl */`
  uniform vec2 uPeelAxis;
  uniform float uPeelFront;
  varying vec2 vLgPlane;
  varying float vLgTurn;
`

/**
 * Patch a material's vertex stage to roll with `uniforms`, and hand the
 * fragment stage the plane coordinate and wrap angle it needs to shade the
 * result. Call before any material-specific fragment patch so the varyings
 * are declared by the time that patch reads them.
 */
export function patchPeelVertex(
  shader: { vertexShader: string, fragmentShader: string, uniforms: Record<string, unknown> },
  uniforms: PeelUniforms,
): void {
  Object.assign(shader.uniforms, uniforms)
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${PEEL_VERTEX_HEAD}`)
    // objectNormal has to be replaced here: <defaultnormal_vertex> further
    // down turns it into transformedNormal, and that is what every lighting
    // term uses. A rolled surface lit by its flat normal is a flat surface.
    .replace('#include <beginnormal_vertex>', /* glsl */`
      #include <beginnormal_vertex>
      vec3 lgRollPos;
      vec3 lgRollNrm;
      float lgRollTurn;
      lgPeel(position.xy, lgRollPos, lgRollNrm, lgRollTurn);
      objectNormal = lgRollNrm;
      vLgPlane = position.xy;
      vLgTurn = lgRollTurn;
    `)
    .replace('#include <begin_vertex>', /* glsl */`
      #include <begin_vertex>
      transformed = lgRollPos;
    `)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${PEEL_FRAGMENT_HEAD}`)
}
