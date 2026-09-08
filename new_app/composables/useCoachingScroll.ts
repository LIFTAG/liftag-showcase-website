import type { CoachingFrame } from '~/utils/gymscan/coachingTimeline';

export function useCoachingScroll(root: Ref<HTMLElement | null>, reduced: () => boolean) {
  const frame = shallowRef<CoachingFrame>({ member: 0, owner: 0, isOwner: false, reduced: false });
  let override: number | null = null;
  let overrideScroll = 0;
  let raf = 0;
  let resize: ResizeObserver | null = null;
  function update() {
    raf = 0;
    const member = root.value?.querySelector<HTMLElement>('#lifters');
    const owner = root.value?.querySelector<HTMLElement>('#gyms');
    if (!member || !owner) return;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const ownerTop = owner.getBoundingClientRect().top;
    if (override !== null && Math.abs(scrollY - overrideScroll) > 24) override = null;
    frame.value = {
      member: clamp(-member.getBoundingClientRect().top / Math.max(1, member.offsetHeight)),
      owner: override ?? clamp(-ownerTop / Math.max(1, owner.offsetHeight - innerHeight)),
      isOwner: ownerTop <= 96,
      reduced: reduced(),
    };
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  function setOverride(value: number) { override = value; overrideScroll = scrollY; update(); }
  function selectSource(gym: boolean) { setOverride(gym ? .68 : .12); }
  function playRewrite() { setOverride(1); }
  watch(reduced, () => nextTick(schedule));
  onMounted(() => {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    resize = new ResizeObserver(schedule);
    if (root.value) resize.observe(root.value);
    update();
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    resize?.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  });
  return { frame, selectSource, playRewrite };
}
