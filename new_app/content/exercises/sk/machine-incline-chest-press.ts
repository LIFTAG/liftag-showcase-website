import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-incline-chest-press',
  metaDescription:
    'Šikmý tlak na hrudník na stroji: výška sedadla, dráha rukovätí a samostatné zaznamenávanie tlaku na hornú časť hrudníka v LIFTAG.',
  steps: [
    'Nastav sedadlo tak, aby rukoväte začínali vo výške hornej časti hrudníka alebo kľúčnych kostí. Ak je príliš nízko, na stroji vykonávaš skôr plochý tlak v inej polohe.',
    'Pevne zapri chodidlá, panvu aj hornú časť chrbta pritlač k podložke a uchop rukoväte tak, aby zápästia zostali nad predlaktiami.',
    'Zatlač do mierneho vystretia lakťov bez toho, aby sa ramená dvíhali k ušiam. Kontakt s podložkou je tvoja opora — nestrácaj ho.',
    'Vráť rukoväte dovtedy, kým cítiš natiahnutie hornej časti hrudníka, nie až kým závažia narazia alebo lakte klesnú za trup.',
    'Ak sa ramená stroja pohybujú nezávisle, dokonči obe strany naraz. Zaostávajúcu stranu si poznač, namiesto toho, aby si z jednej rukoväte urobil samostatný cvik.',
  ],
  mistakes: [
    {
      title: 'Sedadlo nastavené ako pri plochom tlaku',
      body: 'Rukoväte vo výške bradaviek na šikmom ráme vytvárajú len horšiu verziu plochého tlaku. Zdvihni sedadlo, kým dráha nebude zodpovedať kľúčnym kostiam.',
    },
    {
      title: 'Lakte idú príliš dozadu a ramená strácajú oporu',
      body: 'Stroj ti to dovolí. Excentrickú fázu zastav, keď sú paže v jednej línii s trupom, nie až za ním.',
    },
    {
      title: 'Zaznamenávaš cvik ako tlak na hrudník na stroji',
      body: 'Iný uhol znamená inú záťaž a iný graf. Naskenuj štítok na tomto ráme — LIFTAG má otvoriť samostatný cvik pre šikmý tlak.',
    },
    {
      title: 'Odraz závaží od dorazov',
      body: 'Natiahnutie je súčasť práce. Ak potrebuješ odraz, uber kotúč.',
    },
  ],
  variations: [
    {
      slug: 'barbell-incline-bench-press',
      name: 'Šikmý bench press s veľkou činkou',
      note: 'Umožní väčšiu záťaž, no vyžaduje viac nastavovania a pri ťažkých sériách sparingpartnera.',
    },
    {
      slug: 'incline-dumbbell-press',
      name: 'Šikmý tlak s jednoručkami',
      note: 'Jednoručky pracujú nezávisle a ponúkajú dlhší rozsah pri rovnakom príbehu uhla.',
    },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na hrudník na stroji',
      note: 'Plochá verzia tohto rámu. Udržuj tieto cviky oddelene.',
    },
    {
      slug: 'smith-machine-incline-press',
      name: 'Šikmý tlak na Smithovom stroji',
      note: 'Pevná dráha činky, keď v posilňovni nie je šikmý tlakový stroj.',
    },
  ],
  progressions: [
    'Ľahká záťaž, celý rozsah, dvojsekundové spúšťanie a žiadny odraz.',
    'Pracovné série po 8–12 opakovaní s rovnakou polohou sedadla každý týždeň.',
    'Pred zvýšením záťaže pridaj pauzu približne jeden palec nad hrudníkom.',
    'Keď bude dráha na stroji automatická, prejdi na šikmé jednoručky alebo veľkú činku.',
  ],
  programming:
    'Použi ho ako hlavný tlak v tréningu zameranom na hornú časť hrudníka alebo ako druhý tlak po plochom variante. Vykonaj 3–4 série po 8–12 opakovaní. V partnerskej posilňovni má QR alebo NFC štítok na tomto ráme otvoriť tento cvik — ak otvorí tlak na hrudník na stroji, záznam už skresľuje realitu. Ak stroje v posilňovni nemajú označené polohy, poznač si otvor sedadla.',
  equipmentAlternatives: [
    {
      slug: 'incline-dumbbell-press',
      name: 'Šikmý tlak s jednoručkami',
      note: 'Predvolená náhrada, keď dráha stroja nesedí tvojim ramenám.',
    },
    {
      slug: 'low-to-high-cable-fly',
      name: 'Rozpažovanie na kladkách zdola nahor',
      note: 'Izolačný objem s rovnakou líniou ťahu.',
    },
  ],
  faqs: [
    {
      question: 'Je šikmý tlak na hrudník na stroji rovnako dobrý ako šikmý tlak s veľkou činkou?',
      answer:
        'Je to verzia, ktorú môžeš zaťažiť bez sparingpartnera a bez vyberania činky zo stojana. Záťaže sa veľkej činke nebudú rovnať, preto má tento cvik vlastný záznam v LIFTAG. Ak dráha stroja pôsobí ako tlak prednými deltami, zníž sedadlo alebo prejdi na jednoručky.',
    },
  ],
  relatedSlugs: [
    'barbell-incline-bench-press',
    'incline-dumbbell-press',
    'machine-chest-press',
    'pec-deck-flys',
  ],
} satisfies ExerciseOverlay
