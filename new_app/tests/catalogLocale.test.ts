import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  exerciseHreflangAlternates,
  exerciseIndexPath,
  exercisePath,
  muscleChipPath,
  muscleDisplayName,
  parseCatalogLocale,
  SK_MUSCLE_NAMES,
} from '../utils/catalogLocale.ts'

test('parseCatalogLocale only accepts sk; everything else is en', () => {
  assert.equal(parseCatalogLocale('sk'), 'sk')
  assert.equal(parseCatalogLocale(['sk']), 'sk')
  assert.equal(parseCatalogLocale('en'), 'en')
  assert.equal(parseCatalogLocale('cs'), 'en')
  assert.equal(parseCatalogLocale('SK'), 'en')
  assert.equal(parseCatalogLocale(undefined), 'en')
  assert.equal(parseCatalogLocale(''), 'en')
})

test('exercise paths stay English-slug on both locales', () => {
  assert.equal(exercisePath('lat-pulldown'), '/exercises/lat-pulldown')
  assert.equal(exercisePath('lat-pulldown', 'en'), '/exercises/lat-pulldown')
  assert.equal(exercisePath('lat-pulldown', 'sk'), '/sk/exercises/lat-pulldown')
  assert.equal(exerciseIndexPath('en'), '/exercises')
  assert.equal(exerciseIndexPath('sk'), '/sk/exercises')
})

test('exercise hreflang set is en/sk/x-default with no cs', () => {
  const detail = exerciseHreflangAlternates('barbell-bench-press')
  assert.deepEqual(detail, [
    { hreflang: 'en', path: '/exercises/barbell-bench-press' },
    { hreflang: 'sk', path: '/sk/exercises/barbell-bench-press' },
    { hreflang: 'x-default', path: '/exercises/barbell-bench-press' },
  ])
  assert.equal(detail.some(item => item.hreflang === 'cs' || item.path.startsWith('/cs/')), false)

  const index = exerciseHreflangAlternates()
  assert.deepEqual(index.map(item => item.path), ['/exercises', '/sk/exercises', '/exercises'])
})

test('maps the 13 muscle slugs to the SK chip labels and leaves English alone', () => {
  assert.equal(Object.keys(SK_MUSCLE_NAMES).length, 13)
  assert.equal(muscleDisplayName('chest', 'Chest', 'sk'), 'Hrudník')
  assert.equal(muscleDisplayName('adductors', 'Adductors', 'sk'), 'Adduktory')
  assert.equal(muscleDisplayName('cardio', 'Cardio', 'sk'), 'Kardio')
  assert.equal(muscleDisplayName('chest', 'Chest', 'en'), 'Chest')
  assert.equal(muscleDisplayName('unknown', 'Other', 'sk'), 'Other')
})

test('SK muscle chips stay on the SK library; English chips still go to muscle hubs', () => {
  assert.equal(muscleChipPath('chest', 'en'), '/muscles/chest')
  assert.equal(muscleChipPath('chest', 'sk'), '/sk/exercises?muscle=chest')
})
