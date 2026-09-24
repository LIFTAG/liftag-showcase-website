// 05 · On the map, seen from low orbit. A pinhole camera over a unit Earth is
// aimed at Slovakia and backed off until the country fills its frame, so the
// rest of Europe falls away to a curved horizon behind it. Pure math, shared
// by the canvas painter, the DOM pins and the tests.
import { discoveryGyms, discoveryHub, type DiscoveryGym } from './discoveryGyms.ts'

export type Vec3 = [number, number, number]
export type OrbitPoint = { x: number; y: number; depth: number; facing: number }

const DEG = Math.PI / 180
export const ORBIT_FOV = 38
/** Height of a pin head above the ground, in Earth radii (~15 km). */
export const ORBIT_PIN_LIFT = 0.0024

/** The land mask asset: 8-bit grey, 0 sea, 128 land, 255 Slovakia. */
export const ORBIT_MASK = {
  src: '/assets/gym3d/europe-land.png',
  west: -30,
  north: 82,
  step: 0.05,
  cols: 2000,
  rows: 1140,
} as const

/** Where the camera aims: Slovakia's middle. */
export const SLOVAKIA = { lat: 48.68, lon: 19.7 }

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const unit = (a: Vec3) => scale(a, 1 / Math.hypot(a[0], a[1], a[2]))

export function geo(lat: number, lon: number, radius = 1): Vec3 {
  const phi = lat * DEG
  const lambda = lon * DEG
  return [
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda),
  ]
}

/** Local east/north/up at a point on the unit sphere. */
function tangent(lat: number, lon: number) {
  const up = geo(lat, lon)
  const east: Vec3 = [-Math.sin(lon * DEG), 0, -Math.cos(lon * DEG)]
  return { up, east, north: cross(up, east) }
}

/** The box Slovakia has to fill, in the stage's own pixels. */
export function orbitFrame(width: number, height: number) {
  if (width <= 760) return { x: width * 0.07, y: height * 0.34, w: width * 0.86, h: height * 0.3 }
  // Right of the copy, low enough to leave sky for the horizon above it and
  // high enough to leave the listing card the band below; narrower screens
  // have a proportionally taller card, so Slovakia rides higher.
  const x = width * 0.45
  const y = width <= 1100 ? 0.27 : 0.3
  return { x, y: height * y, w: width * 0.93 - x, h: height * (width <= 1100 ? 0.24 : 0.28) }
}

/**
 * Where the crane is. `heading` is the compass direction the camera looks,
 * `tilt` its elevation above Slovakia's horizon, `zoom` a multiple of the
 * distance that exactly frames the country.
 */
export type OrbitShot = { heading: number; tilt: number; roll: number; zoom: number }

const SETTLED: OrbitShot = { heading: 14, tilt: 21, roll: 0, zoom: 1 }
/** High enough (~1,700 km) that Europe shows as a curved limb before the descent. */
const APPROACH: OrbitShot = { heading: 0, tilt: 24, roll: -6, zoom: 4 }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** `entry` 0→1 settles from a high approach; `drift` −1…1 follows the scroll. */
export function orbitShot(entry: number, drift = 0): OrbitShot {
  const t = Math.min(1, Math.max(0, entry))
  return {
    heading: lerp(APPROACH.heading, SETTLED.heading, t) + drift * 4,
    tilt: lerp(APPROACH.tilt, SETTLED.tilt, t) - drift * 2,
    roll: lerp(APPROACH.roll, SETTLED.roll, t),
    // Geometric, so the descent reads as one steady dolly rather than a plunge.
    zoom: APPROACH.zoom ** (1 - t) * SETTLED.zoom ** t,
  }
}

export type OrbitCamera = {
  eye: Vec3
  fwd: Vec3
  right: Vec3
  up: Vec3
  focal: number
  /** Principal point, where the aim point lands; set so Slovakia is centred in its frame. */
  px: number
  py: number
  width: number
  height: number
}

/**
 * Slovakia's border, Natural Earth 1:50m simplified to ~5 km, as [lon, lat].
 * The camera fits this rather than the bounding box, whose corners fall in
 * Hungary, Poland and Ukraine.
 */
export const SLOVAKIA_OUTLINE: readonly (readonly [number, number])[] = [
  [22.54, 49.07], [22.14, 48.57], [22.11, 48.39], [21.72, 48.35], [21.45, 48.55], [20.49, 48.53],
  [20.33, 48.3], [19.95, 48.15], [19.56, 48.21], [19.47, 48.11], [18.79, 48], [18.72, 47.79],
  [18.15, 47.76], [17.76, 47.77], [17.15, 48.01], [16.87, 48.39], [17.14, 48.84], [17.76, 48.89],
  [18.09, 49.07], [18.16, 49.26], [18.6, 49.49], [18.94, 49.5], [18.97, 49.4], [19.15, 49.4],
  [19.44, 49.6], [19.63, 49.41], [19.77, 49.37], [19.8, 49.19], [20.06, 49.18], [20.16, 49.32],
  [20.36, 49.39], [20.95, 49.32], [21.08, 49.42], [21.35, 49.43], [21.89, 49.34], [22.02, 49.21],
]
const FIT_SAMPLES = SLOVAKIA_OUTLINE.map(([lon, lat]) => geo(lat, lon))

