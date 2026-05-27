<script setup lang="ts">
const path = '/sk/privacy-policy'
const lastUpdated = 'máj 2026'

useLiftagSeo({
  title: 'Zásady ochrany osobných údajov | LIFTAG',
  description:
    'Ako LIFTAG zhromažďuje, používa, ukladá a chráni vaše osobné údaje pri používaní tréningovej aplikácie LIFTAG.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Ochrana osobných údajov', path },
  ]),
])

const sections = [
  {
    title: 'Úvod',
    body: 'Liftag je aplikácia na sledovanie tréningov prevádzkovaná spoločnosťou LIFTAG. Tieto zásady vysvetľujú, aké osobné údaje zhromažďujeme, ako ich používame a ako môžete uplatniť svoje práva.',
  },
  {
    title: 'Údaje, ktoré zhromažďujeme',
    body: 'Môžeme zhromažďovať údaje o účte, ako meno, email, poskytovateľ prihlásenia, dátum narodenia, pohlavie, preferované jednotky, nastavenia profilu a správy podpore; telesné údaje, ako výška a hmotnosť; tréningové údaje, ako relácie, cviky, série, opakovania, váhy, trvanie, rutiny, plány, ciele, pokrok a nastavenia zdieľania s trénerom; nahraný obsah, napríklad médiá vlastných cvikov; približnú alebo presnú polohu, ak povolíte detekciu posilňovne alebo mapové funkcie; a údaje o zariadení, aplikácii, diagnostike, pádoch a session replay.',
  },
  {
    title: 'Ako používame vaše údaje',
    body: 'Vaše údaje používame na vytvorenie a zabezpečenie účtu, poskytovanie sledovania tréningov a QR/gym funkcií, synchronizáciu medzi zariadeniami, zobrazovanie histórie a pokroku, podporu trénerov a zdieľania, vybavenie podpory, prevenciu zneužitia, riešenie pádov, zlepšovanie kvality aplikácie a splnenie právnych povinností.',
  },
  {
    title: 'Ukladanie a bezpečnosť údajov',
    body: 'Údaje sú uložené u poskytovateľov služieb vrátane Supabase a S3/AWS úložiska médií. Používame technické a organizačné opatrenia, napríklad autentifikovaný prístup k API a šifrovanie pri prenose, no žiadna služba nevie zaručiť absolútnu bezpečnosť.',
  },
  {
    title: 'Služby tretích strán',
    body: 'Používame služby tretích strán vrátane Supabase na autentifikáciu, databázu a úložisko; Google a Apple na prihlásenie; Sentry vrátane session replay na diagnostiku; Resend na email; Cloudflare Turnstile na prevenciu zneužitia; Strava, ak ju pripojíte; YouTube/WebView na video obsah; mapové a lokalizačné služby na vyhľadávanie posilňovní; a S3/AWS úložisko na nahrané médiá.',
  },
  {
    title: 'Vaše práva',
    body: 'Podľa miesta, kde žijete, môžete mať právo na prístup, opravu, vymazanie, export, obmedzenie alebo namietanie voči spracúvaniu osobných údajov a právo odvolať súhlas, ak je spracúvanie založené na súhlase. O vymazanie účtu môžete požiadať v aplikácii alebo nás kontaktovať.',
  },
  {
    title: 'Uchovávanie údajov',
    body: 'Osobné údaje uchovávame tak dlho, ako je potrebné na poskytovanie Liftag, bezpečnosť, riešenie sporov, splnenie zákona a uchovanie oprávnených obchodných záznamov. Po vymazaní účtu údaje vymažeme alebo anonymizujeme, ak ich uchovanie nevyžaduje alebo nepovoľuje zákon.',
  },
  {
    title: 'Ochrana súkromia detí',
    body: 'Liftag nie je určený pre osoby mladšie ako 16 rokov. Vedome neumožňujeme používateľom mladším ako 16 rokov vytvoriť účet alebo používať produktové funkcie. Ak máte menej ako 16 rokov, Liftag nepoužívajte.',
  },
  {
    title: 'Zmeny týchto zásad',
    body: 'Tieto zásady môžeme z času na čas aktualizovať. Pri podstatných zmenách vás môžeme informovať v aplikácii alebo požiadať o prijatie aktualizovanej verzie pred ďalším používaním produktových funkcií.',
  },
  {
    title: 'Kontaktujte nás',
    body: 'Ak máte otázky ohľadom týchto zásad ochrany osobných údajov alebo vašich osobných údajov, kontaktujte nás na:',
  },
]

const contactEmail = 'support@liftag.fit'
</script>

<template>
  <div class="legal-page">
    <SiteNav />

    <main>
      <article class="legal">
        <header class="legal-hero container">
          <p class="protocol legal-eyebrow">▸ OCHRANA OSOBNÝCH ÚDAJOV</p>
          <h1 class="display legal-title">Ochrana osobných <span class="lime">údajov.</span></h1>
          <p class="legal-updated">Posledná aktualizácia: {{ lastUpdated }}</p>
        </header>

        <div class="container legal-body">
          <section
            v-for="section in sections"
            :key="section.title"
            class="legal-section"
          >
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </section>

          <p class="legal-contact-email">
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </p>
        </div>
      </article>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100dvh;
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

.legal-hero {
  padding: 150px 0 40px;
}

.legal-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.legal-title {
  max-width: 920px;
  font-size: clamp(48px, 7.4vw, 112px);
}

.legal-updated {
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 300;
}

.legal-body {
  padding: 24px 0 80px;
  max-width: 820px;
}

.legal-section {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.legal-section h2 {
  margin: 0 0 14px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(22px, 2.8vw, 32px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.1;
}

.legal-section p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  margin: 0;
}

.legal-contact-email {
  margin: 18px 0 0;
  font-size: 16px;
}

.legal-contact-email a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .legal-hero {
    padding-top: 120px;
  }
}

@media (max-width: 620px) {
  .legal-hero {
    padding: 108px 0 32px;
  }
}
</style>
