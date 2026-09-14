import {
  defaultSiteLocale,
  isDiscoveryLocalePath,
  isLocalizedSitePath,
  siteBasePath,
  siteLocale,
  siteLocaleLocation,
  sitePathLocale,
} from '~/utils/siteLocale'
export default defineNuxtRouteMiddleware(async (to) => {
  const i18n = useNuxtApp().$i18n
  const explicit = siteLocale(to.query.lang)
  const pathLocale = to.path === '/sk' || to.path.startsWith('/sk/') ? 'sk' : sitePathLocale(to.path)
  const saved = siteLocale(useCookie('liftag-language').value)
  const base = siteBasePath(to.path)
  const discovery = isDiscoveryLocalePath(to.path, to.query)
  const gymContext = base.startsWith('/gyms/') || Boolean(to.query.gym)
  const browser = import.meta.server
    ? (useRequestHeaders(['accept-language'])['accept-language'] ?? '')
    : navigator.language
  const automatic = discovery && !gymContext ? defaultSiteLocale(undefined, browser) : 'en'
  const desired =
    explicit ??
    (pathLocale === 'sk' ? 'sk' : undefined) ??
    (discovery || !pathLocale ? (saved ?? automatic) : 'en')
  if (isLocalizedSitePath(to.path)) {
    const target = siteLocaleLocation(to, desired)
    if (target.path !== to.path) return navigateTo(target, { replace: true, redirectCode: 302 })
  }
  // Nuxt i18n owns language changes for its generated routes, including internal
  // resolved-locale state and hooks. Stable handoff routes deliberately opt out
  // of localized routing, so update their composer through the public API.
  if (!isLocalizedSitePath(to.path)) await i18n.setLocale(desired)
})
