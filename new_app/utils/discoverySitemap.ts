export interface DiscoverySitemapGym {
  id: string
  equipmentIds: string[]
  trainerIds: string[]
  routineIds: string[]
}

export interface DiscoverySitemapManifest {
  gyms: DiscoverySitemapGym[]
}

export function requireUniqueIds(ids: Array<string | null>, source: string): string[] {
  if (ids.some(id => id === null)) throw new Error(`Discovery ${source} inventory contains invalid IDs`)
  const validIds = ids as string[]
  if (new Set(validIds).size !== validIds.length)
    throw new Error(`Discovery ${source} inventory contains duplicate IDs`)
  return validIds
}

export function assertStablePagination(
  expected: { total: number, lastPage: number },
  current: { total: number, lastPage: number },
  source: string,
): void {
  if (current.total !== expected.total || current.lastPage !== expected.lastPage)
    throw new Error(`Discovery pagination changed while reading ${source}`)
}

/** Canonical English paths; the route expands each one into reciprocal EN/SK entries. */
export function discoverySitemapPaths(manifest: DiscoverySitemapManifest): string[] {
  const paths: string[] = []
  const seen = new Set<string>()
  const add = (path: string) => {
    if (seen.has(path)) return
    seen.add(path)
    paths.push(path)
  }

  for (const gym of manifest.gyms) {
    add(`/gyms/${gym.id}`)
    add(`/gyms/${gym.id}/equipment`)
    for (const machineId of gym.equipmentIds)
      add(`/machines/${machineId}?gym=${gym.id}`)
    for (const trainerId of gym.trainerIds)
      add(`/explore/trainers/${trainerId}`)
    for (const routineId of gym.routineIds)
      add(`/explore/routines/${routineId}`)
  }
  return paths
}
