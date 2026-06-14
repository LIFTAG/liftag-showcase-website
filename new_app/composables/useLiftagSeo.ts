const SITE_URL = 'https://liftag.fit'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

interface LiftagSeoOptions {
  title: string
  description: string
  path?: string
  image?: string
  noindex?: boolean
}

export function useLiftagSeo(options: LiftagSeoOptions) {
  const path = options.path ?? '/'
  const url = new URL(path, SITE_URL).toString()
  const image = options.image ?? DEFAULT_IMAGE
  const robots = options.noindex ? 'noindex,nofollow' : 'index,follow'

  useSeoMeta({
    title: options.title,
    description: options.description,
    robots,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: 'LIFTAG',
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
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

  useHead({
    link: [
      { rel: 'canonical', href: url },
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

export function liftagBreadcrumbs(items: Array<{ name: string, path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  }
}

export const liftagOrganization = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'LIFTAG',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo-apple-touch.png`,
  sameAs: [
    'https://www.instagram.com/liftag.fit/',
  ],
}

export const liftagSoftwareApplication = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#app`,
  name: 'LIFTAG',
  url: `${SITE_URL}/`,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'iOS, Android',
  description: 'LIFTAG lets lifters tap NFC tags or scan QR codes on gym machines to open the right exercise, log sets, and track progress.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
}

export const liftagMobileApplication = {
  '@type': 'MobileApplication',
  '@id': `${SITE_URL}/#mobile-app`,
  name: 'LIFTAG',
  alternateName: ['Liftag', 'LIFTAG Workout Tracker'],
  url: `${SITE_URL}/`,
  applicationCategory: 'HealthApplication',
  applicationSubCategory: 'Fitness',
  operatingSystem: 'iOS, Android',
  description: 'LIFTAG is a workout and set tracking app for serious lifters. Tap NFC tags or scan QR codes on gym machines to open the right exercise, log every set, run rest timers, and track progress over time.',
  featureList: [
    'NFC tap and QR scan to open the right exercise on any partner-gym machine',
    'Set logging with weight, reps, rest time, and optional RPE',
    'Rest timer with auto-start after a logged set',
    'Personal record tracking and estimated 1RM',
    'Volume, frequency, and progress charts per exercise and per muscle group',
    'Workout history with full set-by-set audit trail',
    'Trainer profiles, discovery, and shared workout plans',
    'Partner-gym discovery on a map',
    'Gym-specific exercise instruction videos filmed on the actual equipment',
  ],
  inLanguage: ['en'],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
}

export function liftagFAQPage(items: Array<{ question: string, answer: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

interface LiftagArticleOptions {
  headline: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  image?: string
  author?: { name: string, url?: string }
}

export function liftagArticle(opts: LiftagArticleOptions) {
  const url = new URL(opts.path, SITE_URL).toString()
  const image = opts.image ?? DEFAULT_IMAGE
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: opts.headline,
    description: opts.description,
    image,
    url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: opts.author ?? {
      '@type': 'Organization',
      name: 'LIFTAG',
      url: `${SITE_URL}/`,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  }
}

interface LiftagLocalBusinessOptions {
  slug: string
  name: string
  description: string
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
  latitude?: number
  longitude?: number
  url?: string
  image?: string
}

export function liftagLocalBusiness(opts: LiftagLocalBusinessOptions) {
  const url = opts.url ?? new URL(`/gyms/${opts.slug}`, SITE_URL).toString()
  return {
    '@type': 'SportsActivityLocation',
    '@id': `${url}#gym`,
    name: opts.name,
    description: opts.description,
    url,
    image: opts.image ?? DEFAULT_IMAGE,
    ...(opts.streetAddress || opts.addressLocality
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: opts.streetAddress,
            addressLocality: opts.addressLocality,
            addressRegion: opts.addressRegion,
            postalCode: opts.postalCode,
            addressCountry: opts.addressCountry,
          },
        }
      : {}),
    ...(opts.latitude !== undefined && opts.longitude !== undefined
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: opts.latitude,
            longitude: opts.longitude,
          },
        }
      : {}),
  }
}

export const liftagWebSite = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'LIFTAG',
  url: `${SITE_URL}/`,
  description: 'LIFTAG: workout tracking for serious lifters. NFC and QR for gym machines, set logging, progress tracking, trainers, and partner gyms.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}
