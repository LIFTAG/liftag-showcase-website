import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { test } from 'node:test'
import { createI18n } from 'vue-i18n'
import { slovakPluralRule } from '../utils/i18n.ts'

type Leaves = Map<string, string | number | boolean | null>
function leaves(value: unknown, path = '', result: Leaves = new Map()): Leaves {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) leaves(child, path ? `${path}.${key}` : key, result)
  } else {
    assert.ok(
      typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null,
      `Invalid translation value at ${path}`,
    )
    result.set(path, value as string | number | boolean | null)
  }
  return result
}
const placeholders = (value: string) =>
  [...new Set([...value.matchAll(/\{([\w]+)\}/g)].map((match) => match[1]))].sort()

// Feature modules are pure data: no Nuxt instance or full-site message bundle is needed.
test('EN/SK feature messages have matching keys, interpolation names and valid message syntax', async () => {
  const directory = new URL('../i18n/messages/', import.meta.url)
  for (const file of (await readdir(directory)).filter((file) => file.endsWith('.ts'))) {
    const { en, sk } = await import(new URL(file, directory).href)
    assert.ok(en && sk, `${file}: both languages must be exported`)
    const english = leaves(en),
      slovak = leaves(sk)
    assert.deepEqual([...slovak.keys()].sort(), [...english.keys()].sort(), `${file}: missing or extra keys`)
    const errors: unknown[][] = []
    const previousError = console.error
    console.error = (...args: unknown[]) => errors.push(args)
    try {
      const { t } = createI18n({
        legacy: false,
        locale: 'sk',
        fallbackLocale: 'en',
        messages: { en, sk },
        pluralRules: { sk: slovakPluralRule },
        warnHtmlMessage: false,
      }).global
      for (const [key, source] of english) {
        const target = slovak.get(key)
        assert.equal(typeof source, 'string', `${file}:${key}: UI messages must be text`)
        assert.equal(typeof target, 'string', `${file}:${key}: UI messages must be text`)
        if (typeof source !== 'string' || typeof target !== 'string') continue
        assert.deepEqual(
          placeholders(target),
          placeholders(source),
          `${file}:${key}: interpolation names differ`,
        )
        const params = Object.fromEntries(
          placeholders(source).map((name) => [name, name === 'count' ? 2 : 'test']),
        )
        t(key, params)
        t(key, params, { locale: 'en' })
      }
    } finally {
      console.error = previousError
    }
    assert.deepEqual(errors, [], `${file}: Vue I18n message compiler errors`)
  }
})

test('all 109 editorial exercise guides have complete Slovak counterparts and identical identities', async () => {
  const englishDirectory = new URL('../content/exercises/', import.meta.url)
  const slovakDirectory = new URL('sk/', englishDirectory)
  const files = (await readdir(englishDirectory)).filter((file) => file.endsWith('.ts')).sort()
  assert.equal(files.length, 109)
  assert.deepEqual((await readdir(slovakDirectory)).filter((file) => file.endsWith('.ts')).sort(), files)
  for (const file of files) {
    const english = leaves((await import(new URL(file, englishDirectory).href)).default)
    const slovak = leaves((await import(new URL(file, slovakDirectory).href)).default)
    assert.deepEqual(
      [...slovak.keys()].sort(),
      [...english.keys()].sort(),
      `${file}: incomplete guide structure`,
    )
    for (const [key, source] of english) {
      const target = slovak.get(key)
      if (
        key === 'slug' ||
        key.endsWith('.slug') ||
        key.startsWith('relatedSlugs.') ||
        typeof source !== 'string'
      ) {
        assert.deepEqual(target, source, `${file}:${key}: changed identity or factual value`)
      } else if (source.trim().split(/\s+/).length >= 12) {
        assert.notEqual(target, source, `${file}:${key}: untranslated paragraph`)
      }
    }
  }
})

test('global EN/SK messages have identical keys and named placeholders', async () => {
  const english = leaves((await import('../i18n/locales/en.ts')).default)
  const slovak = leaves((await import('../i18n/locales/sk.ts')).default)
  assert.deepEqual([...slovak.keys()].sort(), [...english.keys()].sort())
  for (const [key, value] of english) {
    assert.equal(typeof value, 'string', key)
    assert.deepEqual(placeholders(String(slovak.get(key))), placeholders(String(value)), key)
  }
})

test('journal translations retain every section, table, source link and FAQ', async () => {
  const directory = new URL('../content/journal/', import.meta.url)
  let count = 0
  const links = (body: string) => [...body.matchAll(/href="([^"]+)"/g)].map((match) => match[1]).sort()
  const structure = (body: string) =>
    [...body.matchAll(/<(section|h2|h3|table|thead|tr)\b/g)].map((match) => match[1])
  for (const file of (await readdir(directory)).filter((file) => file.endsWith('.ts'))) {
    const { en, sk } = await import(new URL(file, directory).href)
    if (!en?.body) continue
    count++
    assert.deepEqual(
      [...leaves(sk).keys()].sort(),
      [...leaves(en).keys()].sort(),
      `${file}: incomplete article`,
    )
    assert.equal(sk.path, en.path, `${file}: changed route`)
    assert.equal(sk.datePublished, en.datePublished, `${file}: changed publication date`)
    assert.equal(sk.dateUpdated, en.dateUpdated, `${file}: changed update date`)
    assert.deepEqual(structure(sk.body), structure(en.body), `${file}: omitted section or table`)
    assert.deepEqual(links(sk.body), links(en.body), `${file}: omitted source or related link`)
  }
  assert.equal(count, 11)
})

test('distinct exercise FAQs must not become repeated generic answers', async () => {
  const directory = new URL('../content/exercises/', import.meta.url)
  for (const file of (await readdir(directory)).filter((file) => file.endsWith('.ts'))) {
    const en = (await import(new URL(file, directory).href)).default
    const sk = (await import(new URL(`sk/${file}`, directory).href)).default
    for (const key of ['question', 'answer']) {
      assert.equal(
        new Set(sk.faqs?.map((faq: Record<string, string>) => faq[key])).size,
        new Set(en.faqs?.map((faq: Record<string, string>) => faq[key])).size,
        `${file}: distinct FAQ ${key}s were replaced with duplicate copy`,
      )
    }
  }
})
