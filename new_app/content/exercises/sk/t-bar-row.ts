import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 't-bar-row',
  metaDescription:
    'Príťah na T-osi: nastavenie landmine, priestor pre kotúče a samostatné zaznamenávanie oproti príťahu na T-osi s oporou hrudníka v LIFTAG-u.',
  steps: [
    'Jeden koniec osi upevni do landmine alebo stabilného rohu. Voľný koniec nalož. Postav sa obkročmo a na objímku nasaď úzky adaptér na príťahy.',
    'Predkloň sa so spevneným trupom, kým budú ruky vystreté. Kotúče majú hore prejsť popri hrudníku; ak 20 kg bumpery blokujú dráhu, použi menšie kotúče alebo vyvýšený postoj.',
    'Pritiahni adaptér k spodnej časti hrudníka alebo hornej časti brucha. Lakte nasledujú rukoväť a uhol trupu sa nemení.',
    'Spusť, kým budú ruky vystreté. Kotúče nepúšťaj do podlahy a neodrážaj ďalšie opakovanie.',
  ],
  mistakes: [
    {
      title: 'Postavenie sa, keď záťaž stúpa',
      body: 'Je to rovnaké podvádzanie ako pri príťahu s veľkou činkou. Ak sa predklon narovnáva, uber jeden kotúč.',
    },
    {
      title: 'Posúvajúci sa roh namiesto landmine',
      body: 'Ak sa posúva kotva, posúva sa aj dráha osi. Použi objímku alebo skutočnú landmine.',
    },
    {
      title: 'Zaznamenávanie príťahu s oporou hrudníka sem',
      body: 'Opora je iný cvik a iný osobný rekord. Príťah na T-osi s oporou hrudníka má vlastný identifikátor.',
    },
    {
      title: 'Príliš veľké kotúče skracujú rozsah',
      body: 'Os cestuje po oblúku. Ak 20-ky narazia do hrudníka priskoro, použi 10-ky alebo sa postav na blok, aby lakte mohli dokončiť pohyb.',
    },
  ],
  variations: [
    {
      slug: 'chest-supported-t-bar-row',
      name: 'Príťah na T-osi s oporou hrudníka',
      note: 'Rovnaký typ stanice, podložka preberie predklon.',
    },
    {
      slug: 'landmine-row',
      name: 'Landmine príťah',
      note: 'Rovnaká os, často iný adaptér a o niečo vzpriamenejší variant.',
    },
    {
      slug: 'barbell-bent-over-row',
      name: 'Príťah veľkej činky v predklone',
      note: 'Rovná os, väčšia voľnosť a väčšia záťaž pre kríže.',
    },
    {
      slug: 'machine-seated-row',
      name: 'Príťah v sede na stroji',
      note: 'Keď chceš ťahať bez držania predklonu.',
    },
  ],
  progressions: [
    'Príťah s oporou hrudníka alebo na stroji, kým sa dráha lakťov nestane automatickou.',
    'Ľahká T-os s malými kotúčmi a nehybným predklonom.',
    'Pracovné série po 6–10 opakovaní. Kotúč pridaj, keď posledné opakovanie stále končí na rovnakom mieste.',
    'Neutrálny a široký úchop ber ako variáciu, nie nový rekord; adaptér uveď v poznámke.',
  ],
  programming:
    'Základný cvik na budovanie chrbta: 3–4 série po 6–12 opakovaní. Väčšine cvičiacich dovolí naložiť viac než príťah s jednoručkou. Zaznamenávaj záťaž kotúčov, nie „plus os“, a každý týždeň rovnakým spôsobom, aby sa graf dal porovnať.',
  relatedSlugs: ['chest-supported-t-bar-row', 'landmine-row', 'barbell-bent-over-row', 'machine-seated-row'],
} satisfies ExerciseOverlay
