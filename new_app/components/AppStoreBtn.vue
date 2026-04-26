<script setup lang="ts">
const props = defineProps<{
  store: 'apple' | 'google'
}>()

const isApple = computed(() => props.store === 'apple')
</script>

<template>
  <a href="#" class="app-store-btn">
    <img
      :src="isApple ? '/assets/badges/appstore.png' : '/assets/badges/googleplay.png'"
      :alt="isApple ? 'Download on the App Store' : 'Get it on Google Play'"
      class="app-store-btn__img"
    />
  </a>
</template>

<style scoped>
.app-store-btn {
  display: inline-block;
  text-decoration: none;
  transform: translateY(0) scale(1);
  transition: all 280ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  filter: brightness(1);
}

.app-store-btn:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 8px 40px rgba(204, 255, 0, 0.4), 0 2px 12px rgba(0, 0, 0, 0.5);
  filter: brightness(1.1);
}

.app-store-btn__img {
  height: 52px;
  width: auto;
  display: block;
  border-radius: 10px;
}
</style>
