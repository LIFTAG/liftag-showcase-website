import type { LiftId } from './oneRepMax.ts'
import { worldRecordRatio } from './worldRecords.ts'

export type ComparisonSex = 'male' | 'female'
export const STRENGTH_REVIEWED = '2026-09-09'
export const STRENGTH_LEVELS = [
  { label: 'Beginner', percentile: 5 },
  { label: 'Novice', percentile: 20 },
  { label: 'Intermediate', percentile: 50 },
  { label: 'Advanced', percentile: 80 },
  { label: 'Elite', percentile: 95 },
] as const

/** Published broad bodyweight ratios, not exact-bodyweight or age-adjusted distributions.
 * Source pages checked 2026-09-09. Interpolation is LIFTAG’s approximation.
 */
export const STRENGTH_STANDARDS = {
  'bench': {
    label: 'Barbell bench press', slug: 'bench-press',
    male: [0.5, 1.0, 1.25, 1.5, 2.0], female: [0.3, 0.5, 0.75, 1.1, 1.45],
  },
  'squat': {
    label: 'Barbell back squat', slug: 'squat',
    male: [0.75, 1.25, 1.75, 2.25, 2.75], female: [0.5, 0.75, 1.25, 1.75, 2.25],
  },
  'deadlift': {
    label: 'Barbell deadlift', slug: 'deadlift',
    male: [1.0, 1.5, 2.0, 2.5, 3.25], female: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  'ohp': {
    label: 'Strict overhead press', slug: 'shoulder-press',
    male: [0.35, 0.55, 0.8, 1.05, 1.35], female: [0.2, 0.35, 0.5, 0.7, 0.95],
  },
  'incline-bench-press': {
    label: 'Incline bench press', slug: 'incline-bench-press',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.25, 0.4, 0.65, 0.95, 1.25],
  },
  'close-grip-bench-press': {
    label: 'Close grip bench press', slug: 'close-grip-bench-press',
    male: [0.5, 0.75, 1.25, 1.5, 2.0], female: [0.3, 0.5, 0.75, 1.05, 1.35],
  },
  'front-squat': {
    label: 'Front squat', slug: 'front-squat',
    male: [0.75, 1.0, 1.25, 1.75, 2.25], female: [0.5, 0.75, 1.0, 1.25, 1.5],
  },
  'sumo-deadlift': {
    label: 'Sumo deadlift', slug: 'sumo-deadlift',
    male: [1.25, 1.75, 2.25, 2.75, 3.5], female: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  'romanian-deadlift': {
    label: 'Romanian deadlift', slug: 'romanian-deadlift',
    male: [0.75, 1.0, 1.5, 2.0, 2.75], female: [0.5, 0.75, 1.0, 1.5, 2.0],
  },
  'hex-bar-deadlift': {
    label: 'Trap bar deadlift', slug: 'hex-bar-deadlift',
    male: [1.25, 1.5, 2.0, 2.75, 3.25], female: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  'hip-thrust': {
    label: 'Hip thrust', slug: 'hip-thrust',
    male: [0.5, 1.25, 1.75, 2.75, 3.75], female: [0.5, 1.0, 1.75, 2.5, 3.25],
  },
  'bent-over-row': {
    label: 'Barbell bent-over row', slug: 'bent-over-row',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.3, 0.45, 0.7, 0.95, 1.25],
  },
  'barbell-curl': {
    label: 'Barbell curl', slug: 'barbell-curl',
    male: [0.25, 0.4, 0.6, 0.8, 1.05], female: [0.1, 0.25, 0.4, 0.55, 0.75],
  },
  'skullcrusher': {
    label: 'Barbell skull crusher', slug: 'lying-tricep-extension',
    male: [0.2, 0.35, 0.55, 0.75, 1.0], female: [0.1, 0.2, 0.3, 0.5, 0.65],
  },
  'barbell-calf-raise': {
    label: 'Barbell calf raise', slug: 'barbell-calf-raise',
    male: [0.5, 1.0, 1.5, 2.25, 3.25], female: [0.5, 0.75, 1.25, 1.75, 2.5],
  },
  'barbell-lunge': {
    label: 'Barbell lunge', slug: 'barbell-lunge',
    male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.25, 0.5, 0.75, 1.25, 1.5],
  },
  'barbell-reverse-lunge': {
    label: 'Barbell reverse lunge', slug: 'barbell-reverse-lunge',
    male: [0.5, 0.75, 1.25, 1.75, 2.25], female: [0.5, 0.5, 0.75, 1.25, 1.5],
  },
  'barbell-shrug': {
    label: 'Barbell shrug', slug: 'barbell-shrug',
    male: [0.5, 1.0, 1.5, 2.25, 3.0], female: [0.25, 0.5, 1.0, 1.5, 2.25],
  },
  'tricep-extension': {
    label: 'Barbell tricep extension', slug: 'tricep-extension',
    male: [0.15, 0.35, 0.6, 0.9, 1.25], female: [0.05, 0.15, 0.3, 0.5, 0.75],
  },
  'box-squat': {
    label: 'Box squat', slug: 'box-squat',
    male: [1.0, 1.5, 2.0, 2.5, 3.25], female: [0.5, 1.0, 1.25, 1.75, 2.25],
  },
  'bulgarian-split-squat': {
    label: 'Bulgarian split squat', slug: 'bulgarian-split-squat',
    male: [0.25, 0.5, 0.75, 1.25, 2.0], female: [0.15, 0.35, 0.6, 0.9, 1.3],
  },
  'clean': {
    label: 'Clean', slug: 'clean',
    male: [0.75, 1.0, 1.25, 1.5, 1.75], female: [0.5, 0.65, 0.9, 1.1, 1.4],
  },
  'clean-and-jerk': {
    label: 'Clean and jerk', slug: 'clean-and-jerk',
    male: [0.5, 0.75, 1.25, 1.5, 2.0], female: [0.45, 0.6, 0.85, 1.1, 1.4],
  },
  'clean-and-press': {
    label: 'Clean and press', slug: 'clean-and-press',
    male: [0.5, 0.75, 1.0, 1.25, 1.5], female: [0.25, 0.4, 0.6, 0.85, 1.15],
  },
  'decline-bench-press': {
    label: 'Decline bench press', slug: 'decline-bench-press',
    male: [0.75, 1.0, 1.25, 1.75, 2.25], female: [0.25, 0.5, 0.75, 1.25, 1.5],
  },
  'ez-bar-curl': {
    label: 'EZ-bar curl', slug: 'ez-bar-curl',
    male: [0.3, 0.4, 0.6, 0.8, 1.0], female: [0.2, 0.3, 0.4, 0.55, 0.75],
  },
  'floor-press': {
    label: 'Floor press', slug: 'floor-press',
    male: [0.5, 0.75, 1.25, 1.5, 2.25], female: [0.25, 0.45, 0.7, 1.05, 1.4],
  },
  'good-morning': {
    label: 'Good morning', slug: 'good-morning',
    male: [0.25, 0.75, 1.0, 1.5, 2.25], female: [0.25, 0.45, 0.7, 1.05, 1.4],
  },
  'hang-clean': {
    label: 'Hang clean', slug: 'hang-clean',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.45, 0.6, 0.8, 1.05, 1.3],
  },
  'military-press': {
    label: 'Military press', slug: 'military-press',
    male: [0.4, 0.55, 0.8, 1.05, 1.3], female: [0.25, 0.35, 0.5, 0.7, 0.9],
  },
  'pendlay-row': {
    label: 'Pendlay row', slug: 'pendlay-row',
    male: [0.5, 0.75, 1.25, 1.5, 1.75], female: [0.4, 0.55, 0.8, 1.05, 1.35],
  },
  'power-clean': {
    label: 'Power clean', slug: 'power-clean',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.45, 0.6, 0.8, 1.05, 1.35],
  },
  'power-snatch': {
    label: 'Power snatch', slug: 'power-snatch',
    male: [0.4, 0.6, 0.85, 1.15, 1.45], female: [0.35, 0.45, 0.6, 0.8, 0.95],
  },
  'preacher-curl': {
    label: 'Preacher curl', slug: 'preacher-curl',
    male: [0.25, 0.4, 0.55, 0.8, 1.05], female: [0.15, 0.25, 0.4, 0.55, 0.75],
  },
  'push-press': {
    label: 'Push press', slug: 'push-press',
    male: [0.5, 0.75, 1.0, 1.25, 1.75], female: [0.35, 0.5, 0.7, 0.9, 1.15],
  },
  'rack-pull': {
    label: 'Rack pull', slug: 'rack-pull',
    male: [1.25, 1.75, 2.25, 3.0, 3.75], female: [0.75, 1.25, 1.75, 2.25, 3.0],
  },
  'reverse-barbell-curl': {
    label: 'Reverse barbell curl', slug: 'reverse-barbell-curl',
    male: [0.15, 0.3, 0.5, 0.75, 1.0], female: [0.1, 0.2, 0.35, 0.5, 0.65],
  },
  'seated-shoulder-press': {
    label: 'Seated shoulder press', slug: 'seated-shoulder-press',
    male: [0.5, 0.5, 1.0, 1.25, 1.5], female: [0.15, 0.3, 0.5, 0.75, 1.05],
  },
  'snatch': {
    label: 'Snatch', slug: 'snatch',
    male: [0.5, 0.75, 1.0, 1.25, 1.5], female: [0.35, 0.45, 0.65, 0.9, 1.1],
  },
  'stiff-leg-deadlift': {
    label: 'Stiff-leg deadlift', slug: 'stiff-leg-deadlift',
    male: [0.75, 1.25, 1.5, 2.25, 2.75], female: [0.5, 0.75, 1.0, 1.5, 2.0],
  },
  't-bar-row': {
    label: 'T-bar row', slug: 't-bar-row',
    male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.25, 0.4, 0.7, 1.0, 1.35],
  },
  'upright-row': {
    label: 'Upright row', slug: 'upright-row',
    male: [0.25, 0.45, 0.75, 1.05, 1.45], female: [0.2, 0.3, 0.5, 0.7, 0.95],
  },
  'zercher-squat': {
    label: 'Zercher squat', slug: 'zercher-squat',
    male: [0.75, 1.0, 1.5, 2.0, 2.5], female: [0.5, 0.75, 1.0, 1.25, 1.75],
  },
  'dumbbell-bench-press': {
    label: 'Dumbbell bench press', slug: 'dumbbell-bench-press',
    male: [0.2, 0.35, 0.5, 0.7, 0.9], female: [0.1, 0.2, 0.3, 0.45, 0.6],
  },
  'incline-dumbbell-bench-press': {
    label: 'Incline dumbbell bench press', slug: 'incline-dumbbell-bench-press',
    male: [0.25, 0.35, 0.5, 0.65, 0.85], female: [0.1, 0.2, 0.3, 0.45, 0.55],
  },
  'dumbbell-shoulder-press': {
    label: 'Dumbbell shoulder press', slug: 'dumbbell-shoulder-press',
    male: [0.15, 0.25, 0.4, 0.55, 0.7], female: [0.1, 0.15, 0.25, 0.35, 0.45],
  },
  'dumbbell-row': {
    label: 'Dumbbell row', slug: 'dumbbell-row',
    male: [0.2, 0.35, 0.55, 0.75, 1.0], female: [0.15, 0.25, 0.35, 0.45, 0.6],
  },
  'dumbbell-curl': {
    label: 'Dumbbell curl', slug: 'dumbbell-curl',
    male: [0.1, 0.15, 0.3, 0.4, 0.55], female: [0.05, 0.1, 0.2, 0.3, 0.4],
  },
  'hammer-curl': {
    label: 'Hammer curl', slug: 'hammer-curl',
    male: [0.1, 0.2, 0.3, 0.4, 0.55], female: [0.1, 0.15, 0.2, 0.25, 0.35],
  },
  'dumbbell-lateral-raise': {
    label: 'Dumbbell lateral raise', slug: 'dumbbell-lateral-raise',
    male: [0.05, 0.1, 0.2, 0.3, 0.45], female: [0.05, 0.1, 0.15, 0.2, 0.3],
  },
  'dumbbell-fly': {
    label: 'Dumbbell fly', slug: 'dumbbell-fly',
    male: [0.1, 0.2, 0.3, 0.45, 0.6], female: [0.05, 0.1, 0.2, 0.25, 0.35],
  },
  'goblet-squat': {
    label: 'Goblet squat', slug: 'goblet-squat',
    male: [0.2, 0.35, 0.55, 0.75, 1.05], female: [0.15, 0.25, 0.4, 0.6, 0.8],
  },
  'arnold-press': {
    label: 'Arnold press', slug: 'arnold-press',
    male: [0.1, 0.2, 0.3, 0.45, 0.55], female: [0.1, 0.15, 0.2, 0.25, 0.35],
  },
  'chest-supported-dumbbell-row': {
    label: 'Chest-supported dumbbell row', slug: 'chest-supported-dumbbell-row',
    male: [0.15, 0.3, 0.45, 0.7, 0.95], female: [0.1, 0.2, 0.35, 0.5, 0.65],
  },
  'dumbbell-concentration-curl': {
    label: 'Concentration curl', slug: 'dumbbell-concentration-curl',
    male: [0.1, 0.2, 0.25, 0.4, 0.5], female: [0.1, 0.15, 0.2, 0.25, 0.35],
  },
  'decline-dumbbell-bench-press': {
    label: 'Decline dumbbell bench press', slug: 'decline-dumbbell-bench-press',
    male: [0.2, 0.3, 0.45, 0.65, 0.9], female: [0.1, 0.2, 0.35, 0.5, 0.7],
  },
  'dumbbell-bulgarian-split-squat': {
    label: 'Dumbbell Bulgarian split squat', slug: 'dumbbell-bulgarian-split-squat',
    male: [0.15, 0.25, 0.4, 0.6, 0.85], female: [0.1, 0.2, 0.35, 0.5, 0.65],
  },
  'dumbbell-deadlift': {
    label: 'Dumbbell deadlift', slug: 'dumbbell-deadlift',
    male: [0.15, 0.35, 0.55, 0.8, 1.15], female: [0.1, 0.25, 0.4, 0.6, 0.85],
  },
  'dumbbell-floor-press': {
    label: 'Dumbbell floor press', slug: 'dumbbell-floor-press',
    male: [0.15, 0.3, 0.45, 0.6, 0.85], female: [0.1, 0.2, 0.3, 0.4, 0.5],
  },
  'dumbbell-front-raise': {
    label: 'Dumbbell front raise', slug: 'dumbbell-front-raise',
    male: [0.05, 0.1, 0.2, 0.35, 0.5], female: [0.05, 0.1, 0.15, 0.25, 0.3],
  },
  'dumbbell-lunge': {
    label: 'Dumbbell lunge', slug: 'dumbbell-lunge',
    male: [0.1, 0.2, 0.4, 0.6, 0.8], female: [0.1, 0.2, 0.3, 0.45, 0.65],
  },
  'dumbbell-pullover': {
    label: 'Dumbbell pullover', slug: 'dumbbell-pullover',
    male: [0.15, 0.3, 0.45, 0.65, 0.85], female: [0.1, 0.2, 0.3, 0.4, 0.55],
  },
  'dumbbell-reverse-fly': {
    label: 'Dumbbell reverse fly', slug: 'dumbbell-reverse-fly',
    male: [0.05, 0.1, 0.2, 0.35, 0.55], female: [0.05, 0.1, 0.15, 0.25, 0.35],
  },
  'dumbbell-romanian-deadlift': {
    label: 'Dumbbell Romanian deadlift', slug: 'dumbbell-romanian-deadlift',
    male: [0.2, 0.35, 0.55, 0.8, 1.05], female: [0.15, 0.3, 0.45, 0.65, 0.85],
  },
  'dumbbell-shrug': {
    label: 'Dumbbell shrug', slug: 'dumbbell-shrug',
    male: [0.2, 0.35, 0.55, 0.8, 1.1], female: [0.1, 0.2, 0.4, 0.6, 0.85],
  },
  'dumbbell-squat': {
    label: 'Dumbbell squat', slug: 'dumbbell-squat',
    male: [0.15, 0.25, 0.45, 0.65, 0.9], female: [0.1, 0.2, 0.35, 0.5, 0.7],
  },
  'dumbbell-tricep-extension': {
    label: 'Dumbbell tricep extension', slug: 'dumbbell-tricep-extension',
    male: [0.05, 0.15, 0.25, 0.45, 0.6], female: [0.05, 0.1, 0.2, 0.3, 0.4],
  },
  'dumbbell-tricep-kickback': {
    label: 'Dumbbell tricep kickback', slug: 'dumbbell-tricep-kickback',
    male: [0.05, 0.1, 0.25, 0.35, 0.5], female: [0.05, 0.1, 0.15, 0.25, 0.3],
  },
  'incline-dumbbell-curl': {
    label: 'Incline dumbbell curl', slug: 'incline-dumbbell-curl',
    male: [0.1, 0.15, 0.25, 0.35, 0.45], female: [0.1, 0.1, 0.2, 0.25, 0.3],
  },
  'incline-dumbbell-fly': {
    label: 'Incline dumbbell fly', slug: 'incline-dumbbell-fly',
    male: [0.1, 0.2, 0.3, 0.45, 0.65], female: [0.05, 0.1, 0.2, 0.3, 0.4],
  },
  'seated-dumbbell-shoulder-press': {
    label: 'Seated dumbbell shoulder press', slug: 'seated-dumbbell-shoulder-press',
    male: [0.2, 0.3, 0.4, 0.55, 0.7], female: [0.1, 0.2, 0.25, 0.35, 0.45],
  },
  'lat-pulldown': {
    label: 'Lat pulldown', slug: 'lat-pulldown',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.35, 0.5, 0.75, 0.95, 1.25],
  },
  'seated-cable-row': {
    label: 'Seated cable row', slug: 'seated-cable-row',
    male: [0.5, 0.75, 1.0, 1.5, 1.75], female: [0.35, 0.5, 0.75, 1.0, 1.3],
  },
  'tricep-pushdown': {
    label: 'Tricep pushdown', slug: 'tricep-pushdown',
    male: [0.25, 0.45, 0.7, 1.05, 1.4], female: [0.15, 0.25, 0.45, 0.7, 0.95],
  },
  'cable-bicep-curl': {
    label: 'Cable bicep curl', slug: 'cable-bicep-curl',
    male: [0.25, 0.4, 0.65, 0.95, 1.3], female: [0.1, 0.25, 0.4, 0.6, 0.85],
  },
  'cable-crunch': {
    label: 'Cable crunch', slug: 'cable-crunch',
    male: [0.25, 0.5, 0.75, 1.25, 1.75], female: [0.25, 0.5, 0.75, 1.25, 1.5],
  },
  'cable-fly': {
    label: 'Cable fly', slug: 'cable-fly',
    male: [0.1, 0.25, 0.45, 0.75, 1.1], female: [0.05, 0.15, 0.3, 0.45, 0.7],
  },
  'cable-lateral-raise': {
    label: 'Cable lateral raise', slug: 'cable-lateral-raise',
    male: [0.05, 0.1, 0.2, 0.35, 0.5], female: [0.05, 0.1, 0.15, 0.25, 0.4],
  },
  'cable-overhead-tricep-extension': {
    label: 'Cable overhead tricep extension', slug: 'cable-overhead-tricep-extension',
    male: [0.15, 0.3, 0.55, 0.8, 1.15], female: [0.1, 0.2, 0.35, 0.5, 0.7],
  },
  'cable-pull-through': {
    label: 'Cable pull-through', slug: 'cable-pull-through',
    male: [0.25, 0.5, 0.75, 1.25, 1.75], female: [0.15, 0.35, 0.65, 1.0, 1.45],
  },
  'cable-reverse-fly': {
    label: 'Cable reverse fly', slug: 'cable-reverse-fly',
    male: [0.05, 0.1, 0.3, 0.5, 0.8], female: [0.05, 0.1, 0.2, 0.35, 0.5],
  },
  'close-grip-lat-pulldown': {
    label: 'Close-grip lat pulldown', slug: 'close-grip-lat-pulldown',
    male: [0.75, 1.0, 1.25, 1.5, 1.75], female: [0.4, 0.6, 0.8, 1.05, 1.3],
  },
  'face-pull': {
    label: 'Face pull', slug: 'face-pull',
    male: [0.2, 0.35, 0.6, 0.9, 1.25], female: [0.15, 0.3, 0.5, 0.75, 1.05],
  },
  'reverse-grip-lat-pulldown': {
    label: 'Reverse-grip lat pulldown', slug: 'reverse-grip-lat-pulldown',
    male: [0.5, 0.75, 1.25, 1.5, 2.0], female: [0.4, 0.6, 0.8, 1.1, 1.35],
  },
  'straight-arm-pulldown': {
    label: 'Straight-arm pulldown', slug: 'straight-arm-pulldown',
    male: [0.25, 0.4, 0.65, 1.0, 1.35], female: [0.15, 0.3, 0.45, 0.7, 0.95],
  },
  'tricep-rope-pushdown': {
    label: 'Tricep rope pushdown', slug: 'tricep-rope-pushdown',
    male: [0.2, 0.35, 0.6, 0.85, 1.15], female: [0.15, 0.25, 0.4, 0.6, 0.8],
  },
  'sled-leg-press': {
    label: 'Sled leg press', slug: 'sled-leg-press',
    male: [1.25, 2.0, 2.75, 4.0, 5.25], female: [0.75, 1.5, 2.25, 3.25, 4.5],
  },
  'leg-extension': {
    label: 'Leg extension', slug: 'leg-extension',
    male: [0.5, 1.0, 1.25, 1.75, 2.5], female: [0.25, 0.5, 1.0, 1.25, 1.75],
  },
  'seated-leg-curl': {
    label: 'Seated leg curl', slug: 'seated-leg-curl',
    male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.3, 0.5, 0.75, 1.05, 1.4],
  },
  'chest-press': {
    label: 'Machine chest press', slug: 'chest-press',
    male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.15, 0.35, 0.55, 0.85, 1.2],
  },
  'hack-squat': {
    label: 'Hack squat', slug: 'hack-squat',
    male: [0.75, 1.25, 2.0, 2.75, 3.75], female: [0.5, 0.75, 1.5, 2.25, 3.0],
  },
  'hip-abduction': {
    label: 'Hip abduction', slug: 'hip-abduction',
    male: [0.5, 0.75, 1.25, 1.75, 2.25], female: [0.5, 0.75, 1.0, 1.5, 2.0],
  },
  'hip-adduction': {
    label: 'Hip adduction', slug: 'hip-adduction',
    male: [0.5, 0.75, 1.25, 2.0, 2.5], female: [0.25, 0.75, 1.0, 1.5, 2.0],
  },
  'horizontal-leg-press': {
    label: 'Horizontal leg press', slug: 'horizontal-leg-press',
    male: [0.75, 1.5, 2.25, 3.25, 4.25], female: [0.5, 1.0, 1.75, 2.5, 3.25],
  },
  'lying-leg-curl': {
    label: 'Lying leg curl', slug: 'lying-leg-curl',
    male: [0.25, 0.5, 0.75, 1.25, 1.5], female: [0.25, 0.4, 0.6, 0.85, 1.1],
  },
  'machine-bicep-curl': {
    label: 'Machine bicep curl', slug: 'machine-bicep-curl',
    male: [0.3, 0.5, 0.7, 1.0, 1.35], female: [0.15, 0.25, 0.4, 0.6, 0.8],
  },
  'machine-calf-raise': {
    label: 'Machine calf raise', slug: 'machine-calf-raise',
    male: [0.5, 1.0, 1.75, 2.75, 3.75], female: [0.25, 0.75, 1.25, 2.25, 3.0],
  },
  'machine-chest-fly': {
    label: 'Machine chest fly', slug: 'machine-chest-fly',
    male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.2, 0.35, 0.6, 0.9, 1.2],
  },
  'machine-lateral-raise': {
    label: 'Machine lateral raise', slug: 'machine-lateral-raise',
    male: [0.3, 0.5, 0.75, 1.1, 1.45], female: [0.15, 0.25, 0.4, 0.6, 0.85],
  },
  'machine-reverse-fly': {
    label: 'Machine reverse fly', slug: 'machine-reverse-fly',
    male: [0.25, 0.5, 0.75, 1.25, 1.5], female: [0.15, 0.3, 0.45, 0.65, 0.9],
  },
  'machine-row': {
    label: 'Machine row', slug: 'machine-row',
    male: [0.5, 0.75, 1.25, 1.75, 2.5], female: [0.25, 0.5, 0.75, 1.25, 1.5],
  },
  'machine-shoulder-press': {
    label: 'Machine shoulder press', slug: 'machine-shoulder-press',
    male: [0.25, 0.5, 1.0, 1.5, 2.0], female: [0.1, 0.25, 0.5, 0.75, 1.05],
  },
  'seated-calf-raise': {
    label: 'Seated calf raise', slug: 'seated-calf-raise',
    male: [0.25, 0.75, 1.25, 1.75, 2.5], female: [0.25, 0.5, 1.0, 1.75, 2.25],
  },
  'seated-dip-machine': {
    label: 'Seated dip machine', slug: 'seated-dip-machine',
    male: [0.75, 1.0, 1.5, 2.0, 2.5], female: [0.5, 0.5, 1.0, 1.25, 1.5],
  },
  'smith-machine-bench-press': {
    label: 'Smith machine bench press', slug: 'smith-machine-bench-press',
    male: [0.5, 0.75, 1.25, 1.5, 2.0], female: [0.25, 0.45, 0.7, 1.0, 1.4],
  },
  'smith-machine-squat': {
    label: 'Smith machine squat', slug: 'smith-machine-squat',
    male: [0.75, 1.0, 1.5, 2.0, 2.75], female: [0.25, 0.5, 1.0, 1.5, 2.0],
  },
  'vertical-leg-press': {
    label: 'Vertical leg press', slug: 'vertical-leg-press',
    male: [1.0, 1.75, 2.75, 3.75, 5.0], female: [0.75, 1.25, 2.0, 3.0, 4.25],
  },
} as const

