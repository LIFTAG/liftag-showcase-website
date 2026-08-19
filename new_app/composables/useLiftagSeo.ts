import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from '~/utils/seoSchema'

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

export function useLiftagSeo(options: LiftagSeoOptions) {
  const path = options.path ?? '/'
  const url = new URL(path, SITE_URL).toString()
  const image = options.image ?? DEFAULT_IMAGE
  const robots = options.noindex ? 'noindex,nofollow' : 'index,follow'
  const locale = options.locale ?? 'en_US'

  useSeoMeta({
    title: options.title,
    description: options.description,
    robots,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: 'LIFTAG',
    ogLocale: locale,
    ogImage: image,
    ogImageSecureUrl: image,
    ogImageType: ogImageMimeType(image),
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    ogImageAlt: options.title,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
    twitterImageAlt: options.title,
  })

  const config = useRuntimeConfig()
  const googleVerify = (config.public.googleSiteVerification as string | undefined) ?? ''
  const bingVerify = (config.public.bingSiteVerification as string | undefined) ?? ''
  const verificationMeta: Array<{ name: string, content: string }> = []
  if (googleVerify) {
    verificationMeta.push({ name: 'google-site-verification', content: googleVerify })
  }
  if (bingVerify) {
    verificationMeta.push({ name: 'msvalidate.01', content: bingVerify })
  }

  const alternateLinks = (options.alternates ?? []).map(item => ({
    rel: 'alternate' as const,
    hreflang: item.hreflang,
    href: new URL(item.path, SITE_URL).toString(),
  }))

  // Czech/Slovak diacritics live in the latin-ext subset, which the global
  // config does not preload; without this the text repaints in a second font
  // wave. Inter carries the body copy, so it is the only subset worth preloading.
  const latinExtFontLinks = options.lang === 'cs' || options.lang === 'sk'
    ? [{ rel: 'preload' as const, as: 'font' as const, type: 'font/woff2', crossorigin: '' as const, href: '/assets/fonts/inter-latin-ext.woff2' }]
    : []

  useHead({
    ...(options.lang ? { htmlAttrs: { lang: options.lang } } : {}),
    link: [
      { rel: 'canonical', href: url },
      ...latinExtFontLinks,
      ...alternateLinks,
    ],
    ...(verificationMeta.length ? { meta: verificationMeta } : {}),
  })
}

export function useLiftagStructuredData(items: Record<string, unknown>[]) {
  useHead({
    script: [
      {
        key: 'liftag-json-ld',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': items,
        }),
      },
    ],
  })
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
