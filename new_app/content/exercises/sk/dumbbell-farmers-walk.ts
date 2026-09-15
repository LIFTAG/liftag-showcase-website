import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-farmers-walk',
  metaDescription:
    'Chôdza s jednoručkami: zdvihnutie, držanie tela a zaznamenávanie prenášania záťaže v LIFTAG bez miešania trap-bar váh.',
  steps: [
    'Uvoľni si rovnú dráhu na chôdzu. Predkloň sa k jednoručkám, pevne ich uchop a postav sa ako pri mŕtvom ťahu s jednoručkami.',
    'Zapoj latissimá, aby závažia viseli pri stehnách a nerozhupovali sa. Rebrá drž nad panvou a pozeraj pred seba.',
    'Kráč krátkymi kontrolovanými krokmi od päty po špičku. Neutekaj a nekrč ramená k ušiam.',
    'Jednoručky polož predklonom. Pustiť ich z vystretia je hlučné a pripraví ťa o poslednú excentrickú fázu.',
  ],
  mistakes: [
    {
      title: 'Krčíš ramená počas celej chôdze',
      body: 'Zapojené trapézy neznamenajú ramená pri ušiach. Ak krčíš, záťaž je príliš veľká alebo trasa príliš dlhá.',
    },
    {
      title: 'Zakláňaš sa alebo ťa jednoručky skladajú do predklonu',
      body: 'Stoj medzi závažiami. Náklon dozadu mení prenášanie na test krížov.',
    },
    {
      title: 'Trap-bar prenášanie zapisuješ ako jednoručky',
      body: 'Prenášanie s hex osou má vlastný cvik v katalógu a zvyčajne inú váhu. Použi trap-bar-farmers-walk.',
    },
    {
      title: 'Neuvádzaš vzdialenosť ani čas',
      body: 'Desaťmetrové šuchtanie a štyridsaťmetrový pochod nie sú rovnaké. Vyber metre alebo sekundy, zapíš ich a drž rovnakú dĺžku.',
    },
  ],
  variations: [
    {
      slug: 'trap-bar-farmers-walk',
      name: 'Chôdza s trap-bar osou',
      note: 'Väčšia váha, stabilnejší úchop a samostatný cvik.',
    },
    {
      slug: 'dead-hang',
      name: 'Vis na hrazde',
      note: 'Tréning úchopu bez chôdze, keď niet miesta.',
    },
    {
      slug: 'dumbbell-shrug',
      name: 'Krčenie ramien s jednoručkami',
      note: 'Priamy cvik na horné trapézy, ak prenášanie prvé obmedzí úchop.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap bar osou',
      note: 'Zdvih, ktorý už ovládaš, tentoraz bez chôdze.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, 20–30 m a postoj, ktorý by vydržal na fotografii.',
    'Každý týždeň pridaj buď váhu, alebo vzdialenosť.',
    'Dlhšia trasa alebo pomalšie tempo, až keď zmizne krčenie a náklon.',
    'Trap-bar prenášanie, keď už jednoručky nie sú limitom.',
  ],
  programming:
    'Zakončenie alebo hlavný tréning úchopu: tri až päť trás. Zapisuj váhu jednej jednoručky, nie páru, a poctivo uveď dĺžku. Do poznámky pridaj metre alebo sekundy, aby sa 10 m nemohlo tváriť ako 40 m. Odpočívaj tak, aby ďalšie zdvihnutie začalo predklonom, nie trhnutím s okrúhlym chrbtom.',
  equipmentAlternatives: [
    {
      slug: 'trap-bar-farmers-walk',
      name: 'Chôdza s trap-bar osou',
      note: 'Keď má fitko trap bar a jednoručky už nestačia.',
    },
    {
      slug: 'dead-hang',
      name: 'Vis na hrazde',
      note: 'Keď nemáš dráhu; úchop sa stále trénuje.',
    },
  ],
  faqs: [
    {
      question: 'Mám zapisovať vzdialenosť alebo čas?',
      answer:
        'Obe možnosti fungujú, ak zostaneš konzistentný. Vzdialenosť je čistejšia na vyznačenej dráhe, čas v preplnenom fitku. Počas bloku jednotky nemeň a nenazývaj to rekordom.',
    },
  ],
  relatedSlugs: ['trap-bar-farmers-walk', 'dead-hang', 'trap-bar-deadlift', 'barbell-shrugs'],
} satisfies ExerciseOverlay
