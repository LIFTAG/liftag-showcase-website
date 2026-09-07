<script setup lang="ts">
import { LOGO_MARK_PATH, LOGO_ASSEMBLY_PATHS as paths, LOGO_ASSEMBLY_ORIGIN as origin, RING_WIDTH, logoAssemblyFrame, logoArrowPoints, logoRootScale } from '~/utils/brand/logoEntry';
const id = useId().replace(/:/g, '');
// Sample the supplied choreography into native SVG animation. No JS frame loop.
const frames = Array.from({ length: 106 }, (_, i) => logoAssemblyFrame(i / 105));
const values = (read: (pose: typeof frames[number]) => string | number) => frames.map(read).join(';');
const arrow = values(p => { const a = logoArrowPoints(p.shaft, p.head); return `M${a[0]} ${a[1]}L${a.slice(2).join(' ')}Z`; });
const root = values(p => { const s = logoRootScale(p.root); return `${s.x} ${s.y}`; });
const strokes = [
  { path: paths.bar, width: 80.578, field: 'bar' as const },
  { path: paths.connector, width: 164, field: 'connector' as const },
];
</script>
<template>
  <svg viewBox="0 0 887 887" fill="currentColor" aria-hidden="true">
    <defs><clipPath :id="`${id}-mark`"><path :d="LOGO_MARK_PATH" /></clipPath><clipPath :id="`${id}-bar`"><rect width="600.971" height="887" /></clipPath></defs>
    <g :transform="`translate(${origin.x} ${origin.y})`"><g><animateTransform attributeName="transform" type="scale" :values="root" dur="1.75s" fill="freeze" />
      <g :transform="`translate(${-origin.x} ${-origin.y})`">
        <path><animate attributeName="d" :values="arrow" dur="1.75s" fill="freeze" /></path>
        <g :clip-path="`url(#${id}-mark)`">
          <path v-for="stroke in strokes" :key="stroke.field" :d="stroke.path" fill="none" stroke="currentColor" :stroke-width="stroke.width" :stroke-linecap="stroke.field === 'bar' ? 'butt' : 'round'" pathLength="1" stroke-dasharray="1 1" :clip-path="stroke.field === 'bar' ? `url(#${id}-bar)` : undefined">
            <animate attributeName="stroke-dashoffset" :values="values(p => 1 - p[stroke.field])" dur="1.75s" fill="freeze" />
          </path>
        </g>
        <g v-for="plate in (['innerPlate', 'outerPlate'] as const)" :key="plate">
          <animateTransform attributeName="transform" type="translate" :values="values(p => `${(plate === 'innerPlate' ? 156 : 172) * (1 - p[plate]) - p.load} ${p.load * .35}`)" dur="1.75s" fill="freeze" />
          <animate attributeName="opacity" :values="values(p => p[`${plate}Opacity`])" dur="1.75s" fill="freeze" />
          <path :d="paths[plate]"><animateTransform attributeName="transform" type="rotate" :values="values(p => `${(plate === 'innerPlate' ? -.08 : .07) * (1 - p[plate]) * 180 / Math.PI} ${plate === 'innerPlate' ? 619.436 : 653.01} ${plate === 'innerPlate' ? 607.685 : 609.364}`)" dur="1.75s" fill="freeze" /></path>
        </g>
      </g>
    </g></g>
    <g :clip-path="`url(#${id}-mark)`">
      <path v-for="path in [paths.ringClockwise, paths.ringCounterclockwise]" :key="path" :d="path" fill="none" stroke="currentColor" :stroke-width="RING_WIDTH + 4" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"><animate attributeName="stroke-dashoffset" :values="values(p => 1-p.ring)" dur="1.75s" fill="freeze" /></path>
    </g>
    <path :d="LOGO_MARK_PATH" opacity="0"><set attributeName="opacity" to="1" begin="1.75s" fill="freeze" /></path>
  </svg>
</template>
