// Shared iPhone-style mesh used by the marketing hero (`Phone3D.vue`) and by
// the gym-scan fold. Dimensions, bevel, materials and the back-camera cluster
// have to stay identical or the two shots read as different devices.
import * as THREE from 'three'

export const PHONE_W = 0.95
export const PHONE_H = 1.95
export const PHONE_D = 0.08
export const PHONE_R = 0.14
export const PHONE_BEZEL = 0.025
export const PHONE_SCR_W = PHONE_W - PHONE_BEZEL * 2
export const PHONE_SCR_H = PHONE_H - PHONE_BEZEL * 2
export const PHONE_SCR_R = PHONE_R - PHONE_BEZEL
export const PHONE_SCREEN_Z = PHONE_D / 2 + 0.013
export const PHONE_ISLAND = {
  width: 0.26,
  height: 0.065,
  y: PHONE_SCR_H / 2 - 0.06,
  z: PHONE_D / 2 + 0.0145,
} as const
export const PHONE_REST_ROT_X = 0.08
export const PHONE_REST_ROT_Y = -0.12
export const PHONE_CAM_FOV = 30
export const PHONE_CAM_Z = 3.92
/**
 * Back camera bar — keep in sync with `createPhoneModel`.
 * Newer iPhones run a plateau across almost the full width; the three
 * lenses sit in a triangle on the left.
 */
export const PHONE_CAM_HOUSING = {
  x: 0,
  y: 0.7,
  w: 0.91,
  h: 0.355,
  r: 0.11,
} as const
export const PHONE_LENS_R = 0.045
export const PHONE_LENSES = [
  { x: 0.345, y: 0.8 },
  { x: 0.185, y: 0.8 },
  { x: 0.265, y: 0.64 },
] as const

export function phoneRoundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  const hw = w / 2
  const hh = h / 2

  shape.moveTo(-hw + r, -hh)
  shape.lineTo(hw - r, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r)
  shape.lineTo(hw, hh - r)
  shape.quadraticCurveTo(hw, hh, hw - r, hh)
  shape.lineTo(-hw + r, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r)
  shape.lineTo(-hw, -hh + r)
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh)

  return shape
}

/**
 * The top band of the screen: the same corner radius as the glass, with a
 * pill hole so a video plane cannot cover the Dynamic Island.
 */
export function phoneScreenHeaderShape(headerH: number) {
  const hw = PHONE_SCR_W / 2
  const top = PHONE_SCR_H / 2
  const bot = top - Math.min(headerH, PHONE_SCR_H)
  const r = PHONE_SCR_R
  const shape = new THREE.Shape()
  shape.moveTo(-hw, bot)
  shape.lineTo(hw, bot)
  shape.lineTo(hw, top - r)
  shape.quadraticCurveTo(hw, top, hw - r, top)
  shape.lineTo(-hw + r, top)
  shape.quadraticCurveTo(-hw, top, -hw, top - r)
  shape.lineTo(-hw, bot)

  const pad = 0.01
  const diW = PHONE_ISLAND.width + pad * 2
  const diH = PHONE_ISLAND.height + pad * 2
  const diR = diH / 2
  const hole = new THREE.Path()
  hole.absarc(-diW / 2 + diR, PHONE_ISLAND.y, diR, -Math.PI / 2, Math.PI / 2, true)
  hole.absarc(diW / 2 - diR, PHONE_ISLAND.y, diR, Math.PI / 2, -Math.PI / 2, true)
  shape.holes.push(hole)
  return shape
}

export function phoneScreenHeaderGeometry(headerH: number) {
  const shape = phoneScreenHeaderShape(headerH)
  const geometry = new THREE.ShapeGeometry(shape, 20)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(pos.count * 2)
  const top = PHONE_SCR_H / 2
  const bot = top - Math.min(headerH, PHONE_SCR_H)
  const span = Math.max(1e-6, top - bot)
  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + PHONE_SCR_W / 2) / PHONE_SCR_W
    uvs[i * 2 + 1] = (pos.getY(i) - bot) / span
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  return geometry
}

export type PhoneModel = {
  group: THREE.Group
  screen: THREE.Mesh
  glass: THREE.Mesh
}

