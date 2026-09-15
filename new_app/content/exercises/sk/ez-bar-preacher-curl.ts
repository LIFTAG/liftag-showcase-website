import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-preacher-curl',
  metaDescription:
    'Bicepsový zdvih s EZ činkou na Scottovej lavičke: výška opierky, natiahnutie v dolnej polohe a samostatné zapisovanie oproti zdvihu v stoji a koncentrovanému zdvihu v LIFTAGu.',
  steps: [
    'Nastav opierku tak, aby podpazušie spočívalo na jej hornom okraji a bicepsy neležali uprostred opierky. Úplne sa posaď.',
    'Uchop EZ činku za zahnuté časti a nechaj ruky vystreté. Vyber uhol úchopu, ktorý ti vyhovuje, a zápästia drž v jednej línii s predlaktiami.',
    'Zdvihni činku až do úplného stiahnutia bicepsov bez toho, aby si zdvihol zadok zo sedadla. Nadlaktia zostávajú celý čas opreté.',
    'Kontrolovane spúšťaj činku do natiahnutia. Dôležitá je aj posledná tretina spúšťania; zastav skôr, než by sa lakte prepli dozadu.',
  ],
  mistakes: [
    {
      title: 'Zapisovanie ako zdvih s EZ činkou v stoji',
      body: 'Činka je rovnaká, cvik nie. Opierka obmedzí švih a zvyčajne aj zvládnutú záťaž. Zapisuj tento cvik samostatne; zaradenie pod zdvih v stoji skreslí jeho graf.',
    },
    {
      title: 'Príliš vysoká poloha a krčenie ramien pri každom opakovaní',
      body: 'Ak podpazušie nie je pri opierke a opieraš sa iba stredom bicepsov, skracuješ rozsah. Uprav výšku sedadla alebo opierky tak, aby mali nadlaktia pevnú oporu.',
    },
    {
      title: 'Odraz zo spodnej polohy',
      body: 'Nekontrolované prepnutie lakťa v natiahnutí zbytočne zaťažuje šľachy. Radšej zvoľ o niečo kratší rozsah, ktorý máš pod kontrolou, než prudký odraz.',
    },
    {
      title: 'Dvíhanie zadku pri posledných opakovaniach',
      body: 'Tým sa cvik mení na zdvih v stoji, ktorému prekáža lavička. Zostaň sedieť, inak opierka stráca svoj význam.',
    },
  ],
  variations: [
    {
      slug: 'ez-bar-curl',
      name: 'Zdvih s EZ činkou',
      note: 'Variant v stoji umožňuje vyššiu záťaž, ale aj pomoc bokmi, ak ju neustrážiš.',
    },
    {
      slug: 'concentration-curl',
      name: 'Koncentrovaný bicepsový zdvih',
      note: 'Izolovaný cvik na jednu ruku, keď je Scottova lavička obsadená.',
    },
    {
      slug: 'machine-preacher-curl',
      name: 'Bicepsový zdvih na stroji',
      note: 'Rovnaký princíp s oporou nadlaktí, vedenou dráhou a záťažovým blokom.',
    },
    {
      slug: 'incline-dumbbell-curl',
      name: 'Zdvih jednoručiek na šikmej lavičke',
      note: 'Biceps pracuje v natiahnutí bez opierky pred telom.',
    },
  ],
  progressions: [
    'Začni ľahkou EZ činkou, podpazuším pri hornom okraji opierky a bez odrazu v natiahnutí.',
    'Prejdi na pracovné série po 8–12 opakovaní s rovnakou výškou sedadla a rovnakým úchopom.',
    'Skôr než pridáš záťaž, zaraď sekundovú pauzu tesne nad dolnou polohou.',
    'Ak voľná činka dráždi lakte, prejdi na zdvih na stroji so Scottovou opierkou a zapisuj ho ako samostatný cvik.',
  ],
  programming:
    'Zaraď ho ako izolovaný cvik po zdvihu v stoji, nie ako druhý zdvih v stoji: 3–4 série po 8–12 opakovaní. Aj pri rovnakej EZ činke ho zapisuj ako zdvih na Scottovej lavičke, pretože opierka mení zvládnutú záťaž. Poznač si polohu sedadla a miesto úchopu, aby si nabudúce zopakoval rovnaké nastavenie. Oddychuj dosť dlho na to, aby sa kontrolované natiahnutie dole nezmenilo na odraz.',
  equipmentAlternatives: [
    {
      slug: 'machine-preacher-curl',
      name: 'Bicepsový zdvih na stroji',
      note: 'Keď je Scottova lavička s EZ činkou obsadená alebo chceš záťažový blok namiesto kotúčov.',
    },
    {
      slug: 'concentration-curl',
      name: 'Koncentrovaný bicepsový zdvih',
      note: 'Bez Scottovej lavičky: lakeť opri o stehno a cvič každou rukou zvlášť.',
    },
  ],
  faqs: [
    {
      question: 'Ako vysoko má byť podložka?',
      answer:
        'Tak, aby podpazušie spočívalo na hornom okraji a nadlaktia ležali na opierke. Pri príliš nízkej opierke budeš krčiť ramená, pri príliš vysokej sa oprieš iba stredom bicepsov. Poznač si nastavenú polohu; jej zmena mení aj natiahnutie.',
    },
  ],
  relatedSlugs: ['ez-bar-curl', 'concentration-curl', 'machine-preacher-curl', 'incline-dumbbell-curl'],
} satisfies ExerciseOverlay
