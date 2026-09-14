import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-goblet-squat',
  metaDescription:
    'Goblet drep s jednoručkou: nastavenie prednej záťaže, hĺbka a učebný drep s poctivo zaznamenaným progresom.',
  steps: [
    'Jednu jednoručku drž zvisle pri hrudníku — rukami pod hornou platňou alebo objatú. Lakte smerujú dovnútra a postoj zvoľ podľa pohybu kolien.',
    'Spevni sa a sadni medzi nohy. Boky aj kolená pracujú spolu, celé chodidlo ostáva na zemi a jednoručka sa neodliepa od hrudníka.',
    'Klesni do hĺbky, ktorú zopakuješ bez výrazného podsadenia panvy či dvíhania piet. Lakte môžu sledovať vnútro kolien.',
    'Odtlač podlahu a postav sa. Pred ďalším opakovaním znovu nastav dych. Je to drep, nie odraz od lopty.',
  ],
  mistakes: [
    {
      title: 'Necháš jednoručku stiahnuť hrudník dole',
      body: 'Ak sa horný chrbát zaguľatí, drep sa zmenil na zle zaťažený good morning. Lakte dnu, rebrá dole alebo ľahšia jednoručka.',
    },
    {
      title: 'Naháňaš hĺbku až do podsadenia panvy',
      body: 'Výrazné podsadenie nepridáva rast svalov. Sadni tak nízko, ako vieš kontrolovať, a zastav.',
    },
    {
      title: 'Nezapisuješ ho, lebo je to „rozcvička“',
      body: 'Ak je v tréningu, patrí do LIFTAG. Goblet drep je objem a pre väčšinu cvičiacich cesta k činke.',
    },
    {
      title: 'Dvíhaš päty a kolená idú dopredu bez kontroly',
      body: 'Predná záťaž pomáha zostať na celom chodidle. Využi ju; podložky pod päty používaj iba ako zámernú poznamenanú variáciu.',
    },
  ],
  variations: [
    {
      slug: 'bodyweight-squat',
      name: 'Drep s vlastnou váhou',
      note: 'Bez záťaže; najprv si osvoj pohyb.',
    },
    {
      slug: 'barbell-front-squat',
      name: 'Predný drep s veľkou činkou',
      note: 'Rovnaký vzpriamený trup, tentoraz os v stojane.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Hlavný drep, na ktorý sa pripravuješ.',
    },
    {
      slug: 'landmine-squat',
      name: 'Landmine drep',
      note: 'Predná záťaž, keď sú najťažšie jednoručky už ľahké.',
    },
  ],
  progressions: [
    'Drep s vlastnou váhou do rovnakej hĺbky alebo na debnu.',
    'Goblet drep s pauzou v spodnej pozícii.',
    'Ťažšie jednoručky v sériách po 8–15; pridaj záťaž, keď každé opakovanie dosiahne rovnakú hĺbku.',
    'Predný alebo zadný drep, keď limitom gobletu je držanie jednoručky, nie nohy.',
  ],
  programming:
    'Učebný drep, zakončenie s veľkým počtom opakovaní alebo hlavný drep na cestách: tri až štyri série po 8–15. Váhe drepu s činkou na chrbte sa nikdy nevyrovná. Keď je najťažšia jednoručka vo fitku ľahká na 12 opakovaní, prejdi na predný drep s činkou a goblet si nechaj ako rozcvičku.',
  relatedSlugs: ['barbell-front-squat', 'barbell-back-squat', 'bodyweight-squat', 'dumbbell-lunge'],
} satisfies ExerciseOverlay
