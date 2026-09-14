<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
const props = defineProps<{ reduced: boolean }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { href } = useSiteLocale();
const root = useTemplateRef<HTMLElement>("root");
const unavailable = shallowRef(false);
const simple = computed(() => props.reduced || unavailable.value);
const { film, phase, replay, go } = useDiscoveryScroll(
  root,
  () => simple.value,
);
const beats = computed(() => [
  { protocol: t('discovery.protocolNetwork'), title: t('discovery.titleNetwork'), caption: t('discovery.captionNetwork'), step: t('discovery.stepNetwork') },
  { protocol: t('discovery.protocolReviews'), title: t('discovery.titleReviews'), caption: t('discovery.captionReviews'), step: t('discovery.stepReviews') },
  { protocol: t('discovery.protocolFloor'), title: t('discovery.titleFloor'), caption: t('discovery.captionFloor'), step: t('discovery.stepFloor') },
  { protocol: t('discovery.protocolApp'), title: t('discovery.titleApp'), caption: t('discovery.captionApp'), step: t('discovery.stepApp') },
]);
const beat = computed(() => beats.value[simple.value ? 3 : phase.value] ?? beats.value[0]);
const headline = computed(() =>
  simple.value ? t('discovery.titleNetwork') : beat.value.title,
);
const caption = computed(() =>
  simple.value
    ? t('discovery.simpleCaption')
    : beat.value.caption,
);
</script>
<template>
  <section
    id="discover"
    tabindex="-1"
    ref="root"
    class="gd-story"
    :class="{ 'is-simple': simple }"
    aria-labelledby="gd-title"
  >
    <div class="gd-sticky" :data-phase="phase">
      <GymDiscoveryStage
        :film="film"
        :reduced="simple"
        :replay="replay"
        @open="go(1)"
        @unavailable="unavailable = true"
      />
      <div class="gd-copy">
        <h2 id="gd-title" class="sr-only">{{ headline }}</h2>
        <div class="gd-copy-stage">
          <div v-if="simple" class="gd-copy-swap is-on">
            <p class="gx-protocol">05 / {{ beat.protocol }}</p>
            <div class="gd-copy-title" aria-hidden="true">{{ headline }}</div>
            <p class="gd-caption">{{ caption }}</p>
          </div>
          <template v-else>
            <div
              v-for="(item, index) in beats"
              :key="item.step"
              class="gd-copy-swap"
              :class="{ 'is-on': phase === index }"
              :inert="phase !== index"
              :aria-hidden="phase !== index"
            >
              <p class="gx-protocol">05 / {{ item.protocol }}</p>
              <div class="gd-copy-title" aria-hidden="true">{{ item.title }}</div>
              <p class="gd-caption">{{ item.caption }}</p>
            </div>
          </template>
        </div>
        <div v-if="!simple" class="gd-steps" :aria-label="t('discovery.explore')">
          <button
            v-for="(item, index) in beats"
            :key="item.step"
            :aria-pressed="phase === index"
            @click="go(index)"
          >
            <span class="gd-step-dot" aria-hidden="true" />{{ item.step }}
          </button>
        </div>
        <NuxtLink
          v-if="phase === 3 || simple"
          class="btn-primary gd-link"
          :to="href('/contact/partner')"
          >{{ t('discovery.partner') }}</NuxtLink
        >
      </div>
      <div
        class="gd-profile"
        :class="{ 'is-shown': phase < 2 || simple }"
        :inert="phase !== 1 && !simple"
      >
        <span v-if="!simple" class="gd-profile-island" aria-hidden="true" />
        <div class="gd-profile-photo">
          <img
            src="/assets/screens/gym-detail-560.webp"
            width="560"
            height="1212"
            :alt="t('discovery.profileAlt')"
            loading="lazy"
          />
        </div>
        <div class="gd-profile-info">
          <p class="gx-protocol">{{ t('discovery.place') }}</p>
          <h3>{{ t('discovery.profileTitle') }}</h3>
          <p>
            {{ t('discovery.city') }}, {{ t('discovery.country') }}
            <span aria-hidden="true">↗</span>
          </p>
        </div>
        <div class="gd-review">
          <span class="gd-stars" aria-hidden="true">☆ ☆ ☆ ☆ ☆</span
          ><strong>{{ t('discovery.reviews') }}</strong>
          <p>{{ t('discovery.noReviews') }}</p>
        </div>
        <button v-if="!simple" class="btn-ghost gd-profile-machines" @click="go(2)">
          <HoloPill />{{ t('discovery.exploreFloor') }}
        </button>
        <small>{{ t('discovery.listing') }}</small>
      </div>
      <GymEquipmentInventory v-if="simple" />
      <button
        v-if="!simple && phase === 0"
        class="gd-replay gx-protocol"
        @click="go(0)"
      >
        ↻ {{ t('discovery.replay') }}
      </button>
      <button
        v-if="!simple && phase === 2"
        class="gd-floor-next gx-protocol"
        @click="go(3)"
      >
        {{ t('discovery.floorToApp') }} <span aria-hidden="true">↓</span>
      </button>
    </div>
  </section>
</template>
<style src="~/assets/css/gym-discovery.css"></style>
