<script setup lang="ts">
/**
 * Catalog tile mirroring the app's machine-exercise grid: 3:2 photo,
 * name + muscle footer, play badge when an instruction video exists.
 */
defineProps<{
  to: string
  name: string
  imageUrl: string | null
  label?: string | null
  hasVideo?: boolean
}>()
</script>

<template>
  <NuxtLink :to="to" class="ex-tile">
    <span class="ex-tile__media">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="ex-tile__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
      <span v-if="hasVideo" class="ex-tile__play" aria-hidden="true">
        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
          <path d="M0 0.9c0-.7.8-1.2 1.4-.8l8 5.1c.6.4.6 1.2 0 1.6l-8 5.1c-.6.4-1.4-.1-1.4-.8V.9Z" />
        </svg>
      </span>
    </span>
    <span class="ex-tile__body">
      <span class="ex-tile__name">{{ name }}</span>
      <span v-if="label" class="ex-tile__label">{{ label }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ex-tile {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-lg);
  background: var(--liftag-secondary);
  text-decoration: none;
  transition: border-color 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ex-tile:hover {
  border-color: rgba(204, 255, 0, 0.45);
  transform: translateY(-2px);
}

.ex-tile__media {
  position: relative;
  display: block;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--liftag-surface-dark);
}

.ex-tile__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ex-tile:hover .ex-tile__media img {
  transform: scale(1.04);
}

.ex-tile__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(204, 255, 0, 0.34);
  font-family: var(--liftag-font-headline);
  font-size: 44px;
  font-style: italic;
  font-weight: 700;
}

.ex-tile__play {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding-left: 2px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(204, 255, 0, 0.5);
  color: var(--liftag-primary);
}

.ex-tile__body {
  display: grid;
  gap: 3px;
  padding: 12px 14px 13px;
}

.ex-tile__name {
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.ex-tile__label {
  color: var(--liftag-fg-tertiary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .ex-tile,
  .ex-tile__media img {
    transition: none;
  }
}
</style>
