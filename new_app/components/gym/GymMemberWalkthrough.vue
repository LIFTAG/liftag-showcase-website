<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymStudio'

const props = withDefaults(defineProps<{ reduced?: boolean }>(), { reduced: false })

const { locale } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const section = useTemplateRef<HTMLElement>('section')
const video = useTemplateRef<HTMLVideoElement>('video')
const active = shallowRef(false)
const { exercise, failed, loading, deferred, load } = useGymInstructionPreview(video, () => active.value, () => props.reduced, true, locale, { autoplay: false })
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => { active.value = Boolean(entry?.isIntersecting) }, { rootMargin: '240px 0px', threshold: 0.01 })
  if (section.value) observer.observe(section.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="lifters" ref="section" class="gmw gx-section-shell" tabindex="-1" aria-labelledby="member-walkthrough-title">
    <span id="progress" class="gmw-anchor" aria-hidden="true" />
    <header class="gmw-header">
      <div>
        <p class="gmw-eyebrow">{{ t('member.eyebrow') }}</p>
        <h2 id="member-walkthrough-title" class="gmw-title"><span>{{ t('member.titleAccent') }}</span> {{ t('member.title') }}</h2>
      </div>
      <p class="gmw-intro">{{ t('member.intro') }}</p>
    </header>

    <div class="gmw-flow">
      <article class="gmw-step gmw-step--scan">
        <p class="gmw-kicker"><b>01</b> / {{ t('member.connectStep').split(' / ')[1] }}</p>
        <div class="gmw-visual gmw-visual--tag">
          <img src="/assets/gym3d/tag-poster.webp" width="1000" height="1000" :alt="t('member.scanAlt')" loading="lazy" />
        </div>
        <h3>{{ t('member.scanTitle') }}</h3>
        <p>{{ t('member.scanBody') }}</p>
      </article>

      <span class="gmw-line" aria-hidden="true" />

      <article class="gmw-step gmw-step--watch">
        <p class="gmw-kicker"><b>02</b> / {{ t('member.watchStep').split(' / ')[1] }}</p>
        <div class="gmw-visual gmw-visual--video">
          <video
            v-if="!reduced && !failed"
            ref="video"
            :poster="exercise?.imageUrl || '/assets/gym3d/bench-instruction.webp'"
            controls
            muted
            playsinline
            preload="none"
            :aria-label="t('member.watchAlt')"
          />
          <img v-else src="/assets/gym3d/bench-instruction.webp" width="1080" height="603" :alt="t('member.watchAlt')" loading="lazy" />
          <span class="gmw-video-label">{{ t('member.previewLabel') }}</span>
          <p v-if="loading || failed" class="gmw-media-status">{{ failed ? t('member.watchUnavailable') : t('member.watchLoading') }}</p>
          <button v-else-if="deferred" type="button" class="gmw-load" @click="load">{{ t('member.loadVideo') }}</button>
        </div>
        <h3>{{ t('member.watchTitle') }}</h3>
        <p>{{ t('member.watchBody') }}</p>
      </article>

      <span class="gmw-line" aria-hidden="true" />

      <article class="gmw-step gmw-step--log">
        <p class="gmw-kicker"><b>03</b> / {{ t('member.trainStep').split(' / ')[1] }}</p>
        <div class="gmw-visual gmw-visual--phone">
          <img src="/assets/gym3d/log-set.webp" width="620" height="1344" :alt="t('member.logAlt')" loading="lazy" />
        </div>
        <h3>{{ t('member.logTitle') }}</h3>
        <p>{{ t('member.logBody') }}</p>
      </article>
    </div>

    <footer class="gmw-footer">
      <span class="gmw-nfc" aria-hidden="true">)))</span>
      <span>{{ t('member.connection') }}</span>
      <span class="gmw-availability">{{ t('member.availability') }}</span>
    </footer>
  </section>
</template>

