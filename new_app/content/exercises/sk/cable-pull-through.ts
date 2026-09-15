import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-pull-through',
  metaDescription:
    'Predklon s lanom na kladke: lano medzi nohami, pohyb bokov a samostatné zapisovanie oproti kettlebell swingom či hip thrustom v LIFTAGu.',
  steps: [
    'Nastav spodnú kladku s lanom. Vykroč ponad kábel, odstúp, kým je zásobník napnutý, a predkloň sa tak, aby lano viedlo medzi stehnami.',
    'Kolená mierne pokrč, boky tlač dozadu a chrbát drž dlhý. Nechaj kábel, aby ťa natiahol v hamstringoch; nezačínaj ako pri drepe.',
    'Tlač boky dopredu, kým nestojíš vzpriamene. Lano skončí pri bokoch. Ruky iba držia lano, nerobia príťah.',
    'Vráť sa predklonom a kábel veď kontrolovane. Neklesaj do drepu, aby si ho zachytil, ani sa nehrb nad uvoľneným zásobníkom.',
    'Od veže odstúp tak, aby kotúče počas série nikdy nezostali na doraze. Ak sa dotknú, vykroč ďalej alebo pridaj kolík.',
  ],
  mistakes: [
    {
      title: 'Robíš z predklonu drep',
      body: 'Kolená vystreľujú dopredu a lano visí nízko — predklon sa zmenil na zlý goblet drep na kladke. Tlač boky dozadu, nie nadol.',
    },
    {
      title: 'Priťahuješ lano rukami',
      body: 'Ak sa lakte ohýbajú a cvik dvíhajú zadné ramená, boky nedokončujú vystretie. Zníž zásobník, upokoj ruky a nechaj pracovať boky.',
    },
    {
      title: 'V závere prehýbaš kríže',
      body: 'Postav sa vzpriamene; záver robia sedacie svaly. Zakláňanie je falošné vystretie a zbytočná záťaž pre kríže.',
    },
    {
      title: 'Zapisuješ swing alebo hip thrust',
      body: 'Kettlebell swing je rýchly, hip thrust končí vodorovne na lavičke či stroji. Toto je stojaci predklon na kladke. Zachovaj tento cvik.',
    },
  ],
  variations: [
    {
      slug: 'kettlebell-swing',
      name: 'Kettlebell swing',
      note: 'Rovnaká rodina predklonov, ale rýchlejšia: výbušnosť, nie pomalé drvenie.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Pomalý predklon, ktorý môžeš zaťažiť, keď kábel nie je pointou.',
    },
    {
      slug: 'barbell-hip-thrust',
      name: 'Hip thrust s veľkou činkou',
      note: 'Vodorovné vystretie na lavičke s väčším rozsahom v bedre.',
    },
    {
      slug: 'glute-bridge',
      name: 'Glute bridge',
      note: 'Podlahová verzia, keď chceš stiahnutie bez kladky.',
    },
  ],
  progressions: [
    'Ľahký zásobník, dlhý predklon a kotúče sa nikdy neopierajú.',
    'Vystretie s rebrami dole krátko podrž, až potom pridaj kolík.',
    'Pracovné série po 8–15 s rovnakým odstúpením pri každom tréningu.',
    'Ťažšiu váhu pridaj až po odstránení drepového vzoru; ak sa zmení dráha kábla, poznač si odstúpenie.',
  ],
  programming:
    'Doplnkový cvik pre sedacie svaly a predklon: tri až štyri série po 8–15 po hlavnom drepe alebo ťahu. Zapisuj zásobník. Ak pre obsadenú kladku prejdeš na kettlebell swing, zmeň slug: rekord swingov je rýchlosť, rekord pull-through je pomalý ťah. Ich miešanie klame graf v štvrtom týždni.',
  equipmentAlternatives: [
    {
      slug: 'kettlebell-swing',
      name: 'Kettlebell swing',
      note: 'Keď nemáš spodnú kladku; zachovaj pohyb bokov, ale počítaj s rýchlosťou.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Základný pomalý predklon, keď pri veži čaká rad.',
    },
    {
      slug: 'glute-bridge',
      name: 'Glute bridge',
      note: 'Stiahnutie na podlahe, keď nemôžeš stáť v dráhe kladky.',
    },
  ],
  faqs: [
    {
      question: 'Predklon na kladke alebo kettlebell swing?',
      answer:
        'Myšlienka predklonu je podobná, zámer však iný. Pull-through je pomalý káblový cvik, ktorý dávkuješ; swing je nadhod a rýchle vystrelenie bokov. Swingy vo výške hrudníka nepatria k tomuto cviku a ťažký zásobník nepatrí pod kettlebell swing. Zapisuj cvik, ktorý si naozaj cvičil.',
    },
  ],
  relatedSlugs: ['kettlebell-swing', 'barbell-hip-thrust', 'barbell-romanian-deadlift-rdl', 'glute-bridge'],
} satisfies ExerciseOverlay
