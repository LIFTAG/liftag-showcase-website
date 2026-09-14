import { en, sk } from '../i18n/messages/seoShared.ts'
import type { SiteLocale } from '../types/locale.ts'
import { createMessageTranslator } from './messageTranslator.ts'
import { APP_ID, ORGANIZATION_ID, WEBSITE_ID, SITE_URL, liftagOrganization } from './seoSchema.ts'
import { siteLocalePath } from './siteLocale.ts'

/** Localize the shared brand entities once per graph; page-specific copy comes from its owning route. */
export function localizedSharedSchema(graph: Record<string, unknown>[], locale: SiteLocale) {
  const { t } = createMessageTranslator(locale, { en, sk })
  const url = `${SITE_URL}${siteLocalePath('/', locale)}`
  return graph.map((node) => {
    switch (node['@id']) {
      case ORGANIZATION_ID:
        return {
          ...node,
          url,
          description: t('organization'),
          knowsAbout: Object.keys(en)
            .filter((key) => key.startsWith('topic'))
            .map((key) => t(key)),
          contactPoint: liftagOrganization.contactPoint.map((point, index) => ({
            ...point,
            contactType: t(index ? 'sales' : 'support'),
            url: `${SITE_URL}${siteLocalePath(index ? '/contact/partner' : '/contact/support', locale)}`,
          })),
        }
      case APP_ID:
        return {
          ...node,
          url,
          description: t('application'),
          featureList: Object.keys(en)
            .filter((key) => key.startsWith('feature'))
            .map((key) => t(key)),
        }
      case WEBSITE_ID:
        return {
          ...node,
          url,
          description: t('website'),
          inLanguage: ['en', 'sk'],
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}${siteLocalePath('/exercises', locale)}?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }
      default:
        return node
    }
  })
}
