import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import {
  CARRIAGE_NODE_NAMES,
  createMovableCarriage,
} from '../utils/gymscan/parts.ts'

test('carriage contains exactly the three moving machine nodes and preserves world pose', () => {
  assert.deepEqual([...CARRIAGE_NODE_NAMES], ['footplate', 'sled.L', 'sled.R'])
  const root = new THREE.Group()
  root.position.set(2, 3, 4)
  const groups: Record<string, THREE.Object3D> = {}
  for (const [i, name] of CARRIAGE_NODE_NAMES.entries()) {
    const node = new THREE.Object3D()
    node.name = name
    node.position.set(i, i + 1, i + 2)
    root.add(node)
    groups[name] = node
  }
  const fixed = new THREE.Object3D()
  fixed.name = 'horns.L'
  root.add(fixed)
  groups[fixed.name] = fixed
  root.updateMatrixWorld(true)
  const before = CARRIAGE_NODE_NAMES.map(name => groups[name]!.getWorldPosition(new THREE.Vector3()).toArray())
  const carriage = createMovableCarriage(root, groups)!
  root.updateMatrixWorld(true)
  assert.deepEqual(carriage.children.map(child => child.name).sort(), [...CARRIAGE_NODE_NAMES].sort())
  assert.equal(fixed.parent, root)
  assert.deepEqual(CARRIAGE_NODE_NAMES.map(name => groups[name]!.getWorldPosition(new THREE.Vector3()).toArray()), before)
})

test('the carriage groups the sled and footplate without moving them', () => {
  // The rep is gone, so this group exists only to keep the two islands that
  // `hero-machine-static.glb` omits on screen after the fused swap. It must
  // sit at the identity or the machine reassembles a few centimetres wrong.
  const root = new THREE.Group()
  const groups: Record<string, THREE.Object3D> = {}
  for (const name of CARRIAGE_NODE_NAMES) {
    const node = new THREE.Object3D()
    node.name = name
    root.add(node)
    groups[name] = node
  }
  const carriage = createMovableCarriage(root, groups)!
  assert.deepEqual(carriage.position.toArray(), [0, 0, 0])
  assert.deepEqual(carriage.quaternion.toArray(), [0, 0, 0, 1])
  assert.deepEqual(carriage.scale.toArray(), [1, 1, 1])
})

test('carriage lookup tolerates the loader stripping periods from node names', () => {
  const root = new THREE.Group()
  const groups: Record<string, THREE.Object3D> = {}
  for (const name of CARRIAGE_NODE_NAMES) {
    const node = new THREE.Object3D()
    node.name = name.replace(/\./g, '')
    root.add(node)
    groups[node.name] = node
  }
  const carriage = createMovableCarriage(root, groups)
  assert.ok(carriage, 'sledL / sledR must still resolve to sled.L / sled.R')
  assert.equal(carriage!.children.length, CARRIAGE_NODE_NAMES.length)
})

test('a missing carriage node fails loudly instead of grouping a partial sled', () => {
  const root = new THREE.Group()
  const groups: Record<string, THREE.Object3D> = {}
  const node = new THREE.Object3D()
  node.name = 'footplate'
  root.add(node)
  groups[node.name] = node
  assert.equal(createMovableCarriage(root, groups), null)
})
