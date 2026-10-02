import assert from 'node:assert/strict'
import { test } from 'node:test'
import { catalogPageGroups, catalogPageNumber, catalogPagePath } from '../utils/catalogPagination.ts'

test('page numbers reject malformed, repeated and unsafe query values', () => {
  assert.equal(catalogPageNumber(undefined), 1)
  assert.equal(catalogPageNumber('2'), 2)
  for (const value of ['', '0', '-1', '01', '1.5', '2x', 'Infinity', '9007199254740992', ['2', '3'], null]) {
    assert.equal(catalogPageNumber(value), null)
  }
})

test('canonical pages and filter links keep locale and normalize the first page', () => {
  assert.equal(catalogPagePath('/sk/exercises', 1), '/sk/exercises')
  assert.equal(catalogPagePath('/sk/exercises', 2), '/sk/exercises?page=2')
  assert.equal(catalogPagePath('/machines', 3, { q: 'leg press', muscle: '', page: '99' }), '/machines?q=leg+press&page=3')
})

test('all rows are reachable across pages including the muscle group boundary', () => {
  const primary = Array.from({ length: 65 }, (_, i) => `p${i}`)
  const secondary = Array.from({ length: 41 }, (_, i) => `s${i}`)
  const found: string[] = []
  for (let offset = 0; offset < 106; offset += 48) {
    const groups = catalogPageGroups(primary, secondary, offset, 48)
    found.push(...groups.visiblePrimary, ...groups.visibleSecondary)
    assert.equal(groups.showSplit, groups.visibleSecondary.length > 0)
  }
  assert.deepEqual(found, [...primary, ...secondary])
  assert.deepEqual(catalogPageGroups(primary, secondary, 48, 96).visibleSecondary, secondary)
})
