<script setup lang="ts">
import '~/assets/css/discovery.css'
</script>
<template>
  <a class="discovery-skip" href="#discovery-content">Skip to content</a>
  <SiteNav />
  <div class="discovery-root discovery-shell"><slot /></div>
</template>
<style scoped>
.discovery-skip {
  position: fixed;
  top: 8px;
  left: 16px;
  z-index: 101;
  padding: 12px 16px;
  background: #ccff00;
  color: #101405;
  border-radius: 8px;
  transform: translateY(-200%);
}
.discovery-skip:focus {
  transform: none;
}
</style>
