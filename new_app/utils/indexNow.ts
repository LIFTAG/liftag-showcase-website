import { exerciseIndexPath, exercisePath } from './catalogLocale.ts'
import { musclePath, MUSCLE_HUBS } from './muscles.ts'
import { SITE_URL } from './seoSchema.ts'
import { LEGAL_HREFLANG_PAGES, STATIC_PAGES } from './staticPages.ts'

/** Published on purpose at `/{key}.txt`. Do not regenerate at boot. */
export const INDEXNOW_KEY = 'liftag-a91aeac60beb0c9cca6b09312a630913'
export const INDEXNOW_HOST = new URL(SITE_URL).host
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_MAX_URLS = 10_000
export const INDEXNOW_COOLDOWN_MS = 6 * 60 * 60 * 1000

const LEGAL_LOCALES = ['sk', 'cs'] as const

const DENIED_PATH_PREFIXES = [
  '/auth',
  '/qr',
  '/routines',
  '/plans',
  '/trainer-invites',
] as const

export interface IndexNowUrlEntry {
  url: string
  lastmod: string | null
}

export interface IndexNowCatalogInput {
  fetchedAt: string
  exercises: Array<{
    slug: string | null
    createdAt: string
    updatedAt: string | null
  }>
  machines: Array<{
    id: string
    slug?: string | null
    createdAt: string
    updatedAt: string | null
  }>
  categories: Array<{
    slug: string
    isActive: boolean
  }>
}

export interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export function liftagUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

export function isIndexNowUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    return false
  }
  if (parsed.protocol !== 'https:') return false
  if (parsed.hostname !== INDEXNOW_HOST) return false
  if (parsed.port !== '' && parsed.port !== '443') return false
  return !isDeniedPath(parsed.pathname)
}

function isDeniedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/get' || path.startsWith('/get/')) return true
  return DENIED_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}

export function shouldSkipIndexNowPing(lastSuccessAt: number | null, now: number): boolean {
  return lastSuccessAt != null && now - lastSuccessAt < INDEXNOW_COOLDOWN_MS
}

export function collectIndexNowEntries(catalog?: IndexNowCatalogInput | null): IndexNowUrlEntry[] {
  const entries: IndexNowUrlEntry[] = STATIC_PAGES.map(page => ({
    url: liftagUrl(page.path),
    lastmod: page.lastmod,
  }))

  for (const locale of LEGAL_LOCALES) {
    for (const path of LEGAL_HREFLANG_PAGES) {
      const english = STATIC_PAGES.find(page => page.path === path)
      entries.push({
        url: liftagUrl(`/${locale}${path}`),
        lastmod: english?.lastmod ?? null,
      })
    }
  }

  // Index and hub pages are always indexable; lastmod stays null so a warm
  // catalog refresh does not treat them as updated every hour.
  entries.push(
    { url: liftagUrl(exerciseIndexPath('en')), lastmod: null },
    { url: liftagUrl(exerciseIndexPath('sk')), lastmod: null },
    { url: liftagUrl('/machines'), lastmod: null },
    { url: liftagUrl('/muscles'), lastmod: null },
    ...MUSCLE_HUBS.map(hub => ({ url: liftagUrl(musclePath(hub.slug)), lastmod: null })),
  )

  if (!catalog) return entries

  const hubSlugs = new Set(MUSCLE_HUBS.map(hub => hub.slug))
  for (const category of catalog.categories) {
    if (!category.isActive || !category.slug || !hubSlugs.has(category.slug)) continue
    entries.push({ url: liftagUrl(musclePath(category.slug)), lastmod: null })
  }

  for (const exercise of catalog.exercises) {
    if (!exercise.slug) continue
    const stamp = exercise.updatedAt ?? exercise.createdAt
    entries.push(
      { url: liftagUrl(exercisePath(exercise.slug, 'en')), lastmod: stamp },
      { url: liftagUrl(exercisePath(exercise.slug, 'sk')), lastmod: stamp },
    )
  }

  for (const machine of catalog.machines) {
    entries.push({
      url: liftagUrl(`/machines/${machine.slug ?? machine.id}`),
      lastmod: machine.updatedAt ?? machine.createdAt,
    })
  }

  return entries
}

export function selectIndexNowUrls(
  entries: IndexNowUrlEntry[],
  sinceMs: number | null = null,
): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  for (const entry of entries) {
    if (!isIndexNowUrl(entry.url)) continue
    if (sinceMs != null) {
      if (!entry.lastmod) continue
      const stamp = Date.parse(entry.lastmod)
      if (!Number.isFinite(stamp) || stamp <= sinceMs) continue
    }
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    urls.push(entry.url)
    if (urls.length >= INDEXNOW_MAX_URLS) break
  }
  return urls
}

export function buildIndexNowPayload(urlList: string[]): IndexNowPayload {
  const urls: string[] = []
  const seen = new Set<string>()
  for (const url of urlList) {
    if (!isIndexNowUrl(url) || seen.has(url)) continue
    seen.add(url)
    urls.push(url)
    if (urls.length >= INDEXNOW_MAX_URLS) break
  }
  return {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  }
}
