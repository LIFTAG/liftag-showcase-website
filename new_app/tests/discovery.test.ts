import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  defaultDiscoveryLocale,
  discoveryHref,
  discoveryMode,
  discoveryViewport,
  distanceKm,
  emptyDiscoveryFilters,
  filterDiscoveryGyms,
  normalizedIds,
  readDiscoveryQuery,
  resolveDiscoveryLocale,
  safeDiscoveryUrl,
  splitMapBounds,
  writeDiscoveryQuery,
} from '../utils/discovery.ts'
import {
  normalizeDiscoveryMedia,
  normalizeDiscoveryPage,
  normalizeEquipment,
  normalizeExploreGym,
  normalizeGymMachine,
  normalizeReview,
  normalizeRoutine,
  normalizeTrainer,
} from '../utils/discoveryData.ts'
import {
  discoveryIds as ids,
  fixtureEquipment,
  fixtureGym,
  fixtureMachine,
  fixturePage,
  fixtureRoutine,
  fixtureTrainer,
} from './fixtures/discovery.ts'

test('language priority is URL, manual choice, gym timezone, then browser', () => {
  for (const timezone of ['Europe/Prague', 'Europe/Bratislava']) {
    assert.equal(resolveDiscoveryLocale(undefined, undefined, timezone, 'en-US'), 'sk')
    assert.equal(resolveDiscoveryLocale('en', 'sk', timezone, 'sk'), 'en')
    assert.equal(resolveDiscoveryLocale(undefined, 'en', timezone, 'sk'), 'en')
  }
  assert.equal(resolveDiscoveryLocale('sk', 'en', 'Europe/London'), 'sk')
  assert.equal(defaultDiscoveryLocale(null, 'sk'), 'en')
  assert.equal(defaultDiscoveryLocale('Europe/London', 'sk'), 'en')
  assert.equal(defaultDiscoveryLocale(undefined, 'cs-CZ,sk;q=0.9'), 'sk')
  assert.equal(defaultDiscoveryLocale(undefined, 'sk-SK'), 'sk')
  assert.equal(defaultDiscoveryLocale(undefined, 'en-US'), 'en')
  assert.equal(resolveDiscoveryLocale('bad', 'bad', undefined, 'cs'), 'sk')
})

test('global search ignores every discovery filter and distance requires location', () => {
  const gym = normalizeExploreGym(fixtureGym())
  const filters = {
    ...emptyDiscoveryFilters(),
    distance: 1,
    rating: 5,
    open: true,
    supported: true,
    manufacturers: [ids.otherBrand],
  }
  assert.equal(discoveryMode('Gym', filters, null), 'search')
  assert.equal(discoveryMode('', filters, null), 'map')
  assert.equal(discoveryMode('', filters, gym), 'nearby')
  assert.deepEqual(filterDiscoveryGyms([gym], filters, 'Gym', null), [gym])
  assert.deepEqual(filterDiscoveryGyms([gym], filters, '', null), [])
  assert.deepEqual(filterDiscoveryGyms([gym], emptyDiscoveryFilters(), '', null), [gym])
  assert.ok(distanceKm(gym, { lat: 48.15, lng: 17.12 }) > 1)
})

test('longitude wrapping produces valid bounded requests without a missing hemisphere', () => {
  const v = discoveryViewport({ lat: 10, lng: 179 }, 7)
  assert.equal(splitMapBounds(v).length, 2)
  assert.deepEqual(
    splitMapBounds({ ...v, west: 170, east: -170 }).map((b) => [b.west, b.east]),
    [
      [170, 180],
      [-180, -170],
    ],
  )
  assert.deepEqual(
    splitMapBounds({ ...v, west: -190, east: -170 }).map((b) => [b.west, b.east]),
    [
      [170, 180],
      [-180, -170],
    ],
  )
  assert.deepEqual(
    splitMapBounds({ ...v, west: -180, east: 180 }).map((b) => [b.west, b.east]),
    [[-180, 180]],
  )
  assert.deepEqual(splitMapBounds({ ...v, north: NaN }), [])
  assert.deepEqual(splitMapBounds({ ...v, north: v.south }), [])
})

test('URL restoration retains map bounds, multi-brand OR selections and selected gym', () => {
  const state = readDiscoveryQuery({
    q: 'Eurovea',
    manufacturers: `${ids.brand},${ids.otherBrand},${ids.brand}`,
    distance: '5',
    rating: '4',
    open: '1',
    supported: '1',
    gym: ids.gym,
    lat: '48.14',
    lng: '17.12',
    zoom: '14',
    north: '48.2',
    south: '48.1',
    west: '17',
    east: '17.3',
  })
  assert.deepEqual(state.filters.manufacturers, [ids.brand, ids.otherBrand])
  assert.equal(state.selectedId, ids.gym)
  assert.equal(state.viewport.north, 48.2)
  assert.equal(state.viewport.zoom, 14)
  assert.equal(state.filters.distance, 5)
  assert.equal(readDiscoveryQuery({ distance: '-1', rating: '6', gym: 'not-an-id' }).selectedId, null)
  assert.deepEqual(normalizedIds([ids.brand, '../secret', ids.brand]), [ids.brand])
  assert.equal(
    discoveryHref('/gyms/a/equipment', 'sk', { manufacturers: ids.brand }),
    `/gyms/a/equipment?lang=sk&manufacturers=${ids.brand}`,
  )
})

