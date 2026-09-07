import type Hls from 'hls.js';
import type { CatalogExercise } from '~/types/catalog';
import { preferredCatalogVideoUrl } from '~/utils/catalogVideo';
import { benchInstruction } from '~/utils/gymscan/equipment';
import { coachingMediaSource } from '~/utils/gymscan/coachingMedia';

/** Resolve only the real matched bench instruction, near its visible shot. */
export function useGymInstructionPreview(video: Ref<HTMLVideoElement | null>, active: () => boolean, reduced: () => boolean, sameOrigin = false) {
  const exercise = shallowRef<CatalogExercise | null>(null);
  const failed = shallowRef(false);
  const loading = shallowRef(false);
  let hls: Hls | null = null;
  let disposed = false;
  let request: Promise<CatalogExercise> | null = null;
  let attached: HTMLVideoElement | null = null;
  const abort = new AbortController();
  async function sync() {
    if (!active() || document.hidden || reduced()) { video.value?.pause(); return; }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    loading.value = true;
    try {
      request ??= $fetch<CatalogExercise>(`/api/catalog/exercises/${benchInstruction.slug}`, { signal: abort.signal, timeout: 12000 });
      exercise.value = await request;
      if (disposed || !active() || reduced() || document.hidden) return;
      await nextTick();
      const el = video.value;
      const catalogSource = preferredCatalogVideoUrl(exercise.value.videos);
      if (!catalogSource) { failed.value = true; return; }
      const source = sameOrigin ? coachingMediaSource(catalogSource) : catalogSource;
      if (!el) return;
      if (attached !== el) {
        hls?.destroy();
        hls = null;
        attached = el;
        if (/\.m3u8(?:\?|$)/i.test(source) && !el.canPlayType('application/vnd.apple.mpegurl')) {
          const HlsCtor = (await import('hls.js')).default;
          if (disposed || attached !== el) return;
          if (HlsCtor.isSupported()) {
            hls = new HlsCtor({ maxBufferLength: 8 });
            hls.on(HlsCtor.Events.ERROR, (_event, data) => { if (data.fatal) { failed.value = true; el.pause(); } });
            hls.loadSource(source);
            hls.attachMedia(el);
          } else if (el.canPlayType('application/vnd.apple.mpegurl')) el.src = source;
          else { failed.value = true; return; }
        } else el.src = source;
      }
      if (!disposed && active() && !reduced() && !document.hidden) el.play().catch(() => {});
    } catch { if (!disposed) failed.value = true; }
    finally { if (!disposed) loading.value = false; }
  }
  watch([active, reduced], sync);
  onMounted(() => { document.addEventListener('visibilitychange', sync); sync(); });
  onBeforeUnmount(() => {
    disposed = true;
    abort.abort();
    document.removeEventListener('visibilitychange', sync);
    hls?.destroy();
    const el = attached;
    if (el) { el.pause(); el.removeAttribute('src'); el.load(); }
  });
  return { exercise, failed, loading };
}
