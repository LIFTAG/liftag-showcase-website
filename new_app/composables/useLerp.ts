// Smooth lerp composable — drives cursor orb and phone parallax in Hero.
// Returns a reactive `out` object whose x/y trail the given `target` each RAF frame.

export function useLerp(target: { x: number; y: number }, factor = 0.08) {
  const val = { x: 0, y: 0 }
  const out = ref({ x: 0, y: 0 })
  let rafId = 0

  const tick = () => {
    val.x += (target.x - val.x) * factor
    val.y += (target.y - val.y) * factor
    out.value = { x: val.x, y: val.y }
    rafId = requestAnimationFrame(tick)
  }

  onMounted(() => {
    rafId = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
  })

  return out
}
