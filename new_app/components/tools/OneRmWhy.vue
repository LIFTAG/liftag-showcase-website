<script setup lang="ts">
import { STRENGTH_COMPARISON_COUNT } from '~/utils/strengthStandards'
import { en, sk } from '~/i18n/messages/tools'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })

const reasons = computed(() => [0, 1, 2, 3].map(index => ({ n: String(index + 1).padStart(2, '0'), title: t(`tools.why.reasons.${index}.title`, { count: STRENGTH_COMPARISON_COUNT }), body: t(`tools.why.reasons.${index}.body`, { count: STRENGTH_COMPARISON_COUNT }) })))
</script>

<template>
  <section id="why" class="why" aria-labelledby="why-title">
    <div class="why-claim">
      <p class="why-eyebrow">{{ t('tools.why.eyebrow') }}</p>
      <h2 id="why-title" class="why-title">{{ t('tools.why.title') }}<span class="why-dot" aria-hidden="true">.</span></h2>
      <p class="why-lead">{{ t('tools.why.lead1') }}</p>
      <p class="why-lead">{{ t('tools.why.lead2', { count: STRENGTH_COMPARISON_COUNT }) }}</p>
      <p class="why-close">{{ t('tools.why.close') }}</p>
    </div>
    <ol class="why-list">
      <li v-for="reason in reasons" :key="reason.n" class="why-item">
        <span class="why-index" aria-hidden="true">{{ reason.n }}</span>
        <div class="why-item-copy">
          <h3 class="why-item-title">{{ reason.title }}</h3>
          <p class="why-item-body">{{ reason.body }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.why {
  display: grid;
  grid-template-columns: minmax(240px, 0.92fr) minmax(0, 1.15fr);
  gap: 28px 72px;
  align-items: start;
  padding: 56px 0 12px;
  margin-top: 36px;
  border-top: 1px solid oklch(26% .006 115);
  scroll-margin-top: 100px;
}
.why-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: .13em;
  text-transform: uppercase;
}
.why-title {
  margin: 0;
  max-width: 16ch;
  font-family: var(--liftag-font-headline);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -.05em;
  line-height: 1.12;
  text-wrap: balance;
}
.why-dot { color: var(--liftag-primary); }
.why-lead,
.why-close,
.why-item-body {
  color: oklch(73% .009 115);
  font-size: 14px;
  line-height: 1.75;
}
.why-lead {
  margin: 16px 0 0;
  max-width: 46ch;
}
.why-close {
  margin: 18px 0 0;
  max-width: 42ch;
  color: oklch(96% .007 115);
  font-weight: 500;
}
.why-list {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.why-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  padding: 18px 0;
  border-top: 1px solid oklch(26% .006 115);
}
.why-item:first-child { border-top: 0; padding-top: 0; }
.why-item:last-child { padding-bottom: 4px; }
.why-index {
  padding-top: 3px;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: .06em;
}
.why-item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -.02em;
  line-height: 1.3;
}
.why-item-body { margin: 6px 0 0; max-width: 62ch; }
@media (max-width: 900px) {
  .why { grid-template-columns: 1fr; gap: 28px; padding: 40px 0 4px; margin-top: 28px; }
  .why-title { font-size: 28px; max-width: 16ch; }
}
@media (max-width: 700px) {
  .why-title { font-size: 25px; }
  .why-item { grid-template-columns: 32px minmax(0, 1fr); gap: 10px; padding: 16px 0; }
}
</style>
