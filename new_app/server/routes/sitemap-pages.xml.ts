import { LEGAL_HREFLANG_PAGES, STATIC_PAGES } from '../../utils/staticPages'
import { siteLocaleAlternates } from '../../utils/siteLocale'
import { hreflangUrlEntry, sitemapXml, xmlHeaders } from '../../utils/sitemapXml'

export default defineEventHandler((event) => {
  const legal = new Set<string>(LEGAL_HREFLANG_PAGES)
  const entries = STATIC_PAGES.flatMap((page) => {
    const alternates = siteLocaleAlternates(page.path)
    if (legal.has(page.path)) alternates.push({ hreflang: 'cs', path: `/cs${page.path}` })
    return alternates.filter(item => item.hreflang !== 'x-default')
      .map(item => hreflangUrlEntry(item.path, page.lastmod, alternates))
  })
  for (const [name, value] of Object.entries(xmlHeaders())) setHeader(event, name, value)
  return sitemapXml(entries.join('\n'),
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"')
})
