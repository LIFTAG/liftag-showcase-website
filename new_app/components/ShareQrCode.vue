<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
/**
 * A QR code for a share URL, in the same prism frame as the install code. It is
 * encoded in-process and drawn as inline SVG, so it ships in the server HTML
 * and the URL never leaves this site. The frame's icon sits in a square the
 * encoder leaves empty, so no module is cut in half at its edge.
 */
const props = defineProps<{
  value: string
  /** Accessible name for the code. */
  label: string
  /** Width of the code, quiet zone included. */
  size: string
}>()

const qr = computed(() => {
  try {
    return qrCodeSvg(props.value, { markRatio: QR_LOGO_RATIO })
  }
  catch {
    return null
  }
})
const markSize = computed(() =>
  qr.value ? `calc(var(--qr-frame-size) * ${qr.value.mark / qr.value.size})` : undefined)
</script>

<template>
  <QrPrismFrame v-if="qr" :size="size" padding="12px" :mark-size="markSize">
    <svg
      class="share-qr__code"
      :viewBox="`0 0 ${qr.size} ${qr.size}`"
      role="img"
      :aria-label="label"
      shape-rendering="crispEdges"
    >
      <path :d="qr.path" fill="#0a0c07" />
    </svg>
  </QrPrismFrame>

  <!-- No prism rim: it marks something to scan, and there is nothing here. -->
  <div v-else class="share-qr__error" :style="{ '--share-qr-size': size }">
    <svg class="share-qr__error-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" stroke="currentColor" stroke-width="1.6" />
      <path d="M14 14l6 6M20 14l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
    <p class="share-qr__error-text">{{ t('handoff.qrError') }}</p>
  </div>
</template>

<style scoped>
.share-qr__code {
  display: block;
  width: 100%;
  height: auto;
}

.share-qr__error {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 16px;
  width: var(--share-qr-size);
  aspect-ratio: 1;
  padding: 28px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: var(--liftag-r-xl);
  background: rgba(14, 14, 14, 0.92);
  text-align: center;
}

.share-qr__error-icon {
  width: 36px;
  height: 36px;
  color: var(--liftag-fg-dim);
}

.share-qr__error-text {
  max-width: 24ch;
  color: var(--liftag-fg-soft);
  font-size: 15px;
  line-height: 1.5;
}
</style>
