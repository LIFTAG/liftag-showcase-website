import { LEGAL_HREFLANG_PAGES, STATIC_PAGES } from '../../utils/staticPages'
import { sitemapUrl, sitemapXml, urlEntry, xmlHeaders } from '../../utils/sitemapXml'

function legalEntry(englishPath: string, locPath: string, lastmod: string, changefreq: string, priority: string): string {
  const slug = englishPath.replace(/^\//, '')
  return `<url><loc>${sitemapUrl(locPath)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority><xhtml:link rel="alternate" hreflang="en" href="https://liftag.fit/${slug}" /><xhtml:link rel="alternate" hreflang="sk" href="https://liftag.fit/sk/${slug}" /><xhtml:link rel="alternate" hreflang="cs" href="https://liftag.fit/cs/${slug}" /><xhtml:link rel="alternate" hreflang="x-default" href="https://liftag.fit/${slug}" /></url>`
}

export default defineEventHandler((event) => {
  const legal = new Set<string>(LEGAL_HREFLANG_PAGES)
  const entries = STATIC_PAGES.map((page) => {
    if (legal.has(page.path)) {
      return legalEntry(page.path, page.path, page.lastmod, page.changefreq, page.priority)
    }
    return urlEntry(page.path, page.lastmod, {
      changefreq: page.changefreq,
      priority: page.priority,
    })
  })

  for (const locale of ['sk', 'cs'] as const) {
    for (const path of LEGAL_HREFLANG_PAGES) {
      entries.push(legalEntry(path, `/${locale}${path}`, '2026-08-14', 'yearly', '0.2'))
    }
  }

  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])
  return sitemapXml(
    entries.join('\n'),
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"',
  )
})
