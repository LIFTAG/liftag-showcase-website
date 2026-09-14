import type { OneRmExerciseId } from '~/utils/oneRepMaxExercises'

const skLabels: Record<OneRmExerciseId, string> = {
  bench: 'Bench s veľkou činkou',
  squat: 'Zadný drep s veľkou činkou',
  deadlift: 'Mŕtvy ťah s veľkou činkou',
  ohp: 'Striktný tlak nad hlavou',
  'incline-bench-press': 'Šikmý bench press',
  'close-grip-bench-press': 'Bench s úzkym úchopom',
  'front-squat': 'Predný drep',
  'sumo-deadlift': 'Sumo mŕtvy ťah',
  'romanian-deadlift': 'Rumunský mŕtvy ťah',
  'hex-bar-deadlift': 'Mŕtvy ťah s trap barom',
  'hip-thrust': 'Hip thrust',
  'bent-over-row': 'Príťah veľkej činky v predklone',
  'barbell-curl': 'Bicepsový zdvih s veľkou činkou',
  skullcrusher: 'Francúzsky tlak s veľkou činkou',
  'barbell-calf-raise': 'Výpony s veľkou činkou',
  'barbell-lunge': 'Výpad s veľkou činkou',
  'barbell-reverse-lunge': 'Spätný výpad s veľkou činkou',
  'barbell-shrug': 'Krčenie ramien s veľkou činkou',
  'tricep-extension': 'Extenzia tricepsu s veľkou činkou',
  'box-squat': 'Drep na box',
  'bulgarian-split-squat': 'Bulharský drep',
  clean: 'Premiestnenie',
  'clean-and-jerk': 'Nadhod',
  'clean-and-press': 'Premiestnenie a tlak',
  'decline-bench-press': 'Bench press na lavičke hlavou nadol',
  'ez-bar-curl': 'Bicepsový zdvih s EZ tyčou',
  'floor-press': 'Tlak z podlahy',
  'good-morning': 'Predklon s veľkou činkou',
  'hang-clean': 'Premiestnenie z visu',
  'military-press': 'Military press',
  'pendlay-row': 'Pendlayho príťah',
  'power-clean': 'Power clean',
  'power-snatch': 'Power snatch',
  'preacher-curl': 'Bicepsový zdvih na Scottovej lavičke',
  'push-press': 'Push press',
  'rack-pull': 'Mŕtvy ťah z racku',
  'reverse-barbell-curl': 'Obrátený bicepsový zdvih',
  'seated-shoulder-press': 'Tlak na ramená v sede',
  snatch: 'Trh',
  'stiff-leg-deadlift': 'Mŕtvy ťah s vystretými nohami',
  't-bar-row': 'T-bar príťah',
  'upright-row': 'Príťah k brade',
  'zercher-squat': 'Zercherov drep',
  'dumbbell-bench-press': 'Bench s jednoručkami',
  'incline-dumbbell-bench-press': 'Šikmý bench s jednoručkami',
  'dumbbell-shoulder-press': 'Tlak na ramená s jednoručkami',
  'dumbbell-row': 'Príťah jednoručky',
  'dumbbell-curl': 'Bicepsový zdvih s jednoručkami',
  'hammer-curl': 'Kladivový zdvih',
  'dumbbell-lateral-raise': 'Upažovanie s jednoručkami',
  'dumbbell-fly': 'Rozpažovanie s jednoručkami',
  'goblet-squat': 'Goblet drep',
  'arnold-press': 'Arnoldov tlak',
  'chest-supported-dumbbell-row': 'Príťah jednoručiek s oporou hrudníka',
  'dumbbell-concentration-curl': 'Koncentrovaný zdvih',
  'decline-dumbbell-bench-press': 'Tlaky s jednoručkami hlavou nadol',
  'dumbbell-bulgarian-split-squat': 'Bulharský drep s jednoručkami',
  'dumbbell-deadlift': 'Mŕtvy ťah s jednoručkami',
  'dumbbell-floor-press': 'Tlak jednoručiek z podlahy',
  'dumbbell-front-raise': 'Predpažovanie s jednoručkami',
  'dumbbell-lunge': 'Výpad s jednoručkami',
  'dumbbell-pullover': 'Pullover s jednoručkou',
  'dumbbell-reverse-fly': 'Obrátené rozpažovanie s jednoručkami',
  'dumbbell-romanian-deadlift': 'Rumunský mŕtvy ťah s jednoručkami',
  'dumbbell-shrug': 'Krčenie ramien s jednoručkami',
  'dumbbell-squat': 'Drep s jednoručkami',
  'dumbbell-tricep-extension': 'Extenzia tricepsu s jednoručkami',
  'dumbbell-tricep-kickback': 'Tricepsový kickback s jednoručkou',
  'incline-dumbbell-curl': 'Šikmý bicepsový zdvih s jednoručkami',
  'incline-dumbbell-fly': 'Šikmé rozpažovanie s jednoručkami',
  'seated-dumbbell-shoulder-press': 'Tlak na ramená s jednoručkami v sede',
  'lat-pulldown': 'Sťahovanie kladky',
  'seated-cable-row': 'Príťah kladky v sede',
  'tricep-pushdown': 'Stláčanie kladky na triceps',
  'cable-bicep-curl': 'Bicepsový zdvih na kladke',
  'cable-crunch': 'Skracovačky na kladke',
  'cable-fly': 'Rozpažovanie na kladke',
  'cable-lateral-raise': 'Upažovanie na kladke',
  'cable-overhead-tricep-extension': 'Extenzia tricepsu nad hlavou na kladke',
  'cable-pull-through': 'Cable pull-through',
  'cable-reverse-fly': 'Obrátené rozpažovanie na kladke',
  'close-grip-lat-pulldown': 'Sťahovanie kladky úzkym úchopom',
  'face-pull': 'Príťah kladky k tvári',
  'reverse-grip-lat-pulldown': 'Sťahovanie kladky podhmatom',
  'straight-arm-pulldown': 'Sťahovanie kladky s vystretými pažami',
  'tricep-rope-pushdown': 'Stláčanie lanovej kladky na triceps',
  'sled-leg-press': 'Leg press na saniach',
  'leg-extension': 'Predkopávanie',
  'seated-leg-curl': 'Zakopávanie v sede',
  'chest-press': 'Tlak na prsia na stroji',
  'hack-squat': 'Hacken drep',
  'hip-abduction': 'Roznožovanie na stroji',
  'hip-adduction': 'Znožovanie na stroji',
  'horizontal-leg-press': 'Vodorovný leg press',
  'lying-leg-curl': 'Zakopávanie v ľahu',
  'machine-bicep-curl': 'Bicepsový zdvih na stroji',
  'machine-calf-raise': 'Výpony na stroji',
  'machine-chest-fly': 'Rozpažovanie na stroji',
  'machine-lateral-raise': 'Upažovanie na stroji',
  'machine-reverse-fly': 'Obrátené rozpažovanie na stroji',
  'machine-row': 'Príťah na stroji',
  'machine-shoulder-press': 'Tlak na ramená na stroji',
  'seated-calf-raise': 'Výpony v sede',
  'seated-dip-machine': 'Dipy na stroji v sede',
  'smith-machine-bench-press': 'Bench press na Smithovom stroji',
  'smith-machine-squat': 'Drep na Smithovom stroji',
  'vertical-leg-press': 'Zvislý leg press',
  'pull-ups': 'Zhyby',
  'chin-ups': 'Zhyby podhmatom',
  dips: 'Dipy',
  other: 'Iný cvik · iba odhad',
}

