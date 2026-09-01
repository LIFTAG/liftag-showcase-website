import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BODY_COLOR,
  HEAT_COLORS,
  PRIMARY_FREQUENCY,
  SECONDARY_FREQUENCY,
  SLUG_TO_MUSCLES,
  buildExerciseBodyData,
  hasExerciseAnatomy,
} from '../utils/exerciseAnatomy.ts'

test('primary maps to frequency 5 lime and secondary to mid lime', () => {
  assert.equal(HEAT_COLORS[PRIMARY_FREQUENCY - 1], '#ccff00')
  assert.equal(HEAT_COLORS[SECONDARY_FREQUENCY - 1], '#8fbf0c')
  assert.equal(BODY_COLOR, '#2b2b2b')

  const data = buildExerciseBodyData('chest', ['triceps', 'shoulders'], {
    chest: 'Chest',
    triceps: 'Triceps',
    shoulders: 'Shoulders',
  })
  assert.deepEqual(data, [
    { name: 'Chest', muscles: ['chest'], frequency: 5 },
    { name: 'Triceps', muscles: ['triceps'], frequency: 3 },
    { name: 'Shoulders', muscles: ['front-deltoids', 'back-deltoids'], frequency: 3 },
  ])
})

test('drops cardio, full-body, and unknown slugs', () => {
  assert.deepEqual(buildExerciseBodyData('cardio', ['full-body', 'unknown', 'biceps']), [
    { name: 'biceps', muscles: ['biceps'], frequency: 3 },
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
