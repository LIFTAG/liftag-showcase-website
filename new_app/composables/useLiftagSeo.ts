const SITE_URL = 'https://liftag.fit'
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`

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

  useHead({
    link: [
      { rel: 'canonical', href: url },
    ],
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
  logo: `${SITE_URL}/assets/logo.svg`,
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
