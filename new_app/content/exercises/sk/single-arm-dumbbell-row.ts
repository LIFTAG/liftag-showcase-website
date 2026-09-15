import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'single-arm-dumbbell-row',
  metaDescription:
    'Príťah jednoručky jednou rukou: nastavenie na lavičke, dráha lakťa k boku a príťah bez pretáčania trupu.',
  steps: [
    'Polož jednu ruku a koleno na lavičku na rovnakej strane, prípadne zaujmi rozkročený postoj a voľnou rukou sa opri o stojan. Jednoručka visí pod pracujúcim ramenom.',
    'Boky aj rebrá drž kolmo. Krk predĺž. Opora slúži na to, aby si mohol ťahať, nie aby si sa pretáčal okolo osi.',
    'Ťahaj lakeť smerom k boku alebo dolným rebrám. Zastav, keď je nadlaktie v línii s trupom — vyššia poloha je väčšinou iba pokrčenie ramena.',
    'Spúšťaj pomaly a nechaj lopatku dosiahnuť dopredu. Toto natiahnutie je začiatok ďalšieho opakovania.',
    'Na oboch stranách urob rovnaký počet opakovaní. Ak je jedna strana o dve opakovania pozadu, tá určuje záťaž.',
  ],
  mistakes: [
    {
      title: 'Otáčaš trup otvorene do strany',
      body: 'Mierna rotácia je iná variácia. Pri tomto cviku smeruje pupok k lavičke.',
    },
    {
      title: 'Vyťahuješ jednoručku k pazuche s pokrčeným ramenom',
      body: 'Lakeť smeruje k boku, nie k uchu. Ak preberá prácu trapéz, hore na chvíľu zastav s ramenom stiahnutým nadol.',
    },
    {
      title: 'Začínaš s jednoručkou už pri rebrách',
      body: 'Ak vynecháš vis, vynecháš aj latissimus. Použi dosť vysokú lavičku, aby jednoručka mohla voľne visieť nad podlahou.',
    },
    {
      title: 'Zaznamenávaš iba silnejšiu stranu',
      body: 'Obe paže tvoria jednu sériu. Ak urobíš 10 a 7 opakovaní, zapíš 7 alebo ich zaznamenaj ako samostatné série s poznámkou o strane.',
    },
  ],
  variations: [
    {
      slug: 'incline-dumbbell-row',
      name: 'Príťah jednoručiek na šikmej lavičke',
      note: 'Hrudník je na šikmej lavičke, pracujú obe paže a rotácia nie je možná.',
    },
    {
      slug: 'barbell-bent-over-row',
      name: 'Príťahy veľkej činky v predklone',
      note: 'Obojručný cvik s väčšou záťažou a vyššími nárokmi na kríže.',
    },
    {
      slug: 'seated-cable-row',
      name: 'Príťahy v sede na kladke',
      note: 'Napätie stroja, keď chceš rovnomerne zaťažiť obe strany bez lavičky.',
    },
    {
      slug: 'renegade-row',
      name: 'Renegade row',
      note: 'Verzia v planku s omnoho menšou záťažou a väčšími nárokmi na odolávanie rotácii.',
    },
  ],
  progressions: [
    'Obrátené príťahy alebo príťahy na stroji, kým je predklon na jednu ruku samozrejmý.',
    'Ľahká jednoručka, voľný vis, žiadne pretáčanie a trojsekundové spúšťanie.',
    'Pracovné série po 8–12 opakovaní. Jednoručku vyberá slabšia strana.',
    'Ak limitom nie sú latissimy, ale kríže, použi príťahy na šikmej lavičke s oporou hrudníka.',
  ],
  programming:
    'Doplnkový, no stále zaťažiteľný príťah: 3–4 série po 8–12 po hlavnom cviku na chrbát. V ten istý deň nekombinuj ťažké príťahy s veľkou činkou aj ťažké sťahovanie kladky, ak na to nemáš dostatočnú regeneráciu. Zapisuj hmotnosť jednoručky — „ťažká jednoručka“ nie je progresia.',
  relatedSlugs: ['incline-dumbbell-row', 'barbell-bent-over-row', 'machine-seated-row', 'seated-cable-row'],
} satisfies ExerciseOverlay
