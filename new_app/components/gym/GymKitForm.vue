<script setup lang="ts">
import {
  kitContactPayload,
  KIT_LIMITS,
  validateKit,
  type KitFields,
  type KitErrors,
} from "~/utils/gymscan/kit";
import { contactErrorMessage } from '~/utils/contactError';
import { en, sk } from '~/i18n/messages/gymDemo';
import { useSiteLocale } from '~/composables/useSiteLocale';
const props = withDefaults(
  defineProps<{
    source?: "experience" | "partner";
    theme?: "light" | "dark";
  }>(),
  { source: "experience", theme: "light" },
);
const { locale, href } = useSiteLocale();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const fields = reactive<KitFields>({
  name: "",
  email: "",
  gym: "",
  city: "",
  equipment: "",
  notes: "",
});
const errors = ref<KitErrors>({});
const token = ref(""),
  verificationMessage = ref(""),
  challengeReady = ref(false);
const { status, errorCode, submit } = useContactSubmit();
const errorMessage = computed(() => contactErrorMessage(errorCode.value, locale.value));
const hydrated = ref(false);
const pending = computed(() => status.value === "submitting");
const succeeded = computed(() => status.value === "success");
const host = useTemplateRef<HTMLElement>("host");
const confirmation = useTemplateRef<HTMLElement>("confirmation");
const formError = useTemplateRef<HTMLElement>("formError");
const turnstile = useTemplateRef<{ reset: () => void }>("turnstile");
const { gtag } = useGtag();
const compactChallenge = ref(false);
const turnstileOptions = computed(() => ({
  theme: props.theme,
  size: compactChallenge.value ? "compact" : "flexible",
  "expired-callback": () => {
    token.value = "";
  },
  "error-callback": () => {
    token.value = "";
    verificationMessage.value =
      t('kit.verifyUnavailable');
    return true;
  },
}));
const id = useId();
let observer: IntersectionObserver | null = null;
let resize: ResizeObserver | null = null;
const inputs = computed(() => [
  { key: "name", label: t('kit.yourName'), autocomplete: "name", type: "text" },
  { key: "email", label: t('kit.email'), autocomplete: "email", type: "email" },
  { key: "gym", label: t('kit.gymName'), autocomplete: "organization", type: "text" },
  { key: "city", label: t('kit.city'), autocomplete: "address-level2", type: "text" },
] as const);
async function send() {
  if (pending.value || succeeded.value) return;
  errors.value = validateKit(fields, locale.value);
  const first = Object.keys(errors.value)[0];
  if (first) {
    await nextTick();
    host.value?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    return;
  }
  challengeReady.value = true;
  if (!token.value) {
    verificationMessage.value =
      t('kit.verifyPrompt');
    await nextTick();
    formError.value?.focus();
    return;
  }
  verificationMessage.value = "";
  await submit(kitContactPayload(fields, token.value));
  if (status.value === "success") {
    gtag("event", "gym_kit_request_complete", { source: props.source });
    await nextTick();
    confirmation.value?.focus();
  } else {
    token.value = "";
    turnstile.value?.reset();
  }
}
watch(token, (value) => {
  if (value) verificationMessage.value = "";
});
onMounted(() => {
  hydrated.value = true;
  const measureChallenge = () => {
    const compact = (host.value?.clientWidth ?? 300) < 300;
    if (compact !== compactChallenge.value) {
      token.value = "";
      compactChallenge.value = compact;
    }
  };
  measureChallenge();
  resize = new ResizeObserver(measureChallenge);
  if (host.value) resize.observe(host.value);
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        challengeReady.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: "400px" },
  );
  if (host.value) observer.observe(host.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  resize?.disconnect();
});
</script>
<template>
  <div ref="host" class="gx-form-kit-form">
    <div
      v-if="status === 'success'"
      ref="confirmation"
      class="gx-form-confirmation"
      tabindex="-1"
      role="status"
    >
      <span class="gx-form-confirmation__mark" aria-hidden="true">↗</span>
      <h3>{{ t('kit.formHeading') }}</h3>
      <p>{{ t('kit.confirmation') }}</p>
      <NuxtLink class="btn-ghost" :to="href('/for-gyms')"
        ><HoloPill />{{ t('kit.explore') }}</NuxtLink
      >
    </div>
    <form
      v-else
      novalidate
      :aria-busy="pending"
      @submit.prevent="send"
      @focusin="challengeReady = true"
    >
      <div class="gx-form-fields">
        <div v-for="input in inputs" :key="input.key" class="gx-form-field">
          <label :for="`${id}-${input.key}`"
            >{{ input.label }} <span aria-hidden="true">*</span></label
          >
          <input
            :id="`${id}-${input.key}`"
            v-model="fields[input.key]"
            :name="input.key"
            :type="input.type"
            :autocomplete="input.autocomplete"
            :maxlength="KIT_LIMITS[input.key]"
            required
            :disabled="pending || !hydrated"
            :aria-invalid="!!errors[input.key]"
            :aria-describedby="
              errors[input.key] ? `${id}-${input.key}-error` : undefined
            "
            @input="delete errors[input.key]"
          />
          <p
            v-if="errors[input.key]"
            :id="`${id}-${input.key}-error`"
            class="gx-form-field-error"
          >
            {{ errors[input.key] }}
          </p>
        </div>
        <div class="gx-form-field gx-form-field--full">
          <label :for="`${id}-equipment`"
            >{{ t('kit.equipmentCount') }} <span>{{ t('kit.optional') }}</span></label
          ><input
            :id="`${id}-equipment`"
            v-model="fields.equipment"
            name="equipment"
            inputmode="numeric"
            maxlength="5"
            :disabled="pending || !hydrated"
            :aria-invalid="!!errors.equipment"
            :aria-describedby="
              errors.equipment ? `${id}-equipment-error` : undefined
            "
            @input="delete errors.equipment"
          />
          <p
            v-if="errors.equipment"
            :id="`${id}-equipment-error`"
            class="gx-form-field-error"
          >
            {{ errors.equipment }}
          </p>
        </div>
        <div class="gx-form-field gx-form-field--full">
          <label :for="`${id}-notes`"
            >{{ t('kit.anythingElse') }} <span>{{ t('kit.optional') }}</span></label
          ><textarea
            :id="`${id}-notes`"
            v-model="fields.notes"
            name="notes"
            rows="2"
            maxlength="2000"
            :disabled="pending || !hydrated"
            :aria-invalid="!!errors.notes"
            :aria-describedby="errors.notes ? `${id}-notes-error` : undefined"
            @input="delete errors.notes"
          />
          <p
            v-if="errors.notes"
            :id="`${id}-notes-error`"
            class="gx-form-field-error"
          >
            {{ errors.notes }}
          </p>
        </div>
      </div>
      <p
        v-if="verificationMessage || errorMessage"
        ref="formError"
        class="gx-form-form-error"
        role="alert"
        tabindex="-1"
      >
        {{ verificationMessage || errorMessage }}
      </p>
      <div
        class="gx-form-verification"
        :class="{ 'is-compact': compactChallenge }"
      >
        <ClientOnly
          ><NuxtTurnstile
            v-if="challengeReady"
            :key="String(compactChallenge)"
            ref="turnstile"
            v-model="token"
            :options="turnstileOptions"
        /></ClientOnly>
      </div>
      <button
        class="btn-primary"
        type="submit"
        :disabled="pending || !hydrated"
      >
        {{ pending ? t('kit.send') : t('kit.submit') }}
      </button>
      <p class="gx-form-form-note">
        {{ t('kit.privacyNote') }}
        <NuxtLink :to="href('/privacy-policy')">{{ t('kit.privacy') }}</NuxtLink>.
      </p>
      <p class="gx-form-form-note">
        {{ t('kit.preferEmail') }} <a href="mailto:support@liftag.fit">support@liftag.fit</a>
      </p>
    </form>
  </div>
</template>
