import type { CoachingFrame } from '~/utils/gymscan/coachingStage';

export function useCoachingScroll(root: Ref<HTMLElement | null>, reduced: () => boolean) {
  const frame = shallowRef<CoachingFrame>({ member: 0, owner: 0, isOwner: false, reduced: false });
  let raf = 0;
  let resize: ResizeObserver | null = null;
  function update() {
    raf = 0;
    const member = root.value?.querySelector<HTMLElement>('#lifters');
    const owner = root.value?.querySelector<HTMLElement>('#gyms');
    if (!member || !owner) return;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const ownerTop = owner.getBoundingClientRect().top;
    const ownerProgress = clamp(-ownerTop / Math.max(1, owner.offsetHeight - innerHeight));
    frame.value = {
      member: clamp(-member.getBoundingClientRect().top / Math.max(1, member.offsetHeight - innerHeight * .25)),
      owner: ownerProgress,
      isOwner: ownerTop <= 0,
      reduced: reduced(),
    };
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
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
  return { frame };
}
