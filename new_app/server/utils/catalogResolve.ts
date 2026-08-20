import type {
  CatalogExercise,
  CatalogItemResponse,
  CatalogMachine,
} from '../../types/catalog'
import type { CatalogLocale } from '../../utils/catalogLocale'
import { getCatalogSnapshot } from './catalogData'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The public show endpoints only accept UUIDs (`id` must be a valid UUID).
 * A slug hit 422s. Resolve slug → id from the cached snapshot, then enrich
 * with the show payload. If show is down, the list row is enough to render.
 */
async function fetchShow<T>(path: string, locale: CatalogLocale = 'en'): Promise<T | null> {
  const base = String(useRuntimeConfig().public.apiBaseUrl)
  try {
    const res = await $fetch<CatalogItemResponse<T>>(path, {
      baseURL: base,
      timeout: 8000,
      headers: { 'Accept-Language': locale },
    })
    return res.data
  }
  catch {
    return null
  }
}

export async function resolveExerciseFromCatalog(
  param: string,
  locale: CatalogLocale = 'en',
): Promise<CatalogExercise | null> {
  const lang: CatalogLocale = locale === 'sk' ? 'sk' : 'en'
  const snapshot = await getCatalogSnapshot(lang)
  const hit = snapshot.exercises.find(exercise => exercise.slug === param || exercise.id === param)
  if (hit) {
    return (await fetchShow<CatalogExercise>(`/v1/catalog/exercise-templates/${hit.id}`, lang)) ?? hit
  }
  if (!UUID_RE.test(param)) return null
  return fetchShow<CatalogExercise>(`/v1/catalog/exercise-templates/${param}`, lang)
}

export async function resolveMachineFromCatalog(param: string): Promise<CatalogMachine | null> {
  const snapshot = await getCatalogSnapshot()
  const hit = snapshot.machines.find(machine => machine.slug === param || machine.id === param)
  if (hit) {
    return (await fetchShow<CatalogMachine>(`/v1/catalog/machine-templates/${hit.id}`)) ?? hit
  }
  if (!UUID_RE.test(param)) return null
  return fetchShow<CatalogMachine>(`/v1/catalog/machine-templates/${param}`)
}
