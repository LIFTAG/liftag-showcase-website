<script setup lang="ts">
import { gymFaqsForLocale } from "~/utils/gymscan/content";
import { en, sk } from '~/i18n/messages/gymDemo';
withDefaults(defineProps<{ source?: "experience" | "partner" }>(), {
  source: "experience",
});
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { locale, href } = useSiteLocale();
const root = useTemplateRef<HTMLElement>('root');
const seen = useSeenOnce(root, 0.08);
const faqs = computed(() => gymFaqsForLocale(locale.value).slice(1));
const steps = computed(() =>
  [0, 1, 2].map((i) => ({ title: t(`kit.steps.${i}.title`), copy: t(`kit.steps.${i}.copy`) })),
);
const ledger = computed(() =>
  [0, 1, 2].map((i) => ({ key: t(`kit.ledger.${i}.key`), value: t(`kit.ledger.${i}.value`) })),
);
</script>
<template>
  <section id="kit" ref="root" class="gx-kit" :class="{ 'is-in': seen }" aria-labelledby="gx-kit-title" tabindex="-1">
    <header class="gk-head">
      <div>
        <p class="gx-protocol gk-eyebrow gx-rise"><span class="gx-dot" />{{ t('kit.eyebrow') }}</p>
        <h2 id="gx-kit-title" class="gx-rise" style="--d: 1">{{ t('kit.titleA') }}<br /><em>{{ t('kit.titleB') }}</em></h2>
      </div>
      <p class="gk-lede gx-rise" style="--d: 2">{{ t('kit.body') }}</p>
    </header>

    <ol class="gk-steps" :aria-label="t('kit.stepsLabel')">
      <li v-for="(step, i) in steps" :key="i" class="gx-rise" :style="{ '--d': 3 + i }">
        <span class="gk-steps__icon" aria-hidden="true">
          <svg v-if="i === 0" viewBox="0 0 32 32"><path d="M5 9h22v15H5zM5 10l11 8 11-8" /></svg>
          <svg v-else-if="i === 1" viewBox="0 0 32 32"><path d="M6 6h8v8H6zM18 6h8v8h-8zM6 18h8v8H6zM19 19h2v2h-2zM24 19h2v2h-2zM19 24h2v2h-2zM24 24h2v2h-2z" /></svg>
          <svg v-else viewBox="0 0 32 32"><path d="M11 4h10a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM13 9h6v6h-6zM14 23h4" /></svg>
        </span>
        <span class="gx-protocol gk-steps__idx">0{{ i + 1 }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.copy }}</p>
      </li>
    </ol>

    <div class="gk-grid">
      <aside class="gk-side gx-rise" style="--d: 6">
        <figure class="gk-sticker">
          <img src="/assets/gym3d/qr-sticker.webp" width="827" height="874" :alt="t('kit.tagAlt')" loading="lazy" />
          <figcaption class="gx-protocol">{{ t('kit.tagLabel') }}<br /><span>{{ t('kit.tagSub') }}</span></figcaption>
        </figure>
        <div class="gk-ledger">
          <h3>{{ t('kit.ledgerTitle') }}</h3>
          <dl>
            <div v-for="row in ledger" :key="row.key">
              <dt class="gx-protocol">{{ row.key }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>
          <NuxtLink class="gk-included" :to="href('/pricing')">{{ t('kit.included') }}</NuxtLink>
        </div>
      </aside>
      <div class="gx-kit__form gk-form gx-rise" style="--d: 7">
        <h3>{{ t('kit.partnerTitle') }}</h3>
        <GymKitForm :source="source" theme="dark" />
      </div>
    </div>

    <div class="gk-faqs">
      <details v-for="faq in faqs" :key="faq.question">
        <summary>{{ faq.question }}<span aria-hidden="true">+</span></summary>
        <p>{{ faq.answer }}</p>
      </details>
    </div>
  </section>
</template>
<style src="~/assets/css/gym-kit.css"></style>
