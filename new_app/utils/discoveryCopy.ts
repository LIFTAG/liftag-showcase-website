import type { DiscoveryLocale } from '../types/discovery.ts'
import { en, sk, type DiscoveryCopy } from '../i18n/messages/discovery.ts'
import { en as metaEn, sk as metaSk } from '../i18n/messages/discoveryMeta.ts'
import { createMessageTranslator } from './messageTranslator.ts'
export { en, sk, type DiscoveryCopy } from '../i18n/messages/discovery.ts'

// These immutable per-language translators also serve pure renderers. They never
// read request cookies or change locale, so cached copy cannot cross languages.
const translators = {
  en: createMessageTranslator('en', { en, sk }),
  sk: createMessageTranslator('sk', { en, sk }),
}
const metadata = {
  en: createMessageTranslator('en', { en: metaEn, sk: metaSk }),
  sk: createMessageTranslator('sk', { en: metaEn, sk: metaSk }),
}
const copy = Object.fromEntries((['en', 'sk'] as const).map(locale => [locale,
  Object.fromEntries(Object.keys(en).map(key => [key, translators[locale].t(key)])),
])) as Record<DiscoveryLocale, DiscoveryCopy>
export const discoveryCopy = (locale: DiscoveryLocale): DiscoveryCopy => copy[locale]

export function discoveryWeekdays(locale: DiscoveryLocale): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, day) => {
    const label = format.format(new Date(Date.UTC(2024, 0, day + 1)))
    return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)
  })
}
export function discoveryLabel(value: string, locale: DiscoveryLocale): string {
  const key = `label_${value}`
  return key in metaEn ? metadata[locale].t(key) : value.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())
}
export function discoveryCount(count: number, kind: 'exercises' | 'machines' | 'units' | 'sets' | 'reviews' | 'experience' | 'copies' | 'rounds', locale: DiscoveryLocale): string {
  return metadata[locale].t(`count_${kind}`, { count, amount: count.toLocaleString(locale) })
}

const decimalFormats = new Map<DiscoveryLocale, Intl.NumberFormat>()
function decimalFormat(locale: DiscoveryLocale): Intl.NumberFormat {
  let format = decimalFormats.get(locale)
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
    decimalFormats.set(locale, format)
  }
  return format
}
export const discoveryRating = (value: number, locale: DiscoveryLocale): string =>
  decimalFormat(locale).format(value)
export const discoveryDistance = (km: number, locale: DiscoveryLocale): string =>
  `${decimalFormat(locale).format(km)} km`
