import { imageUrlEntry, sitemapXml, xmlHeaders } from '../../utils/sitemapXml'

export default defineEventHandler(async (event) => {
  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])

  const snapshot = await getCatalogSnapshotOrNull()
  if (!snapshot) return sitemapXml('')

  const entries = [
    ...snapshot.exercises
      .filter(exercise => exercise.slug && exercise.imageUrl)
      .map(exercise => imageUrlEntry({
        path: `/exercises/${exercise.slug}`,
        imageUrl: exercise.imageUrl!,
        title: exercise.name,
        caption: `${exercise.name} in the LIFTAG exercise library`,
        lastmod: exercise.updatedAt ?? exercise.createdAt,
      })),
    ...snapshot.machines
      .filter(machine => machine.photoUrl)
      .map(machine => imageUrlEntry({
        path: `/machines/${machine.slug ?? machine.id}`,
        imageUrl: machine.photoUrl!,
        title: machine.name,
        caption: `${machine.name} in the LIFTAG machine catalog`,
        lastmod: machine.updatedAt ?? machine.createdAt,
      })),
  ]

  return sitemapXml(
    entries.join('\n'),
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  )
})
