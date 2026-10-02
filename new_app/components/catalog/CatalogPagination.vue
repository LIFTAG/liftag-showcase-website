<script setup lang="ts">
defineProps<{
  nextPath?: string
  previousPath?: string
  remaining: number
  locale: string
}>()
const emit = defineEmits<{ more: [] }>()
</script>

<template>
  <nav v-if="nextPath || previousPath" class="catalog-pagination" :aria-label="locale === 'sk' ? 'Stránky katalógu' : 'Catalog pages'">
    <NuxtLink v-if="previousPath" :to="previousPath" class="btn-ghost" :prefetch="false">
      <HoloPill />{{ locale === 'sk' ? 'Predchádzajúca stránka' : 'Previous page' }}
    </NuxtLink>
    <a v-if="nextPath" :href="nextPath" class="btn-ghost" @click.prevent="emit('more')">
      <HoloPill />{{ locale === 'sk' ? `Zobraziť ďalšie (${remaining})` : `Show more (${remaining})` }}
    </a>
  </nav>
</template>

<style scoped>
.catalog-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 34px;
}
.catalog-pagination a { text-decoration: none; }
</style>
