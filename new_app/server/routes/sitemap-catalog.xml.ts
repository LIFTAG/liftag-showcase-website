import { exerciseHreflangAlternates } from '../../utils/catalogLocale'
import { musclePath } from '../../utils/muscles'
import { hreflangUrlEntry, sitemapXml, urlEntry, xmlHeaders } from '../../utils/sitemapXml'

const CATALOG_SITEMAP_NS
  = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'

function catalogHreflangEntries(slug: string | undefined, lastmod?: string | null): string[] {
  const alternates = exerciseHreflangAlternates(slug)
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
  if (!snapshot) return sitemapXml('')

  const entries: string[] = [
    ...catalogHreflangEntries(undefined, snapshot.fetchedAt),
    urlEntry('/machines', snapshot.fetchedAt),
    urlEntry('/muscles', snapshot.fetchedAt),
    ...snapshot.categories
      .filter(category => category.isActive && category.slug)
      .map(category => urlEntry(musclePath(category.slug), snapshot.fetchedAt)),
    ...snapshot.exercises
      .filter(exercise => exercise.slug)
      .flatMap(exercise =>
        catalogHreflangEntries(exercise.slug!, exercise.updatedAt ?? exercise.createdAt)),
    ...snapshot.machines.map(machine =>
      urlEntry(`/machines/${machine.slug ?? machine.id}`, machine.updatedAt ?? machine.createdAt)),
  ]

  return sitemapXml(entries.join('\n'), CATALOG_SITEMAP_NS)
})
