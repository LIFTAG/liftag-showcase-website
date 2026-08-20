import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-romanian-deadlift',
  metaDescription: 'Dumbbell Romanian deadlift: hinge depth, knee angle, and how to log DB RDLs separately from barbell RDLs in LIFTAG.',
  steps: [
    'Stand tall with dumbbells in front of the thighs. Soften the knees and lock that angle in.',
    'Push the hips back. The bells graze the thighs, then the shins. Spine stays long.',
    'Stop when the hamstrings run out — often mid-shin — not because the bells can still travel toward the floor.',
    'Drive the hips forward to stand. Squeeze the glutes; do not shrug the weights.',
  ],
  mistakes: [
    { title: 'Squatting the dumbbells down', body: 'If the knees travel forward, you lost the hinge. Push the hips, not the knees.' },
    { title: 'Chasing the floor every rep', body: 'Dumbbells can pass the feet. That extra range is often a rounded back, not extra hamstring. Stop at tension.' },
    { title: 'Logging it as a barbell RDL', body: 'Different implement, different PR. Keep this slug even if the hinge looks the same on film.' },
    { title: 'Letting the bells drift forward', body: 'If they float out in front of the toes, the back takes the set. Keep them close enough to brush clothing.' },
  ],
  variations: [
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'More load, bar in front of the legs, the usual progression.' },
    { slug: 'barbell-good-morning', name: 'Barbell good morning', note: 'Bar on the back, even more hinge, much lighter.' },
    { slug: 'smith-machine-romanian-deadlift', name: 'Smith machine Romanian deadlift', note: 'Fixed path when you want a hinge without balancing two bells.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'Knee-flexion hamstring work instead of a hinge.' },
  ],
  progressions: [
    'Hip hinge with a dowel along the spine.',
    'Light dumbbells to a mid-shin stop you can repeat.',
    'Add load when the back angle never changes across the set.',
    'Pause at the stretch, or a small deficit, once the bells already clear the floor easily.',
  ],
  programming: 'Primary dumbbell hinge: 3–4 sets of 6–12. It will sit well below your barbell RDL — that is expected. If LIFTAG is plotting these on the barbell chart, you logged the wrong lift. Travel and home-gym sessions belong here, not on conventional deadlift.',
  equipmentAlternatives: [
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell RDL', note: 'Use the bar when the dumbbells run out of weight.' },
    { slug: 'kettlebell-deadlift', name: 'Kettlebell deadlift', note: 'Floor-start hinge if you only have bells and want a deadlift, not an RDL.' },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'barbell-good-morning',
    'nordic-hamstring-curl',
    'conventional-deadlift',
  ],
} satisfies ExerciseOverlay
