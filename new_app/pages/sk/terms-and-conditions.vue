<script setup lang="ts">
const path = '/sk/terms-and-conditions'
const lastUpdated = 'máj 2026'

useLiftagSeo({
  title: 'Obchodné podmienky | LIFTAG',
  description:
    'Podmienky, ktorými sa riadi vaše používanie tréningovej aplikácie LIFTAG — oprávnenosť, zodpovednosť za účet, obsah a prijateľné používanie.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Obchodné podmienky', path },
  ]),
])

const sections = [
  {
    title: 'Oprávnenosť',
    body: 'Na používanie Liftag musíte mať aspoň 16 rokov. Vytvorením alebo používaním účtu potvrdzujete, že túto podmienku spĺňate a že údaje, ktoré poskytujete, sú pravdivé.',
  },
  {
    title: 'Zodpovednosť za účet',
    body: 'Zodpovedáte za svoj účet, prihlasovacie údaje, profilové informácie, tréningy, nahraný obsah a aktivitu v Liftag. Chráňte svoje prihlasovacie údaje a oznámte nám podozrenie na neoprávnený prístup.',
  },
  {
    title: 'Žiadne lekárske poradenstvo',
    body: 'Liftag poskytuje iba sledovanie tréningov, inštruktážny a informačný obsah. Nejde o lekárske poradenstvo, diagnózu, liečbu ani náhradu odbornej zdravotnej starostlivosti. Pred začatím alebo zmenou cvičebného programu sa poraďte s kvalifikovaným odborníkom.',
  },
  {
    title: 'Riziko cvičenia a vybavenia',
    body: 'Cvičenie a vybavenie posilňovne sú spojené s rizikom zranenia. Riaďte sa vlastným úsudkom, pravidlami posilňovne a pokynmi k zariadeniu, prestaňte, ak niečo pôsobí nebezpečne, a v prípade potreby vyhľadajte kvalifikovanú pomoc.',
  },
  {
    title: 'Cviky a video obsah',
    body: 'Popisy cvikov, videá, QR rozlíšenia, rutiny, štatistiky a odporúčania majú informačný charakter a nemusia vyhovovať vášmu telu, vybaveniu alebo okolnostiam. Vy rozhodujete, či a ako budete aktivitu vykonávať.',
  },
  {
    title: 'Nahrávky a používateľský obsah',
    body: 'Ak nahráte fotografie, videá, vlastné cviky, správy alebo iný obsah, musíte mať právo ho zdieľať a musí byť zákonný, rešpektujúci a bezpečný. Obsah, ktorý porušuje tieto podmienky alebo škodí službe, môžeme odstrániť.',
  },
  {
    title: 'Prijateľné používanie',
    body: 'Nezneužívajte Liftag, nenarúšajte službu, nepokúšajte sa o neoprávnený prístup, nenahrávajte škodlivý obsah, nevydávajte sa za iných, neobťažujte používateľov a nepoužívajte aplikáciu na nezákonnú činnosť.',
  },
  {
    title: 'Služby tretích strán',
    body: 'Liftag môže využívať služby tretích strán, napríklad Supabase, Google, Apple, Sentry, Resend, Cloudflare Turnstile, Strava, YouTube/WebView, mapové a lokalizačné služby a S3/AWS úložisko médií. Môžu sa na ne vzťahovať aj ich vlastné podmienky a zásady.',
  },
  {
    title: 'Pozastavenie a ukončenie',
    body: 'Prístup môžeme pozastaviť alebo ukončiť, ak porušíte tieto podmienky, vytvoríte riziko pre iných používateľov alebo službu, alebo ak to vyžaduje zákon. Používanie Liftag môžete ukončiť alebo požiadať o vymazanie účtu v aplikácii.',
  },
  {
    title: 'Zmeny',
    body: 'Tieto podmienky môžeme aktualizovať. Pri podstatných zmenách vás môžeme požiadať o prijatie aktualizovanej verzie pred ďalším používaním produktových funkcií.',
  },
  {
    title: 'Subjekt a rozhodné právo',
    body: 'Tieto podmienky sa riadia príslušnými právnymi predpismi vrátane povinnej ochrany spotrebiteľa, ktorá sa na vás vzťahuje. Prípadné spory budú riešiť súdy alebo orgány, ktoré majú podľa týchto predpisov právomoc.',
  },
  {
    title: 'Kontakt',
    body: 'Otázky k týmto podmienkam nám môžete poslať na:',
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
          <p class="protocol legal-eyebrow">▸ OBCHODNÉ PODMIENKY</p>
          <h1 class="display legal-title">Obchodné <span class="lime">podmienky.</span></h1>
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
