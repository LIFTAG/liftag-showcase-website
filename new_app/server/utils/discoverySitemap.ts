import { assertStablePagination, discoverySitemapPaths, requireUniqueIds, type DiscoverySitemapGym, type DiscoverySitemapManifest } from '../../utils/discoverySitemap'
import { DISCOVERY_UUID } from '../../utils/discovery'
import { discoveryRecord } from '../../utils/discoveryData'

const PAGE_LIMIT = 100
const MAX_GYMS = 100
const MAX_GYM_PAGES = Math.ceil(MAX_GYMS / PAGE_LIMIT)
const MAX_RESOURCE_PAGES = 30
const MAX_CANONICAL_PATHS = 25_000
const CONCURRENCY = 4
let activeRequests = 0
const requestWaiters: Array<() => void> = []

interface PublicPage {
  data: unknown[]
  total: number
  currentPage: number
  lastPage: number
}

function publicId(value: unknown): string | null {
  return typeof value === 'string' && DISCOVERY_UUID.test(value) ? value : null
}

function requirePublicIds(rows: unknown[], field: string, source: string): string[] {
  return requireUniqueIds(rows.map(row => publicId(discoveryRecord(row)[field])), source)
}

async function withRequestSlot<T>(work: () => Promise<T>): Promise<T> {
  if (activeRequests >= CONCURRENCY)
    await new Promise<void>(resolve => requestWaiters.push(resolve))
  activeRequests++
  try {
    return await work()
  }
  finally {
    activeRequests--
    requestWaiters.shift()?.()
  }
}

async function fetchPublicPage(
  baseURL: string,
  path: string,
  page: number,
  maxPages: number,
): Promise<PublicPage> {
  const response = discoveryRecord(await withRequestSlot(() => $fetch<unknown>(path, {
    baseURL,
    timeout: 12_000,
    retry: 0,
    query: { page, limit: PAGE_LIMIT, lang: 'en' },
    headers: { 'Accept-Language': 'en' },
  })))
  const metadata = discoveryRecord(response.metadata)
  if (!Array.isArray(response.data)) throw new Error(`Invalid discovery data for ${path}`)
  const total = Number(metadata.total)
  const currentPage = Number(metadata.currentPage)
  const lastPage = Number(metadata.lastPage)
  if (![total, currentPage, lastPage].every(Number.isSafeInteger)
    || total < 0 || currentPage !== page || lastPage < 1 || lastPage > maxPages) {
    throw new Error(`Discovery pagination overflow or invalid metadata for ${path}`)
  }
  return { data: response.data, total, currentPage, lastPage }
}

async function fetchAllPublicRows(
  baseURL: string,
  path: string,
  maxPages = MAX_RESOURCE_PAGES,
): Promise<unknown[]> {
  const rows: unknown[] = []
  let expectedTotal: number | null = null
  let expectedLastPage: number | null = null
  for (let page = 1; page <= maxPages; page++) {
    const result = await fetchPublicPage(baseURL, path, page, maxPages)
    expectedTotal ??= result.total
    expectedLastPage ??= result.lastPage
    assertStablePagination(
      { total: expectedTotal, lastPage: expectedLastPage },
      result,
      path,
    )
    rows.push(...result.data)
    if (rows.length > result.total) throw new Error(`Discovery pagination duplicated rows for ${path}`)
    if (page >= result.lastPage) {
      if (rows.length !== result.total) throw new Error(`Discovery pagination omitted rows for ${path}`)
      return rows
    }
  }
  throw new Error(`Discovery pagination exceeded ${maxPages} pages for ${path}`)
}

async function mapConcurrent<T, R>(items: T[], work: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await work(items[index]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker()))
  return results
}

async function fetchGymGraph(baseURL: string, gymId: string): Promise<DiscoverySitemapGym> {
  const [detailResponse, equipment, routines] = await Promise.all([
    withRequestSlot(() => $fetch<unknown>(`/v1/gyms/${gymId}`, {
      baseURL,
      timeout: 12_000,
      retry: 0,
      query: { equipment: 'summary', lang: 'en' },
      headers: { 'Accept-Language': 'en' },
    })),
    fetchAllPublicRows(baseURL, `/v1/gyms/${gymId}/machines`),
    fetchAllPublicRows(baseURL, `/v1/gyms/${gymId}/routines`),
  ])
  const detail = discoveryRecord(discoveryRecord(detailResponse).data)
  const gym = discoveryRecord(detail.gym)
  if (publicId(gym.id) !== gymId || !Array.isArray(detail.trainers))
    throw new Error(`Invalid discovery detail for gym ${gymId}`)
  const trainerIds = requirePublicIds(
    detail.trainers,
    'id',
    `trainer for gym ${gymId}`,
  )
  const equipmentIds = requirePublicIds(equipment, 'gymMachineId', `equipment for gym ${gymId}`)
  const publicRoutines = routines
    .map(discoveryRecord)
    .filter(row => row.visibility === 'public')
  const routineIds = requirePublicIds(publicRoutines, 'id', `routine for gym ${gymId}`)
  return {
    id: gymId,
    equipmentIds,
    trainerIds,
    routineIds,
  }
}

const readDiscoverySitemapManifest = defineCachedFunction(
  async (baseURL: string): Promise<DiscoverySitemapManifest> => {
    const gymRows = await fetchAllPublicRows(baseURL, '/v1/gyms', MAX_GYM_PAGES)
    if (gymRows.length > MAX_GYMS) throw new Error(`Discovery sitemap exceeds ${MAX_GYMS} gyms`)
    const gymIds = requirePublicIds(gymRows, 'id', 'gym')
    const manifest = {
      gyms: await mapConcurrent(gymIds, id => fetchGymGraph(baseURL, id)),
    }
    if (discoverySitemapPaths(manifest).length > MAX_CANONICAL_PATHS)
      throw new Error(`Discovery sitemap exceeds ${MAX_CANONICAL_PATHS} canonical paths`)
    return manifest
  },
  { name: 'discovery-sitemap-manifest', maxAge: 3600, staleMaxAge: 86_400 },
)

export async function getDiscoverySitemapManifest(): Promise<DiscoverySitemapManifest | null> {
  try {
    return await readDiscoverySitemapManifest(String(useRuntimeConfig().public.apiBaseUrl))
  }
  catch (error) {
    console.error('[discovery-sitemap]', error)
    return null
  }
}
