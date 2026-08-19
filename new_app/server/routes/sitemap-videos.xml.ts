import { catalogHasVideo, preferredCatalogVideoUrl } from '../../utils/catalogVideo'
import { sitemapXml, videoUrlEntry, xmlHeaders } from '../../utils/sitemapXml'

export default defineEventHandler(async (event) => {
  const snapshot = await getCatalogSnapshot()

  const entries = snapshot.exercises
    .filter(exercise => exercise.slug && catalogHasVideo(exercise.videos) && exercise.imageUrl)
    .map((exercise) => {
      const contentUrl = preferredCatalogVideoUrl(exercise.videos)
      if (!contentUrl || !exercise.imageUrl) return null
      return videoUrlEntry({
        path: `/exercises/${exercise.slug}`,
        contentUrl,
        thumbnailUrl: exercise.imageUrl,
        title: `${exercise.name} instructions`,
        description: exercise.description
          ?? `${exercise.name} setup and instruction video from the LIFTAG exercise library.`,
        lastmod: exercise.updatedAt ?? exercise.createdAt,
      })
    })
    .filter((entry): entry is string => Boolean(entry))

  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])
  return sitemapXml(
    entries.join('\n'),
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
  )
})
