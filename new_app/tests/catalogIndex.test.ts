import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { CatalogIndexExercise } from '../types/catalog.ts'
import {
  compareCatalogPopularity,
  partitionExercisesByMuscle,
  sliceMuscleGroups,
  sortCatalogByPopularity,
} from '../utils/catalogIndex.ts'

function exercise(
  overrides: Partial<CatalogIndexExercise> & Pick<CatalogIndexExercise, 'id' | 'name'>,
): CatalogIndexExercise {
  return {
    slug: overrides.id,
    aliases: null,
    imageUrl: null,
    primaryCategory: null,
    categories: [],
    isCompound: null,
    hasVideo: false,
    previewVideoUrl: null,
    popularity: 0,
    ...overrides,
  }
}

test('popularity wins, then name', () => {
  const rows = [
    exercise({ id: 'a', name: 'Zebra', popularity: 1 }),
    exercise({ id: 'b', name: 'Alpha', popularity: 4 }),
    exercise({ id: 'c', name: 'Beta', popularity: 4 }),
  ]
  assert.deepEqual(
    sortCatalogByPopularity(rows).map(item => item.id),
    ['b', 'c', 'a'],
  )
  assert.ok(compareCatalogPopularity(rows[1], rows[2]) < 0)
})

test('body-part filter keeps primary first, each group popularity-sorted', () => {
  const rows = [
    exercise({ id: 'sec-hot', name: 'Dip', primaryCategory: 'triceps', categories: ['chest'], popularity: 90 }),
    exercise({ id: 'pri-low', name: 'Fly', primaryCategory: 'chest', categories: ['chest'], popularity: 2 }),
    exercise({ id: 'pri-hot', name: 'Bench', primaryCategory: 'chest', categories: ['chest', 'triceps'], popularity: 80 }),
    exercise({ id: 'other', name: 'Curl', primaryCategory: 'biceps', categories: ['biceps'], popularity: 99 }),
    exercise({ id: 'sec-low', name: 'Push-up', primaryCategory: 'shoulders', categories: ['chest'], popularity: 3 }),
  ]

  const grouped = partitionExercisesByMuscle(rows, 'chest')
  assert.deepEqual(grouped.primary.map(item => item.id), ['pri-hot', 'pri-low'])
  assert.deepEqual(grouped.secondary.map(item => item.id), ['sec-hot', 'sec-low'])
})

test('split appears only after every primary row is in the visible window', () => {
  const primary = ['p1', 'p2', 'p3']
  const secondary = ['s1', 's2']

  assert.deepEqual(sliceMuscleGroups(primary, secondary, 2), {
    visiblePrimary: ['p1', 'p2'],
    visibleSecondary: [],
    showSplit: false,
  })
  assert.deepEqual(sliceMuscleGroups(primary, secondary, 3), {
    visiblePrimary: ['p1', 'p2', 'p3'],
    visibleSecondary: [],
    showSplit: true,
  })
  assert.deepEqual(sliceMuscleGroups(primary, secondary, 4), {
    visiblePrimary: ['p1', 'p2', 'p3'],
    visibleSecondary: ['s1'],
    showSplit: true,
  })
})

test('empty primary still marks the secondary group', () => {
  const sliced = sliceMuscleGroups([], ['s1'], 8)
  assert.deepEqual(sliced.visiblePrimary, [])
  assert.deepEqual(sliced.visibleSecondary, ['s1'])
  assert.equal(sliced.showSplit, true)
})
