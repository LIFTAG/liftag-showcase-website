<script setup lang="ts">
const props = defineProps<{ step: number; active: boolean; reduced: boolean }>();
const emit = defineEmits<{ watch: [] }>();
const video = useTemplateRef<HTMLVideoElement>('video');
const { exercise, failed, loading } = useGymInstructionPreview(video, () => props.active && props.step === 1, () => props.reduced);
const screenshot = computed(() => props.step === 0 ? '/assets/gym3d/log-set.webp' : '/assets/screens/progression-560.webp');
</script>
<template>
  <div class="gx-member-frame" :class="`gx-member-frame--${step}`">
    <figure class="gx-member-machine">
      <img :src="step === 0 ? '/assets/gym3d/leg-press-poster.webp' : '/assets/gym3d/equipment/flat-bench.webp'" width="900" height="900" :alt="step === 0 ? 'The tagged pivot leg press' : 'Flat bench, the equipment used for this instruction'" loading="lazy" />
      <figcaption class="gx-protocol">{{ step === 0 ? 'PIVOT LEG PRESS' : 'FLAT BENCH' }}<span>{{ step === 0 ? 'QR / NFC CONNECTED' : 'YOUR EQUIPMENT' }}</span></figcaption>
    </figure>
    <div class="gx-member-connection" aria-hidden="true"><span /><i>→</i></div>
    <div class="gx-demo-phone">
      <img v-if="step === 0 || step === 3" :src="screenshot" width="560" height="1212" :alt="step === 0 ? 'Pivot leg press identified in LIFTAG, ready to log a set' : 'Real LIFTAG bench press progress screen showing logged training'" loading="lazy" />
      <div v-else class="gx-guide-screen">
        <div class="gx-guide-screen__bar"><span>‹</span><span>FLAT BENCH</span><span>•••</span></div>
        <p class="gx-guide-screen__source"><img v-if="step === 1" src="/assets/logo.svg" width="18" height="18" alt="" /><span v-else class="gx-guide-avatar" aria-hidden="true">◎</span>{{ step === 1 ? 'LIFTAG guide' : 'Your trainer’s video' }}</p>
        <div class="gx-guide-film">
          <img v-if="step === 1 && (reduced || failed)" class="gx-instruction-still" src="/assets/gym3d/bench-instruction.webp" width="1080" height="603" alt="EZ-bar skullcrusher instruction still showing the exercise on a flat bench" loading="lazy" />
          <video v-else-if="step === 1" ref="video" :poster="exercise?.imageUrl ?? '/assets/gym3d/bench-instruction.webp'" muted playsinline loop preload="none" aria-label="Silent EZ-Bar Skullcrusher instruction preview" @error="failed = true" />
          <div v-if="step === 2" class="gx-own-video">
            <img src="/assets/gym3d/equipment/flat-bench.webp" width="900" height="900" alt="Your own bench inside a video framing guide" loading="lazy" />
            <svg viewBox="0 0 100 70" fill="none" aria-hidden="true"><path d="M8 20V8H25M75 8H92V20M92 50V62H75M25 62H8V50" stroke="currentColor"/><rect x="31" y="23" width="27" height="24" rx="3" stroke="currentColor"/><path d="M58 30L71 24V46L58 40Z" stroke="currentColor"/></svg>
            <span>YOUR VIDEO HERE</span>
          </div>
          <p v-if="step === 1 && (loading || failed)" class="gx-guide-status">{{ failed ? 'Open the exercise guide below' : 'Opening the real instruction…' }}</p>
        </div>
        <h3>EZ-Bar<br />Skullcrusher</h3>
        <p class="gx-guide-equipment">Flat bench + EZ bar</p>
        <button v-if="step === 1" class="gx-guide-play" @click="emit('watch')">▷ Watch with controls</button>
        <p v-else class="gx-guide-own-note">Filmed by your trainer.<br />On your machine.</p>
        <small>{{ step === 1 ? 'Live catalog instruction' : 'Example placement for your upload' }}</small>
      </div>
    </div>
    <div v-if="step === 3" class="gx-log-receipt">
      <img src="/assets/screens/log-set-360.webp" width="360" height="779" alt="A bench press set logged in the real LIFTAG app" loading="lazy" />
      <span class="gx-protocol">LOG THE SET <b>→</b> SEE YOUR PROGRESS</span>
    </div>
  </div>
</template>
