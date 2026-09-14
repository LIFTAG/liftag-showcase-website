export interface PricingFaq {
  question: string
  answer: string
}
export interface PricingFact {
  term: string
  value: string
}
export interface PricingComparisonCopy {
  freeTier: string
  paidTier: string
}
export interface PricingCopy {
  factsLead: string
  facts: PricingFact[]
  includedLead: string
  included: string[]
  includedTail: string
  willNotLead: string
  willNot: string[]
  willNotTail: string
  compareLead: string
  tableLabel: string
  columns: { app: string; free: string; paid: string; price: string; source: string }
  compareTail: string
  gymsHeading: string
  gymsBody: string
  trainersBody: string
  faqs: PricingFaq[]
  sourcesLead: string
  sourcesTail: string
  comparison: Record<'LIFTAG' | 'Hevy' | 'Strong', PricingComparisonCopy>
}

export const en: PricingCopy = {
  factsLead: 'Every row below is quoteable on its own, and none of it is a projection or a launch plan.',
  facts: [
    { term: 'Price to download', value: 'Free' },
    { term: 'Platforms', value: 'iOS and Android' },
    { term: 'Core workout tracking', value: 'Free forever' },
    { term: 'In-app purchases today', value: 'None listed on the App Store or Google Play as of {checked}' },
    { term: 'Premium tier', value: 'Optional, and unpriced: no published figure exists yet' },
    { term: 'Ads on the free log', value: 'None' },
    { term: 'NFC and QR machine tags', value: 'Optional. The app is a complete tracker without them.' },
    {
      term: 'Cost to a partner gym',
      value:
        'Listing, machine setup, and the dashboard to create NFC and QR codes are free forever. Gyms buy the physical tags and stickers themselves.',
    },
    { term: 'Cost to a trainer', value: 'Profile, discovery, and plan sharing are part of the free product' },
    { term: 'Languages', value: 'English and Slovak' },
    { term: 'Last verified', value: '{checked}' },
  ],
  includedLead:
    "Free tiers usually mean a trial, a routine cap, or a chart that stops three months back. LIFTAG's does not. This is the product, not a sample of it:",
  included: [
    'Set logging: weight, reps, duration, rest target, optional RPE.',
    'Rest timer that starts when you save a set.',
    'Personal records, duration PRs, and estimated 1RM per exercise.',
    'Progress charts for volume, best sets, streaks, and body-part split.',
    'Full workout history you can read set by set, by date or by body part.',
    'Routines, weekly plans, supersets, trisets, and circuits.',
    'The whole exercise library, plus custom exercises with your own photos or video.',
    'Gym and trainer discovery, including filters and gym detail pages.',
    'NFC tap and QR scan on machines at partner gyms.',
  ],
  includedTail:
    'Details on the tag half of that list live on NFC and QR gym tags, and the lifts themselves are public in the exercise library.',
  willNotLead:
    'LIFTAG premium is real as an intention and unpriced as a fact. There is no live paid SKU on the App Store or on Google Play, which means any figure on this page would be a guess dressed up as a price. So here is the honest version:',
  willNot: [
    'Core tracking is free forever. That is a commitment, not a promotion.',
    'Premium intelligence is planned as an optional layer on top of it.',
    'There is no published price, no announced date, and no trial to expire.',
  ],
  willNotTail:
    'If you are choosing a tracker partly on what it will cost you in a year, that uncertainty is a fair thing to weigh against us. It is also why this page carries a verification date instead of a marketing one.',
  compareLead:
    "Competitor figures are read off each vendor's own US App Store listing, opened on {checked}. Store pricing moves, varies by region, and varies by account, so the source column is the part that matters.",
  tableLabel: 'LIFTAG, Hevy, and Strong pricing compared',
  columns: { app: 'App', free: 'Free tier', paid: 'Paid tier', price: 'Price', source: 'Source' },
  compareTail:
    'Row by row on features rather than price: LIFTAG vs Hevy and LIFTAG vs Strong. The eight-app matrix is the 2026 tracker comparison.',
  gymsHeading: 'Gyms and trainers',
  gymsBody:
    'A partner gym pays nothing for the software that touches the floor: the dashboard to create and manage NFC tags and QR codes, machine setup, the gym listing, and the full member app are free forever. Physical NFC tags and QR stickers are not included; gyms buy those themselves. Advanced business tools are the optional layer there, on the same terms as premium is for lifters. The rollout itself is documented in the gym NFC tag rollout guide, and what other machine-tag platforms charge a gym per month is priced out on the best gym QR and NFC app guide.',
  trainersBody:
    'Trainers get a profile, discovery, and plan sharing inside the free product. Verification is an application, not a purchase.',
  faqs: [
    {
      question: 'How much does LIFTAG cost?',
      answer:
        'Nothing. LIFTAG is free to download on iOS and Android, and core workout tracking is free forever: logging sets, rest timer, PRs, estimated 1RM, and history. As of {checked} neither store listing shows any in-app purchase, so there is no paid tier to buy.',
    },
    {
      question: 'Is there a LIFTAG premium plan, and what does it cost?',
      answer:
        'Premium intelligence is described across this site as optional, and it has no published price, because there is no live paid SKU on either store. When a paid tier ships, this page carries the price and the date it was set.',
    },
    {
      question: 'Is the free tier limited by number of routines or history depth?',
      answer:
        'No. The free product is the whole logger: unlimited routines and plans, full history, PRs, estimated 1RM, and progress charts. That is the difference worth knowing when you compare it against a free tier that caps routines or truncates graph history.',
    },
    {
      question: 'Do I have to pay for the NFC or QR gym tags?',
      answer:
        'Lifters never pay for tags. For gyms, creating and managing NFC tags and QR codes is free in the dashboard, and the member app is free. The physical NFC tags and QR stickers are not included: gyms buy those themselves. Listing, machine setup, and the core dashboard stay free; advanced business tools are optional.',
    },
    {
      question: 'Are NFC tags and QR codes free?',
      answer:
        'The LIFTAG dashboard for creating and managing NFC tags and QR codes is free for partner gyms. The physical tags and stickers are purchased by the gym.',
    },
    {
      question: 'Does LIFTAG work if my gym has no tags?',
      answer:
        'Yes. Tags are an accelerator at partner gyms, not a requirement. Without them you pick the lift from the library and log it exactly like any other tracker, at no cost.',
    },
    {
      question: 'Is LIFTAG free because it sells my data?',
      answer:
        'Core tracking is free because the paid surface is meant to be optional intelligence on top of it, and because partner gyms are the growth channel rather than a paywall on the log. What each store listing declares about data collection is public on the App Store and Google Play pages linked at the bottom of this page.',
    },
  ],
  sourcesLead:
    "LIFTAG figures are our own and describe the product as shipped. Competitor figures were read off the vendor's own store listing on {checked}, not off a review site:",
  sourcesTail:
    'We ship one of the apps in that table, so read the pricing rows and the source links rather than the tone. Store prices change without warning; verify before you buy anything. Updated August 2026.',
  comparison: {
    LIFTAG: {
      freeTier:
        'Core tracking: set logging, rest timer, PRs, estimated 1RM, history, exercise library, gym and trainer discovery.',
      paidTier: 'Premium intelligence, optional',
    },
    Hevy: {
      freeTier: 'Free logging with a cap on saved routines, custom exercises, and graph history.',
      paidTier: 'Hevy Pro',
    },
    Strong: { freeTier: 'Unlimited saved workouts, capped at 3 custom routines.', paidTier: 'Strong PRO' },
  },
}

