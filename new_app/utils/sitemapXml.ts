const SITE_URL = 'https://liftag.fit'

export function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

export function sitemapUrl(path: string): string {
  return xmlEscape(`${SITE_URL}${path}`)
}

export function urlEntry(
  path: string,
  lastmod?: string | null,
  extra?: { changefreq?: string, priority?: string },
): string {
  const stamp = lastmod ? `<lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : ''
  const freq = extra?.changefreq ? `<changefreq>${extra.changefreq}</changefreq>` : ''
  const priority = extra?.priority ? `<priority>${extra.priority}</priority>` : ''
  return `<url><loc>${sitemapUrl(path)}</loc>${stamp}${freq}${priority}</url>`
}

export function hreflangUrlEntry(
  path: string,
  lastmod: string | null | undefined,
  alternates: Array<{ hreflang: string, path: string }>,
): string {
  const stamp = lastmod ? `<lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : ''
  const links = alternates
    .map(item => `<xhtml:link rel="alternate" hreflang="${xmlEscape(item.hreflang)}" href="${sitemapUrl(item.path)}" />`)
    .join('')
  return `<url><loc>${sitemapUrl(path)}</loc>${stamp}${links}</url>`
}

export function imageUrlEntry(opts: {
  path: string
  imageUrl: string
  title: string
  caption?: string
  lastmod?: string | null
}): string {
  const stamp = opts.lastmod ? `<lastmod>${xmlEscape(opts.lastmod.slice(0, 10))}</lastmod>` : ''
  const caption = opts.caption
    ? `<image:caption>${xmlEscape(opts.caption)}</image:caption>`
    : ''
  return `<url><loc>${sitemapUrl(opts.path)}</loc>${stamp}<image:image><image:loc>${xmlEscape(opts.imageUrl)}</image:loc><image:title>${xmlEscape(opts.title)}</image:title>${caption}</image:image></url>`
}

export function videoUrlEntry(opts: {
  path: string
  contentUrl: string
  thumbnailUrl: string
  title: string
  description: string
  lastmod?: string | null
}): string {
  const stamp = opts.lastmod ? `<lastmod>${xmlEscape(opts.lastmod.slice(0, 10))}</lastmod>` : ''
  return `<url><loc>${sitemapUrl(opts.path)}</loc>${stamp}<video:video><video:content_loc>${xmlEscape(opts.contentUrl)}</video:content_loc><video:thumbnail_loc>${xmlEscape(opts.thumbnailUrl)}</video:thumbnail_loc><video:title>${xmlEscape(opts.title)}</video:title><video:description>${xmlEscape(opts.description)}</video:description></video:video></url>`
}

export function sitemapXml(body: string, namespaces = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n${body}\n</urlset>\n`
}

export const SITEMAP_INDEX_PATHS = [
  '/sitemap-pages.xml',
  '/sitemap-catalog.xml',
  '/sitemap-images.xml',
  '/sitemap-videos.xml',
] as const

export function sitemapIndexXml(sitemaps: Array<{ path: string, lastmod?: string }>): string {
  const entries = sitemaps.map((item) => {
    const stamp = item.lastmod ? `<lastmod>${xmlEscape(item.lastmod.slice(0, 10))}</lastmod>` : ''
    return `<sitemap><loc>${sitemapUrl(item.path)}</loc>${stamp}</sitemap>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>\n`
}

/** Static index Google can fetch without waiting on the catalog API. */
export function defaultSitemapIndexXml(): string {
  return sitemapIndexXml(SITEMAP_INDEX_PATHS.map(path => ({ path })))
}

export function xmlHeaders() {
  return {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  }
}
