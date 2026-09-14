import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-ab-crunch',
  metaDescription:
    'Skracovanie brucha na stroji: nastavenie sedadla, zvinutie rebier k panve a samostatné zapisovanie oproti skracovaniu na zemi v LIFTAG.',
  steps: [
    'Nastav sedadlo, hrudnú alebo ramennú podložku a opory nôh tak, aby os stroja smerovala približne cez stred rebier, nie cez boky.',
    'Spevni brucho, uchop rukoväte alebo sa opri o podložku a začni vzpriamene. Je to zvinutie trupu, nie sed-ľah so zásobníkom.',
    'Vydýchni a skrč hrudný kôš smerom k panve. Boky zostávajú relatívne pokojné a chrbtica sa ohýba.',
    'Vráť sa do vzpriamenia bez nárazu zásobníka. Natiahnutie je v poriadku, odraz nie je opakovanie.',
  ],
  mistakes: [
    {
      title: 'Sťahuješ podložku ohýbačmi bedra',
      body: 'Ak cítiš hlavne prednú stranu bedier, skladáš sa v bokoch namiesto zvinutia trupu. Skráť rozsah a spomaľ návrat.',
    },
    {
      title: 'Sedadlo je príliš vysoko a dvíhaš podložku ramenami',
      body: 'Stroj má zaťažiť brucho, nie trapézy. Zníž sedadlo, kým podložka sedí na hrudníku alebo ramenách a os je pri rebrách.',
    },
    {
      title: 'Zapisuješ ho ako skracovanie na zemi',
      body: 'Zaťažený stroj a cvik s vlastnou váhou majú odlišný graf. Naskenuj štítok tohto rámu, aby LIFTAG otvoril machine-ab-crunch.',
    },
    {
      title: 'Odrazíš zásobník od horných dorazov',
      body: 'Prácu tvorí zvinutie. Ak potrebuješ odraz, uber kotúč a v spodnej polohe skracovania zastav.',
    },
  ],
  variations: [
    {
      slug: 'crunch',
      name: 'Skracovanie na zemi',
      note: 'Verzia bez zásobníka s rovnakou myšlienkou: rebrá smerujú k panve.',
    },
    {
      slug: 'kneeling-cable-crunch',
      name: 'Skracovanie na kábli v kľaku',
      note: 'Smer ťahu kladky, keď je stroj obsadený alebo ti podložka nesedí.',
    },
    {
      slug: 'hanging-leg-raise',
      name: 'Zdvíhanie nôh vo vise',
      note: 'Ohýbanie vo vise, ak chceš hýbať nohami namiesto podložky.',
    },
    {
      slug: 'reverse-crunch',
      name: 'Obrátené skracovanie',
      note: 'Panva smeruje k rebrám, keď na stroji preberajú prácu ohýbače bedra.',
    },
  ],
  progressions: [
    'Ľahký kolík, dve sekundy skracovanie a dve sekundy návrat.',
    'Pridaj záťaž, keď boky zostanú pokojné vo všetkých opakovaniach.',
    'Pred ťažším zásobníkom podrž stiahnutie v kontrakcii.',
    'Prejdi na skracovanie na kábli v kľaku, ak os stroja nikdy nesedí na tvoj trup.',
  ],
  programming:
    'Izolácia po hlavných cvikoch: tri série po 10–15. Nie je to mŕtvy ťah. V partnerskom fitku má QR alebo NFC štítok na ráme otvoriť tento cvik; ak otvorí crunch alebo sit-up, upozorni fitko, aby denník zostal poctivý. Skombinuj ho so zdvíhaním nôh vo vise alebo Pallofovým tlakom, nie s ďalším strojovým skracovaním.',
  relatedSlugs: [
    'crunch',
    'kneeling-cable-crunch',
    'hanging-leg-raise',
    'russian-twist',
    'kneeling-ab-rollout',
  ],
} satisfies ExerciseOverlay
