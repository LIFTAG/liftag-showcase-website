<script setup lang="ts">
import {
  kitContactPayload,
  KIT_LIMITS,
  validateKit,
  type KitFields,
  type KitErrors,
} from "~/utils/gymscan/kit";
const props = withDefaults(
  defineProps<{
    source?: "experience" | "partner";
    theme?: "light" | "dark";
  }>(),
  { source: "experience", theme: "light" },
);
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
const { status, errorMessage, submit } = useContactSubmit();
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
      "Verification is unavailable right now. Please try again, or email support@liftag.fit to partner with us.";
    return true;
  },
}));
const id = useId();
let observer: IntersectionObserver | null = null;
let resize: ResizeObserver | null = null;
const inputs = [
  { key: "name", label: "Your name", autocomplete: "name", type: "text" },
  { key: "email", label: "Email", autocomplete: "email", type: "email" },
  { key: "gym", label: "Gym name", autocomplete: "organization", type: "text" },
  { key: "city", label: "City", autocomplete: "address-level2", type: "text" },
] as const;
async function send() {
  if (pending.value || succeeded.value) return;
  errors.value = validateKit(fields);
  const first = Object.keys(errors.value)[0];
  if (first) {
    await nextTick();
    host.value?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    return;
  }
  challengeReady.value = true;
  if (!token.value) {
    verificationMessage.value =
      "Please complete the verification below, then send your request.";
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
      <h3>YOUR GYM.<br />OUR NEXT CONVERSATION.</h3>
      <p>
        Request received. LIFTAG will contact you by email about dashboard
        access and setup. Physical NFC tags and QR stickers are not included;
        gyms buy those themselves.
      </p>
      <NuxtLink class="btn-ghost" to="/for-gyms"
        ><HoloPill />Explore LIFTAG for gyms</NuxtLink
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
            >Equipment count <span>(optional)</span></label
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
            >Anything else? <span>(optional)</span></label
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
        {{ pending ? "Sending your request…" : "Become a partner gym" }}
      </button>
      <p class="gx-form-form-note">
        We’ll contact you about partnering your gym. By submitting, you agree to our
        <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.
      </p>
      <p class="gx-form-form-note">
        Prefer email? <a href="mailto:support@liftag.fit">support@liftag.fit</a>
      </p>
    </form>
  </div>
</template>
