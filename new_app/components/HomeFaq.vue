<script setup lang="ts">
import { homeFaqs } from '~/utils/homeFaqs'
</script>

<template>
  <section id="faq" class="home-faq" aria-labelledby="home-faq-title">
    <div class="section-glow is-green" aria-hidden="true" />
    <div class="container">
      <div class="home-faq-split">
        <header class="home-faq-intro">
          <p class="protocol home-faq-eyebrow reveal">Common questions</p>
          <h2 id="home-faq-title" class="display home-faq-title reveal plate-title">
            <span class="plate-wipe">Answers before you <span class="lime">scan.</span></span>
          </h2>
        </header>

        <FaqAccordion
          class="reveal"
          :items="homeFaqs"
          id-prefix="home-faq"
        />
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
  top: calc(108px + var(--liftag-safe-top));
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
}
</style>
