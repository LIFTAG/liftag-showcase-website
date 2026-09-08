import type { InjectionKey, Ref } from "vue";
import { gymJourneyAt, type GymJourney } from "~/utils/gymscan/journey";

export const gymJourneyKey: InjectionKey<Ref<GymJourney>> = Symbol("gym-journey");

type Marks = {
  tag: number;
  member: number;
  owner: number;
  kit: number;
  discover: number;
};

export function useGymJourney(root: Ref<HTMLElement | null>) {
  const current = shallowRef<GymJourney>({
    assembly: 0,
    film: 0,
    gallery: 0,
    chapter: "experience",
  });
  // Discrete pin for Vue templates. `current` is replaced every scroll frame
  // for the 3D film; reading it from a copy/button tree is what made sticky
  // text shiver on a phone (the compositor pins the pane, Vue patches it).
  const chapter = shallowRef(current.value.chapter);
  const reducedMotion = shallowRef(false);
  const { gtag } = useGtag();
  const visited = new Set<string>();
  let raf = 0;
  let resize: ResizeObserver | null = null;
  let media: MediaQueryList | null = null;
  let lastChapter = "experience";
  let exited = false;
  let marks: Marks | null = null;

  function track(event: string, data: Record<string, string | number> = {}) {
    gtag("event", event, { experience: "gym_scan_v2", ...data });
  }

  function measure() {
    const el = root.value;
    if (!el) return;
    const origin = el.getBoundingClientRect().top + scrollY;
    const y = (id: string) =>
      (el.querySelector(`#${id}`)?.getBoundingClientRect().top ?? 0) +
      scrollY -
      origin;
    marks = {
      tag: y("the-tag"),
      member: y("lifters"),
      owner: y("gyms"),
      kit: el.getBoundingClientRect().bottom + scrollY - origin,
      discover: y("discover"),
    };
  }

  function update() {
    raf = 0;
    if (!root.value) return;
    if (!marks) measure();
    const origin = root.value.getBoundingClientRect().top + scrollY;
    const next = gymJourneyAt(
      scrollY - origin,
      marks!.tag,
      marks!.member,
      marks!.owner,
      marks!.kit,
      marks!.discover,
    );
    current.value = next;
    if (next.chapter !== chapter.value) chapter.value = next.chapter;
    lastChapter = next.chapter;
    if (!visited.has(lastChapter)) {
      visited.add(lastChapter);
      track("gym_story_chapter", { chapter: lastChapter });
    }
  }

  function schedule(remeasure = false) {
    if (remeasure) marks = null;
    if (!raf) raf = requestAnimationFrame(update);
  }

  function onScroll() {
    schedule();
  }

  function onResize() {
    schedule(true);
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
    resize = new ResizeObserver(onResize);
    if (root.value) resize.observe(root.value);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", resume);
    document.fonts.ready.then(() => {
      if (root.value) schedule(true);
    });
    update();
  });

  onBeforeUnmount(() => {
    leave();
    cancelAnimationFrame(raf);
    resize?.disconnect();
    media?.removeEventListener("change", motion);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pagehide", leave);
    window.removeEventListener("pageshow", resume);
  });

  return { current, chapter, reducedMotion, track };
}
