import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mapDashboardScroll } from '../utils/dashboardScroll.ts'

test('p=0 is closed with chrome visible', () => {
  const state = mapDashboardScroll(0)

  assert.equal(state.open, 0)
  assert.equal(state.zoom, 0)
  assert.equal(state.exit, 0)
  assert.equal(state.chrome, 1)
})

test('mid-open eases the lid while zoom stays closed', () => {
  const state = mapDashboardScroll(0.21)

  assert.ok(state.open > 0 && state.open < 1, `open should be in (0, 1), got ${state.open}`)
  assert.equal(state.zoom, 0)
  assert.equal(state.exit, 0)
  assert.equal(state.chrome, 1)
})

test('after the lid opens, zoom is in progress', () => {
  const state = mapDashboardScroll(0.46)

  assert.equal(state.open, 1)
  assert.ok(state.zoom > 0 && state.zoom < 1, `zoom should be in (0, 1), got ${state.zoom}`)
  assert.equal(state.exit, 0)
  assert.ok(state.chrome < 1)
})

test('copy and chips are gone while the camera is still punching in', () => {
  const state = mapDashboardScroll(0.46)

  assert.ok(state.zoom > 0 && state.zoom < 1)
  assert.equal(state.chrome, 0)
})

test('after zoom the camera stays locked through the hold', () => {
  const state = mapDashboardScroll(0.70)

  assert.equal(state.open, 1)
  assert.equal(state.zoom, 1)
  assert.equal(state.exit, 0)
  assert.equal(state.chrome, 0)
})

test('p=1 holds the framed screen and finishes the exit', () => {
  const state = mapDashboardScroll(1)

  assert.equal(state.open, 1)
  assert.equal(state.zoom, 1)
  assert.equal(state.exit, 1)
  assert.equal(state.chrome, 0)
})

test('open, zoom, and exit never decrease as p increases', () => {
  let previous = mapDashboardScroll(0)

  for (let i = 1; i <= 200; i += 1) {
    const p = i / 200
    const next = mapDashboardScroll(p)

    assert.ok(next.open >= previous.open - 1e-12, `open decreased at p=${p}`)
    assert.ok(next.zoom >= previous.zoom - 1e-12, `zoom decreased at p=${p}`)
    assert.ok(next.exit >= previous.exit - 1e-12, `exit decreased at p=${p}`)

    previous = next
  }
})

test('chrome is gone once the camera is fully zoomed in', () => {
  for (let i = 0; i <= 100; i += 1) {
    const state = mapDashboardScroll(i / 100)
    if (state.zoom === 1) {
      assert.equal(state.chrome, 0, `chrome should be 0 when zoom is 1 (p=${i / 100})`)
    }
  }
})

test('reduced motion opens the laptop with the poster and no cinematic motion', () => {
  const state = mapDashboardScroll(1, true)

  assert.deepEqual(state, {
    open: 1,
    zoom: 0,
    exit: 0,
    chrome: 1,
  })
})
