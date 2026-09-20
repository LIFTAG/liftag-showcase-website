<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymStudio'

const props = withDefaults(defineProps<{ reduced?: boolean }>(), { reduced: false })
const { locale } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const section = useTemplateRef<HTMLElement>('section')
const guideVideo = useTemplateRef<HTMLVideoElement>('guideVideo')
const customVideo = useTemplateRef<HTMLVideoElement>('customVideo')
const source = shallowRef<'liftag' | 'gym'>('liftag')
const active = shallowRef(false)
const customSrc = shallowRef('')
const customName = shallowRef('')
const fileError = shallowRef('')
const { exercise, failed, loading, deferred, load } = useGymInstructionPreview(
  guideVideo,
  () => active.value && source.value === 'liftag',
  () => props.reduced,
  true,
  locale,
  { autoplay: false },
)
let observer: IntersectionObserver | null = null

function releaseCustomVideo() {
  customVideo.value?.pause()
  if (customSrc.value) URL.revokeObjectURL(customSrc.value)
  customSrc.value = ''
  customName.value = ''
  fileError.value = ''
}

function selectVideo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('video/')) {
    fileError.value = t('studio.invalidFile')
    return
  }
  releaseCustomVideo()
  customSrc.value = URL.createObjectURL(file)
  customName.value = file.name
  source.value = 'gym'
}

function customPlaybackError() {
  releaseCustomVideo()
  fileError.value = t('studio.playbackError')
}

function syncCustomPlayback() {
  const player = customVideo.value
  if (!player) return
  if (!active.value || source.value !== 'gym' || document.hidden) player.pause()
}

watch([active, source], syncCustomPlayback)

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => { active.value = Boolean(entry?.isIntersecting) }, { rootMargin: '180px 0px', threshold: 0.01 })
  if (section.value) observer.observe(section.value)
  document.addEventListener('visibilitychange', syncCustomPlayback)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', syncCustomPlayback)
  releaseCustomVideo()
})
</script>

<template>
  <section id="gyms" ref="section" class="gts gx-section-shell" tabindex="-1" aria-labelledby="trainer-studio-title">
    <span id="trainers" class="gts-anchor" aria-hidden="true" />
    <header class="gts-header">
      <div>
        <p class="gts-eyebrow">{{ t('studio.eyebrow') }}</p>
        <h2 id="trainer-studio-title" class="gts-title">{{ t('studio.title') }} <span>{{ t('studio.titleAccent') }}</span></h2>
      </div>
      <p class="gts-intro">{{ t('studio.intro') }}</p>
    </header>

    <div class="gts-studio">
      <div class="gts-player">
        <video
          v-show="source === 'liftag' && !reduced && !failed"
          ref="guideVideo"
          :poster="exercise?.imageUrl || '/assets/gym3d/bench-instruction.webp'"
          controls
          muted
          playsinline
          preload="none"
          :aria-label="t('studio.guideAlt')"
        />
        <video
          v-if="source === 'gym' && customSrc"
          ref="customVideo"
          :src="customSrc"
          controls
          playsinline
          preload="metadata"
          :aria-label="customName"
          @error="customPlaybackError"
        />
        <div v-else-if="source === 'gym'" class="gts-empty">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 7h22l10 10v24H8zM30 7v10h10M17 25h14M24 18v14" /></svg>
          <strong>{{ t('studio.emptyTitle') }}</strong>
          <span>{{ t('studio.emptyBody') }}</span>
        </div>
        <img
          v-else-if="reduced || failed"
          src="/assets/gym3d/bench-instruction.webp"
          width="1080"
          height="603"
          :alt="t('studio.guideAlt')"
          loading="lazy"
        />
        <div class="gts-player-shade" aria-hidden="true" />
        <div v-if="source === 'liftag' || customSrc" class="gts-player-copy">
          <span>{{ source === 'liftag' ? t('studio.guideBadge') : customName }}</span>
          <strong>{{ t('studio.exercise') }}</strong>
        </div>
        <p v-if="source === 'liftag' && (loading || failed)" class="gts-player-status">{{ failed ? t('studio.guideUnavailable') : t('studio.guideLoading') }}</p>
        <button v-else-if="source === 'liftag' && deferred" type="button" class="gts-load" @click="load">{{ t('studio.loadVideo') }}</button>
      </div>

      <aside class="gts-panel" :aria-label="t('studio.sourceLabel')">
        <div>
          <p class="gts-label">{{ t('studio.sourceLabel') }}</p>
          <div class="gts-switch" role="group" :aria-label="t('studio.sourceLabel')">
            <button type="button" :class="{ active: source === 'liftag' }" :aria-pressed="source === 'liftag'" @click="source = 'liftag'">{{ t('studio.liftagSource') }}</button>
            <button type="button" :class="{ active: source === 'gym' }" :aria-pressed="source === 'gym'" @click="source = 'gym'">{{ t('studio.gymSource') }}</button>
          </div>
          <p class="gts-note">{{ source === 'liftag' ? t('studio.liftagNote') : t('studio.gymNote') }}</p>

          <div class="gts-upload">
            <label class="gts-file">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" /></svg>
              <span><strong>{{ customSrc ? t('studio.replaceClip') : t('studio.chooseClip') }}</strong><small>{{ customName || t('studio.fileHint') }}</small></span>
              <input type="file" accept="video/*" @change="selectVideo" />
            </label>
            <button v-if="customSrc" type="button" class="gts-remove" @click="releaseCustomVideo">{{ t('studio.removeClip') }}</button>
            <p v-if="fileError" class="gts-error" role="alert">{{ fileError }}</p>
          </div>
        </div>

        <div class="gts-member">
          <p class="gts-label">{{ t('studio.memberView') }}</p>
          <div class="gts-logger">
            <strong>{{ t('studio.exercise') }}</strong>
            <div><span>{{ t('studio.weight') }}</span><span>{{ t('studio.reps') }}</span><span class="gts-log-action">{{ t('studio.logSet') }}</span></div>
          </div>
        </div>
      </aside>
    </div>

    <footer class="gts-footer">
      <strong>{{ t('studio.footer') }}</strong>
      <a href="#lifters">{{ t('studio.memberLink') }} <span aria-hidden="true">↗</span></a>
    </footer>
  </section>
