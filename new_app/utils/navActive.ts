/**
 * Route prefixes each page link in the site nav owns. The first prefix is the
 * link's own destination. Only real pages are listed: Lifters, Owners and
 * Trainers are homepage sections, which the URL cannot tell apart, so they are
 * never marked current.
 */
export const NAV_ACTIVE_PREFIXES = {
  exercises: ['/exercises', '/machines', '/muscles'],
  gyms: ['/explore', '/gyms'],
  demo: ['/demo'],
  journal: ['/journal'],
  pricing: ['/pricing'],
} as const satisfies Record<string, readonly [string, ...string[]]>

export type NavCurrent = 'page' | 'location' | undefined

/**
 * The `aria-current` value for a nav link on a locale-stripped path. `page` is
 * reserved for the link's own destination; anything else the link owns is the
 * section the visitor is in, so it reads as `location`. Prefixes match on a
 * segment boundary, so `/exercises` does not claim `/exercises-x`.
 */
export function navCurrent(basePath: string, prefixes: readonly [string, ...string[]]): NavCurrent {
  const path = basePath.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
  if (path === prefixes[0]) return 'page'
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`)) ? 'location' : undefined
}
