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
export const PRICING_CHECKED_LABEL = '27 August 2026'
export const PRICING_UPDATED_EYEBROW = 'UPDATED AUG 2026'

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
  freeTier: 'Core tracking: set logging, rest timer, PRs, estimated 1RM, history, exercise library, gym and trainer discovery.',
  paidTier: 'Premium intelligence, optional',
  paidPrice: null,
  caveat: 'Both store listings show LIFTAG as free with no in-app purchases, so there is no paid tier to price yet. When one ships, the number lands on this page with the date it was set.',
  sourceLabel: 'LIFTAG on the App Store',
  sourceUrl: LIFTAG_APP_STORE_URL,
}

export const strongPricing: AppPricing = {
  name: 'Strong',
  platforms: 'iOS and Android',
  freeTier: 'Unlimited saved workouts, capped at 3 custom routines.',
  paidTier: 'Strong PRO',
  paidPrice: '$4.99 / month or $29.99 / year',
  caveat: 'Those are the two figures Strong markets in its US App Store description. The in-app purchase list on the same page also shows a $99.99 "Strong PRO Forever" and several other price points, and Strong states the prices are for US customers and vary by account. Treat the store, not this table, as final.',
  sourceLabel: 'Strong on the US App Store',
  sourceUrl: 'https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577',
}

export const hevyPricing: AppPricing = {
  name: 'Hevy',
  platforms: 'iOS and Android',
  freeTier: 'Free logging with a cap on saved routines, custom exercises, and graph history.',
  paidTier: 'Hevy Pro',
  paidPrice: '$2.99 / month, $23.99 / year, or $74.99 lifetime',
  caveat: 'Read off the in-app purchase list on Hevy\'s US App Store page, which also carries a second $3.99 monthly SKU. Hevy Pro is what removes the routine, custom-exercise, and graph-history caps, per Hevy\'s own listing text.',
  sourceLabel: 'Hevy on the US App Store',
  sourceUrl: 'https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350',
}

/** Rendered price cell for a comparison table row. */
export function priceCell(app: AppPricing): string {
  return app.paidPrice ?? 'No paid tier published'
}
