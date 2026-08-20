import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  clipMetaDescription,
  defaultExerciseFaqs,
  defaultExerciseFaqsSk,
  descriptionToHowToSteps,
  exerciseImageAlt,
  exerciseMetaDescription,
  exerciseMetaDescriptionSk,
  exerciseTitle,
  exerciseTitleSk,
  splitSentences,
} from '../utils/seoCopy.ts'

const BENCH = 'Lie on a flat bench with eyes under the bar, feet planted, and head, upper back, and hips supported. Take an even closed grip, retract and depress the shoulder blades, and unrack with a spotter when appropriate. Lower the bar under control toward the mid-to-lower chest with wrists over forearms, touch without bouncing, and press upward and slightly back to stable lockout. The bench press trains the pectorals, triceps, and anterior deltoids and is a standard test of horizontal pressing strength, but not universally the “best” exercise. Set rack safeties, use collars and a trained spotter, and choose a grip and range that keep the shoulders comfortable.'

test('splits catalog copy on sentence boundaries', () => {
  assert.equal(splitSentences(BENCH).length, 5)
})

test('drops commentary sentences from HowTo steps', () => {
  const steps = descriptionToHowToSteps(BENCH)
  assert.ok(steps.length >= 3)
  assert.ok(steps.every(step => !/trains the/.test(step)))
  assert.match(steps[0] ?? '', /^Lie on a flat bench/)
})

test('keeps a single-sentence description as one step', () => {
  assert.deepEqual(
    descriptionToHowToSteps('Hold a plank with elbows under shoulders.'),
    ['Hold a plank with elbows under shoulders.'],
  )
})

test('does not cut a meta description mid-word', () => {
  const long = 'A'.repeat(80) + ' leftoverwords that should not be sliced through the middle of anything important'
  const clipped = clipMetaDescription(long, 90)
  assert.ok(clipped.endsWith('…'))
  assert.ok(!clipped.includes('leftoverw'))
})

test('prefers overlay copy for exercise meta descriptions', () => {
  const overlay = 'Barbell bench press: setup, common mistakes, and how to log every set in LIFTAG.'
  assert.equal(
    exerciseMetaDescription({ name: 'Barbell Bench Press', overlay }),
    overlay,
  )
})

test('builds a template meta description when no overlay exists', () => {
  const text = exerciseMetaDescription({
    name: 'Barbell Bench Press',
    isCompound: true,
    primaryMuscle: 'Chest',
  })
  assert.match(text, /compound chest lift/)
  assert.match(text, /LIFTAG/)
  assert.ok(text.length <= 160)
})

test('keeps exercise titles inside a typical SERP budget', () => {
  assert.ok(exerciseTitle('Barbell Bench Press').length <= 62)
  assert.ok(exerciseTitle('Seated Overhead Dumbbell Triceps Extension').length <= 70)
})

test('writes image alts that name the muscle and movement type', () => {
  assert.equal(
    exerciseImageAlt({ name: 'Barbell Bench Press', primaryMuscle: 'Chest', isCompound: true }),
    'Barbell Bench Press — chest compound exercise in the LIFTAG library',
  )
})

test('splits Slovak sentences that start with a non-ASCII capital', () => {
  assert.deepEqual(
    splitSentences('Prvá veta. Úchop je široký. Ďalšia veta.'),
    ['Prvá veta.', 'Úchop je široký.', 'Ďalšia veta.'],
  )
})

test('Slovak FAQs stay in Slovak and join lists with a', () => {
  const faqs = defaultExerciseFaqsSk({
    name: 'Tlaky na lavičke',
    primaryMuscle: 'Hrudník',
    secondaryMuscles: ['Triceps', 'Ramena'],
    machines: ['Bench press', 'Smith machine'],
    loggingLabel: 'Váha × opakovania',
  })
  assert.equal(faqs.length, 3)
  assert.equal(faqs.some(item => /How do I log|What muscles does|Which gym machines/.test(item.question)), false)
  assert.match(faqs[0]?.question ?? '', /Ako zalogujem Tlaky na lavičke/)
  assert.match(faqs[1]?.answer ?? '', /Hrudník, Triceps a Ramena/)
  assert.match(faqs[2]?.question ?? '', /Na ktorých strojoch/)
})

test('English generated FAQs are unchanged', () => {
  const faqs = defaultExerciseFaqs({ name: 'Barbell Bench Press', primaryMuscle: 'Chest' })
  assert.match(faqs[0]?.question ?? '', /^How do I log Barbell Bench Press/)
})

test('Slovak titles and meta descriptions clip API copy', () => {
  assert.equal(exerciseTitleSk('Tlaky na lavičke'), 'Tlaky na lavičke | Ako cvičiť | LIFTAG')
  assert.ok(exerciseTitleSk('A'.repeat(80)).endsWith('| LIFTAG'))
  assert.equal(
    exerciseMetaDescriptionSk({ name: 'Tlaky', description: 'Sadni na lavičku a tlač.' }),
    'Sadni na lavičku a tlač.',
  )
})
