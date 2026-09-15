<script setup lang="ts">
import type Hls from "hls.js";
import type { CatalogExercise } from "~/types/catalog";
import { preferredCatalogVideoUrl } from "~/utils/catalogVideo";
import { benchInstruction } from "~/utils/gymscan/equipment";
import { en, sk } from '~/i18n/messages/gymDemo';
import { useVideoLanguage } from '~/composables/useVideoLanguage';
import { useSiteLocale } from '~/composables/useSiteLocale';
import { canUseNativeHls } from '~/utils/exerciseVideoLanguage';
import { exerciseHlsConfig, exerciseHlsRequestUrl } from '~/utils/exerciseHls';

const emit = defineEmits<{ close: []; playing: [] }>();
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const video = useTemplateRef<HTMLVideoElement>("video");
const exercise = shallowRef<CatalogExercise | null>(null);
const loading = shallowRef(true);
const failed = shallowRef(false);
const muted = shallowRef(true);
const { locale, href } = useSiteLocale();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const videoLanguage = useVideoLanguage(locale);
let hls: Hls | null = null;
let disposed = false;
const abort = new AbortController();

function fail() {
  loading.value = false;
  failed.value = true;
  if (video.value) videoLanguage.unbind(video.value);
  hls?.destroy();
  hls = null;
  video.value?.pause();
}
function close() {
  dialog.value?.close();
}
function playing() {
  loading.value = false;
  emit("playing");
}

onMounted(async () => {
  dialog.value?.showModal();
  try {
    exercise.value = await $fetch<CatalogExercise>(
      `/api/catalog/exercises/${benchInstruction.slug}?locale=${locale.value}`,
      { signal: abort.signal, timeout: 12000 },
    );
    if (disposed) return;
    const source = preferredCatalogVideoUrl(exercise.value.videos, locale.value);
    if (!source) {
      fail();
      return;
    }
    await nextTick();
    const el = video.value;
    if (!el || disposed) return;
    if (
      /\.m3u8(?:\?|$)/i.test(source) &&
      !canUseNativeHls(el)
    ) {
      const HlsCtor = (await import("hls.js")).default;
      if (disposed) return;
      if (!HlsCtor.isSupported()) {
        fail();
        return;
      }
      hls = new HlsCtor({ ...exerciseHlsConfig, maxBufferLength: 15 });
      hls.on(HlsCtor.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.loadSource(source);
      hls.attachMedia(el);
      videoLanguage.bind(el, hls);
    } else { el.src = exerciseHlsRequestUrl(source); videoLanguage.bind(el); }
    // Silent by default, as in the rest of the experience. Native controls remain
    // available when a browser requires another gesture to begin playback.
    el.play().catch(() => {
      loading.value = false;
    });
  } catch {
    if (!disposed) fail();
  }
});
onBeforeUnmount(() => {
  disposed = true;
  abort.abort();
  const el = video.value;
  if (el) videoLanguage.unbind(el);
  hls?.destroy();
  if (el) {
    el.pause();
    el.removeAttribute("src");
    el.load();
  }
  dialog.value?.close();
});
</script>
<template>
  <dialog
    ref="dialog"
    class="gx-instruction"
    aria-labelledby="gx-instruction-title"
    @close="emit('close')"
    @click="$event.target === dialog && close()"
  >
    <header>
      <div>
        <p class="gx-protocol">{{ t('member.librarySource') }}</p>
        <h2 id="gx-instruction-title">
          {{ exercise?.name ?? t('member.exercise') }}
        </h2>
      </div>
      <button autofocus :aria-label="t('nav.closeMenu')" @click="close">
        ×
      </button>
    </header>
    <div class="gx-instruction__media" :aria-busy="loading">
      <video
        v-if="!failed"
        ref="video"
        :poster="exercise?.imageUrl ?? undefined"
        :muted="muted"
        controls
        playsinline
        preload="none"
        :aria-label="t('member.previewAlt')"
        @playing="playing"
        @canplay="loading = false"
        @error="fail"
        @volumechange="muted = video?.muted ?? true"
      />
      <p v-if="loading" class="gx-instruction__status" role="status">
        {{ t('member.opening') }}
      </p>
      <div v-if="failed" class="gx-instruction__error" role="status">
        <p>{{ t('coaching.unavailable') }}</p>
        <NuxtLink
          :to="href(`/exercises/${benchInstruction.slug}`)"
          class="btn-ghost"
          ><HoloPill />{{ t('member.openGuide') }}</NuxtLink
        >
      </div>
    </div>
    <footer>
      <span>{{ t('member.equipment') }}</span>
      <button v-if="!failed" :aria-pressed="!muted" @click="muted = !muted">
        {{ muted ? t('member.enableSound') : t('member.muteSound') }}
      </button>
      <NuxtLink :to="href(`/exercises/${benchInstruction.slug}`)"
        >{{ t('nav.library') }} ↗</NuxtLink
      >
    </footer>
  </dialog>
</template>
