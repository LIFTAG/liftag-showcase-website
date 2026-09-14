import type {
  Coordinate,
  DiscoveryFilters,
  DiscoveryLocale,
  DiscoveryPage,
  ExploreGym,
  GymDetail,
  GymMapResult,
  MapViewport,
} from '~/types/discovery'
import {
  MAP_VIEWPORT_KEYS,
  discoveryMode,
  discoveryMapKey,
  discoveryViewport,
  emptyDiscoveryFilters,
  filterDiscoveryGyms,
  readDiscoveryQuery,
  sameViewport,
  writeDiscoveryQuery,
  splitMapBounds,
} from '../utils/discovery.ts'

type BrowseState = ReturnType<typeof readDiscoveryQuery>
interface ExploreSession {
  state: BrowseState
  scroll: number
  items: ExploreGym[]
  page: number
  lastPage: number
  meta: { truncated: boolean; tooLarge: boolean }
  locale: DiscoveryLocale
  timezone: string | null | undefined
  fetchedKey: string | null
  fetchedAt: number
}
const querySignature = (query: Record<string, unknown>) =>
  JSON.stringify(Object.entries(query).sort(([a], [b]) => a.localeCompare(b)))
const stateSignature = (state: BrowseState) =>
  JSON.stringify([
    state.search,
    state.filters,
    state.selectedId,
    ...MAP_VIEWPORT_KEYS.map((key) => state.viewport[key]),
  ])

