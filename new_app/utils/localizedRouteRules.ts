import { isLocalizedSitePath, siteLocalePath } from './siteLocale.ts'
/** Language twins keep the original route's rendering/cache policy. */
export function localizedRouteRules<const T extends Record<string, object>>(rules: T): T {
  const twins: Record<string, object> = {}
  for (const [path, rule] of Object.entries(rules)) {
    if (!path.startsWith('/sk') && isLocalizedSitePath(path)) {
      const copy = { ...rule } as Record<string, unknown>
      if (copy.redirect && typeof copy.redirect === 'object') {
        const redirect = copy.redirect as { to: string; statusCode: number }
        copy.redirect = { ...redirect, to: siteLocalePath(redirect.to, 'sk') }
      }
      twins[siteLocalePath(path, 'sk')] = copy
    }
  }
  return { ...twins, ...rules } as T
}
