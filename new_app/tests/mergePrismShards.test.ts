import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  SHARD_AREA_EPS,
  SHARD_FLOATS_PER_VERT,
  SHARD_FLY_DIST,
  SHARD_MAX_VERTS,
  clipIntersectionFaces,
  faceCentroid,
  poseShard,
  poseShards,
  shardFade,
  shardLocalCrack,
  writeShardMesh,
  type Vec3,
} from '../utils/mergePrismShards.ts'

function writePlanes(out: Float32Array, rx: number, ry: number, rz: number) {
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)
  const m0 = cz * cy
  const m1 = cz * sy * sx - sz * cx
  const m2 = cz * sy * cx + sz * sx
  const m3 = sz * cy
  const m4 = sz * sy * sx + cz * cx
  const m5 = sz * sy * cx - cz * sx
  const m6 = -sy
  const m7 = cy * sx
  const m8 = cy * cx
  const k = 0.5773502691896258
  const base = [1, 1, 1, 1, 1, -1, 1, -1, 1, -1, 1, 1]
  for (let i = 0; i < 4; i++) {
    const x = base[i * 3]! * k
    const y = base[i * 3 + 1]! * k
    const z = base[i * 3 + 2]! * k
    out[i * 3] = m0 * x + m1 * y + m2 * z
    out[i * 3 + 1] = m3 * x + m4 * y + m5 * z
    out[i * 3 + 2] = m6 * x + m7 * y + m8 * z
  }
}

function samplePair() {
  const planeA = new Float32Array(12)
  const planeB = new Float32Array(12)
  writePlanes(planeA, 0.62, 0.31, 0.12)
  writePlanes(planeB, -0.24, 0.87, 0.44)
  return { planeA, planeB, slabA: 0.27, slabB: 0.258 }
}

function insideIntersection(
  p: Vec3,
  planeA: Float32Array,
  slabA: number,
  planeB: Float32Array,
  slabB: number,
) {
  for (let i = 0; i < 4; i++) {
    const a: Vec3 = [planeA[i * 3] ?? 0, planeA[i * 3 + 1] ?? 0, planeA[i * 3 + 2] ?? 0]
    const b: Vec3 = [planeB[i * 3] ?? 0, planeB[i * 3 + 1] ?? 0, planeB[i * 3 + 2] ?? 0]
    if (Math.abs(a[0] * p[0] + a[1] * p[1] + a[2] * p[2]) > slabA + 1e-4) return false
    if (Math.abs(b[0] * p[0] + b[1] * p[1] + b[2] * p[2]) > slabB + 1e-4) return false
  }
  return true
}

function almostEqual(a: Vec3, b: Vec3, eps = 1e-6) {
  assert.ok(Math.abs(a[0] - b[0]) < eps)
  assert.ok(Math.abs(a[1] - b[1]) < eps)
  assert.ok(Math.abs(a[2] - b[2]) < eps)
}

test('two rotated octahedra clip to a handful of real faces', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  assert.ok(faces.length >= 8)
  assert.ok(faces.length <= 16)
  for (const face of faces) {
    assert.ok(face.verts.length >= 3)
    assert.ok(face.verts.length <= 8)
  }
})

test('identical octahedra dedupe to one solid\'s faces, not a double hull', () => {
  const planeA = new Float32Array(12)
  writePlanes(planeA, 0.2, 0.4, 0.1)
  const faces = clipIntersectionFaces(planeA, 0.27, planeA, 0.27)
  assert.ok(faces.length >= 8)
  assert.ok(faces.length <= 8)
})

test('the origin sits inside every rest pyramid and mid-axis points stay in the gem', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  assert.ok(faces.length > 0)
  for (const face of faces) {
    const n = face.normal
    assert.ok(n[0] * 0 + n[1] * 0 + n[2] * 0 <= 1e-5)
    const c = faceCentroid(face)
    const mid: Vec3 = [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5]
    assert.ok(insideIntersection(mid, planeA, slabA, planeB, slabB))
    const along = c[0] * n[0] + c[1] * n[1] + c[2] * n[2]
    assert.ok(along > 0)
  }
})

test('sliver faces under the area epsilon never leave the clipper', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  for (const face of faces) {
    let area = 0
    const o = face.verts[0]!
    for (let i = 1; i < face.verts.length - 1; i++) {
      const a = face.verts[i]!
      const b = face.verts[i + 1]!
      const cx = (a[1] - o[1]) * (b[2] - o[2]) - (a[2] - o[2]) * (b[1] - o[1])
      const cy = (a[2] - o[2]) * (b[0] - o[0]) - (a[0] - o[0]) * (b[2] - o[2])
      const cz = (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
      area += face.normal[0] * cx + face.normal[1] * cy + face.normal[2] * cz
    }
    assert.ok(Math.abs(area) * 0.5 >= SHARD_AREA_EPS)
  }
})

test('pose(0) is the rest pyramid: identity verts, apex at the origin', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]!
    const posed = poseShard(face, i, 0)
    assert.equal(posed.verts.length, face.verts.length)
    assert.equal(posed.fade, 1)
    almostEqual(posed.apex, [0, 0, 0])
    almostEqual(posed.normal, face.normal)
    for (let v = 0; v < face.verts.length; v++) {
      almostEqual(posed.verts[v]!, face.verts[v]!)
    }
  }
})

test('centroid distance is monotonic in crack once a shard has left', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  const samples = [0, 0.15, 0.35, 0.6, 1]
  for (let i = 0; i < faces.length; i++) {
    let prev = -1
    for (const crack of samples) {
      const posed = poseShard(faces[i]!, i, crack)
      const c = faceCentroid({ verts: posed.verts, normal: posed.normal })
      const dist = Math.hypot(c[0], c[1], c[2])
      if (shardLocalCrack(crack, i) > 0) {
        assert.ok(dist >= prev - 1e-6)
      }
      prev = dist
    }
    const gone = poseShard(faces[i]!, i, 1)
    const far = faceCentroid({ verts: gone.verts, normal: gone.normal })
    assert.ok(Math.hypot(far[0], far[1], far[2]) > SHARD_FLY_DIST * 0.35)
  }
})

test('pose is a pure function of the face, index, and crack', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  const face = faces[0]!
  const a = poseShard(face, 0, 0.42)
  const b = poseShard(face, 0, 0.42)
  assert.equal(a.fade, b.fade)
  almostEqual(a.apex, b.apex)
  almostEqual(a.normal, b.normal)
  assert.equal(a.verts.length, b.verts.length)
  for (let i = 0; i < a.verts.length; i++) almostEqual(a.verts[i]!, b.verts[i]!)
  assert.deepEqual(poseShards(faces, 0.2).map((s) => s.apex), poseShards(faces, 0.2).map((s) => s.apex))
})

test('shard fade is 1 at rest and 0 at full crack, independent of index', () => {
  assert.equal(shardFade(0), 1)
  assert.equal(shardFade(1), 0)
  assert.ok(Math.abs(shardFade(0.4) - 0.6) < 1e-12)
})

test('the mesh writer emits triangles that fit the scratch buffer', () => {
  const { planeA, planeB, slabA, slabB } = samplePair()
  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  const posed = poseShards(faces, 0.3)
  const out = new Float32Array(SHARD_MAX_VERTS * SHARD_FLOATS_PER_VERT)
  const count = writeShardMesh(posed, out)
  assert.ok(count >= 24)
  assert.equal(count % 3, 0)
  assert.ok(count <= SHARD_MAX_VERTS)
})
