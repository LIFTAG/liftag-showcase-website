<script setup lang="ts">
interface ContactPageProps {
  eyebrow: string
  title: string
  lead: string
  lockedSubject: string
  successHeadline?: string
  seoTitle: string
  seoDescription: string
  seoPath: string
}

const props = defineProps<ContactPageProps>()

useLiftagSeo({
  title: props.seoTitle,
  description: props.seoDescription,
  path: props.seoPath,
})

useReveal()

const name = ref('')
const email = ref('')
const message = ref('')
const token = ref('')
const turnstileRef = ref<{ reset: () => void } | null>(null)

const { status, errorMessage, submit, reset: resetSubmit } = useContactSubmit()

const isSubmitting = computed(() => status.value === 'submitting')
const isSuccess = computed(() => status.value === 'success')

const canSubmit = computed(() => {
  return (
    !isSubmitting.value
    && name.value.trim().length >= 1
    && email.value.trim().length > 0
    && message.value.trim().length >= 10
    && token.value.length > 0
  )
})

async function onSubmit() {
  if (!canSubmit.value) return
  await submit({
    name: name.value.trim(),
    email: email.value.trim(),
    subject: props.lockedSubject,
    message: message.value.trim(),
    turnstileToken: token.value,
  })
  if (status.value === 'error') {
    token.value = ''
    turnstileRef.value?.reset()
  }
}

function sendAnother() {
  name.value = ''
  email.value = ''
  message.value = ''
  token.value = ''
  resetSubmit()
  turnstileRef.value?.reset()
}
</script>

<template>
  <div class="contact-shell">
    <SiteNav />

    <main class="contact-page">
      <section class="contact-hero">
        <div
          class="section-glow is-green"
          style="--glow-top: -5%; --glow-right: -20%; --glow-size: 720px; --glow-blur: 90px;"
        />
        <div class="container contact-grid">
          <div class="contact-copy reveal">
            <Eyebrow color="#CCFF00">{{ eyebrow }}</Eyebrow>
            <SectionTitle :max="780">
              <span v-html="title" />
            </SectionTitle>
            <p class="contact-lead copy-soft">{{ lead }}</p>
            <div class="contact-subject-pill">
              <span class="protocol contact-subject-label">SUBJECT</span>
              <span class="contact-subject-value">{{ lockedSubject }}</span>
            </div>
          </div>

          <div class="contact-card reveal">
            <form v-if="!isSuccess" class="contact-form" @submit.prevent="onSubmit">
              <div class="contact-field">
                <label for="contact-name" class="protocol contact-label">Name</label>
                <input
                  id="contact-name"
                  v-model="name"
                  type="text"
                  required
                  minlength="1"
                  maxlength="120"
                  autocomplete="name"
                  :disabled="isSubmitting"
                />
              </div>

              <div class="contact-field">
                <label for="contact-email" class="protocol contact-label">Email</label>
                <input
                  id="contact-email"
                  v-model="email"
                  type="email"
                  required
                  maxlength="254"
                  autocomplete="email"
                  :disabled="isSubmitting"
                />
              </div>

              <div class="contact-field">
                <label for="contact-message" class="protocol contact-label">Message</label>
                <textarea
                  id="contact-message"
                  v-model="message"
                  rows="6"
                  required
                  minlength="10"
                  maxlength="5000"
                  :disabled="isSubmitting"
                />
                <div class="contact-counter">{{ message.length }} / 5000</div>
              </div>

              <div class="contact-turnstile">
                <NuxtTurnstile
                  ref="turnstileRef"
                  v-model="token"
                  :options="{ theme: 'dark' }"
                />
              </div>

              <button
                type="submit"
                class="btn-primary contact-submit"
                :disabled="!canSubmit"
              >
                {{ isSubmitting ? 'Sending…' : 'Send message' }}
              </button>

              <p v-if="errorMessage" class="contact-error" role="alert">
                {{ errorMessage }}
              </p>
            </form>

            <div v-else class="contact-success" role="status">
              <div class="contact-success-mark" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="32" height="32">
                  <path
                    d="M7 16.5 13 22.5 25 9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h2 class="contact-success-title">
                {{ successHeadline ?? 'Message sent.' }}
              </h2>
              <p class="contact-success-body">
                Thanks for reaching out. We’ll get back to you at <strong>{{ email }}</strong> as soon as we can.
              </p>
              <div class="contact-success-actions">
                <a href="/" class="btn-ghost contact-success-btn">Back to home</a>
                <button type="button" class="contact-success-link" @click="sendAnother">
                  Send another
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.contact-shell {
  min-height: var(--liftag-stable-vh);
  background: #000;
  color: #fff;
}

