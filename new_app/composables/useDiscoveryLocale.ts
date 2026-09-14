import type { MaybeRefOrGetter } from 'vue'
import { resolveDiscoveryLocale, discoveryHref } from '~/utils/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'

export function useDiscoveryLocale(timezone?: MaybeRefOrGetter<string | null | undefined>) {
  const { preference, browserLanguage } = useSiteLocale()
  const locale = computed(() =>
    resolveDiscoveryLocale(preference.value, undefined, toValue(timezone), browserLanguage.value),
  )
  useSitePageLocale(locale)
  const copy = computed(() => discoveryCopy(locale.value))
  const href = (path: string, query: Record<string, string | number | undefined> = {}) =>
    discoveryHref(path, locale.value, query)
  return { locale, preference, copy, href }
}
