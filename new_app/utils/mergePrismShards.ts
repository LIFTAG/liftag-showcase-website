/**
 * Convex clip + scroll-reversible pose for the merge-crystal shatter.
 *
 * The charged gem is the intersection of two origin-centered octahedra.
 * Each leftover face plus the origin is one pyramidal shard. Pose is a
 * pure function of `crack` so scrubbing the section puts the gem back
 * together. The implicit raytrace is unchanged; this only exists after
 * the bang.
 */

export type Vec3 = [number, number, number]

export type ShardFace = {
  verts: Vec3[]
  normal: Vec3
}

export type PosedShard = {
  verts: Vec3[]
  apex: Vec3
  normal: Vec3
  fade: number
}

export const SHARD_STAGGER = 0.06
export const SHARD_STAGGER_SPAN = 0.94
export const SHARD_FLY_DIST = 0.9
export const SHARD_TANGENTIAL = 0.15
export const SHARD_AREA_EPS = 1e-6
export const SHARD_FLOATS_PER_VERT = 6
export const SHARD_MAX_VERTS = 768

const CLIP_EPS = 1e-5
const PLANE_MATCH = 0.999
const DEDUPE_DOT = 0.995

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function len(a: Vec3) {
  return Math.hypot(a[0], a[1], a[2])
}

function norm(a: Vec3): Vec3 {
  const l = len(a)
  if (l < 1e-8) return [0, 0, 1]
  return [a[0] / l, a[1] / l, a[2] / l]
}

function tangentFrame(n: Vec3): { t: Vec3; b: Vec3 } {
  const tmp: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const t = norm(cross(n, tmp))
  return { t, b: cross(n, t) }
}

type HalfSpace = { n: Vec3; s: number }

function halfSpaces(planes: ArrayLike<number>, slab: number): HalfSpace[] {
  const out: HalfSpace[] = []
  for (let i = 0; i < 4; i++) {
    const n: Vec3 = [planes[i * 3] ?? 0, planes[i * 3 + 1] ?? 0, planes[i * 3 + 2] ?? 0]
    const u = norm(n)
    out.push({ n: u, s: slab })
    out.push({ n: scale(u, -1), s: slab })
  }
  return out
}

function samePlane(a: HalfSpace, b: HalfSpace) {
  return dot(a.n, b.n) > PLANE_MATCH && Math.abs(a.s - b.s) < 1e-4
}

function planeIntersect(a: Vec3, b: Vec3, n: Vec3, s: number): Vec3 {
  const da = dot(n, a) - s
  const db = dot(n, b) - s
  const denom = da - db
  const t = Math.abs(denom) < 1e-10 ? 0.5 : da / denom
  return add(a, scale(sub(b, a), t))
}

function clipPoly(verts: Vec3[], n: Vec3, s: number): Vec3[] {
  if (verts.length === 0) return verts
  const out: Vec3[] = []
  let prev = verts[verts.length - 1]!
  let prevIn = dot(n, prev) <= s + CLIP_EPS
  for (let i = 0; i < verts.length; i++) {
    const curr = verts[i]!
    const currIn = dot(n, curr) <= s + CLIP_EPS
    if (currIn) {
      if (!prevIn) out.push(planeIntersect(prev, curr, n, s))
      out.push(curr)
    } else if (prevIn) {
      out.push(planeIntersect(prev, curr, n, s))
    }
    prev = curr
    prevIn = currIn
  }
  return out
}

function signedArea(verts: Vec3[], n: Vec3) {
  let a = 0
  const o = verts[0]
  if (!o) return 0
  for (let i = 1; i < verts.length - 1; i++) {
    a += dot(n, cross(sub(verts[i]!, o), sub(verts[i + 1]!, o)))
  }
  return a * 0.5
}

function seedQuad(n: Vec3, s: number): Vec3[] {
  const { t, b } = tangentFrame(n)
  const c = scale(n, s)
  const r = 4
  const tr = scale(t, r)
  const br = scale(b, r)
  return [
    add(c, add(tr, br)),
    add(c, add(scale(tr, -1), br)),
    add(c, add(scale(tr, -1), scale(br, -1))),
    add(c, add(tr, scale(br, -1))),
  ]
}

function clipFace(face: HalfSpace, spaces: HalfSpace[]): Vec3[] {
  let verts = seedQuad(face.n, face.s)
  for (let i = 0; i < spaces.length; i++) {
    const hs = spaces[i]!
    if (samePlane(hs, face)) continue
    verts = clipPoly(verts, hs.n, hs.s)
    if (verts.length < 3) return []
  }
  // Project back onto the face so clip drift does not thicken the pyramid.
  for (let i = 0; i < verts.length; i++) {
    const p = verts[i]!
    const err = dot(face.n, p) - face.s
    verts[i] = sub(p, scale(face.n, err))
  }
  if (signedArea(verts, face.n) < 0) verts.reverse()
  return verts
}

function dedupeFaces(faces: ShardFace[]): ShardFace[] {
  const kept: ShardFace[] = []
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]!
    let overlap = -1
    for (let j = 0; j < kept.length; j++) {
      const other = kept[j]!
      if (dot(face.normal, other.normal) > DEDUPE_DOT) {
        overlap = j
        break
      }
    }
    if (overlap < 0) {
      kept.push(face)
      continue
    }
    const prev = kept[overlap]!
    if (Math.abs(signedArea(face.verts, face.normal)) > Math.abs(signedArea(prev.verts, prev.normal))) {
      kept[overlap] = face
    }
  }
  return kept
}

