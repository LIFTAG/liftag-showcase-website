<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
/**
 * Desktop counterpart to StoreEscape. A laptop cannot open the shared app
 * destination, so this page moves it to the visitor's phone: the QR code
 * first, the copyable link second, the stores last for anyone without LIFTAG.
 * The shared resource may be private, so callers pass generic copy only.
 */
defineProps<{
  /** Absolute HTTPS share URL, query included, exactly as the phone should open it. */
  shareUrl: string
  kicker: string
  heading: string
  body: string
}>()

const { href } = useSiteLocale()

const stores = [
  { id: 'apple', name: 'App Store', url: APP_STORE_URL },
  { id: 'google', name: 'Google Play', url: PLAY_STORE_URL },
] as const
</script>

<template>
  <div class="handoff">
    <ExerciseWall />
    <div class="handoff__shade" aria-hidden="true" />

    <header class="handoff__bar">
      <a :href="href('/')" class="handoff__brand">
        <img src="/assets/logo.svg" width="26" height="26" alt="" class="handoff__logo">
        <span class="handoff__wordmark">LIFTAG</span>
      </a>
    </header>

    <main class="handoff__main">
      <div class="handoff__intro">
        <p class="protocol handoff__kicker">{{ kicker }}</p>
        <h1 class="display handoff__title">{{ heading }}</h1>
        <p class="handoff__body">{{ body }}</p>
      </div>

      <div class="handoff__scan">
        <ShareQrCode :value="shareUrl" :label="t('handoff.qrLabel')" size="clamp(232px, min(24vw, 44vh), 336px)" />
      </div>

      <ShareLinkField class="handoff__link" :url="shareUrl" />
    </main>

    <footer class="handoff__foot">
      <p class="handoff__foot-copy">{{ t('handoff.desktopNoApp') }}</p>
      <ul class="handoff__stores">
        <li v-for="store in stores" :key="store.id">
          <a :href="store.url" class="handoff__store" target="_blank" rel="noopener">
            <svg
              v-if="store.id === 'apple'"
              class="handoff__store-icon"
              viewBox="0 0 31.4 37.63"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M26.226 20.011c-.043-4.754 3.993-7.066 4.177-7.174C28.117 9.587 24.574 9.144 23.329 9.108c-2.975-.305-5.862 1.736-7.378 1.736-1.546 0-3.88-1.706-6.396-1.656-3.237.048-6.266 1.876-7.927 4.714-3.428 5.786-.371 14.29 2.913 18.967C5.684 35.16 7.604 37.717 10.116 37.627c2.459-.099 3.377-1.528 6.344-1.528 2.939 0 3.801 1.528 6.364 1.471 2.638-.042 4.3-2.301 5.885-4.613 1.899-2.625 2.661-5.211 2.691-5.344-.062-.02-5.124-1.904-5.174-7.602Z" />
              <path d="M21.385 6.031C22.708 4.419 23.612 2.226 23.361 0 21.447.083 19.054 1.291 17.676 2.867c-1.219 1.39-2.309 3.667-2.027 5.809 2.149.156 4.357-1.058 5.736-2.645Z" />
            </svg>
            <svg
              v-else
              class="handoff__store-icon"
              viewBox="0 0 36 40"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.5 2.9c-.7.5-1.1 1.4-1.1 2.7v28.8c0 1.2.4 2.1 1.1 2.7L20.1 20 3.5 2.9ZM24.5 15.5l-4.4 4.5 4.4 4.5 6.2-3.5c1.8-1 1.8-2.9 0-3.9l-6.2-3.6ZM3.5 2.9 20.1 20l4.4-4.5L6.6 1.5c-1.2-.9-2.3-.9-3.1 1.4ZM3.5 37.1c.8 2.3 1.9 2.3 3.1 1.4l17.9-14-4.4-4.5L3.5 37.1Z" />
            </svg>
            {{ store.name }}
            <span class="sr-only">{{ t('handoff.newTab') }}</span>
          </a>
        </li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.handoff {
  position: relative;
  isolation: isolate;
  min-height: var(--liftag-stable-vh);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background: var(--liftag-bg);
  color: var(--liftag-fg);
}

