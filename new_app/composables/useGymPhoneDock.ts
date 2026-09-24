import type { InjectionKey, Ref } from 'vue';

interface GymPhoneDock {
  /**
   * True once the member chapter's DOM phone owns the parked device. The
   * cinema stops drawing and fades its canvas; scrolling back above the pin
   * returns it.
   */
  docked: Ref<boolean>;
  /** The film's parked phone is holding the last frame of the scan capture. */
  settled: Ref<boolean>;
}

const gymPhoneDockKey: InjectionKey<GymPhoneDock> = Symbol('gym-phone-dock');

export function provideGymPhoneDock() {
  const dock: GymPhoneDock = { docked: shallowRef(false), settled: shallowRef(false) };
  provide(gymPhoneDockKey, dock);
  return dock;
}

export function useGymPhoneDock() {
  const dock = inject(gymPhoneDockKey, null);
  if (!dock) throw new Error('The phone dock must render inside GymExperience');
  return dock;
}
