<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => is404.value ? 'Page not found | LIFTAG' : 'Something went wrong | LIFTAG')
const description = computed(() =>
  is404.value
    ? 'That LIFTAG page does not exist. Open the homepage, guides, or get the workout tracking app.'
    : 'LIFTAG hit an unexpected error. Go back to the homepage or contact support.',
)

const route = useRoute()

useLiftagSeo({
  title: title.value,
  description: description.value,
  path: route.path,
  noindex: true,
})

const links = [
  { href: '/', label: 'Homepage' },
  { href: '/for-lifters', label: 'For lifters' },
  { href: '/guides', label: 'Guides' },
  { href: '/best-workout-tracking-app', label: 'Compare trackers' },
  { href: '/contact/support', label: 'Support' },
]
</script>

<template>
  <div class="error-page">
    <SiteNav />
    <main class="error-main">
      <p class="protocol error-code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="display error-title">
        <template v-if="is404">This lift is<br /><span class="lime">empty.</span></template>
        <template v-else>Something<br /><span class="lime">broke.</span></template>
      </h1>
      <p class="error-lead">
        {{ is404
          ? 'That URL is not a LIFTAG page. The app, the guides, and the gym network are still here.'
          : 'An unexpected error stopped this page. Try again, or tell us what you were doing.' }}
      </p>
      <div class="error-actions">
        <a href="/" class="btn-primary">Back to LIFTAG</a>
        <a href="/get" class="btn-ghost">Get the app</a>
      </div>
      <ul class="error-links">
        <li v-for="item in links" :key="item.href">
          <a :href="item.href">{{ item.label }}</a>
        </li>
      </ul>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.error-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 78% 18%, rgba(204, 255, 0, 0.12), transparent 34%),
    radial-gradient(circle at 16% 78%, rgba(255, 45, 85, 0.05), transparent 36%),
    #000;
  color: #fff;
}

.error-main {
  width: min(920px, calc(100% - 48px - var(--liftag-safe-left) - var(--liftag-safe-right)));
  margin: 0 auto;
  padding: calc(168px + var(--liftag-safe-top)) 0 96px;
}

.error-code {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.error-title {
  margin: 0;
  font-size: clamp(52px, 8vw, 112px);
  line-height: 0.92;
}

.error-lead {
  max-width: 46ch;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 40px;
}

.error-links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 28px;
  list-style: none;
  margin: 36px 0 0;
  padding: 0;
}

.error-links a {
  color: rgba(255, 255, 255, 0.62);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-decoration: none;
  text-transform: uppercase;
}

.error-links a:hover {
  color: var(--liftag-primary);
}

@media (max-width: 620px) {
  .error-main {
    padding: 128px 0 72px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
