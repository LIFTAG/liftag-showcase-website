import { en, sk } from '../../i18n/messages/seoMedia'
import { createMessageTranslator } from '../../utils/messageTranslator'
import { exercisePath } from '../../utils/catalogLocale'
import { catalogHasVideo, preferredCatalogVideoUrl } from '../../utils/catalogVideo'
import { sitemapXml, videoUrlEntry, xmlHeaders } from '../../utils/sitemapXml'

const VIDEO_SITEMAP_NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'

export default defineEventHandler(async (event) => {
  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])

  const localized = await Promise.all((['en', 'sk'] as const).map(async (locale) => {
    const snapshot = await getCatalogSnapshotOrNull(locale)
    if (!snapshot) return []
    const { t } = createMessageTranslator(locale, { en, sk })
    return snapshot.exercises
      .filter(exercise => exercise.slug && catalogHasVideo(exercise.videos) && exercise.imageUrl)
      .flatMap((exercise) => {
        const contentUrl = preferredCatalogVideoUrl(exercise.videos, locale)
        if (!contentUrl || !exercise.imageUrl) return []
        return [videoUrlEntry({
          path: exercisePath(exercise.slug!, locale),
          contentUrl,
          thumbnailUrl: exercise.imageUrl,
          title: t('videoTitle', { name: exercise.name }),
          description: exercise.description ?? t('videoDescription', { name: exercise.name }),
          lastmod: exercise.updatedAt ?? exercise.createdAt,
        })]
      })
  }))
  const entries = localized.flat()

  return sitemapXml(entries.join('\n'), VIDEO_SITEMAP_NS)
})
