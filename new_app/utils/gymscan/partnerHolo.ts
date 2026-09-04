// Partner CTA hologram: the floor's triangle read, at button scale.
//
// Same contract as hologram.ts / hologramColor.ts. A fixed triangulation of
// the pill is the mesh; a splash expanding from the pointer is the travelling
// front (lime core, cool-white wake, face fill that latches then dies); the
// cursor probe is the local reconstruction patch. Lime is the front and the
// hottest probe only. The settled mesh is the room's cool white, so a hover
// cannot green the door.
//
// Pure, and allocation-free on the hot path (`lightPartnerMesh` writes into
// caller-owned buffers), so the choreography is unit-testable and the canvas
// loop does not allocate.

import { CORE_RGB, WIRE_RGB } from './hologramColor.ts'
import { splashTravel } from './hologramPass.ts'

/** Lattice pitch, CSS px. Dense enough that a 48 px pill is a mesh, not a few tiles. */
export const PARTNER_CELL = 9
/** Lime ring thickness, CSS px. */
export const PARTNER_CORE = 6.2
/** Wake behind the splash front, CSS px. Short so the interior is not a filled disc. */
export const PARTNER_WAKE = 16
/** Cursor reconstruction blob, CSS px. */
export const PARTNER_PROBE_R = 34
export const PARTNER_PROBE_INNER = 0.22
/** Seconds the splash takes to cover the pill. Same kick family as the floor. */
export const PARTNER_SPLASH_S = 0.52
/** Radial scatter on the splash, CSS px. Stops the front reading as a ring. */
export const PARTNER_CHAOS = 7.5
/** Heat half-life setter, 1/s. A face fill latches the wake then seats to wire. */
export const PARTNER_HEAT_RATE = 4.2
/** Machine-style horizontal band half-width, CSS px. */
export const PARTNER_BAND = 5.5
export const PARTNER_DRAW_EPS = 0.018

export type PartnerMesh = {
  w: number
  h: number
  /** 6 floats per triangle: ax ay bx by cx cy */
  verts: Float32Array
  cx: Float32Array
  cy: Float32Array
  delay: Float32Array
  count: number
}

export type PartnerHoloState = {
  originX: number
  originY: number
  cursorX: number
  cursorY: number
  velX: number
  velY: number
  splashR: number
  hover: number
  probe: number
}

export type PartnerTriField = {
  core: number
  halo: number
  trail: number
  seen: number
  probe: number
  probeInner: number
  band: number
}

export type PartnerHoloDraw = {
  /** RGBA 0..1, pre-sized to count * 4 */
  fill: Float32Array
  wire: Float32Array
  /** 0..1 lime-front amount, used as a vertex lift. */
  core: Float32Array
}

