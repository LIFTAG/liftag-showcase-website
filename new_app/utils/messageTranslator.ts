import { createI18n } from 'vue-i18n'
import type { SiteLocale } from '../types/locale.ts'
import { slovakPluralRule } from './i18n.ts'

/** Vue I18n for pure/server renderers. Each caller explicitly supplies its language and feature messages. */
export function createMessageTranslator<T extends Record<string, string>>(
  locale: SiteLocale,
  messages: { en: T; sk: { [K in keyof T]: string } },
) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    pluralRules: { sk: slovakPluralRule },
    messages,
  }).global
}
