export interface MuscleHubCopy {
  slug: string
  name: string
  headline: string
  description: string
  intro: string
}

export const MUSCLE_HUBS: MuscleHubCopy[] = [
  {
    slug: 'chest',
    name: 'Chest',
    headline: 'Chest exercises.',
    description: 'Chest exercises in the LIFTAG library: bench press, flyes, dips, and machine presses, with setup cues, muscles worked, and how to log every set.',
    intro: 'Horizontal pressing, flyes, and dips. LIFTAG maps each chest lift to the machines that actually host it so a tap or scan opens the right movement, not a generic “chest press.”',
  },
  {
    slug: 'back',
    name: 'Back',
    headline: 'Back exercises.',
    description: 'Back exercises in the LIFTAG library: rows, pulldowns, pull-ups, and deadlift variations, with setup cues and how to log them.',
    intro: 'Vertical pulls, horizontal rows, and hinges. The catalog keeps pull-ups next to lat pulldowns and chest-supported rows next to barbell rows so you can swap hardware without losing the log.',
  },
  {
    slug: 'shoulders',
    name: 'Shoulders',
    headline: 'Shoulder exercises.',
    description: 'Shoulder exercises in the LIFTAG library: overhead presses, laterals, and rear-delt work, with setup cues and how to log them.',
    intro: 'Presses for the front delts, laterals for the sides, face pulls and reverse flyes for the rears. Log them as separate lifts so volume per head does not collapse into one “shoulders” bucket.',
  },
  {
    slug: 'biceps',
    name: 'Biceps',
    headline: 'Biceps exercises.',
    description: 'Biceps exercises in the LIFTAG library: curls, hammer curls, and preacher variations, with setup cues and how to log them.',
    intro: 'Curls of every grip and bench angle. LIFTAG treats them as their own lifts so you can see whether the bar curl is stalling while hammer curls keep moving.',
  },
  {
    slug: 'triceps',
    name: 'Triceps',
    headline: 'Triceps exercises.',
    description: 'Triceps exercises in the LIFTAG library: pushdowns, skullcrushers, close-grip presses, and dips, with setup cues and how to log them.',
    intro: 'Extensions, pushdowns, and close-grip pressing. The library splits them so close-grip bench does not hide inside “bench press” when you review triceps volume.',
  },
  {
    slug: 'forearms',
    name: 'Forearms',
    headline: 'Forearm exercises.',
    description: 'Forearm and grip exercises in the LIFTAG library: wrist curls, farmer carries, and hangs, with setup cues and how to log them.',
    intro: 'Direct grip and wrist work. Most pulling already loads the forearms; these lifts exist so you can add dedicated volume without guessing from pull-up logs.',
  },
  {
    slug: 'quadriceps',
    name: 'Quadriceps',
    headline: 'Quad exercises.',
    description: 'Quad exercises in the LIFTAG library: squats, lunges, leg press, and extensions, with setup cues and how to log them.',
    intro: 'Squats, split squats, presses, and extensions. LIFTAG keeps barbell back squat separate from hack squat and leg press so the log matches the machine you actually used.',
  },
  {
    slug: 'hamstrings',
    name: 'Hamstrings',
    headline: 'Hamstring exercises.',
    description: 'Hamstring exercises in the LIFTAG library: RDLs, leg curls, and good mornings, with setup cues and how to log them.',
    intro: 'Hinges and curls. Romanian deadlifts, lying curls, and seated curls are different enough that they get their own rows in the log.',
  },
  {
    slug: 'calves',
    name: 'Calves',
    headline: 'Calf exercises.',
    description: 'Calf exercises in the LIFTAG library: standing and seated raises, with setup cues and how to log them.',
    intro: 'Standing raises load the gastrocnemius; seated raises bias the soleus. The library keeps both, because mixing them in one “calf raise” row wrecks the progression.',
  },
  {
    slug: 'glutes',
    name: 'Glutes',
    headline: 'Glute exercises.',
    description: 'Glute exercises in the LIFTAG library: hip thrusts, kickbacks, and bridges, with setup cues and how to log them.',
    intro: 'Thrusts, bridges, and abduction work. Squats and deadlifts already train glutes; these lifts exist when you want a dedicated glute session you can actually review.',
  },
  {
    slug: 'abs',
    name: 'Abs',
    headline: 'Ab exercises.',
    description: 'Ab and core exercises in the LIFTAG library: crunches, raises, planks, and Pallof presses, with setup cues and how to log them.',
    intro: 'Flexion, anti-rotation, and carries. Timed holds and rep-based raises log differently in LIFTAG, so plank and hanging leg raise do not share a row.',
  },
  {
    slug: 'cardio',
    name: 'Cardio',
    headline: 'Cardio machines.',
    description: 'Cardio in the LIFTAG library: treadmill, bike, rower, skierg, and jumps, with setup cues and how to log time or calories.',
    intro: 'Machines and bodyweight conditioning. LIFTAG logs these as time or calories instead of weight × reps, so a rower session does not look like a missed bench day.',
  },
]

const HUB_BY_SLUG = new Map(MUSCLE_HUBS.map(hub => [hub.slug, hub]))

export function musclePath(slug: string): string {
  return `/muscles/${slug}`
}

export function muscleHub(slug: string | null | undefined): MuscleHubCopy | null {
  if (!slug) return null
  return HUB_BY_SLUG.get(slug) ?? null
}

export function isMuscleSlug(slug: string): boolean {
  return HUB_BY_SLUG.has(slug)
}
