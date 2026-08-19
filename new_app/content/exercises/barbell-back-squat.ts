import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-back-squat',
  metaDescription: 'Barbell back squat: high-bar and low-bar setup, common mistakes, and how to log depth, load, and PRs in LIFTAG.',
  steps: [
    'Set the bar on the upper traps (high-bar) or rear delts (low-bar). Walk out with three steps and brace before you descend.',
    'Break at the hips and knees together. Keep the mid-foot under the bar and the chest from collapsing forward.',
    'Sit to a depth you can repeat — hip crease below the knee for most lifters — then drive up without the knees caving in.',
    'Stand tall, re-brace, and reset the breath before the next rep. Rack with control, not a stumble.',
  ],
  mistakes: [
    { title: 'Cutting depth as the load climbs', body: 'If week-four squats are two inches higher than week one, the PR is fake. Film a side set or pick a consistent target.' },
    { title: 'Bouncing out of the hole with a loose brace', body: 'Elastic rebound is fine. A collapsed torso is not. Air and abs first, then the bounce.' },
    { title: 'Walking out forever', body: 'Three steps. A long walk-out is fatigue you are not logging.' },
    { title: 'Mixing high-bar and low-bar in one progression', body: 'They are different leverages. Pick one as the default LIFTAG lift and treat the other as a variation note or a separate exercise if you program both.' },
  ],
  variations: [
    { slug: 'barbell-front-squat', name: 'Barbell front squat', note: 'Upright torso, more quads, brutal on the upper back.' },
    { slug: 'smith-machine-squat', name: 'Smith machine squat', note: 'Fixed path when you want squat volume without a walk-out.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Quad-biased, no balance tax.' },
    { slug: 'dumbbell-goblet-squat', name: 'Dumbbell goblet squat', note: 'The teaching squat and a useful high-rep finisher.' },
  ],
  progressions: [
    'Bodyweight or goblet squat to a consistent depth.',
    'Empty-bar back squat with a three-second descent.',
    'Working sets at RPE 7–8. Add load when every rep hits the same depth.',
    'Pause squats or front squats when the hole gets sticky.',
  ],
  programming: 'Two to four hard squat sessions per week is plenty for most lifters once recovery is honest. Log rest — five minutes between heavy sets is normal. LIFTAG estimated 1RM will jump around if you mix paused reps and bounce reps in the same week; keep the style consistent on the main day.',
  equipmentAlternatives: [
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Keep quad volume when the back is too fried to squat.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Closest machine pattern to a back squat for most gyms.' },
    { slug: 'dumbbell-bulgarian-split-squat', name: 'Dumbbell Bulgarian split squat', note: 'Single-leg option that still loads the quads hard.' },
  ],
  relatedSlugs: [
    'barbell-front-squat',
    'standard-leg-press',
    'machine-hack-squat',
    'barbell-romanian-deadlift-rdl',
  ],
} satisfies ExerciseOverlay
