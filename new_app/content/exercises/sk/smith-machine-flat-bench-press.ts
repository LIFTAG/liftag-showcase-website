import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'smith-machine-flat-bench-press',
  metaDescription:
    'Rovný bench press na Smithovom stroji: dráha osi, bezpečnostné dorazy a samostatné zaznamenávanie tlaku po koľajnici oproti benču s voľnou činkou v LIFTAG-u.',
  steps: [
    'Rovnú lavičku vycentruj tak, aby os klesala k stredu až spodnej časti hrudníka, nie ku krku. Dorazy nastav tesne pod miesto dotyku.',
    'Ľahni si s očami mierne pred os, chodidlá polož pevne a nastav lopatky. Odisti os otočením zápästí.',
    'Kontrolovane spusti činku na hrudník. Koľajnica ti nedovolí tlačiť dozadu k stojanu ako voľná os; túto dráhu musíš ovládať.',
    'Vytlač do stabilného uzamknutia a zámerne znovu zaisti. Neodrážaj od hrudníka ani od bezpečnostných dorazov.',
  ],
  mistakes: [
    {
      title: 'Lavička je príliš vpredu',
      body: 'Ak os dopadá na krk, posuň lavičku, kým sa dotyk nebude diať v strede hrudníka. Koľajnica zlému nastaveniu neodpustí.',
    },
    {
      title: 'Zaznamenávanie ako bench press s veľkou činkou',
      body: 'Chýba balancovanie aj tlak dozadu. Iná dráha znamená iný pohyb aj osobný rekord. Použi tento identifikátor.',
    },
    {
      title: 'Bezpečnostné dorazy, lebo háky „tam sú“',
      body: 'Háky slúžia na vybratie osi zo stojana. Dorazy slúžia pri zlyhaní. Nastav ich.',
    },
    {
      title: 'Lakte v 90°, lebo koľajnica pôsobí bezpečne',
      body: 'Lakte mierne pritiahni, aby predlaktia zostali pod osou. Pevná dráha nie je dôvod odhodiť ramená.',
    },
  ],
  variations: [
    {
      slug: 'barbell-bench-press',
      name: 'Bench press s veľkou činkou',
      note: 'Voľná os. Cvik, ktorý väčšina ľudí myslí pod slovom bench.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Rovný bench press s jednoručkami',
      note: 'Nezávislé rukoväte, dlhší rozsah a často šetrnejší k ramenám.',
    },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na hrudník na stroji',
      note: 'Sediaci alebo zaklonený tlak bez koľajnice.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press s úzkym úchopom',
      note: 'Užší tlak s voľnou osou, ak je cieľom triceps.',
    },
  ],
  progressions: [
    'Klik alebo tlak na hrudník na stroji, kým je úplný rozsah poctivý.',
    'Ľahký Smith s pauzou na hrudníku a nastavenými dorazmi.',
    'Pracovné série pri RPE 7–8. Záťaž pridaj, keď miesto dotyku nikdy necestuje.',
    'Bench press s voľnou osou, keď chceš odobrať os zo stojana, nie iba tlačiť ťažšiu koľajnicu.',
  ],
  programming:
    'Tlakový objem, keď cvičíš sám alebo je voľná lavička obsadená: 3–5 sérií po 5–10 opakovaní. Rekord na Smithovi nie je rekord v benči s veľkou činkou. Ak odhadované 1RM v LIFTAG-u vyskočí po prechode z voľnej osi na koľajnicu, zmiešal si identifikátory.',
  equipmentAlternatives: [
    {
      slug: 'barbell-bench-press',
      name: 'Bench press s veľkou činkou',
      note: 'Predvolená voľba, keď máš voľnú lavičku a dopomoc.',
    },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na hrudník na stroji',
      note: 'Vedená dráha bez koľajnice, stále tlak bez potreby dopomoci.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Rovný bench press s jednoručkami',
      note: 'Náhrada, ak dráha Smithovho stroja dráždi ramená.',
    },
  ],
  faqs: [
    {
      question: 'Prenesie sa Smith bench press na bench s voľnou osou?',
      answer:
        'Tlakový vzorec je podobný, no nároky na stabilizáciu nie. Smith použi na objem alebo samostatný tréning a prácu s voľnou osou nechaj vo vlastnom grafe, ak je to cvik, na ktorom ti záleží.',
    },
  ],
  relatedSlugs: [
    'barbell-bench-press',
    'flat-dumbbell-bench-press',
    'machine-chest-press',
    'close-grip-bench-press',
  ],
} satisfies ExerciseOverlay
