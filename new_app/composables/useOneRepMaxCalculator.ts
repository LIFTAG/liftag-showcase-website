import { exerciseFor, loadQualifier } from '~/utils/oneRepMaxExercises'
import {
  DEFAULT_FORMULA_ID,
  buildShareQuery,
  clusterStats,
  confidenceForReps,
  estimateAll,
  estimateOne,
  formatInputWeight,
  formatLoad,
  formatLoadWithUnit,
  fromKg,
  isFormulaId,
  isLiftId,
  isWeightUnit,
  kgToLb,
  lbToKg,
  nrmTable,
  parseRepsInput,
  parseWeightInput,
  queryToSearchParams,
  relabelWeightInput,
  roundToIncrement,
  loadIncrement,
  toKg,
  trainingMaxKg,
  trainingPercentTable,
  weightToKg,
  type Confidence,
  type FormulaEstimate,
  type FormulaId,
  type LiftId,
  type WeightUnit,
} from '~/utils/oneRepMax'
import { compareStrength, type ComparisonSex } from '~/utils/strengthStandards'
import { liftCaveat } from '~/utils/oneRepMaxPage'

const UNIT_STORAGE_KEY = 'liftag-units'

function readStoredUnit(): WeightUnit | null {
  if (!import.meta.client) return null
  try {
    const stored = window.localStorage.getItem(UNIT_STORAGE_KEY)
    return stored && isWeightUnit(stored) ? stored : null
  }
  catch {
    return null
  }
}

function persistUnit(unit: WeightUnit) {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(UNIT_STORAGE_KEY, unit)
  }
  catch {
    // Private mode can throw. Unit still works for the session.
  }
}

function createConvertibleLoad(initialText: string, unit: Ref<WeightUnit>) {
  const draft = shallowRef(initialText)
  const kg = shallowRef<number | null>(weightToKg(initialText, unit.value))
  const text = computed({
    get: () => draft.value,
    set(value: string) {
      draft.value = value
      kg.value = weightToKg(value, unit.value)
    },
  })
  function relabel(nextUnit: WeightUnit) {
    if (kg.value == null) return
    draft.value = relabelWeightInput(kg.value, nextUnit)
  }
  return { text, kg, relabel }
}

