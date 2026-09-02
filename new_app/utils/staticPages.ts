export interface StaticPageEntry {
  path: string
  lastmod: string
  changefreq: 'weekly' | 'monthly' | 'yearly'
  priority: string
}

/** Marketing and journal URLs that live in git, not the catalog API. */
export const STATIC_PAGES: StaticPageEntry[] = [
  { path: '/', lastmod: '2026-08-19', changefreq: 'weekly', priority: '1.0' },
  { path: '/for-lifters', lastmod: '2026-08-19', changefreq: 'weekly', priority: '0.8' },
  { path: '/for-gyms', lastmod: '2026-08-19', changefreq: 'weekly', priority: '0.8' },
  { path: '/for-trainers', lastmod: '2026-08-19', changefreq: 'weekly', priority: '0.8' },
  { path: '/become-a-coach', lastmod: '2026-08-19', changefreq: 'weekly', priority: '0.8' },
  { path: '/contact/partner', lastmod: '2026-08-14', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact/support', lastmod: '2026-08-14', changefreq: 'monthly', priority: '0.5' },
  { path: '/qr-nfc-gym-tags', lastmod: '2026-08-19', changefreq: 'weekly', priority: '0.8' },
  { path: '/pricing', lastmod: '2026-08-27', changefreq: 'monthly', priority: '0.9' },
  { path: '/best-workout-tracking-app', lastmod: '2026-08-19', changefreq: 'monthly', priority: '0.9' },
  { path: '/best-gym-qr-nfc-app', lastmod: '2026-08-19', changefreq: 'monthly', priority: '0.9' },
  { path: '/alternatives/hevy', lastmod: '2026-08-27', changefreq: 'monthly', priority: '0.8' },
  { path: '/vs/strong', lastmod: '2026-08-27', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal', lastmod: '2026-09-02', changefreq: 'weekly', priority: '0.7' },
  { path: '/journal/how-to-track-workouts', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/journal/best-workout-app-for-powerlifting', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/journal/qr-nfc-gym-tracking', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/journal/best-workout-logger', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal/best-free-workout-tracker', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal/strong-vs-hevy-vs-liftag', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal/workout-logger', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal/nfc-tags-for-gym-equipment', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.8' },
  { path: '/journal/what-is-rpe-lifting', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/journal/progressive-overload', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/journal/gym-nfc-rollout', lastmod: '2026-09-02', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', lastmod: '2026-08-20', changefreq: 'monthly', priority: '0.6' },
  { path: '/press', lastmod: '2026-08-20', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', lastmod: '2026-08-14', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', lastmod: '2026-08-14', changefreq: 'yearly', priority: '0.3' },
]

export const LEGAL_HREFLANG_PAGES = [
  '/privacy-policy',
  '/terms-and-conditions',
] as const