.contact-page {
  position: relative;
  overflow: hidden;
}

.contact-hero {
  padding: 150px 0 96px;
  position: relative;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: start;
  position: relative;
  z-index: 1;
}

.contact-copy {
  max-width: 540px;
}

.contact-lead {
  margin: 28px 0 0;
}

.contact-subject-pill {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
  padding: 10px 16px 10px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(204, 255, 0, 0.3);
  background: rgba(204, 255, 0, 0.06);
}

.contact-subject-label {
  color: #CCFF00;
  font-size: 9px;
  letter-spacing: 0.28em;
}

.contact-subject-value {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 14px;
  letter-spacing: -0.01em;
  color: #fff;
}

.contact-card {
  position: relative;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: clamp(24px, 3vw, 36px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 60px rgba(204, 255, 0, 0.05);
  backdrop-filter: blur(8px);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.contact-label {
  color: #CCFF00;
  font-size: 10px;
  letter-spacing: 0.28em;
}

.contact-field input,
.contact-field textarea {
  width: 100%;
  background: #0E0E0E;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.contact-field textarea {
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
}

.contact-field input:focus,
.contact-field textarea:focus {
  outline: none;
  border-color: rgba(204, 255, 0, 0.55);
  box-shadow: 0 0 0 3px rgba(204, 255, 0, 0.18);
}

.contact-field input:disabled,
.contact-field textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-counter {
  align-self: flex-end;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.08em;
}

.contact-turnstile {
  min-height: 65px;
  display: flex;
  align-items: center;
}

.contact-submit {
  width: 100%;
  padding: 16px 32px;
  font-size: 13px;
}

.contact-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 0 20px rgba(204, 255, 0, 0.18);
}

.contact-error {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid rgba(255, 45, 85, 0.4);
  background: rgba(255, 45, 85, 0.08);
  border-radius: 10px;
  color: #FF6F8B;
  font-size: 13px;
  line-height: 1.5;
}

.contact-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 12px 8px 6px;
}

.contact-success-mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: rgba(204, 255, 0, 0.12);
  color: #CCFF00;
  box-shadow: 0 0 30px rgba(204, 255, 0, 0.35);
}

.contact-success-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: clamp(28px, 3vw, 36px);
  text-transform: uppercase;
  letter-spacing: -0.03em;
  margin: 0;
}

.contact-success-body {
  color: rgba(255, 255, 255, 0.65);
  font-size: 15px;
  line-height: 1.6;
  max-width: 360px;
  margin: 0;
}

.contact-success-body strong {
  color: #fff;
  font-weight: 600;
}

.contact-success-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.contact-success-btn {
  padding: 14px 26px;
  font-size: 12px;
  text-decoration: none;
}

.contact-success-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 12px 8px;
  transition: color 200ms ease;
}

.contact-success-link:hover {
  color: #CCFF00;
}

@media (max-width: 900px) {
  .contact-hero {
    padding: 120px 0 72px;
  }
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .contact-copy {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .contact-hero {
    padding: 104px 0 56px;
  }
  .contact-card {
    padding: 22px;
  }
}
</style>
