import { slovakPluralRule } from '../utils/i18n'
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  pluralRules: { sk: slovakPluralRule },
  missingWarn: import.meta.dev,
  fallbackWarn: import.meta.dev,
}))
