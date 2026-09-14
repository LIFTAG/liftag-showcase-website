<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import { useSiteLocale } from '~/composables/useSiteLocale';
const props = defineProps<{ step: number; active: boolean; reduced: boolean }>();
const emit = defineEmits<{ watch: [] }>();
const video = useTemplateRef<HTMLVideoElement>('video');
const { locale } = useSiteLocale();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { exercise, failed, loading } = useGymInstructionPreview(video, () => props.active && props.step === 1, () => props.reduced, false, locale);
const screenshot = computed(() => props.step === 0 ? '/assets/gym3d/log-set.webp' : '/assets/screens/progression-560.webp');
</script>
<template>
  <div class="gx-member-frame" :class="`gx-member-frame--${step}`">
    <figure class="gx-member-machine">
      <img :src="step === 0 ? '/assets/gym3d/leg-press-poster.webp' : '/assets/gym3d/equipment/flat-bench.webp'" width="900" height="900" :alt="step === 0 ? t('member.legPress') : t('member.flatBench')" loading="lazy" />
      <figcaption class="gx-protocol">{{ step === 0 ? t('member.pivotLegPressLabel') : t('member.flatBenchLabel') }}<span>{{ step === 0 ? t('member.connected') : t('member.yourEquipment') }}</span></figcaption>
    </figure>
    <div class="gx-member-connection" aria-hidden="true"><span /><i>→</i></div>
    <div class="gx-demo-phone">
      <img v-if="step === 0 || step === 3" :src="screenshot" width="560" height="1212" :alt="step === 0 ? t('member.legReady') : t('member.progress')" loading="lazy" />
      <div v-else class="gx-guide-screen">
        <div class="gx-guide-screen__bar"><span>‹</span><span>{{ t('member.flatBenchLabel') }}</span><span>•••</span></div>
        <p class="gx-guide-screen__source"><img v-if="step === 1" src="/assets/logo.svg" width="18" height="18" alt="" /><span v-else class="gx-guide-avatar" aria-hidden="true">◎</span>{{ step === 1 ? t('member.guide') : t('member.trainerVideo') }}</p>
        <div class="gx-guide-film">
          <img v-if="step === 1 && (reduced || failed)" class="gx-instruction-still" src="/assets/gym3d/bench-instruction.webp" width="1080" height="603" :alt="t('member.stillAlt')" loading="lazy" />
          <video v-else-if="step === 1" ref="video" :poster="exercise?.imageUrl ?? '/assets/gym3d/bench-instruction.webp'" muted playsinline loop preload="none" :aria-label="t('member.previewAlt')" @error="failed = true" />
          <div v-if="step === 2" class="gx-own-video">
            <img src="/assets/gym3d/equipment/flat-bench.webp" width="900" height="900" :alt="t('member.ownBenchAlt')" loading="lazy" />
            <svg viewBox="0 0 100 70" fill="none" aria-hidden="true"><path d="M8 20V8H25M75 8H92V20M92 50V62H75M25 62H8V50" stroke="currentColor"/><rect x="31" y="23" width="27" height="24" rx="3" stroke="currentColor"/><path d="M58 30L71 24V46L58 40Z" stroke="currentColor"/></svg>
            <span>{{ t('member.ownVideo') }}</span>
          </div>
          <p v-if="step === 1 && (loading || failed)" class="gx-guide-status">{{ failed ? t('member.openGuide') : t('member.opening') }}</p>
        </div>
        <h3>{{ t('canvas.exercise') }}</h3>
        <p class="gx-guide-equipment">{{ t('member.equipment') }}</p>
        <button v-if="step === 1" class="gx-guide-play" @click="emit('watch')">{{ t('member.watch') }}</button>
        <p v-else class="gx-guide-own-note">{{ t('member.filmed') }}</p>
        <small>{{ step === 1 ? t('member.live') : t('member.placement') }}</small>
      </div>
    </div>
    <div v-if="step === 3" class="gx-log-receipt">
      <img src="/assets/screens/log-set-360.webp" width="360" height="779" :alt="t('member.receiptAlt')" loading="lazy" />
      <span class="gx-protocol">{{ t('member.receipt') }} <b>→</b> {{ t('member.receiptSub') }}</span>
    </div>
  </div>
</template>
