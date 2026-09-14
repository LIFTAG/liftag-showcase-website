<script setup lang="ts">
import type { DiscoveryLocale, GymReview } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ gymId: string; locale: DiscoveryLocale; count: number | null }>()
const copy = computed(() => discoveryCopy(props.locale)),
  gate = shallowRef(false)
const { items, loading, error, hasMore, retry, loadMore } = await useDiscoveryPage<GymReview>(
  () => `/api/explore/gyms/${props.gymId}/reviews`,
  () => ({ lang: props.locale }),
)
function date(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(props.locale, { dateStyle: 'medium' })
}
</script>
<template>
  <section class="d-section">
    <div class="d-between">
      <h2 class="d-subtitle">
        {{ copy.reviews }}
        <span v-if="count !== null" class="d-muted">({{ count }})</span>
      </h2>
      <button class="d-link d-small" @click="gate = true">{{ copy.rateGym }}</button>
    </div>
    <DiscoveryAppGate v-if="gate" kind="review" :locale="locale" @close="gate = false" />
    <DiscoveryState v-if="error" :locale="locale" error @retry="retry" />
    <DiscoveryState v-else-if="loading && !items.length" :locale="locale" loading />
    <p v-else-if="!items.length" class="d-muted d-small">{{ copy.noReviews }}</p>
    <article v-for="review in items" :key="review.id" class="d-review">
      <div class="d-between">
        <div class="d-row">
          <img v-if="review.avatarUrl" :src="review.avatarUrl" alt="" loading="lazy" />
          <div>
            <strong>{{ review.name }}</strong>
            <div class="d-small d-muted">{{ date(review.createdAt) }}</div>
          </div>
        </div>
        <span v-if="review.rating !== null" class="d-stars">
          <DiscoveryIcon name="star" :size="16" />
          {{ review.rating }}
        </span>
      </div>
      <p v-if="review.text" class="d-copy d-small">{{ review.text }}</p>
    </article>
    <button v-if="hasMore" class="d-button" :disabled="loading" @click="loadMore">
      {{ loading ? copy.loading : copy.more }}
    </button>
  </section>
</template>
<style scoped>
.d-review {
  display: grid;
  gap: 12px;
  padding: 18px 0;
  border-bottom: 1px solid var(--d-border);
}
.d-review img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.d-review strong {
  font-size: 0.875rem;
}
.d-review p {
  color: #c5c5c5;
}
</style>
