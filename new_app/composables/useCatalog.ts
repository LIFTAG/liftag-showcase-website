import type {
  CatalogExercise,
  CatalogIndexPayload,
  CatalogItemResponse,
  CatalogMachine,
} from '~/types/catalog'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Shared search index; one fetch per render, deduped across pages. */
export function useCatalogIndex() {
  return useAsyncData<CatalogIndexPayload>(
    'catalog-index',
    () => $fetch<CatalogIndexPayload>('/api/catalog/search-index'),
    { dedupe: 'defer' },
  )
}

async function fetchExerciseByParam(base: string, param: string): Promise<CatalogExercise | null> {
  try {
    const res = await $fetch<CatalogItemResponse<CatalogExercise>>(
      `/v1/catalog/exercise-templates/${param}`,
      { baseURL: base, timeout: 8000, headers: { 'Accept-Language': 'en' } },
    )
    return res.data
  }
  catch {
    return null
  }
}

async function fetchMachineByParam(base: string, param: string): Promise<CatalogMachine | null> {
  try {
    const res = await $fetch<CatalogItemResponse<CatalogMachine>>(
      `/v1/catalog/machine-templates/${param}`,
      { baseURL: base, timeout: 8000, headers: { 'Accept-Language': 'en' } },
    )
    return res.data
  }
  catch {
    return null
  }
}

/**
 * Resolve an exercise by slug (canonical URL) or UUID. Older API deployments
 * only accept UUIDs on the show endpoint, so a failed slug lookup falls back
 * to slug -> id via the site's own search index.
 *
 * The runtime config is read before the first await: these helpers run
 * inside useAsyncData handlers, where the Nuxt instance is gone after the
 * first suspension point.
 */
export async function resolveCatalogExercise(param: string): Promise<CatalogExercise | null> {
  const base = String(useRuntimeConfig().public.apiBaseUrl)
  const direct = await fetchExerciseByParam(base, param)
  if (direct) return direct
  if (UUID_RE.test(param)) return null
  try {
    const index = await $fetch<CatalogIndexPayload>('/api/catalog/search-index')
    const hit = index.exercises.find(exercise => exercise.slug === param)
    return hit ? await fetchExerciseByParam(base, hit.id) : null
  }
  catch {
    return null
  }
}

/** Machine counterpart of resolveCatalogExercise, same fallback strategy. */
export async function resolveCatalogMachine(param: string): Promise<CatalogMachine | null> {
  const base = String(useRuntimeConfig().public.apiBaseUrl)
  const direct = await fetchMachineByParam(base, param)
  if (direct) return direct
  if (UUID_RE.test(param)) return null
  try {
    const index = await $fetch<CatalogIndexPayload>('/api/catalog/search-index')
    const hit = index.machines.find(machine => machine.slug === param)
    return hit ? await fetchMachineByParam(base, hit.id) : null
  }
  catch {
    return null
  }
}

/** Canonical catalog path for a machine (slug when the API provides one). */
export function machinePath(machine: { slug?: string | null, id: string }): string {
  return `/machines/${machine.slug ?? machine.id}`
}

/** Lowercased, diacritic-free text for client-side catalog search. */
export function normalizeCatalogQuery(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
