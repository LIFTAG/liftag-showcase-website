import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-curl',
  metaDescription:
    'Bicepsový zdvih s EZ-činkou: zakrivenie osi, pevné lakte a zaznamenávanie zdvihu v stoji šetrnejšieho k zápästiam v LIFTAG-u oddelene od zdvihu s rovnou veľkou činkou.',
  steps: [
    'Uchop šikmé časti EZ-činky podhmatom, ktorý je pre tvoje zápästia príjemný. Stoj vzpriamene a nechaj činku visieť v dlhých rukách. Rebrá drž stiahnuté.',
    'Lakte pritisni k trupu. Niekoľko centimetrov pohybu je v poriadku, zdvíhanie pomocou trhnutia bokmi nie.',
    'Zdvihni činku k ramenám, kým sa bicepsy úplne neskrátia. Zápästia drž v jednej línii so zakrivením, neohýbaj ich dozadu.',
    'Pod kontrolou spusti činku do úplného visu. Dolná poloha je natiahnutie, nie odraz od stehien.',
  ],
  mistakes: [
    {
      title: 'Zaznamenávanie EZ zdvihu ako zdvihu s veľkou činkou',
      body: 'Zakrivenie je pre väčšinu zápästí príjemnejšie a často dovolí väčšiu záťaž. Ďalší kotúč preto nie je rekord s rovnou osou. EZ zdvih má tento identifikátor a zdvih s veľkou činkou druhý. LIFTAG zaznamenáva každú os samostatne.',
    },
    {
      title: 'Striedanie vnútorného a vonkajšieho zakrivenia každý týždeň',
      body: 'Užší úchop viac zaťaží bicepsy, širší býva šetrnejší k zápästiam. Vyber si základný variant. Ak ich striedaš, do poznámky série uveď vnútorný alebo vonkajší úchop, inak bude budúci týždeň iný cvik s rovnakým názvom.',
    },
    {
      title: 'Premena každej série na podvádzaný zdvih',
      body: 'Malá dopomoc telom pri skutočne poslednom opakovaní je jedna vec. Ak boky začínajú každé opakovanie, nezdvíhaš činku bicepsmi. Zníž záťaž alebo napíš „podvádzaný“ a zachovaj poctivé číslo.',
    },
    {
      title: 'Zaznamenávanie práce na Scottovej lavičke pod tento identifikátor',
      body: 'Opierka vyradí boky a zmení záťaž. EZ zdvih na Scottovej lavičke patrí do druhého grafu. Rovnaká os, iný cvik.',
    },
  ],
  variations: [
    {
      slug: 'barbell-curl',
      name: 'Bicepsový zdvih s veľkou činkou',
      note: 'Rovná os, zvyčajne nižšia záťaž a pre mnohých väčší tlak na zápästia.',
    },
    {
      slug: 'ez-bar-preacher-curl',
      name: 'Bicepsový zdvih s EZ-činkou na Scottovej lavičke',
      note: 'Rovnaká os s opierkou a bez podvádzania v stoji.',
    },
    {
      slug: 'standing-dumbbell-bicep-curl',
      name: 'Bicepsový zdvih s jednoručkami v stoji',
      note: 'Nezávislé ruky, keď ti prekáža aj zakrivenie EZ-činky.',
    },
    {
      slug: 'standing-cable-bicep-curl',
      name: 'Bicepsový zdvih v stoji na kladke',
      note: 'Stále napätie a jednoduché pridávanie malých záťaží.',
    },
  ],
  progressions: [
    'Ľahká EZ-činka, striktné tempo, úplný vis a rovnaké zakrivenie v každej sérii.',
    'Pracovné série po 6–10 opakovaní, v ktorých pohyb činky nikdy nezačína trupom.',
    'Záťaž pridaj, keď každá pracovná séria zostáva pri rovnakom vnútornom alebo vonkajšom úchope.',
    'Scottova lavička ako druhá fáza, zaznamenávaná pod vlastným identifikátorom.',
  ],
  programming:
    'Hlavný bicepsový cvik v stoji: 3–4 série po 6–10 opakovaní. Zakrivenie zvyčajne umožní väčšiu záťaž než rovná os, práve preto nejde o bicepsový zdvih s veľkou činkou. Ak má fitko štítok s EZ-činkou, naskenuj ho. Vnútorný a vonkajší úchop patria do poznámky série, nie k druhému cviku. Ak je činka naozaj ťažká, oddychuj 90–120 sekúnd.',
  equipmentAlternatives: [
    {
      slug: 'barbell-curl',
      name: 'Bicepsový zdvih s veľkou činkou',
      note: 'Použi, keď nemáš EZ-činku, a túto prácu nechaj pod identifikátorom rovnej osi.',
    },
    {
      slug: 'standing-dumbbell-bicep-curl',
      name: 'Bicepsový zdvih s jednoručkami v stoji',
      note: 'Keď je EZ-činka obsadená alebo jedno zápästie neznáša ani jej uhol.',
    },
  ],
  faqs: [
    {
      question: 'Mám EZ zdvih zaznamenávať ako zdvih s veľkou činkou?',
      answer:
        'Nie. Zakrivenie mení to, čo znesú zápästia a lakte, a podľa toho sa mení aj záťaž. Použi identifikátor EZ zdvihu. Ak ho zmiešaš so zdvihom s veľkou činkou, bude to vyzerať, že si zosilnel, hoci si iba zmenil os.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'ez-bar-preacher-curl',
    'standing-dumbbell-bicep-curl',
    'incline-dumbbell-curl',
  ],
} satisfies ExerciseOverlay
