import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chest-dips',
  metaDescription:
    'Dipy na hrudník: náklon trupu, hĺbka a samostatné zaznamenávanie dipov s vlastnou hmotnosťou či záťažou oproti tricepsovým dipom v LIFTAGu.',
  steps: [
    'Uchop bradlá, uzamkni lakte a mierne sa predkloň. Chodidlá môžu zostať za telom.',
    'Klesaj, kým ramená nie sú vo výške lakťov alebo tesne pod nimi, a iba tak hlboko, ako ramená bezpečne dovolia.',
    'Vytlač sa hore bez krčenia ramien ku krku. Hore skonči skôr, než by si lakte tvrdo dorazil.',
  ],
  mistakes: [
    {
      title: 'Vzpriamené tricepsové dipy zapisuješ ako dipy na hrudník',
      body: 'Vzpriamené dipy patria pod tricepsový identifikátor. Ak chceš precvičiť hrudník, zachovaj náklon.',
    },
    {
      title: 'Spúšťaš sa do spodnej polohy bez kontroly',
      body: 'Hĺbka bez kontroly je problém pre ramená, nie cesta k väčšiemu rastu svalov.',
    },
  ],
  variations: [
    {
      slug: 'assisted-dip',
      name: 'Asistovaný dip',
      note: 'Použi stroj, kým zvládneš čistý rozsah s vlastnou hmotnosťou.',
    },
    {
      slug: 'parallel-bar-triceps-dip',
      name: 'Tricepsový dip na bradlách',
      note: 'Vzpriamenejší trup a väčší dôraz na triceps.',
    },
    {
      slug: 'bench-triceps-dip',
      name: 'Tricepsový dip o lavicu',
      note: 'Náhrada pre domáce fitko.',
    },
  ],
  progressions: [
    'Asistované dipy alebo čiastočné opakovania s chodidlami na podlahe.',
    'Série s vlastnou hmotnosťou v plnom rozsahu po 6–10 opakovaní.',
    'Keď sú ďalšie série ľahké, pridaj opasok so záťažou a extra váhu zapíš v LIFTAGu.',
  ],
  programming:
    'Dipy so záťažou ber ako tlakový cvik: 3–4 náročné série. Ak pridáš opasok, zapisuj kotúč alebo inú pridanú váhu, nie iba „vlastná hmotnosť“, inak sa graf PR neposunie.',
  relatedSlugs: ['push-up', 'barbell-bench-press', 'parallel-bar-triceps-dip'],
} satisfies ExerciseOverlay
