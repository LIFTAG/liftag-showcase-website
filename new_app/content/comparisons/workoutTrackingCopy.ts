export interface WorkoutRowCopy {
  platforms: string
  free: string
  bestFor: string
  weakSpot: string
  unique: string
}
export interface WorkoutCardCopy {
  oneLine: string
  goodAt: string[]
  notGoodAt: string[]
  pickWhen: string
}
export const skRows: Record<string, WorkoutRowCopy> = {
  LIFTAG: {
    platforms: 'iOS, Android',
    free: 'Základ navždy zadarmo; voliteľné prémiové prehľady',
    bestFor: 'Cvičenci v posilňovni s NFC/QR štítkami na strojoch',
    weakSpot: 'Sieť partnerských posilňovní sa ešte rozrastá',
    unique: 'Dotyk alebo sken stroja otvorí presný cvik s videom nastavenia',
  },
  Strong: {
    platforms: 'iOS, Android',
    free: 'Bezplatná verzia (3 zostavy), platené Pro',
    bestFor: 'Minimalistické, rýchle zapisovanie sérií',
    weakSpot: 'Bez prepojenia s posilňovňou, viac zostáv je platených',
    unique: 'Prehľadné zapisovanie sérií na jednej obrazovke',
  },
  Hevy: {
    platforms: 'iOS, Android',
    free: 'Štedrá bezplatná verzia, platené Pro',
    bestFor: 'Sociálny kanál a univerzálne zapisovanie',
    weakSpot: 'Bez prepojenia so strojmi, analytika je za predplatným',
    unique: 'Vstavaná komunita a zdieľanie programov',
  },
  FitNotes: {
    platforms: 'Iba Android',
    free: 'Úplne zadarmo',
    bestFor: 'Jednoduché zapisovanie bez zbytočností na Androide',
    weakSpot: 'Bez iOS, prepojenia so strojmi a modernejšieho rozhrania',
    unique: 'Úplne zadarmo, bez reklám a zamknutých platených funkcií',
  },
  JEFIT: {
    platforms: 'iOS, Android',
    free: 'Zadarmo s reklamami, platené Elite',
    bestFor: 'Obrovská knižnica cvikov',
    weakSpot: 'Veľa reklám v bezplatnej verzii, staršie UX',
    unique: 'Jedna z najväčších databáz cvikov',
  },
  Boostcamp: {
    platforms: 'iOS, Android',
    free: 'Väčšina programov zadarmo, prémiová verzia',
    bestFor: 'Hotové programy konkrétnych trénerov',
    weakSpot: 'Zapisovanie je druhoradé oproti programom',
    unique: 'Bezplatné programy známych trénerov',
  },
  MacroFactor: {
    platforms: 'iOS, Android',
    free: 'Platené predplatné',
    bestFor: 'Výživa a tréning v jednej aplikácii',
    weakSpot: 'Sledovanie tréningu je novšie než u konkurencie',
    unique: 'Adaptívne sledovanie makier s dôrazom na výskum',
  },
  Fitbod: {
    platforms: 'iOS, Android',
    free: 'Obmedzená skúšobná verzia, platené predplatné',
    bestFor: 'Cvičenci, ktorí chcú, aby aplikácia tvorila tréning',
    weakSpot: 'Algoritmické plány nemusia zodpovedať nárokom systematického tréningu',
    unique: 'Návrh ďalšieho tréningu podľa predchádzajúcich',
  },
}
export const skCards: Record<string, WorkoutCardCopy> = {
  LIFTAG: {
    oneLine: 'Tréningový denník postavený priamo okolo posilňovne.',
    goodAt: [
      'Priloženie telefónu k NFC štítku alebo sken QR kódu na stroji otvorí presný cvik',
      'Trvalý zápis hmotnosti, opakovaní, prestávok a voliteľného RPE s časom každej série',
      'Časovač prestávky sa spustí automaticky po zapísaní série',
      'Osobné rekordy a odhad 1RM pre každý cvik',
      'Grafy objemu, frekvencie a progresu pre jednotlivé cviky aj svalové partie',
      'Profily trénerov, zdieľanie plánov a mapa posilňovní',
      'Bezplatne na iOS a Androide bez povinného predplatného',
    ],
    notGoodAt: [
      'Partnerská sieť sa stále rozrastá; NFC a QR fungujú iba vo fitkách s nainštalovanými štítkami LIFTAG',
      'Sociálny kanál nie je hlavný cieľ; v tomto je silnejší Hevy',
    ],
    pickWhen:
      'Trénuješ vo fitku a chceš otvárať denník priamo zo stroja. LIFTAG sa hodí aj vtedy, keď hľadáš bezplatnú aplikáciu, ktorá analytiku progresu nezamyká za predplatné.',
  },
  Strong: {
    oneLine: 'Pôvodný minimalistický zapisovač sérií.',
    goodAt: [
      'Rýchle zapisovanie na jednej obrazovke',
      'Čisté rozhranie bez rozptyľovania',
      'Apple Watch a Wear OS',
    ],
    notGoodAt: [
      'Bezplatná verzia má len niekoľko zostáv',
      'Bez prepojenia so strojmi a posilňovňou',
      'Bez vrstvy pre trénerov',
    ],
    pickWhen: 'Chceš čo najrýchlejší ručný denník a neprekáža ti platená verzia po prekročení limitu zostáv.',
  },
  Hevy: {
    oneLine: 'Zapisovanie sérií so sociálnou vrstvou.',
    goodAt: [
      'Štedrejšia bezplatná verzia než Strong',
      'Komunitný feed a zdieľanie programov',
      'Milióny stiahnutí dosiahnuté organickým rastom',
    ],
    notGoodAt: ['Bez prepojenia so strojmi', 'Pokročilá analytika je v Hevy Pro'],
    pickWhen: 'Chceš zapisovanie s komunitou a nepotrebuješ prepojenie so strojmi.',
  },
  FitNotes: {
    oneLine: 'Obľúbený bezplatný denník pre Android.',
    goodAt: [
      'Úplne zadarmo, bez reklám, predplatného a povinnej registrácie',
      'Spoľahlivý zápis série, opakovaní a váhy',
      'História v kalendári',
    ],
    notGoodAt: ['Iba Android', 'Bez iOS, synchronizácie a prepojenia s posilňovňou', 'Zastaranejší vzhľad'],
    pickWhen: 'Používaš Android, chceš nulové náklady a potrebuješ iba základný zápis a históriu.',
  },
  JEFIT: {
    oneLine: 'Veľká knižnica cvikov so starším rozhraním.',
    goodAt: ['Veľmi veľká databáza cvikov', 'Komunitné programy a šablóny'],
    notGoodAt: ['Veľa reklám v bezplatnej verzii', 'Staršie UX'],
    pickWhen: 'Chceš rozsiahlu knižnicu cvikov a neprekáža ti platená verzia bez reklám.',
  },
  Boostcamp: {
    oneLine: 'Bezplatné programy skutočných trénerov v jednej aplikácii.',
    goodAt: [
      'Bezplatné programy konkrétnych silových trénerov',
      'Vyniká pri tréningu podľa hotového programu, menej pri tvorbe vlastného',
    ],
    notGoodAt: ['Zapisovanie je druhoradé', 'Bez prepojenia so strojmi'],
    pickWhen: 'Chceš nasledovať program konkrétneho trénera a zapisovanie je až druhé.',
  },
  MacroFactor: {
    oneLine: 'Aplikácia zameraná na výživu s rastúcim modulom tréningu.',
    goodAt: ['Dôraz na výskum', 'Silné sledovanie výživy a makier'],
    notGoodAt: ['Novšie sledovanie tréningu', 'Platené predplatné'],
    pickWhen:
      'Chceš výživu aj tréning v jednej platenej aplikácii a záleží ti na značke, ktorá kladie dôraz na vedecké podklady.',
  },
  Fitbod: {
    oneLine: 'Aplikácia, ktorá ti vyberie tréning.',
    goodAt: ['Tvorba ďalšieho tréningu algoritmom', 'Pomoc, keď nechceš plánovať'],
    notGoodAt: [
      'Automaticky zostavené plány málokedy zodpovedajú nárokom systematického tréningu',
      'Platené predplatné',
    ],
    pickWhen: 'Chceš, aby plánovala aplikácia za teba.',
  },
}
