<script setup lang="ts">
import TrainerPublicContent from '~/components/discovery/TrainerPublicContent.vue'
import type { PublicTrainer } from '~/types/discovery'
import { discoveryLabel } from '~/utils/discoveryCopy'
const props = defineProps<{ id: string }>()
const { locale, copy, href } = useDiscoveryLocale()
const {
  data: trainer,
  error,
  status,
  refresh,
} = await useDiscoveryResource<PublicTrainer>(() => `/api/explore/trainers/${props.id}`, locale)
const contactLabel = (label: string) =>
  ({ Phone: copy.value.phone, Email: copy.value.email, Website: copy.value.website })[
    label as 'Phone' | 'Email' | 'Website'
  ] ?? label
useDiscoverySeo(
  () => trainer.value?.name ?? copy.value.trainers,
  () => trainer.value?.bio ?? copy.value.online,
  locale,
  () => trainer.value?.avatar,
  'profile',
)
</script>
<template>
  <main id="discovery-content" class="d-wrap">
    <nav class="d-breadcrumb" :aria-label="copy.back">
      <NuxtLink :to="href('/explore')">
        <DiscoveryIcon name="back" />
        {{ copy.explore }}
      </NuxtLink>
      <span>/</span>
      <span>{{ copy.trainers }}</span>
    </nav>
    <DiscoveryState
      v-if="!trainer || error"
      :locale="locale"
      :loading="status === 'pending'"
      :error="Boolean(error)"
      :unavailable="error?.statusCode === 404"
      @retry="refresh()"
    />
    <div v-else class="d-profile-layout">
      <header class="d-profile-heading">
        <img
          v-if="trainer.avatar"
          :src="trainer.avatar"
          :alt="trainer.name"
          fetchpriority="high"
          class="d-profile-avatar"
        />
        <span v-else class="d-profile-avatar d-profile-placeholder">
          <DiscoveryIcon name="user" :size="48" />
        </span>
        <div class="d-section">
          <span class="d-link d-small">
            <DiscoveryIcon name="check" :size="16" />
            {{ copy.trainers }}
          </span>
          <h1 class="d-title">{{ trainer.name }}</h1>
          <div v-if="trainer.specializations.length" class="d-chips">
            <span v-for="specialization in trainer.specializations" :key="specialization" class="d-chip">
              {{ discoveryLabel(specialization, locale) }}
            </span>
          </div>
          <div class="d-row d-muted d-small">
            <span v-if="trainer.experience !== null">{{ trainer.experience }} {{ copy.experience }}</span>
            <span v-if="trainer.online" class="d-link">
              <DiscoveryIcon name="globe" :size="16" />
              {{ copy.online }}
            </span>
          </div>
        </div>
      </header>
      <aside class="d-profile-aside">
        <section v-if="trainer.contacts.length || trainer.address" class="d-section d-surface">
          <h2 class="d-subtitle">{{ copy.contact }}</h2>
          <p v-if="trainer.address" class="d-row d-muted d-small">
            <DiscoveryIcon name="pin" />
            {{ trainer.address }}
          </p>
          <a
            v-for="contact in trainer.contacts"
            :key="contact.href"
            :href="contact.href"
            :target="contact.href.startsWith('http') ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="d-button d-between"
          >
            <span>{{ contactLabel(contact.label) }}</span>
            <DiscoveryIcon name="arrow" :size="16" />
          </a>
        </section>
        <section v-if="trainer.gyms.length" class="d-section d-surface">
          <h2 class="d-subtitle">{{ copy.affiliatedGyms }}</h2>
          <NuxtLink
            v-for="gym in trainer.gyms"
            :key="gym.id"
            :to="href(`/gyms/${gym.id}`)"
            class="d-affiliation"
          >
            <DiscoveryIcon name="gym" />
            <span>
              <strong>{{ gym.name }}</strong>
              <span v-if="gym.address" class="d-muted d-small">{{ gym.address }}</span>
            </span>
            <DiscoveryIcon name="arrow" :size="16" />
          </NuxtLink>
        </section>
      </aside>
      <div class="d-profile-content">
        <section v-if="trainer.bio" class="d-section">
          <h2 class="d-subtitle">{{ copy.about }}</h2>
          <p class="d-copy d-muted">{{ trainer.bio }}</p>
        </section>
        <TrainerPublicContent :user-id="trainer.userId" :locale="locale" />
      </div>
    </div>
  </main>
</template>
<style scoped>
.d-profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 36px 48px;
}
.d-profile-heading {
  grid-column: 1/-1;
  display: flex;
  align-items: center;
  gap: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--d-border);
}
.d-profile-avatar {
  width: 144px;
  height: 144px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid var(--d-border);
}
.d-profile-placeholder {
  display: grid;
  place-items: center;
  color: #879466;
  background: #25291f;
}
.d-profile-aside {
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  display: grid;
  gap: 24px;
  position: sticky;
  top: calc(var(--liftag-nav-h, 80px) + 24px);
}
.d-profile-content {
  grid-row: 2;
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 36px;
}
.d-surface {
  padding: 24px;
  background: var(--d-panel);
  border: 1px solid var(--d-border);
  border-radius: 20px;
}
.d-affiliation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  text-decoration: none;
  color: var(--d-text);
}
.d-affiliation > span {
  flex: 1;
  display: grid;
  gap: 6px;
}
.d-affiliation strong {
  font-size: 0.875rem;
}
.d-affiliation > svg {
  flex-shrink: 0;
  color: var(--d-accent);
}
@media (max-width: 767px) {
  .d-profile-layout {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .d-profile-heading {
    gap: 20px;
    flex-direction: column;
    align-items: flex-start;
  }
  .d-profile-avatar {
    width: 104px;
    height: 104px;
  }
  .d-profile-aside {
    position: static;
    align-self: stretch;
  }
  .d-surface {
    padding: 20px;
  }
}
</style>
