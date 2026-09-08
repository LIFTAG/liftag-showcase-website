// Arms gym copy once it enters the viewport. Hold is provided by the demo so
// the opening copy waits for the arrival doors and the first hologram sweep;
// other surfaces (the partner kit) arm immediately.
import type { InjectionKey, Ref } from 'vue'

export const gymCopyHoldKey: InjectionKey<Ref<boolean>> = Symbol('gym-copy-hold')
export const gymCopyReducedKey: InjectionKey<Ref<boolean>> = Symbol('gym-copy-reduced')

function onScreen(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return rect.bottom > 40 && rect.top < innerHeight - 40 && rect.width + rect.height > 0
}

export function provideGymCopyReveal(hold: Ref<boolean>, reduced: Ref<boolean>) {
  provide(gymCopyHoldKey, hold)
  provide(gymCopyReducedKey, reduced)
}

export function useGymEntryArm(el: Ref<HTMLElement | null>) {
  const hold = inject(gymCopyHoldKey, null)
  const reduced = inject(gymCopyReducedKey, null)
  let io: IntersectionObserver | null = null
  let armed = false
  const revealed = shallowRef(false)

  function reveal() {
    const node = el.value
    if (!node || revealed.value) return
    revealed.value = true
    io?.disconnect()
    io = null
  }

  function arm() {
    const node = el.value
    if (!node || armed) return
    if (reduced?.value) {
      armed = true
      reveal()
      return
    }
    if (hold?.value) return
    armed = true
    if (onScreen(node)) {
      reveal()
      return
    }
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal()
      },
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(node.parentElement ?? node)
  }

  watch(
    [() => hold?.value, el],
    () => {
      if (hold?.value) return
      arm()
    },
    { flush: 'post', immediate: true },
  )

  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
  })

  return revealed
}
