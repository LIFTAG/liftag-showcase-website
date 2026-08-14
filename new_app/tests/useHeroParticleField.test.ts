import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  clientToParticleWorld,
  decayHeroParticleWake,
  finishHeroLaserWall,
  publishHeroLaserWall,
  resetHeroParticleField,
  revealedWordBox,
  useHeroParticleField,
  wallToParticleWorld,
} from '../composables/useHeroParticleField.ts'

afterEach(() => {
  resetHeroParticleField()
})

test('useHeroParticleField returns the same shared buffer', () => {
  assert.equal(useHeroParticleField(), useHeroParticleField())
})

test('resetHeroParticleField zeros both wall slots', () => {
  const field = useHeroParticleField()
  publishHeroLaserWall({ cx: 10, cy: 20, hw: 30, hh: 40, leadingX: 40 }, 80, 1)
  finishHeroLaserWall()
  resetHeroParticleField()
  for (const wall of field.walls) {
    assert.deepEqual(wall, { cx: 0, cy: 0, hw: 0, hh: 0, vx: 0, strength: 0 })
  }
})

test('revealedWordBox grows a left-to-right sliver from the left edge', () => {
  const rect = { left: 100, top: 40, width: 200, height: 80 }

  const start = revealedWordBox(rect, false, 0)
  assert.equal(start.hw, 2)
  assert.equal(start.cx, 102)
  assert.equal(start.cy, 80)
  assert.equal(start.hh, 40)
  assert.equal(start.leadingX, 104)

  const mid = revealedWordBox(rect, false, 0.5)
  assert.equal(mid.hw, 50)
  assert.equal(mid.cx, 150)
  assert.equal(mid.leadingX, 200)

  const done = revealedWordBox(rect, false, 1)
  assert.equal(done.hw, 100)
  assert.equal(done.cx, 200)
  assert.equal(done.leadingX, 300)
})

test('revealedWordBox grows a right-to-left sliver from the right edge', () => {
  const rect = { left: 100, top: 40, width: 200, height: 80 }

  const start = revealedWordBox(rect, true, 0)
  assert.equal(start.hw, 2)
  assert.equal(start.cx, 298)
  assert.equal(start.leadingX, 296)

  const mid = revealedWordBox(rect, true, 0.5)
  assert.equal(mid.hw, 50)
  assert.equal(mid.cx, 250)
  assert.equal(mid.leadingX, 200)

  const done = revealedWordBox(rect, true, 1)
  assert.equal(done.hw, 100)
  assert.equal(done.cx, 200)
  assert.equal(done.leadingX, 100)
})

test('publishHeroLaserWall writes slot 0 only', () => {
  const field = useHeroParticleField()
  publishHeroLaserWall({ cx: 12, cy: 24, hw: 8, hh: 16, leadingX: 20 }, -40, 0.6)
  assert.deepEqual(field.walls[0], { cx: 12, cy: 24, hw: 8, hh: 16, vx: -40, strength: 0.6 })
  assert.equal(field.walls[1].strength, 0)
})

test('finishHeroLaserWall copies the live wall into the wake slot and clears slot 0', () => {
  const field = useHeroParticleField()
  publishHeroLaserWall({ cx: 12, cy: 24, hw: 8, hh: 16, leadingX: 20 }, 55, 1)
  finishHeroLaserWall()
  assert.deepEqual(field.walls[1], { cx: 12, cy: 24, hw: 8, hh: 16, vx: 55, strength: 1 })
  assert.deepEqual(field.walls[0], { cx: 0, cy: 0, hw: 0, hh: 0, vx: 0, strength: 0 })
})

test('decayHeroParticleWake eases only the wake slot down to zero', () => {
  const field = useHeroParticleField()
  publishHeroLaserWall({ cx: 1, cy: 2, hw: 3, hh: 4, leadingX: 4 }, 10, 1)
  finishHeroLaserWall()
  publishHeroLaserWall({ cx: 9, cy: 8, hw: 7, hh: 6, leadingX: 16 }, 3, 0.8)

  decayHeroParticleWake(250, 500)
  assert.equal(field.walls[1].strength, 0.5)
  assert.equal(field.walls[0].strength, 0.8)

  decayHeroParticleWake(400, 500)
  assert.equal(field.walls[1].strength, 0)
})

test('clientToParticleWorld maps the canvas center and top-left into camera space', () => {
  const canvas = { left: 10, top: 20, width: 200, height: 100 }
  const center = clientToParticleWorld(110, 70, canvas, 40, 20)
  assert.deepEqual(center, { x: 0, y: 0 })

  const topLeft = clientToParticleWorld(10, 20, canvas, 40, 20)
  assert.deepEqual(topLeft, { x: -40, y: 20 })
})

test('wallToParticleWorld scales the box and leading-edge velocity into world units', () => {
  const canvas = { left: 0, top: 0, width: 200, height: 100 }
  const world = wallToParticleWorld(
    { cx: 50, cy: 25, hw: 25, hh: 25, vx: 100, strength: 1 },
    canvas,
    40,
    20,
  )
  assert.equal(world.cx, -20)
  assert.equal(world.cy, 10)
  assert.equal(world.hw, 10)
  assert.equal(world.hh, 10)
  assert.equal(world.vx, 40)
  assert.equal(world.strength, 1)
})