export function useExplore(locale: Ref<DiscoveryLocale>) {
  const route = useRoute(),
    router = useRouter()
  const saved = useState<ExploreSession | null>('explore-browse-state', () => null)
  const fromUrl = readDiscoveryQuery(route.query)
  const initial = Object.keys(route.query).some((key) => key !== 'lang')
    ? fromUrl
    : (saved.value?.state ?? fromUrl)
  const restored =
    saved.value &&
    stateSignature(initial) === stateSignature(saved.value.state) &&
    saved.value.locale === locale.value
      ? saved.value
      : null
  const search = shallowRef(initial.search),
    settledSearch = shallowRef(initial.search.trim())
  const filters = ref<DiscoveryFilters>({
    ...initial.filters,
    manufacturers: [...initial.filters.manufacturers],
  })
  const viewport = shallowRef<MapViewport>({ ...initial.viewport })
  const selectedId = shallowRef<string | null>(initial.selectedId)
  const scroll = shallowRef(restored?.scroll ?? 0)
  const { location, locating, denied, locate } = useDiscoveryLocation()
  const contextTimezone = shallowRef<string | null | undefined>(restored?.timezone)
  const camera = shallowRef({
    point: { lat: viewport.value.lat, lng: viewport.value.lng },
    zoom: viewport.value.zoom,
    revision: 0,
  })
  const mode = computed(() => discoveryMode(settledSearch.value, filters.value, location.value))
  // Everything but the camera: while this is unchanged a map request is just a
  // pan, so the previous results stay on screen instead of being cleared.
  const queryBase = computed(() =>
    JSON.stringify([
      mode.value,
      locale.value,
      mode.value === 'search' ? settledSearch.value.trim() : filters.value.manufacturers,
    ]),
  )
  const queryKey = computed(() =>
    JSON.stringify([
      queryBase.value,
      mode.value === 'map'
        ? discoveryMapKey(viewport.value)
        : mode.value === 'nearby'
          ? [location.value, filters.value.distance]
          : null,
    ]),
  )
  // Saved input may be newer than the response. Restore data only for the
  // request that actually produced it, independently of the browsing state.
  const restoredResults = restored?.fetchedKey === queryKey.value ? restored : null
  const items = shallowRef<ExploreGym[]>(restoredResults?.items ?? [])
  const loading = shallowRef(!restoredResults),
    error = shallowRef(false)
  const meta = shallowRef(restoredResults?.meta ?? { truncated: false, tooLarge: false })
  const page = shallowRef(restoredResults?.page ?? 0),
    lastPage = shallowRef(restoredResults?.lastPage ?? 1)
  const visible = computed(() =>
    filterDiscoveryGyms(items.value, filters.value, settledSearch.value, location.value),
  )
  let controller: AbortController | undefined, contextController: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined, urlTimer: ReturnType<typeof setTimeout> | undefined
  let request = 0,
    disposed = false,
    mounted = false,
    lastWritten = ''
  let fetchedKey = restoredResults?.fetchedKey ?? null
  let fetchedAt = restoredResults?.fetchedAt ?? 0

  function persist() {
    saved.value = {
      state: {
        search: search.value,
        filters: { ...filters.value, manufacturers: [...filters.value.manufacturers] },
        viewport: { ...viewport.value },
        selectedId: selectedId.value,
      },
      scroll: scroll.value,
      items: [...items.value],
      page: page.value,
      lastPage: lastPage.value,
      meta: { ...meta.value },
      locale: locale.value,
      timezone: contextTimezone.value,
      fetchedKey,
      fetchedAt,
    }
  }
  function saveQuery() {
    if (route.path !== '/explore' || disposed) return
    persist()
    const query = {
      ...(route.query.lang ? { lang: route.query.lang } : {}),
      ...writeDiscoveryQuery({
        filters: filters.value,
        search: search.value,
        selectedId: selectedId.value,
        viewport: viewport.value,
      }),
    }
    lastWritten = querySignature(query)
    if (lastWritten !== querySignature(route.query)) void router.replace({ query })
  }
  async function load(more = false) {
    if (more && (loading.value || page.value >= lastPage.value)) return
    controller?.abort()
    controller = new AbortController()
    const current = ++request,
      signal = controller.signal,
      key = queryKey.value
    if (!more) fetchedKey = null
    loading.value = true
    error.value = false
    try {
      if (mode.value === 'map') {
        const bounds = splitMapBounds(viewport.value)
        if (!bounds.length) throw new Error('Invalid viewport')
        const results = await Promise.all(
          bounds.map((b) =>
            $fetch<GymMapResult>('/api/explore/map', {
              query: { ...b, lang: locale.value, manufacturers: filters.value.manufacturers.join(',') },
              signal,
              retry: 0,
            }),
          ),
        )
        if (current !== request) return
        items.value = [...new Map(results.flatMap((r) => r.items).map((g) => [g.id, g])).values()]
        meta.value = {
          truncated: results.some((r) => r.meta.truncated),
          tooLarge: results.some((r) => r.meta.tooLarge),
        }
        page.value = 1
        lastPage.value = 1
      } else {
        const query =
          mode.value === 'search'
            ? { search: settledSearch.value.trim() }
            : {
                lat: location.value!.lat,
                lng: location.value!.lng,
                radius: filters.value.distance! * 1000,
                manufacturers: filters.value.manufacturers.join(','),
              }
        const result = await $fetch<DiscoveryPage<ExploreGym>>(
          mode.value === 'search' ? '/api/explore/gyms' : '/api/explore/nearby',
          {
            query: { ...query, lang: locale.value, page: more ? page.value + 1 : 1, limit: 24 },
            signal,
            retry: 0,
          },
        )
        if (current !== request) return
        items.value = [
          ...new Map([...(more ? items.value : []), ...result.items].map((g) => [g.id, g])).values(),
        ]
        page.value = result.meta.currentPage
        lastPage.value = result.meta.lastPage
        meta.value = { truncated: false, tooLarge: false }
      }
      fetchedKey = key
      fetchedAt = Date.now()
      persist()
    } catch {
      if (current === request && !disposed) error.value = true
    } finally {
      if (current === request && !disposed) loading.value = false
    }
  }
  function move(point: Coordinate, zoom = 14) {
    viewport.value = discoveryViewport(point, zoom)
    camera.value = { point: { lat: point.lat, lng: point.lng }, zoom, revision: camera.value.revision + 1 }
  }
  function select(gym: ExploreGym) {
    selectedId.value = gym.id
    move(gym, Math.max(12, viewport.value.zoom))
  }
  function updateViewport(value: MapViewport) {
    if (!sameViewport(value, viewport.value)) viewport.value = value
  }
  async function findLocation() {
    const point = await locate()
    if (point && !disposed) move(point, 13)
  }
  function scheduleLoad(keepPrevious = false) {
    if (!mounted) return
    controller?.abort()
    request++
    clearTimeout(timer)
    fetchedKey = null
    // Keep the same marker/card instances while the next viewport is loading,
    // just like the app's keepPreviousData. Mode/filter changes reset the list.
    if (!keepPrevious) items.value = []
    meta.value = { truncated: false, tooLarge: false }
    page.value = 0
    loading.value = true
    error.value = false
    timer = setTimeout(() => {
      void load()
    }, 250)
  }
  watch(() => search.value.trim(), (value, _, cleanup) => {
    controller?.abort()
    request++
    clearTimeout(timer)
    loading.value = true
    const timeout = setTimeout(() => {
      if (settledSearch.value === value) scheduleLoad()
      else settledSearch.value = value
    }, 300)
    cleanup(() => clearTimeout(timeout))
  })
  let lastQueryBase = queryBase.value
  watch(queryKey, () => {
    const panOnly = mode.value === 'map' && queryBase.value === lastQueryBase
    lastQueryBase = queryBase.value
    scheduleLoad(panOnly)
  })
  watch(
    () => [search.value, filters.value, viewport.value, selectedId.value],
    () => {
      if (!mounted) return
      clearTimeout(urlTimer)
      urlTimer = setTimeout(saveQuery, 100)
    },
    { deep: true },
  )
  watch(
    () => filters.value.distance,
    (value) => {
      if (value !== null && location.value && !settledSearch.value.trim())
        move(location.value, value <= 3 ? 14 : value <= 10 ? 12 : 10)
    },
  )
  watch(
    () => route.query,
    (value, previous) => {
      if (route.path !== '/explore' || querySignature(value) === lastWritten) return
      const next = readDiscoveryQuery(value)
      // A language change must not overwrite input or map movement that is
      // still waiting for the debounced URL write. Locale reloads separately.
      if (stateSignature(next) === stateSignature(readDiscoveryQuery(previous))) return
      search.value = next.search
      filters.value = next.filters
      selectedId.value = next.selectedId
      if (!sameViewport(next.viewport, viewport.value)) {
        viewport.value = next.viewport
        camera.value = { point: next.viewport, zoom: next.viewport.zoom, revision: camera.value.revision + 1 }
      }
    },
  )
  onMounted(async () => {
    if (selectedId.value && !restored && route.query.lat === undefined) {
      const contextId = selectedId.value
      contextController = new AbortController()
      try {
        const gym = await $fetch<GymDetail>(`/api/explore/gyms/${contextId}`, {
          query: { lang: route.query.lang },
          signal: contextController.signal,
          retry: 0,
        })
        if (disposed) return
        contextTimezone.value = gym.gym.timezone
        move(gym.gym, 14)
      } catch {
        /* Missing context must not prevent browsing other gyms. */
      }
    }
    if (disposed) return
    mounted = true
    if (fetchedKey !== queryKey.value || Date.now() - fetchedAt > 60000) void load()
    saveQuery()
  })
  onBeforeUnmount(persist)
  onScopeDispose(() => {
    disposed = true
    request++
    clearTimeout(timer)
    clearTimeout(urlTimer)
    controller?.abort()
    contextController?.abort()
  })
  return {
    search,
    settledSearch,
    filters,
    viewport,
    selectedId,
    scroll,
    location,
    locating,
    denied,
    contextTimezone,
    camera,
    visible,
    loading,
    error,
    meta,
    hasMore: computed(() => mode.value !== 'map' && page.value > 0 && page.value < lastPage.value),
    select,
    updateViewport,
    findLocation,
    retry: () => load(),
    loadMore: () => load(true),
    reset: () => {
      filters.value = emptyDiscoveryFilters()
    },
  }
}
