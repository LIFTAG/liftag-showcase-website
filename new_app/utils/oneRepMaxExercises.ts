/** Weight conventions are shared by the picker, results, and accessible summaries. */
export const ONE_RM_EXERCISES = [
  { id: 'bench', label: 'Barbell bench press', group: 'Barbell', basis: 'barbell' },
  { id: 'squat', label: 'Barbell back squat', group: 'Barbell', basis: 'barbell' },
  { id: 'deadlift', label: 'Barbell deadlift', group: 'Barbell', basis: 'barbell' },
  { id: 'ohp', label: 'Strict overhead press', group: 'Barbell', basis: 'barbell' },
  { id: 'incline-bench-press', label: 'Incline bench press', group: 'Barbell', basis: 'barbell' },
  { id: 'close-grip-bench-press', label: 'Close grip bench press', group: 'Barbell', basis: 'barbell' },
  { id: 'front-squat', label: 'Front squat', group: 'Barbell', basis: 'barbell' },
  { id: 'sumo-deadlift', label: 'Sumo deadlift', group: 'Barbell', basis: 'barbell' },
  { id: 'romanian-deadlift', label: 'Romanian deadlift', group: 'Barbell', basis: 'barbell' },
  { id: 'hex-bar-deadlift', label: 'Trap bar deadlift', group: 'Barbell', basis: 'barbell' },
  { id: 'hip-thrust', label: 'Hip thrust', group: 'Barbell', basis: 'barbell' },
  { id: 'bent-over-row', label: 'Barbell bent-over row', group: 'Barbell', basis: 'barbell' },
  { id: 'barbell-curl', label: 'Barbell curl', group: 'Barbell', basis: 'barbell' },
  { id: 'skullcrusher', label: 'Barbell skull crusher', group: 'Barbell', basis: 'barbell' },
  { id: 'barbell-calf-raise', label: 'Barbell calf raise', group: 'Barbell', basis: 'barbell' },
  { id: 'barbell-lunge', label: 'Barbell lunge', group: 'Barbell', basis: 'barbell' },
  { id: 'barbell-reverse-lunge', label: 'Barbell reverse lunge', group: 'Barbell', basis: 'barbell' },
  { id: 'barbell-shrug', label: 'Barbell shrug', group: 'Barbell', basis: 'barbell' },
  { id: 'tricep-extension', label: 'Barbell tricep extension', group: 'Barbell', basis: 'barbell' },
  { id: 'box-squat', label: 'Box squat', group: 'Barbell', basis: 'barbell' },
  { id: 'bulgarian-split-squat', label: 'Bulgarian split squat', group: 'Barbell', basis: 'barbell' },
  { id: 'clean', label: 'Clean', group: 'Barbell', basis: 'barbell' },
  { id: 'clean-and-jerk', label: 'Clean and jerk', group: 'Barbell', basis: 'barbell' },
  { id: 'clean-and-press', label: 'Clean and press', group: 'Barbell', basis: 'barbell' },
  { id: 'decline-bench-press', label: 'Decline bench press', group: 'Barbell', basis: 'barbell' },
  { id: 'ez-bar-curl', label: 'EZ-bar curl', group: 'Barbell', basis: 'barbell' },
  { id: 'floor-press', label: 'Floor press', group: 'Barbell', basis: 'barbell' },
  { id: 'good-morning', label: 'Good morning', group: 'Barbell', basis: 'barbell' },
  { id: 'hang-clean', label: 'Hang clean', group: 'Barbell', basis: 'barbell' },
  { id: 'military-press', label: 'Military press', group: 'Barbell', basis: 'barbell' },
  { id: 'pendlay-row', label: 'Pendlay row', group: 'Barbell', basis: 'barbell' },
  { id: 'power-clean', label: 'Power clean', group: 'Barbell', basis: 'barbell' },
  { id: 'power-snatch', label: 'Power snatch', group: 'Barbell', basis: 'barbell' },
  { id: 'preacher-curl', label: 'Preacher curl', group: 'Barbell', basis: 'barbell' },
  { id: 'push-press', label: 'Push press', group: 'Barbell', basis: 'barbell' },
  { id: 'rack-pull', label: 'Rack pull', group: 'Barbell', basis: 'barbell' },
  { id: 'reverse-barbell-curl', label: 'Reverse barbell curl', group: 'Barbell', basis: 'barbell' },
  { id: 'seated-shoulder-press', label: 'Seated shoulder press', group: 'Barbell', basis: 'barbell' },
  { id: 'snatch', label: 'Snatch', group: 'Barbell', basis: 'barbell' },
  { id: 'stiff-leg-deadlift', label: 'Stiff-leg deadlift', group: 'Barbell', basis: 'barbell' },
  { id: 't-bar-row', label: 'T-bar row', group: 'Barbell', basis: 'barbell' },
  { id: 'upright-row', label: 'Upright row', group: 'Barbell', basis: 'barbell' },
  { id: 'zercher-squat', label: 'Zercher squat', group: 'Barbell', basis: 'barbell' },
  { id: 'dumbbell-bench-press', label: 'Dumbbell bench press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'incline-dumbbell-bench-press', label: 'Incline dumbbell bench press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-shoulder-press', label: 'Dumbbell shoulder press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-row', label: 'Dumbbell row', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-curl', label: 'Dumbbell curl', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'hammer-curl', label: 'Hammer curl', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-lateral-raise', label: 'Dumbbell lateral raise', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-fly', label: 'Dumbbell fly', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'goblet-squat', label: 'Goblet squat', group: 'Dumbbell', basis: 'single' },
  { id: 'arnold-press', label: 'Arnold press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'chest-supported-dumbbell-row', label: 'Chest-supported dumbbell row', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-concentration-curl', label: 'Concentration curl', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'decline-dumbbell-bench-press', label: 'Decline dumbbell bench press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-bulgarian-split-squat', label: 'Dumbbell Bulgarian split squat', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-deadlift', label: 'Dumbbell deadlift', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-floor-press', label: 'Dumbbell floor press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-front-raise', label: 'Dumbbell front raise', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-lunge', label: 'Dumbbell lunge', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-pullover', label: 'Dumbbell pullover', group: 'Dumbbell', basis: 'single' },
  { id: 'dumbbell-reverse-fly', label: 'Dumbbell reverse fly', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-romanian-deadlift', label: 'Dumbbell Romanian deadlift', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-shrug', label: 'Dumbbell shrug', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-squat', label: 'Dumbbell squat', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-tricep-extension', label: 'Dumbbell tricep extension', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'dumbbell-tricep-kickback', label: 'Dumbbell tricep kickback', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'incline-dumbbell-curl', label: 'Incline dumbbell curl', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'incline-dumbbell-fly', label: 'Incline dumbbell fly', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'seated-dumbbell-shoulder-press', label: 'Seated dumbbell shoulder press', group: 'Dumbbell', basis: 'dumbbell' },
  { id: 'lat-pulldown', label: 'Lat pulldown', group: 'Cable', basis: 'machine' },
  { id: 'seated-cable-row', label: 'Seated cable row', group: 'Cable', basis: 'machine' },
  { id: 'tricep-pushdown', label: 'Tricep pushdown', group: 'Cable', basis: 'machine' },
  { id: 'cable-bicep-curl', label: 'Cable bicep curl', group: 'Cable', basis: 'machine' },
  { id: 'cable-crunch', label: 'Cable crunch', group: 'Cable', basis: 'machine' },
  { id: 'cable-fly', label: 'Cable fly', group: 'Cable', basis: 'machine' },
  { id: 'cable-lateral-raise', label: 'Cable lateral raise', group: 'Cable', basis: 'machine' },
  { id: 'cable-overhead-tricep-extension', label: 'Cable overhead tricep extension', group: 'Cable', basis: 'machine' },
  { id: 'cable-pull-through', label: 'Cable pull-through', group: 'Cable', basis: 'machine' },
  { id: 'cable-reverse-fly', label: 'Cable reverse fly', group: 'Cable', basis: 'machine' },
  { id: 'close-grip-lat-pulldown', label: 'Close-grip lat pulldown', group: 'Cable', basis: 'machine' },
  { id: 'face-pull', label: 'Face pull', group: 'Cable', basis: 'machine' },
  { id: 'reverse-grip-lat-pulldown', label: 'Reverse-grip lat pulldown', group: 'Cable', basis: 'machine' },
  { id: 'straight-arm-pulldown', label: 'Straight-arm pulldown', group: 'Cable', basis: 'machine' },
  { id: 'tricep-rope-pushdown', label: 'Tricep rope pushdown', group: 'Cable', basis: 'machine' },
  { id: 'sled-leg-press', label: 'Sled leg press', group: 'Machine', basis: 'machine' },
  { id: 'leg-extension', label: 'Leg extension', group: 'Machine', basis: 'machine' },
  { id: 'seated-leg-curl', label: 'Seated leg curl', group: 'Machine', basis: 'machine' },
  { id: 'chest-press', label: 'Machine chest press', group: 'Machine', basis: 'machine' },
  { id: 'hack-squat', label: 'Hack squat', group: 'Machine', basis: 'machine' },
  { id: 'hip-abduction', label: 'Hip abduction', group: 'Machine', basis: 'machine' },
  { id: 'hip-adduction', label: 'Hip adduction', group: 'Machine', basis: 'machine' },
  { id: 'horizontal-leg-press', label: 'Horizontal leg press', group: 'Machine', basis: 'machine' },
  { id: 'lying-leg-curl', label: 'Lying leg curl', group: 'Machine', basis: 'machine' },
  { id: 'machine-bicep-curl', label: 'Machine bicep curl', group: 'Machine', basis: 'machine' },
  { id: 'machine-calf-raise', label: 'Machine calf raise', group: 'Machine', basis: 'machine' },
  { id: 'machine-chest-fly', label: 'Machine chest fly', group: 'Machine', basis: 'machine' },
  { id: 'machine-lateral-raise', label: 'Machine lateral raise', group: 'Machine', basis: 'machine' },
  { id: 'machine-reverse-fly', label: 'Machine reverse fly', group: 'Machine', basis: 'machine' },
  { id: 'machine-row', label: 'Machine row', group: 'Machine', basis: 'machine' },
  { id: 'machine-shoulder-press', label: 'Machine shoulder press', group: 'Machine', basis: 'machine' },
  { id: 'seated-calf-raise', label: 'Seated calf raise', group: 'Machine', basis: 'machine' },
  { id: 'seated-dip-machine', label: 'Seated dip machine', group: 'Machine', basis: 'machine' },
  { id: 'smith-machine-bench-press', label: 'Smith machine bench press', group: 'Machine', basis: 'machine' },
  { id: 'smith-machine-squat', label: 'Smith machine squat', group: 'Machine', basis: 'machine' },
  { id: 'vertical-leg-press', label: 'Vertical leg press', group: 'Machine', basis: 'machine' },
  { id: 'pull-ups', label: 'Pull-ups', group: 'Bodyweight · estimate only', basis: 'bodyweight' },
  { id: 'chin-ups', label: 'Chin-ups', group: 'Bodyweight · estimate only', basis: 'bodyweight' },
  { id: 'dips', label: 'Dips', group: 'Bodyweight · estimate only', basis: 'bodyweight' },
  { id: 'other', label: 'Other exercise · estimate only', group: 'Other', basis: 'other' },
] as const

