import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DASHBOARD_CHAPTER_COUNT,
  DASHBOARD_CHAPTERS,
  DASHBOARD_COACH_CHAPTER,
  DASHBOARD_JOURNEY,
  DASHBOARD_TRAINERS_AT,
  dashboardChapterAt,
  dashboardChapterStart,
  isTrainersHash,
  mapDashboardJourney,
  trainerHandoffOffset,
} from '../utils/dashboardScroll.ts'

const {
  openEnd,
  zoomEnd,
  chaptersEnd,
  unzoomEnd,
  coachStart,
  coachChromeEnd,
} = DASHBOARD_JOURNEY

test('p=0 is closed with the gym chrome visible and nothing from act 2', () => {
  const state = mapDashboardJourney(0)

  assert.equal(state.open, 0)
  assert.equal(state.zoom, 0)
  assert.equal(state.chrome, 1)
  assert.equal(state.blend, 0)
  assert.equal(state.chapter, 0)
  assert.equal(state.spine, 0)
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

test('six named chapters fill the locked window', () => {
  assert.equal(DASHBOARD_CHAPTERS.length, DASHBOARD_CHAPTER_COUNT)
  assert.equal(DASHBOARD_CHAPTERS.filter((chapter) => chapter.act === 'gym').length, 3)
  assert.equal(DASHBOARD_CHAPTERS.filter((chapter) => chapter.act === 'coach').length, 3)
  assert.equal(DASHBOARD_COACH_CHAPTER, 3)
  assert.equal(DASHBOARD_CHAPTERS[DASHBOARD_COACH_CHAPTER].act, 'coach')
})

test('the trainers hash offset is the first coach chapter', () => {
  const sectionHeight = 5600
  const viewportHeight = 1000
  const offset = trainerHandoffOffset(sectionHeight, viewportHeight)

  assert.equal(offset, DASHBOARD_TRAINERS_AT * (sectionHeight - viewportHeight))
  assert.equal(DASHBOARD_TRAINERS_AT, dashboardChapterStart(DASHBOARD_COACH_CHAPTER))
  assert.ok(isTrainersHash('#trainers'))
  assert.equal(isTrainersHash('#dashboard'), false)
})

test('the first coach chapter starts after the gym chapters and before un-zoom', () => {
  const start = dashboardChapterStart(DASHBOARD_COACH_CHAPTER)
  assert.ok(start > zoomEnd)
  assert.ok(start < chaptersEnd)
  assert.equal(dashboardChapterAt(start).chapter, DASHBOARD_COACH_CHAPTER)
  assert.ok(dashboardChapterAt(start).chapterProgress < 0.05)
})

test('the camera is locked at full zoom across every chapter', () => {
  for (let p = zoomEnd; p <= chaptersEnd; p += 0.005) {
    assert.equal(mapDashboardJourney(p).zoom, 1, `zoom should stay locked at p=${p}`)
  }
})

test('act 2 copy starts arriving partway through the un-zoom, not after it', () => {
  assert.ok(
    coachStart > chaptersEnd && coachStart < unzoomEnd,
    `coachStart ${coachStart} should fall inside the un-zoom (${chaptersEnd}..${unzoomEnd})`,
  )

  const atStart = mapDashboardJourney(coachStart)
  assert.ok(atStart.zoom > 0, 'the camera should still be pulling back when the copy starts')
  assert.equal(atStart.coach, 0)

  const justAfter = mapDashboardJourney(coachStart + 0.02)
  assert.ok(justAfter.coach > 0, 'coach copy should be fading in during the un-zoom')
  assert.ok(justAfter.zoom > 0, 'and it should overlap the tail of the camera move')

  assert.equal(mapDashboardJourney(unzoomEnd).zoom, 0)
})

test('act 2 copy stays hidden through the punch-in and the chapters', () => {
  for (let p = 0; p <= chaptersEnd; p += 1 / 400) {
    assert.equal(
      mapDashboardJourney(p).coach, 0,
      `coach copy leaked into act 1 or the chapters at p=${p}`,
    )
  }
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
  assert.equal(state.chapter, DASHBOARD_CHAPTER_COUNT - 1)
  assert.equal(state.coach, 1)
  assert.equal(state.exit, 1)
})

test('open, blend, coach and exit never decrease as p increases', () => {
  let previous = mapDashboardJourney(0)

  for (let i = 1; i <= 400; i += 1) {
    const p = i / 400
    const next = mapDashboardJourney(p)

    assert.ok(next.open >= previous.open - 1e-12, `open decreased at p=${p}`)
    assert.ok(next.blend >= previous.blend - 1e-12, `blend decreased at p=${p}`)
    assert.ok(next.coach >= previous.coach - 1e-12, `coach decreased at p=${p}`)
    assert.ok(next.exit >= previous.exit - 1e-12, `exit decreased at p=${p}`)

    previous = next
  }
})

test('zoom rises to the chapters and falls after them, without stepping', () => {
  let previous = mapDashboardJourney(0).zoom
  for (let p = 0; p <= chaptersEnd; p += 1 / 400) {
    const next = mapDashboardJourney(p).zoom
    assert.ok(next >= previous - 1e-12, `zoom decreased before the chapters ended at p=${p}`)
    previous = next
  }

  previous = mapDashboardJourney(chaptersEnd).zoom
  for (let p = chaptersEnd; p <= 1; p += 1 / 400) {
    const next = mapDashboardJourney(p).zoom
    assert.ok(next <= previous + 1e-12, `zoom increased after the chapters at p=${p}`)
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

test('the spine rides the zoom so it is only on during the locked window', () => {
  assert.equal(mapDashboardJourney(0).spine, 0)
  assert.equal(mapDashboardJourney(zoomEnd).spine, 1)
  assert.equal(mapDashboardJourney((zoomEnd + chaptersEnd) / 2).spine, 1)
  assert.equal(mapDashboardJourney(chaptersEnd).spine, 1)
  assert.equal(mapDashboardJourney(unzoomEnd).spine, 0)
})

test('footage blend stays gym until the first coach chapter, then takes over', () => {
  const before = mapDashboardJourney(dashboardChapterStart(DASHBOARD_COACH_CHAPTER - 1) + 0.01)
  assert.equal(before.blend, 0)
  assert.equal(before.chapter, DASHBOARD_COACH_CHAPTER - 1)

  const atSwitch = mapDashboardJourney(dashboardChapterStart(DASHBOARD_COACH_CHAPTER))
  assert.ok(atSwitch.blend < 0.05, `blend at the switch should be near 0, got ${atSwitch.blend}`)

  const midSwitch = mapDashboardJourney(
    dashboardChapterStart(DASHBOARD_COACH_CHAPTER) + (dashboardChapterStart(DASHBOARD_COACH_CHAPTER + 1) - dashboardChapterStart(DASHBOARD_COACH_CHAPTER)) * 0.35,
  )
  assert.ok(midSwitch.blend > 0.9, `blend should have finished the dissolve, got ${midSwitch.blend}`)

  assert.equal(mapDashboardJourney(chaptersEnd).blend, 1)
})

test('chapter progress is 0 at a chapter start and 1 at the last chapter end', () => {
  for (let i = 0; i < DASHBOARD_CHAPTER_COUNT; i += 1) {
    const at = dashboardChapterAt(dashboardChapterStart(i))
    assert.equal(at.chapter, i)
    assert.ok(at.chapterProgress < 1e-9, `chapter ${i} should start at 0, got ${at.chapterProgress}`)
  }

  const last = dashboardChapterAt(chaptersEnd)
  assert.equal(last.chapter, DASHBOARD_CHAPTER_COUNT - 1)
  assert.equal(last.chapterProgress, 1)
})

test('reduced motion stacks both acts statically with the coach footage shown', () => {
  const state = mapDashboardJourney(1, true)

  assert.deepEqual(state, {
    open: 1,
    zoom: 0,
    chrome: 1,
    blend: 1,
    chapter: DASHBOARD_CHAPTER_COUNT - 1,
    chapterProgress: 1,
    spine: 0,
    coach: 1,
    exit: 0,
  })
})
