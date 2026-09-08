import type { InjectionKey, Ref } from "vue";
import {
  coachingUiAt,
  type CoachingFrame,
  type CoachingUi,
} from "~/utils/gymscan/coachingTimeline";
import type { CoachingState } from "~/utils/gymscan/coachingStage";
import { useStableViewportHeight } from "~/composables/useStableViewportHeight";

export const gymCoachingKey: InjectionKey<Ref<CoachingState>> = Symbol(
  "gym-coaching",
);

function sameUi(a: CoachingUi, b: CoachingUi) {
  return (
    a.isOwner === b.isOwner &&
    a.docked === b.docked &&
    a.isGymVideo === b.isGymVideo
  );
}

export function useCoachingScroll(
  root: Ref<HTMLElement | null>,
  reduced: () => boolean,
) {
  const frame = shallowRef<CoachingFrame>({
    member: 0,
    owner: 0,
    isOwner: false,
    reduced: false,
  });
  const ui = shallowRef<CoachingUi>(coachingUiAt(frame.value));
  let override: number | null = null;
  let overrideScroll = 0;
  let raf = 0;
  let resize: ResizeObserver | null = null;

  function update() {
    raf = 0;
    const member = root.value?.querySelector<HTMLElement>("#lifters");
    const owner = root.value?.querySelector<HTMLElement>("#gyms");
    if (!member || !owner) return;
    const viewport = useStableViewportHeight() || innerHeight;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const ownerTop = owner.getBoundingClientRect().top;
    if (override !== null && Math.abs(scrollY - overrideScroll) > 24) {
      override = null;
    }
    const next: CoachingFrame = {
      member: clamp(
        -member.getBoundingClientRect().top / Math.max(1, member.offsetHeight),
      ),
      owner:
        override ??
        clamp(-ownerTop / Math.max(1, owner.offsetHeight - viewport)),
      isOwner: ownerTop <= 96,
      reduced: reduced(),
    };
    frame.value = next;
    const nextUi = coachingUiAt(next);
    if (!sameUi(ui.value, nextUi)) ui.value = nextUi;
    root.value?.style.setProperty(
      "--gc-progress",
      String(next.isOwner ? next.owner : next.member),
    );
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  function setOverride(value: number) {
    override = value;
    overrideScroll = scrollY;
    update();
  }

  function selectSource(gym: boolean) {
    setOverride(gym ? 0.68 : 0.12);
  }

  function playRewrite() {
    setOverride(1);
  }

  watch(reduced, () => nextTick(schedule));

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

  return { frame, ui, selectSource, playRewrite };
}