export function createPhoneModel(opts: {
  screenMaterial: THREE.Material
  castShadow?: boolean
}): PhoneModel {
  const castShadow = Boolean(opts.castShadow)

  const bodyGeo = new THREE.ExtrudeGeometry(phoneRoundedRect(PHONE_W, PHONE_H, PHONE_R), {
    steps: 1,
    depth: PHONE_D,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 5,
  })
  bodyGeo.center()

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c1c1e,
    metalness: 0.95,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.castShadow = castShadow

  const screenGeo = new THREE.ShapeGeometry(phoneRoundedRect(PHONE_SCR_W, PHONE_SCR_H, PHONE_SCR_R))
  const pos = screenGeo.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + PHONE_SCR_W / 2) / PHONE_SCR_W
    uvs[i * 2 + 1] = (pos.getY(i) + PHONE_SCR_H / 2) / PHONE_SCR_H
  }
  screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  const screen = new THREE.Mesh(screenGeo, opts.screenMaterial)
  screen.position.z = PHONE_SCREEN_Z

  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(phoneRoundedRect(PHONE_SCR_W, PHONE_SCR_H, PHONE_SCR_R)),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
    }),
  )
  glass.position.z = PHONE_D / 2 + 0.014

  const diW = PHONE_ISLAND.width
  const diH = PHONE_ISLAND.height
  const diShape = new THREE.Shape()
  const diR = diH / 2
  diShape.absarc(diW / 2 - diR, 0, diR, -Math.PI / 2, Math.PI / 2, false)
  diShape.absarc(-diW / 2 + diR, 0, diR, Math.PI / 2, -Math.PI / 2, false)

  const dynamicIsland = new THREE.Mesh(
    new THREE.ShapeGeometry(diShape),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  )
  dynamicIsland.position.set(0, PHONE_ISLAND.y, PHONE_ISLAND.z)
  dynamicIsland.renderOrder = 4

  const btnMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a2e,
    metalness: 0.95,
    roughness: 0.15,
  })

  const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.19, 0.05), btnMat)
  powerBtn.position.set(PHONE_W / 2 + 0.014, 0.35, 0)

  const volUp = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.05), btnMat)
  volUp.position.set(-PHONE_W / 2 - 0.014, 0.36, 0)

  const volDown = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.05), btnMat)
  volDown.position.set(-PHONE_W / 2 - 0.014, 0.16, 0)

  const muteSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, 0.04), btnMat)
  muteSwitch.position.set(-PHONE_W / 2 - 0.014, 0.58, 0)

  const camHousing = new THREE.Mesh(
    new THREE.ExtrudeGeometry(phoneRoundedRect(PHONE_CAM_HOUSING.w, PHONE_CAM_HOUSING.h, PHONE_CAM_HOUSING.r), {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 3,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1e,
      metalness: 0.9,
      roughness: 0.2,
    }),
  )
  camHousing.position.set(PHONE_CAM_HOUSING.x, PHONE_CAM_HOUSING.y, -PHONE_D / 2 - 0.02)

  const lensGeo = new THREE.CylinderGeometry(PHONE_LENS_R, PHONE_LENS_R, 0.02, 24)
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a12,
    metalness: 0.5,
    roughness: 0.05,
    clearcoat: 1,
  })
  const lensRingGeo = new THREE.TorusGeometry(0.048, 0.005, 8, 32)
  const lensRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x333338,
    metalness: 0.95,
    roughness: 0.1,
  })

  function makeLens(x: number, y: number) {
    const lens = new THREE.Mesh(lensGeo, lensMat)
    lens.rotation.x = Math.PI / 2
    lens.position.set(x, y, -PHONE_D / 2 - 0.03)

    const ring = new THREE.Mesh(lensRingGeo, lensRingMat)
    ring.position.set(x, y, -PHONE_D / 2 - 0.022)

    return [lens, ring] as const
  }

  const [l1, r1] = makeLens(PHONE_LENSES[0].x, PHONE_LENSES[0].y)
  const [l2, r2] = makeLens(PHONE_LENSES[1].x, PHONE_LENSES[1].y)
  const [l3, r3] = makeLens(PHONE_LENSES[2].x, PHONE_LENSES[2].y)

  const group = new THREE.Group()
  group.add(body, screen, glass, dynamicIsland, powerBtn, volUp, volDown, muteSwitch)
  group.add(camHousing, l1, r1, l2, r2, l3, r3)

  return { group, screen, glass }
}