test('missing gym data remains missing and closure overrides a stale open flag', () => {
  const gym = normalizeExploreGym({ ...fixtureGym(), isOpen: true })
  assert.equal(gym.rating, null)
  assert.equal(gym.isOpen, false)
  assert.deepEqual(gym.hours, [])
  assert.equal(gym.photo, null)
  assert.equal(gym.temporarilyClosed, true)
  assert.throws(() => normalizeExploreGym({ ...fixtureGym(), latitude: 100 }), /coordinates/)
  assert.equal(normalizeReview({ id: 'review', createdAt: '2026-09-01' }).rating, null)
})

test('custom stickerless machines preserve gym IDs and never invent catalog identities', () => {
  const machine = normalizeGymMachine(fixtureMachine(), 'en')
  assert.equal(machine.id, ids.machine)
  assert.equal(machine.templateId, null)
  assert.equal(machine.qrCodeId, null)
  assert.equal(machine.exercises[0]?.templateId, null)
  assert.equal(machine.exercises[0]?.instructions, 'Use the gym-specific instructions.')
  assert.equal(machine.manufacturer?.name, 'Fixture Works')
  assert.equal(normalizeEquipment(fixtureEquipment()).gymMachineId, ids.machine)
})

test('template-backed gym machine still uses resolved overrides', () => {
  const wire = fixtureMachine()
  const machine = normalizeGymMachine(
    {
      ...wire,
      qrCodeId: 'qr-identity',
      machine: {
        ...wire.machine,
        machineTemplateId: ids.otherBrand,
        description: 'Gym override',
        photoUrls: ['https://example.com/gym.jpg'],
      },
      exercises: [
        { ...wire.exercises[0], exerciseTemplateId: ids.exercise, instructions: 'Gym instructions' },
      ],
    },
    'sk',
  )
  assert.equal(machine.templateId, ids.otherBrand)
  assert.equal(machine.id, ids.machine)
  assert.equal(machine.qrCodeId, 'qr-identity')
  assert.equal(machine.description, 'Gym override')
  assert.equal(machine.media[0]?.url, 'https://example.com/gym.jpg')
  assert.equal(machine.exercises[0]?.instructions, 'Gym instructions')
})

test('mixed media is safe and deduplicated without losing video posters', () => {
  assert.deepEqual(
    normalizeDiscoveryMedia(
      [
        { type: 'video', url: 'https://example.com/movie.mp4', posterUrl: 'https://example.com/poster.jpg' },
        { type: 'image', url: 'javascript:alert(1)' },
      ],
      ['https://example.com/photo.jpg', 'https://example.com/photo.jpg'],
    ),
    [
      { type: 'video', url: 'https://example.com/movie.mp4', posterUrl: 'https://example.com/poster.jpg' },
      { type: 'image', url: 'https://example.com/photo.jpg', posterUrl: null },
    ],
  )
  assert.equal(safeDiscoveryUrl('javascript:alert(1)', true), null)
  assert.equal(safeDiscoveryUrl('mailto:coach@example.com', true), 'mailto:coach@example.com')
})

test('routine order, supersets, varying set targets, zero rest and explicit null overrides survive', () => {
  const routine = normalizeRoutine(fixtureRoutine())
  assert.deepEqual(
    routine.exercises.map((e) => e.id),
    ['first', 'second', 'third'],
  )
  assert.equal(routine.groups[0]?.rounds, 2)
  assert.equal(routine.groups[0]?.rest, 90)
  assert.equal(routine.exercises[0]?.name, 'Overridden pulldown')
  assert.equal(routine.exercises[0]?.description, null)
  assert.equal(routine.exercises[0]?.image, null)
  assert.equal(routine.exercises[0]?.sets.length, 2)
  assert.deepEqual(routine.exercises[1]?.sets, [
    { reps: '8-12', weightKg: 50, restSeconds: 0, rpe: 8 },
    { reps: '6', weightKg: 60, restSeconds: 90, rpe: 9 },
  ])
  assert.equal(routine.exercises[1]?.notes, 'Keep this note.')
  assert.deepEqual(routine.exercises[2]?.sets, [{ durationSeconds: 60, calories: 12, restSeconds: 45 }])
})

