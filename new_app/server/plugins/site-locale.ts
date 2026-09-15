import { isLocalizedSitePath, siteLocale, siteLocalePath, sitePathLocale } from '../../utils/siteLocale'

export default defineNitroPlugin((nitroApp) => {
  // Nitro 2 serves prerendered files before server/middleware. Wrap the public
  // request handler so query compatibility runs before both static HTML and
  // route-rule caches. Vercel's CDN performs the same redirect in vercel.json.
  const handleRequest = nitroApp.h3App.handler
  nitroApp.h3App.handler = (event) => {
    const url = getRequestURL(event)
    const locale = siteLocale(url.searchParams.get('lang'))
    if (locale && isLocalizedSitePath(url.pathname) && sitePathLocale(url.pathname) !== locale) {
      const path = siteLocalePath(url.pathname, locale)
      setResponseHeader(event, 'cache-control', 'no-store')
      return sendRedirect(event, `${path}${url.search}`, 302)
    }
    return handleRequest(event)
  }
})
