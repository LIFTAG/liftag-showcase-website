import { musclePath, MUSCLE_HUBS } from '../../utils/muscles'
import { SITE_URL } from '../../utils/seoSchema'

function clip(text: string | null, max = 180): string {
  if (!text) return ''
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1).trimEnd()}…`
}

function markdownLinkLabel(text: string): string {
  return text.replace(/([\\[\]])/g, '\\$1')
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  const snapshot = await getCatalogSnapshotOrNull()
  setHeader(
    event,
    'cache-control',
    snapshot
      ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
      : 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
  )
  const lines: string[] = [
    '# LIFTAG exercise catalog',
    '',
    '> Public exercise and machine library that powers the LIFTAG workout tracker. Each exercise page includes setup cues, muscles worked, machine mappings, and how to log the lift in the app.',
    '',
    `[Exercise library](${SITE_URL}/exercises)`,
    `[Machine catalog](${SITE_URL}/machines)`,
    `[Exercises by muscle](${SITE_URL}/muscles)`,
    '',
    `Exercises: ${snapshot ? snapshot.exercises.filter(exercise => exercise.slug).length : 'temporarily unavailable'}`,
    `Machines: ${snapshot ? snapshot.machines.length : 'temporarily unavailable'}`,
    `Muscle hubs: ${MUSCLE_HUBS.length}`,
    '',
    '## Muscle hubs',
    '',
    ...MUSCLE_HUBS.map(hub => `- [${markdownLinkLabel(hub.name)}](${SITE_URL}${musclePath(hub.slug)}): ${hub.description}`),
    '',
    '## Exercises',
    '',
  ]

  if (!snapshot) {
    lines.push('Live exercise and machine inventory is temporarily unavailable. Use the stable library links above and retry this resource later.', '')
  }

  for (const exercise of snapshot?.exercises ?? []) {
    if (!exercise.slug) continue
    const muscle = exercise.primaryCategory?.name ?? 'Uncategorized'
    const blurb = clip(exercise.description) || `${exercise.name} in the LIFTAG library.`
    lines.push(`- [${markdownLinkLabel(exercise.name)}](${SITE_URL}/exercises/${exercise.slug}) — ${muscle}. ${blurb}`)
  }

  lines.push('', '## Machines', '')

  for (const machine of snapshot?.machines ?? []) {
    const path = `/machines/${machine.slug ?? machine.id}`
    const blurb = clip(machine.description) || `${machine.name} in the LIFTAG machine catalog.`
    lines.push(`- [${markdownLinkLabel(machine.name)}](${SITE_URL}${path}) — ${blurb}`)
  }

  lines.push('')
  return lines.join('\n')
})
