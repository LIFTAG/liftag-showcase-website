import type {
  CatalogCategory,
  CatalogExercise,
  CatalogListResponse,
  CatalogMachine,
} from '../../types/catalog'
import type { CatalogLocale } from '../../utils/catalogLocale'
import { scheduleIndexNowSubmit } from './indexNowSubmit'

const PAGE_LIMIT = 100
/** 30 pages x 100 rows is ~7x today's catalog; a runaway loop stops here. */
const MAX_PAGES = 30

async function fetchAllPages<T>(
  apiBaseUrl: string,
  path: string,
  locale: CatalogLocale,
): Promise<T[]> {
  const rows: T[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await $fetch<CatalogListResponse<T>>(path, {
      baseURL: apiBaseUrl,
      timeout: 10000,
      query: { page, limit: PAGE_LIMIT },
      headers: { 'Accept-Language': locale },
    })
    rows.push(...res.data)
    if (page >= res.metadata.lastPage) break
  }
  return rows
}

export interface CatalogSnapshot {
  exercises: CatalogExercise[]
  machines: CatalogMachine[]
  categories: CatalogCategory[]
  fetchedAt: string
}

/**
 * One cached aggregation of the public catalog, shared by the search-index
 * API route and the catalog sitemap. ~7 upstream requests per refresh at
 * today's catalog size; each response is CDN-cached upstream too.
 *
 * Cache key is the locale: `en` and `sk` return different `name` / `description`
 * payloads. Default stays `en` so English routes are unchanged.
 */
export const getCatalogSnapshot = defineCachedFunction(
  async (locale: CatalogLocale = 'en'): Promise<CatalogSnapshot> => {
    const lang: CatalogLocale = locale === 'sk' ? 'sk' : 'en'
    const { apiBaseUrl } = useRuntimeConfig().public
    const base = String(apiBaseUrl)
    const [exercises, machines, categories] = await Promise.all([
      fetchAllPages<CatalogExercise>(base, '/v1/catalog/exercise-templates', lang),
      fetchAllPages<CatalogMachine>(base, '/v1/catalog/machine-templates', lang),
      fetchAllPages<CatalogCategory>(base, '/v1/catalog/exercise-categories', lang),
    ])
    const snapshot: CatalogSnapshot = {
      exercises,
      machines,
      categories,
      fetchedAt: new Date().toISOString(),
    }
    // English snapshot owns IndexNow URLs (SK slugs are included there).
    // Fire-and-forget so sitemap-catalog.xml cannot 500 on IndexNow failure.
    if (lang === 'en') scheduleIndexNowSubmit(snapshot)
    return snapshot
  },
  {
    name: 'catalog-snapshot',
    getKey: (locale: CatalogLocale = 'en') => (locale === 'sk' ? 'sk' : 'en'),
    maxAge: 3600,
    staleMaxAge: 86400,
  },
)

/** Sitemap routes prefer an empty urlset over a 500 that Google caches as "Couldn't fetch". */
export async function getCatalogSnapshotOrNull(
  locale: CatalogLocale = 'en',
): Promise<CatalogSnapshot | null> {
  try {
    return await getCatalogSnapshot(locale)
  }
  catch (error) {
    console.error('[catalog-snapshot]', error)
    return null
  }
}
