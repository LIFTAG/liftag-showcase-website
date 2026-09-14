import type Hls from 'hls.js';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { CatalogExercise } from '~/types/catalog';
import { preferredCatalogVideoUrl } from '../utils/catalogVideo.ts';
import { benchInstruction } from '../utils/gymscan/equipment.ts';
import { coachingMediaSource } from '../utils/gymscan/coachingMedia.ts';
import type { SiteLocale } from '~/types/locale';
import { useVideoLanguage } from './useVideoLanguage.ts';
import { canUseNativeHls } from '../utils/exerciseVideoLanguage.ts';

/** Resolve only the real matched bench instruction, near its visible shot. */
export function useGymInstructionPreview(video: Ref<HTMLVideoElement | null>, active: () => boolean, reduced: () => boolean, sameOrigin = false, locale: MaybeRefOrGetter<SiteLocale> = 'en') {
  const exercise = shallowRef<CatalogExercise | null>(null);
  const failed = shallowRef(false);
  const loading = shallowRef(false);
  let hls: Hls | null = null;
  let disposed = false;
  let request: Promise<CatalogExercise> | null = null;
  let attached: HTMLVideoElement | null = null;
  let attachedSource = '';
  let abort = new AbortController();
  let revision = 0;
  const { bind, unbind } = useVideoLanguage(locale);
  async function sync() {
    const current = ++revision;
    const requestedLocale = toValue(locale);
    if (!active() || document.hidden || reduced()) { loading.value = false; video.value?.pause(); return; }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) { loading.value = false; return; }
    loading.value = true;
    failed.value = false;
    try {
      request ??= $fetch<CatalogExercise>(`/api/catalog/exercises/${benchInstruction.slug}?locale=${requestedLocale}`, { signal: abort.signal, timeout: 12000 });
      const result = await request;
      if (disposed || current !== revision || requestedLocale !== toValue(locale) || !active() || reduced() || document.hidden) return;
      exercise.value = result;
      await nextTick();
      if (disposed || current !== revision) return;
      const el = video.value;
      const catalogSource = preferredCatalogVideoUrl(exercise.value.videos, toValue(locale));
      if (!catalogSource) {
        if (attached) unbind(attached);
        hls?.destroy();
        hls = null;
        attached = null;
        attachedSource = '';
        failed.value = true;
        return;
      }
      const source = sameOrigin ? coachingMediaSource(catalogSource) : catalogSource;
      if (!el) return;
      if (attached !== el || attachedSource !== source) {
        if (attached) unbind(attached);
        hls?.destroy();
        hls = null;
        attached = el;
        attachedSource = source;
        if (/\.m3u8(?:\?|$)/i.test(source) && !canUseNativeHls(el)) {
          const HlsCtor = (await import('hls.js')).default;
          if (disposed || current !== revision || attached !== el || attachedSource !== source) return;
          if (HlsCtor.isSupported()) {
            hls = new HlsCtor({ maxBufferLength: 8 });
            hls.on(HlsCtor.Events.ERROR, (_event, data) => {
              if (!data.fatal) return;
              unbind(el);
              hls?.destroy();
              hls = null;
              failed.value = true;
              el.pause();
            });
            hls.loadSource(source);
            hls.attachMedia(el);
            bind(el, hls);
          } else if (el.canPlayType('application/vnd.apple.mpegurl')) el.src = source;
          else { failed.value = true; return; }
        } else { el.src = source; bind(el); }
      }
      if (!disposed && active() && !reduced() && !document.hidden) el.play().catch(() => {});
    } catch {
      if (!disposed && current === revision) { failed.value = true; request = null; }
    } finally { if (!disposed && current === revision) loading.value = false; }
  }
  watch([active, reduced], sync);
  watch(() => toValue(locale), () => {
    abort.abort();
    abort = new AbortController();
    request = null;
    exercise.value = null;
    failed.value = false;
    sync();
  });
  onMounted(() => { document.addEventListener('visibilitychange', sync); sync(); });
  onBeforeUnmount(() => {
    disposed = true;
    revision++;
    abort.abort();
    document.removeEventListener('visibilitychange', sync);
    const el = attached;
    if (el) unbind(el);
    hls?.destroy();
    if (el) { el.pause(); el.removeAttribute('src'); el.load(); }
  });
  return { exercise, failed, loading };
}
