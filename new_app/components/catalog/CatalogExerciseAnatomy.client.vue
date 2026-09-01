<script setup lang="ts">
import createBodyHighlighter, {
  type BodyHighlighterInstance,
  type IExerciseData,
} from 'body-highlighter'
import {
  ANATOMY_SVG_HEIGHT_PX,
  BODY_COLOR,
  HEAT_COLORS,
  buildExerciseBodyData,
} from '~/utils/exerciseAnatomy'

const props = withDefaults(defineProps<{
  primarySlug?: string | null
  primaryName?: string | null
  secondary?: Array<{ slug: string, name: string }>
}>(), {
  primarySlug: null,
  primaryName: null,
  secondary: () => [],
})

const bodyData = computed<IExerciseData[]>(() => {
  const names: Record<string, string> = {}
  if (props.primarySlug && props.primaryName) names[props.primarySlug] = props.primaryName
  for (const muscle of props.secondary) names[muscle.slug] = muscle.name
  return buildExerciseBodyData(
    props.primarySlug,
    props.secondary.map(muscle => muscle.slug),
    names,
  )
})

const frontEl = ref<HTMLElement | null>(null)
const backEl = ref<HTMLElement | null>(null)
let frontInst: BodyHighlighterInstance | null = null
let backInst: BodyHighlighterInstance | null = null

function buildInstances() {
  const shared = {
    bodyColor: BODY_COLOR,
    highlightedColors: HEAT_COLORS,
    data: bodyData.value,
    svgStyle: { height: `${ANATOMY_SVG_HEIGHT_PX}px`, width: '100%' },
  }
  if (frontEl.value) {
    frontInst = createBodyHighlighter({ ...shared, container: frontEl.value, type: 'anterior' })
  }
  if (backEl.value) {
    backInst = createBodyHighlighter({ ...shared, container: backEl.value, type: 'posterior' })
  }
}

watch(bodyData, (data) => {
  frontInst?.update({ data })
  backInst?.update({ data })
})

onMounted(() => buildInstances())

onBeforeUnmount(() => {
  frontInst?.destroy()
  backInst?.destroy()
  frontInst = null
  backInst = null
})
</script>

<template>
  <div class="anatomy-grid" aria-hidden="true">
    <div ref="frontEl" class="anatomy-cell" />
    <div ref="backEl" class="anatomy-cell" />
  </div>
</template>

<style scoped>
.anatomy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  min-height: 230px;
  height: 230px;
  pointer-events: none;
}

.anatomy-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 230px;
  height: 230px;
  overflow: hidden;
}

.anatomy-cell :deep(.rbh-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.anatomy-cell :deep(.rbh) {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 230px;
}

.anatomy-cell :deep(.rbh polygon) {
  cursor: default;
}
</style>
