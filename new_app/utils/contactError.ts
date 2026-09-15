import { en, sk } from '../i18n/messages/contact.ts'
import type { SiteLocale } from '../types/locale.ts'
import { createMessageTranslator } from './messageTranslator.ts'

export type ContactSubmitError =
  | { code: 'verification' | 'invalid' | 'tooMany' | 'unavailable' | 'network' }
  | { code: 'tooManyRetry'; retryAfter: number; retryUnit: 'seconds' | 'minutes' }

/** Both contact forms present the same transport failures and retry instructions. */
export function contactErrorMessage(error: ContactSubmitError | null, locale: SiteLocale): string | null {
  if (!error) return null
  const { t } = createMessageTranslator(locale, { en: en.contact, sk: sk.contact })
  if (error.code === 'tooManyRetry') {
    return t(error.code, { retryAfter: error.retryAfter, unit: t(error.retryUnit, error.retryAfter) })
  }
  return t(error.code)
}
