import type { Ref } from 'vue';

/**
 * Flips true the first time an element meaningfully enters the viewport and
 * stays true, so entrance motion plays once instead of on every pass.
 */
export function useSeenOnce(el: Ref<HTMLElement | null>, threshold = 0.18) {
  const seen = shallowRef(false);
  let io: IntersectionObserver | null = null;
  onMounted(() => {
    if (!el.value) return;
    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        seen.value = true;
        io?.disconnect();
        io = null;
      },
      { threshold },
    );
    io.observe(el.value);
  });
  onBeforeUnmount(() => io?.disconnect());
  return seen;
}
