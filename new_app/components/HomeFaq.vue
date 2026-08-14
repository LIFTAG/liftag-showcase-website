<script setup lang="ts">
import { homeFaqs } from '~/utils/homeFaqs'

const openFaq = ref(0)
const measured = ref(false)
const answerHeights = ref<number[]>(homeFaqs.map(() => 0))
const innerRefs = ref<(HTMLElement | null)[]>([])

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? -1 : index
}

function faqIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function panelId(index: number) {
  return `home-faq-panel-${index}`
}

function questionId(index: number) {
  return `home-faq-q-${index}`
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
  if (!measured.value) return undefined
  const height = answerHeights.value[index]
  return {
    gridTemplateRows: openFaq.value === index && height ? `${height}px` : '0px',
  }
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
  <section id="faq" class="home-faq" aria-labelledby="home-faq-title">
    <div class="section-glow is-green" aria-hidden="true" />
    <div class="container">
      <div class="home-faq-split">
        <header class="home-faq-intro reveal">
          <p class="protocol home-faq-eyebrow">Common questions</p>
          <h2 id="home-faq-title" class="display home-faq-title">
            Answers before you <span class="lime">scan.</span>
          </h2>
        </header>

        <div class="home-faq-list reveal">
          <div
            v-for="(item, index) in homeFaqs"
            :key="item.question"
            class="home-faq-item"
            :class="{ 'is-open': openFaq === index }"
          >
            <button
              :id="questionId(index)"
              type="button"
              class="home-faq-q"
              :aria-expanded="openFaq === index"
              :aria-controls="panelId(index)"
              @click="toggleFaq(index)"
            >
              <span class="home-faq-index" aria-hidden="true">{{ faqIndex(index) }}</span>
              <span class="home-faq-q-text">{{ item.question }}</span>
              <span class="home-faq-plus" aria-hidden="true">+</span>
            </button>
            <div
              :id="panelId(index)"
              class="home-faq-a"
              role="region"
              :aria-labelledby="questionId(index)"
              :aria-hidden="openFaq !== index"
              :style="panelStyle(index)"
            >
              <div
                class="home-faq-a-inner"
                :ref="(el) => setInnerRef(el as Element | null, index)"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-faq {
  position: relative;
  overflow: hidden;
  padding: 120px 0;
  border-top: 1px solid var(--liftag-border-soft);
  background: #050607;
}

.home-faq .section-glow {
  --glow-top: 18%;
  --glow-right: -8%;
  --glow-size: 520px;
}

.home-faq-split {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
}

.home-faq-intro {
  position: sticky;
  top: 108px;
}

.home-faq-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 20px;
}

.home-faq-title {
  max-width: 9ch;
  margin: 0;
  font-size: clamp(36px, 4.4vw, 64px);
}

.home-faq-list {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.home-faq-item {
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-sm);
  background: rgba(11, 18, 21, 0.72);
  overflow: hidden;
  transition:
    border-color 240ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.home-faq-item:hover {
  border-color: rgba(255, 255, 255, 0.16);
}

.home-faq-item.is-open {
  border-color: rgba(204, 255, 0, 0.38);
  background: rgba(16, 22, 12, 0.88);
  box-shadow:
    0 0 0 1px rgba(204, 255, 0, 0.08),
    0 0 28px rgba(204, 255, 0, 0.08);
}

.home-faq-item.is-open:hover {
  border-color: rgba(204, 255, 0, 0.5);
}

.home-faq-q {
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

.home-faq-q:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.82);
  outline-offset: -2px;
}

.home-faq-index {
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

.home-faq-item.is-open .home-faq-index {
  color: var(--liftag-primary);
}

.home-faq-q-text {
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

.home-faq-plus {
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

.home-faq-item.is-open .home-faq-plus {
  transform: rotate(45deg);
}

.home-faq-a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 380ms cubic-bezier(0.16, 1, 0.3, 1);
}

.home-faq-item.is-open .home-faq-a {
  grid-template-rows: 1fr;
}

.home-faq-a-inner {
  min-height: 0;
  overflow: hidden;
}

.home-faq-a p {
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

.home-faq-item.is-open .home-faq-a p {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 860px) {
  .home-faq {
    padding: 88px 0;
  }

  .home-faq-split {
    grid-template-columns: minmax(0, 1fr);
    gap: 36px;
  }

  .home-faq-intro {
    position: static;
  }

  .home-faq-title {
    max-width: 12ch;
  }

  .home-faq-a p {
    padding-left: 22px;
  }
}

@media (max-width: 620px) {
  .home-faq-q {
    min-height: 64px;
    padding: 16px 16px;
    gap: 12px;
  }

  .home-faq-a p {
    padding: 0 16px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-faq-item,
  .home-faq-index,
  .home-faq-plus,
  .home-faq-a,
  .home-faq-a p {
    transition: none;
  }

  .home-faq-a p {
    transform: none;
  }
}
</style>
