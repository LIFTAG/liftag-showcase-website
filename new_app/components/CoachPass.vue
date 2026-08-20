<script setup lang="ts">
/**
 * LIFTAG coach pass for TrainersSection.
 *
 * Progress has a plate. Gyms have a foil sticker. Trainers had no physical
 * object; this is that object. A black-metal gym access card on narrow
 * lime-stitched webbing, hung from a locker pin with a Verlet rope. Gravity
 * is a badge, not a balloon. Drag it, it swings. Idle sway never dies.
 *
 * Not a conference lanyard, not a printed strap, not a vendored card.glb.
 *
 * Lifecycle matches the other WebGL islands:
 *   • desktop + motion only. Mobile and prefers-reduced-motion keep the SVG.
 *   • three.js is dynamically imported after those gates, never on 390px.
 *   • lazy-inits when the mount is near the viewport
 *   • pauses while the document is hidden
 *   • disposes the GL context when the mount leaves, so browsers do not
 *     accumulate live contexts
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type {
  BufferAttribute,
  BufferGeometry,
  Camera,
  CanvasTexture,
  Group,
  Material,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'

const DPR_CAP = 1.65
const NEAR_MARGIN = '420px 0px'
const ROPE_COUNT = 11
const ITERATIONS = 10
const GRAVITY = 36
const DAMPING = 0.983
const STRAP_HALF_W = 0.048
const STRAP_HALF_T = 0.01
const CARD_W = 1.18
const CARD_H = 1.74
const CARD_D = 0.045
const CARD_R = 0.08
const CLIP_DROP = 0.22
const ANCHOR_Y = 1.72
const ROPE_SPAN = 1.46
const FACE_NAME = 'MAYA KOVAC'
const FACE_CITY = 'BRATISLAVA'
const FACE_SERIAL = 'CP-08-19'

const mount = ref<HTMLElement | null>(null)
const live = ref(false)

type Particle = {
  x: number
  y: number
  z: number
  ox: number
  oy: number
  oz: number
  pinned: boolean
}

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let canvasEl: HTMLCanvasElement | null = null
let hangGroup: Group | null = null
let cardGroup: Group | null = null
let strapGeo: BufferGeometry | null = null
let faceTexture: CanvasTexture | null = null
let backTexture: CanvasTexture | null = null
let webbingTexture: CanvasTexture | null = null
let raycaster: Raycaster | null = null
let pointerNdc: Vector2 | null = null
let grabPlane: Plane | null = null
let grabPoint: Vector3 | null = null
let tmpA: Vector3 | null = null
let tmpB: Vector3 | null = null
let tmpC: Vector3 | null = null
let viewDir: Vector3 | null = null
let basisX: Vector3 | null = null
let basisY: Vector3 | null = null
let basisZ: Vector3 | null = null
let tmpMatrix: Matrix4 | null = null

let particles: Particle[] = []
let restLength = 0.146
let anchorX = 0.04
let anchorY = ANCHOR_Y
let anchorZ = 0
let yaw = 0.18
let yawVel = 0
let grabbing = false
let grabPointerId: number | null = null
let grabTargetX = 0
let grabTargetY = 0
let grabTargetZ = 0
let hasGrabTarget = false
let contextBroken = false
let disposed = true
let intersecting = false
let rafId = 0
let lastT = 0
let accum = 0
let initInFlight = false
let resizeRaf = 0

let phoneMql: MediaQueryList | null = null
let motionMql: MediaQueryList | null = null
let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let onVisibility: (() => void) | null = null
let onPhoneChange: (() => void) | null = null
let onMotionChange: ((e: MediaQueryListEvent) => void) | null = null
let onContextLost: ((e: Event) => void) | null = null
let onPointerDown: ((e: PointerEvent) => void) | null = null
let onPointerMove: ((e: PointerEvent) => void) | null = null
let onPointerUp: ((e: PointerEvent) => void) | null = null
let ThreeMod: typeof import('three') | null = null

function allowWebgl() {
  if (typeof window === 'undefined') return false
  if (!phoneMql || !motionMql) return false
  return !phoneMql.matches && !motionMql.matches
}

function roundedRect(THREE: typeof import('three'), w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  const hw = w / 2
  const hh = h / 2
  const cr = Math.min(r, hw, hh)
  shape.moveTo(-hw + cr, -hh)
  shape.lineTo(hw - cr, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + cr)
  shape.lineTo(hw, hh - cr)
  shape.quadraticCurveTo(hw, hh, hw - cr, hh)
  shape.lineTo(-hw + cr, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - cr)
  shape.lineTo(-hw, -hh + cr)
  shape.quadraticCurveTo(-hw, -hh, -hw + cr, -hh)
  return shape
}

function configureFaceUvs(THREE: typeof import('three'), geo: BufferGeometry, w: number, h: number) {
  const pos = geo.attributes.position as BufferAttribute
  const uvs = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + w / 2) / w
    uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const cr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + cr, y)
  ctx.arcTo(x + w, y, x + w, y + h, cr)
  ctx.arcTo(x + w, y + h, x, y + h, cr)
  ctx.arcTo(x, y + h, x, y, cr)
  ctx.arcTo(x, y, x + w, y, cr)
  ctx.closePath()
}

function hash32(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function drawWebbing(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)
  for (let y = 0; y < h; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? '#161616' : '#0c0c0c'
    ctx.fillRect(0, y, w, 1)
  }
  for (let x = 10; x < w - 10; x += 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.028)'
    ctx.fillRect(x, 0, 1, h)
  }
  ctx.fillStyle = '#CCFF00'
  ctx.fillRect(0, 0, 7, h)
  ctx.fillRect(w - 7, 0, 7, h)
  ctx.fillStyle = 'rgba(10,10,10,0.55)'
  ctx.fillRect(2, 0, 1, h)
  ctx.fillRect(w - 3, 0, 1, h)
  ctx.fillStyle = 'rgba(204,255,0,0.38)'
  ctx.fillRect(11, 0, 1.5, h)
  ctx.fillRect(w - 13, 0, 1.5, h)
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRectPath(ctx, x, y, w, h, 8)
  const gold = ctx.createLinearGradient(x, y, x + w, y + h)
  gold.addColorStop(0, '#e8d59a')
  gold.addColorStop(0.45, '#c4a35a')
  gold.addColorStop(1, '#8d6a2e')
  ctx.fillStyle = gold
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(80,50,12,0.55)'
  ctx.lineWidth = 1.4
  const inset = 7
  const gap = (h - inset * 2) / 3
  for (let i = 0; i < 4; i += 1) {
    const ly = y + inset + i * gap
    ctx.beginPath()
    ctx.moveTo(x + inset, ly)
    ctx.lineTo(x + w - inset, ly)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(x + w * 0.5, y + inset)
  ctx.lineTo(x + w * 0.5, y + h - inset)
  ctx.stroke()
}

function drawFace(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const metal = ctx.createLinearGradient(0, 0, w, h)
  metal.addColorStop(0, '#3a3c36')
  metal.addColorStop(0.42, '#1c1e18')
  metal.addColorStop(1, '#12140f')
  ctx.fillStyle = metal
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.globalAlpha = 0.18
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? '#ffffff' : '#000000'
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()

  const shine = ctx.createRadialGradient(w * 0.28, h * 0.18, 0, w * 0.28, h * 0.18, w * 0.7)
  shine.addColorStop(0, 'rgba(255,255,255,0.10)')
  shine.addColorStop(0.45, 'rgba(255,255,255,0.02)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shine
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#CCFF00'
  ctx.lineWidth = 14
  roundRectPath(ctx, 28, 28, w - 56, h - 56, 36)
  ctx.shadowColor = 'rgba(204,255,0,0.55)'
  ctx.shadowBlur = 18
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  roundRectPath(ctx, 42, 42, w - 84, h - 84, 28)
  ctx.stroke()

  drawChip(ctx, 72, 78, 168, 118)

  ctx.font = '700 42px Space Grotesk, system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#CCFF00'
  ctx.fillText('LIFTAG', w - 78, 118)
  ctx.font = '500 18px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(204,255,0,0.7)'
  ctx.fillText('COACH PASS', w - 78, 158)

  ctx.fillStyle = '#CCFF00'
  ctx.fillRect(72, 230, w - 144, 4)

  ctx.textAlign = 'left'
  ctx.font = '700 28px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.fillText('COACH', 72, 310)

  ctx.font = '700 72px Space Grotesk, system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(FACE_NAME, 72, 400)

  ctx.font = '500 32px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText(FACE_CITY, 72, 470)

  ctx.fillStyle = '#FF2D55'
  ctx.beginPath()
  ctx.arc(92, h - 168, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '700 28px JetBrains Mono, SF Mono, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FF2D55'
  ctx.fillText('VERIFIED', 122, h - 168)

  ctx.font = '500 22px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.32)'
  ctx.fillText(FACE_SERIAL, 72, h - 110)

  ctx.font = '500 16px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillText('GYM ACCESS  ·  RFID', 72, h - 78)
}

function qrModule(x: number, y: number, n: number, seed: number) {
  const finder = (fx: number, fy: number) => {
    const dx = x - fx
    const dy = y - fy
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
    const border = dx === 0 || dy === 0 || dx === 6 || dy === 6
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
    return border || core
  }
  const a = finder(0, 0)
  if (a !== null) return a
  const b = finder(n - 7, 0)
  if (b !== null) return b
  const c = finder(0, n - 7)
  if (c !== null) return c
  const timing = (x === 6 && y >= 8 && y <= n - 9) || (y === 6 && x >= 8 && x <= n - 9)
  if (timing) return (x + y) % 2 === 0
  const bit = (Math.imul(x + 3, 197) ^ Math.imul(y + 11, 89) ^ seed) >>> 0
  return (bit & 3) !== 0
}

function drawBack(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#0c0c0e'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#1a1210'
  ctx.fillRect(0, 0, w, 210)
  ctx.fillStyle = '#0a0706'
  ctx.fillRect(0, 210, w, 18)
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(0, 0, w, 4)

  ctx.strokeStyle = '#CCFF00'
  ctx.lineWidth = 7
  roundRectPath(ctx, 28, 28, w - 56, h - 56, 36)
  ctx.stroke()

  ctx.font = '700 28px JetBrains Mono, SF Mono, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('LIFTAG  ·  COACH PASS', w / 2, 270)

  const qrN = 21
  const qrSize = 430
  const qrX = (w - qrSize) / 2
  const qrY = 330
  const cell = qrSize / qrN
  const seed = hash32(`${FACE_NAME}:${FACE_SERIAL}`)
  ctx.fillStyle = '#f4f4f0'
  roundRectPath(ctx, qrX - 22, qrY - 22, qrSize + 44, qrSize + 44, 18)
  ctx.fill()
  ctx.fillStyle = '#080808'
  for (let y = 0; y < qrN; y += 1) {
    for (let x = 0; x < qrN; x += 1) {
      if (!qrModule(x, y, qrN, seed)) continue
      ctx.fillRect(qrX + x * cell, qrY + y * cell, cell + 0.4, cell + 0.4)
    }
  }

  ctx.font = '700 24px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = '#CCFF00'
  ctx.fillText('SCAN TO BOOK', w / 2, qrY + qrSize + 64)

  ctx.font = '500 20px JetBrains Mono, SF Mono, monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.32)'
  ctx.fillText(FACE_SERIAL, w / 2, h - 96)
}

function steelMat(THREE: typeof import('three'), color: number, roughness = 0.2) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
  })
}

function makeClip(THREE: typeof import('three')) {
  const group = new THREE.Group()
  const steel = steelMat(THREE, 0xb7bcc2, 0.18)
  const dark = steelMat(THREE, 0x6f747a, 0.28)

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.15, 14), steel)
  bar.rotation.z = Math.PI / 2
  group.add(bar)

  const front = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.2, 0.012), steel)
  front.position.set(0, -0.1, 0.018)
  group.add(front)

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.2, 0.012), dark)
  back.position.set(0, -0.1, -0.018)
  group.add(back)

  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.046, 12), steel)
  rivet.rotation.x = Math.PI / 2
  rivet.position.set(0, -0.07, 0)
  group.add(rivet)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0075, 10, 22), steel)
  ring.rotation.y = Math.PI / 2
  ring.position.set(0, -0.23, 0)
  group.add(ring)

  return group
}

function makeAnchor(THREE: typeof import('three')) {
  const group = new THREE.Group()
  const steel = steelMat(THREE, 0xc5cad0, 0.16)
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 28), steel)
  washer.rotation.x = Math.PI / 2
  group.add(washer)
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.02, 16), steel)
  head.rotation.x = Math.PI / 2
  head.position.z = 0.012
  group.add(head)
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.004, 0.006),
    new THREE.MeshBasicMaterial({ color: 0x111111 }),
  )
  slot.position.z = 0.024
  group.add(slot)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.009, 10, 22), steel)
  ring.position.y = -0.07
  group.add(ring)
  const pip = new THREE.Mesh(
    new THREE.CircleGeometry(0.01, 12),
    new THREE.MeshBasicMaterial({ color: 0xCCFF00 }),
  )
  pip.position.set(0, 0, 0.023)
  group.add(pip)
  return group
}

function buildStrapGeometry(THREE: typeof import('three'), count: number) {
  const geo = new THREE.BufferGeometry()
  const vertCount = count * 4
  const positions = new Float32Array(vertCount * 3)
  const uvs = new Float32Array(vertCount * 2)
  const indices: number[] = []
  const vRepeat = count * 0.55

  for (let i = 0; i < count; i += 1) {
    const v = (i / (count - 1)) * vRepeat
    const base = i * 4
    uvs[(base + 0) * 2] = 0
    uvs[(base + 0) * 2 + 1] = v
    uvs[(base + 1) * 2] = 1
    uvs[(base + 1) * 2 + 1] = v
    uvs[(base + 2) * 2] = 0
    uvs[(base + 2) * 2 + 1] = v
    uvs[(base + 3) * 2] = 1
    uvs[(base + 3) * 2 + 1] = v
    if (i === count - 1) continue
    const a = i * 4
    const b = (i + 1) * 4
    indices.push(a, a + 1, b + 1, a, b + 1, b)
    indices.push(a + 3, a + 2, b + 2, a + 3, b + 2, b + 3)
    indices.push(a + 2, a, b, a + 2, b, b + 2)
    indices.push(a + 1, a + 3, b + 3, a + 1, b + 3, b + 1)
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

function updateStrap() {
  if (!strapGeo || !viewDir || !tmpA || !tmpB || !tmpC) return
  const pos = strapGeo.attributes.position as BufferAttribute
  const count = particles.length
  viewDir.set(0, 0, 1)

  for (let i = 0; i < count; i += 1) {
    const p = particles[i]
    const prev = particles[Math.max(0, i - 1)]
    const next = particles[Math.min(count - 1, i + 1)]
    tmpA.set(next.x - prev.x, next.y - prev.y, next.z - prev.z)
    if (tmpA.lengthSq() < 1e-8) tmpA.set(0, -1, 0)
    else tmpA.normalize()
    tmpB.crossVectors(tmpA, viewDir)
    if (tmpB.lengthSq() < 1e-8) tmpB.set(1, 0, 0)
    else tmpB.normalize()
    tmpC.crossVectors(tmpB, tmpA).normalize()
    tmpB.multiplyScalar(STRAP_HALF_W)
    tmpC.multiplyScalar(STRAP_HALF_T)
    const base = i * 4
    pos.setXYZ(base + 0, p.x + tmpB.x + tmpC.x, p.y + tmpB.y + tmpC.y, p.z + tmpB.z + tmpC.z)
    pos.setXYZ(base + 1, p.x - tmpB.x + tmpC.x, p.y - tmpB.y + tmpC.y, p.z - tmpB.z + tmpC.z)
    pos.setXYZ(base + 2, p.x + tmpB.x - tmpC.x, p.y + tmpB.y - tmpC.y, p.z + tmpB.z - tmpC.z)
    pos.setXYZ(base + 3, p.x - tmpB.x - tmpC.x, p.y - tmpB.y - tmpC.y, p.z - tmpB.z - tmpC.z)
  }

  pos.needsUpdate = true
  strapGeo.computeVertexNormals()
}

function resetRope() {
  particles = []
  restLength = ROPE_SPAN / (ROPE_COUNT - 1)
  for (let i = 0; i < ROPE_COUNT; i += 1) {
    const t = i / (ROPE_COUNT - 1)
    const x = anchorX + t * t * 0.12
    const y = anchorY - i * restLength
    const z = t * 0.02
    particles.push({
      x,
      y,
      z,
      ox: x,
      oy: y,
      oz: z,
      pinned: i === 0,
    })
  }
}

function satisfyConstraints() {
  for (let iter = 0; iter < ITERATIONS; iter += 1) {
    for (let i = 0; i < particles.length - 1; i += 1) {
      const a = particles[i]
      const b = particles[i + 1]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const dist = Math.hypot(dx, dy, dz) || 1e-6
      const frac = (dist - restLength) / dist
      const aW = a.pinned ? 0 : 1
      const bW = b.pinned ? 0 : 1
      const weight = aW + bW
      if (weight === 0) continue
      if (aW) {
        const k = aW / weight
        a.x += dx * frac * k
        a.y += dy * frac * k
        a.z += dz * frac * k
      }
      if (bW) {
        const k = bW / weight
        b.x -= dx * frac * k
        b.y -= dy * frac * k
        b.z -= dz * frac * k
      }
    }
    const head = particles[0]
    head.x = anchorX
    head.y = anchorY
    head.z = anchorZ
    head.ox = anchorX
    head.oy = anchorY
    head.oz = anchorZ
  }

  const last = particles[particles.length - 1]
  const maxLen = restLength * (ROPE_COUNT - 1) * 1.06
  const dx = last.x - anchorX
  const dy = last.y - anchorY
  const dz = last.z - anchorZ
  const len = Math.hypot(dx, dy, dz)
  if (len > maxLen) {
    const s = maxLen / len
    last.x = anchorX + dx * s
    last.y = anchorY + dy * s
    last.z = anchorZ + dz * s
  }
}

function integrate(dt: number, windX: number, windZ: number) {
  const g = GRAVITY * dt * dt
  const lastIndex = particles.length - 1
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i]
    if (p.pinned) continue
    const vx = (p.x - p.ox) * DAMPING
    const vy = (p.y - p.oy) * DAMPING
    const vz = (p.z - p.oz) * DAMPING
    p.ox = p.x
    p.oy = p.y
    p.oz = p.z
    const mass = i === lastIndex ? 2.15 : 1
    p.x += vx + windX * dt * dt
    p.y += vy - g * mass
    p.z += vz + windZ * dt * dt
  }
}

function settleRope() {
  for (let i = 0; i < 90; i += 1) {
    integrate(1 / 60, 0.0004, 0)
    satisfyConstraints()
  }
  yaw = 0.16
  yawVel = 0
}

function orientHang() {
  if (!hangGroup || !basisX || !basisY || !basisZ || !tmpA || !tmpMatrix) return
  const last = particles[particles.length - 1]
  const prev = particles[particles.length - 2]
  tmpA.set(last.x - prev.x, last.y - prev.y, last.z - prev.z)
  if (tmpA.lengthSq() < 1e-8) tmpA.set(0, -1, 0)
  else tmpA.normalize()

  basisY.copy(tmpA).multiplyScalar(-1)
  basisZ.set(Math.sin(yaw), 0, Math.cos(yaw))
  basisX.crossVectors(basisY, basisZ)
  if (basisX.lengthSq() < 1e-8) basisX.set(1, 0, 0)
  else basisX.normalize()
  basisZ.crossVectors(basisX, basisY).normalize()

  tmpMatrix.makeBasis(basisX, basisY, basisZ)
  hangGroup.quaternion.setFromRotationMatrix(tmpMatrix)
  hangGroup.position.set(last.x, last.y, last.z)
}

function ndcFromEvent(event: PointerEvent, target: Vector2, el: HTMLCanvasElement) {
  const rect = el.getBoundingClientRect()
  const w = Math.max(rect.width, 1)
  const h = Math.max(rect.height, 1)
  target.set(((event.clientX - rect.left) / w) * 2 - 1, -((event.clientY - rect.top) / h) * 2 + 1)
}

function projectGrab(event: PointerEvent) {
  if (!raycaster || !pointerNdc || !grabPlane || !grabPoint || !camera || !canvasEl) return null
  ndcFromEvent(event, pointerNdc, canvasEl)
  raycaster.setFromCamera(pointerNdc, camera as Camera)
  const hit = raycaster.ray.intersectPlane(grabPlane, grabPoint)
  return hit
}

function hitCard(event: PointerEvent) {
  if (!raycaster || !pointerNdc || !camera || !canvasEl || !cardGroup) return false
  ndcFromEvent(event, pointerNdc, canvasEl)
  raycaster.setFromCamera(pointerNdc, camera as Camera)
  return raycaster.intersectObject(cardGroup, true).length > 0
}

function pullToGrab() {
  if (!hasGrabTarget || particles.length === 0) return
  const last = particles[particles.length - 1]
  const k = 0.46
  last.x += (grabTargetX - last.x) * k
  last.y += (grabTargetY - last.y) * k
  last.z += (grabTargetZ - last.z) * k
}

function applyGrab(event: PointerEvent) {
  const hit = projectGrab(event)
  if (!hit) return
  grabTargetX = hit.x
  grabTargetY = hit.y
  grabTargetZ = hit.z
  hasGrabTarget = true
  pullToGrab()
}

function stopGrab() {
  grabbing = false
  grabPointerId = null
  hasGrabTarget = false
  if (canvasEl) canvasEl.style.cursor = 'default'
}

function startLoop() {
  if (rafId || disposed || !allowWebgl()) return
  lastT = performance.now()
  accum = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function tick(now: number) {
  if (disposed || !renderer || !scene || !camera || !ThreeMod || document.hidden) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(tick)

  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000))
  lastT = now
  accum += dt
  const step = 1 / 60
  if (accum > 0.12) accum = 0.12

  const t = now * 0.001
  let windX = Math.sin(t * 0.67) * 4.4 + Math.sin(t * 1.21) * 1.5
  let windZ = Math.cos(t * 0.39) * 1.15
  if (!grabbing) {
    const mouse = useSharedMouse().latest
    if (mouse.hasPointer) {
      windX += mouse.mx * 6.2
      windZ += mouse.my * 0.8
    }
  }

  while (accum >= step) {
    integrate(step, grabbing ? 0 : windX, grabbing ? 0 : windZ)
    if (grabbing) {
      const last = particles[particles.length - 1]
      yawVel += (grabTargetX - last.x) * 0.35
      pullToGrab()
    }
    satisfyConstraints()
    if (grabbing) pullToGrab()
    accum -= step
  }

  yawVel *= 0.965
  yaw += yawVel * dt
  yaw += (0.12 - yaw) * (grabbing ? 0.008 : 0.035)
  if (yaw > Math.PI * 3) yaw -= Math.PI * 2
  if (yaw < -Math.PI * 3) yaw += Math.PI * 2

  updateStrap()
  orientHang()
  renderer.render(scene, camera)
}

function bindPointer(canvas: HTMLCanvasElement) {
  onPointerDown = (event: PointerEvent) => {
    if (!allowWebgl() || event.button !== 0) return
    if (!hitCard(event)) return
    grabbing = true
    grabPointerId = event.pointerId
    canvas.setPointerCapture(event.pointerId)
    canvas.style.cursor = 'grabbing'
    applyGrab(event)
    event.preventDefault()
  }
  onPointerMove = (event: PointerEvent) => {
    if (!canvasEl) return
    if (grabbing && event.pointerId === grabPointerId) {
      applyGrab(event)
      return
    }
    canvasEl.style.cursor = hitCard(event) ? 'grab' : 'default'
  }
  onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== grabPointerId) return
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    stopGrab()
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('lostpointercapture', onPointerUp)
}

function unbindPointer(canvas: HTMLCanvasElement) {
  if (onPointerDown) canvas.removeEventListener('pointerdown', onPointerDown)
  if (onPointerMove) canvas.removeEventListener('pointermove', onPointerMove)
  if (onPointerUp) {
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('lostpointercapture', onPointerUp)
  }
  onPointerDown = null
  onPointerMove = null
  onPointerUp = null
}

function disposeScene() {
  stopLoop()
  stopGrab()
  live.value = false

  if (canvasEl) unbindPointer(canvasEl)
  if (canvasEl && onContextLost) {
    canvasEl.removeEventListener('webglcontextlost', onContextLost)
  }
  onContextLost = null

  if (scene) {
    const geos = new Set<BufferGeometry>()
    const mats = new Set<Material>()
    scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      geos.add(mesh.geometry)
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => mats.add(material))
    })
    geos.forEach((geometry) => geometry.dispose())
    mats.forEach((material) => material.dispose())
  }

  faceTexture?.dispose()
  backTexture?.dispose()
  webbingTexture?.dispose()

  if (renderer) {
    renderer.dispose()
    if (!contextBroken) renderer.forceContextLoss()
    if (canvasEl && canvasEl.parentElement) canvasEl.parentElement.removeChild(canvasEl)
  }

  renderer = null
  scene = null
  camera = null
  canvasEl = null
  hangGroup = null
  cardGroup = null
  strapGeo = null
  faceTexture = null
  backTexture = null
  webbingTexture = null
  raycaster = null
  pointerNdc = null
  grabPlane = null
  grabPoint = null
  tmpA = null
  tmpB = null
  tmpC = null
  viewDir = null
  basisX = null
  basisY = null
  basisZ = null
  tmpMatrix = null
  particles = []
  contextBroken = false
  disposed = true
}

async function initScene() {
  const host = mount.value
  if (!host || !allowWebgl() || !intersecting || !disposed || initInFlight) return
  if (host.clientWidth < 2 || host.clientHeight < 2) return

  initInFlight = true
  let THREE: typeof import('three')
  try {
    THREE = ThreeMod ?? await import('three')
    ThreeMod = THREE
  } catch {
    initInFlight = false
    return
  }

  if (!allowWebgl() || !intersecting || !disposed || !mount.value) {
    initInFlight = false
    return
  }

  try {
  const width = Math.max(host.clientWidth, 1)
  const height = Math.max(host.clientHeight, 1)

  const nextRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  nextRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP))
  nextRenderer.setSize(width, height)
  nextRenderer.setClearColor(0x000000, 0)
  nextRenderer.toneMapping = THREE.ACESFilmicToneMapping
  nextRenderer.toneMappingExposure = 1.18
  nextRenderer.domElement.style.touchAction = 'none'
  nextRenderer.domElement.style.cursor = 'default'

  contextBroken = false
  onContextLost = (event: Event) => {
    event.preventDefault()
    contextBroken = true
    disposeScene()
  }
  nextRenderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
  host.appendChild(nextRenderer.domElement)

  renderer = nextRenderer
  canvasEl = nextRenderer.domElement
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 40)
  camera.position.set(0.38, 0.05, 4.85)
  camera.lookAt(0.05, -0.55, 0)

  scene.add(new THREE.HemisphereLight(0xf4f1e8, 0x1a120c, 0.7))
  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const key = new THREE.DirectionalLight(0xffffff, 1.7)
  key.position.set(1.4, 2.1, 4.6)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xfff4e0, 0.55)
  fill.position.set(-1.8, 0.6, 3.2)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xFF2D55, 0.4)
  rim.position.set(-2.4, 0.8, -2.2)
  scene.add(rim)
  const kick = new THREE.DirectionalLight(0xCCFF00, 0.38)
  kick.position.set(2.2, -1.2, 2.4)
  scene.add(kick)

  raycaster = new THREE.Raycaster()
  pointerNdc = new THREE.Vector2()
  grabPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  grabPoint = new THREE.Vector3()
  tmpA = new THREE.Vector3()
  tmpB = new THREE.Vector3()
  tmpC = new THREE.Vector3()
  viewDir = new THREE.Vector3()
  basisX = new THREE.Vector3()
  basisY = new THREE.Vector3()
  basisZ = new THREE.Vector3()
  tmpMatrix = new THREE.Matrix4()

  const faceCanvas = document.createElement('canvas')
  faceCanvas.width = 1024
  faceCanvas.height = 1536
  drawFace(faceCanvas)
  faceTexture = new THREE.CanvasTexture(faceCanvas)
  faceTexture.colorSpace = THREE.SRGBColorSpace
  faceTexture.anisotropy = 4

  const backCanvas = document.createElement('canvas')
  backCanvas.width = 1024
  backCanvas.height = 1536
  drawBack(backCanvas)
  backTexture = new THREE.CanvasTexture(backCanvas)
  backTexture.colorSpace = THREE.SRGBColorSpace
  backTexture.anisotropy = 4

  const webCanvas = document.createElement('canvas')
  webCanvas.width = 64
  webCanvas.height = 256
  drawWebbing(webCanvas)
  webbingTexture = new THREE.CanvasTexture(webCanvas)
  webbingTexture.colorSpace = THREE.SRGBColorSpace
  webbingTexture.wrapT = THREE.RepeatWrapping
  webbingTexture.wrapS = THREE.ClampToEdgeWrapping

  const fonts = document.fonts
  if (fonts?.ready) {
    fonts.ready.then(() => {
      if (disposed || !faceTexture || !backTexture) return
      drawFace(faceCanvas)
      drawBack(backCanvas)
      faceTexture.needsUpdate = true
      backTexture.needsUpdate = true
    }).catch(() => {})
  }

  hangGroup = new THREE.Group()
  cardGroup = new THREE.Group()
  cardGroup.position.set(0, -(CLIP_DROP + CARD_H * 0.5), 0)

  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(THREE, CARD_W, CARD_H, CARD_R), {
    steps: 1,
    depth: CARD_D,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
  })
  bodyGeo.center()
  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x2a2c28,
      metalness: 0.82,
      roughness: 0.34,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
    }),
  )
  cardGroup.add(body)

  const faceW = CARD_W - 0.04
  const faceH = CARD_H - 0.04
  const faceGeo = new THREE.ShapeGeometry(roundedRect(THREE, faceW, faceH, CARD_R - 0.02))
  configureFaceUvs(THREE, faceGeo, faceW, faceH)
  const face = new THREE.Mesh(
    faceGeo,
    new THREE.MeshBasicMaterial({ map: faceTexture, toneMapped: false }),
  )
  face.position.z = CARD_D / 2 + 0.028
  cardGroup.add(face)

  const backGeo = new THREE.ShapeGeometry(roundedRect(THREE, faceW, faceH, CARD_R - 0.02))
  configureFaceUvs(THREE, backGeo, faceW, faceH)
  const back = new THREE.Mesh(
    backGeo,
    new THREE.MeshBasicMaterial({ map: backTexture, toneMapped: false }),
  )
  back.position.z = -(CARD_D / 2 + 0.028)
  back.rotation.y = Math.PI
  cardGroup.add(back)

  const eyelet = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, 0.01, 10, 20),
    steelMat(THREE, 0xc0c5cb, 0.16),
  )
  eyelet.position.set(0, CARD_H / 2 - 0.02, 0)
  cardGroup.add(eyelet)

  hangGroup.add(makeClip(THREE))
  hangGroup.add(cardGroup)
  scene.add(hangGroup)

  const anchor = makeAnchor(THREE)
  anchor.position.set(anchorX, anchorY + 0.08, 0)
  scene.add(anchor)

  strapGeo = buildStrapGeometry(THREE, ROPE_COUNT)
  scene.add(new THREE.Mesh(
    strapGeo,
    new THREE.MeshPhysicalMaterial({
      map: webbingTexture,
      roughness: 0.72,
      metalness: 0.04,
      color: 0xffffff,
    }),
  ))

  resetRope()
  settleRope()
  updateStrap()
  orientHang()

  bindPointer(nextRenderer.domElement)
  disposed = false
  live.value = true
  nextRenderer.render(scene, camera)
  if (!document.hidden) startLoop()
  } catch {
    disposeScene()
  } finally {
    initInFlight = false
  }
}

function applyResize() {
  const host = mount.value
  if (!host || !renderer || !camera) return
  const w = Math.max(host.clientWidth, 1)
  const h = Math.max(host.clientHeight, 1)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP))
  if (scene) renderer.render(scene, camera)
}

function syncVisibility() {
  if (!allowWebgl() || !intersecting) {
    if (!disposed) disposeScene()
    return
  }
  if (disposed) {
    void initScene()
    return
  }
  if (document.hidden) {
    stopGrab()
    stopLoop()
  }
  else startLoop()
}

onMounted(() => {
  const host = mount.value
  if (!host) return

  phoneMql = window.matchMedia('(max-width: 768px)')
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')

  onPhoneChange = () => syncVisibility()
  onMotionChange = () => syncVisibility()
  phoneMql.addEventListener('change', onPhoneChange)
  motionMql.addEventListener('change', onMotionChange)

  io = new IntersectionObserver(
    (entries) => {
      intersecting = Boolean(entries[entries.length - 1]?.isIntersecting)
      syncVisibility()
    },
    { rootMargin: NEAR_MARGIN, threshold: 0 },
  )
  io.observe(host)

  onVisibility = () => {
    if (document.hidden) {
      stopGrab()
      stopLoop()
    }
    else syncVisibility()
  }
  document.addEventListener('visibilitychange', onVisibility)

  resizeObserver = new ResizeObserver(() => {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      applyResize()
    })
  })
  resizeObserver.observe(host)
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
  resizeObserver?.disconnect()
  resizeObserver = null
  if (resizeRaf) cancelAnimationFrame(resizeRaf)
  resizeRaf = 0
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  onVisibility = null
  if (phoneMql && onPhoneChange) phoneMql.removeEventListener('change', onPhoneChange)
  if (motionMql && onMotionChange) motionMql.removeEventListener('change', onMotionChange)
  phoneMql = null
  motionMql = null
  onPhoneChange = null
  onMotionChange = null
  disposeScene()
})
</script>

<template>
  <div ref="mount" class="coach-pass" :class="{ 'is-live': live }" aria-hidden="true">
    <svg class="coach-pass-fallback" viewBox="0 0 200 360" focusable="false">
      <defs>
        <linearGradient id="cp-metal" x1="18%" y1="0%" x2="86%" y2="100%">
          <stop offset="0%" stop-color="#2a2a2e" />
          <stop offset="48%" stop-color="#111113" />
          <stop offset="100%" stop-color="#070708" />
        </linearGradient>
        <linearGradient id="cp-webbing" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#CCFF00" />
          <stop offset="8%" stop-color="#0a0a0a" />
          <stop offset="92%" stop-color="#0a0a0a" />
          <stop offset="100%" stop-color="#CCFF00" />
        </linearGradient>
        <linearGradient id="cp-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e4e7eb" />
          <stop offset="55%" stop-color="#9aa0a8" />
          <stop offset="100%" stop-color="#6d7278" />
        </linearGradient>
        <linearGradient id="cp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8d59a" />
          <stop offset="100%" stop-color="#8d6a2e" />
        </linearGradient>
      </defs>
      <g transform="rotate(5 100 28)">
        <circle cx="100" cy="22" r="11" fill="url(#cp-steel)" />
        <circle cx="100" cy="22" r="4.5" fill="#CCFF00" />
        <circle cx="100" cy="38" r="7" fill="none" stroke="url(#cp-steel)" stroke-width="3" />
        <rect x="93" y="44" width="14" height="86" rx="3" fill="url(#cp-webbing)" />
        <rect x="88" y="126" width="24" height="28" rx="3" fill="url(#cp-steel)" />
        <circle cx="100" cy="160" r="7" fill="none" stroke="url(#cp-steel)" stroke-width="2.5" />
        <rect x="38" y="166" width="124" height="178" rx="12" fill="url(#cp-metal)" />
        <rect x="38" y="166" width="124" height="178" rx="12" fill="none" stroke="#CCFF00" stroke-width="2" />
        <rect x="50" y="180" width="22" height="16" rx="2" fill="url(#cp-gold)" />
        <text
          x="150"
          y="192"
          text-anchor="end"
          fill="#CCFF00"
          font-family="Space Grotesk, system-ui, sans-serif"
          font-size="9"
          font-weight="700"
        >LIFTAG</text>
        <rect x="50" y="206" width="100" height="1.4" fill="#CCFF00" />
        <text
          x="50"
          y="226"
          fill="rgba(255,255,255,0.4)"
          font-family="JetBrains Mono, SF Mono, monospace"
          font-size="7"
          font-weight="700"
        >COACH</text>
        <text
          x="50"
          y="246"
          fill="#fff"
          font-family="Space Grotesk, system-ui, sans-serif"
          font-size="13"
          font-weight="700"
        >MAYA KOVAC</text>
        <text
          x="50"
          y="262"
          fill="rgba(255,255,255,0.5)"
          font-family="JetBrains Mono, SF Mono, monospace"
          font-size="7"
          font-weight="500"
        >BRATISLAVA</text>
        <circle cx="54" cy="290" r="3.2" fill="#FF2D55" />
        <text
          x="62"
          y="293"
          fill="#FF2D55"
          font-family="JetBrains Mono, SF Mono, monospace"
          font-size="7"
          font-weight="700"
        >VERIFIED</text>
        <text
          x="50"
          y="318"
          fill="rgba(255,255,255,0.32)"
          font-family="JetBrains Mono, SF Mono, monospace"
          font-size="6.5"
          font-weight="500"
        >CP-08-19</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.coach-pass {
  position: relative;
  width: 100%;
  height: 100%;
  contain: layout style;
  user-select: none;
  pointer-events: none;
}

.coach-pass.is-live {
  pointer-events: auto;
}

.coach-pass-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  transition: opacity 400ms ease-out;
}

.coach-pass :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  touch-action: none;
}

.coach-pass.is-live .coach-pass-fallback {
  opacity: 0;
}

.coach-pass.is-live :deep(canvas) {
  opacity: 1;
  transition: opacity 400ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .coach-pass-fallback,
  .coach-pass.is-live :deep(canvas) {
    transition: none;
  }
}
</style>
