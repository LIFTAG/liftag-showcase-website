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
  const canPlay = () => !disposed && active() && !document.hidden && !reduced();

  function release() {
    const el = attached;
    const player = hls;
    // Invalidate ownership before teardown, which can itself dispatch media events.
    attached = null;
    attachedSource = '';
    hls = null;
    if (el) {
      el.removeEventListener('error', onMediaError);
      unbind(el);
    }
    player?.destroy();
    if (el) { el.pause(); el.removeAttribute('src'); el.load(); }
  }

  function fail() {
    revision++;
    release();
    loading.value = false;
    failed.value = true;
  }

  function onMediaError(event: Event) {
    if (event.currentTarget === attached) fail();
  }

  async function sync() {
    const current = ++revision;
    const requestedLocale = toValue(locale);
    if (!canPlay()) { loading.value = false; video.value?.pause(); return; }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) { loading.value = false; return; }
    const isCurrent = () => current === revision && requestedLocale === toValue(locale) && canPlay();
    loading.value = true;
    failed.value = false;
    try {
      request ??= $fetch<CatalogExercise>(`/api/catalog/exercises/${benchInstruction.slug}?locale=${requestedLocale}`, { signal: abort.signal, timeout: 12000 });
      const result = await request;
      if (!isCurrent()) return;
      exercise.value = result;
      await nextTick();
      if (!isCurrent()) return;
      const el = video.value;
      const catalogSource = preferredCatalogVideoUrl(result.videos, requestedLocale);
      if (!catalogSource) { fail(); return; }
      const source = sameOrigin ? coachingMediaSource(catalogSource) : catalogSource;
      if (!el) return;
      if (attached !== el || attachedSource !== source) {
        release();
        let HlsCtor: typeof Hls | undefined;
        if (/\.m3u8(?:\?|$)/i.test(source) && !canUseNativeHls(el)) {
          HlsCtor = (await import('hls.js')).default;
          // A cancelled import owns no attachment and must not clear a newer one.
          if (!isCurrent() || video.value !== el) return;
          if (!HlsCtor.isSupported()) {
            if (!el.canPlayType('application/vnd.apple.mpegurl')) { fail(); return; }
            HlsCtor = undefined;
          }
        }
        attached = el;
        el.addEventListener('error', onMediaError);
        if (HlsCtor) {
          const player = new HlsCtor({ maxBufferLength: 8 });
          hls = player;
          player.on(HlsCtor.Events.ERROR, (_event, data) => {
            if (data.fatal && hls === player && attached === el) fail();
          });
          player.loadSource(source);
          if (!isCurrent()) return;
          player.attachMedia(el);
          if (!isCurrent()) return;
          bind(el, player);
        } else {
          el.src = source;
          bind(el);
        }
        if (!isCurrent()) return;
        attachedSource = source;
      }
      if (isCurrent()) el.play().catch(() => {});
    } catch {
      if (!disposed && current === revision) { request = null; fail(); }
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
    release();
  });
  return { exercise, failed, loading };
}
