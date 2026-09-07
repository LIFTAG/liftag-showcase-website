<script setup lang="ts">
// The entrance adds settling motion; graphics readiness never gates content.
withDefaults(defineProps<{
  mode?: 'scan' | 'holo'
  from?: 'left' | 'right'
  row?: boolean
  lime?: boolean
  delay?: number
}>(), { row: false, lime: false, delay: 0 })
const entry = useTemplateRef<HTMLElement>('entry')
const entered = shallowRef(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!entry.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(([item]) => {
    if (!item?.isIntersecting) return
    entered.value = true
    observer?.disconnect()
  }, { threshold: 0.1 })
  observer.observe(entry.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <span ref="entry" class="gx-entry" :class="{ 'gx-entry--row': row, 'gx-entry--lime': lime, 'is-in': entered }" :style="{ '--gx-entry-delay': `${Math.min(delay, 180)}ms` }"><slot /></span>
</template>
