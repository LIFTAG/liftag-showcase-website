<script setup lang="ts">
/**
 * Demo copy entrance. `scan` is the home-page laser wall (clip opens behind a
 * 2px beam). `holo` is the machine hologram: a lime core kicks across the
 * copy, cool-white mesh reconstructs in the wake, phosphor settles.
 */
const props = withDefaults(defineProps<{
  mode?: 'scan' | 'holo'
  from?: 'left' | 'right'
  row?: boolean
  lime?: boolean
  delay?: number
}>(), {
  mode: 'scan',
  from: 'left',
  row: false,
  lime: false,
  delay: 0,
})

const el = useTemplateRef<HTMLElement>('entry')
useGymEntryArm(el)
const done = shallowRef(false)

function onAnimEnd(event: AnimationEvent) {
  if (event.target !== el.value) return
  if (!event.animationName.startsWith('gx-holo-open')) return
  done.value = true
}

const classes = computed(() => ({
  'gx-entry': true,
  [`gx-entry--${props.mode}`]: true,
  'gx-entry--row': props.row,
  'gx-entry--lime': props.lime,
  'from-right': props.from === 'right',
  'is-done': done.value,
}))

const delayStyle = computed(() => (
  props.delay > 0 ? { '--gx-entry-delay': `${props.delay}ms` } : undefined
))
</script>

<template>
  <span
    ref="entry"
    data-gx-entry
    :class="classes"
    :style="delayStyle"
    @animationend="onAnimEnd"
  ><slot /></span>
</template>
