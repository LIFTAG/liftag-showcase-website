import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-upright-row',
  metaDescription:
    'Príťah veľkej činky k brade: šírka úchopu, výška lakťov a zapisovanie oproti upažovaniu či krčeniu ramien v LIFTAGu.',
  steps: [
    'Postav sa vzpriamene s osou pri stehnách. Úchop maj na šírku ramien alebo o trochu širší, nie úzky ako pri bicepsovom zdvihu. Palce obopínajú os a zápästia zostávajú nad predlaktiami.',
    'Veď pohyb lakťami. Ťahaj os pred telom, kým sú nadlaktia približne rovnobežne so zemou; väčšine cvičiacich skončí os pri spodnej časti hrudníka, nie pod bradou.',
    'Hore nezakruž ramenami. Krátko zastav, spusti os do visu s natiahnutými trapézmi a pred ďalším ťahom sa znovu nastav.',
    'Ak v prednej časti ramena cítiš pichanie, sériu ukonči. Upažovanie a face pull precvičia podobnú oblasť bez tohto stlačenia.',
  ],
  mistakes: [
    {
      title: 'Úzky úchop a ťah k brade',
      body: 'Spojené ruky a vysoký ťah často dráždia akromioklavikulárny kĺb. Rozšír úchop a zastav, keď sú lakte vo výške ramien.',
    },
    {
      title: 'Meníš ho na vysoký nadhod',
      body: 'Boky neponáraj, ak práve nerobíš olympijský vysoký ťah — ten patrí k inému cviku. Príťah k brade je cvik hornej časti tela, nie ťah na trh.',
    },
    {
      title: 'Krútiš ramenami hore',
      body: 'Krúženie je divadlo. Nepridá prácu trapézov, iba podráždenie. Ťahaj, zastav a spusti.',
    },
    {
      title: 'Zapisuješ ho ako krčenie s jednoručkami',
      body: 'Vzor aj rekord sú iné. Pri krčení idú ramená priamo hore; ak sa lakte pokrčia a os stúpa po hrudníku, patrí sem.',
    },
  ],
  variations: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Bežná náhrada, keď príťah k brade štípe: bočné rameno bez nepríjemnej vnútornej rotácie.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Face pull na ramená',
      note: 'Ťah s vysokými lakťami a vonkajšou rotáciou namiesto osi pod bradou.',
    },
    {
      slug: 'dumbbell-shrug',
      name: 'Krčenie ramien s jednoručkami',
      note: 'Priame zdvihnutie ramien, keď cieliš trapézy, nie deltové svaly.',
    },
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Izolačný objem, ak chceš zachovať vzor upažovania.',
    },
  ],
  progressions: [
    'Prázdna os, dostatočne široký úchop a zastavenie v rovnobežke lakťov; raz si natoč pohľad spredu.',
    'Pridaj váhu iba vtedy, keď rameno zostáva v tejto výške pokojné.',
    'Pri prvom pichnutí prejdi na upažovanie na kladke. Je to zmena cviku, nie zlyhanie.',
  ],
  programming:
    'Príťah k brade je doplnok, nie hlavný ťah: tri až štyri série po 8–12 po tlakoch alebo príťahoch. Nenaháňaj rekord na cviku, ktorý mnohým ramenám nesedí. Ak ho ponecháš, zapíš si šírku úchopu, aby si ju budúci týždeň nemusel hádať. Odhadované 1RM tu takmer nikdy nepomôže.',
  equipmentAlternatives: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Prvá výmena, keď os dráždi rameno.',
    },
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Vedená dráha bez osi pred hrudníkom.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Face pull na ramená',
      note: 'Ťah s vysokými lakťami a príjemnejším záverom.',
    },
  ],
  faqs: [
    {
      question: 'Je príťah veľkej činky k brade zlý pre ramená?',
      answer:
        'Pre mnohých je zlým základným cvikom, nie však zakázaným pohybom. Úzky úchop a ťah k brade bývajú problém. Rozšír úchop, zastav v rovnobežke lakťov a ak cvik stále štípe, vynechaj ho. LIFTAG od teba nevyžaduje cvik, ktorý bolí.',
    },
  ],
  relatedSlugs: ['cable-lateral-raise', 'dumbbell-shrug', 'shoulder-facepulls', 'machine-lateral-raise'],
} satisfies ExerciseOverlay