function hash2(i: number, j: number): number {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** Stadium SDF test. `pad` grows (or shrinks) the pill, CSS px. */
export function inStadium(
  x: number,
  y: number,
  w: number,
  h: number,
  pad = 0,
): boolean {
  const inner = Math.min(w, h) * 0.5
  const r = inner + pad
  if (r <= 0) return false
  const cx = x < inner ? inner : x > w - inner ? w - inner : x
  const cy = h * 0.5
  return Math.hypot(x - cx, y - cy) <= r
}

export function partnerSplashMaxR(
  originX: number,
  originY: number,
  w: number,
  h: number,
): number {
  return Math.max(
    Math.hypot(originX, originY),
    Math.hypot(w - originX, originY),
    Math.hypot(originX, h - originY),
    Math.hypot(w - originX, h - originY),
  )
}

export function partnerSplashR(u: number, maxR: number): number {
  return maxR * splashTravel(u)
}

export function buildPartnerMesh(w: number, h: number): PartnerMesh {
  const width = Math.max(1, w)
  const height = Math.max(1, h)
  const cols = Math.max(5, Math.round(width / PARTNER_CELL))
  const rows = Math.max(3, Math.round(height / (PARTNER_CELL * 0.82)))
  const nx = cols + 1
  const ny = rows + 1
  const xs = new Float32Array(nx * ny)
  const ys = new Float32Array(nx * ny)

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const pinX = i === 0 || i === cols
      const pinY = j === 0 || j === rows
      const jitterX = pinX ? 0 : (hash2(i + 1, j + 3) - 0.5) * (width / cols) * 0.34
      const jitterY = pinY ? 0 : (hash2(j + 7, i + 11) - 0.5) * (height / rows) * 0.30
      xs[j * nx + i] = (i / cols) * width + jitterX
      ys[j * nx + i] = (j / rows) * height + jitterY
    }
  }

  const verts: number[] = []
  const cxs: number[] = []
  const cys: number[] = []
  const delays: number[] = []

  const emit = (
    ai: number, aj: number,
    bi: number, bj: number,
    ci: number, cj: number,
  ) => {
    const ax = xs[aj * nx + ai]!
    const ay = ys[aj * nx + ai]!
    const bx = xs[bj * nx + bi]!
    const by = ys[bj * nx + bi]!
    const cx = xs[cj * nx + ci]!
    const cy = ys[cj * nx + ci]!
    const mx = (ax + bx + cx) / 3
    const my = (ay + by + cy) / 3
    if (!inStadium(mx, my, width, height, 1.4)) return
    verts.push(ax, ay, bx, by, cx, cy)
    cxs.push(mx)
    cys.push(my)
    delays.push((hash2(ai + 19, aj + 5) - 0.5) * PARTNER_CHAOS)
  }

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if ((i + j) % 2 === 0) {
        emit(i, j, i + 1, j, i + 1, j + 1)
        emit(i, j, i + 1, j + 1, i, j + 1)
      }
      else {
        emit(i, j, i + 1, j, i, j + 1)
        emit(i + 1, j, i + 1, j + 1, i, j + 1)
      }
    }
  }

  const count = cxs.length
  return {
    w: width,
    h: height,
    verts: new Float32Array(verts),
    cx: new Float32Array(cxs),
    cy: new Float32Array(cys),
    delay: new Float32Array(delays),
    count,
  }
}

export function createPartnerDraw(count: number): PartnerHoloDraw {
  return {
    fill: new Float32Array(count * 4),
    wire: new Float32Array(count * 4),
    core: new Float32Array(count),
  }
}

function probeDist(
  dx: number,
  dy: number,
  velX: number,
  velY: number,
): number {
  const speed = Math.hypot(velX, velY)
  if (speed < 8) return Math.hypot(dx, dy)
  const ux = velX / speed
  const uy = velY / speed
  const along = dx * ux + dy * uy
  const across = dx * -uy + dy * ux
  const stretch = 1 + Math.min(speed * 0.012, 0.95)
  return Math.hypot(along / stretch, across)
}

function probeFalloff(dist: number, radius: number): number {
  const inner = radius * PARTNER_PROBE_INNER
  if (dist <= inner) return 1
  if (dist >= radius) return 0
  const t = (dist - inner) / Math.max(radius - inner, 1e-6)
  return 1 - t * t * (3 - 2 * t)
}

export function writePartnerTriField(
  x: number,
  y: number,
  delay: number,
  state: PartnerHoloState,
  out: PartnerTriField,
): PartnerTriField {
  const hover = state.hover
  if (hover <= 0.001) {
    out.core = 0
    out.halo = 0
    out.trail = 0
    out.seen = 0
    out.probe = 0
    out.probeInner = 0
    out.band = 0
    return out
  }

  const d = Math.hypot(x - state.originX, y - state.originY) - state.splashR - delay
  out.core = Math.exp(-Math.abs(d) / PARTNER_CORE) * hover
  out.halo = Math.exp(-Math.abs(d) / (PARTNER_CORE * 2.4)) * hover
  out.trail = d < 0 ? Math.exp(d / PARTNER_WAKE) * hover : 0
  out.seen = d < PARTNER_CORE * 0.35 ? hover : 0

  const live = hover * state.probe
  const pDist = probeDist(
    x - state.cursorX,
    y - state.cursorY,
    state.velX,
    state.velY,
  )
  out.probe = probeFalloff(pDist, PARTNER_PROBE_R) * live
  out.probeInner = probeFalloff(pDist, PARTNER_PROBE_R * 0.42) * live
  out.band = Math.exp(-Math.abs(y - state.cursorY) / PARTNER_BAND) * live
  return out
}

