// Paints the orbital map: a dot grid laid on the sphere (so rows recede to
// the horizon in true perspective), thinned by distance, under a lime limb.
import {
  ORBIT_MASK,
  SLOVAKIA,
  geo,
  orbitHorizon,
  type OrbitCamera,
} from './orbitMap.ts'
import { discoveryHub } from './discoveryGyms.ts'

const DEG = Math.PI / 180
/** Base spacing of the ground grid, in degrees of latitude (~5.6 km). */
const STEP = 0.05
/** Coarsest detail level: every 32nd row and column. */
const LEVELS = 5
const BLOCK = 1 << LEVELS
/** Ground this close to edge-on is haze; nothing is drawn there. */
const FACING_MIN = 0.015
/** Slovakia keeps a grid this many levels finer, so it reads as a lit patch. */
const HOME_FINER = 0.7

export type OrbitDots = {
  count: number
  xyz: Float32Array
  /** Bits 0–2: detail level. Bit 3: inside Slovakia. */
  meta: Uint8Array
  /** Angle from Bratislava, for the reveal wave. */
  hub: Float32Array
}

export type OrbitMask = Uint8Array

/** Read the land mask's grey channel. */
export function readOrbitMask(image: CanvasImageSource): OrbitMask | null {
  const canvas = document.createElement('canvas')
  canvas.width = ORBIT_MASK.cols
  canvas.height = ORBIT_MASK.rows
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, 0, 0)
  const rgba = ctx.getImageData(0, 0, ORBIT_MASK.cols, ORBIT_MASK.rows).data
  const out = new Uint8Array(ORBIT_MASK.cols * ORBIT_MASK.rows)
  for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4]!
  return out
}

/** 0 sea, 1 land, 2 Slovakia. Thresholds leave room for canvas read noise. */
function sample(mask: OrbitMask, lat: number, lon: number) {
  const col = Math.floor((lon - ORBIT_MASK.west) / ORBIT_MASK.step)
  const row = Math.floor((ORBIT_MASK.north - lat) / ORBIT_MASK.step)
  if (col < 0 || row < 0 || col >= ORBIT_MASK.cols || row >= ORBIT_MASK.rows) return 0
  const v = mask[row * ORBIT_MASK.cols + col]!
  return v > 192 ? 2 : v > 64 ? 1 : 0
}

/**
 * On-screen spacing of the base grid. Rows close up as the ground tilts away;
 * only thin them once they are crushed, not for ordinary perspective.
 */
const gridPx = (size: number, facing: number) => size * Math.sqrt(Math.min(1, facing * 1.8))

const trailing = (n: number) => (n === 0 ? LEVELS : Math.min(LEVELS, 31 - Math.clz32(n & -n)))

/**
 * Detail level a ground point needs at this camera before it would crowd, or
 * Infinity when the camera cannot see it. `pad` is how far off-frame counts.
 */
function levelNeed(cam: OrbitCamera, x: number, y: number, z: number, spacing: number, pad: number) {
  const vx = x - cam.eye[0]
  const vy = y - cam.eye[1]
  const vz = z - cam.eye[2]
  const length = Math.sqrt(vx * vx + vy * vy + vz * vz)
  const facing = -(vx * x + vy * y + vz * z) / length
  if (facing <= FACING_MIN) return Infinity
  const depth = vx * cam.fwd[0] + vy * cam.fwd[1] + vz * cam.fwd[2]
  if (depth <= 0) return Infinity
  const sx = cam.px + (cam.focal * (vx * cam.right[0] + vy * cam.right[1] + vz * cam.right[2])) / depth
  if (sx < -pad || sx > cam.width + pad) return Infinity
  const sy = cam.py - (cam.focal * (vx * cam.up[0] + vy * cam.up[1] + vz * cam.up[2])) / depth
  if (sy < -pad || sy > cam.height + pad) return Infinity
  return Math.log2(spacing / gridPx((STEP * DEG * cam.focal) / length, facing))
}

function needAcross(cams: OrbitCamera[], p: readonly number[], spacing: number, pad: number) {
  let need = Infinity
  for (const cam of cams) need = Math.min(need, levelNeed(cam, p[0]!, p[1]!, p[2]!, spacing, pad))
  return need
}

/**
 * Lay the grid over the mask, keeping only the points one of `cams` (samples
 * along the flight) would draw. Blocks of 32×32 are judged by their corners
 * first, so the far field never visits its fine rows. Yields after each band
 * of blocks, so the caller can spread the work over frames.
 */
