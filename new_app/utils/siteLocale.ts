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

// Only these pages have translated routes today. Add future translations here;
// do not invent language-prefixed URLs for the English marketing pages.
const translatedPath = /^\/(sk\/)?(exercises(?:\/.*)?|privacy-policy\/?|terms-and-conditions\/?)$/

export function sitePathLocale(path: string): SiteLocale | undefined {
  const match = path.match(translatedPath)
  return match ? (match[1] ? 'sk' : 'en') : undefined
}

export function siteLocalePath(path: string, locale: SiteLocale): string {
  const match = path.match(translatedPath)
  // Czech legal pages also have EN/SK counterparts, but no Czech exercise routes.
  const contentPath = match?.[2] ?? path.match(/^\/cs\/(privacy-policy\/?|terms-and-conditions\/?)$/)?.[1]
  return contentPath ? `${locale === 'sk' ? '/sk' : ''}/${contentPath}` : path
}

export function siteLocaleLocation<T extends Record<string, unknown>>(
  route: { path: string; query: T; hash: string },
  locale: SiteLocale,
) {
  return {
    path: siteLocalePath(route.path, locale),
    query: { ...route.query, lang: locale },
    hash: route.hash,
  }
}
