import type { MaybeRefOrGetter } from 'vue'
import type { SiteLocale } from '~/types/locale'
import { defaultSiteLocale, siteLocale, siteLocaleLocation, sitePathLocale } from '~/utils/siteLocale'

interface PageLocale {
  owner: string
  path: string
  locale: SiteLocale
}

function usePageLocaleState() {
  return useState<PageLocale | null>('site-page-locale', () => null)
}

/** One preference for the whole site; page translations can be added gradually. */
export function useSiteLocale() {
  const route = useRoute()
  const saved = useCookie<SiteLocale | null>('liftag-language', {
    path: '/',
    sameSite: 'lax',
    maxAge: 31536000,
    default: () => null,
  })
  const browserLanguage = useState('site-browser-language', () =>
    import.meta.server
      ? (useRequestHeaders(['accept-language'])['accept-language'] ?? '')
      : navigator.language,
  )
  // Prerendered marketing pages cannot capture a visitor's browser language.
  onMounted(() => { browserLanguage.value = navigator.language })
  const page = usePageLocaleState()
  const preference = computed(() => siteLocale(route.query.lang) ?? siteLocale(saved.value))
  const locale = computed(() =>
    siteLocale(route.query.lang)
    ?? sitePathLocale(route.path)
    ?? preference.value
    ?? (page.value?.path === route.path ? page.value.locale : undefined)
    ?? defaultSiteLocale(undefined, browserLanguage.value),
  )

  async function setLocale(value: SiteLocale) {
    saved.value = value
    await navigateTo(siteLocaleLocation(route, value), { replace: true })
  }

  return { locale, preference, browserLanguage: readonly(browserLanguage), setLocale }
}

/** Let the navbar reflect a page's automatic gym-language default without saving it. */
export function useSitePageLocale(locale: MaybeRefOrGetter<SiteLocale>) {
  const route = useRoute()
  const path = route.path
  const owner = useId()
  const page = usePageLocaleState()
  watchEffect(() => {
    if (route.path === path) page.value = { owner, path, locale: toValue(locale) }
  })
  onScopeDispose(() => {
    if (page.value?.owner === owner) page.value = null
  })
}
