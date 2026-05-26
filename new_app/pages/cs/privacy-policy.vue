<script setup lang="ts">
const path = '/cs/privacy-policy'
const lastUpdated = 'květen 2026'

useLiftagSeo({
  title: 'Zásady ochrany osobních údajů | LIFTAG',
  description:
    'Jak LIFTAG shromažďuje, používá, ukládá a chrání vaše osobní údaje při používání tréninkové aplikace LIFTAG.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Ochrana osobních údajů', path },
  ]),
])

const sections = [
  {
    title: 'Úvod',
    body: 'Liftag je aplikace pro sledování tréninků provozovaná společností LIFTAG. Tyto Zásady ochrany osobních údajů vysvětlují, jaké osobní údaje shromažďujeme, jak je používáme a jak můžete uplatnit svá práva.',
  },
  {
    title: 'Údaje, které shromažďujeme',
    body: 'Můžeme shromažďovat údaje o účtu, jako je jméno, e-mail, poskytovatel přihlášení, datum narození, pohlaví, preferované jednotky, nastavení profilu a zprávy podpoře; tělesné údaje, jako je výška a hmotnost; tréninková data, jako jsou relace, cviky, série, opakování, váhy, doba trvání, rutiny, plány, cíle, pokrok a nastavení sdílení s trenérem; nahraný obsah, například média vlastních cviků; přibližnou nebo přesnou polohu, pokud povolíte detekci posilovny nebo mapové funkce; údaje o zařízení, aplikaci, diagnostice, pádech a session replay.',
  },
  {
    title: 'Jak vaše údaje používáme',
    body: 'Vaše údaje používáme k vytvoření a zabezpečení vašeho účtu, k poskytování sledování tréninků a funkcí QR/posilovna, k synchronizaci dat mezi zařízeními, k zobrazení historie a pokroku, k podpoře funkcí pro trenéry a sdílení, ke zpracování žádostí o podporu, k prevenci zneužití, k řešení pádů, ke zlepšování kvality aplikace a ke splnění zákonných povinností.',
  },
  {
    title: 'Ukládání a zabezpečení údajů',
    body: 'Data jsou ukládána u poskytovatelů služeb včetně Supabase a úložiště médií S3/AWS. Používáme technická a organizační opatření, jako je ověřený přístup k API a šifrování při přenosu, ale žádná služba nemůže zaručit absolutní bezpečnost.',
  },
  {
    title: 'Služby třetích stran',
    body: 'Používáme služby třetích stran včetně Supabase pro autentizaci, databázi a úložiště; Google a Apple pro přihlášení; Sentry, včetně session replay, pro diagnostiku; Resend pro e-mail; Cloudflare Turnstile pro prevenci zneužití; Strava, pokud ji připojíte; YouTube/WebView pro video obsah; mapové a lokalizační služby pro vyhledávání posiloven; a úložiště S3/AWS pro nahrávaná média.',
  },
  {
    title: 'Vaše práva',
    body: 'V závislosti na místě, kde žijete, můžete mít právo na přístup ke svým osobním údajům, jejich opravu, vymazání, export, omezení nebo na vznesení námitky proti jejich zpracování a právo odvolat souhlas, pokud je zpracování založeno na souhlasu. O vymazání účtu můžete požádat v aplikaci nebo nás kontaktovat.',
  },
  {
    title: 'Uchovávání údajů',
    body: 'Osobní údaje uchováváme po dobu nezbytně nutnou k poskytování Liftag, zachování bezpečnosti, řešení sporů, splnění zákonných povinností a uchování legitimních obchodních záznamů. Když svůj účet vymažete, údaje o účtu vymažeme nebo anonymizujeme, pokud jejich uchování nevyžaduje nebo nepovoluje zákon.',
  },
  {
    title: 'Ochrana soukromí dětí',
    body: 'Liftag není určen pro osoby mladší 16 let. Vědomě neumožňujeme uživatelům mladším 16 let vytvářet účty ani používat funkce produktu. Pokud je vám méně než 16 let, Liftag nepoužívejte.',
  },
  {
    title: 'Změny těchto zásad',
    body: 'Tyto Zásady ochrany osobních údajů můžeme čas od času aktualizovat. V případě podstatných změn vás můžeme informovat v aplikaci nebo vás požádat o přijetí aktualizované verze před dalším používáním funkcí produktu.',
  },
  {
    title: 'Kontaktujte nás',
    body: 'Pokud máte otázky týkající se těchto Zásad ochrany osobních údajů nebo vašich osobních údajů, kontaktujte nás na:',
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
          <p class="protocol legal-eyebrow">▸ OCHRANA OSOBNÍCH ÚDAJŮ</p>
          <h1 class="display legal-title">Ochrana osobních <span class="lime">údajů.</span></h1>
          <p class="legal-updated">Poslední aktualizace: {{ lastUpdated }}</p>
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
