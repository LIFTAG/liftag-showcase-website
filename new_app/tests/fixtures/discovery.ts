// Synthetic public API fixtures: no production identities or account data.
export const discoveryIds = {
  gym: '11111111-1111-4111-8111-111111111111',
  otherGym: '22222222-2222-4222-8222-222222222222',
  machine: '33333333-3333-4333-8333-333333333333',
  routine: '44444444-4444-4444-8444-444444444444',
  trainer: '55555555-5555-4555-8555-555555555555',
  brand: '66666666-6666-4666-8666-666666666666',
  otherBrand: '77777777-7777-4777-8777-777777777777',
  exercise: '88888888-8888-4888-8888-888888888888',
  private: '99999999-9999-4999-8999-999999999999',
}
export function fixtureGym(lang = 'en') {
  return {
    id: discoveryIds.gym,
    name: lang === 'sk' ? 'Testovacie fitko' : 'Fixture Gym',
    address: 'Bratislava',
    timezone: 'Europe/Bratislava',
    latitude: 48.14,
    longitude: 17.12,
    isLiftagSupported: true,
    isOpen: false,
    rating: null,
    reviewCount: 0,
    equipmentCount: 2,
    photos: [],
    media: [],
    openingHours: [],
    storefrontStatus: 'temporarily_closed',
    closureReason: lang === 'sk' ? 'Rekonštrukcia' : 'Renovation',
    reopensAt: '2026-10-01T08:00:00+02:00',
  }
}
export function fixtureEquipment(lang = 'en') {
  return {
    gymMachineId: discoveryIds.machine,
    qrCodeId: null,
    name: lang === 'sk' ? 'Vlastný stroj' : 'Custom gym machine',
    photoUrl: null,
    manufacturer: { id: discoveryIds.brand, name: 'Fixture Works' },
    quantity: 2,
    exerciseCount: 1,
    matchedExerciseName: null,
  }
}
export function fixtureMachine(lang = 'en') {
  return {
    qrCodeId: null,
    gym: fixtureGym(lang),
    machine: {
      gymMachineId: discoveryIds.machine,
      machineTemplateId: null,
      name: fixtureEquipment(lang).name,
      description:
        lang === 'sk' ? 'Popis tohto konkrétneho stroja.' : 'Description of this specific gym machine.',
      manufacturer: fixtureEquipment().manufacturer,
      photoUrls: [],
      videoUrls: [],
      categories: [{ id: discoveryIds.exercise, slug: 'back', name: 'Back' }],
    },
    exercises: [
      {
        brandMachineExerciseId: discoveryIds.exercise,
        exerciseTemplateId: null,
        name: lang === 'sk' ? 'Vlastný cvik' : 'Custom exercise',
        description: 'Gym exercise override',
        instructions: 'Use the gym-specific instructions.',
        imageUrl: null,
        videoUrl: null,
        sortOrder: 1,
        categories: [],
      },
    ],
  }
}
export function fixtureTrainer() {
  return {
    id: discoveryIds.trainer,
    userId: 123,
    user: { id: 123, fullName: 'Fixture Trainer', avatarUrl: null },
    bio: 'Public trainer biography.',
    yearsOfExperience: 8,
    onlineCoaching: true,
    specializations: [{ slug: 'strength_training' }],
    details: { websiteUrl: 'https://liftag.fit', contactEmail: 'fixture@example.com' },
    gyms: [{ id: discoveryIds.gym, name: 'Fixture Gym', address: 'Bratislava' }],
  }
}
export function fixtureRoutine() {
  return {
    id: discoveryIds.routine,
    visibility: 'public',
    name: 'Superset preview',
    description: 'Public routine fixture.',
    createdByUserName: 'Fixture Trainer',
    estimatedDurationMin: 35,
    difficulty: 'intermediate',
    targetMuscles: ['back'],
    groups: [{ id: 'superset-a', name: 'Pull pair', targetRounds: 2, restBetweenRoundsSeconds: 90 }],
    items: [
      {
        id: 'second',
        position: 2,
        exerciseTemplateId: null,
        exerciseName: 'Custom row',
        exerciseDescription: 'Resolved custom instructions.',
        exerciseImageUrl: null,
        exerciseVideos: [],
        supersetGroupId: 'superset-a',
        setTargets: [
          { reps: '8-12', weightKg: 50, restSeconds: 0, rpe: 8 },
          { reps: '6', weightKg: 60, restSeconds: 90, rpe: 9 },
        ],
        notes: 'Keep this note.',
      },
      {
        id: 'first',
        position: 1,
        exerciseTemplateId: discoveryIds.exercise,
        exerciseName: 'Overridden pulldown',
        exerciseDescription: null,
        exerciseImageUrl: null,
        exerciseVideos: [],
        exerciseTemplate: {
          name: 'Catalog name',
          description: 'Must not replace an explicit null',
          imageUrl: 'https://example.com/catalog.jpg',
        },
        supersetGroupId: 'superset-a',
        targetSets: null,
        setTargets: null,
        targetData: { reps: '10', weightKg: 40 },
        restSeconds: 30,
      },
      {
        id: 'third',
        position: 3,
        exerciseName: 'Timed finisher',
        targetSets: 1,
        setTargets: [{ durationSeconds: 60, calories: 12, restSeconds: 45 }],
      },
    ],
  }
}
export function fixturePage<T>(items: T[], page = 1, limit = 24) {
  return {
    data: items.slice((page - 1) * limit, page * limit),
    metadata: {
      total: items.length,
      currentPage: page,
      lastPage: Math.max(1, Math.ceil(items.length / limit)),
      perPage: limit,
    },
  }
}