export function partnerTriField(
  x: number,
  y: number,
  delay: number,
  state: PartnerHoloState,
): PartnerTriField {
  return writePartnerTriField(x, y, delay, state, {
    core: 0, halo: 0, trail: 0, seen: 0, probe: 0, probeInner: 0, band: 0,
  })
}

export function stepPartnerHeat(heat: number, incoming: number, dt: number): number {
  const next = heat * Math.exp(-Math.max(dt, 0) * PARTNER_HEAT_RATE)
  return incoming > next ? incoming : next
}

export function partnerIncoming(field: PartnerTriField): number {
  const a = field.trail
  const b = field.probe * 0.92
  const c = field.band * 0.40
  return a > b ? (a > c ? a : c) : (b > c ? b : c)
}

/**
 * Face fill + wire colour for one triangle. RGB is the mixed hologram colour
 * (cool white * gray + lime * core); A is how much of it to put down.
 */
export type PartnerTriShade = {
  fillR: number
  fillG: number
  fillB: number
  fillA: number
  wireR: number
  wireG: number
  wireB: number
  wireA: number
}

export function writePartnerTriShade(
  field: PartnerTriField,
  heat: number,
  out: PartnerTriShade,
): PartnerTriShade {
  const gray = field.trail * 0.52
    + heat * 0.28
    + field.seen * 0.13
    + field.probe * 0.42
    + field.band * 0.10
  const lime = field.core * 1.0
    + field.halo * 0.20
    + field.probeInner * 0.72
    + field.band * 0.48

  const fillGray = field.trail * 0.22
    + heat * 0.46
    + field.probe * 0.36
  const fillLime = field.core * 0.38
    + field.probeInner * 0.40
    + field.band * 0.18

  out.fillA = Math.min(1, fillGray * 1.05 + fillLime * 1.15)
  out.wireA = Math.min(1, gray * 0.92 + lime)
  out.fillR = WIRE_RGB[0] * fillGray + CORE_RGB[0] * fillLime
  out.fillG = WIRE_RGB[1] * fillGray + CORE_RGB[1] * fillLime
  out.fillB = WIRE_RGB[2] * fillGray + CORE_RGB[2] * fillLime
  out.wireR = WIRE_RGB[0] * gray + CORE_RGB[0] * lime
  out.wireG = WIRE_RGB[1] * gray + CORE_RGB[1] * lime
  out.wireB = WIRE_RGB[2] * gray + CORE_RGB[2] * lime
  return out
}

export function partnerTriShade(
  field: PartnerTriField,
  heat: number,
): PartnerTriShade {
  return writePartnerTriShade(field, heat, {
    fillR: 0, fillG: 0, fillB: 0, fillA: 0,
    wireR: 0, wireG: 0, wireB: 0, wireA: 0,
  })
}

const LIGHT_FIELD: PartnerTriField = {
  core: 0, halo: 0, trail: 0, seen: 0, probe: 0, probeInner: 0, band: 0,
}
const LIGHT_SHADE: PartnerTriShade = {
  fillR: 0, fillG: 0, fillB: 0, fillA: 0,
  wireR: 0, wireG: 0, wireB: 0, wireA: 0,
}

export function lightPartnerMesh(
  mesh: PartnerMesh,
  heat: Float32Array,
  state: PartnerHoloState,
  dt: number,
  out: PartnerHoloDraw,
): void {
  const n = mesh.count
  const field = LIGHT_FIELD
  const shade = LIGHT_SHADE
  for (let i = 0; i < n; i++) {
    writePartnerTriField(mesh.cx[i]!, mesh.cy[i]!, mesh.delay[i]!, state, field)
    const h = stepPartnerHeat(heat[i]!, partnerIncoming(field), dt)
    heat[i] = h
    writePartnerTriShade(field, h, shade)
    const o = i * 4
    out.fill[o] = shade.fillR
    out.fill[o + 1] = shade.fillG
    out.fill[o + 2] = shade.fillB
    out.fill[o + 3] = shade.fillA
    out.wire[o] = shade.wireR
    out.wire[o + 1] = shade.wireG
    out.wire[o + 2] = shade.wireB
    out.wire[o + 3] = shade.wireA
    out.core[i] = field.core + field.probeInner * 0.55
  }
}
