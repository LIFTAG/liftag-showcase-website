export interface LocalCard {
  oneLine: string
  goodAt: string[]
  notGoodAt: string[]
  pickWhen: string
}
export const en: Record<string, LocalCard> = {}
export const sk: Record<string, LocalCard> = {
  LIFTAG: {
    oneLine: 'Jediná platforma s bezplatným jadrom NFC + QR, ktorá funguje aj ako plnohodnotný denník.',
    goodAt: [
      'Bezplatný základ pre posilňovne: zápis, stroje a prehľad na tvorbu NFC a QR kódov',
      'NFC + QR na každom stroji',
      'Videá trénerov natočené na konkrétnom stroji',
      'Rekordy, odhadované 1RM, trendy objemu, rozdelenie podľa svalových partií, RPE a pravidelnosť tréningov',
      'Overená mapa posilňovní',
      'Kompletný tréningový denník aj bez štítkov',
    ],
    notGoodAt: [
      'Liftd má zatiaľ hlbšiu analytiku odchodov a využitia',
      'ScanLiftLog a RepTag sú jednoduchšie, ak členovia nesmú inštalovať aplikáciu',
      'Sieť partnerských posilňovní sa ešte rozrastá',
    ],
    pickWhen:
      'Prevádzkuješ posilňovňu bez mesačného poplatku za NFC a QR alebo chceš denník, ktorý sa zrýchli po zavedení štítkov.',
  },
  Liftd: {
    oneLine: 'Voľba pre majiteľa, ktorý chce sledovať využitie strojov a odchody členov.',
    goodAt: [
      'QR a voliteľné NFC, rýchle zapisovanie',
      'Návrhy váhy cez AI, programy a režim bez pripojenia',
      'Analytika využitia, špičky a tichých odchodov',
      'Verejné ceny od 39 dolárov mesačne',
      'Aplikácia pre členov je bezplatná',
    ],
    notGoodAt: [
      'Po skúšobnej dobe platí posilňovňa mesačné predplatné',
      'Posilňovňa tlačí QR kódy a dodáva NFC štítky',
      'Údaje o rozsahu sú tvrdenia samotnej služby',
    ],
    pickWhen:
      'Zaplatíš za analytiku udržania členov a dôležitejšie sú pre teba dáta o využití než bezplatný prehľad.',
  },
  ScanLiftLog: {
    oneLine: 'Skenovací denník bez aplikácie a bez účtu.',
    goodAt: [
      'Sken kamerou otvorí prehliadač alebo PWA',
      'História predvolene v zariadení s exportom a importom',
      'Zapisovanie sily a kardia viazané na stroj',
      'Transparentná cena od 30 dolárov mesačne',
      'Značkové QR štítky po zaslaní zoznamu vybavenia',
    ],
    notGoodAt: [
      'Iba QR, bez NFC dotyku',
      'Nie je plnohodnotným denníkom progresívneho preťaženia',
      'Mesačný poplatok a zriadenie, ak sa nezaviažeš na dlhšie obdobie',
    ],
    pickWhen: 'Členovia nechcú inštalovať aplikáciu alebo je podmienkou uloženie v zariadení bez účtov.',
  },
  RepTag: {
    oneLine: 'Platforma pre štúdiá DACH: QR na ploche a nástroje trénera v zázemí.',
    goodAt: [
      'Web pre cvik, video, pokyny a hlásenie porúch bez inštalácie',
      'Bezplatná aplikácia na série, poslednú váhu, rekordy a históriu',
      'Chat trénerov, rezervácie, plány, výzvy a rebríčky',
      'Interaktívny pôdorys',
      'Mapa štúdií a partnerský zápis',
    ],
    notGoodAt: [
      'Prioritou je QR, NFC súprava chýba',
      'Posilňovňa platí 150 eur mesačne bez DPH',
      'Pilot pre vybrané štúdiá, najsilnejší v Nemecku, Rakúsku a Švajčiarsku',
    ],
    pickWhen:
      'Prevádzkuješ nemecky hovoriace štúdio a chceš komunitu, nástroje trénera aj pôdorys v jednej platenej platforme.',
  },
}
