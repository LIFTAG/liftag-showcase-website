import type { MaybeRefOrGetter } from 'vue'
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
import { DEFAULT_OG_IMAGE, SITE_URL, liftagBreadcrumbs } from '~/utils/seoSchema'

interface DiscoverySeoOptions {
  name: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  locale: MaybeRefOrGetter<DiscoveryLocale>
  photo?: MaybeRefOrGetter<string | null | undefined>
  kind?: 'gym' | 'profile' | 'page'
  /** Extra schema.org fields merged into the page's primary entity. */
  details?: MaybeRefOrGetter<Record<string, unknown>>
  canonicalPath?: MaybeRefOrGetter<string>
}

export function useDiscoverySeo(options: DiscoverySeoOptions) {
  const { name, description, locale, photo, details, canonicalPath, kind = 'page' } = options
  const route = useRoute()
  const url = computed(
    () => `${SITE_URL}${toValue(canonicalPath) ?? `${route.path}?lang=${toValue(locale)}`}`,
  )
  useSeoMeta({
    title: () => `${toValue(name)} | LIFTAG`,
    description: () => toValue(description),
    ogTitle: () => `${toValue(name)} | LIFTAG`,
    ogDescription: () => toValue(description),
    ogUrl: () => url.value,
    ogImage: () => toValue(photo) ?? DEFAULT_OG_IMAGE,
    ogLocale: () => (toValue(locale) === 'sk' ? 'sk_SK' : 'en_US'),
    twitterCard: 'summary_large_image',
  })
  useHead(() => {
    const copy = discoveryCopy(toValue(locale))
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': kind === 'gym' ? 'ExerciseGym' : kind === 'profile' ? 'ProfilePage' : 'WebPage',
          name: toValue(name),
          description: toValue(description),
          url: url.value,
          ...(toValue(photo) ? { image: toValue(photo) } : {}),
          ...(kind === 'profile'
            ? { mainEntity: { '@type': 'Person', name: toValue(name), url: url.value } }
            : {}),
          ...toValue(details),
        },
        liftagBreadcrumbs([
          { name: 'LIFTAG', path: '/' },
          ...(route.path === '/explore'
            ? []
            : [{ name: copy.explore, path: `/explore?lang=${toValue(locale)}` }]),
          { name: toValue(name), path: url.value },
        ]),
      ],
    }
    return {
      htmlAttrs: { lang: toValue(locale) },
      link: [
        { rel: 'canonical', href: url.value },
        ...(['en', 'sk'] as const).map((lang) => ({
          rel: 'alternate',
          hreflang: lang,
          href: url.value.replace(/([?&])lang=(en|sk)/, `$1lang=${lang}`),
        })),
      ],
      script: [
        {
          key: 'discovery-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema).replaceAll('<', '\\u003c'),
        },
      ],
    }
  })
}
