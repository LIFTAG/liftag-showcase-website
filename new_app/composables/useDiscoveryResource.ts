import { isDiscoveryLocalePath, siteLocale, siteLocaleLocation, sitePathLocale } from '~/utils/siteLocale'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { DiscoveryLocale } from '~/types/discovery'
export async function useDiscoveryResource<T>(
  path: MaybeRefOrGetter<string>,
  locale: MaybeRefOrGetter<DiscoveryLocale | undefined>,
) {
  // These explicit local endpoints normalize and validate the upstream response.
  const app = useNuxtApp()
  const route = useRoute()
  const event = import.meta.server ? useRequestEvent() : undefined
  const result = await useAsyncData<T>(
    computed(() => `discovery:${toValue(path)}:${toValue(locale) ?? 'auto'}`),
    (_app, { signal }) =>
      $fetch<T, string>(toValue(path), { query: { lang: toValue(locale) }, signal, retry: 0 }) as Promise<T>,
  )
  const resolved = result.data.value as { locale?: unknown } | undefined
  if (!result.error.value && !toValue(locale) && siteLocale(resolved?.locale) === 'sk'
    && sitePathLocale(route.path) !== 'sk' && isDiscoveryLocalePath(route.path, route.query)) {
    await app.runWithContext(() => navigateTo(siteLocaleLocation(route, 'sk'), { replace: true, redirectCode: 302 }))
  }
  if (event && result.error.value) setResponseStatus(event, result.error.value.statusCode === 404 ? 404 : 502)
  return { ...result, data: result.data as Ref<T | undefined> }
}
