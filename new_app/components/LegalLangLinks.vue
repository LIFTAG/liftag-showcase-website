<script setup lang="ts">
const props = defineProps<{
  kind: 'privacy' | 'terms'
}>()

const links = computed(() => {
  const slug = props.kind === 'privacy' ? 'privacy-policy' : 'terms-and-conditions'
  return [
    { label: 'EN', path: `/${slug}`, lang: 'en' },
    { label: 'SK', path: `/sk/${slug}`, lang: 'sk' },
    { label: 'CS', path: `/cs/${slug}`, lang: 'cs' },
  ]
})

const route = useRoute()
</script>

<template>
  <nav class="legal-langs" aria-label="Language">
    <a
      v-for="item in links"
      :key="item.lang"
      :href="item.path"
      :hreflang="item.lang"
      :lang="item.lang"
      class="legal-lang"
      :class="{ 'is-current': route.path === item.path }"
      :aria-current="route.path === item.path ? 'page' : undefined"
    >{{ item.label }}</a>
  </nav>
</template>

<style scoped>
.legal-langs {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.legal-lang {
  color: rgba(255, 255, 255, 0.46);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
}

.legal-lang:hover,
.legal-lang.is-current {
  color: var(--liftag-primary);
}
</style>
