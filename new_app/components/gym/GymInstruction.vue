<script setup lang="ts">
import type Hls from "hls.js";
import type { CatalogExercise } from "~/types/catalog";
import { preferredCatalogVideoUrl } from "~/utils/catalogVideo";
import { benchInstruction } from "~/utils/gymscan/equipment";

const emit = defineEmits<{ close: []; playing: [] }>();
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const video = useTemplateRef<HTMLVideoElement>("video");
const exercise = shallowRef<CatalogExercise | null>(null);
const loading = shallowRef(true);
const failed = shallowRef(false);
const muted = shallowRef(true);
let hls: Hls | null = null;
let disposed = false;
const abort = new AbortController();

function fail() {
  loading.value = false;
  failed.value = true;
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
      `/api/catalog/exercises/${benchInstruction.slug}`,
      { signal: abort.signal, timeout: 12000 },
    );
    if (disposed) return;
    const source = preferredCatalogVideoUrl(exercise.value.videos);
    if (!source) {
      fail();
      return;
    }
    await nextTick();
    const el = video.value;
    if (!el || disposed) return;
    if (
      /\.m3u8(?:\?|$)/i.test(source) &&
      !el.canPlayType("application/vnd.apple.mpegurl")
    ) {
      const HlsCtor = (await import("hls.js")).default;
      if (disposed) return;
      if (!HlsCtor.isSupported()) {
        fail();
        return;
      }
      hls = new HlsCtor({ maxBufferLength: 15 });
      hls.on(HlsCtor.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.loadSource(source);
      hls.attachMedia(el);
    } else el.src = source;
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
  hls?.destroy();
  const el = video.value;
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
        <p class="gx-protocol">FROM THE LIFTAG EXERCISE LIBRARY</p>
        <h2 id="gx-instruction-title">
          {{ exercise?.name ?? benchInstruction.name }}
        </h2>
      </div>
      <button autofocus aria-label="Close instructions" @click="close">
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
        aria-label="EZ-Bar Skullcrusher instruction video"
        @playing="playing"
        @canplay="loading = false"
        @error="fail"
        @volumechange="muted = video?.muted ?? true"
      />
      <p v-if="loading" class="gx-instruction__status" role="status">
        Opening instructions…
      </p>
      <div v-if="failed" class="gx-instruction__error" role="status">
        <p>The video is unavailable right now.</p>
        <NuxtLink
          :to="`/exercises/${benchInstruction.slug}`"
          class="btn-ghost"
          ><HoloPill />Read the exercise guide</NuxtLink
        >
      </div>
    </div>
    <footer>
      <span>Flat bench + EZ bar</span>
      <button v-if="!failed" :aria-pressed="!muted" @click="muted = !muted">
        {{ muted ? "Enable sound" : "Mute sound" }}
      </button>
      <NuxtLink :to="`/exercises/${benchInstruction.slug}`"
        >Exercise details ↗</NuxtLink
      >
    </footer>
  </dialog>
</template>
