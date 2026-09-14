import type { MaybeRefOrGetter } from 'vue'
import type { SiteLocale } from '~/types/locale'
import { isDiscoveryLocalePath, siteBasePath, siteLocale, siteLocaleLocation, siteLocalePath, sitePathLocale } from '~/utils/siteLocale'

/** The i18n composer owns active language; this facade owns the manual preference. */
export function useSiteLocale() {
  const route = useRoute()
  const i18n = useNuxtApp().$i18n
  const switching = useState('site-locale-switching', () => false)
  const saved = useCookie<SiteLocale | null>('liftag-language', {
    path: '/', sameSite: 'lax', maxAge: 31536000, default: () => null,
  })
  const browserLanguage = useState('site-browser-language', () => import.meta.server
    ? (useRequestHeaders(['accept-language'])['accept-language'] ?? '') : navigator.language)
  const preference = computed(() => siteLocale(route.query.lang)
    ?? (sitePathLocale(route.path) === 'sk' ? 'sk' : undefined)
    ?? siteLocale(saved.value))
  const locale = computed<SiteLocale>(() => siteLocale(i18n.locale.value) ?? 'en')
  async function setLocale(value: SiteLocale) {
    saved.value = value
    switching.value = true
    try {
      await navigateTo(siteLocaleLocation(route, value), { replace: true })
      await nextTick()
    } finally { switching.value = false }
  }
  const href = (path: string) => {
    if (/^(?:https?:|mailto:|tel:|#)/.test(path)) return path
    if (/^\/(?:get|qr|routines|plans|trainer-invites|auth)(?:[/?#]|$)/.test(path)) {
      const url = new URL(path, 'https://liftag.fit')
      url.searchParams.set('lang', locale.value)
      return `${url.pathname}${url.search}${url.hash}`
    }
    return siteLocalePath(path, locale.value)
  }
  return { locale, preference, switching: readonly(switching), browserLanguage: readonly(browserLanguage), setLocale, href, basePath: computed(() => siteBasePath(route.path)) }
}

/** Automatic discovery choices resolve to a language URL without saving a manual preference. */
export function useSitePageLocale(value: MaybeRefOrGetter<SiteLocale>) {
  const app = useNuxtApp()
  const route = useRoute()
  watch(() => toValue(value), async resolved => {
    if (isDiscoveryLocalePath(route.path, route.query) && sitePathLocale(route.path) !== resolved) {
      await app.runWithContext(() => navigateTo(siteLocaleLocation(route, resolved), { replace: true, redirectCode: 302 }))
    }
  }, { immediate: true })
}
