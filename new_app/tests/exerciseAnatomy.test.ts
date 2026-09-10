import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BODY_COLOR,
  HEAT_COLORS,
  HIGHLIGHTER_VIEW_POLYGONS,
  MUSCLE_TO_SLUG,
  PRIMARY_COLOR,
  PRIMARY_FREQUENCY,
  SECONDARY_COLOR,
  SECONDARY_FREQUENCY,
  SLUG_TO_MUSCLES,
  buildExerciseBodyData,
  hasExerciseAnatomy,
  highlighterMuscleToSlug,
} from '../utils/exerciseAnatomy.ts'

test('primary is brand lime and secondary is a darker olive', () => {
  assert.equal(HEAT_COLORS[PRIMARY_FREQUENCY - 1], PRIMARY_COLOR)
  assert.equal(HEAT_COLORS[SECONDARY_FREQUENCY - 1], SECONDARY_COLOR)
  assert.equal(PRIMARY_COLOR, '#ccff00')
  assert.equal(SECONDARY_COLOR, '#5e7814')
  assert.equal(BODY_COLOR, '#3f3f3f')
  assert.notEqual(PRIMARY_COLOR, SECONDARY_COLOR)

  const data = buildExerciseBodyData('chest', ['triceps', 'shoulders'], {
    chest: 'Chest',
    triceps: 'Triceps',
    shoulders: 'Shoulders',
  })
  assert.deepEqual(data, [
    { name: 'Chest', muscles: ['chest'], frequency: PRIMARY_FREQUENCY },
    { name: 'Triceps', muscles: ['triceps'], frequency: SECONDARY_FREQUENCY },
    { name: 'Shoulders', muscles: ['front-deltoids', 'back-deltoids'], frequency: SECONDARY_FREQUENCY },
  ])
})

test('drops cardio, full-body, and unknown slugs', () => {
  assert.deepEqual(buildExerciseBodyData('cardio', ['full-body', 'unknown', 'biceps']), [
    { name: 'biceps', muscles: ['biceps'], frequency: SECONDARY_FREQUENCY },
  ])
  assert.deepEqual(buildExerciseBodyData(null, []), [])
  assert.deepEqual(buildExerciseBodyData(undefined, ['cardio']), [])
  assert.equal(hasExerciseAnatomy('cardio', ['full-body']), false)
  assert.equal(hasExerciseAnatomy('chest', []), true)
  assert.equal(hasExerciseAnatomy('cardio', ['back']), true)
})

test('never lists a primary slug again as secondary', () => {
  const data = buildExerciseBodyData('back', ['back', 'biceps', 'back'])
  assert.deepEqual(data.map(item => item.name), ['back', 'biceps'])
  assert.equal(data[0]?.frequency, PRIMARY_FREQUENCY)
  assert.equal(data[1]?.frequency, SECONDARY_FREQUENCY)
})

test('every mapped slug has highlighter polygons', () => {
  for (const [slug, muscles] of Object.entries(SLUG_TO_MUSCLES)) {
    assert.ok(muscles.length > 0, slug)
    const [row] = buildExerciseBodyData(slug, [])
    assert.deepEqual(row?.muscles, muscles)
  }
})

test('highlighter muscle ids reverse-map to catalog hub slugs', () => {
  for (const [slug, muscles] of Object.entries(SLUG_TO_MUSCLES)) {
    for (const muscle of muscles) {
      assert.equal(highlighterMuscleToSlug(muscle), slug, muscle)
    }
  }
  assert.equal(highlighterMuscleToSlug('obliques'), 'abs')
  assert.equal(highlighterMuscleToSlug('left-soleus'), 'calves')
  assert.equal(highlighterMuscleToSlug('head'), null)
  assert.equal(highlighterMuscleToSlug('knees'), null)
  assert.equal(highlighterMuscleToSlug(''), null)
  for (const slug of Object.values(MUSCLE_TO_SLUG)) {
    assert.ok(slug in SLUG_TO_MUSCLES, slug)
  }
})

test('catalog adductors lights posterior adductor, not anterior abductors', () => {
  assert.deepEqual(SLUG_TO_MUSCLES.adductors, ['adductor'])
  assert.equal(highlighterMuscleToSlug('adductor'), 'adductors')
  assert.equal(highlighterMuscleToSlug('abductors'), null)
  assert.equal('abductors' in MUSCLE_TO_SLUG, false)
  assert.equal(hasExerciseAnatomy('adductors'), true)
  const posterior = HIGHLIGHTER_VIEW_POLYGONS.posterior.find(row => row.muscle === 'adductor')
  assert.equal(posterior?.count, 2)
  const anteriorAbductors = HIGHLIGHTER_VIEW_POLYGONS.anterior.find(row => row.muscle === 'abductors')
  assert.equal(anteriorAbductors?.count, 2)
  assert.equal(HIGHLIGHTER_VIEW_POLYGONS.anterior.some(row => row.muscle === 'adductor'), false)
})

test('highlighter view layouts stamp 33 polygons each', () => {
  for (const view of ['anterior', 'posterior'] as const) {
    const total = HIGHLIGHTER_VIEW_POLYGONS[view].reduce((sum, row) => sum + row.count, 0)
    assert.equal(total, 33, view)
  }
})
