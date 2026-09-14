import { en, sk } from '../../i18n/messages/gymFaqs.ts'
import { createMessageTranslator } from '../messageTranslator.ts'
import type { SiteLocale } from '../../types/locale.ts'

const topics = ['free', 'hardware', 'equipment', 'videos', 'app', 'locations'] as const
export function gymFaqsForLocale(locale: SiteLocale) {
  const { t } = createMessageTranslator(locale, { en, sk })
  return topics.map((topic) => ({ question: t(`${topic}Question`), answer: t(`${topic}Answer`) }))
}
