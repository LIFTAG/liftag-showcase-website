import { siteLocaleAlternates } from '../../utils/siteLocale'
import { musclePath, MUSCLE_HUBS } from '../../utils/muscles'
import { hreflangUrlEntry, sitemapXml, xmlHeaders } from '../../utils/sitemapXml'

const CATALOG_SITEMAP_NS
  = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'

function catalogHreflangEntries(path: string, lastmod?: string | null): string[] {
  const alternates = siteLocaleAlternates(path)
  return alternates
    .filter(item => item.hreflang !== 'x-default')
    .map(item => hreflangUrlEntry(item.path, lastmod, alternates))
}

/**
 * Catalog sitemap generated from the live API so new exercises, machines, and
 * muscle hubs get crawled without touching a hand-maintained file.
 */
export default defineEventHandler(async (event) => {
  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])

  const snapshot = await getCatalogSnapshotOrNull()
  if (!snapshot) {
    setResponseStatus(event, 503)
    setHeader(event, 'retry-after', 300)
    setHeader(event, 'cache-control', 'no-store')
    return sitemapXml('')
  }

  const entries: string[] = [
    // A cache refresh is not a content modification. Omit lastmod for hubs
    // rather than telling crawlers these pages changed every hour.
    ...catalogHreflangEntries('/exercises'),
    ...catalogHreflangEntries('/machines'),
    ...catalogHreflangEntries('/muscles'),
    // The page route accepts only curated MUSCLE_HUBS. API categories are a
    // broader taxonomy and can contain slugs that intentionally render 404.
    ...MUSCLE_HUBS
      .flatMap(hub => catalogHreflangEntries(musclePath(hub.slug))),
    ...snapshot.exercises
      .filter(exercise => exercise.slug)
      .flatMap(exercise =>
        catalogHreflangEntries(`/exercises/${exercise.slug}`, exercise.updatedAt ?? exercise.createdAt)),
    ...snapshot.machines.flatMap(machine =>
      catalogHreflangEntries(`/machines/${machine.slug ?? machine.id}`, machine.updatedAt ?? machine.createdAt)),
  ]

  return sitemapXml(entries.join('\n'), CATALOG_SITEMAP_NS)
})
