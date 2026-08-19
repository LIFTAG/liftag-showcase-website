import { catalogHasVideo } from '../../utils/catalogVideo'
import { sitemapIndexXml, xmlHeaders } from '../../utils/sitemapXml'

export default defineEventHandler(async (event) => {
  const snapshot = await getCatalogSnapshot()
  const hasVideos = snapshot.exercises.some(exercise => catalogHasVideo(exercise.videos))

  const sitemaps = [
    { path: '/sitemap-pages.xml', lastmod: snapshot.fetchedAt },
    { path: '/sitemap-catalog.xml', lastmod: snapshot.fetchedAt },
    { path: '/sitemap-images.xml', lastmod: snapshot.fetchedAt },
  ]
  if (hasVideos) {
    sitemaps.push({ path: '/sitemap-videos.xml', lastmod: snapshot.fetchedAt })
  }

  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])
  return sitemapIndexXml(sitemaps)
})
