import { ONE_RM_EXERCISES, type OneRmExerciseId } from './oneRepMaxExercises.ts'
export type LiftId = OneRmExerciseId

/** One-rep-max estimates. Internal math is always kilograms. */

export type WeightUnit = 'kg' | 'lb'
export type FormulaId = 'epley' | 'brzycki' | 'lombardi' | 'mayhew' | 'oconnor' | 'wathen' | 'lander'
export type Confidence = 'measured' | 'high' | 'good' | 'usable' | 'rough' | 'endurance'

/** International avoirdupois pound. Never round-trip through a shorter constant. */
export const KG_IN_LB = 0.45359237
export const LB_IN_KG = 1 / KG_IN_LB

export const MIN_REPS = 1
export const MAX_REPS = 30
export const MAX_WEIGHT_KG = 1000

export const WORKED_EXAMPLE = { weightKg: 100, reps: 5 } as const

export interface FormulaDef {
  id: FormulaId
  name: string
  year: number
  /** Plaintext, for humans and agents. `w` = load, `r` = reps. */
  equation: string
  estimate: (weight: number, reps: number) => number | null
  invert: (oneRm: number, reps: number) => number | null
}

function identityAtOne(weight: number, reps: number, estimate: number | null): number | null {
  if (reps === 1) return weight
  return estimate
}

export const FORMULAS: readonly FormulaDef[] = [
  {
    id: 'epley',
    name: 'Epley',
    year: 1985,
    equation: '1RM = w × (1 + r / 30)',
    estimate: (w, r) => identityAtOne(w, r, w * (1 + r / 30)),
    invert: (oneRm, r) => (r === 1 ? oneRm : oneRm / (1 + r / 30)),
  },
  {
    id: 'brzycki',
    name: 'Brzycki',
    year: 1993,
    equation: '1RM = w × 36 / (37 − r)',
    estimate: (w, r) => {
      if (r === 1) return w
      if (r >= 37) return null
      return w * 36 / (37 - r)
    },
    invert: (oneRm, r) => {
      if (r === 1) return oneRm
      if (r >= 37) return null
      return oneRm * (37 - r) / 36
    },
  },
  {
    id: 'lombardi',
    name: 'Lombardi',
    year: 1989,
    equation: '1RM = w × r^0.10',
    estimate: (w, r) => identityAtOne(w, r, w * r ** 0.10),
    invert: (oneRm, r) => (r === 1 ? oneRm : oneRm / r ** 0.10),
  },
  {
    id: 'mayhew',
    name: 'Mayhew',
    year: 1992,
    equation: '1RM = 100w / (52.2 + 41.9 e^(−0.055r))',
    estimate: (w, r) => identityAtOne(w, r, 100 * w / (52.2 + 41.9 * Math.exp(-0.055 * r))),
    invert: (oneRm, r) => {
      if (r === 1) return oneRm
      return oneRm * (52.2 + 41.9 * Math.exp(-0.055 * r)) / 100
    },
  },
  {
    id: 'oconnor',
    name: "O'Connor",
    year: 1989,
    equation: '1RM = w × (1 + r / 40)',
    estimate: (w, r) => identityAtOne(w, r, w * (1 + 0.025 * r)),
    invert: (oneRm, r) => (r === 1 ? oneRm : oneRm / (1 + 0.025 * r)),
  },
  {
    id: 'wathen',
    name: 'Wathen',
    year: 1994,
    equation: '1RM = 100w / (48.8 + 53.8 e^(−0.075r))',
    estimate: (w, r) => identityAtOne(w, r, 100 * w / (48.8 + 53.8 * Math.exp(-0.075 * r))),
    invert: (oneRm, r) => {
      if (r === 1) return oneRm
      return oneRm * (48.8 + 53.8 * Math.exp(-0.075 * r)) / 100
    },
  },
  {
    id: 'lander',
    name: 'Lander',
    year: 1985,
    equation: '1RM = 100w / (101.3 − 2.67123r)',
    estimate: (w, r) => {
      if (r === 1) return w
      const denom = 101.3 - 2.67123 * r
      if (denom <= 0) return null
      return 100 * w / denom
    },
    invert: (oneRm, r) => {
      if (r === 1) return oneRm
      const denom = 101.3 - 2.67123 * r
      if (denom <= 0) return null
      return oneRm * denom / 100
    },
  },
]

export const DEFAULT_FORMULA_ID: FormulaId = 'epley'

export const LIFTS = ONE_RM_EXERCISES

export function formulaById(id: FormulaId): FormulaDef {
  const found = FORMULAS.find(item => item.id === id)
  if (!found) throw new Error(`Unknown 1RM formula: ${id}`)
  return found
}

export function kgToLb(kg: number): number {
  return kg * LB_IN_KG
}

export function lbToKg(lb: number): number {
  return lb * KG_IN_LB
}

