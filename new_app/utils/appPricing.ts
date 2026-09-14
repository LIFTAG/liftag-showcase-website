import type { SiteLocale } from '../types/locale.ts'
import { createMessageTranslator } from './messageTranslator.ts'
import { en, sk } from '../i18n/messages/appPricing.ts'

/** Numeric source values stay shared across translated price descriptions. */
const publishedPrices = {
  Hevy: { month: 2.99, year: 23.99, lifetime: 74.99 },
  Strong: { month: 4.99, year: 29.99 },
}
function publishedPrice(name: keyof typeof publishedPrices, locale: SiteLocale): string {
  const { t } = createMessageTranslator(locale, { en, sk })
  const format = new Intl.NumberFormat(locale === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: locale === 'sk' ? 'code' : 'symbol',
  })
  const values = Object.fromEntries(
    Object.entries(publishedPrices[name]).map(([period, amount]) => [period, format.format(amount)]),
  )
  return t(name === 'Hevy' ? 'hevyPrice' : 'strongPrice', values)
}

/**
 * Every competitor price quoted on this site comes from here.
 *
 * Rules that keep these numbers safe to publish:
 * - Figures are read off the vendor's own store listing, never off an
 *   aggregator or a review site.
 * - `PRICING_CHECKED_ON` is the day the listings were actually opened. Move it
 *   only when the listings are re-read, so a stale date can never claim to be
 *   fresh.
 * - If a listing stops publishing a number, delete the number and keep the
 *   qualitative wording. Carrying a stale price forward is worse than saying
 *   "paid tier".
 */
export const PRICING_CHECKED_ON = '2026-08-27'

export const LIFTAG_APP_STORE_URL = 'https://apps.apple.com/app/id6761140080'
export const LIFTAG_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.liftag.app'

export interface AppPricing {
  /** Product name as the vendor writes it. */
  name: string
  platforms: string
  /** What you get without paying. */
  freeTier: string
  /** Name of the paid tier, or how we describe its absence. */
  paidTier: string
  /** Dated price, or null when there is no published figure to quote. */
  paidPrice: string | null
  /** Caveat that belongs next to the price. */
  caveat: string
  sourceLabel: string
  sourceUrl: string
}

export const liftagPricing: AppPricing = {
  name: 'LIFTAG',
  platforms: 'iOS and Android',
  freeTier:
    'Core tracking: set logging, rest timer, PRs, estimated 1RM, history, exercise library, gym and trainer discovery.',
  paidTier: 'Premium intelligence, optional',
  paidPrice: null,
  caveat: en.liftagCaveat,
  sourceLabel: en.liftagSource,
  sourceUrl: LIFTAG_APP_STORE_URL,
}

export const strongPricing: AppPricing = {
  name: 'Strong',
  platforms: 'iOS and Android',
  freeTier: 'Unlimited saved workouts, capped at 3 custom routines.',
  paidTier: 'Strong PRO',
  paidPrice: publishedPrice('Strong', 'en'),
  caveat: en.strongCaveat,
  sourceLabel: en.strongSource,
  sourceUrl: 'https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577',
}

export const hevyPricing: AppPricing = {
  name: 'Hevy',
  platforms: 'iOS and Android',
  freeTier: 'Free logging with a cap on saved routines, custom exercises, and graph history.',
  paidTier: 'Hevy Pro',
  paidPrice: publishedPrice('Hevy', 'en'),
  caveat: en.hevyCaveat,
  sourceLabel: en.hevySource,
  sourceUrl: 'https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350',
}

/** Rendered price cell for a comparison table row. */
export function priceCell(app: AppPricing, locale: SiteLocale = 'en'): string {
  if (app.name === 'Hevy' || app.name === 'Strong') return publishedPrice(app.name, locale)
  return app.paidPrice ?? createMessageTranslator(locale, { en, sk }).t('noPaid')
}

export function localizedAppPricing(app: AppPricing, locale: SiteLocale): AppPricing {
  const key = ({ Hevy: 'hevy', Strong: 'strong', LIFTAG: 'liftag' } as Record<string, string>)[app.name]
  if (!key) return app
  const { t } = createMessageTranslator(locale, { en, sk })
  return {
    ...app,
    paidPrice: app.paidPrice === null ? null : priceCell(app, locale),
    caveat: t(`${key}Caveat`),
    sourceLabel: t(`${key}Source`),
  }
}
