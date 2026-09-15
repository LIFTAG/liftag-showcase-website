import { en, sk } from '../../i18n/messages/seoMedia'
import { createMessageTranslator } from '../../utils/messageTranslator'
import { siteLocalePath } from '../../utils/siteLocale'
import { imageUrlEntry, sitemapXml, xmlHeaders } from '../../utils/sitemapXml'

export default defineEventHandler(async (event) => {
  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])

  const localized = await Promise.all((['en', 'sk'] as const).map(async (locale) => {
    const snapshot = await getCatalogSnapshotOrNull(locale)
    if (!snapshot) return []
    const { t } = createMessageTranslator(locale, { en, sk })
    return [
    ...snapshot.exercises
      .filter(exercise => exercise.slug && exercise.imageUrl)
      .map(exercise => imageUrlEntry({
        path: siteLocalePath(`/exercises/${exercise.slug}`, locale),
        imageUrl: exercise.imageUrl!,
        title: exercise.name,
        caption: t('exerciseCaption', { name: exercise.name }),
        lastmod: exercise.updatedAt ?? exercise.createdAt,
      })),
    ...snapshot.machines
      .filter(machine => machine.photoUrl)
      .map(machine => imageUrlEntry({
        path: siteLocalePath(`/machines/${machine.slug ?? machine.id}`, locale),
        imageUrl: machine.photoUrl!,
        title: machine.name,
        caption: t('machineCaption', { name: machine.name }),
        lastmod: machine.updatedAt ?? machine.createdAt,
      })),
    ]
  }))
  const entries = localized.flat()

  return sitemapXml(
    entries.join('\n'),
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  )
})
