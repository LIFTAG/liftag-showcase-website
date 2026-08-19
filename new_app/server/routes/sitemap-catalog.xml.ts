import { musclePath } from '../../utils/muscles'
import { sitemapXml, urlEntry, xmlHeaders } from '../../utils/sitemapXml'

/**
 * Catalog sitemap generated from the live API so new exercises, machines, and
 * muscle hubs get crawled without touching a hand-maintained file.
 */
export default defineEventHandler(async (event) => {
  const snapshot = await getCatalogSnapshot()

  const entries: string[] = [
    urlEntry('/exercises', snapshot.fetchedAt),
    urlEntry('/machines', snapshot.fetchedAt),
    urlEntry('/muscles', snapshot.fetchedAt),
    ...snapshot.categories
      .filter(category => category.isActive && category.slug)
      .map(category => urlEntry(musclePath(category.slug), snapshot.fetchedAt)),
    ...snapshot.exercises
      .filter(exercise => exercise.slug)
      .map(exercise =>
        urlEntry(`/exercises/${exercise.slug}`, exercise.updatedAt ?? exercise.createdAt)),
    ...snapshot.machines.map(machine =>
      urlEntry(`/machines/${machine.slug ?? machine.id}`, machine.updatedAt ?? machine.createdAt)),
  ]

  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])
  return sitemapXml(entries.join('\n'))
})
