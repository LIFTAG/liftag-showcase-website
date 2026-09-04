import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  STICKY_MOMENTUM,
  stepStickyMomentum,
  stickyMomentumFrame,
  stickyWallLeftover,
} from '../utils/stickyMomentum.ts'

test('unpinned scroll down trails instead of copying layout 1:1', () => {
  const next = stepStickyMomentum(
    { offset: 0, velocity: 0 },
    { scrollDelta: 40, layoutDelta: -40, dtMs: 16.667 },
  )

  assert.equal(stickyWallLeftover(40, -40), 0)
  assert.ok(next.offset > 0, `expected the photo to lag below the box, got ${next.offset}`)
  assert.ok(next.offset < 12, `trail should stay slight, got ${next.offset}`)
})

test('hitting the top pin continues the photo upward past the limit', () => {
  const next = stepStickyMomentum(
    { offset: 0, velocity: 0 },
    { scrollDelta: 40, layoutDelta: 0, dtMs: 16.667 },
  )

  assert.equal(stickyWallLeftover(40, 0), -40)
  assert.ok(next.offset < 0, `expected overshoot above the pin, got ${next.offset}`)
})

test('hitting the pin while scrolling up continues the photo downward', () => {
  const next = stepStickyMomentum(
    { offset: 0, velocity: 0 },
    { scrollDelta: -40, layoutDelta: 0, dtMs: 16.667 },
  )

  assert.ok(next.offset > 0, `expected overshoot below the pin, got ${next.offset}`)
})

test('after the pin catches, leftover motion fades and springs back to the box', () => {
  let state = stepStickyMomentum(
    { offset: 0, velocity: 0 },
    { scrollDelta: 40, layoutDelta: 0, dtMs: 16.667 },
  )
  const overshoot = state.offset
  assert.ok(overshoot < 0)

  for (let i = 0; i < 48; i += 1) {
    state = stepStickyMomentum(state, { scrollDelta: 0, layoutDelta: 0, dtMs: 16.667 })
  }

  assert.ok(overshoot < state.offset, 'should have moved back toward the pin')
  assert.ok(state.offset <= 0.5, `should not bounce past the pin, got ${state.offset}`)
  assert.deepEqual(state, { offset: 0, velocity: 0 })
})

test('the spring settles to exact rest instead of hovering around epsilon', () => {
  let state = { offset: 0.04, velocity: 0.04 }
  for (let i = 0; i < 8; i += 1) {
    state = stepStickyMomentum(state, { scrollDelta: 0, layoutDelta: 0, dtMs: 16.667 })
  }
  assert.deepEqual(state, { offset: 0, velocity: 0 })
})

test('velocity does not wind up once the offset is already at the cap', () => {
  const next = stepStickyMomentum(
    { offset: -STICKY_MOMENTUM.maxOffset, velocity: 0 },
    { scrollDelta: 80, layoutDelta: 0, dtMs: 16.667 },
  )
  assert.ok(
    next.velocity > 0,
    `spring should start the return, not pile on more escape velocity (${next.velocity})`,
  )
})

test('offset and velocity stay inside the designed caps', () => {
  let state = { offset: 0, velocity: 0 }
  for (let i = 0; i < 12; i += 1) {
    state = stepStickyMomentum(state, { scrollDelta: 120, layoutDelta: 0, dtMs: 16.667 })
  }
  assert.ok(Math.abs(state.offset) <= STICKY_MOMENTUM.maxOffset)
  assert.ok(Math.abs(state.velocity) <= STICKY_MOMENTUM.maxVelocity)
})

test('a 120Hz frame is half a 60Hz frame so stiffness does not double', () => {
  assert.ok(Math.abs(stickyMomentumFrame(1000 / 60) - 1) < 1e-9)
  assert.ok(Math.abs(stickyMomentumFrame(1000 / 120) - 0.5) < 1e-9)
})
