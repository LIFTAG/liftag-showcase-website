export const SITE_URL = 'https://liftag.fit'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`
const APP_STORE_URL = 'https://apps.apple.com/app/id6761140080'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.liftag.app'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const APP_ID = `${SITE_URL}/#app`

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

export function liftagBreadcrumbs(items: Array<{ name: string, path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export const liftagOrganization = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'LIFTAG',
  legalName: 'LIFTAG',
  alternateName: ['Liftag', 'liftag.fit', 'LIFTAG Workout Tracker'],
  url: `${SITE_URL}/`,
  description: 'LIFTAG is a workout and set tracking app for serious lifters. Tap NFC tags or scan QR codes on gym machines to open the right exercise, log sets, and track progress.',
  email: 'support@liftag.fit',
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo-apple-touch.png`,
    width: 180,
    height: 180,
  },
  image: DEFAULT_OG_IMAGE,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bratislava',
    addressCountry: 'SK',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@liftag.fit',
      url: `${SITE_URL}/contact/support`,
      availableLanguage: ['en', 'sk', 'cs'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${SITE_URL}/contact/partner`,
      availableLanguage: ['en', 'sk', 'cs'],
    },
  ],
  sameAs: [
    'https://www.instagram.com/liftag.fit/',
    'https://www.tiktok.com/@liftag',
    'https://x.com/liftag_fit',
    'https://www.youtube.com/@liftag_fit',
    'https://www.reddit.com/r/liftag/',
    APP_STORE_URL,
    PLAY_STORE_URL,
  ],
  knowsAbout: [
    'workout tracking',
    'set logging',
    'NFC gym tags',
    'QR codes for gym machines',
    'strength training',
    'powerlifting',
  ],
}

export const liftagSoftwareApplication = {
  '@type': ['SoftwareApplication', 'MobileApplication'],
  '@id': APP_ID,
  name: 'LIFTAG',
  alternateName: ['Liftag', 'LIFTAG Workout Tracker'],
  url: `${SITE_URL}/`,
  applicationCategory: 'HealthApplication',
  applicationSubCategory: 'Fitness',
  operatingSystem: 'iOS, Android',
  softwareVersion: '1.0',
  downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
  installUrl: APP_STORE_URL,
  screenshot: [
    `${SITE_URL}/assets/screens/log-set.webp`,
    `${SITE_URL}/assets/screens/qr-scan.webp`,
    `${SITE_URL}/assets/screens/progression.webp`,
  ],
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
  inLanguage: ['en', 'sk'],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
  publisher: {
    '@id': ORGANIZATION_ID,
  },
}

/** @deprecated Use liftagSoftwareApplication. Kept so existing pages keep working. */
export const liftagMobileApplication = liftagSoftwareApplication

export const liftagWebSite = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'LIFTAG',
  alternateName: ['Liftag', 'liftag.fit'],
  url: `${SITE_URL}/`,
  description: 'LIFTAG: workout tracker for serious lifters. NFC and QR for gym machines, set logging, progress tracking, trainers, and partner gyms.',
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: ['en', 'sk', 'cs'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/exercises?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
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

export function liftagImageObject(opts: {
  url: string
  name: string
  caption?: string
  description?: string
  width?: number
  height?: number
}) {
  return {
    '@type': 'ImageObject',
    contentUrl: opts.url,
    url: opts.url,
    name: opts.name,
    caption: opts.caption ?? opts.name,
    description: opts.description ?? opts.caption ?? opts.name,
    creator: { '@id': ORGANIZATION_ID },
    copyrightHolder: { '@id': ORGANIZATION_ID },
    ...(opts.width ? { width: opts.width } : {}),
    ...(opts.height ? { height: opts.height } : {}),
  }
}

export function liftagVideoObject(opts: {
  name: string
  description: string
  contentUrl: string
  thumbnailUrl: string
  uploadDate?: string | null
}) {
  return {
    '@type': 'VideoObject',
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    contentUrl: opts.contentUrl,
    uploadDate: opts.uploadDate ?? undefined,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function liftagWebPage(opts: {
  path: string
  name: string
  description: string
  type?: 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage'
  image?: string
  aboutId?: string
  primaryImage?: Record<string, unknown>
}) {
  const url = absoluteUrl(opts.path)
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#page`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: opts.aboutId ? { '@id': opts.aboutId } : { '@id': ORGANIZATION_ID },
    primaryImageOfPage: opts.primaryImage
      ?? (opts.image ? { '@type': 'ImageObject', url: opts.image } : { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE }),
    inLanguage: 'en',
  }
}

export function liftagItemList(opts: {
  name: string
  items: Array<{ name: string, url: string }>
  id?: string
}) {
  return {
    '@type': 'ItemList',
    ...(opts.id ? { '@id': opts.id } : {}),
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

export function liftagHowTo(opts: {
  name: string
  description: string
  steps: string[]
  image?: string
  videoUrl?: string | null
  path: string
}) {
  const url = absoluteUrl(opts.path)
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.videoUrl ? { video: { contentUrl: opts.videoUrl } } : {}),
    step: opts.steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text,
    })),
  }
}

export function liftagPhysicalActivity(opts: {
  name: string
  description: string
  path: string
  image?: string | null
  category?: string | null
  muscles?: string[]
}) {
  const url = absoluteUrl(opts.path)
  return {
    '@type': 'PhysicalActivity',
    '@id': `${url}#exercise`,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.muscles?.length
      ? { associatedAnatomy: opts.muscles.map(muscle => ({ '@type': 'AnatomicalStructure', name: muscle })) }
      : {}),
  }
}

export function liftagExerciseEquipment(opts: {
  name: string
  description: string
  path: string
  image?: string | null
}) {
  const url = absoluteUrl(opts.path)
  return {
    '@type': 'ExerciseEquipment',
    '@id': `${url}#machine`,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.image ? { image: opts.image } : {}),
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
  const url = absoluteUrl(opts.path)
  const image = opts.image ?? DEFAULT_OG_IMAGE
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#page` },
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
    publisher: { '@id': ORGANIZATION_ID },
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
  const url = opts.url ?? absoluteUrl(`/gyms/${opts.slug}`)
  return {
    '@type': 'SportsActivityLocation',
    '@id': `${url}#gym`,
    name: opts.name,
    description: opts.description,
    url,
    image: opts.image ?? DEFAULT_OG_IMAGE,
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

export function liftagContactPage(opts: { name: string, path: string, description: string }) {
  const url = absoluteUrl(opts.path)
  return {
    '@type': 'ContactPage',
    '@id': `${url}#page`,
    name: opts.name,
    url,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  }
}
