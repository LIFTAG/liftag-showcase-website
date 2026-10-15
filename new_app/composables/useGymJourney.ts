import type { InjectionKey, Ref } from "vue";
import { gymJourneyAt, type GymJourney } from "~/utils/gymscan/journey";

export const gymJourneyKey: InjectionKey<Ref<GymJourney>> = Symbol("gym-journey");

type Marks = {
  tag: number;
  member: number;
  owner: number;
  kit: number;
  discover: number;
  dashboard: number;
  floor: number;
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

  // Chapter views are found inside the scroll rAF. gtag's event handling is
  // tens of milliseconds of script on a phone, so it is sent once the frame
  // is out of the way instead of inside it. Exit and click events stay
  // synchronous: those can be the last thing the page does.
  const queuedTracks: Array<() => void> = [];
  let cancelTrackSlot: (() => void) | null = null;
  function sendQueued() {
    cancelTrackSlot = null;
    queuedTracks.splice(0).forEach((send) => send());
  }
  function trackSoon(event: string, data: Record<string, string | number>) {
    queuedTracks.push(() => track(event, data));
    if (cancelTrackSlot) return;
    if (typeof requestIdleCallback === "function") {
      const handle = requestIdleCallback(sendQueued, { timeout: 2000 });
      cancelTrackSlot = () => cancelIdleCallback(handle);
    } else {
      const handle = window.setTimeout(sendQueued, 0);
      cancelTrackSlot = () => clearTimeout(handle);
    }
  }
  /** Leaving before an idle slot came round: send what is queued, in order. */
  function flushTracks() {
    if (!cancelTrackSlot) return;
    cancelTrackSlot();
    sendQueued();
  }

  function measure() {
    const el = root.value;
    if (!el) return;
    const origin = el.getBoundingClientRect().top + scrollY;
    // The film lives inside the journey; the owner chapters follow it.
    const y = (id: string) => {
      const target = document.getElementById(id);
      return target ? target.getBoundingClientRect().top + scrollY - origin : Infinity;
    };
    marks = {
      tag: y("the-tag"),
      member: y("lifters"),
      owner: y("gyms"),
      kit: y("kit"),
      discover: y("discover"),
      dashboard: y("dashboard"),
      floor: y("floor"),
    };
  }

  /** Journey offset read in the scroll event; see onScroll. */
  let scrolled: number | null = null;

  function update() {
    raf = 0;
    if (!root.value) return;
    if (!marks) measure();
    // Scroll offset into the journey: scrollY minus the root's document top.
    const position = scrolled ?? -root.value.getBoundingClientRect().top;
    scrolled = null;
    const next = gymJourneyAt(
      position,
      marks!.tag,
      marks!.member,
      marks!.owner,
      marks!.kit,
      marks!.discover,
      marks!.dashboard,
      marks!.floor,
    );
    current.value = next;
    if (next.chapter !== chapter.value) chapter.value = next.chapter;
    lastChapter = next.chapter;
    if (!visited.has(lastChapter)) {
      visited.add(lastChapter);
      trackSoon("gym_story_chapter", { chapter: lastChapter });
    }
  }

  function schedule(remeasure = false) {
    if (remeasure) {
      marks = null;
      scrolled = null;
    }
    if (!raf) raf = requestAnimationFrame(update);
  }

  function onScroll() {
    // Read here rather than in the rAF. Scroll events run in the same frame
    // just before animation callbacks, before any of them has written, so
    // this read finds layout clean; read inside the rAF it forced a layout of
    // whatever the film and chapters had just written. The rAF applies it.
    if (root.value) scrolled = -root.value.getBoundingClientRect().top;
    schedule();
  }

  function onResize() {
    schedule(true);
  }

  function motion() {
    reducedMotion.value = media?.matches ?? false;
  }

  function leave() {
    flushTracks();
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
    // Chapters after the film (forms, accordions) can change height too.
    if (root.value?.parentElement) resize.observe(root.value.parentElement);
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
