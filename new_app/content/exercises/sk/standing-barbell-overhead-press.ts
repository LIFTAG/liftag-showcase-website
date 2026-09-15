import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-barbell-overhead-press',
  metaDescription:
    'Tlaky s veľkou činkou nad hlavou v stoji: spevnenie tela, dráha činky a zapisovanie striktných tlakov oddelene od push pressu v LIFTAGu.',
  steps: [
    'Nastav činku do výšky hornej časti hrudníka. Uchop ju tesne za šírkou ramien, palce obopni okolo osi a zápästia drž nad lakťami. Činka spočíva na predných deltách, nie vo vzduchu pred rukami.',
    'Zo stojana vykroč jediným krokom. Chodidlá maj pod bokmi alebo v mierne rozkročnom postoji, zadok zatni a rebrá stiahni. Postoj má pripomínať pevný front rack, nie bicepsový zdvih.',
    'Tlač nahor a mierne dozadu. Keď os prejde ponad líniu vlasov, pretlač hlavu medzi paže, aby činka skončila nad stredom chodidiel.',
    'Vystretie dokonči s bicepsmi pri ušiach a činku kontrolovane spusti na ramená. Pred ďalším opakovaním znovu spevni stred tela; neodrážaj ju od hrudníka.',
    'Ak sa kolená ponoria, séria sa zmenila na push press. Činku odlož alebo prejdi na správny cvik a tak ho aj zaznamenaj.',
  ],
  mistakes: [
    {
      title: 'Ponorenie kolien v striktnom tlaku',
      body: 'Ponorenie je iný cvik a iný osobný rekord. Ak činka opustí ramená iba vďaka nohám, sériu zapíš ako barbell-push-press.',
    },
    {
      title: 'Tlačenie okolo nepohyblivej hlavy',
      body: 'Ak činka zostáva pri vystretí pred tvárou, hlava neprešla dopredu. Dráha má tvoriť plytké S, nie oblúk pred telom.',
    },
    {
      title: 'Záklon, ktorý z tlaku urobí tlak na šikmej lavičke v stoji',
      body: 'Pri ťažkej váhe je mierny záklon bežný. Prehnutie do tvaru luku s vystrčenými rebrami je však tlak na šikmej lavičke postojačky. Zatni zadok a zvoľ váhu, pri ktorej ostaneš vysoký.',
    },
    {
      title: 'Úchop ukazovákom na krúžkoch bez dôvodu',
      body: 'Takýto úchop je pozostatok z bench pressu. Väčšine cvičiacich vyhovuje úchop približne o šírku palca širší než ramená, so zápästiami nad lakťami, nie s lakťami v pravom uhle.',
    },
  ],
  variations: [
    {
      slug: 'barbell-push-press',
      name: 'Push press s veľkou činkou',
      note: 'Pohon nohami na preťaženie rovnakého vystretia. Tento rekord drž mimo grafu striktného tlaku.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami nad hlavou v sede',
      note: 'Samostatné paže bez vykročenia zo stojana; pri zlyhaní sa ľahšie odhadzujú.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Tlak na ramená na stroji',
      note: 'Pevná dráha, keď chceš objem nad hlavou bez osi na deltách.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine tlak',
      note: 'Dráha približne 45°, keď ramenu prekáža zvislé vystretie.',
    },
  ],
  progressions: [
    'Tlaky s jednoručkami v sede, kým je poloha nad hlavou pohodlná a vystretie nevyžaduje veľký záklon.',
    'Striktný tlak s prázdnou osou a pauzou pri čele, neskôr vo vystretí.',
    'Pracovné série po 3–6 opakovaní, ktoré vždy končia nad stredom chodidiel. Záťaž pridaj, keď kolená zostanú pokojné.',
    'Push press alebo landmine zaraď, keď sa striktný tlak zastaví a ramená sa stále cítia dobre.',
  ],
  programming:
    'Pre väčšinu cvičiacich s veľkou činkou je to hlavný vertikálny tlak. Rob 3–5 pracovných sérií po 3–6 opakovaní a dopraj si dlhé pauzy; použi časovač LIFTAGu, pretože uponáhľaný striktný tlak sa ľahko zmení na push press. Odhadované 1RM má význam iba pri skutočne striktných sériách. Najprv naháňaj čisté PR v opakovaní, až potom pridaj 5 kg a nezačni sa ponárať.',
  equipmentAlternatives: [
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami nad hlavou v sede',
      note: 'Predvolená náhrada, keď nemáš drepový stojan alebo os dráždi jedno rameno.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Tlak na ramená na stroji',
      note: 'Objem nad hlavou bez sparingpartnera a bez odhadzovania osi.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine tlak',
      note: 'Tlač ďalej, keď zvislé vystretie nie je vhodné.',
    },
  ],
  faqs: [
    {
      question: 'Mám tlačiť za krk?',
      answer:
        'Nie ako predvolenú verziu. Tlak za krk vyžaduje väčšiu vonkajšiu rotáciu, než má väčšina ramien, najmä bez rozcvičenia. Tlač z predných deltov. Ak ti ho tréner naplánuje, ponechaj tento cvik a uveď úpravu v poznámke, aby ďalšia séria nebola prekvapením.',
    },
    {
      question: 'Ako zapíšem sériu, ktorá začala striktne a skončila push presom?',
      answer:
        'Ak posledné opakovania potrebovali ponor, do série napíš „dokončené push pressom“ alebo celú sériu presuň na barbell-push-press. Nemiešaj ich v jednej progresii LIFTAGu, inak sa v štvrtom týždni objaví falošný rekord nad hlavou.',
    },
  ],
  relatedSlugs: [
    'barbell-push-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'landmine-press',
    'seated-arnold-press',
  ],
} satisfies ExerciseOverlay
