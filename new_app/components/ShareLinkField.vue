<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
/**
 * A read-only share link with a copy button. When the Clipboard API fails, the
 * link is left focused and selected, so one keystroke finishes the copy.
 */
const props = defineProps<{
  url: string
}>()

const linkId = useId()
const linkField = useTemplateRef<HTMLInputElement>('linkField')

type CopyState = 'idle' | 'copied' | 'failed'
const copyState = shallowRef<CopyState>('idle')
const copyStatus = computed(() => ({
  idle: '',
  copied: t('handoff.linkCopied'),
  failed: t('handoff.copyFailed'),
})[copyState.value])
let resetTimer: ReturnType<typeof setTimeout> | undefined

function selectLink() {
  linkField.value?.select()
}

async function copyLink() {
  clearTimeout(resetTimer)
  copyState.value = 'idle'
  try {
    // Throws where the Clipboard API is missing (insecure origins, some
    // embedded browsers) as well as when permission is denied.
    await navigator.clipboard.writeText(props.url)
  }
  catch {
    linkField.value?.focus()
    selectLink()
    copyState.value = 'failed'
    return
  }
  copyState.value = 'copied'
  resetTimer = setTimeout(() => {
    copyState.value = 'idle'
  }, 2400)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <div class="share-link">
    <label :for="linkId" class="protocol share-link__label">{{ t('handoff.linkLabel') }}</label>
    <div class="share-link__field">
      <input
        :id="linkId"
        ref="linkField"
        class="share-link__url"
        type="url"
        :value="url"
        readonly
        spellcheck="false"
        @focus="selectLink"
      >
      <button
        type="button"
        class="share-link__copy"
        :class="{ 'is-copied': copyState === 'copied' }"
        @click="copyLink"
      >
        <svg class="share-link__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            v-if="copyState === 'copied'"
            d="M4.5 10.5l3.5 3.5 7.5-8"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g v-else stroke="currentColor" stroke-width="1.6">
            <rect x="7" y="7" width="9.5" height="9.5" rx="2" />
            <path d="M13 4.5V4.2c0-.9-.8-1.7-1.7-1.7H5.2c-.9 0-1.7.8-1.7 1.7v6.1c0 .9.8 1.7 1.7 1.7h.3" stroke-linecap="round" />
          </g>
        </svg>
        <!-- Both labels share one cell, so the button keeps the wider width
             and nothing shifts when it flips. -->
        <span class="share-link__labels">
          <span :class="{ 'is-hidden': copyState === 'copied' }">{{ t('handoff.copy') }}</span>
          <span :class="{ 'is-hidden': copyState !== 'copied' }">{{ t('handoff.copyDone') }}</span>
        </span>
      </button>
    </div>
    <p
      class="share-link__status"
      :class="{ 'is-error': copyState === 'failed' }"
      role="status"
    >
      {{ copyStatus }}
    </p>
  </div>
</template>

<style scoped>
.share-link__label {
  display: block;
  margin-bottom: 12px;
  color: var(--liftag-fg-dim);
}

.share-link__field {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 56px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--liftag-r-lg);
  background: rgba(14, 14, 14, 0.88);
  transition: border-color 200ms var(--ease-out-quart);
}

.share-link__field:focus-within {
  border-color: rgba(204, 255, 0, 0.45);
}

.share-link__url {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  padding: 0 4px 0 12px;
  border: 0;
  background: transparent;
  color: var(--liftag-fg-mid);
  font-family: var(--liftag-font-mono);
  font-size: 13px;
  text-overflow: ellipsis;
  outline: none;
}

.share-link__url::selection {
  background: rgba(204, 255, 0, 0.3);
  color: var(--liftag-fg);
}

.share-link__copy {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 18px 0 15px;
  border: 1px solid rgba(204, 255, 0, 0.32);
  border-radius: 10px;
  background: rgba(204, 255, 0, 0.1);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 200ms var(--ease-out-quart),
    border-color 200ms var(--ease-out-quart);
}

@media (hover: hover) and (pointer: fine) {
  .share-link__copy:hover {
    background: rgba(204, 255, 0, 0.18);
  }
}

.share-link__copy:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.7);
  outline-offset: 3px;
}

.share-link__copy.is-copied {
  border-color: transparent;
  background: rgba(204, 255, 0, 0.18);
}

.share-link__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.share-link__labels {
  display: grid;
}

.share-link__labels > span {
  grid-area: 1 / 1;
}

.share-link__labels > .is-hidden {
  visibility: hidden;
}

.share-link__status {
  min-height: 1.5em;
  margin-top: 10px;
  color: var(--liftag-primary);
  font-size: 13px;
  line-height: 1.5;
}

.share-link__status.is-error {
  color: var(--liftag-warning);
}

@media (prefers-reduced-motion: reduce) {
  .share-link__field,
  .share-link__copy {
    transition: none;
  }
}
</style>