const skGroups: Record<string, string> = {
  Barbell: 'Veľká činka',
  Dumbbell: 'Jednoručky',
  Cable: 'Kladka',
  Machine: 'Stroj',
  'Bodyweight · estimate only': 'Vlastná hmotnosť · iba odhad',
  Other: 'Iné',
}
const skFeatured: Partial<Record<OneRmExerciseId, string>> = {
  bench: 'Bench',
  squat: 'Drep',
  deadlift: 'Mŕtvy ťah',
  ohp: 'Tlak nad hlavou',
}

export function localizedExerciseLabel(id: OneRmExerciseId, label: string, locale: string) {
  return locale === 'sk' ? (skLabels[id] ?? label) : label
}

export function localizedExerciseGroup(group: string, locale: string) {
  return locale === 'sk' ? (skGroups[group] ?? group) : group
}

export function localizedFeaturedLabel(id: OneRmExerciseId, label: string, locale: string) {
  return locale === 'sk' ? (skFeatured[id] ?? label) : label
}

export function strengthLevelKey(label: string) {
  return (
    (
      {
        Beginner: 'beginner',
        Novice: 'novice',
        Intermediate: 'intermediate',
        Advanced: 'advanced',
        Elite: 'elite',
      } as Record<string, string>
    )[label] ?? null
  )
}

export function caveatMessageKey(lift: string) {
  return (
    ({ deadlift: 'caveatDeadlift', squat: 'caveatSquat', bench: 'caveatBench' } as Record<string, string>)[
      lift
    ] ?? null
  )
}