function place(shot: OrbitShot, distance: number, focal: number, px: number, py: number, width: number, height: number): OrbitCamera {
  const { up: n, east, north } = tangent(SLOVAKIA.lat, SLOVAKIA.lon)
  const h = shot.heading * DEG
  const e = shot.tilt * DEG
  const look = add(scale(north, Math.cos(h)), scale(east, Math.sin(h)))
  const back = add(scale(look, -Math.cos(e)), scale(n, Math.sin(e)))
  const eye = add(n, scale(back, distance))
  const fwd = scale(back, -1)
  const r0 = unit(cross(fwd, n))
  const u0 = cross(r0, fwd)
  const c = Math.cos(shot.roll * DEG)
  const s = Math.sin(shot.roll * DEG)
  return {
    eye,
    fwd,
    right: add(scale(r0, c), scale(u0, s)),
    up: add(scale(u0, c), scale(r0, -s)),
    focal,
    px,
    py,
    width,
    height,
  }
}

export function orbitCamera(width: number, height: number, shot: OrbitShot = SETTLED): OrbitCamera {
  const frame = orbitFrame(width, height)
  const focal = height / 2 / Math.tan((ORBIT_FOV * DEG) / 2)
  let px = frame.x + frame.w / 2
  let py = frame.y + frame.h / 2
  // Apparent size goes as 1/distance, so a few rescales converge on the fit;
  // the nearer end looms larger, so the outline is recentred as well.
  let distance = 0.1
  for (let i = 0; i < 6; i++) {
    const cam = place(shot, distance, focal, px, py, width, height)
    let x0 = Infinity
    let x1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    for (const p of FIT_SAMPLES) {
      const q = orbitProject(cam, p)
      if (!q) continue
      x0 = Math.min(x0, q.x)
      x1 = Math.max(x1, q.x)
      y0 = Math.min(y0, q.y)
      y1 = Math.max(y1, q.y)
    }
    if (x1 < x0) break
    px += frame.x + frame.w / 2 - (x0 + x1) / 2
    py += frame.y + frame.h / 2 - (y0 + y1) / 2
    distance *= Math.max((x1 - x0) / frame.w, (y1 - y0) / frame.h)
  }
  return place(shot, distance * shot.zoom, focal, px, py, width, height)
}

export function orbitProject(cam: OrbitCamera, p: Vec3): OrbitPoint | null {
  const v: Vec3 = [p[0] - cam.eye[0], p[1] - cam.eye[1], p[2] - cam.eye[2]]
  const depth = dot(v, cam.fwd)
  if (depth < 1e-5) return null
  const length = Math.hypot(v[0], v[1], v[2])
  const r = Math.hypot(p[0], p[1], p[2])
  return {
    x: cam.px + (cam.focal * dot(v, cam.right)) / depth,
    y: cam.py - (cam.focal * dot(v, cam.up)) / depth,
    depth,
    // Cosine between the ground normal and the ray back to the eye.
    facing: -dot(v, p) / (length * r),
  }
}

export function orbitGym(cam: OrbitCamera, gym: Pick<DiscoveryGym, 'latitude' | 'longitude'>) {
  return {
    base: orbitProject(cam, geo(gym.latitude, gym.longitude)),
    head: orbitProject(cam, geo(gym.latitude, gym.longitude, 1 + ORBIT_PIN_LIFT)),
  }
}

/**
 * The limb: every ground point whose sight line just grazes the sphere, a
 * circle around the eye's nadir. Returned front-first, so the part in view is
 * one unbroken run.
 */
export function orbitHorizon(cam: OrbitCamera, steps = 240) {
  const distance = Math.hypot(...cam.eye)
  const c = scale(cam.eye, 1 / distance)
  const cos = 1 / distance
  const sin = Math.sqrt(1 - cos * cos)
  // `a` starts where the limb crosses the view direction.
  const a0 = unit(add(cam.fwd, scale(c, -dot(cam.fwd, c))))
  const b0 = cross(c, a0)
  const points: { x: number; y: number }[] = []
  for (let i = -steps / 2; i <= steps / 2; i++) {
    const t = (i / steps) * Math.PI * 2
    const q = add(scale(c, cos), add(scale(a0, sin * Math.cos(t)), scale(b0, sin * Math.sin(t))))
    const v: Vec3 = [q[0] - cam.eye[0], q[1] - cam.eye[1], q[2] - cam.eye[2]]
    const depth = dot(v, cam.fwd)
    if (depth < 1e-3) continue
    points.push({
      x: cam.px + (cam.focal * dot(v, cam.right)) / depth,
      y: cam.py - (cam.focal * dot(v, cam.up)) / depth,
    })
  }
  return points
}

/** A great-circle route lifted off the ground in proportion to its length. */
export function orbitArc(cam: OrbitCamera, from: DiscoveryGym, to: DiscoveryGym, samples = 36) {
  const a = geo(from.latitude, from.longitude)
  const b = geo(to.latitude, to.longitude)
  const angle = Math.acos(Math.min(1, dot(a, b)))
  const lift = angle * 0.22
  const sinAngle = Math.sin(angle) || 1
  let d = ''
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const wa = Math.sin((1 - t) * angle) / sinAngle
    const wb = Math.sin(t * angle) / sinAngle
    const p = scale(add(scale(a, wa), scale(b, wb)), 1 + lift * Math.sin(Math.PI * t))
    const q = orbitProject(cam, p)
    if (!q) continue
    d += `${d ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`
  }
  return d
}

/** One route from the hub to each other city. */
export const orbitRoutes: DiscoveryGym[] = (() => {
  const seen = new Set<string>([discoveryHub.city])
  return discoveryGyms.filter((gym) => {
    if (seen.has(gym.city)) return false
    seen.add(gym.city)
    return true
  })
})()

/**
 * One pin per city, hub first. Two gyms a few kilometres apart would stack
 * their hit targets, so a city's other gyms are drawn as ground dots instead.
 */
export const orbitCities: DiscoveryGym[] = [discoveryHub, ...orbitRoutes]
export const orbitExtras: DiscoveryGym[] = discoveryGyms.filter((gym) => !orbitCities.includes(gym))