test('routine instruction fallback distinguishes absent, cleared, and overridden text', () => {
  for (const [override, expected] of [
    [{}, 'Catalog instructions'],
    [{ exerciseInstructions: null }, null],
    [{ exerciseInstructions: '' }, null],
    [{ exerciseInstructions: 'Routine instructions' }, 'Routine instructions'],
  ] as const) {
    const routine = normalizeRoutine({
      id: ids.routine,
      name: 'Routine',
      items: [{ id: 'item', exerciseTemplate: { instructions: 'Catalog instructions' }, ...override }],
    })
    assert.equal(routine.exercises[0]?.instructions, expected)
  }
})

test('public trainer contacts are filtered and pagination metadata is required', () => {
  const trainer = normalizeTrainer({
    ...fixtureTrainer(),
    details: { websiteUrl: 'javascript:alert(1)', phone: '+421123456' },
  })
  assert.deepEqual(trainer.contacts, [{ label: 'Phone', href: 'tel:+421123456' }])
  assert.equal(trainer.gyms[0]?.id, ids.gym)
  const page = normalizeDiscoveryPage(
    fixturePage([fixtureEquipment(), fixtureEquipment()], 1, 1),
    normalizeEquipment,
  )
  assert.equal(page.items.length, 1)
  assert.equal(page.meta.lastPage, 2)
  assert.throws(() => normalizeDiscoveryPage({ data: [] }, normalizeEquipment), /pagination/)
})

test('missing routine prescriptions and round counts remain unspecified', () => {
  const routine = normalizeRoutine({
    id: ids.routine,
    name: 'Unspecified targets',
    groups: [{ id: 'pair' }],
    items: [{ id: 'item', exerciseName: 'Row', supersetGroupId: 'pair' }],
  })
  assert.equal(routine.groups[0]?.rounds, null)
  assert.deepEqual(routine.exercises[0]?.sets, [])
})

test('gym equipment shares catalog routes without confusing custom, template, and QR identities', async () => {
  const { gymMachineHref, gymExerciseHref, gymCatalogContext, gymExercisePresentation } =
    await import('../utils/gymCatalog.ts')
  const machine = normalizeGymMachine(fixtureMachine(), 'en')
  const exercise = machine.exercises[0]!
  const machineUrl = new URL(gymMachineHref(ids.gym, ids.machine, 'sk'), 'https://liftag.fit')
  assert.equal(machineUrl.pathname, `/machines/${ids.machine}`)
  assert.deepEqual(gymCatalogContext(Object.fromEntries(machineUrl.searchParams), ids.machine), {
    gymId: ids.gym,
    machineId: ids.machine,
    exerciseId: undefined,
  })
  const customUrl = new URL(gymExerciseHref(machine, exercise, 'sk'), 'https://liftag.fit')
  assert.equal(customUrl.pathname, `/sk/exercises/${exercise.id}`)
  assert.equal(customUrl.searchParams.get('exercise'), exercise.id)
  assert.equal(customUrl.searchParams.get('machine'), ids.machine)
  assert.equal(customUrl.searchParams.get('gym'), ids.gym)
  const templatedUrl = new URL(
    gymExerciseHref(machine, { ...exercise, templateId: ids.otherBrand }, 'en', 'real-catalog-slug'),
    'https://liftag.fit',
  )
  assert.equal(templatedUrl.pathname, '/exercises/real-catalog-slug')
  assert.equal(templatedUrl.searchParams.get('exercise'), exercise.id)
  const custom = gymExercisePresentation(exercise, 'en', null)
  assert.equal(custom.createdAt, null)
  assert.equal(custom.primaryCategory, null)
  assert.equal(custom.description, exercise.description)
  assert.equal(custom.slug, null)
  assert.equal(gymCatalogContext({}), null)
  for (const query of [
    { gym: ids.gym },
    { gym: [ids.gym], machine: ids.machine, exercise: ids.exercise },
    { gym: ids.gym, machine: '../wrong', exercise: ids.exercise },
  ]) {
    assert.throws(() => gymCatalogContext(query), /Invalid gym equipment context/)
  }
})

test('discovery URL state round-trips through write and read', () => {
  const state = {
    filters: {
      distance: 5,
      rating: 4,
      open: true,
      supported: true,
      manufacturers: [ids.brand, ids.otherBrand].sort(),
    },
    search: 'Fixture Gym',
    selectedId: ids.gym,
    viewport: discoveryViewport({ lat: 48.15, lng: 17.11 }, 13),
  }
  const parsed = readDiscoveryQuery(writeDiscoveryQuery(state))
  assert.deepEqual(parsed.filters, state.filters)
  assert.equal(parsed.search, state.search)
  assert.equal(parsed.selectedId, state.selectedId)
  assert.deepEqual(parsed.viewport, state.viewport)

  const empty = { filters: emptyDiscoveryFilters(), search: '', selectedId: null, viewport: state.viewport }
  const emptyQuery = writeDiscoveryQuery(empty)
  assert.equal('q' in emptyQuery, false, 'An empty search must not be written to the URL')
  assert.equal('gym' in emptyQuery, false)
  assert.deepEqual(readDiscoveryQuery(emptyQuery).filters, emptyDiscoveryFilters())
})
