import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'conventional-deadlift',
  metaDescription: 'Conventional deadlift: setup, common mistakes, and how to log pulls, PRs, and variations in LIFTAG without mixing sumo or RDL numbers.',
  steps: [
    'Stand with the bar over mid-foot, shins close, and the grip just outside the legs.',
    'Hinge down, set the back, and pull the slack out of the bar before it leaves the floor.',
    'Push the floor away. The bar stays close. Hips and shoulders rise together.',
    'Lock out by standing tall — squeeze the glutes, do not lean back into a fake lockout.',
    'Lower under control. Reset every rep if you are training the start; touch-and-go only if the program says so.',
  ],
  mistakes: [
    { title: 'Jerking the bar before the slack is gone', body: 'The plates clank, the bar jumps, the back rounds. Pull the slack, then pull the weight.' },
    { title: 'Hips shooting up first', body: 'That is a stiff-leg from the floor. Keep the chest and hips moving as one until the bar passes the knee.' },
    { title: 'Logging conventional, sumo, and RDL as one lift', body: 'They are different PRs. LIFTAG has separate slugs. Use them or the chart lies to you in week six.' },
    { title: 'Straps on every warm-up', body: 'Save straps for the top sets if grip is not the limiter you are training.' },
  ],
  variations: [
    { slug: 'sumo-deadlift', name: 'Sumo deadlift', note: 'Wider stance, more hips and quads, shorter range for many lifters.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Neutral handles, easier on the back, still a heavy pull.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hinge emphasis, no floor start.' },
    { slug: 'rack-pull', name: 'Rack pull', note: 'Partial range for overload or when the floor start is not the priority.' },
  ],
  progressions: [
    'Romanian deadlift and kettlebell deadlift until the hinge is automatic.',
    'Conventional pulls from the floor with a reset every rep.',
    'Add load when the start stays tight for all work sets.',
    'Deficit or paused-at-knee work if the floor is the weak point.',
  ],
  programming: 'Deadlifts pay for themselves in recovery. Most lifters want one heavy pull day and one lighter hinge day. Log every work set and the rest — three to five minutes is normal. If LIFTAG shows a PR that came from a bounce or a hitch, add a note so you do not chase it next week.',
  equipmentAlternatives: [
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Best swap when conventional bothers the low back.' },
    { slug: 'dumbbell-deadlift', name: 'Dumbbell deadlift', note: 'Home-gym or travel substitute.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell RDL', note: 'Keep the hinge if you are deloading the floor pull.' },
  ],
  relatedSlugs: [
    'sumo-deadlift',
    'trap-bar-deadlift',
    'barbell-romanian-deadlift-rdl',
    'barbell-back-squat',
    'barbell-power-clean',
  ],
} satisfies ExerciseOverlay
