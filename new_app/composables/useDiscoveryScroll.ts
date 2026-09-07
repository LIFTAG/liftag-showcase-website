import { discoveryAt } from "~/utils/gymscan/discoveryTimeline";
export function useDiscoveryScroll(
  root: Ref<HTMLElement | null>,
  simple: () => boolean,
) {
  const progress = shallowRef(0),
    replay = shallowRef(0);
  const phase = computed(() =>
    simple() ? 3 : discoveryAt(progress.value).phase,
  );
  let raf = 0,
    resize: ResizeObserver | null = null;
  function update() {
    raf = 0;
    if (!root.value) return;
    progress.value = Math.max(
      0,
      Math.min(
        1,
        -root.value.getBoundingClientRect().top /
          Math.max(1, root.value.offsetHeight - innerHeight),
      ),
    );
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }
  function go(index: number) {
    if (!root.value || simple()) return;
    if (index === 0) replay.value++;
    const start = root.value.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top:
        start +
        (root.value.offsetHeight - innerHeight) *
          ([0, 0.36, 0.61, 0.985][index] ?? 0),
      behavior: "smooth",
    });
  }
  watch(simple, () => nextTick(schedule));
  onMounted(() => {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    resize = new ResizeObserver(schedule);
    if (root.value) resize.observe(root.value);
    update();
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    resize?.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  });
  return { progress, phase, replay, go };
}
