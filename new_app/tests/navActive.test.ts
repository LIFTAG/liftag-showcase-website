import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NAV_ACTIVE_PREFIXES, isNavPathActive } from '../utils/navActive.ts'

test('matches the section index and its subpages', () => {
  assert.equal(isNavPathActive('/journal', NAV_ACTIVE_PREFIXES.journal), true)
  assert.equal(isNavPathActive('/journal/', NAV_ACTIVE_PREFIXES.journal), true)
  assert.equal(isNavPathActive('/journal/progressive-overload', NAV_ACTIVE_PREFIXES.journal), true)
})

test('only matches on a segment boundary', () => {
  assert.equal(isNavPathActive('/exercises-archive', NAV_ACTIVE_PREFIXES.exercises), false)
  assert.equal(isNavPathActive('/demos', NAV_ACTIVE_PREFIXES.demo), false)
})

test('catalog and discovery pages map to their nav item', () => {
  assert.equal(isNavPathActive('/machines/leg-press', NAV_ACTIVE_PREFIXES.exercises), true)
  assert.equal(isNavPathActive('/muscles', NAV_ACTIVE_PREFIXES.exercises), true)
  assert.equal(isNavPathActive('/gyms/42/equipment', NAV_ACTIVE_PREFIXES.gyms), true)
  assert.equal(isNavPathActive('/explore/trainers/7', NAV_ACTIVE_PREFIXES.gyms), true)
})

test('ignores query and hash', () => {
  assert.equal(isNavPathActive('/explore?lang=sk', NAV_ACTIVE_PREFIXES.gyms), true)
  assert.equal(isNavPathActive('/pricing#faq', NAV_ACTIVE_PREFIXES.pricing), true)
})

test('pages outside the nav match nothing', () => {
  for (const path of ['/', '/about', '/for-lifters', '/tools/1rm-calculator']) {
    for (const prefixes of Object.values(NAV_ACTIVE_PREFIXES)) {
      assert.equal(isNavPathActive(path, prefixes), false, path)
    }
  }
})
