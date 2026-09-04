// Load the 0B parts graph, instance two black donut plates, and apply assemble
// poses. Shards are identity at rest. After swap, traveling shards hide and
// the static fused body takes the lighting identity; sled + footplate stay.
// Plates drop onto the floor, bounce, then thread the horns.

import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  PIECE_RECIPES,
  pieceAt,
  plateAt,
  recipeFor,
  type AssembleState,
  type PlateSide,
} from './assemble.ts'

const SKIP_NAMES = new Set([
  'plateSource',
  'horn.L',
  'horn.R',
  'HeroParts',
  'Scene',
  'LiftagPlates',
  'LiftagHeroParts',
  'LiftagHeroStatic',
  'LiftagPartsRig',
])

// Nothing drives this group any more - the seated rep is gone. It survives
// because `hero-machine-static.glb` deliberately omits the sled and footplate
// islands, so after the fused swap this is the only thing still holding them
// on screen. Grouping them is the contract; moving them was the film.
export const CARRIAGE_NODE_NAMES = ['footplate', 'sled.L', 'sled.R'] as const

export function createMovableCarriage(
  partsRoot: THREE.Object3D,
  groups: Record<string, THREE.Object3D>,
): THREE.Group | null {
  // GLTFLoader sanitizes periods from node names (`sled.L` -> `sledL`). Keep
  // the authored names as the public contract while accepting that loader
  // representation at the scene-graph boundary.
  const nodes = CARRIAGE_NODE_NAMES.map(name => (
    groups[name]
    ?? Object.entries(groups).find(([key]) => compactName(key) === compactName(name))?.[1]
    ?? partsRoot.getObjectByName(name)
    ?? null
  ))
  if (nodes.some(node => node === null)) return null
  const carriage = new THREE.Group()
  carriage.name = 'LiftagPressCarriage'
  partsRoot.add(carriage)
  for (const node of nodes) carriage.attach(node!)
  return carriage
}

export type DressMaterial = (mat: THREE.MeshStandardMaterial) => void

export type PartsRig = {
  root: THREE.Group
  staticRoot: THREE.Object3D
  groups: Record<string, THREE.Object3D>
  plates: THREE.InstancedMesh
  carriage: THREE.Group
  apply: (state: AssembleState) => void
  dispose: () => void
  silhouette: () => THREE.Group
  swapped: () => boolean
}

async function tryGltf(loader: GLTFLoader, url: string) {
  try {
    return await loader.loadAsync(url)
  }
  catch (err) {
    console.warn('[gymscan] parts asset missing', url, err)
    return null
  }
}

function named(root: THREE.Object3D, name: string): THREE.Object3D | null {
  return root.getObjectByName(name) ?? null
}

function dressTree(root: THREE.Object3D, dress: DressMaterial, shadows: boolean, sink: THREE.MeshStandardMaterial[]) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = shadows
    mesh.receiveShadow = shadows
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial
      if (!std.isMeshStandardMaterial) continue
      dress(std)
      sink.push(std)
    }
  })
}

function compactName(name: string): string {
  return name.replace(/[._]/g, '').toLowerCase()
}

function isSledName(name: string): boolean {
  const n = compactName(name)
  return n === 'sled' || n.startsWith('sled')
}

function isFootName(name: string): boolean {
  return compactName(name) === 'footplate'
}

function collectShards(root: THREE.Object3D): THREE.Object3D[] {
  const out: THREE.Object3D[] = []
  const seen = new Set<THREE.Object3D>()
  for (const name of Object.keys(PIECE_RECIPES)) {
    const node = root.getObjectByName(name)
      ?? root.getObjectByName(name.replace(/\./g, '_'))
      ?? root.getObjectByName(name.replace(/\./g, ''))
    if (!node || seen.has(node) || SKIP_NAMES.has(node.name)) continue
    seen.add(node)
    out.push(node)
  }
  return out
}

/**
 * Olympic-ish iron plate: a donut with a 50 mm hole and a raised rim so the
 * hole reads from the establishing shot. Thickness along X, matching the horn.
 */
