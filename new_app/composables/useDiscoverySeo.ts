import type { MaybeRefOrGetter } from 'vue'
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'

export function useDiscoverySeo(
  name: MaybeRefOrGetter<string>,
  description: MaybeRefOrGetter<string>,
  locale: MaybeRefOrGetter<DiscoveryLocale>,
  photo?: MaybeRefOrGetter<string | null | undefined>,
  kind: 'gym' | 'profile' | 'page' = 'page',
  details?: MaybeRefOrGetter<Record<string, unknown>>,
  canonicalPath?: MaybeRefOrGetter<string>,
) {
  const route = useRoute()
  const url = computed(() => `https://liftag.fit${toValue(canonicalPath) ?? `${route.path}?lang=${toValue(locale)}`}`)
  useSeoMeta({
    title: () => `${toValue(name)} | LIFTAG`,
    description: () => toValue(description),
    ogTitle: () => `${toValue(name)} | LIFTAG`,
    ogDescription: () => toValue(description),
    ogUrl: () => url.value,
    ogImage: () => toValue(photo) ?? 'https://liftag.fit/og-image.jpg',
    ogLocale: () => (toValue(locale) === 'sk' ? 'sk_SK' : 'en_US'),
    twitterCard: 'summary_large_image',
  })
  useHead(() => {
    const copy = discoveryCopy(toValue(locale))
    const crumbs = [
      { '@type': 'ListItem', position: 1, name: 'LIFTAG', item: 'https://liftag.fit/' },
      ...(route.path === '/explore'
        ? []
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: copy.explore,
              item: `https://liftag.fit/explore?lang=${toValue(locale)}`,
            },
          ]),
    ]
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: toValue(name), item: url.value })
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
        { '@type': 'BreadcrumbList', itemListElement: crumbs },
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
