import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  ROADMAP_NODE_COUNT,
  ROADMAP_SPARK_COUNT,
  nodeToParticleWorld,
  publishRoadmapArmed,
  publishRoadmapNode,
  publishRoadmapSpark,
  publishRoadmapSpine,
  resetRoadmapParticleField,
  sparkToParticleWorld,
  spineToParticleWorld,
  useRoadmapParticleField,
} from '../composables/useRoadmapParticleField.ts'

afterEach(() => {
  resetRoadmapParticleField()
})

test('useRoadmapParticleField returns the same shared buffer', () => {
  assert.equal(useRoadmapParticleField(), useRoadmapParticleField())
})

test('the field has four node wells, one spine tip, and four root-tip sparks', () => {
  const field = useRoadmapParticleField()
  assert.equal(ROADMAP_NODE_COUNT, 4)
  assert.equal(ROADMAP_SPARK_COUNT, 4)
  assert.equal(field.nodes.length, 4)
  assert.equal(field.sparks.length, 4)
  assert.deepEqual(field.spine, { cx: 0, cy: 0, vy: 0, strength: 0 })
  assert.equal(field.armed, false)
})

test('publishRoadmapNode writes only the requested slot', () => {
  const field = useRoadmapParticleField()
  publishRoadmapNode(2, {
    cx: 12,
    cy: 24,
    radius: 18,
    strength: 0.6,
  })

  assert.deepEqual(field.nodes[2], {
    cx: 12,
    cy: 24,
    radius: 18,
    strength: 0.6,
  })
  assert.equal(field.nodes[0].strength, 0)
  assert.equal(field.nodes[3].strength, 0)
})

test('publishRoadmapNode ignores out-of-range indexes', () => {
  const field = useRoadmapParticleField()
  publishRoadmapNode(-1, {
    cx: 1,
    cy: 1,
    radius: 1,
    strength: 1,
  })
  publishRoadmapNode(4, {
    cx: 1,
    cy: 1,
    radius: 1,
    strength: 1,
  })

  for (const node of field.nodes) {
    assert.equal(node.strength, 0)
  }
})

test('publishRoadmapSpine writes the shared spine tip', () => {
  const field = useRoadmapParticleField()
  publishRoadmapSpine({ cx: 110, cy: 70, vy: 40, strength: 0.8 })
  assert.deepEqual(field.spine, { cx: 110, cy: 70, vy: 40, strength: 0.8 })
})

test('publishRoadmapSpark writes only the requested slot', () => {
  const field = useRoadmapParticleField()
  publishRoadmapSpark(1, { cx: 8, cy: 16, strength: 0.4 })
  assert.deepEqual(field.sparks[1], { cx: 8, cy: 16, strength: 0.4 })
  assert.equal(field.sparks[0].strength, 0)
})

test('publishRoadmapSpark ignores out-of-range indexes', () => {
  const field = useRoadmapParticleField()
  publishRoadmapSpark(-1, { cx: 1, cy: 1, strength: 1 })
  publishRoadmapSpark(4, { cx: 1, cy: 1, strength: 1 })
  for (const spark of field.sparks) {
    assert.equal(spark.strength, 0)
  }
})

test('resetRoadmapParticleField zeros every slot and disarms the field', () => {
  const field = useRoadmapParticleField()
  publishRoadmapNode(0, {
    cx: 10,
    cy: 20,
    radius: 8,
    strength: 1,
  })
  publishRoadmapSpine({ cx: 3, cy: 4, vy: 12, strength: 0.5 })
  publishRoadmapSpark(2, { cx: 9, cy: 11, strength: 0.3 })
  publishRoadmapArmed(true)

  resetRoadmapParticleField()

  for (const node of field.nodes) {
    assert.deepEqual(node, {
      cx: 0,
      cy: 0,
      radius: 0,
      strength: 0,
    })
  }
  assert.deepEqual(field.spine, { cx: 0, cy: 0, vy: 0, strength: 0 })
  for (const spark of field.sparks) {
    assert.deepEqual(spark, { cx: 0, cy: 0, strength: 0 })
  }
  assert.equal(field.armed, false)
})

test('publishRoadmapArmed gates WebGL allocation', () => {
  const field = useRoadmapParticleField()
  publishRoadmapArmed(true)
  assert.equal(field.armed, true)
})

test('nodeToParticleWorld scales the well into camera space', () => {
  const canvas = { left: 0, top: 0, width: 200, height: 100 }
  const world = nodeToParticleWorld(
    {
      cx: 50,
      cy: 25,
      radius: 25,
      strength: 1,
    },
    canvas,
    40,
    20,
  )

  assert.equal(world.cx, -20)
  assert.equal(world.cy, 10)
  assert.equal(world.radius, 10)
  assert.equal(world.strength, 1)
})

test('spineToParticleWorld maps the tip and flips Y velocity', () => {
  const canvas = { left: 0, top: 0, width: 200, height: 100 }
  const world = spineToParticleWorld(
    { cx: 50, cy: 25, vy: 50, strength: 1 },
    canvas,
    40,
    20,
  )

  assert.equal(world.cx, -20)
  assert.equal(world.cy, 10)
  assert.equal(world.vy, -20)
  assert.equal(world.strength, 1)
})

test('sparkToParticleWorld maps the growth-front spark and keeps strength', () => {
  const canvas = { left: 10, top: 20, width: 200, height: 100 }
  const world = sparkToParticleWorld({ cx: 110, cy: 70, strength: 0.7 }, canvas, 40, 20)
  assert.deepEqual(world, { cx: 0, cy: 0, strength: 0.7 })
})
