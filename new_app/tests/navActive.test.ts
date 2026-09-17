import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NAV_ACTIVE_PREFIXES, navCurrent } from '../utils/navActive.ts'

test('the link destination itself is the current page', () => {
  assert.equal(navCurrent('/journal', NAV_ACTIVE_PREFIXES.journal), 'page')
  assert.equal(navCurrent('/journal/', NAV_ACTIVE_PREFIXES.journal), 'page')
})

test('subpages mark their section link as the current location', () => {
  assert.equal(navCurrent('/journal/progressive-overload', NAV_ACTIVE_PREFIXES.journal), 'location')
  assert.equal(navCurrent('/exercises/bench-press', NAV_ACTIVE_PREFIXES.exercises), 'location')
})

test('only matches on a segment boundary', () => {
  assert.equal(navCurrent('/exercises-archive', NAV_ACTIVE_PREFIXES.exercises), undefined)
  assert.equal(navCurrent('/demos', NAV_ACTIVE_PREFIXES.demo), undefined)
})

test('catalog and discovery pages map to their nav item', () => {
  assert.equal(navCurrent('/machines/leg-press', NAV_ACTIVE_PREFIXES.exercises), 'location')
  assert.equal(navCurrent('/muscles', NAV_ACTIVE_PREFIXES.exercises), 'location')
  assert.equal(navCurrent('/gyms/42/equipment', NAV_ACTIVE_PREFIXES.gyms), 'location')
  assert.equal(navCurrent('/explore/trainers/7', NAV_ACTIVE_PREFIXES.gyms), 'location')
})

test('ignores query and hash', () => {
  assert.equal(navCurrent('/explore?lang=sk', NAV_ACTIVE_PREFIXES.gyms), 'page')
  assert.equal(navCurrent('/pricing#faq', NAV_ACTIVE_PREFIXES.pricing), 'page')
})

test('pages outside the nav match nothing', () => {
  for (const path of ['/', '/about', '/for-lifters', '/tools/1rm-calculator']) {
    for (const prefixes of Object.values(NAV_ACTIVE_PREFIXES)) {
      assert.equal(navCurrent(path, prefixes), undefined, path)
    }
  }
})