export function createIronPlateGeometry(): THREE.BufferGeometry {
  const inner = 0.050
  const rim = 0.188
  const outer = 0.225
  const face = 0.034
  const lip = 0.050
  const pts = [
    new THREE.Vector2(inner, -face * 0.5),
    new THREE.Vector2(rim, -face * 0.5),
    new THREE.Vector2(rim, -lip * 0.5),
    new THREE.Vector2(outer, -lip * 0.5),
    new THREE.Vector2(outer, lip * 0.5),
    new THREE.Vector2(rim, lip * 0.5),
    new THREE.Vector2(rim, face * 0.5),
    new THREE.Vector2(inner, face * 0.5),
  ]
  const geometry = new THREE.LatheGeometry(pts, 32)
  geometry.rotateZ(Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export async function loadPartsRig(
  loader: GLTFLoader,
  opts: {
    dress: DressMaterial
    shadows: boolean
    heroMats: THREE.MeshStandardMaterial[]
  },
): Promise<PartsRig | null> {
  const [partsGltf, staticGltf] = await Promise.all([
    tryGltf(loader, '/assets/gym3d/hero-machine-parts.glb'),
    tryGltf(loader, '/assets/gym3d/hero-machine-static.glb'),
  ])
  if (!partsGltf || !staticGltf) return null

  const partsRoot = partsGltf.scene
  partsRoot.name = 'LiftagHeroParts'
  const staticRoot = staticGltf.scene
  staticRoot.name = 'LiftagHeroStatic'
  staticRoot.visible = false

  const plateSource = named(partsRoot, 'plateSource')
  if (plateSource) plateSource.removeFromParent()

  dressTree(partsRoot, opts.dress, opts.shadows, opts.heroMats)
  dressTree(staticRoot, opts.dress, opts.shadows, opts.heroMats)

  const shards = collectShards(partsRoot)
  if (shards.length < 4) {
    console.warn('[gymscan] parts glb has too few shards', shards.length)
    return null
  }
  const groups: Record<string, THREE.Object3D> = {}
  for (const shard of shards) groups[shard.name] = shard
  const carriage = createMovableCarriage(partsRoot, groups)
  if (!carriage) {
    console.warn('[gymscan] parts glb is missing a carriage node', JSON.stringify({
      missing: CARRIAGE_NODE_NAMES.filter(name => !groups[name]),
      groups: Object.keys(groups),
    }))
    return null
  }

  const plateGeom = createIronPlateGeometry()
  // Unlit black bumper. A Standard/Physical plate picks up the key and the
  // scan-shader rim and reads as a gray disc; the user asked for all black.
  const plateMat = new THREE.MeshBasicMaterial({
    name: 'LIFTAG_Iron',
    color: 0x080808,
  })

  const plates = new THREE.InstancedMesh(plateGeom, plateMat, 2)
  plates.name = 'LiftagPlates'
  plates.castShadow = opts.shadows
  plates.receiveShadow = opts.shadows
  plates.frustumCulled = false
  partsRoot.add(plates)

  const dummy = new THREE.Object3D()
  const plateRest = [new THREE.Vector3(), new THREE.Vector3()]
  const hornL = named(partsRoot, 'horn.L')
  const hornR = named(partsRoot, 'horn.R')
  if (hornL) hornL.getWorldPosition(plateRest[0]!)
  else plateRest[0]!.set(-0.36, 0.25, -0.75)
  if (hornR) hornR.getWorldPosition(plateRest[1]!)
  else plateRest[1]!.set(0.38, 0.27, -0.80)
  if (hornL) hornL.visible = false
  if (hornR) hornR.visible = false

  const axisX = new THREE.Vector3(1, 0, 0)
  const axisY = new THREE.Vector3(0, 1, 0)
  const axisZ = new THREE.Vector3(0, 0, 1)
  const qFace = new THREE.Quaternion()
  const qSpin = new THREE.Quaternion()
  const qAxial = new THREE.Quaternion()
  let didSwap = false

  function dispose() {
    plateGeom.dispose()
    plateMat.dispose()
  }

  function writePlates(state: AssembleState) {
    const show = state.swap || state.platesVisible
    plates.visible = show
    if (!show) return
    for (let i = 0; i < 2; i++) {
      const pose = plateAt(state.t, i as PlateSide, state.phone)
      dummy.position.set(
        plateRest[i]!.x + pose.offsetX,
        plateRest[i]!.y + pose.offsetY,
        plateRest[i]!.z + pose.offsetZ,
      )
      // Yaw the rim onto the roll path, optional camera-face, then roll
      // around the hole axis (plus the sleeve spin once aligned).
      qFace.setFromAxisAngle(axisY, pose.yaw + pose.face * Math.PI * 0.5)
      qSpin.setFromAxisAngle(axisZ, pose.spin)
      qAxial.setFromAxisAngle(axisX, pose.roll + pose.axial)
      dummy.quaternion.copy(qFace).multiply(qSpin).multiply(qAxial)
      dummy.scale.set(pose.visible ? 1 : 0, pose.visible ? 1 : 0, pose.visible ? 1 : 0)
      dummy.updateMatrix()
      plates.setMatrixAt(i, dummy.matrix)
    }
    plates.instanceMatrix.needsUpdate = true
  }

  function restShard(node: THREE.Object3D) {
    node.position.set(0, 0, 0)
    node.rotation.set(0, 0, 0)
  }

  function apply(state: AssembleState) {
    didSwap = state.swap
    const phone = state.phone
    if (state.swap) {
      staticRoot.visible = true
      for (const shard of shards) {
        if (isSledName(shard.name) || isFootName(shard.name)) {
          shard.visible = true
          restShard(shard)
        }
        else {
          shard.visible = false
          restShard(shard)
        }
      }
      writePlates(state)
      return
    }

    staticRoot.visible = false
    for (const shard of shards) {
      const pose = pieceAt(state.t, recipeFor(shard.name, phone), phone)
      shard.visible = pose.visible
      shard.position.set(pose.scatterX, pose.y, pose.scatterZ)
      shard.rotation.set(pose.spinX, pose.spinY, pose.spinZ)
    }
    writePlates(state)
  }

  function silhouette() {
    const g = new THREE.Group()
    g.name = 'LiftagRestSilhouette'
    const addRest = (src: THREE.Object3D) => {
      const clone = src.clone(true)
      clone.visible = true
      clone.traverse((o) => { o.visible = true })
      g.add(clone)
    }
    addRest(staticRoot)
    for (const shard of shards) {
      if (isSledName(shard.name) || isFootName(shard.name)) addRest(shard)
    }
    return g
  }

  const root = new THREE.Group()
  root.name = 'LiftagPartsRig'
  root.add(partsRoot)
  root.add(staticRoot)

  return {
    root,
    staticRoot,
    groups,
    plates,
    carriage,
    apply,
    dispose,
    silhouette,
    swapped: () => didSwap,
  }
}