export type OneRmExercise = typeof ONE_RM_EXERCISES[number]
export type OneRmExerciseId = OneRmExercise['id']
export const FEATURED_EXERCISES = [
  { id: 'bench', short: 'Bench' },
  { id: 'squat', short: 'Squat' },
  { id: 'deadlift', short: 'Deadlift' },
  { id: 'ohp', short: 'Overhead press' },
] as const satisfies ReadonlyArray<{ id: OneRmExerciseId, short: string }>

const TOKEN_ALIASES: Record<string, string> = {
  rdl: 'romanian',
  sldl: 'stiff',
  ohp: 'overhead',
  bp: 'bench',
  dl: 'deadlift',
  db: 'dumbbell',
  dumbell: 'dumbbell',
  bb: 'barbell',
  bss: 'bulgarian',
  cgbp: 'close grip',
  tbar: 't bar',
  trapbar: 'trap',
  hex: 'trap',
  skulls: 'skull',
  deads: 'deadlift',
  mil: 'military',
}

function fold(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function unique(values: string[]) {
  return [...new Set(values)]
}

/** Light gym-search stemming: RDLs → RDL, rows → row, presses → press. */
function formsOf(token: string) {
  const forms = [token]
  if (token.length < 4) return forms
  if (token.endsWith('s') && !token.endsWith('ss')) forms.push(token.slice(0, -1))
  if (token.endsWith('es') && token.length >= 5) forms.push(token.slice(0, -2))
  if (token.endsWith('ies') && token.length >= 5) forms.push(`${token.slice(0, -3)}y`)
  return unique(forms)
}

function resolveAlias(token: string) {
  for (const form of formsOf(token)) {
    if (TOKEN_ALIASES[form]) return TOKEN_ALIASES[form]
  }
  return token
}

function expandQuery(query: string) {
  return fold(query)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(token => fold(resolveAlias(token)).split(/\s+/))
    .filter(Boolean)
    .join(' ')
}

function acronymOf(value: string) {
  const words = value.split(/\s+/).filter(Boolean)
  const skipped = words.filter(word => word.length > 2)
  const full = words.map(word => word[0]).join('')
  const short = skipped.map(word => word[0]).join('')
  return unique([full, short].filter(token => token.length >= 2))
}

function compactOf(value: string) {
  const compact = value.replace(/\s+/g, '')
  return compact.length >= 4 ? compact : ''
}

type IndexedExercise = {
  exercise: OneRmExercise
  label: string
  id: string
  words: string[]
  keys: string[]
}

function matchesExpansion(keys: string[], expansion: string) {
  return fold(expansion).split(/\s+/).filter(Boolean).every(token => keys.includes(token))
}

const SEARCH_INDEX: IndexedExercise[] = ONE_RM_EXERCISES.map((exercise) => {
  const label = fold(exercise.label)
  const id = fold(exercise.id)
  const group = fold(exercise.group)
  const words = `${label} ${id} ${group}`.split(/\s+/).filter(Boolean)
  const keys = unique([
    ...words,
    ...acronymOf(label),
    compactOf(label),
    compactOf(id),
  ].filter(Boolean))
  return { exercise, label, id, words, keys }
})

for (const [alias, expansion] of Object.entries(TOKEN_ALIASES)) {
  for (const row of SEARCH_INDEX) {
    if (matchesExpansion(row.keys, expansion) && !row.keys.includes(alias)) row.keys.push(alias)
  }
}

function hitRank(key: string, token: string, allowContains: boolean): number {
  for (const form of formsOf(token)) {
    if (key === form || formsOf(key).includes(form)) return 80
    if (key.startsWith(form)) return 50
  }
  if (allowContains && token.length >= 2 && key.includes(token)) return 20
  return 0
}

function bestTokenHit(row: IndexedExercise, token: string) {
  let best = 0
  for (const key of row.keys) best = Math.max(best, hitRank(key, token, false))
  if (best) return best
  for (const word of row.words) best = Math.max(best, hitRank(word, token, true))
  return best
}

function scoreExercise(row: IndexedExercise, needle: string, tokens: string[], raw: string) {
  const { exercise, label, id, words } = row
  const rawFolded = fold(raw)

  if (exercise.id === raw || id === rawFolded) return 1200
  if (label === needle) return 1100
  if (label.startsWith(needle)) return 900
  if (id.startsWith(needle) || (rawFolded.length >= 2 && id.startsWith(rawFolded))) return 850

  let tokenScore = 0
  for (const token of tokens) {
    const hit = bestTokenHit(row, token)
    if (!hit) return 0
    tokenScore += hit
  }
  if (label.includes(needle)) tokenScore += 40
  tokenScore -= Math.max(0, words.length - tokens.length) * 3
  return tokenScore
}

/** Ranked matches for the strength-comparison picker. Empty query returns no rows; the picker shows featured lifts instead. */
export function searchExercises(query: string): OneRmExercise[] {
  const raw = query.trim()
  const needle = expandQuery(raw)
  if (!needle) return []
  const tokens = needle.split(/\s+/).filter(Boolean)
  return SEARCH_INDEX
    .map(row => ({ exercise: row.exercise, score: scoreExercise(row, needle, tokens, raw) }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score || a.exercise.label.length - b.exercise.label.length)
    .map(row => row.exercise)
}

export function exerciseFor(lift: OneRmExerciseId) {
  return ONE_RM_EXERCISES.find(exercise => exercise.id === lift)!
}

export function loadQualifier(lift: OneRmExerciseId): string {
  const basis = exerciseFor(lift).basis
  if (basis === 'dumbbell') return 'per dumbbell'
  if (basis === 'bodyweight') return 'total load, including bodyweight'
  return ''
}

export function exerciseHint(lift: OneRmExerciseId): string {
  switch (exerciseFor(lift).basis) {
    case 'barbell': return 'Include the bar. Use clean reps close to failure.'
    case 'dumbbell': return 'Enter one dumbbell’s weight, including its handle.'
    case 'single': return 'Enter the weight of the single dumbbell or kettlebell.'
    case 'machine': return 'Use the machine’s indicated load. Equipment varies.'
    case 'bodyweight': return 'Enter bodyweight + added weight. Unassisted reps only.'
    default: return 'Use clean reps close to failure. Estimate only.'
  }
}