export function toKg(weight: number, unit: WeightUnit): number {
  return unit === 'kg' ? weight : lbToKg(weight)
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg)
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment
}

export function loadIncrement(unit: WeightUnit): number {
  return unit === 'kg' ? 2.5 : 5
}

/** Display one decimal in either unit, dropping a trailing .0. */
export function formatLoad(kg: number, unit: WeightUnit): string {
  const rounded = Math.round(fromKg(kg, unit) * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatLoadWithUnit(kg: number, unit: WeightUnit): string {
  return `${formatLoad(kg, unit)} ${unit}`
}

/** Keep typed input readable: 100 stays "100", 62.5 stays "62.5". */
export function formatInputWeight(value: number, unit: WeightUnit = 'kg'): string {
  const places = unit === 'lb' ? 1 : 3
  const rounded = Math.round(value * 10 ** places) / 10 ** places
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded)
}

export interface ParseResult {
  value: number | null
  detectedUnit: WeightUnit | null
  error: string | null
}

const UNIT_TOKEN_RE = /(kgs?|kilos?|kilograms?|lbs?|pounds?)/i

export function parseWeightInput(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { value: null, detectedUnit: null, error: null }

  let detectedUnit: WeightUnit | null = null
  const unitMatch = trimmed.match(UNIT_TOKEN_RE)
  if (unitMatch) {
    const token = unitMatch[1]!.toLowerCase()
    detectedUnit = token.startsWith('k') ? 'kg' : 'lb'
  }

  const numeric = trimmed
    .replace(UNIT_TOKEN_RE, '')
    .replace(/\s+/g, '')
    .replace(',', '.')

  if (!numeric) return { value: null, detectedUnit, error: 'Need a weight and the reps you actually did.' }
  if (/[eE]/.test(numeric)) return { value: null, detectedUnit, error: 'Enter a gym load, not scientific notation.' }
  if (!/^\d+(\.\d+)?$/.test(numeric)) return { value: null, detectedUnit, error: 'Weight has to be a number.' }

  const value = Number(numeric)
  if (!Number.isFinite(value) || value <= 0) return { value: null, detectedUnit, error: 'Weight has to be greater than 0.' }
  return { value, detectedUnit, error: null }
}

/** Parse a typed load into kilograms, honoring a unit token in the text when present. */
export function weightToKg(raw: string, unit: WeightUnit): number | null {
  const parsed = parseWeightInput(raw)
  if (parsed.value == null) return null
  return toKg(parsed.value, parsed.detectedUnit ?? unit)
}

/**
 * Relabel a stored kilogram load for the weight field.
 * Always convert from the frozen kilograms — never from a previously rounded display.
 */
export function relabelWeightInput(kg: number, unit: WeightUnit): string {
  return formatInputWeight(fromKg(kg, unit), unit)
}

export function parseRepsInput(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { value: null, detectedUnit: null, error: null }
  if (!/^\d+$/.test(trimmed)) return { value: null, detectedUnit: null, error: `Reps: ${MIN_REPS}–${MAX_REPS}, whole numbers.` }
  const value = Number(trimmed)
  if (value < MIN_REPS || value > MAX_REPS) {
    return { value: null, detectedUnit: null, error: `Reps: ${MIN_REPS}–${MAX_REPS}.` }
  }
  return { value, detectedUnit: null, error: null }
}

export function confidenceForReps(reps: number): Confidence {
  if (reps === 1) return 'measured'
  if (reps <= 5) return 'high'
  if (reps <= 8) return 'good'
  if (reps <= 10) return 'usable'
  if (reps <= 15) return 'rough'
  return 'endurance'
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  measured: 'Measured',
  high: 'High confidence',
  good: 'Good',
  usable: 'Usable',
  rough: 'Rough',
  endurance: 'Endurance set',
}

export const CONFIDENCE_NOTE: Record<Confidence, string> = {
  measured: 'You already lifted this. That is the max, not a projection.',
  high: 'Closest on a hard set of 2–5 clean reps.',
  good: 'Fine for programming from this week.',
  usable: 'Usable. Retest heavier if this is for singles.',
  rough: 'Above 10 reps this number is a guess. Do a heavier set of 5 or fewer.',
  endurance: 'That is a conditioning set. Hit something you can only do 5 times.',
}

export interface FormulaEstimate {
  id: FormulaId
  name: string
  year: number
  equation: string
  kg: number | null
}

export function estimateAll(weightKg: number, reps: number): FormulaEstimate[] {
  return FORMULAS.map(formula => ({
    id: formula.id,
    name: formula.name,
    year: formula.year,
    equation: formula.equation,
    kg: formula.estimate(weightKg, reps),
  }))
}

export function estimateOne(weightKg: number, reps: number, formulaId: FormulaId): number | null {
  return formulaById(formulaId).estimate(weightKg, reps)
}

export interface ClusterStats {
  valuesKg: number[]
  minKg: number
  maxKg: number
  meanKg: number
  spreadPct: number
}

export function clusterStats(estimates: FormulaEstimate[]): ClusterStats | null {
  const valuesKg = estimates.map(item => item.kg).filter((value): value is number => value != null && Number.isFinite(value))
  if (valuesKg.length === 0) return null
  const minKg = Math.min(...valuesKg)
  const maxKg = Math.max(...valuesKg)
  const meanKg = valuesKg.reduce((sum, value) => sum + value, 0) / valuesKg.length
  const spreadPct = meanKg === 0 ? 0 : ((maxKg - minKg) / meanKg) * 100
  return { valuesKg, minKg, maxKg, meanKg, spreadPct }
}

export interface TrainingPercentRow {
  percent: number
  kg: number
  roundedKg: number
  nscaReps: string
  purpose: string
  band: 'strength' | 'hypertrophy' | 'endurance' | 'warmup' | 'test'
}

export const TRAINING_PERCENTS: readonly TrainingPercentRow['percent'][] = [
  100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50,
]

const PERCENT_META: Record<number, Pick<TrainingPercentRow, 'nscaReps' | 'purpose' | 'band'>> = {
  100: { nscaReps: '1', purpose: 'Test / opener', band: 'test' },
  95: { nscaReps: '2', purpose: 'Heavy singles', band: 'strength' },
  90: { nscaReps: '4', purpose: 'Heavy triples–fours', band: 'strength' },
  85: { nscaReps: '6', purpose: 'Strength work', band: 'strength' },
  80: { nscaReps: '8', purpose: 'Strength / volume', band: 'strength' },
  75: { nscaReps: '10', purpose: 'Hypertrophy', band: 'hypertrophy' },
  70: { nscaReps: '~11', purpose: 'Hypertrophy / technique', band: 'hypertrophy' },
  65: { nscaReps: '15', purpose: 'Technique / endurance', band: 'endurance' },
  60: { nscaReps: 'AMRAP', purpose: 'General / deload', band: 'endurance' },
  55: { nscaReps: 'AMRAP', purpose: 'Warm-up', band: 'warmup' },
  50: { nscaReps: 'AMRAP', purpose: 'Warm-up / speed', band: 'warmup' },
}

export function trainingPercentTable(oneRmKg: number): TrainingPercentRow[] {
  return TRAINING_PERCENTS.map((percent) => {
    const kg = oneRmKg * (percent / 100)
    const meta = PERCENT_META[percent]!
    return {
      percent,
      kg,
      roundedKg: roundToIncrement(kg, 2.5),
      ...meta,
    }
  })
}

export interface NrmRow {
  reps: number
  kg: number
  percentOfMax: number
  isInput: boolean
}

export function nrmTable(oneRmKg: number, formulaId: FormulaId, inputReps: number): NrmRow[] {
  const formula = formulaById(formulaId)
  const rows: NrmRow[] = []
  for (let reps = 1; reps <= 10; reps += 1) {
    const kg = formula.invert(oneRmKg, reps)
    if (kg == null || !Number.isFinite(kg) || kg <= 0) continue
    rows.push({
      reps,
      kg,
      percentOfMax: (kg / oneRmKg) * 100,
      isInput: reps === inputReps,
    })
  }
  return rows
}

export function trainingMaxKg(oneRmKg: number, fraction = 0.9): number {
  return oneRmKg * fraction
}

export function isFormulaId(value: string): value is FormulaId {
  return FORMULAS.some(item => item.id === value)
}

export function isLiftId(value: string): value is LiftId {
  return LIFTS.some(item => item.id === value)
}

export function isWeightUnit(value: string): value is WeightUnit {
  return value === 'kg' || value === 'lb'
}

export interface ShareQuery {
  w?: string
  r?: string
  u?: WeightUnit
  lift?: LiftId
  f?: FormulaId
}

export function buildShareQuery(input: {
  weightText: string
  repsText: string
  unit: WeightUnit
  lift: LiftId
  formulaId: FormulaId
}): ShareQuery {
  const query: ShareQuery = { u: input.unit }
  if (input.weightText.trim()) query.w = input.weightText.trim()
  if (input.repsText.trim()) query.r = input.repsText.trim()
  if (input.lift !== 'other') query.lift = input.lift
  if (input.formulaId !== DEFAULT_FORMULA_ID) query.f = input.formulaId
  return query
}

export function queryToSearchParams(query: ShareQuery): string {
  const params = new URLSearchParams()
  if (query.w) params.set('w', query.w)
  if (query.r) params.set('r', query.r)
  if (query.u) params.set('u', query.u)
  if (query.lift) params.set('lift', query.lift)
  if (query.f) params.set('f', query.f)
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}
