import type { InjectionKey, Ref } from 'vue';

interface GymDiscoveryHandoff {
  phoneVisible: Readonly<Ref<boolean>>;
  publishPhoneOut: (amount: number) => void;
}

const gymDiscoveryHandoffKey: InjectionKey<GymDiscoveryHandoff> = Symbol('gym-discovery-handoff');

/** The discovery renderer owns the fade; cinema only needs its visibility edge. */
export function provideGymDiscoveryHandoff() {
  const phoneVisible = shallowRef(false);
  provide(gymDiscoveryHandoffKey, {
    phoneVisible: readonly(phoneVisible),
    publishPhoneOut: amount => { phoneVisible.value = amount < 0.97; },
  });
}

export function useGymDiscoveryHandoff() {
  const handoff = inject(gymDiscoveryHandoffKey);
  if (!handoff) throw new Error('Discovery handoff must render inside GymExperience');
  return handoff;
}
