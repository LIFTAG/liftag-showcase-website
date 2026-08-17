<script setup lang="ts">
import { faqIndexLabel, faqPanelStyle, nextOpenFaq } from '~/utils/faqAccordion'

const props = withDefaults(defineProps<{
  items: { question: string, answer: string }[]
  idPrefix?: string
  initiallyOpen?: number
}>(), {
  idPrefix: 'faq',
  initiallyOpen: 0,
})

const openFaq = ref(props.initiallyOpen)
const measured = ref(false)
const answerHeights = ref<number[]>(props.items.map(() => 0))
const innerRefs = ref<(HTMLElement | null)[]>([])

function toggleFaq(index: number) {
  openFaq.value = nextOpenFaq(openFaq.value, index)
}

function panelId(index: number) {
  return `${props.idPrefix}-panel-${index}`
}

function questionId(index: number) {
  return `${props.idPrefix}-q-${index}`
}

function setInnerRef(el: Element | null, index: number) {
  innerRefs.value[index] = el instanceof HTMLElement ? el : null
}

function measureAnswers() {
  innerRefs.value.forEach((el, index) => {
    if (!el) return
    answerHeights.value[index] = el.scrollHeight
  })
  measured.value = answerHeights.value.some(height => height > 0)
}

function panelStyle(index: number) {
  return faqPanelStyle(measured.value, openFaq.value === index, answerHeights.value[index] ?? 0)
}

onMounted(() => {
  nextTick(measureAnswers)
  window.addEventListener('resize', measureAnswers)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureAnswers)
})

watch(openFaq, () => {
  nextTick(measureAnswers)
})
</script>

<template>
  <div class="faq-accordion">
    <div
      v-for="(item, index) in items"
      :key="item.question"
      class="faq-item"
      :class="{ 'is-open': openFaq === index }"
    >
      <button
        :id="questionId(index)"
        type="button"
        class="faq-q"
        :aria-expanded="openFaq === index"
        :aria-controls="panelId(index)"
        @click="toggleFaq(index)"
      >
        <span class="faq-index" aria-hidden="true">{{ faqIndexLabel(index) }}</span>
        <span class="faq-q-text">{{ item.question }}</span>
        <span class="faq-plus" aria-hidden="true">+</span>
      </button>
      <div
        :id="panelId(index)"
        class="faq-a"
        role="region"
        :aria-labelledby="questionId(index)"
        :aria-hidden="openFaq !== index"
        :style="panelStyle(index)"
      >
        <div
          class="faq-a-inner"
          :ref="(el) => setInnerRef(el as Element | null, index)"
        >
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-accordion {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.faq-item {
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-sm);
  background: rgba(11, 18, 21, 0.72);
  overflow: hidden;
  transition:
    border-color 240ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item:hover {
  border-color: rgba(255, 255, 255, 0.16);
}

.faq-item.is-open {
  border-color: rgba(204, 255, 0, 0.38);
  background: rgba(16, 22, 12, 0.88);
  box-shadow:
    0 0 0 1px rgba(204, 255, 0, 0.08),
    0 0 28px rgba(204, 255, 0, 0.08);
}

.faq-item.is-open:hover {
  border-color: rgba(204, 255, 0, 0.5);
}

.faq-q {
  width: 100%;
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.faq-q:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.82);
  outline-offset: -2px;
}

.faq-index {
  flex-shrink: 0;
  width: 2.4ch;
  color: rgba(255, 255, 255, 0.34);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  font-style: normal;
  letter-spacing: 0.08em;
  transition: color 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item.is-open .faq-index {
  color: var(--liftag-primary);
}

.faq-q-text {
  flex: 1;
  min-width: 0;
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: clamp(16px, 1.7vw, 19px);
  font-weight: 700;
  font-style: italic;
  letter-spacing: -0.01em;
  line-height: 1.25;
  text-transform: uppercase;
}

.faq-plus {
  flex-shrink: 0;
  width: 22px;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 22px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  transition: transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item.is-open .faq-plus {
  transform: rotate(45deg);
}

.faq-a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 380ms cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item.is-open .faq-a {
  grid-template-rows: 1fr;
}

.faq-a-inner {
  min-height: 0;
  overflow: hidden;
}

.faq-a p {
  max-width: 62ch;
  margin: 0;
  padding: 0 22px 22px 66px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 280ms cubic-bezier(0.16, 1, 0.3, 1) 40ms,
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1) 40ms;
}

.faq-item.is-open .faq-a p {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 860px) {
  .faq-a p {
    padding-left: 22px;
  }
}

@media (max-width: 620px) {
  .faq-q {
    min-height: 64px;
    padding: 16px 16px;
    gap: 12px;
  }

  .faq-a p {
    padding: 0 16px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .faq-index,
  .faq-plus,
  .faq-a,
  .faq-a p {
    transition: none;
  }

  .faq-a p {
    transform: none;
  }
}
</style>
