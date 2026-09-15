import type { SiteLocale } from '../types/locale.ts'
import {
  WORKED_EXAMPLE,
  estimateAll,
  estimateOne,
  formatLoad,
  type FormulaId,
} from './oneRepMax.ts'
import { STRENGTH_COMPARISON_COUNT } from './strengthStandards.ts'
import { en as oneRmGuideEn } from '../content/tools/oneRmGuide.ts'

export const ONE_RM_PATH = '/tools/1rm-calculator'
export const ONE_RM_MARKDOWN_PATH = '/tools/1rm-calculator.md'

export const ONE_RM_TITLE = '1RM Calculator | LIFTAG'
export const ONE_RM_DESCRIPTION = `Estimate a one-rep max from a hard set. Epley plus six formulas, training loads, and strength percentiles for ${STRENGTH_COMPARISON_COUNT} lifts. Free, no signup, kg or lb.`

export const ONE_RM_H1 = 'One-rep max calculator'
export const ONE_RM_LEAD = 'Estimate a 1RM, and a working-weight table, from a set you already did. LIFTAG uses Epley, the same formula the app stores per exercise, and shows Brzycki plus five other published equations so you can see the spread.'

export const ONE_RM_DATE_PUBLISHED = '2026-09-09'
export const ONE_RM_DATE_REVIEWED = '2026-09-11'

export const ONE_RM_FAQS = oneRmGuideEn.faqs

export const ONE_RM_SOURCES: Array<{ label: string, href?: string }> = [
  { label: 'Epley, B. (1985). Poundage chart. University of Nebraska.' },
  { label: 'Brzycki, M. (1993). Strength testing: predicting a one-rep max from reps-to-fatigue. JOPERD 64(1), 88–90.' },
  { label: 'Lombardi, V. P. (1989). Beginning Weight Training. Wm. C. Brown.' },
  { label: 'Mayhew, J. L. et al. (1992). Relative muscular endurance performance as a predictor of bench press strength. JSCR.' },
  { label: "O'Connor, B., Simmons, J., & O'Shea, P. (1989). Weight Training Today." },
  { label: 'Wathen, D. (1994). Load assignment. In: NSCA Essentials of Strength Training and Conditioning.' },
  { label: 'Lander, J. (1985). Maximum based on reps. NSCA Journal 6, 60–61.' },
  {
    label: 'LeSuer, D. A. et al. (1997). The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. JSCR 11(4), 211–213.',
    href: 'https://journals.lww.com/nsca-jscr/abstract/1997/11000/the_accuracy_of_prediction_equations_for.1.aspx',
  },
  {
    label: 'Reynolds, J. M., Gordon, T. J., & Robergs, R. A. (2006). Prediction of one repetition maximum strength from multiple repetition maximum testing and anthropometry. JSCR.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/16503679/',
  },
  {
    label: 'Strength Level. Strength standards. Broad bodyweight-ratio tables used for the “stronger than X% of lifters” comparison, reviewed 9 September 2026.',
    href: 'https://strengthlevel.com/strength-standards',
  },
  {
    label: 'OpenPowerlifting. All-time raw competition lifts used as the 100% world-record ratio for squat, bench, and deadlift, reviewed 11 September 2026.',
    href: 'https://www.openpowerlifting.org',
  },
  {
    label: 'Naim Süleymanoğlu, 1988, 60 kg class: 152.5 kg snatch and 190 kg clean and jerk, used as the male Olympic-lift world-record ratios.',
    href: 'https://en.wikipedia.org/wiki/Naim_Süleymanoğlu',
  },
  {
    label: 'Hou Zhihui, Tokyo 2021, 49 kg class: 94 kg snatch and 116 kg clean and jerk, used as the female Olympic-lift world-record ratios.',
    href: 'https://en.wikipedia.org/wiki/Hou_Zhihui',
  },
]

export interface WorkedFormulaRow {
  id: FormulaId
  name: string
  year: number
  equation: string
  kg: string
}

export function workedExampleRows(locale: SiteLocale = 'en'): WorkedFormulaRow[] {
  return estimateAll(WORKED_EXAMPLE.weightKg, WORKED_EXAMPLE.reps).map(row => ({
    id: row.id,
    name: row.name,
    year: row.year,
    equation: row.equation,
    kg: row.kg == null ? 'n/a' : formatLoad(row.kg, 'kg', locale),
  }))
}

export function workedEpleyKg(locale: SiteLocale = 'en'): string {
  const kg = estimateOne(WORKED_EXAMPLE.weightKg, WORKED_EXAMPLE.reps, 'epley')
  return kg == null ? 'n/a' : formatLoad(kg, 'kg', locale)
}

export function liftCaveat(lift: string): string | null {
  if (lift === 'deadlift') {
    return 'Published equations under-predict deadlift by about 10%. Do not take this into a meet.'
  }
  if (lift === 'squat') {
    return 'Depth and pause change the number more than the formula does. Log the standard you actually hit.'
  }
  if (lift === 'bench') {
    return 'Mayhew and Wathen were the LeSuer winners on bench. Epley stays the default so this page matches the LIFTAG log.'
  }
  return null
}
