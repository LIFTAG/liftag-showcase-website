import assert from 'node:assert/strict'
import { test, type TestContext } from 'node:test'
import { useCatalogExerciseResource } from '../composables/useCatalogExerciseResource.ts'
import { normalizeGymMachine } from '../utils/discoveryData.ts'
import { discoveryIds, fixtureMachine } from './fixtures/discovery.ts'

function setupResource(t: TestContext) {
  const machine = normalizeGymMachine(fixtureMachine(), 'en')
  const exercise = machine.exercises[0]!
  exercise.templateId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const catalog = { slug: 'catalog-row', name: 'Catalog name', description: 'Catalog description' }
  const context = { gymId: machine.gym.id, machineId: machine.id, exerciseId: exercise.id }
  const controller = new AbortController()
  const request = t.mock.fn(async (url: string) => url.startsWith('/api/explore/') ? machine : catalog)
  const resolveCatalog = t.mock.fn(async () => catalog)
  const globals = {
    useRequestFetch: () => request,
    useAsyncData: (_key: string, handler: (app: null, options: { signal: AbortSignal }) => unknown) =>
      handler(null, { signal: controller.signal }),
    createError: (options: { statusCode: number; statusMessage: string }) =>
      Object.assign(new Error(options.statusMessage), options),
    resolveCatalogExercise: resolveCatalog,
  }
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { value, configurable: true })
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous)
      else Reflect.deleteProperty(globalThis, key)
    })
  }
  return {
    machine, exercise, catalog, context, controller, request, resolveCatalog,
    // The test useAsyncData adapter returns its handler result directly.
    load: (param: string) => useCatalogExerciseResource(param, 'en', context) as unknown as Promise<{
      exercise: { name: string; slug: string | null; description: string | null }
    }>,
    failCatalog(error: unknown) {
      request.mock.mockImplementation(async (url: string) => {
        if (url.startsWith('/api/explore/')) return machine
        throw error
      })
    },
  }
}

test('contextual slugs and template IDs preserve gym overrides and catalog canonical slugs', async (t) => {
  const { load, exercise, catalog } = setupResource(t)
  for (const param of [catalog.slug, exercise.templateId!]) {
    const result = await load(param)
    assert.equal(result.exercise.name, exercise.name)
    assert.equal(result.exercise.description, exercise.description)
    assert.equal(result.exercise.slug, catalog.slug)
  }
})

for (const failure of [Object.assign(new Error('Service unavailable'), { statusCode: 503 }), new Error('Network error')]) {
  test(`contextual slugs report temporary failure for ${failure.message}`, async (t) => {
    const { load, catalog, failCatalog } = setupResource(t)
    failCatalog(failure)
    await assert.rejects(load(catalog.slug), { statusCode: 502, cause: failure })
  })
}

test('verified template IDs still render gym data when optional catalog enrichment fails', async (t) => {
  const { load, exercise, failCatalog } = setupResource(t)
  failCatalog(Object.assign(new Error('Service unavailable'), { statusCode: 503 }))
  const result = await load(exercise.templateId!)
  assert.equal(result.exercise.name, exercise.name)
  assert.equal(result.exercise.slug, null)
})

test('missing catalog entries and confirmed slug mismatches remain 404', async (t) => {
  const { load, catalog, failCatalog } = setupResource(t)
  await assert.rejects(load('another-exercise'), { statusCode: 404 })
  failCatalog(Object.assign(new Error('Not found'), { statusCode: 404 }))
  await assert.rejects(load(catalog.slug), { statusCode: 404 })
})

test('custom exercises render without a catalog request and reject unrelated identities', async (t) => {
  const { load, exercise, request } = setupResource(t)
  exercise.templateId = null
  assert.equal((await load(exercise.id)).exercise.name, exercise.name)
  assert.equal(request.mock.callCount(), 1)
  await assert.rejects(load('unrelated-slug'), { statusCode: 404 })
})

test('an exercise missing from the resolved machine is rejected before catalog lookup', async (t) => {
  const { load, context, request } = setupResource(t)
  context.exerciseId = discoveryIds.private
  await assert.rejects(load('catalog-row'), { statusCode: 404 })
  assert.equal(request.mock.callCount(), 1)
})

test('canceled catalog requests propagate cancellation even for verified template IDs', async (t) => {
  const { load, exercise, controller, failCatalog } = setupResource(t)
  const cancellation = new DOMException('Canceled', 'AbortError')
  controller.abort()
  failCatalog(cancellation)
  await assert.rejects(load(exercise.templateId!), (error) => error === cancellation)
})

test('ordinary catalog routes retain their existing resolver', async (t) => {
  const { resolveCatalog, request } = setupResource(t)
  await useCatalogExerciseResource('catalog-row', 'sk', null)
  assert.equal(request.mock.callCount(), 0)
  assert.deepEqual(resolveCatalog.mock.calls[0]!.arguments, ['catalog-row', 'sk'])
})
