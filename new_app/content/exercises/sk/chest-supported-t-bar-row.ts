import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chest-supported-t-bar-row',
  metaDescription:
    'T-bar príťah s oporou hrudníka: výška podložky, dráha lakťov a ťažký príťah v deň, keď je driek už unavený.',
  steps: [
    'Nastav podložku tak, aby sa o ňu opierala hrudná kosť, nie hrdlo, a aby si na rukoväte dosiahol vystretými pažami. Chodidlá polož na plošinu.',
    'Uchop rukoväte, spevni stred tela, prilep hrudník k podložke a ťahaj k spodnej časti hrudníka alebo hornej časti brucha lakťami dozadu.',
    'Lopatky nechaj stiahnuť bez krčenia ramien k ušiam. Ak sa záťaž rozhojdáva, hore na chvíľu zastav.',
    'Spúšťaj do plného pohodlného dosahu. Paže predĺž, no hrudník nechaj na podložke.',
  ],
  mistakes: [
    {
      title: 'Odlepenie hrudníka pri dokončovaní',
      body: 'Z príťahu sa stane nepodporený príťah s horšou pákou. Zníž záťaž.',
    },
    {
      title: 'Odraz záťaže',
      body: 'Ak kotúče narazia a odrazia sa, spodok príťahu sa neuskutočnil. Posledné dva centimetre kontroluj.',
    },
    {
      title: 'Podložka tak vysoko, že sa dotýka hrdlo',
      body: 'Na podložke má byť hrudná kosť. Opora o hrdlo zmení každé opakovanie na boj a krčenie ramien.',
    },
    {
      title: 'Zapisovanie ako T-bar alebo veslovanie v sede',
      body: 'Oporu máš inú, preto je iný aj rekord. Keď používaš stanicu s podložkou na hrudník, zachovaj tento cvik.',
    },
  ],
  variations: [
    {
      slug: 't-bar-row',
      name: 'T-bar príťah',
      note: 'Bez podložky, preto potrebuješ predklon a poctivo zvládneš zvyčajne menšiu záťaž.',
    },
    {
      slug: 'machine-seated-row',
      name: 'Veslovanie v sede na stroji',
      note: 'Rovnaký zámer na zásobníku stroja, často s inou rukoväťou.',
    },
    {
      slug: 'incline-dumbbell-row',
      name: 'Príťah jednoručiek na šikmej lavičke',
      note: 'Opora hrudníka so samostatnými rukami.',
    },
    {
      slug: 'wide-grip-machine-seated-row',
      name: 'Veslovanie v sede na stroji širokým úchopom',
      note: 'Lakte idú širšie a viac pracuje horná časť chrbta.',
    },
  ],
  progressions: [
    'Veslovanie v sede na stroji alebo príťah jednoručiek na šikmej lavičke na osvojenie pokojného trupu.',
    'T-bar príťah s rukoväťou, pri ktorej zápästia zostanú v pohodlí.',
    'Záťaž pridaj až vtedy, keď hrudník zostane dole vo všetkých pracovných sériách.',
    'Pauzované opakovania alebo širšiu rukoväť použi, keď sa vrchol príťahu stráca.',
  ],
  programming:
    'Zaraď ho ako hlavný príťah v deň, keď mŕtvy ťah už zaťažil vzpriamovače chrbtice: 3–4 série po 8–12. Často naložíš viac než pri príťahu s veľkou činkou, pretože predklon preberá podložka. Toto číslo neporovnávaj s t-bar-row.',
  faqs: [
    {
      question: 'Užšie alebo širšie rukoväte?',
      answer:
        'Užšia neutrálna rukoväť zvyčajne viac zapojí latissimy. Široká s lakťami von viac zasiahne rombické svaly a zadné delty. Jednu vyber ako predvolenú a druhú zapisuj do poznámky, aby LIFTAG nemiešal dva cviky.',
    },
  ],
  relatedSlugs: ['t-bar-row', 'machine-seated-row', 'incline-dumbbell-row', 'seated-cable-row'],
} satisfies ExerciseOverlay