export const sk: PricingCopy = {
  factsLead: 'Každý riadok nižšie môžeš citovať samostatne a nejde o predpoveď ani plán uvedenia.',
  facts: [
    { term: 'Cena stiahnutia', value: 'Zadarmo' },
    { term: 'Platformy', value: 'iOS a Android' },
    { term: 'Základné zaznamenávanie tréningov', value: 'Navždy zadarmo' },
    {
      term: 'Nákupy v aplikácii dnes',
      value: 'V App Store ani Google Play nie je k {checked} uvedený žiadny',
    },
    { term: 'Prémiová úroveň', value: 'Voliteľná a bez stanovenej ceny: zatiaľ neexistuje zverejnená suma' },
    { term: 'Reklamy v bezplatnom zázname', value: 'Žiadne' },
    {
      term: 'NFC a QR štítky na strojoch',
      value: 'Voliteľné. Aplikácia je plnohodnotný tracker aj bez nich.',
    },
    {
      term: 'Cena pre partnerské fitko',
      value:
        'Profil, nastavenie strojov a nástroje na vytváranie NFC a QR kódov sú navždy zadarmo. Fyzické štítky a nálepky si fitká kupujú samy.',
    },
    {
      term: 'Cena pre trénera',
      value: 'Profil, vyhľadávanie a zdieľanie plánov sú súčasťou bezplatného produktu',
    },
    { term: 'Jazyky', value: 'Angličtina a slovenčina' },
    { term: 'Naposledy overené', value: '{checked}' },
  ],
  includedLead:
    'Bezplatné verzie často znamenajú skúšobné obdobie, limit rutín alebo graf, ktorý končí pred tromi mesiacmi. LIFTAG taká nie je. Toto je celý produkt, nie iba jeho ukážka:',
  included: [
    'Zaznamenávanie série: hmotnosť, opakovania, trvanie, cieľ odpočinku a voliteľné RPE.',
    'Časovač odpočinku, ktorý sa spustí po uložení série.',
    'Osobné rekordy, rekordy v trvaní a odhadované 1RM pre každý cvik.',
    'Grafy objemu, najlepších sérií, pravidelnosti a rozdelenia partií.',
    'Kompletná história tréningov po sériách, dátumoch aj partiách.',
    'Rutiny, týždenné plány, supersérie, trisérie a kruhové tréningy.',
    'Celá knižnica cvikov aj vlastné cviky s tvojimi fotkami či videom.',
    'Vyhľadávanie fitiek a trénerov vrátane filtrov a detailov fitiek.',
    'NFC ťuknutie a QR sken na strojoch v partnerských fitkách.',
  ],
  includedTail:
    'Podrobnosti o štítkoch nájdeš na stránke o NFC a QR štítkoch pre fitká a samotné cviky sú verejne dostupné v knižnici cvikov.',
  willNotLead:
    'Prémiové funkcie LIFTAG sú zámer, no ich cena je fakticky nestanovená. V App Store ani Google Play nie je aktívny platený produkt, takže akékoľvek číslo na tejto stránke by bol iba odhad vydávaný za cenu. Toto je poctivá verzia:',
  willNot: [
    'Základné zaznamenávanie je navždy zadarmo. Je to záväzok, nie akcia.',
    'Prémiová inteligencia je plánovaná ako voliteľná vrstva.',
    'Neexistuje zverejnená cena, oznámený dátum ani skúšobné obdobie, ktoré by vypršalo.',
  ],
  willNotTail:
    'Ak si tracker vyberáš aj podľa toho, koľko ťa bude stáť o rok, táto neistota je férový faktor. Preto stránka uvádza dátum overenia, nie marketingový dátum.',
  compareLead:
    'Údaje konkurencie sme prečítali z vlastných amerických záznamov v App Store, otvorených {checked}. Ceny sa menia podľa regiónu a účtu, preto je najdôležitejší stĺpec so zdrojom.',
  tableLabel: 'Porovnanie cien LIFTAG, Hevy a Strong',
  columns: {
    app: 'Aplikácia',
    free: 'Bezplatná verzia',
    paid: 'Platená verzia',
    price: 'Cena',
    source: 'Zdroj',
  },
  compareTail:
    'Porovnanie funkcií po riadkoch: LIFTAG vs Hevy a LIFTAG vs Strong. Maticu ôsmich aplikácií nájdeš v porovnaní trackerov na rok 2026.',
  gymsHeading: 'Fitká a tréneri',
  gymsBody:
    'Partnerské fitko neplatí za softvér, ktorý používa na ploche: dashboard na tvorbu a správu NFC štítkov a QR kódov, nastavenie strojov, profil fitka aj celú členskú aplikáciu má navždy zadarmo. Fyzické NFC štítky a QR nálepky nie sú súčasťou; fitko si ich kupuje samo. Pokročilé firemné nástroje sú voliteľnou vrstvou, rovnako ako prémium pre cvičiacich. Postup nasadenia opisuje návod na zavedenie NFC štítkov vo fitku a ceny iných platforiem pre štítky nájdeš v prehľade najlepšej QR a NFC aplikácie pre fitká.',
  trainersBody:
    'Tréneri získajú v bezplatnom produkte profil, vyhľadávanie a zdieľanie plánov. Overenie je žiadosť, nie nákup.',
  faqs: [
    {
      question: 'Koľko stojí LIFTAG?',
      answer:
        'Nič. LIFTAG je na stiahnutie v iOS aj Androide zadarmo a základné zaznamenávanie tréningov je navždy bezplatné: série, časovač odpočinku, PR, odhadované 1RM aj história. K {checked} žiadny obchod neuvádza nákup v aplikácii, takže niet čo kupovať ako platený program.',
    },
    {
      question: 'Existuje prémiový plán LIFTAG a koľko stojí?',
      answer:
        'Prémiová inteligencia je na tomto webe opísaná ako voliteľná a nemá zverejnenú cenu, pretože v žiadnom obchode nie je aktívny platený produkt. Keď platená úroveň príde, stránka uvedie jej cenu aj dátum.',
    },
    {
      question: 'Obmedzuje bezplatná verzia počet rutín alebo históriu?',
      answer:
        'Nie. Bezplatný produkt je celý zapisovač: neobmedzené rutiny a plány, úplná história, PR, odhadované 1RM a grafy pokroku. To je dôležitý rozdiel oproti bezplatnej verzii s limitom rutín alebo skrátenou históriou grafov.',
    },
    {
      question: 'Musím platiť za NFC alebo QR štítky vo fitku?',
      answer:
        'Cvičiaci za štítky neplatia. Fitko má tvorbu a správu NFC štítkov a QR kódov v dashboarde zadarmo a členská aplikácia je bezplatná. Fyzické štítky a nálepky nie sú v cene, fitko si ich kúpi samo.',
    },
    {
      question: 'Sú NFC štítky a QR kódy zadarmo?',
      answer:
        'Dashboard LIFTAG na tvorbu a správu NFC štítkov a QR kódov je pre partnerské fitká bezplatný. Fyzické štítky a nálepky kupuje fitko.',
    },
    {
      question: 'Funguje LIFTAG, aj keď moje fitko nemá štítky?',
      answer:
        'Áno. Štítky v partnerských fitkách urýchľujú začiatok, ale nie sú povinné. Bez nich vyberieš cvik z knižnice a zaznamenáš ho ako v každom inom trackeri, bez poplatku.',
    },
    {
      question: 'Je LIFTAG zadarmo preto, že predáva moje údaje?',
      answer:
        'Základné zaznamenávanie je bezplatné, pretože platená časť má byť voliteľnou inteligenciou nad ním a partnerské fitká sú rastovým kanálom, nie platobnou stenou pri záznamoch. Čo jednotlivé obchody uvádzajú o zbere údajov, je verejné na stránkach App Store a Google Play prepojených na konci stránky.',
    },
  ],
  sourcesLead:
    'Údaje LIFTAG sú naše a opisujú dodaný produkt. Údaje konkurencie sme čítali z vlastných záznamov v obchode k {checked}, nie z recenzného webu:',
  sourcesTail:
    'Jednu z aplikácií v tabuľke vydávame, preto si prečítaj riadky cien a zdroje, nie tón textu. Ceny v obchodoch sa môžu zmeniť bez upozornenia; pred nákupom ich over. Aktualizované v auguste 2026.',
  comparison: {
    LIFTAG: {
      freeTier:
        'Základné zaznamenávanie: série, časovač odpočinku, PR, odhadované 1RM, história, knižnica cvikov a vyhľadávanie fitiek a trénerov.',
      paidTier: 'Voliteľná prémiová inteligencia',
    },
    Hevy: {
      freeTier: 'Bezplatné zaznamenávanie s limitom uložených rutín, vlastných cvikov a histórie grafov.',
      paidTier: 'Hevy Pro',
    },
    Strong: { freeTier: 'Neobmedzené uložené tréningy, limit 3 vlastných rutín.', paidTier: 'Strong PRO' },
  },
}
