import { musclePath, MUSCLE_HUBS } from '../../utils/muscles'
import { SITE_URL } from '../../utils/seoSchema'

function clip(text: string | null, max = 180): string {
  if (!text) return ''
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1).trimEnd()}…`
}

export default defineEventHandler(async (event) => {
  const snapshot = await getCatalogSnapshot()
  const lines: string[] = [
    '# LIFTAG exercise catalog',
    '',
    '> Public exercise and machine library that powers the LIFTAG workout tracker. Each exercise page includes setup cues, muscles worked, machine mappings, and how to log the lift in the app.',
    '',
    `Exercises: ${snapshot.exercises.filter(exercise => exercise.slug).length}`,
    `Machines: ${snapshot.machines.length}`,
    `Muscle hubs: ${MUSCLE_HUBS.length}`,
    '',
    '## Muscle hubs',
    '',
    ...MUSCLE_HUBS.map(hub => `- [${hub.name}](${SITE_URL}${musclePath(hub.slug)}): ${hub.description}`),
    '',
    '## Exercises',
    '',
  ]

  for (const exercise of snapshot.exercises) {
    if (!exercise.slug) continue
    const muscle = exercise.primaryCategory?.name ?? 'Uncategorized'
    const blurb = clip(exercise.description) || `${exercise.name} in the LIFTAG library.`
    lines.push(`- [${exercise.name}](${SITE_URL}/exercises/${exercise.slug}) — ${muscle}. ${blurb}`)
  }

  lines.push('', '## Machines', '')

  for (const machine of snapshot.machines) {
    const path = `/machines/${machine.slug ?? machine.id}`
    const blurb = clip(machine.description) || `${machine.name} in the LIFTAG machine catalog.`
    lines.push(`- [${machine.name}](${SITE_URL}${path}) — ${blurb}`)
  }

  lines.push('')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
  return lines.join('\n')
})
