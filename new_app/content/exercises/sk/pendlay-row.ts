import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pendlay-row',
  metaDescription:
    'Pendlay príťah: zastavenie osi na podlahe, trup takmer rovnobežne s podlahou a dôvod, prečo nejde o príťah v predklone v LIFTAG-u.',
  steps: [
    'Použi kotúče plnej veľkosti alebo podložky, aby bola os v takej výške, na ktorú dosiahneš s vystretým chrbtom. Predkloň sa, kým nebude trup takmer vodorovne.',
    'Uchop os nadhmatom, spevni stred tela a z úplného zastavenia ju pritiahni k spodnej časti hrudníka alebo hornej časti brucha. Ťahaj rýchlo, ale neodrážaj.',
    'Pod kontrolou vráť os na podlahu a nechaj ju ustáliť. Znovu nastav dych aj chrbát pred ďalším opakovaním.',
    'Trup zostáva na mieste. Ak sa pri dokončení musíš postaviť, je to na Pendlay príliš ťažké.',
  ],
  mistakes: [
    {
      title: 'Odraz kotúčov',
      body: 'Odraz je príťah v predklone zo zeme bez zastavenia. Os musí úplne stáť, inak ide o iný cvik.',
    },
    {
      title: 'Zdvihanie hrudníka pri odlepení osi',
      body: 'To je zle spevnený mŕtvy ťah. Zostaň nad osou a pritiahni ju k sebe.',
    },
    {
      title: 'Zaznamenávanie Pendlay príťahu ako príťahu s veľkou činkou v predklone',
      body: 'Iný začiatok znamená iný osobný rekord. Použi tento identifikátor, aby čísla v šiestom týždni stále niečo znamenali.',
    },
    {
      title: 'Trhnutie z uvoľnenej polohy ramien',
      body: 'Najprv nastav široké chrbtové svaly, potom ťahaj. Voľný vis a prudké trhnutie je problém pre driek, nie budovanie chrbta.',
    },
  ],
  variations: [
    {
      slug: 'barbell-bent-over-row',
      name: 'Príťah veľkej činky v predklone',
      note: 'Začína z visu, je viac času pod napätím a trup býva o niečo vyššie.',
    },
    {
      slug: 't-bar-row',
      name: 'Príťah na T-osi',
      note: 'Oblúková dráha, užší úchop a stále príťah v predklone.',
    },
    {
      slug: 'inverted-row',
      name: 'Obrátený príťah',
      note: 'Variant s vlastnou hmotnosťou, kým sa učíš vodorovný ťah.',
    },
  ],
  progressions: [
    'Príťahy v predklone, pri ktorých dokážeš zostať tri sekundy nehybný vo vise.',
    'Pendlay príťahy z podložiek, ak ťa začiatok z podlahy núti zaokrúhľovať chrbát.',
    'Pracovné série po 3–6 opakovaní z úplného zastavenia.',
    'Záťaž pridaj až vtedy, keď každé opakovanie začína aj končí na podlahe bez odrazu.',
  ],
  programming:
    'Zaobchádzaj s ním ako s ťahovým cvikom, nie ako s pumpovacou sériou: 3–5 sérií po 3–6 opakovaní s dlhším oddychom. Ako druhý pohyb sa hodí v deň mŕtveho ťahu. Nenaháňaj tu čísla príťahu v predklone; reset zámerne znižuje záťaž.',
  faqs: [
    {
      question: 'Môžem robiť opakovania bez zastavenia, ak program píše iba „príťahy“?',
      answer:
        'Ak je deň Pendlay príťahu, os na podlahe úplne zastaví. Opakovania bez zastavenia patria k príťahu veľkej činky v predklone. Ak ich v jednom týždni miešaš, štýl uveď v poznámke série.',
    },
  ],
  relatedSlugs: ['barbell-bent-over-row', 't-bar-row', 'conventional-deadlift', 'seated-cable-row'],
} satisfies ExerciseOverlay
