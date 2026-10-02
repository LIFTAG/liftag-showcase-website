import { discoverySitemapPaths } from '../../utils/discoverySitemap'
import { siteLocaleAlternates } from '../../utils/siteLocale'
import { hreflangUrlEntry, sitemapXml, xmlHeaders } from '../../utils/sitemapXml'

const SITEMAP_NS
  = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'

export default defineEventHandler(async (event) => {
  const manifest = await getDiscoverySitemapManifest()
  if (!manifest) {
    setResponseStatus(event, 503)
    setHeader(event, 'retry-after', 300)
    setHeader(event, 'cache-control', 'no-store')
    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return sitemapXml('', SITEMAP_NS)
  }

  for (const [name, value] of Object.entries(xmlHeaders())) setHeader(event, name, value)
  const entries = discoverySitemapPaths(manifest).flatMap((path) => {
    const alternates = siteLocaleAlternates(path)
    return alternates
      .filter(item => item.hreflang !== 'x-default')
      .map(item => hreflangUrlEntry(item.path, null, alternates))
  })
  return sitemapXml(entries.join('\n'), SITEMAP_NS)
})
