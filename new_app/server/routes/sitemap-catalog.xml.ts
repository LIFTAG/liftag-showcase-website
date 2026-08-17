const SITE_URL = 'https://liftag.fit'

function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

function urlEntry(path: string, lastmod?: string | null): string {
  const loc = xmlEscape(`${SITE_URL}${path}`)
  const stamp = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `<url><loc>${loc}</loc>${stamp}</url>`
}

/**
 * Catalog sitemap generated from the live API so new exercises and machines
 * get crawled without touching the hand-maintained /sitemap.xml. Referenced
 * from robots.txt.
 */
export default defineEventHandler(async (event) => {
  const snapshot = await getCatalogSnapshot()

  const entries: string[] = [
    urlEntry('/exercises', snapshot.fetchedAt),
    urlEntry('/machines', snapshot.fetchedAt),
    ...snapshot.exercises
      .filter(exercise => exercise.slug)
      .map(exercise =>
        urlEntry(`/exercises/${exercise.slug}`, exercise.updatedAt ?? exercise.createdAt)),
    ...snapshot.machines.map(machine =>
      urlEntry(`/machines/${machine.slug ?? machine.id}`, machine.updatedAt ?? machine.createdAt)),
  ]

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
})
