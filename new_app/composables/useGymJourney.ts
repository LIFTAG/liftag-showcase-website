import { gymJourneyAt, type GymJourney } from "~/utils/gymscan/journey";

export function useGymJourney(root: Ref<HTMLElement | null>) {
  const current = shallowRef<GymJourney>({
    assembly: 0,
    film: 0,
    gallery: 0,
    chapter: "experience",
  });
  const reducedMotion = shallowRef(false);
  const memberStep = shallowRef(0);
  const ownerStep = shallowRef(0);
  const { gtag } = useGtag();
  const visited = new Set<string>();
  let raf = 0;
  let resize: ResizeObserver | null = null;
  let media: MediaQueryList | null = null;
  let lastChapter = "experience";
  let exited = false;
  function track(event: string, data: Record<string, string | number> = {}) {
    gtag("event", event, { experience: "gym_scan_v2", ...data });
  }
  function update() {
    raf = 0;
    if (!root.value) return;
    const origin = root.value.getBoundingClientRect().top + scrollY;
    const y = (id: string) =>
      (root.value!.querySelector(`#${id}`)?.getBoundingClientRect().top ?? 0) +
      scrollY -
      origin;
    current.value = gymJourneyAt(
      scrollY - origin,
      y("the-tag"),
      y("lifters"),
      y("gyms"),
      root.value.getBoundingClientRect().bottom + scrollY - origin,
      y("discover"),
    );
    const step = (id: string) => {
      const el = root.value!.querySelector<HTMLElement>(`#${id}`);
      if (!el) return 0;
      const progress = -el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight);
      return Math.max(0, Math.min(3, Math.floor(progress * 4)));
    };
    memberStep.value = step('lifters');
    ownerStep.value = step('gyms');
    lastChapter = current.value.chapter;
    if (!visited.has(lastChapter)) {
      visited.add(lastChapter);
      track("gym_story_chapter", { chapter: lastChapter });
    }
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }
  function motion() {
    reducedMotion.value = media?.matches ?? false;
  }
  function leave() {
    if (!exited) {
      exited = true;
      track("gym_story_exit", { last_chapter: lastChapter });
    }
  }
  function resume() {
    exited = false;
  }
  onMounted(() => {
    media = matchMedia("(prefers-reduced-motion: reduce)");
    motion();
    media.addEventListener("change", motion);
    resize = new ResizeObserver(schedule);
    if (root.value) resize.observe(root.value);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", resume);
    document.fonts.ready.then(() => {
      if (root.value) update();
    });
    update();
  });
  onBeforeUnmount(() => {
    leave();
    cancelAnimationFrame(raf);
    resize?.disconnect();
    media?.removeEventListener("change", motion);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pagehide", leave);
    window.removeEventListener("pageshow", resume);
  });
  return { current, reducedMotion, memberStep, ownerStep, track };
}
