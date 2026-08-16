import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DASHBOARD_JOURNEY,
  DASHBOARD_RAIL_SWITCH_AT,
  mapDashboardJourney,
} from '../utils/dashboardScroll.ts'

const {
  openEnd,
  zoomEnd,
  cardFull,
  swapEnd,
  cardOutEnd,
  dwellEnd,
  unzoomEnd,
  coachChromeEnd,
} = DASHBOARD_JOURNEY

test('p=0 is closed with the gym chrome visible and nothing from act 2', () => {
  const state = mapDashboardJourney(0)

  assert.equal(state.open, 0)
  assert.equal(state.zoom, 0)
  assert.equal(state.chrome, 1)
  assert.equal(state.card, 0)
  assert.equal(state.blend, 0)
  assert.equal(state.rail, 0)
  assert.equal(state.coach, 0)
  assert.equal(state.exit, 0)
})

test('mid-open eases the lid while the camera stays put', () => {
  const state = mapDashboardJourney(0.12)

  assert.ok(state.open > 0 && state.open < 1, `open should be in (0, 1), got ${state.open}`)
  assert.equal(state.zoom, 0)
  assert.equal(state.chrome, 1)
})

test('after the lid opens, the camera punches in and the gym copy leaves', () => {
  const state = mapDashboardJourney((openEnd + zoomEnd) / 2)

  assert.equal(state.open, 1)
  assert.ok(state.zoom > 0 && state.zoom < 1, `zoom should be in (0, 1), got ${state.zoom}`)
  assert.equal(state.chrome, 0)
  assert.equal(state.coach, 0)
})

test('the handoff card is fully up before the footage finishes swapping', () => {
  const state = mapDashboardJourney(cardFull)

  assert.equal(state.zoom, 1)
  assert.equal(state.card, 1)
  assert.ok(state.blend > 0 && state.blend < 1, `blend should be mid-swap, got ${state.blend}`)
})

test('the dwell holds the coach footage alone on a locked screen', () => {
  const state = mapDashboardJourney((cardOutEnd + dwellEnd) / 2)

  assert.equal(state.open, 1)
  assert.equal(state.zoom, 1)
  assert.equal(state.card, 0)
  assert.equal(state.blend, 1)
  assert.equal(state.coach, 0)
  assert.equal(state.exit, 0)
})

test('the camera is locked at full zoom across the entire handoff', () => {
  for (let p = zoomEnd; p <= dwellEnd; p += 0.005) {
    assert.equal(mapDashboardJourney(p).zoom, 1, `zoom should stay locked at p=${p}`)
  }
})

test('the un-zoom pulls back out before act 2 copy arrives', () => {
  const midUnzoom = mapDashboardJourney((dwellEnd + unzoomEnd) / 2)
  assert.ok(
    midUnzoom.zoom > 0 && midUnzoom.zoom < 1,
    `zoom should be pulling back, got ${midUnzoom.zoom}`,
  )
  assert.equal(midUnzoom.coach, 0, 'coach copy must not appear while the camera is inside the screen')

  assert.equal(mapDashboardJourney(unzoomEnd).zoom, 0)
})

test('act 2 copy is fully in before the exit begins', () => {
  const state = mapDashboardJourney(coachChromeEnd)

  assert.equal(state.zoom, 0)
  assert.equal(state.coach, 1)
  assert.equal(state.exit, 0)
})

test('p=1 finishes the exit with the coach dashboard on screen', () => {
  const state = mapDashboardJourney(1)

  assert.equal(state.open, 1)
  assert.equal(state.zoom, 0)
  assert.equal(state.blend, 1)
  assert.equal(state.coach, 1)
  assert.equal(state.exit, 1)
})

test('open, blend, rail, coach and exit never decrease as p increases', () => {
  let previous = mapDashboardJourney(0)

  for (let i = 1; i <= 400; i += 1) {
    const p = i / 400
    const next = mapDashboardJourney(p)

    assert.ok(next.open >= previous.open - 1e-12, `open decreased at p=${p}`)
    assert.ok(next.blend >= previous.blend - 1e-12, `blend decreased at p=${p}`)
    assert.ok(next.rail >= previous.rail - 1e-12, `rail decreased at p=${p}`)
    assert.ok(next.coach >= previous.coach - 1e-12, `coach decreased at p=${p}`)
    assert.ok(next.exit >= previous.exit - 1e-12, `exit decreased at p=${p}`)

    previous = next
  }
})

// The one channel that is deliberately non-monotonic: it has to come back down
// for the reveal, so it is checked as two monotonic halves around the dwell.
test('zoom rises to the dwell and falls after it, without stepping', () => {
  let previous = mapDashboardJourney(0).zoom
  for (let p = 0; p <= dwellEnd; p += 1 / 400) {
    const next = mapDashboardJourney(p).zoom
    assert.ok(next >= previous - 1e-12, `zoom decreased before the dwell at p=${p}`)
    previous = next
  }

  previous = mapDashboardJourney(dwellEnd).zoom
  for (let p = dwellEnd; p <= 1; p += 1 / 400) {
    const next = mapDashboardJourney(p).zoom
    assert.ok(next <= previous + 1e-12, `zoom increased after the dwell at p=${p}`)
    previous = next
  }
})

test('gym chrome is gone whenever the camera is fully zoomed in', () => {
  for (let i = 0; i <= 400; i += 1) {
    const p = i / 400
    const state = mapDashboardJourney(p)
    if (state.zoom === 1) {
      assert.equal(state.chrome, 0, `chrome should be 0 when zoom is 1 (p=${p})`)
    }
  }
})

test('the two acts never show their copy at the same time', () => {
  for (let i = 0; i <= 400; i += 1) {
    const state = mapDashboardJourney(i / 400)
    assert.ok(
      state.chrome === 0 || state.coach === 0,
      `gym chrome (${state.chrome}) and coach copy (${state.coach}) overlapped at p=${i / 400}`,
    )
  }
})

test('the rail runs the locked window and is full when the un-zoom starts', () => {
  assert.equal(mapDashboardJourney(zoomEnd).rail, 0)
  assert.equal(mapDashboardJourney(dwellEnd).rail, 1)
  assert.ok(mapDashboardJourney((zoomEnd + dwellEnd) / 2).rail > 0)
})

test('the rail tick sits exactly where the footage finishes swapping', () => {
  const atTick = mapDashboardJourney(swapEnd)

  assert.ok(
    Math.abs(atTick.rail - DASHBOARD_RAIL_SWITCH_AT) < 1e-12,
    `rail was ${atTick.rail} at the swap but the tick is drawn at ${DASHBOARD_RAIL_SWITCH_AT}`,
  )
  assert.ok(
    DASHBOARD_RAIL_SWITCH_AT > 0 && DASHBOARD_RAIL_SWITCH_AT < 1,
    'the tick has to land inside the rail to be visible',
  )
  assert.equal(atTick.blend, 1, 'the footage must be fully swapped when the fill reaches the tick')
})

test('reduced motion stacks both acts statically with the coach footage shown', () => {
  const state = mapDashboardJourney(1, true)

  assert.deepEqual(state, {
    open: 1,
    zoom: 0,
    chrome: 1,
    card: 0,
    blend: 1,
    rail: 1,
    coach: 1,
    exit: 0,
  })
})