export function* orbitDotsJob(mask: OrbitMask, cams: OrbitCamera[], spacing: number): Generator<void, OrbitDots> {
  const south = ORBIT_MASK.north - ORBIT_MASK.rows * ORBIT_MASK.step
  const rows = Math.floor((ORBIT_MASK.rows * ORBIT_MASK.step) / STEP)
  const east = ORBIT_MASK.west + ORBIT_MASK.cols * ORBIT_MASK.step
  const hub = geo(discoveryHub.latitude, discoveryHub.longitude)
  const blockPad = Math.max(...cams.map((cam) => cam.width)) * 0.5
  const xyz: number[] = []
  const meta: number[] = []
  const hubAngle: number[] = []
  for (let i0 = 0; i0 < rows; i0 += BLOCK) {
    const midLat = south + (i0 + BLOCK / 2) * STEP
    const midStep = STEP / Math.cos(midLat * DEG)
    const blockCols = Math.ceil((east - ORBIT_MASK.west) / midStep)
    for (let j0 = 0; j0 < blockCols; j0 += BLOCK) {
      let blockNeed = Infinity
      for (const [di, dj] of [[0.5, 0.5], [0, 0], [0, 1], [1, 0], [1, 1]] as const) {
        const p = geo(south + (i0 + di * BLOCK) * STEP, ORBIT_MASK.west + (j0 + dj * BLOCK) * midStep)
        blockNeed = Math.min(blockNeed, needAcross(cams, p, spacing, blockPad))
      }
      if (blockNeed === Infinity) continue
      // Slovakia runs 0.7 of a level finer; leave room for it and the corners.
      const floor = Math.max(0, Math.floor(blockNeed - 1.2))
      const stride = 1 << floor
      for (let i = i0; i < Math.min(rows, i0 + BLOCK); i += stride) {
        const lat = south + i * STEP
        const lonStep = STEP / Math.cos(lat * DEG)
        const ti = trailing(i)
        for (let j = j0; j < j0 + BLOCK; j += stride) {
          const lon = ORBIT_MASK.west + j * lonStep
          if (lon >= east) break
          const level = Math.min(ti, trailing(j))
          if (level < floor) continue
          const kind = sample(mask, lat, lon)
          if (!kind) continue
          const p = geo(lat, lon)
          const finer = kind === 2 ? HOME_FINER : 0
          if (!cams.some((cam) => level - levelNeed(cam, p[0], p[1], p[2], spacing, 24) + finer > -0.2)) continue
          xyz.push(p[0], p[1], p[2])
          meta.push(level | (kind === 2 ? 8 : 0))
          hubAngle.push(Math.acos(Math.min(1, p[0] * hub[0] + p[1] * hub[1] + p[2] * hub[2])))
        }
      }
    }
    yield
  }
  return {
    count: meta.length,
    xyz: new Float32Array(xyz),
    meta: new Uint8Array(meta),
    hub: new Float32Array(hubAngle),
  }
}

