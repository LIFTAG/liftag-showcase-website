import type { GymQrPlatform } from '~/utils/gymQrComparison'
export interface GymQrTableCopy {
  aspect: string
  cells: Record<GymQrPlatform, string>
  glance?: { bestFor: string; gymCost: string; weakSpot: string; unique: string }
}
export const en: Record<string, GymQrTableCopy> = {}
export const sk: Record<string, GymQrTableCopy> = {
  'gym-cost': {
    aspect: 'Cena pre posilňovňu',
    cells: {
      LIFTAG:
        'Základ navždy zadarmo. Zápis, nastavenie strojov aj prehľad na tvorbu NFC a QR kódov sú bezplatné; fyzické štítky si kupuje posilňovňa.',
      Liftd: '39 / 79 / 143 / 239 dolárov mesačne pre 20 / 50 / 100 / 200 strojov. Nad to individuálna cena.',
      ScanLiftLog:
        '30 / 60 / 99 / 150 dolárov mesačne podľa počtu strojov. Jednorazové zriadenie 99 dolárov, pri záväzku aspoň 3 mesiacov odpustené.',
      RepTag:
        '150 eur mesačne bez DPH za celú platformu. Mesačné zrušenie, 30-dňová garancia vrátenia peňazí.',
    },
  },
  tags: {
    aspect: 'Fyzické štítky',
    cells: {
      LIFTAG: 'Posilňovňa si kúpi NFC štítky a QR nálepky a spravuje ich v bezplatnom prehľade.',
      Liftd: 'Posilňovňa vytlačí QR kódy z prehľadu. NFC je podporované, štítky dodáva posilňovňa.',
      ScanLiftLog: 'Značkové QR štítky sa vytvoria a odošlú po zaslaní zoznamu vybavenia.',
      RepTag: 'QR nálepky alebo magnety možno vytlačiť či objednať. NFC súprava nie je k dispozícii.',
    },
  },
  access: {
    aspect: 'Spôsob otvorenia',
    cells: {
      LIFTAG: 'NFC + QR ako základ. Dotyk je rýchly, sken univerzálna záloha.',
      Liftd: 'QR je hlavná cesta, NFC voliteľné.',
      ScanLiftLog: 'Iba QR. Prehliadač alebo PWA pridaná na plochu.',
      RepTag: 'Iba QR. Základ funguje v prehliadači, zapisovanie v aplikácii.',
    },
  },
  videos: {
    aspect: 'Videá trénerov',
    cells: {
      LIFTAG: 'Posilňovňa môže natočiť vlastných trénerov na konkrétnych strojoch a pripojiť videá k štítku.',
      Liftd: 'Fotky a história konkrétneho stroja, bez zamerania na videá trénerov z posilňovne.',
      ScanLiftLog: 'Štítky konkrétnych strojov a propagačné správy posilňovne.',
      RepTag: 'Videá cvikov, nemecké pokyny, bezpečnostné poznámky a hlásenie porúch.',
    },
  },
  map: {
    aspect: 'Objavovanie posilňovní',
    cells: {
      LIFTAG: 'Overený zápis v mape LIFTAG je súčasťou bezplatného jadra.',
      Liftd:
        'História vo viacerých posilňovniach a cestovný Gym Passport, nie verejná mapa na získavanie členov.',
      ScanLiftLog: 'Štítky podľa lokality, bez spoločnej mapy.',
      RepTag: 'Mapa štúdií v aplikácii a partnerský zápis na reptag.app v platenej platforme.',
    },
  },
  tracking: {
    aspect: 'Hĺbka sledovania',
    cells: {
      LIFTAG:
        'Rekordy, odhadované 1RM, trendy objemu za 4 až 52 týždňov, delenie podľa svalov, RPE, série, zostavy a časovač pauzy.',
      Liftd: 'Rýchle zapisovanie stroja, posledný tréning, návrhy váhy cez AI, programy, rekordy a časovač.',
      ScanLiftLog: 'Série, opakovania, váha, poznámky a kardio štatistiky s históriou viazanou na stroj.',
      RepTag: 'Zápis série a váhy do 10 sekúnd, posledná váha, rekordy, história a pokrok naprieč štúdiami.',
    },
  },
  standalone: {
    aspect: 'Funguje bez štítkov',
    cells: {
      LIFTAG: 'Plnohodnotný denník v každej posilňovni. Štítky iba urýchľujú partnerské priestory.',
      Liftd: 'Plná aplikácia pre členov, sken však potrebuje posilňovňu s kódmi Liftd.',
      ScanLiftLog: 'Skúsenosť stojí na štítkoch danej posilňovne; história je predvolene v zariadení.',
      RepTag: 'Bezplatná aplikácia funguje naprieč posilňovňami, sken je urýchlenie na mieste.',
    },
  },
  app: {
    aspect: 'Vyžaduje aplikáciu',
    cells: {
      LIFTAG: 'Áno, pre kompletné zapisovanie, históriu a pokrok.',
      Liftd: 'Áno. Aplikácia pre členov je bezplatná.',
      ScanLiftLog: 'Nie. Sken kamerou otvorí prehliadač; plocha je voliteľná.',
      RepTag: 'Voliteľné. Web pokryje cvik, video a hlásenie porúch; aplikácia pridá zapisovanie.',
    },
  },
  analytics: {
    aspect: 'Analytika posilňovne',
    cells: {
      LIFTAG: 'Základný prehľad so zápisom, strojmi a používaním. Hlbšie firemné nástroje sú voliteľné.',
      Liftd: 'Najhlbšia v kategórii: využitie, špička, pokrytie svalov, tiché odchody a návrat členov.',
      ScanLiftLog: 'Skeny, používanie strojov podľa času, zapojenie a „mŕtve“ stroje.',
      RepTag: 'Živé skeny, najčastejšie zariadenia, aktivita a hlásenia porúch.',
    },
  },
  privacy: {
    aspect: 'Súkromie',
    cells: {
      LIFTAG: 'Bežný cloudový účet. Základné sledovanie potrebuje prihlásenie.',
      Liftd: 'Cloudový účet. Posilňovňa vidí súhrnné používanie, osobné údaje sú na súhlas.',
      ScanLiftLog: 'Predvolene v zariadení, bez účtu. Export a import pri výmene telefónu.',
      RepTag: 'Cloudová platforma. Servery sú vo Frankfurte.',
    },
  },
  community: {
    aspect: 'Tréneri a komunita',
    cells: {
      LIFTAG:
        'Profily trénerov, zdieľanie plánov a pokrok klientov zo skutočnej histórie sérií. Komunitný kanál nie je hlavný cieľ.',
      Liftd: 'Odporúčania AI a opätovné zapojenie členov, bez chatu trénerov či rebríčka.',
      ScanLiftLog: 'Sledovanie pravidelnosti, odznaky a propagačné správy v skenovaní.',
      RepTag: 'Chat trénerov, kalendár rezervácií, plány, výzvy, rebríčky, novinky a ankety.',
    },
  },
  setup: {
    aspect: 'Nastavenie',
    cells: {
      LIFTAG: 'Katalóg strojov a prehľad na tvorbu NFC a QR kódov. Fyzické štítky kúpi a nalepí posilňovňa.',
      Liftd: 'Pridanie strojov z katalógu alebo ručne, potom tlač QR kódov.',
      ScanLiftLog: 'Posilňovňa pošle zoznam vybavenia a štítky sa vytvoria a odošlú.',
      RepTag: 'Nastavenie za popoludnie. QR kódy možno vytlačiť alebo objednať ako magnety a nálepky.',
    },
  },
}

