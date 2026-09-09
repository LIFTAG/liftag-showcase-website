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
  roundToIncrement,
  toKg,
  trainingMaxKg,
  trainingPercentTable,
  type Confidence,
  type FormulaEstimate,
  type FormulaId,
  type LiftId,
  type WeightUnit,
} from '~/utils/oneRepMax'
import { liftCaveat } from '~/utils/oneRepMaxPage'

const UNIT_STORAGE_KEY = 'liftag-units'

function queryString(value: unknown): string {
  return typeof value === 'string' ? value : Array.isArray(value) ? String(value[0] ?? '') : ''
}

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

export function useOneRepMaxCalculator() {
  const route = useRoute()

  const initialUnit = queryString(route.query.u)
  const initialFormula = queryString(route.query.f)
  const initialLift = queryString(route.query.lift)

  const weightText = shallowRef(queryString(route.query.w) || '100')
  const repsText = shallowRef(queryString(route.query.r) || '5')
  const unit = shallowRef<WeightUnit>(isWeightUnit(initialUnit) ? initialUnit : 'kg')
  const lift = shallowRef<LiftId>(isLiftId(initialLift) ? initialLift : 'other')
  const formulaId = shallowRef<FormulaId>(isFormulaId(initialFormula) ? initialFormula : DEFAULT_FORMULA_ID)
  const copied = shallowRef(false)
  const canShare = shallowRef(false)

  const queryHadUnit = Boolean(initialUnit)

  onMounted(() => {
    canShare.value = typeof navigator.share === 'function'
    if (!queryHadUnit) {
      const stored = readStoredUnit()
      if (stored) unit.value = stored
    }
  })

  const weightParse = computed(() => parseWeightInput(weightText.value))
  const repsParse = computed(() => parseRepsInput(repsText.value))

  watch(() => weightParse.value.detectedUnit, (detected) => {
    if (detected && detected !== unit.value) unit.value = detected
  })

  const weightError = computed(() => weightParse.value.error)
  const repsError = computed(() => repsParse.value.error)

  const idle = computed(() => !weightText.value.trim() || !repsText.value.trim())

  const weightKg = computed(() => {
    const parsed = weightParse.value
    if (parsed.value == null) return null
    const sourceUnit = parsed.detectedUnit ?? unit.value
    return toKg(parsed.value, sourceUnit)
  })

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

  const percentRows = computed(() => (oneRmKg.value == null ? [] : trainingPercentTable(oneRmKg.value)))
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
    return `Estimated one-rep max ${load}. ${formula}. ${reps.value} reps. ${confidence.value === 'measured' ? 'Measured, not an estimate.' : `${confidence.value} confidence.`}`
  })

  const resultCopy = computed(() => {
    if (oneRmKg.value == null || weightKg.value == null || reps.value == null) return ''
    const liftLabel = lift.value === 'other' ? '1RM' : `${lift.value} 1RM`
    return `${liftLabel} ~${formatLoadWithUnit(oneRmKg.value, unit.value)} (${formatLoad(weightKg.value, unit.value)} × ${reps.value}, ${formulaId.value})`
  })

  const caveat = computed(() => liftCaveat(lift.value))

  let urlTimer = 0
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
    persistUnit(unit.value)
    if (!import.meta.client) return
    window.clearTimeout(urlTimer)
    urlTimer = window.setTimeout(syncUrl, 150)
  })

  onBeforeUnmount(() => {
    if (import.meta.client) window.clearTimeout(urlTimer)
  })

  function setUnit(next: WeightUnit) {
    if (next === unit.value) return
    const parsed = weightParse.value
    if (parsed.value != null) {
      const kg = toKg(parsed.value, parsed.detectedUnit ?? unit.value)
      weightText.value = formatInputWeight(fromKg(kg, next), next)
    }
    unit.value = next
  }

  function setLift(next: LiftId) {
    lift.value = next
  }

  function setFormula(next: FormulaId) {
    formulaId.value = next
  }

  async function copyLink() {
    if (!import.meta.client) return
    syncUrl()
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      copied.value = true
      window.setTimeout(() => { copied.value = false }, 1600)
    }
    catch {
      copied.value = false
    }
  }

  async function copyResult() {
    if (!import.meta.client || !resultCopy.value) return
    try {
      await navigator.clipboard.writeText(resultCopy.value)
      copied.value = true
      window.setTimeout(() => { copied.value = false }, 1600)
    }
    catch {
      copied.value = false
    }
  }

  function share() {
    if (!import.meta.client || !navigator.share) return
    syncUrl()
    void navigator.share({
      title: 'LIFTAG 1RM calculator',
      text: resultCopy.value || 'Estimate a one-rep max.',
      url: window.location.href,
    })
  }

  const otherUnit = computed(() => (unit.value === 'kg' ? 'lb' : 'kg'))

  return {
    weightText,
    repsText,
    unit,
    lift,
    formulaId,
    copied,
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
