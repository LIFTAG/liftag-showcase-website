import type { MaybeRefOrGetter } from 'vue'
import { catalogPageNumber, catalogPagePath } from '~/utils/catalogPagination'

/** Linked SSR pages with the existing append-more interaction after hydration. */
export function useCatalogPagination(options: {
  path: MaybeRefOrGetter<string>
  total: MaybeRefOrGetter<number>
  filters?: MaybeRefOrGetter<Record<string, string>>
  pageSize?: number
}) {
  const route = useRoute()
  const pageSize = options.pageSize ?? 48
  const page = shallowRef(1)
  const visibleCount = shallowRef(pageSize)
  function resolvePage(value: unknown) {
    const candidate = catalogPageNumber(value)
    const maxPage = Math.max(1, Math.ceil(toValue(options.total) / pageSize))
    if (candidate === null || candidate > maxPage) {
      throw createError({ statusCode: 404, statusMessage: 'Catalog page not found', fatal: true })
    }
    page.value = candidate
    visibleCount.value = pageSize
  }
  resolvePage(route.query.page)
  watch(() => route.query.page, resolvePage)

  const offset = computed(() => (page.value - 1) * pageSize)
  const end = computed(() => offset.value + visibleCount.value)
  const filters = computed(() => toValue(options.filters) ?? {})
  const canonicalPath = computed(() => catalogPagePath(toValue(options.path),
    Object.values(filters.value).some(Boolean) ? 1 : page.value))
  const nextPath = computed(() => end.value < toValue(options.total)
    ? catalogPagePath(toValue(options.path), Math.floor(end.value / pageSize) + 1, filters.value)
    : undefined)
  const previousPath = computed(() => page.value > 1
    ? catalogPagePath(toValue(options.path), page.value - 1, filters.value)
    : undefined)
  function reset() {
    page.value = 1
    visibleCount.value = pageSize
  }
  return {
    page, offset, end, visibleCount, canonicalPath, nextPath, previousPath, reset,
    showMore: () => { visibleCount.value += pageSize },
  }
}
