import type {
  CatalogCategory,
  CatalogExercise,
  CatalogListResponse,
  CatalogMachine,
} from '../../types/catalog'

const PAGE_LIMIT = 100
/** 30 pages x 100 rows is ~7x today's catalog; a runaway loop stops here. */
const MAX_PAGES = 30

async function fetchAllPages<T>(apiBaseUrl: string, path: string): Promise<T[]> {
  const rows: T[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await $fetch<CatalogListResponse<T>>(path, {
      baseURL: apiBaseUrl,
      timeout: 10000,
      query: { page, limit: PAGE_LIMIT },
      headers: { 'Accept-Language': 'en' },
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
 */
export const getCatalogSnapshot = defineCachedFunction(
  async (): Promise<CatalogSnapshot> => {
    const { apiBaseUrl } = useRuntimeConfig().public
    const base = String(apiBaseUrl)
    const [exercises, machines, categories] = await Promise.all([
      fetchAllPages<CatalogExercise>(base, '/v1/catalog/exercise-templates'),
      fetchAllPages<CatalogMachine>(base, '/v1/catalog/machine-templates'),
      fetchAllPages<CatalogCategory>(base, '/v1/catalog/exercise-categories'),
    ])
    return { exercises, machines, categories, fetchedAt: new Date().toISOString() }
  },
  {
    name: 'catalog-snapshot',
    getKey: () => 'all',
    maxAge: 3600,
    staleMaxAge: 86400,
  },
)
