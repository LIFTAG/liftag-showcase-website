<script setup lang="ts">
import type { DiscoveryLocale, PublicPlan, PublicRoutine } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ userId: number; locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const gate = shallowRef(false)
const [routines, plans] = await Promise.all([
  useDiscoveryPage<PublicRoutine>(
    () => `/api/explore/users/${props.userId}/routines`,
    () => ({ lang: props.locale }),
  ),
  useDiscoveryPage<PublicPlan>(
    () => `/api/explore/users/${props.userId}/plans`,
    () => ({ lang: props.locale }),
  ),
])
</script>
<template>
  <div class="d-stack d-trainer-content">
    <section class="d-section">
      <h2 class="d-subtitle">
        {{ copy.routines }}
        <span v-if="routines.total.value !== null" class="d-muted">({{ routines.total.value }})</span>
      </h2>
      <DiscoveryList :state="routines" :locale="locale" :empty="copy.noRoutines">
        <template #default="{ items }">
          <div class="d-card-grid">
            <DiscoveryRoutineCard
              v-for="routine in items"
              :key="routine.id"
              :routine="routine"
              :locale="locale"
            />
          </div>
        </template>
      </DiscoveryList>
    </section>
    <section class="d-section">
      <h2 class="d-subtitle">
        {{ copy.plans }}
        <span v-if="plans.total.value !== null" class="d-muted">({{ plans.total.value }})</span>
      </h2>
      <DiscoveryAppGate v-if="gate" kind="plan" :locale="locale" @close="gate = false" />
      <DiscoveryList :state="plans" :locale="locale" :empty="copy.noPlans">
        <template #default="{ items }">
          <div class="d-card-grid">
            <button v-for="plan in items" :key="plan.id" class="d-plan-preview" @click="gate = true">
              <img v-if="plan.image" :src="plan.image" alt="" loading="lazy" />
              <span v-else class="d-plan-art"><DiscoveryIcon name="calendar" :size="36" /></span>
              <span class="d-plan-copy">
                <strong>{{ plan.name }}</strong>
                <span v-if="plan.description" class="d-muted d-small">{{ plan.description }}</span>
                <span class="d-link d-small">
                  {{ copy.planPreview }}
                  <DiscoveryIcon name="arrow" :size="16" />
                </span>
              </span>
            </button>
          </div>
        </template>
      </DiscoveryList>
    </section>
  </div>
</template>
<style scoped>
.d-trainer-content {
  gap: 36px;
}
.d-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.d-plan-preview {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--d-border);
  border-radius: 18px;
  background: var(--d-panel);
  color: var(--d-text);
  text-align: left;
}
.d-plan-preview:hover {
  border-color: #748344;
}
.d-plan-preview > img,
.d-plan-art {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  color: #8c986c;
  background: #242820;
}
.d-plan-copy {
  display: grid;
  gap: 12px;
  padding: 18px;
}
.d-plan-copy > .d-muted {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 600px) {
  .d-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
