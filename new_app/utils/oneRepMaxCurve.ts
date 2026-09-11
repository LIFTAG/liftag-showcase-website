import { FORMULAS, MAX_REPS, MIN_REPS, type FormulaId } from './oneRepMax.ts'

export interface RepCurvePoint {
  reps: number
  kg: number
}

/** Each equation passes through the completed set, then predicts other rep targets. */
export function buildRepCurves(weightKg: number, inputReps: number) {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isInteger(inputReps)
    || inputReps < MIN_REPS || inputReps > MAX_REPS) return []

  const lastRep = Math.max(15, inputReps)
  return FORMULAS.map((formula) => {
    const max = formula.estimate(weightKg, inputReps)
    const points: RepCurvePoint[] = []
    for (let reps = 1; reps <= lastRep; reps++) {
      const kg = max == null ? null : formula.invert(max, reps)
      if (kg != null && Number.isFinite(kg) && kg > 0) points.push({ reps, kg })
    }
    return { id: formula.id as FormulaId, name: formula.name, points }
  })
}
