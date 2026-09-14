import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

test('catalog snapshots isolate API sources and languages while retaining pagination and cache reuse', async () => {
  let apiBaseUrl = 'http://127.0.0.1:4015'
  const requests: {
    baseURL: string
    headers: Record<string, string>
    query: { page: number; limit: number }
  }[] = []
  const module = {
    exports: {} as {
      getCatalogSnapshot: (
        locale?: string,
      ) => Promise<{ exercises: { id: string; name: string; imageUrl: string }[] }>
    },
  }
  const source = readFileSync(new URL('../server/utils/catalogData.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText

  runInNewContext(compiled, {
    exports: module.exports,
    require: (path: string) => {
      assert.equal(path, './indexNowSubmit')
      return { scheduleIndexNowSubmit() {} }
    },
    useRuntimeConfig: () => ({ public: { apiBaseUrl } }),
    // Nitro's documented default keys use all arguments; honor custom keys too
    // so the previous locale-only implementation reproduces the collision.
    defineCachedFunction: (
      read: (...args: unknown[]) => Promise<unknown>,
      options: { getKey?: (...args: unknown[]) => string },
    ) => {
      const cache = new Map<string, Promise<unknown>>()
      return (...args: unknown[]) => {
        const key = options.getKey?.(...args) ?? JSON.stringify(args)
        if (!cache.has(key)) cache.set(key, read(...args))
        return cache.get(key)
      }
    },
    $fetch: async (path: string, options: (typeof requests)[number]) => {
      requests.push(options)
      const id = `${options.baseURL}/${options.query.page}`
      return {
        data: [{ id, name: options.headers['Accept-Language'], imageUrl: `${id}.webp` }],
        metadata: { lastPage: path.endsWith('/exercise-templates') ? 2 : 1 },
      }
    },
  })

  const snapshots = new Map<string, Awaited<ReturnType<typeof module.exports.getCatalogSnapshot>>>()
  for (const base of ['http://127.0.0.1:4015', 'https://api.liftag.fit']) {
    apiBaseUrl = base
    for (const locale of ['sk', 'en']) {
      const snapshot = await module.exports.getCatalogSnapshot(locale)
      assert.equal(snapshot.exercises.length, 2)
      assert.ok(
        snapshot.exercises.every((row) => row.id.startsWith(base) && row.name === locale && row.imageUrl),
      )
      snapshots.set(`${base}:${locale}`, snapshot)
    }
  }
  assert.equal(requests.length, 16)
  assert.ok(requests.every((request) => request.query.limit === 100))
  for (const [key, snapshot] of snapshots) {
    apiBaseUrl = key.slice(0, key.lastIndexOf(':'))
    assert.equal(await module.exports.getCatalogSnapshot(key.slice(key.lastIndexOf(':') + 1)), snapshot)
  }
  assert.equal(await module.exports.getCatalogSnapshot(), snapshots.get('https://api.liftag.fit:en'))
  assert.equal(requests.length, 16)
})