// Synthetic catalog rows exercise locale-aware requests without depending on deployed API availability.
export const catalogFixtureIds = {
  exercise: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  machine: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  category: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
}
export function fixtureCatalogCategory(lang = 'en') {
  return { id: catalogFixtureIds.category, slug: 'chest', name: lang === 'sk' ? 'Hrudník' : 'Chest',
    sortOrder: 0, i18nKey: 'chest', imageUrl: null, isActive: true, isSystem: true }
}
export function fixtureCatalogExercise(lang = 'en') {
  return {
    id: catalogFixtureIds.exercise, slug: 'barbell-bench-press',
    name: lang === 'sk' ? 'Tlaky s veľkou činkou na rovnej lavičke' : 'Barbell Bench Press',
    description: lang === 'sk' ? 'Testovací popis cviku z API.' : 'Fixture exercise description from the API.',
    imageUrl: null,
    videos: [
      { locale: 'en', url: 'https://example.com/fixture-en.m3u8', displayOrder: 0, uploadedByUserId: null },
      { locale: 'sk', url: 'https://example.com/fixture-sk.m3u8', displayOrder: 2, uploadedByUserId: null },
    ],
    aliases: null, localeName: lang, isCompound: true, loggingTypes: ['weight_reps'],
    primaryCategory: fixtureCatalogCategory(lang), categories: [fixtureCatalogCategory(lang)], machines: [],
    createdAt: '2026-09-01T00:00:00.000Z', updatedAt: null,
  }
}
export function fixtureCatalogMachine(lang = 'en') {
  return {
    id: catalogFixtureIds.machine, slug: 'fixture-bench',
    name: lang === 'sk' ? 'Testovacia lavička' : 'Fixture Bench',
    description: lang === 'sk' ? 'Testovací popis stroja z API.' : 'Fixture machine description from the API.',
    photoUrl: null, photoUrls: [], videoUrls: [], category: 'chest', categories: [fixtureCatalogCategory(lang)],
    exercises: [fixtureCatalogExercise(lang)], createdAt: '2026-09-01T00:00:00.000Z', updatedAt: null,
  }
}
