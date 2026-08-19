import type {
  CatalogExercise,
  CatalogIndexPayload,
  CatalogMachine,
} from '~/types/catalog'

/** Shared search index; one fetch per render, deduped across pages. */
export function useCatalogIndex() {
  const requestFetch = useRequestFetch()
  return useAsyncData<CatalogIndexPayload>(
    'catalog-index',
    () => requestFetch<CatalogIndexPayload>('/api/catalog/search-index'),
    { dedupe: 'defer' },
  )
}

/**
 * Resolve an exercise by slug or UUID through the site's own catalog route.
 * That route maps slugs via the cached snapshot; the upstream show endpoint
 * only accepts UUIDs and 422s on a slug, which used to 404 the page when the
 * relative search-index fallback could not run (ISR / Vercel).
 *
 * useRequestFetch is grabbed before the first await so the Nuxt instance is
 * still available inside a useAsyncData handler.
 */
export async function resolveCatalogExercise(param: string): Promise<CatalogExercise | null> {
  const requestFetch = useRequestFetch()
  try {
    return await requestFetch<CatalogExercise>(
      `/api/catalog/exercises/${encodeURIComponent(param)}`,
    )
  }
  catch {
    return null
  }
}

/** Machine counterpart of resolveCatalogExercise. */
export async function resolveCatalogMachine(param: string): Promise<CatalogMachine | null> {
  const requestFetch = useRequestFetch()
  try {
    return await requestFetch<CatalogMachine>(
      `/api/catalog/machines/${encodeURIComponent(param)}`,
    )
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
