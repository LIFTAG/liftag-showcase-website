import {
  WORKED_EXAMPLE,
  estimateAll,
  estimateOne,
  formatLoad,
  type FormulaId,
} from './oneRepMax.ts'
import { STRENGTH_COMPARISON_COUNT } from './strengthStandards.ts'

export const ONE_RM_PATH = '/tools/1rm-calculator'
export const ONE_RM_MARKDOWN_PATH = '/tools/1rm-calculator.md'

export const ONE_RM_TITLE = '1RM Calculator | LIFTAG'
export const ONE_RM_DESCRIPTION = `Estimate a one-rep max from a hard set. Epley plus six formulas, training loads, and strength percentiles for ${STRENGTH_COMPARISON_COUNT} lifts. Free, no signup, kg or lb.`

export const ONE_RM_H1 = 'One-rep max calculator'
export const ONE_RM_LEAD = 'Estimate a 1RM, and a working-weight table, from a set you already did. LIFTAG uses Epley, the same formula the app stores per exercise, and shows Brzycki plus five other published equations so you can see the spread.'

export const ONE_RM_DATE_PUBLISHED = '2026-09-09'
export const ONE_RM_DATE_REVIEWED = '11 September 2026'

export const ONE_RM_FAQS: Array<{ question: string, answer: string }> = [
  {
    question: 'How do you calculate a one-rep max?',
    answer: 'Take a hard set of 2–10 reps and run Epley: 1RM = weight × (1 + reps / 30). A 100 kg set of 5 estimates 116.7 kg. That is the default in this calculator and in the LIFTAG app. It is an estimate, not a tested single.',
  },
  {
    question: 'Which 1RM formula is most accurate?',
    answer: 'None of them wins every lift. LeSuer et al. 1997 found Mayhew and Wathen closest on bench, Wathen on squat, and every equation low on deadlift by about 10%. LIFTAG uses Epley so the website matches the log. Use a hard set of 5 or fewer if the number has to be close.',
  },
  {
    question: 'How accurate is a 1RM calculator?',
    answer: 'On compounds, a hard 2–8 is usually inside about 5%. Past 10 reps the equations measure endurance, not a max. Reynolds, Gordon, and Robergs 2006 found 5RM beat 10RM beat 20RM. Do not take an estimate into a meet.',
  },
  {
    question: 'Why is this the best 1RM calculator?',
    answer: `It names seven published formulas, defaults to Epley so the website matches the LIFTAG log, shows confidence by rep range, ranks ${STRENGTH_COMPARISON_COUNT} lifts against published Strength Level ratios, and labels a 20-rep set as endurance rather than a max. Calculated on your device. No signup.`,
  },
  {
    question: 'Is 5 reps about 85% of 1RM?',
    answer: 'NSCA load charts put a 5RM near 87% of a tested 1RM. Epley from a 5-rep set treats that set as about 86% of the estimated max (100 / 116.7). Close enough to program from. Not close enough to skip a real opener.',
  },
  {
    question: 'Can I use this as a bench press or squat max calculator?',
    answer: 'Yes. Same tool, same URL. Pick the lift if you want the deadlift caveat: published equations under-predict deadlift by about 10%. Formulas were mostly validated on bench, squat, and deadlift, not on curls.',
  },
  {
    question: 'Should I test a true 1RM or estimate it?',
    answer: 'Most lifters should estimate. A true single needs a spotter, safeties, and a reason. If you only need percentages for next week, a hard set of 3–5 plus Epley is enough. ACSM still treats a tested 1RM as the gold standard, not as homework.',
  },
  {
    question: 'Does LIFTAG calculate 1RM automatically?',
    answer: 'Yes. Log the set. Estimated 1RM updates per exercise with Epley, the same math as this page. PRs stay on the lift you actually performed. Optional RPE is context, not a second formula.',
  },
  {
    question: 'How is my strength percentile calculated?',
    answer: 'LIFTAG divides your estimated 1RM by bodyweight and interpolates between published Strength Level ratios for your exercise and comparison group. The result is shown as “You are stronger than X% of lifters.” It is an approximate ranking among Strength Level lifters, not a percentile of the general population. It does not adjust for age. Below the 5th benchmark it shows “fewer than 5%”. Past elite, lifts with a sourced all-time raw world-record ratio stretch that last 5% to the record as 100%. Other lifts keep a modeled tail and never claim 100%. High-rep sets still get a comparison from the estimated 1RM.',
  },
  {
    question: 'Which exercises have strength comparisons?',
    answer: 'Common barbell, dumbbell, cable, and machine gym exercises have male and female bodyweight-ratio benchmarks, including bench, squat, deadlift, Olympic lifts, rows, curls, pulldowns, and leg press. Enter your bodyweight and select a group to compare your estimated 1RM. Dumbbell weights are per dumbbell. Pull-ups, chin-ups, and dips give a total-load estimate (bodyweight plus added weight) only; other exercises also receive no percentile.',
  },
  {
    question: 'What is the difference between a 1RM and a PR?',
    answer: '1RM is a one-repetition maximum, a single. A PR is any personal record: a 5RM, a paused bench, a volume PR. This page estimates a 1RM. LIFTAG stores both.',
  },
]

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

export function workedExampleRows(): WorkedFormulaRow[] {
  return estimateAll(WORKED_EXAMPLE.weightKg, WORKED_EXAMPLE.reps).map(row => ({
    id: row.id,
    name: row.name,
    year: row.year,
    equation: row.equation,
    kg: row.kg == null ? 'n/a' : formatLoad(row.kg, 'kg'),
  }))
}

export function workedEpleyKg(): string {
  const kg = estimateOne(WORKED_EXAMPLE.weightKg, WORKED_EXAMPLE.reps, 'epley')
  return kg == null ? 'n/a' : formatLoad(kg, 'kg')
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
