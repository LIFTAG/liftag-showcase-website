<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{
  title: string
  locale: DiscoveryLocale
  wide?: boolean
  fullscreen?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const titleId = useId()
let previous: HTMLElement | null = null
let oldOverflow = ''
onMounted(() => {
  previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
  oldOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
})
onBeforeUnmount(() => {
  dialog.value?.close()
  document.body.style.overflow = oldOverflow
  previous?.focus({ preventScroll: true })
})
function backdrop(event: MouseEvent) {
  const element = dialog.value
  if (!element || event.target !== element) return
  const rect = element.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    emit('close')
}
</script>
<template>
  <dialog
    ref="dialog"
    class="d-dialog"
    :class="{ 'd-dialog--wide': wide, 'd-dialog--fullscreen': fullscreen }"
    :aria-labelledby="titleId"
    @cancel.prevent="emit('close')"
    @click="backdrop"
  >
    <div class="d-dialog-header">
      <h2 :id="titleId" class="d-subtitle">{{ title }}</h2>
      <button
        autofocus
        class="d-icon-button"
        :aria-label="discoveryCopy(props.locale).close"
        @click="emit('close')"
      >
        <DiscoveryIcon name="close" />
      </button>
    </div>
    <div class="d-dialog-body"><slot /></div>
  </dialog>
</template>
<style scoped>
.d-dialog {
  position: fixed;
  inset: 0;
  width: min(600px, calc(100% - 32px));
  max-width: none;
  max-height: calc(100dvh - 48px);
  margin: auto;
  padding: 0;
  border: 1px solid var(--d-border);
  border-radius: 24px;
  background: var(--d-bg);
  color: var(--d-text);
  box-shadow: 0 24px 80px #0009;
}
.d-dialog::backdrop {
  background: #000a;
  backdrop-filter: blur(6px);
}
.d-dialog--wide {
  width: min(840px, calc(100% - 48px));
}
.d-dialog-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--d-bg);
  z-index: 2;
  border-bottom: 1px solid var(--d-border);
}
.d-dialog-body {
  padding: 24px;
}
.d-dialog--fullscreen {
  width: 100%;
  height: 100dvh;
  max-height: none;
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}
.d-dialog--fullscreen[open] {
  display: flex;
  flex-direction: column;
}
.d-dialog--fullscreen .d-dialog-header {
  position: static;
  flex-shrink: 0;
  gap: 16px;
  padding: max(8px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px))
    8px max(16px, env(safe-area-inset-left, 0px));
}
.d-dialog--fullscreen .d-subtitle {
  min-width: 0;
  font-size: 1rem;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.d-dialog--fullscreen .d-dialog-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
@media (max-width: 767px) {
  .d-dialog:not(.d-dialog--fullscreen) {
    width: 100%;
    max-height: calc(100dvh - env(safe-area-inset-top, 0px) - 16px);
    margin: auto 0 0;
    border-radius: 24px 24px 0 0;
  }
  .d-dialog:not(.d-dialog--fullscreen) .d-dialog-body {
    padding: 20px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
