import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { DiscoveryPage } from '~/types/discovery'

/** What every paginated discovery list exposes; <DiscoveryList> renders it. */
export interface DiscoveryPageState<T> {
  items: ComputedRef<T[]>
  total: ComputedRef<number | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<boolean>
  hasMore: ComputedRef<boolean>
  loadMore: () => Promise<void>
  retry: () => Promise<void>
}

/** SSR the first page; further pages belong to one resource, locale and query. */
export function useDiscoveryPage<T>(
  path: MaybeRefOrGetter<string>,
  query: MaybeRefOrGetter<Record<string, string | number | undefined>>,
  pageSize = 24,
) {
  const key = computed(() => `discovery-list:${toValue(path)}:${JSON.stringify(toValue(query))}:${pageSize}`)
  const first = useAsyncData<DiscoveryPage<T>>(
    key,
    (_app, { signal }) =>
      $fetch<DiscoveryPage<T>, string>(toValue(path), {
        query: { ...toValue(query), page: 1, limit: pageSize },
        signal,
        retry: 0,
      }) as Promise<DiscoveryPage<T>>,
    { deep: false },
  )
  const firstData = first.data as Ref<DiscoveryPage<T> | undefined>
  const pages = shallowRef<DiscoveryPage<T>[]>([])
  const moreLoading = shallowRef(false),
    moreError = shallowRef(false)
  const meta = computed(() => pages.value.at(-1)?.meta ?? firstData.value?.meta)
  const hasMore = computed(() => Boolean(meta.value && meta.value.currentPage < meta.value.lastPage))
  let controller: AbortController | undefined
  let generation = 0
  watch(
    key,
    () => {
      generation++
      controller?.abort()
      pages.value = []
      moreLoading.value = false
      moreError.value = false
    },
    { flush: 'sync' },
  )
  async function loadMore() {
    if (moreLoading.value || !hasMore.value || !meta.value) return
    const current = generation
    controller = new AbortController()
    moreLoading.value = true
    moreError.value = false
    try {
      const result = (await $fetch<DiscoveryPage<T>, string>(toValue(path), {
        query: { ...toValue(query), page: meta.value.currentPage + 1, limit: pageSize },
        signal: controller.signal,
        retry: 0,
      })) as DiscoveryPage<T>
      if (current === generation) pages.value = [...pages.value, result]
    } catch {
      if (current === generation) moreError.value = true
    } finally {
      if (current === generation) moreLoading.value = false
    }
  }
  onScopeDispose(() => {
    generation++
    controller?.abort()
  })
  const result: DiscoveryPageState<T> = {
    items: computed(() => [...(firstData.value?.items ?? []), ...pages.value.flatMap((p) => p.items)]),
    total: computed(() => firstData.value?.meta.total ?? null),
    loading: computed(() => first.status.value === 'pending' || moreLoading.value),
    error: computed(() => Boolean(first.error.value) || moreError.value),
    hasMore,
    loadMore,
    retry: () => (first.error.value ? first.refresh() : loadMore()),
  }
  return first.then(() => result)
}