/** Visible faces of octahedron A ∩ octahedron B. Sphere clip is ignored. */
export function clipIntersectionFaces(
  planeA: ArrayLike<number>,
  slabA: number,
  planeB: ArrayLike<number>,
  slabB: number,
): ShardFace[] {
  const spacesA = halfSpaces(planeA, slabA)
  const spacesB = halfSpaces(planeB, slabB)
  const all = spacesA.concat(spacesB)
  const raw: ShardFace[] = []
  for (let i = 0; i < all.length; i++) {
    const hs = all[i]!
    const verts = clipFace(hs, all)
    if (verts.length < 3) continue
    if (Math.abs(signedArea(verts, hs.n)) < SHARD_AREA_EPS) continue
    raw.push({ verts, normal: hs.n })
  }
  return dedupeFaces(raw)
}

function hash01(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function rotateAround(p: Vec3, axis: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const d = dot(axis, p)
  const k = 1 - c
  return [
    p[0] * c + (axis[1] * p[2] - axis[2] * p[1]) * s + axis[0] * d * k,
    p[1] * c + (axis[2] * p[0] - axis[0] * p[2]) * s + axis[1] * d * k,
    p[2] * c + (axis[0] * p[1] - axis[1] * p[0]) * s + axis[2] * d * k,
  ]
}

export function shardLocalCrack(crack: number, index: number) {
  const h = hash01(index)
  return clamp01((clamp01(crack) - SHARD_STAGGER * h) / SHARD_STAGGER_SPAN)
}

export function shardFade(crack: number) {
  return 1 - clamp01(crack)
}

function centroidOf(verts: Vec3[]): Vec3 {
  let x = 0
  let y = 0
  let z = 0
  const n = verts.length || 1
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i]!
    x += v[0]
    y += v[1]
    z += v[2]
  }
  return [x / n, y / n, z / n]
}

export function poseShard(face: ShardFace, index: number, crack: number): PosedShard {
  const local = shardLocalCrack(crack, index)
  const ease = local * local
  const fade = shardFade(crack)
  const n = face.normal
  if (ease <= 0) {
    return {
      verts: face.verts.map((v) => [v[0], v[1], v[2]] as Vec3),
      apex: [0, 0, 0],
      normal: [n[0], n[1], n[2]],
      fade,
    }
  }

  const { t, b } = tangentFrame(n)
  const h2 = hash01(index + 17)
  const h3 = hash01(index + 31)
  const drift = add(
    scale(t, (h2 - 0.5) * SHARD_TANGENTIAL * ease),
    scale(b, (h3 - 0.5) * 0.12 * ease),
  )
  const translate = add(scale(n, ease * SHARD_FLY_DIST), drift)
  const axis = norm(add(scale(t, h2 * 2 - 1), scale(b, h3 * 2 - 1)))
  const angle = ease * (0.9 + hash01(index) * 1.8)
  const pivot = centroidOf(face.verts)

  const xform = (p: Vec3): Vec3 => {
    const r = rotateAround(sub(p, pivot), axis, angle)
    return add(add(pivot, r), translate)
  }

  return {
    verts: face.verts.map(xform),
    apex: xform([0, 0, 0]),
    normal: rotateAround(n, axis, angle),
    fade,
  }
}

export function poseShards(faces: ShardFace[], crack: number): PosedShard[] {
  const out: PosedShard[] = []
  for (let i = 0; i < faces.length; i++) out.push(poseShard(faces[i]!, i, crack))
  return out
}

function pushTri(out: Float32Array, o: number, a: Vec3, b: Vec3, c: Vec3): number {
  if (o + 18 > out.length) return o
  const n = norm(cross(sub(b, a), sub(c, a)))
  if (n[0] === 0 && n[1] === 0 && n[2] === 1 && len(cross(sub(b, a), sub(c, a))) < 1e-10) {
    return o
  }
  const verts = [a, b, c]
  for (let i = 0; i < 3; i++) {
    const p = verts[i]!
    out[o++] = p[0]
    out[o++] = p[1]
    out[o++] = p[2]
    out[o++] = n[0]
    out[o++] = n[1]
    out[o++] = n[2]
  }
  return o
}

/** Interleaved position + flat normal. Returns vertex count. */
export function writeShardMesh(posed: PosedShard[], out: Float32Array): number {
  let o = 0
  for (let s = 0; s < posed.length; s++) {
    const shard = posed[s]!
    const verts = shard.verts
    if (verts.length < 3) continue
    const v0 = verts[0]!
    for (let i = 1; i < verts.length - 1; i++) {
      o = pushTri(out, o, v0, verts[i]!, verts[i + 1]!)
    }
    for (let i = 0; i < verts.length; i++) {
      const a = verts[i]!
      const b = verts[(i + 1) % verts.length]!
      o = pushTri(out, o, shard.apex, b, a)
    }
  }
  return (o / SHARD_FLOATS_PER_VERT) | 0
}

export function faceCentroid(face: ShardFace): Vec3 {
  return centroidOf(face.verts)
}
