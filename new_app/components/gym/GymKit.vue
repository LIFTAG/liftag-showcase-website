<script setup lang="ts">
import { gymFaqsForLocale } from "~/utils/gymscan/content";
import { en, sk } from '~/i18n/messages/gymDemo';
withDefaults(defineProps<{ source?: "experience" | "partner" }>(), {
  source: "experience",
});
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { locale, href } = useSiteLocale();
const faqs = computed(() => gymFaqsForLocale(locale.value).slice(1));
</script>
<template>
  <section id="kit" class="gx-kit" aria-labelledby="gx-kit-title" tabindex="-1">
    <div class="gx-kit__intro">
      <p class="gx-protocol"><GymHeroEntry row><span class="gx-dot" /> {{ t('kit.eyebrow') }}</GymHeroEntry></p>
      <h2 id="gx-kit-title">
        <GymHeroEntry row>{{ t('kit.titleA') }}</GymHeroEntry><br /><GymHeroEntry :delay="90"><em>{{ t('kit.titleB') }}</em></GymHeroEntry>
      </h2>
      <p><GymHeroEntry :delay="180">{{ t('kit.body') }}</GymHeroEntry></p>
      <div class="gx-kit__tag">
        <img
          src="/assets/gym3d/qr-sticker.webp"
          width="827"
          height="874"
          :alt="t('kit.tagAlt')"
          loading="lazy"
        /><span class="gx-protocol"><GymHeroEntry :delay="240">{{ t('kit.tagLabel') }}<br />{{ t('kit.tagSub') }}</GymHeroEntry></span>
      </div>
      <details class="gx-included">
        <summary>{{ t('kit.free') }} <span aria-hidden="true">+</span></summary>
        <p>{{ t('kit.freeBody') }}</p>
        <NuxtLink :to="href('/pricing')">{{ t('kit.included') }}</NuxtLink>
      </details>
    </div>
    <div class="gx-kit__form">
      <h3><GymHeroEntry :delay="80">{{ t('kit.partnerTitle') }}</GymHeroEntry></h3>
      <GymKitForm :source="source" theme="dark" />
    </div>
    <div class="gx-faqs">
      <details v-for="faq in faqs" :key="faq.question">
        <summary>{{ faq.question }}<span aria-hidden="true">+</span></summary>
        <p>{{ faq.answer }}</p>
      </details>
    </div>
  </section>
</template>
