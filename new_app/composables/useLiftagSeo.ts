import { localizedSharedSchema } from '~/utils/localizedSeoSchema'
import type { MaybeRefOrGetter } from 'vue'
import { siteCanonicalPath, siteLocaleAlternates, isLocalizedSitePath } from '~/utils/siteLocale'
import { exerciseHreflangAlternates } from '~/utils/catalogLocale'
import { DEFAULT_OG_IMAGE, SITE_URL } from '~/utils/seoSchema'

const DEFAULT_IMAGE = DEFAULT_OG_IMAGE

/**
 * Every image this site advertises is a 1200x630 card: the static og-image and
 * both /api/og/* renderers. Declaring the size matters because crawlers lay the
 * preview card out before the image itself has been fetched. Without it there
 * is no aspect ratio to work with, so the first share of a link renders with a
 * missing or square-cropped thumbnail.
 */
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

/** The card routes serve PNG; the static fallback is a JPEG. */
function ogImageMimeType(url: string): 'image/jpeg' | 'image/png' {
  return /\.jpe?g(\?|$)/i.test(url) ? 'image/jpeg' : 'image/png'
}

export interface LiftagAlternate {
  hreflang: string
  path: string
}

interface LiftagSeoOptions {
  title: string
  description: string
  path?: string
  image?: string
  noindex?: boolean
  lang?: string
  locale?: string
  alternates?: LiftagAlternate[]
}

export function useLiftagSeo(input: MaybeRefOrGetter<LiftagSeoOptions>) {
  const { locale } = useSiteLocale()
  const options = computed(() => toValue(input))
  const lang = computed(() => options.value.lang ?? locale.value)
  const path = computed(() =>
    lang.value === 'cs'
      ? (options.value.path ?? '/')
      : siteCanonicalPath(options.value.path ?? '/', lang.value === 'sk' ? 'sk' : 'en'),
  )
  const url = computed(() => new URL(path.value, SITE_URL).toString())
  const image = computed(() => options.value.image ?? DEFAULT_IMAGE)
  useSeoMeta({
    title: () => options.value.title,
    description: () => options.value.description,
    robots: () => (options.value.noindex ? 'noindex,nofollow' : 'index,follow'),
    ogTitle: () => options.value.title,
    ogDescription: () => options.value.description,
    ogType: 'website',
    ogUrl: () => url.value,
    ogSiteName: 'LIFTAG',
    ogLocale: () =>
      options.value.locale ?? (lang.value === 'sk' ? 'sk_SK' : lang.value === 'cs' ? 'cs_CZ' : 'en_US'),
    ogImage: () => image.value,
    ogImageSecureUrl: () => image.value,
    ogImageType: () => ogImageMimeType(image.value),
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    ogImageAlt: () => options.value.title,
    twitterCard: 'summary_large_image',
    twitterTitle: () => options.value.title,
    twitterDescription: () => options.value.description,
    twitterImage: () => image.value,
    twitterImageAlt: () => options.value.title,
  })
  const config = useRuntimeConfig()
  useHead(() => ({
    htmlAttrs: { lang: lang.value },
    meta: [
      ...(config.public.googleSiteVerification
        ? [{ name: 'google-site-verification', content: String(config.public.googleSiteVerification) }]
        : []),
      ...(config.public.bingSiteVerification
        ? [{ name: 'msvalidate.01', content: String(config.public.bingSiteVerification) }]
        : []),
    ],
    link: [
      { rel: 'canonical', href: url.value },
      ...(
        options.value.alternates ?? (isLocalizedSitePath(path.value) ? siteLocaleAlternates(path.value) : [])
      ).map((item) => ({
        rel: 'alternate',
        hreflang: item.hreflang,
        href: new URL(
          item.hreflang === 'cs'
            ? item.path
            : siteCanonicalPath(item.path, item.hreflang === 'sk' ? 'sk' : 'en'),
          SITE_URL,
        ).toString(),
      })),
      ...(['sk', 'cs'].includes(lang.value)
        ? ['inter', 'space-grotesk'].map((font) => ({
            rel: 'preload',
            as: 'font' as const,
            type: 'font/woff2',
            crossorigin: '' as const,
            href: `/assets/fonts/${font}-latin-ext.woff2`,
          }))
        : []),
    ],
  }))
}

export function useLiftagStructuredData(input: MaybeRefOrGetter<Record<string, unknown>[]>) {
  const { locale } = useSiteLocale()
  useHead(() => ({
    script: [
      {
        key: 'liftag-json-ld',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': localizedSharedSchema(toValue(input), locale.value),
        }).replaceAll('<', '\\u003c'),
      },
    ],
  }))
}

export function liftagLegalAlternates(kind: 'privacy' | 'terms'): LiftagAlternate[] {
  const slug = kind === 'privacy' ? 'privacy-policy' : 'terms-and-conditions'
  return [
    { hreflang: 'en', path: `/${slug}` },
    { hreflang: 'sk', path: `/sk/${slug}` },
    { hreflang: 'cs', path: `/cs/${slug}` },
    { hreflang: 'x-default', path: `/${slug}` },
  ]
}

/** Exercise library only: en + sk. No cs — the catalog API does not translate Czech. */
export function liftagExerciseAlternates(slug?: string): LiftagAlternate[] {
  return exerciseHreflangAlternates(slug)
}
