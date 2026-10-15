import type { MaybeRefOrGetter } from 'vue'
import type {
  CatalogExercise,
  CatalogIndexPayload,
  CatalogMachine,
} from '~/types/catalog'
import type { CatalogLocale } from '~/utils/catalogLocale'

/** Shared search index; one fetch per render, deduped across pages. */
export function useCatalogIndex(locale: MaybeRefOrGetter<CatalogLocale> = 'en') {
  const requestFetch = useRequestFetch()
  return useAsyncData<CatalogIndexPayload>(
    computed(() => `catalog-index:${toValue(locale)}`),
    (_app, { signal }) => requestFetch<CatalogIndexPayload>('/api/catalog/search-index', {
      query: { locale: toValue(locale) }, signal,
    }),
    { dedupe: 'cancel' },
  )
}

/**
 * A page-specific slice of the shared search index. The full index is ~320KB
 * once serialized into a page payload; pages that only need machines, counts
 * or one muscle's rows reduce it inside the handler, so only the slice is
 * serialized. A client-side visit reuses an index another catalog page
 * already loaded instead of fetching it again.
 */
export function useCatalogIndexView<T>(
  name: string,
  locale: MaybeRefOrGetter<CatalogLocale>,
  reduce: (index: CatalogIndexPayload) => T,
  /** `lazy`: a client-side navigation renders without waiting (SSR still waits). */
  options: { lazy?: boolean } = {},
) {
  const requestFetch = useRequestFetch()
  // Client only: a server render never has another page's index in memory,
  // and reading it there would add empty keys to the payload.
  const loaded = import.meta.client
    ? {
        en: useNuxtData<CatalogIndexPayload | null>('catalog-index:en').data,
        sk: useNuxtData<CatalogIndexPayload | null>('catalog-index:sk').data,
      } satisfies Record<CatalogLocale, unknown>
    : null
  return useAsyncData<T>(
    computed(() => `catalog-index-view:${name}:${toValue(locale)}`),
    async (_app, { signal }) => {
      const lang = toValue(locale)
      return reduce(
        loaded?.[lang].value
        ?? await requestFetch<CatalogIndexPayload>('/api/catalog/search-index', { query: { locale: lang }, signal }),
      )
    },
    { dedupe: 'cancel', lazy: options.lazy ?? false },
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
export async function resolveCatalogExercise(
  param: string,
  locale: CatalogLocale = 'en',
  signal?: AbortSignal,
): Promise<CatalogExercise | null> {
  const requestFetch = useRequestFetch()
  try {
    const path = `/api/catalog/exercises/${encodeURIComponent(param)}`
    return await requestFetch<CatalogExercise>(path, { query: { locale }, signal })
  }
  catch {
    return null
  }
}

/** Machine counterpart of resolveCatalogExercise. */
export async function resolveCatalogMachine(param: string, locale: CatalogLocale = 'en', signal?: AbortSignal): Promise<CatalogMachine | null> {
  const requestFetch = useRequestFetch()
  try {
    return await requestFetch<CatalogMachine>(
      `/api/catalog/machines/${encodeURIComponent(param)}`,
      { query: { locale }, signal },
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