export const STRENGTH_COMPARISON_COUNT = Object.keys(STRENGTH_STANDARDS).length

export function standardsFor(lift: LiftId) {
  return lift in STRENGTH_STANDARDS ? STRENGTH_STANDARDS[lift as keyof typeof STRENGTH_STANDARDS] : null
}

export function strengthSource(lift: LiftId): string | null {
  const standard = standardsFor(lift)
  return standard ? `https://strengthlevel.com/strength-standards/${standard.slug}` : null
}

export interface StrengthComparison {
  ratio: number
  percentile: number
  boundary: 'below' | 'above' | null
  level: string
  next: { label: string, kg: number } | null
}

export function compareStrength(oneRmKg: number | null, bodyweightKg: number | null, lift: LiftId, sex: ComparisonSex | ''): StrengthComparison | null {
  const standard = standardsFor(lift)
  if (!standard || !sex || oneRmKg == null || bodyweightKg == null
    || !Number.isFinite(oneRmKg) || !Number.isFinite(bodyweightKg) || oneRmKg <= 0 || bodyweightKg < 30 || bodyweightKg > 300) return null
  const ratio = oneRmKg / bodyweightKg
  const thresholds = standard[sex]
  const first = thresholds[0]
  const last = thresholds[4]
  const nextIndex = thresholds.findIndex(value => ratio < value)
  const record = worldRecordRatio(lift, sex)
  const recordNext = record != null && ratio < record ? { label: 'World record', kg: record * bodyweightKg } : null
  const next = nextIndex < 0 ? recordNext : { label: STRENGTH_LEVELS[nextIndex]!.label, kg: thresholds[nextIndex]! * bodyweightKg }
  if (ratio < first) return { ratio, percentile: 5, boundary: 'below', level: 'Building a foundation', next }
  if (record != null && ratio >= record) {
    return { ratio, percentile: 100, boundary: ratio > record ? 'above' : null, level: 'World record', next: null }
  }
  if (ratio > last) {
    const density = densityFromRatios(thresholds, record)
    if (ratio >= density.end) return { ratio, percentile: 100, boundary: 'above', level: 'Elite', next }
    return { ratio, percentile: massLeftOf(density, ratio), boundary: null, level: 'Elite', next }
  }
  if (ratio === last) return { ratio, percentile: 95, boundary: null, level: 'Elite', next }
  const upper = thresholds.findIndex(value => value > ratio)
  const lower = upper - 1
  const lo = STRENGTH_LEVELS[lower]!
  const hi = STRENGTH_LEVELS[upper]!
  const span = thresholds[upper]! - thresholds[lower]!
  const fraction = span === 0 ? 1 : (ratio - thresholds[lower]!) / span
  return { ratio, percentile: lo.percentile + fraction * (hi.percentile - lo.percentile), boundary: null, level: lo.label, next }
}