export function useOneRepMaxCalculator() {
  const route = useRoute()

  // Keep the initial render identical to the prerendered HTML. Restore shared inputs after hydration.
  const repsText = shallowRef('5')
  const unit = shallowRef<WeightUnit>('kg')
  const weight = createConvertibleLoad('100', unit)
  const bodyweight = createConvertibleLoad('', unit)
  const weightText = weight.text
  const weightKg = weight.kg
  const bodyweightText = bodyweight.text
  const bodyweightKg = bodyweight.kg
  const lift = shallowRef<LiftId>('other')
  const formulaId = shallowRef<FormulaId>(DEFAULT_FORMULA_ID)
  const copied = shallowRef<'link' | 'result' | null>(null)
  const copyError = shallowRef('')
  const comparisonSex = shallowRef<ComparisonSex | ''>('')
  const canShare = shallowRef(false)

  let disposed = false
  let initialized = false
  // Nuxt temporarily replaces a prerendered URL during hydration and restores its
  // query at app:suspense:resolve. Wait for that before reading or syncing inputs.
  onNuxtReady(() => {
    if (disposed) return
    const query = new URLSearchParams(window.location.search)
    const initialUnit = query.get('u') ?? ''
    const initialFormula = query.get('f') ?? ''
    const initialLift = query.get('lift') ?? ''
    const queryHadUnit = isWeightUnit(initialUnit)
    if (isWeightUnit(initialUnit)) unit.value = initialUnit
    if (isLiftId(initialLift)) lift.value = initialLift
    if (isFormulaId(initialFormula)) formulaId.value = initialFormula
    weightText.value = query.get('w') || '100'
    repsText.value = query.get('r') || '5'
    canShare.value = typeof navigator.share === 'function'
    if (!queryHadUnit) {
      const stored = readStoredUnit()
      if (stored) setUnit(stored)
    }
    initialized = true
  })

  const weightParse = computed(() => parseWeightInput(weightText.value))
  const repsParse = computed(() => parseRepsInput(repsText.value))

  watch(() => weightParse.value.detectedUnit, (detected) => {
    if (detected && detected !== unit.value) setUnit(detected)
  })

  const weightError = computed(() => weightParse.value.error)
  const repsError = computed(() => repsParse.value.error)

  const idle = computed(() => !weightText.value.trim() || !repsText.value.trim())

  const reps = computed(() => repsParse.value.value)

  const oneRmKg = computed(() => {
    if (weightKg.value == null || reps.value == null) return null
    return estimateOne(weightKg.value, reps.value, formulaId.value)
  })

  const estimates = computed((): FormulaEstimate[] => {
    if (weightKg.value == null || reps.value == null) return []
    return estimateAll(weightKg.value, reps.value)
  })

  const cluster = computed(() => clusterStats(estimates.value))

  const confidence = computed((): Confidence | null => {
    if (reps.value == null) return null
    return confidenceForReps(reps.value)
  })

  const percentRows = computed(() => oneRmKg.value == null ? [] : trainingPercentTable(oneRmKg.value).map(row => ({
    ...row,
    roundedKg: toKg(roundToIncrement(fromKg(row.kg, unit.value), loadIncrement(unit.value)), unit.value),
  })))
  const nrmRows = computed(() => {
    if (oneRmKg.value == null || reps.value == null) return []
    return nrmTable(oneRmKg.value, formulaId.value, reps.value)
  })

  const trainingMax = computed(() => {
    if (oneRmKg.value == null) return null
    const rawKg = trainingMaxKg(oneRmKg.value)
    if (unit.value === 'kg') return roundToIncrement(rawKg, 2.5)
    return lbToKg(roundToIncrement(kgToLb(rawKg), 5))
  })

  const liveSummary = computed(() => {
    if (idle.value || oneRmKg.value == null || reps.value == null || confidence.value == null) {
      return 'Enter a set to estimate a one-rep max.'
    }
    const load = formatLoadWithUnit(oneRmKg.value, unit.value)
    const formula = estimates.value.find(item => item.id === formulaId.value)?.name ?? 'Epley'
    return `Estimated one-rep max ${load}${loadQualifier(lift.value) ? ` ${loadQualifier(lift.value)}` : ''}. ${formula}. ${reps.value} reps. ${confidence.value === 'measured' ? 'Measured, not an estimate.' : `${confidence.value} confidence.`}`
  })

  const resultCopy = computed(() => {
    if (oneRmKg.value == null || weightKg.value == null || reps.value == null) return ''
    const liftLabel = lift.value === 'other' ? '1RM' : `${exerciseFor(lift.value).label} 1RM`
    return `${liftLabel} ~${formatLoadWithUnit(oneRmKg.value, unit.value)}${loadQualifier(lift.value) ? ` ${loadQualifier(lift.value)}` : ''} (${formatLoad(weightKg.value, unit.value)} × ${reps.value}, ${formulaId.value})`
  })

  const caveat = computed(() => liftCaveat(lift.value))

  const bodyweightParse = computed(() => parseWeightInput(bodyweightText.value))
  const bodyweightError = computed(() => {
    if (!bodyweightText.value.trim()) return null
    if (bodyweightParse.value.error) return bodyweightParse.value.error
    if (bodyweightKg.value == null || bodyweightKg.value < 30 || bodyweightKg.value > 300) return 'Enter a bodyweight between 30 and 300 kg (66–661 lb).'
    return null
  })
  const comparison = computed(() => !bodyweightError.value
    ? compareStrength(oneRmKg.value, bodyweightKg.value, lift.value, comparisonSex.value)
    : null)

  let urlTimer = 0
  let copyTimer = 0
  function syncUrl() {
    if (!import.meta.client) return
    const search = queryToSearchParams(buildShareQuery({
      weightText: weightText.value,
      repsText: repsText.value,
      unit: unit.value,
      lift: lift.value,
      formulaId: formulaId.value,
    }))
    const next = `${route.path}${search}${window.location.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== current) window.history.replaceState(window.history.state, '', next)
  }

  watch([weightText, repsText, unit, lift, formulaId], () => {
    if (!initialized || !import.meta.client) return
    persistUnit(unit.value)
    window.clearTimeout(urlTimer)
    urlTimer = window.setTimeout(syncUrl, 150)
  })

  onBeforeUnmount(() => {
    disposed = true
    if (import.meta.client) { window.clearTimeout(urlTimer); window.clearTimeout(copyTimer) }
  })

  function setUnit(next: WeightUnit) {
    if (next === unit.value) return
    unit.value = next
    weight.relabel(next)
    bodyweight.relabel(next)
  }

  function stepWeight(direction: number) {
    const current = weightKg.value == null ? 0 : fromKg(weightKg.value, unit.value)
    const next = Math.max(loadIncrement(unit.value), current + direction * loadIncrement(unit.value))
    weightText.value = formatInputWeight(next, unit.value)
  }

  function setLift(next: LiftId) {
    lift.value = next
  }

  function setFormula(next: FormulaId) {
    formulaId.value = next
  }

  async function copyText(text: string, kind: 'link' | 'result') {
    if (!import.meta.client) return
    copyError.value = ''
    try {
      await navigator.clipboard.writeText(text)
      window.clearTimeout(copyTimer)
      copied.value = kind
      copyTimer = window.setTimeout(() => { copied.value = null }, 1800)
    }
    catch {
      copied.value = null
      copyError.value = 'Copy unavailable in this browser. You can copy the page URL from the address bar.'
    }
  }

  async function copyLink() {
    if (!import.meta.client) return
    syncUrl()
    await copyText(window.location.href, 'link')
  }

  async function copyResult() {
    if (resultCopy.value) await copyText(resultCopy.value, 'result')
  }

  async function share() {
    if (!import.meta.client || !navigator.share) return
    syncUrl()
    try {
      await navigator.share({ title: 'LIFTAG 1RM calculator', text: resultCopy.value || 'Estimate a one-rep max.', url: window.location.href })
    }
    catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) copyError.value = 'Sharing unavailable. Try copying the link.'
    }
  }

  const otherUnit = computed(() => (unit.value === 'kg' ? 'lb' : 'kg'))

  return {
    weightText,
    repsText,
    unit,
    lift,
    formulaId,
    copied,
    copyError,
    bodyweightText,
    bodyweightKg,
    comparisonSex,
    bodyweightError,
    comparison,
    stepWeight,
    idle,
    weightError,
    repsError,
    weightKg,
    reps,
    oneRmKg,
    estimates,
    cluster,
    confidence,
    percentRows,
    nrmRows,
    trainingMax,
    liveSummary,
    resultCopy,
    caveat,
    otherUnit,
    canShare,
    setUnit,
    setLift,
    setFormula,
    copyLink,
    copyResult,
    share,
    formatLoad,
    formatLoadWithUnit,
  }
}
