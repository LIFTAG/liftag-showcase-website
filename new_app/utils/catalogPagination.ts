/** Reject empty/invalid page variants instead of serving unlimited duplicate URLs. */
export function catalogPageNumber(value: unknown): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) ? page : null
}

export function catalogPagePath(path: string, page: number, filters: Record<string, string> = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== 'page') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

/** A page can cross from primary to secondary muscle matches without losing rows. */
export function catalogPageGroups<T>(primary: readonly T[], secondary: readonly T[], offset: number, limit: number) {
  const visiblePrimary = primary.slice(offset, offset + limit)
  const secondaryOffset = Math.max(0, offset - primary.length)
  const visibleSecondary = secondary.slice(secondaryOffset, secondaryOffset + limit - visiblePrimary.length)
  return { visiblePrimary, visibleSecondary, showSplit: visibleSecondary.length > 0 }
}
