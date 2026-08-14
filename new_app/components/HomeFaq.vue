<script setup lang="ts">
import { homeFaqs } from '~/utils/homeFaqs'
</script>

<template>
  <section id="faq" class="home-faq" aria-labelledby="home-faq-title">
    <div class="container">
      <p class="protocol home-faq-eyebrow">Common questions</p>
      <h2 id="home-faq-title" class="display home-faq-title">
        Answers before you <span class="lime">scan.</span>
      </h2>
      <div class="home-faq-list">
        <details
          v-for="item in homeFaqs"
          :key="item.question"
          class="home-faq-item"
        >
          <summary>{{ item.question }}</summary>
          <p>{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-faq {
  padding: 96px 0 40px;
  background: #000;
}

.home-faq-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 16px;
}

.home-faq-title {
  max-width: 16ch;
  margin: 0 0 36px;
  font-size: clamp(40px, 6vw, 84px);
}

.home-faq-list {
  display: grid;
  gap: 10px;
  max-width: 860px;
}

.home-faq-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(11, 18, 21, 0.72);
  padding: 20px 24px;
}

.home-faq-item summary {
  cursor: pointer;
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 20px;
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
}

.home-faq-item p {
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
}

@media (max-width: 620px) {
  .home-faq {
    padding: 72px 0 24px;
  }
}
</style>