/** Last named share is 99.9999%. Never 100%. */
const ELITE_SHARE_MAX_DECIMALS = 4

function ninesLabel(decimals: number): string {
  return `99.${'9'.repeat(decimals)}`
}

function ninesThreshold(decimals: number): number {
  return Number(ninesLabel(decimals))
}

function floorShare(percentile: number, decimals: number): string {
  const factor = 10 ** decimals
  const floored = Math.floor(percentile * factor + 1e-6) / factor
  return floored.toFixed(decimals).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

function formatTailShare(percentile: number): string {
  const cap = ninesThreshold(ELITE_SHARE_MAX_DECIMALS)
  if (percentile > cap + 1e-12) return `more than ${ninesLabel(ELITE_SHARE_MAX_DECIMALS)}%`
  if (percentile < 99.1 - 1e-12) return '99%'
  for (let decimals = 1; decimals <= ELITE_SHARE_MAX_DECIMALS; decimals++) {
    if (percentile < ninesThreshold(decimals) - 1e-12) return `${floorShare(percentile, decimals)}%`
  }
  return `${ninesLabel(ELITE_SHARE_MAX_DECIMALS)}%`
}

export function strongerThanShare(comparison: StrengthComparison): string {
  if (comparison.boundary === 'below') return 'fewer than 5%'
  if (comparison.level === 'World record') return comparison.boundary === 'above' ? 'the world record' : '100%'
  if (comparison.boundary === 'above' || comparison.percentile >= 100 - 1e-9) {
    return `more than ${ninesLabel(ELITE_SHARE_MAX_DECIMALS)}%`
  }
  const percentile = comparison.percentile
  // Past elite but still inside the first tail percent: keep the bound until 96 is earned.
  if (percentile > 95 && percentile < 96) return 'more than 95%'
  if (percentile >= 99) return formatTailShare(percentile)
  // Do not round across a level boundary the input has not reached.
  return `${Math.floor(percentile + 1e-9)}%`
}

export function percentileLabel(comparison: StrengthComparison): string {
  if (comparison.level === 'World record' && comparison.boundary === 'above') return 'You are past the world record'
  if (comparison.level === 'World record') return 'You are at the world record'
  return `You are stronger than ${strongerThanShare(comparison)} of lifters`
}

export type StrengthDensityKind = 'tail' | 'known'

export interface StrengthDensityBin {
  start: number
  end: number
  mass: number
  density: number
  dirac: boolean
  kind: StrengthDensityKind
}

export interface StrengthDensityAnchor {
  label: string
  percentile: number
  ratio: number
}

export interface StrengthDensity {
  bins: StrengthDensityBin[]
  anchors: StrengthDensityAnchor[]
  start: number
  end: number
  maxDensity: number
}

/** Piecewise-constant density implied by linear CDF interpolation of the published anchors.
 * The left tail is unpublished mass below beginner. The right end is the all-time raw
 * world-record ratio when one is sourced; otherwise an adjacent-bin-width tail.
 */
export function strengthDensity(lift: LiftId, sex: ComparisonSex | ''): StrengthDensity | null {
  if (!sex) return null
  const standard = standardsFor(lift)
  return standard ? densityFromRatios(standard[sex], worldRecordRatio(lift, sex)) : null
}

export function densityFromRatios(ratios: readonly number[], worldRecord: number | null = null): StrengthDensity {
  const anchors: StrengthDensityAnchor[] = STRENGTH_LEVELS.map((level, index) => ({
    label: level.label,
    percentile: level.percentile,
    ratio: ratios[index]!,
  }))
  const known: StrengthDensityBin[] = []
  for (let index = 0; index < STRENGTH_LEVELS.length - 1; index++) {
    const start = ratios[index]!
    const end = ratios[index + 1]!
    const width = end - start
    const mass = STRENGTH_LEVELS[index + 1]!.percentile - STRENGTH_LEVELS[index]!.percentile
    known.push({ start, end, mass, density: width > 0 ? mass / width : 0, dirac: width <= 0, kind: 'known' })
  }
  const finiteWidths = known.filter(bin => !bin.dirac).map(bin => bin.end - bin.start)
  const span = Math.max(0, ratios[ratios.length - 1]! - ratios[0]!)
  const fallback = finiteWidths.length
    ? finiteWidths.reduce((sum, width) => sum + width, 0) / finiteWidths.length
    : Math.max(span * 0.2, 0.1)
  const leftWidthHint = known[0]!.dirac ? fallback : known[0]!.end - known[0]!.start
  const rightWidth = known[known.length - 1]!.dirac ? fallback : known[known.length - 1]!.end - known[known.length - 1]!.start
  const firstRatio = ratios[0]!
  const lastRatio = ratios[ratios.length - 1]!
  const leftStart = Math.max(0, firstRatio - leftWidthHint)
  const leftWidth = firstRatio - leftStart
  const tailMass = STRENGTH_LEVELS[0].percentile
  const bins: StrengthDensityBin[] = []
  if (leftWidth > 1e-12) bins.push({ start: leftStart, end: firstRatio, mass: tailMass, density: tailMass / leftWidth, dirac: false, kind: 'tail' })
  else bins.push({ start: firstRatio, end: firstRatio, mass: tailMass, density: 0, dirac: true, kind: 'tail' })
  bins.push(...known)
  const tailMassRight = 100 - STRENGTH_LEVELS[STRENGTH_LEVELS.length - 1].percentile
  const record = worldRecord != null && worldRecord > lastRatio + 1e-9 ? worldRecord : null
  if (record) {
    const width = record - lastRatio
    bins.push({ start: lastRatio, end: record, mass: tailMassRight, density: width > 0 ? tailMassRight / width : 0, dirac: width <= 0, kind: 'known' })
    anchors.push({ label: 'World record', percentile: 100, ratio: record })
  }
  else {
    bins.push({ start: lastRatio, end: lastRatio + rightWidth, mass: tailMassRight, density: rightWidth > 0 ? tailMassRight / rightWidth : 0, dirac: rightWidth <= 0, kind: 'tail' })
  }
  const finiteDensities = bins.filter(bin => !bin.dirac).map(bin => bin.density)
  return { bins, anchors, start: bins[0]!.start, end: bins[bins.length - 1]!.end, maxDensity: Math.max(1e-6, ...finiteDensities) }
}

export function massLeftOf(density: StrengthDensity, ratio: number): number {
  let mass = 0
  for (const bin of density.bins) {
    if (bin.dirac) {
      if (ratio >= bin.start) mass += bin.mass
      continue
    }
    if (ratio <= bin.start) break
    if (ratio >= bin.end) {
      mass += bin.mass
      continue
    }
    mass += bin.mass * (ratio - bin.start) / (bin.end - bin.start)
    break
  }
  return mass
}

export function densityAt(density: StrengthDensity, ratio: number): number {
  let tail = 0
  let known = 0
  let hasKnown = false
  for (const bin of density.bins) {
    if (bin.dirac) {
      if (Math.abs(ratio - bin.start) > 1e-12) continue
      if (bin.kind === 'known') return density.maxDensity
      tail = density.maxDensity
      continue
    }
    if (ratio < bin.start - 1e-12 || ratio > bin.end + 1e-12) continue
    if (bin.kind === 'known') {
      known = bin.density
      hasKnown = true
    }
    else tail = bin.density
  }
  return hasKnown ? known : tail
}

export function densityMarkerRatio(comparison: StrengthComparison, density: StrengthDensity): number {
  if (comparison.boundary === 'below') return density.anchors[0]!.ratio
  if (comparison.boundary === 'above') return density.end
  return Math.min(density.end, Math.max(density.anchors[0]!.ratio, comparison.ratio))
}

const GAUSS_NORM = Math.sqrt(2 * Math.PI)

interface MixtureComponent { mu: number, sigma: number, mass: number }

/** One Gaussian per published bin so peak width follows the data, not a unit normal. */
function mixtureComponents(density: StrengthDensity): MixtureComponent[] {
  const range = Math.max(density.end - density.start, 1e-6)
  return density.bins.map(bin => {
    const width = bin.dirac ? 0 : bin.end - bin.start
    return {
      mu: bin.dirac ? bin.start : (bin.start + bin.end) / 2,
      sigma: Math.max(width * 0.62, range * 0.055, 1e-4),
      mass: bin.mass,
    }
  })
}

function mixtureDensityAt(ratio: number, components: MixtureComponent[]) {
  let value = 0
  for (const component of components) {
    const z = (ratio - component.mu) / component.sigma
    value += component.mass / (component.sigma * GAUSS_NORM) * Math.exp(-0.5 * z * z)
  }
  return value
}

export function smoothedDensityAt(density: StrengthDensity, ratio: number): number {
  return mixtureDensityAt(ratio, mixtureComponents(density))
}

export function sampleSmoothedDensity(density: StrengthDensity, count = 96): { ratio: number, density: number }[] {
  const components = mixtureComponents(density)
  const pad = (density.end - density.start) * 0.1
  const start = Math.max(0, density.start - pad)
  const end = density.end + pad
  const span = end - start
  if (span <= 0 || count < 2) return []
  return Array.from({ length: count }, (_, index) => {
    const ratio = start + span * index / (count - 1)
    return { ratio, density: mixtureDensityAt(ratio, components) }
  })
}
