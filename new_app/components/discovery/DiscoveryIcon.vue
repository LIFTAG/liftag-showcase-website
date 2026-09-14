<script lang="ts">
/** Module scope: an explore list renders hundreds of icons off this one table. */
const paths: Record<string, string> = {
  search: 'm21 21-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow: 'm9 5 7 7-7 7',
  back: 'm14 5-7 7 7 7 M7 12h14',
  close: 'm6 6 12 12 M6 18 18 6',
  filter: 'M4 6h5m4 0h7 M4 12h10m4 0h2 M4 18h2m4 0h10 M9 3v6m5 0v6M6 15v6',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  locate: 'M12 2v3m0 14v3M2 12h3m14 0h3 M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16m6-14v16',
  gym: 'M3 8v8m3-11v14m3-7h6m0-7v14m3-11v8M3 12h3m12 0h3',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4',
  directions: 'm12 2 10 10-10 10L2 12Zm-4 13v-5h8m-3-3 3 3-3 3',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  check: 'm5 12 4 4L19 6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  image: 'M3 3h18v18H3Zm0 13 5-5 5 5 3-3 5 5M8 7h.01',
  play: 'm8 4 12 8-12 8Z',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  calendar: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16',
  bookmark: 'M6 3h12v18l-6-4-6 4Z',
  copy: 'M9 8h12v13H9ZM15 8V3H3v13h6',
}
</script>
<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] ?? paths.gym" />
  </svg>
</template>