<style scoped>
.gmw { position: relative; padding: clamp(5rem, 9vw, 9rem) clamp(1.25rem, 5vw, 5rem); color: var(--gx-fg, #edf1ed); background: radial-gradient(circle at 35% 45%, rgba(204,255,0,.045), transparent 33%); }
.gmw-anchor { position: absolute; top: 0; }
.gmw-header { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(17rem, .7fr); gap: clamp(2rem, 6vw, 7rem); align-items: end; padding-bottom: 2rem; border-bottom: 1px solid rgba(237,241,237,.24); }
.gmw-eyebrow, .gmw-kicker, .gmw-footer { font: 600 .72rem/1.3 var(--liftag-font-mono, monospace); letter-spacing: .22em; text-transform: uppercase; }
.gmw-eyebrow { margin: 0 0 1.2rem; color: rgba(237,241,237,.66); }
.gmw-title { max-width: 18ch; margin: 0; font: 700 clamp(2.5rem, 4.3vw, 3.75rem)/.96 var(--liftag-font-headline, sans-serif); letter-spacing: -.055em; text-wrap: balance; }
.gmw-title span { color: var(--gx-lime, #ccff00); text-shadow: 0 0 40px rgba(204,255,0,.13); }
.gmw-intro { max-width: 22ch; margin: 0 0 .4rem; padding-left: clamp(1.5rem, 4vw, 5rem); border-left: 1px solid rgba(237,241,237,.28); font-size: clamp(1.1rem, 1.8vw, 1.55rem); line-height: 1.45; }
.gmw-flow { display: grid; grid-template-columns: .9fr minmax(1rem, .2fr) 1.35fr minmax(1rem, .2fr) .9fr; align-items: center; gap: 0; padding: 2.4rem 0 2rem; }
.gmw-step { min-width: 0; }
.gmw-kicker { margin: 0 0 1.2rem; color: rgba(237,241,237,.7); }
.gmw-kicker b { color: var(--gx-lime, #ccff00); }
.gmw-visual { position: relative; overflow: hidden; border: 1px solid rgba(237,241,237,.22); border-radius: 8px; background: #080b09; }
.gmw-visual img, .gmw-visual video { display: block; width: 100%; height: 100%; object-fit: cover; }
.gmw-visual--tag { aspect-ratio: .82; }
.gmw-visual--tag img { filter: saturate(.86) contrast(1.04); }
.gmw-visual--video { aspect-ratio: 16/10; box-shadow: 0 25px 60px rgba(0,0,0,.38); }
.gmw-visual--phone { height: clamp(24rem, 37vw, 42rem); border: 0; background: radial-gradient(ellipse, rgba(204,255,0,.08), transparent 62%); }
.gmw-visual--phone img { width: auto; max-width: 100%; margin: auto; object-fit: contain; filter: drop-shadow(0 20px 28px rgba(0,0,0,.7)); }
.gmw-video-label { position: absolute; top: .75rem; left: .75rem; padding: .4rem .55rem; border-radius: 4px; color: var(--gx-lime, #ccff00); background: rgba(4,6,5,.82); font: 650 .68rem var(--liftag-font-mono, monospace); letter-spacing: .08em; text-transform: uppercase; pointer-events: none; }
.gmw-media-status { position: absolute; right: .75rem; bottom: .65rem; left: .75rem; margin: 0; padding: .55rem .7rem; border-radius: 5px; background: rgba(4,6,5,.78); font-size: .75rem; }
.gmw-load { position: absolute; right: 50%; bottom: 1rem; min-height: 44px; padding: .65rem 1rem; transform: translateX(50%); border: 1px solid rgba(237,241,237,.45); border-radius: 8px; color: var(--gx-fg, #edf1ed); background: rgba(4,6,5,.9); font-weight: 650; cursor: pointer; }
.gmw-load:focus-visible { outline: 2px solid var(--gx-lime, #ccff00); outline-offset: 3px; }
.gmw-step h3 { margin: 1.45rem 0 .25rem; font: 700 clamp(1.65rem, 2.4vw, 2.5rem)/1 var(--liftag-font-headline, sans-serif); letter-spacing: -.035em; }
.gmw-step > p:last-child { margin: 0; color: rgba(237,241,237,.66); font-size: 1rem; line-height: 1.55; }
.gmw-line { height: 2px; margin-top: -1rem; background: var(--gx-lime, #ccff00); box-shadow: 0 0 18px rgba(204,255,0,.35); }
.gmw-line::after { content: ''; display: block; width: .65rem; height: .65rem; margin: -.28rem 0 0 auto; border-top: 2px solid #ccff00; border-right: 2px solid #ccff00; transform: rotate(45deg); }
.gmw-footer { display: flex; align-items: center; gap: 1rem; padding-top: 1.25rem; border-top: 1px solid rgba(237,241,237,.24); color: rgba(237,241,237,.68); }
.gmw-nfc { color: var(--gx-fg, #edf1ed); font-size: 1rem; transform: rotate(90deg); }
.gmw-availability { margin-left: auto; letter-spacing: .12em; text-transform: none; }
@media (max-width: 850px) {
  .gmw-header { grid-template-columns: 1fr; }
  .gmw-intro { padding-left: 0; border-left: 0; }
  .gmw-flow { grid-template-columns: 1fr; gap: 2.5rem; }
  .gmw-line { display: none; }
  .gmw-visual--tag { aspect-ratio: 16/10; }
  .gmw-visual--phone { height: 32rem; }
  .gmw-footer { align-items: flex-start; flex-wrap: wrap; }
  .gmw-availability { width: 100%; margin: .25rem 0 0; }
}
</style>
