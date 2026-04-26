// Auto-add `.in` to elements that have `.reveal` once they enter the viewport.
export function useReveal(threshold = 0.12) {
  if (!import.meta.client) return
  onMounted(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold },
    )
    els.forEach((el) => io.observe(el))
    onBeforeUnmount(() => io.disconnect())
  })
}
