import type { SiteLocale } from '../types/locale.ts'

export const SITE_LANGUAGES = [
  { locale: 'en', label: 'English' },
  { locale: 'sk', label: 'Slovenčina' },
] as const satisfies readonly { locale: SiteLocale; label: string }[]

export function siteLocale(value: unknown): SiteLocale | undefined {
  return value === 'sk' || value === 'en' ? value : undefined
}
export function defaultSiteLocale(timezone?: string | null, browserLanguage = ''): SiteLocale {
  if (timezone !== undefined)
    return timezone === 'Europe/Prague' || timezone === 'Europe/Bratislava' ? 'sk' : 'en'
  return /^(sk|cs)(?:-|,|;|$)/i.test(browserLanguage) ? 'sk' : 'en'
}
export function resolveSiteLocale(
  url: unknown,
  saved: unknown,
  timezone?: string | null,
  browserLanguage = '',
): SiteLocale {
  return siteLocale(url) ?? siteLocale(saved) ?? defaultSiteLocale(timezone, browserLanguage)
}

/** Strip only the supported website prefix; resource slugs and IDs never change. */
export function siteBasePath(path: string): string {
  return path === '/sk' || path === '/sk/' ? '/' : path.startsWith('/sk/') ? path.slice(3) : path
}
const publicPath =
  /^\/(?:$|(?:about|press|pricing|demo|gym-scan|for-lifters|for-trainers|for-gyms|become-a-coach|qr-nfc-gym-tags|best-workout-tracking-app|best-workout-tracker|best-gym-qr-nfc-app|privacy-policy|terms-and-conditions|1rm-calculator|pr-calculator|one-rep-max-calculator)\/?$|(?:contact|journal|guides|alternatives|vs|tools|exercises|machines|muscles|explore|gyms)(?:\/|$))/
export function isLocalizedSitePath(path: string): boolean {
  return publicPath.test(siteBasePath(path))
}
export function isDiscoveryLocalePath(path: string, query: Record<string, unknown> = {}): boolean {
  const base = siteBasePath(path)
  return (
    /^\/(?:explore|gyms)(?:\/|$)/.test(base) ||
    (Boolean(query.gym) && /^\/(?:machines|exercises)\//.test(base))
  )
}
export function sitePathLocale(path: string): SiteLocale | undefined {
  if (!isLocalizedSitePath(path)) return undefined
  return path === '/sk' || path.startsWith('/sk/') ? 'sk' : 'en'
}
export function siteLocalePath(path: string, locale: SiteLocale): string {
  const boundary = path.search(/[?#]/)
  const pathname = boundary < 0 ? path : path.slice(0, boundary)
  const suffix = boundary < 0 ? '' : path.slice(boundary)
  const legal = pathname.replace(/^\/cs\/(privacy-policy|terms-and-conditions)(\/?)$/, '/$1$2')
  if (!isLocalizedSitePath(legal)) return path
  const base = siteBasePath(legal)
  return `${locale === 'sk' ? (base === '/' ? '/sk' : `/sk${base}`) : base}${suffix}`
}
export function siteLocaleLocation<T extends Record<string, unknown>>(
  route: { path: string; query: T; hash: string },
  locale: SiteLocale,
) {
  const query = { ...route.query } as T & { lang?: SiteLocale }
  if (isDiscoveryLocalePath(route.path, query) || !isLocalizedSitePath(route.path) || 'lang' in query)
    query.lang = locale
  return { path: siteLocalePath(route.path, locale), query, hash: route.hash }
}
/** Canonicals identify content and gym context; language is already encoded by public paths. */
export function siteCanonicalPath(path: string, locale: SiteLocale): string {
  const url = new URL(siteLocalePath(path, locale), 'https://liftag.fit')
  if (isLocalizedSitePath(url.pathname)) url.searchParams.delete('lang')
  return `${url.pathname}${url.search}`
}
export function siteLocaleAlternates(path: string) {
  return [
    { hreflang: 'en', path: siteCanonicalPath(path, 'en') },
    { hreflang: 'sk', path: siteCanonicalPath(path, 'sk') },
    { hreflang: 'x-default', path: siteCanonicalPath(path, 'en') },
  ]
}
