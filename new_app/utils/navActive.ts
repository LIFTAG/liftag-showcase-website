/**
 * Route prefixes each page link in the site nav owns. Only real pages are
 * listed: Lifters, Owners and Trainers are homepage sections, which the URL
 * cannot tell apart, so they are never marked active.
 */
export const NAV_ACTIVE_PREFIXES = {
  exercises: ['/exercises', '/machines', '/muscles'],
  gyms: ['/explore', '/gyms'],
  demo: ['/demo'],
  journal: ['/journal'],
  pricing: ['/pricing'],
} as const satisfies Record<string, readonly string[]>

/**
 * True when a locale-stripped path is one of the prefixes or sits below one.
 * Matches on a segment boundary, so `/exercises` does not claim `/exercises-x`.
 */
export function isNavPathActive(basePath: string, prefixes: readonly string[]): boolean {
  const path = basePath.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}