/* Holds the exercise wall down: near-black under the copy, lifting toward the
   code so the tiles read as a room the code sits in. */
.handoff__shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 22%, transparent 70%, rgba(0, 0, 0, 0.92) 100%),
    linear-gradient(90deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 32%, rgba(0, 0, 0, 0.6) 58%, rgba(0, 0, 0, 0.5) 100%);
}

.handoff__bar,
.handoff__main,
.handoff__foot {
  position: relative;
  width: min(1200px, calc(100% - 64px));
  margin-inline: auto;
}

.handoff__bar {
  padding-top: clamp(24px, 4.5vh, 40px);
}

.handoff__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: var(--liftag-r-sm);
  color: var(--liftag-fg);
  text-decoration: none;
}

.handoff__brand:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: 6px;
}

.handoff__logo {
  display: block;
  filter: drop-shadow(0 0 12px rgba(204, 255, 0, 0.4));
}

.handoff__wordmark {
  padding-right: 0.16em;
  font-family: var(--liftag-font-headline);
  font-size: 20px;
  font-style: italic;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.handoff__main {
  align-self: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'intro scan'
    'link scan';
  column-gap: clamp(48px, 7vw, 120px);
  padding-block: clamp(20px, 4vh, 64px);
}

.handoff__intro {
  grid-area: intro;
  align-self: end;
}

.handoff__kicker {
  margin-bottom: clamp(16px, 2.6vh, 24px);
  color: var(--liftag-primary);
}

.handoff__title {
  max-width: 16ch;
  /* Height counts too: a 720px laptop must fit the page without scrolling. */
  font-size: clamp(40px, min(5.2vw, 8vh), 80px);
  color: var(--liftag-fg);
}

.handoff__body {
  max-width: 34ch;
  margin-top: clamp(18px, 3vh, 26px);
  color: var(--liftag-fg-mid);
  font-size: 18px;
  font-weight: 300;
  line-height: 1.6;
}

/* Light under the code only: it is where the eye should land. */
.handoff__scan {
  grid-area: scan;
  align-self: center;
  position: relative;
  isolation: isolate;
}

.handoff__scan::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -45%;
  background: radial-gradient(closest-side, rgba(204, 255, 0, 0.2), rgba(204, 255, 0, 0.06) 55%, transparent);
  pointer-events: none;
}

.handoff__link {
  grid-area: link;
  align-self: start;
  max-width: 470px;
  margin-top: clamp(28px, 4.5vh, 48px);
}

.handoff__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 32px;
  padding: 20px 0 clamp(20px, 3.5vh, 32px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.handoff__foot-copy {
  color: var(--liftag-fg-soft);
  font-size: 14px;
  line-height: 1.55;
}

.handoff__stores {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.handoff__store {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--liftag-r-pill);
  background: rgba(14, 14, 14, 0.7);
  color: var(--liftag-fg-mid);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 200ms var(--ease-out-quart),
    border-color 200ms var(--ease-out-quart);
}

.handoff__store-icon {
  width: 14px;
  height: 16px;
  flex: 0 0 auto;
}

@media (hover: hover) and (pointer: fine) {
  .handoff__store:hover {
    border-color: rgba(204, 255, 0, 0.5);
    color: var(--liftag-fg);
  }
}

.handoff__store:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.7);
  outline-offset: 3px;
}

/* Narrow windows stack in reading order: the code comes straight after the
   instruction that points at it. */
@media (max-width: 860px) {
  .handoff__shade {
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.78) 40%, rgba(0, 0, 0, 0.78) 70%, rgba(0, 0, 0, 0.94) 100%);
  }

  .handoff__bar,
  .handoff__main,
  .handoff__foot {
    width: min(560px, calc(100% - 40px));
  }

  .handoff__main {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'intro'
      'scan'
      'link';
    justify-items: center;
    text-align: center;
  }

  .handoff__title,
  .handoff__body {
    margin-inline: auto;
  }

  .handoff__scan {
    margin-top: 40px;
  }

  .handoff__link {
    width: 100%;
    margin-top: 40px;
    text-align: left;
  }

  .handoff__foot {
    flex-direction: column;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .handoff__store {
    transition: none;
  }
}
</style>
