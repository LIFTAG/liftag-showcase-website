import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-hack-squat',
  metaDescription:
    'Hacken drep na stroji: opora chrbta, hĺbka a zaznamenávanie drepov na saniach oddelene od leg pressu a voľných drepov v LIFTAGu.',
  steps: [
    'Ramenné opierky si nasaď na ramená a chodidlá daj dostatočne dopredu, aby kolená dole sledovali stred chodidiel.',
    'Odisti sane a klesaj, kým boky nedosiahnu aspoň takú hĺbku ako drep, ktorý by si uznal v stojane.',
    'Vytlač sa hore bez odlepovania krížov od opierky. Zaisťuj sane rukami, nie nádejou.',
  ],
  mistakes: [
    {
      title: 'Chodidlá sú tak ďaleko, že z cviku vznikne tlak na sedacie svaly',
      body: 'Ak je to zámer, je to v poriadku. Ak chceš drep, posuň chodidlá bližšie.',
    },
    {
      title: 'Hacken drep zapisuješ ako zadný drep',
      body: 'Ide o inú dráhu aj iný osobný rekord. Zachovaj tento identifikátor.',
    },
  ],
  variations: [
    {
      slug: 'reverse-hack-squat',
      name: 'Obrátený hacken drep',
      note: 'Pri niektorých strojoch čelíš dovnútra a viac zapojíš zadný reťazec.',
    },
    {
      slug: 'standard-leg-press',
      name: 'Klasický leg press',
      note: 'Sane v sede namiesto postoja.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Zadný drep s veľkou činkou',
      note: 'Voľnovážová verzia pohybu.',
    },
  ],
  progressions: [
    'Ľahké hacken drepy do požadovanej hĺbky.',
    'Záťaž pridaj, keď sa kontakt s opierkou ani raz nestratí.',
    'Ak sa odrážaš, používaj pauzované opakovania.',
  ],
  programming:
    'Použi ho ako hlavný drep, keď je chrbát po veľkej činke unavený, alebo ako druhý drep v týždni: 3–4 série po 6–12 opakovaní. Štítok na saniach má otvoriť tento cvik, nie všeobecný „drep“.',
  relatedSlugs: ['standard-leg-press', 'barbell-back-squat', 'smith-machine-squat'],
} satisfies ExerciseOverlay