export const skGlance = {
  LIFTAG: {
    bestFor: 'Posilňovne, ktoré chcú štítky a zapisovanie bez mesačného poplatku',
    gymCost: 'Základ navždy zadarmo. Prehľad na tvorbu NFC + QR; nálepky si kúpiš sám.',
    weakSpot: 'Analytika odchodov majiteľov je zatiaľ jednoduchšia než v Liftd',
    unique: 'Jediná platforma s bezplatným jadrom pre posilňovňu vrátane tvorby NFC + QR',
  },
  Liftd: {
    bestFor: 'Posilňovne, ktoré kupujú analytiku využitia a udržania členov',
    gymCost: '39 až 239 dolárov mesačne podľa počtu strojov. Nad 200 individuálna cena.',
    weakSpot: 'Štítky dodáva alebo tlačí posilňovňa. Po skúšobnej dobe sa platí.',
    unique: 'Najhlbšia analytika využitia, tichých odchodov a opätovného zapojenia',
  },
  ScanLiftLog: {
    bestFor: 'Posilňovne, kde členovia skenujú bez aplikácie a účtu',
    gymCost: '30 až 150 dolárov mesačne podľa strojov plus zriadenie 99 dolárov.',
    weakSpot: 'Iba QR. Zapisovanie ostáva viazané na stroj, nie plnohodnotný denník.',
    unique: 'Najmenšie trenie: prehliadač alebo PWA, údaje predvolene v zariadení',
  },
  RepTag: {
    bestFor: 'Štúdiá DACH, ktoré chcú nástroje trénera, komunitu a plán podlažia',
    gymCost: '150 eur mesačne bez DPH. Počas pilotu zľavy pre prvých používateľov.',
    weakSpot: 'Platená platforma s prioritou QR, stále v pilotnej prevádzke.',
    unique: 'Kombinácia webu a aplikácie s chatom trénerov, rezerváciami a mapou štúdia',
  },
} as const