export function buildOrbitDots(mask: OrbitMask, cams: OrbitCamera[], spacing: number) {
  const job = orbitDotsJob(mask, cams, spacing)
  for (;;) {
    const step = job.next()
    if (step.done) return step.value
  }
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export type OrbitPaint = {
  /** Reveal front, as an angle from Bratislava; Infinity shows everything. */
  reveal: number
  /** 0→1 fade of the limb and haze. */
  sky: number
  spacing: number
}

/** Cosines of ~830 km and ~95 km from Slovakia's middle: the lit neighbourhood. */
const NEAR_FAR = Math.cos(0.13)
const NEAR_IN = Math.cos(0.015)
const ALPHA_STEPS = 24
const LAND = '231,238,232'
const HOME = '204,255,0'

export function paintOrbit(ctx: CanvasRenderingContext2D, cam: OrbitCamera, dots: OrbitDots, o: OrbitPaint) {
  const { width, height } = cam
  ctx.clearRect(0, 0, width, height)
  const limb = orbitHorizon(cam)
  if (limb.length > 1 && o.sky > 0) paintSky(ctx, limb, width, height, o.sky)

  const target = geo(SLOVAKIA.lat, SLOVAKIA.lon)
  const { eye, fwd, right, up, focal, px, py } = cam
  const world = STEP * DEG * focal
  // One path per colour × alpha step; dots under ~1.8 px across are squares,
  // which read the same at that size and cost half as much to build.
  const buckets: (Path2D | undefined)[] = []
  const { xyz, meta, hub } = dots
  for (let k = 0; k < dots.count; k++) {
    const angle = hub[k]!
    if (angle > o.reveal) continue
    const x = xyz[k * 3]!
    const y = xyz[k * 3 + 1]!
    const z = xyz[k * 3 + 2]!
    const vx = x - eye[0]
    const vy = y - eye[1]
    const vz = z - eye[2]
    const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2]
    if (depth <= 0) continue
    const length = Math.sqrt(vx * vx + vy * vy + vz * vz)
    const facing = -(vx * x + vy * y + vz * z) / length
    if (facing <= FACING_MIN) continue
    const sx = px + (focal * (vx * right[0] + vy * right[1] + vz * right[2])) / depth
    const sy = py - (focal * (vx * up[0] + vy * up[1] + vz * up[2])) / depth
    if (sx < -3 || sx > width + 3 || sy < -3 || sy > height + 3) continue
    const size = world / length
    const m = meta[k]!
    const home = (m & 8) !== 0
    const need = Math.log2(o.spacing / gridPx(size, facing)) - (home ? HOME_FINER : 0)
    const over = (m & 7) - need
    if (over <= 0) continue
    const near = smooth(NEAR_FAR, NEAR_IN, x * target[0] + y * target[1] + z * target[2])
    let alpha = home
      ? 0.9
      : (0.2 + 0.14 * near) * smooth(0.01, 0.24, facing)
    alpha *= Math.min(1, over)
    const edge = o.reveal - angle
    if (edge < 0.012) alpha = Math.min(1, alpha * (1 + 2.2 * (1 - edge / 0.012)))
    const q = Math.round(alpha * ALPHA_STEPS)
    if (q <= 0) continue
    const r = Math.min(home ? 1.55 : 1.35, Math.max(home ? 0.95 : 0.5, size * 0.17))
    const key = (home ? ALPHA_STEPS + 1 : 0) + q
    const path = (buckets[key] ??= new Path2D())
    if (r < 0.9) {
      path.rect(sx - r, sy - r, r * 2, r * 2)
    } else {
      path.moveTo(sx + r, sy)
      path.arc(sx, sy, r, 0, Math.PI * 2)
    }
  }
  buckets.forEach((path, key) => {
    if (!path) return
    const home = key > ALPHA_STEPS
    const q = home ? key - ALPHA_STEPS - 1 : key
    ctx.fillStyle = `rgba(${home ? HOME : LAND},${(q / ALPHA_STEPS).toFixed(3)})`
    ctx.fill(path)
  })
  if (limb.length > 1 && o.sky > 0) paintLimb(ctx, limb, o.sky)
}

function limbPath(limb: { x: number; y: number }[]) {
  const path = new Path2D()
  limb.forEach((p, i) => (i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)))
  return path
}

/** Faint body under the dots, and haze standing off the limb into space. */
function paintSky(ctx: CanvasRenderingContext2D, limb: { x: number; y: number }[], width: number, height: number, sky: number) {
  const top = Math.min(...limb.map((p) => p.y))
  const body = limbPath(limb)
  const last = limb[limb.length - 1]!
  const first = limb[0]!
  body.lineTo(last.x > first.x ? width * 4 : -width * 3, height * 4)
  body.lineTo(last.x > first.x ? -width * 3 : width * 4, height * 4)
  body.closePath()
  const fill = ctx.createLinearGradient(0, top, 0, top + height * 0.5)
  fill.addColorStop(0, `rgba(22,34,22,${0.55 * sky})`)
  fill.addColorStop(1, 'rgba(10,15,11,0)')
  ctx.fillStyle = fill
  ctx.fill(body)
  ctx.save()
  ctx.lineJoin = 'round'
  const haze = limbPath(limb)
  for (const [w, a] of [[90, 0.025], [44, 0.04], [18, 0.06]] as const) {
    ctx.lineWidth = w
    ctx.strokeStyle = `rgba(186,236,64,${a * sky})`
    ctx.stroke(haze)
  }
  ctx.restore()
}

function paintLimb(ctx: CanvasRenderingContext2D, limb: { x: number; y: number }[], sky: number) {
  ctx.save()
  ctx.lineJoin = 'round'
  const path = limbPath(limb)
  ctx.lineWidth = 4
  ctx.strokeStyle = `rgba(204,255,0,${0.14 * sky})`
  ctx.stroke(path)
  ctx.lineWidth = 1.25
  ctx.strokeStyle = `rgba(222,255,120,${0.75 * sky})`
  ctx.stroke(path)
  ctx.restore()
}