</template>

<style scoped>
.gts { position: relative; padding: clamp(5rem, 9vw, 9rem) clamp(1.25rem, 5vw, 5rem); color: var(--gx-fg, #edf1ed); background: radial-gradient(circle at 72% 38%, rgba(39,66,47,.18), transparent 38%); }
.gts-anchor { position: absolute; top: 0; }
.gts-header { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(18rem, .75fr); align-items: end; gap: clamp(2rem, 6vw, 7rem); margin-bottom: 2.4rem; }
.gts-eyebrow, .gts-label { margin: 0 0 1rem; color: rgba(237,241,237,.66); font: 600 .72rem/1.3 var(--liftag-font-mono, monospace); letter-spacing: .2em; text-transform: uppercase; }
.gts-eyebrow::first-letter { color: var(--gx-lime, #ccff00); }
.gts-title { max-width: 14ch; margin: 0; font: 700 clamp(2.5rem, 4.3vw, 3.75rem)/.96 var(--liftag-font-headline, sans-serif); letter-spacing: -.055em; text-wrap: balance; }
.gts-title span { display: block; color: var(--gx-lime, #ccff00); text-shadow: 0 0 40px rgba(204,255,0,.13); }
.gts-intro { max-width: 28ch; margin: 0 0 .5rem; color: rgba(237,241,237,.76); font-size: clamp(1.1rem, 1.8vw, 1.5rem); line-height: 1.45; }
.gts-studio { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(21rem, 1fr); overflow: hidden; border: 1px solid rgba(237,241,237,.2); border-radius: 10px; background: rgba(7,10,8,.78); box-shadow: 0 30px 90px rgba(0,0,0,.25); }
.gts-player { position: relative; align-self: start; width: 100%; height: auto; min-height: 32rem; max-height: 38rem; aspect-ratio: 16/10; overflow: hidden; background: #050706; }
.gts-player video, .gts-player > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.gts-empty { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: .7rem; padding: 2rem; color: rgba(237,241,237,.68); text-align: center; background: radial-gradient(circle, rgba(204,255,0,.06), transparent 48%); }
.gts-empty svg { width: 3.5rem; fill: none; stroke: var(--gx-lime, #ccff00); stroke-width: 1.2; }
.gts-empty strong { color: var(--gx-fg, #edf1ed); font-size: 1.2rem; }
.gts-empty span { max-width: 30ch; line-height: 1.5; }
.gts-player-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, transparent 48%, rgba(0,0,0,.86)); }
.gts-player-copy { position: absolute; right: 2rem; bottom: 4.5rem; left: 2rem; display: grid; gap: .6rem; pointer-events: none; }
.gts-player-copy span { color: var(--gx-lime, #ccff00); font: 650 .75rem var(--liftag-font-mono, monospace); letter-spacing: .11em; }
.gts-player-copy strong { font: 650 clamp(1.8rem, 3vw, 3rem)/1 var(--liftag-font-headline, sans-serif); }
.gts-player-status { position: absolute; top: 1rem; left: 1rem; margin: 0; padding: .65rem .8rem; border-radius: 5px; background: rgba(4,6,5,.78); font-size: .8rem; }
.gts-load { position: absolute; top: 1rem; left: 1rem; min-height: 44px; padding: .65rem 1rem; border: 1px solid rgba(237,241,237,.45); border-radius: 8px; color: var(--gx-fg, #edf1ed); background: rgba(4,6,5,.9); font-weight: 650; cursor: pointer; }
.gts-panel { display: flex; flex-direction: column; justify-content: space-between; gap: 3rem; padding: clamp(1.5rem, 3vw, 2.4rem); border-left: 1px solid rgba(237,241,237,.16); }
.gts-switch { display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border: 1px solid rgba(237,241,237,.24); border-radius: 999px; }
.gts-switch button { min-height: 50px; padding: .7rem 1rem; border: 0; border-radius: 999px; color: rgba(237,241,237,.72); background: transparent; font: 650 .95rem var(--liftag-font-body, sans-serif); cursor: pointer; }
.gts-switch button.active { color: #090b09; background: var(--gx-lime, #ccff00); box-shadow: 0 0 22px rgba(204,255,0,.18); }
.gts-switch button:focus-visible, .gts-file:focus-within, .gts-remove:focus-visible, .gts-load:focus-visible, .gts-footer a:focus-visible { outline: 2px solid var(--gx-lime, #ccff00); outline-offset: 3px; }
.gts-note { min-height: 3em; margin: 1rem 0 1.6rem; color: rgba(237,241,237,.66); line-height: 1.5; }
.gts-upload { display: grid; gap: .65rem; }
.gts-file { display: flex; align-items: center; gap: 1rem; min-height: 78px; padding: 1rem; border: 1px solid rgba(237,241,237,.22); border-radius: 8px; cursor: pointer; }
.gts-file:hover { border-color: rgba(204,255,0,.55); }
.gts-file svg { width: 28px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.5; }
.gts-file span { display: grid; gap: .25rem; min-width: 0; }
.gts-file strong { font-size: .95rem; }
.gts-file small { overflow: hidden; color: rgba(237,241,237,.58); text-overflow: ellipsis; white-space: nowrap; }
.gts-file input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.gts-remove { justify-self: start; min-height: 44px; padding: .5rem 0; border: 0; color: var(--gx-lime, #ccff00); background: transparent; cursor: pointer; }
.gts-error { margin: 0; color: #ffaaa2; font-size: .82rem; line-height: 1.4; }
.gts-member { padding-top: 1.5rem; border-top: 1px solid rgba(237,241,237,.18); }
.gts-logger { padding: 1.2rem; border: 1px solid rgba(237,241,237,.18); border-radius: 8px; }
.gts-logger > strong { display: block; margin-bottom: 1.2rem; }
.gts-logger > div { display: grid; grid-template-columns: .7fr .7fr 1.4fr; align-items: center; gap: .75rem; }
.gts-logger span { font-size: 1.15rem; font-weight: 650; }
.gts-log-action { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: .7rem .8rem; border-radius: 8px; color: #090b09; background: var(--gx-lime, #ccff00); font-size: .8rem !important; font-weight: 750 !important; }
.gts-footer { display: flex; justify-content: space-between; align-items: center; gap: 2rem; padding-top: 2.4rem; }
.gts-footer strong { font: 650 clamp(1.65rem, 3vw, 2.6rem)/1.1 var(--liftag-font-headline, sans-serif); letter-spacing: -.035em; }
.gts-footer a { min-height: 44px; display: inline-flex; align-items: center; gap: .6rem; color: var(--gx-lime, #ccff00); text-decoration: none; }
@media (max-width: 920px) {
  .gts-header, .gts-studio { grid-template-columns: 1fr; }
  .gts-player { height: auto; min-height: 0; max-height: none; aspect-ratio: 16/10; }
  .gts-panel { border-top: 1px solid rgba(237,241,237,.16); border-left: 0; }
}
@media (max-width: 600px) {
  .gts-player { aspect-ratio: 4/3; }
  .gts-player-copy { right: 1rem; bottom: 4rem; left: 1rem; }
  .gts-panel { padding: 1.25rem; }
  .gts-footer { align-items: flex-start; flex-direction: column; }
  .gts-logger > div { grid-template-columns: 1fr 1fr; }
  .gts-log-action { grid-column: 1 / -1; }
}
</style>
