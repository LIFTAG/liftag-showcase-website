<script setup lang="ts">
interface FeatureCardProps {
  span: string
  tall?: boolean
  img?: string
  imgPosition?: string
  imgScale?: number
  imgPanTo?: string
  imgPanBackTo?: string
  visualHeight?: string
  maskBottomEdge?: boolean
  tag: string
  title: string
  body: string
  compact?: boolean
  href?: string
  linkLabel?: string
  lifts?: { href: string; label: string }[]
}

const cards: FeatureCardProps[] = [
  {
    span: 'span 7',
    tall: true,
    img: '/assets/screens/progression.webp',
    imgPosition: '50% 74%',
    imgScale: 1.12,
    imgPanTo: '84%',
    imgPanBackTo: '68%',
    visualHeight: '64%',
    maskBottomEdge: true,
    tag: 'PROGRESS INSIGHTS',
    title: 'Progress, not vibes.',
    body: 'Per-session weight, 1RM, and total volume, auto-aggregated across every workout. Watch the line climb.',
  },
  {
    span: 'span 5',
    tall: true,
    img: '/assets/screens/log-set.webp',
    imgPosition: '50% 48%',
    imgPanTo: '82%',
    visualHeight: '64%',
    tag: 'LOG SET',
    title: 'Two taps. Set logged.',
    body: 'Weight × reps. RPE optional. The timer auto-runs between sets so you don\'t have to think.',
  },
  {
    span: 'span 5',
    img: '/assets/screens/active-session.webp',
    imgPosition: '50% 53%',
    imgPanTo: '83%',
    visualHeight: '220px',
    tag: 'ROUTINES + SUPERSETS',
    title: 'Plans that flex with you.',
    body: 'Build routines, share them, run supersets. Every session adapts to your real performance.',
  },
  {
    span: 'span 4',
    img: '/assets/screens/history.webp',
    imgPosition: '50% 29%',
    imgPanTo: '83%',
    visualHeight: '220px',
    tag: 'HISTORY',
    title: 'Every session, dated.',
    body: 'Calendar + by-body-part. Find any session in two taps.',
  },
  {
    span: 'span 3',
    img: '/assets/screens/exercises.webp',
    imgPosition: '50% 17%',
    imgPanTo: '100%',
    visualHeight: '230px',
    tag: 'LIBRARY',
    title: '400+ exercises. Form videos.',
    body: 'Vetted by coaches, not influencers.',
    compact: true,
    href: '/exercises',
    linkLabel: 'Browse the library',
    lifts: [
      { href: '/exercises/pull-up', label: 'pull-up' },
      { href: '/exercises/standing-barbell-overhead-press', label: 'overhead press' },
      { href: '/exercises/barbell-romanian-deadlift-rdl', label: 'Romanian deadlift' },
    ],
  },
]

const numbers = [
  { n: '< 2s', l: 'Avg time to log a set' },
  { n: '∞', l: 'Sessions stored' },
  { n: 'EN · SK', l: 'Languages, day one' },
  { n: '0', l: 'Spreadsheets required' },
]

function imgPositionX(card: FeatureCardProps) {
  return card.imgPosition?.split(/\s+/)[0] ?? '50%'
}

function imgPositionY(card: FeatureCardProps) {
  return card.imgPosition?.split(/\s+/)[1] ?? '50%'
}

function imgPanY(card: FeatureCardProps, delta: number) {
  const y = Number.parseFloat(imgPositionY(card))
  if (Number.isNaN(y)) return imgPositionY(card)
  return `${Math.min(100, Math.max(0, y + delta))}%`
}

function imgPanTo(card: FeatureCardProps) {
  return card.imgPanTo ?? imgPanY(card, 20)
}

function imgPanBackTo(card: FeatureCardProps) {
  return card.imgPanBackTo ?? imgPanY(card, -4)
}

function screenSrcset(src: string | undefined) {
  if (!src?.startsWith('/assets/screens/') || !src.endsWith('.webp')) return undefined

  const base = src.slice(0, -'.webp'.length)
  return `${base}-360.webp 360w, ${base}-560.webp 560w, ${base}-640.webp 640w, ${src} 800w`
}

// Per-card hover state
const hovered = ref<Record<number, boolean>>({})
const tapPanCard = ref<number | null>(null)
const isTapPanMode = ref(false)
const cardStates = ref<Record<number, 'before' | 'visible' | 'after'>>({})
const cardEls: HTMLElement[] = []

const sectionRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

let cardObserver: IntersectionObserver | null = null
let sectionObserver: IntersectionObserver | null = null
let tapPanModeCleanup: (() => void) | null = null
let spotlightCleanup: (() => void) | null = null
let spotRaf = 0
let lastSpotEvent: PointerEvent | null = null
let sectionInView = false

function setCardRef(el: unknown, index: number) {
  if (typeof HTMLElement === 'undefined' || !(el instanceof HTMLElement)) return
  cardEls[index] = el
}

function cardStateClass(index: number) {
  return `is-${cardStates.value[index] ?? 'after'}`
}

function isCardActive(index: number) {
  return Boolean(hovered.value[index]) || tapPanCard.value === index
}

function toggleCardPan(index: number) {
  if (!isTapPanMode.value) return
  tapPanCard.value = tapPanCard.value === index ? null : index
}

function setCardState(index: number, state: 'before' | 'visible' | 'after') {
  if (cardStates.value[index] === state) return
  cardStates.value[index] = state
}

function processSpotlight() {
  spotRaf = 0
  const event = lastSpotEvent
  if (!event) return
  const target = event.target
  if (!(target instanceof Element)) return
  const card = target.closest('.lifters-card')
  if (!(card instanceof HTMLElement)) return
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

function attachSpotlight() {
  const grid = gridRef.value
  if (!grid || spotlightCleanup) return

  const onMove = (event: PointerEvent) => {
    lastSpotEvent = event
    if (!spotRaf) spotRaf = requestAnimationFrame(processSpotlight)
  }
  const onLeave = () => {
    lastSpotEvent = null
  }

  grid.addEventListener('pointermove', onMove, { passive: true })
  grid.addEventListener('pointerleave', onLeave, { passive: true })
  spotlightCleanup = () => {
    grid.removeEventListener('pointermove', onMove)
    grid.removeEventListener('pointerleave', onLeave)
    if (spotRaf) cancelAnimationFrame(spotRaf)
    spotRaf = 0
    lastSpotEvent = null
    spotlightCleanup = null
  }
}

function detachSpotlight() {
  spotlightCleanup?.()
}

function syncSpotlight() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (sectionInView && finePointer && !reduce) attachSpotlight()
  else detachSpotlight()
}

onMounted(async () => {
  if (sectionRef.value) {
    sectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionInView = entry?.isIntersecting ?? false
        syncSpotlight()
      },
      { threshold: 0 },
    )
    sectionObserver.observe(sectionRef.value)
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((_, index) => setCardState(index, 'visible'))
    return
  }

  await nextTick()

  const tapPanModeQuery = window.matchMedia('(hover: none), (pointer: coarse)')
  const syncTapPanMode = () => {
    isTapPanMode.value = tapPanModeQuery.matches
    if (!tapPanModeQuery.matches) tapPanCard.value = null
  }
  syncTapPanMode()
  if (tapPanModeQuery.addEventListener) {
    tapPanModeQuery.addEventListener('change', syncTapPanMode)
    tapPanModeCleanup = () => tapPanModeQuery.removeEventListener('change', syncTapPanMode)
  } else {
    tapPanModeQuery.addListener(syncTapPanMode)
    tapPanModeCleanup = () => tapPanModeQuery.removeListener(syncTapPanMode)
  }

  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = Number((entry.target as HTMLElement).dataset.cardIndex)
        if (Number.isNaN(index)) return

        if (entry.isIntersecting) {
          setCardState(index, 'visible')
          return
        }

        const viewportH = useStableViewportHeight() || window.innerHeight
        const isAboveViewportCenter = entry.boundingClientRect.top < viewportH * 0.5
        setCardState(index, isAboveViewportCenter ? 'before' : 'after')
      })
    },
    {
      threshold: 0.02,
      rootMargin: '-22% 0px -12% 0px',
    },
  )

  cardEls.forEach((el, index) => {
    el.dataset.cardIndex = String(index)
    setCardState(index, 'after')
    cardObserver?.observe(el)
  })
})

onBeforeUnmount(() => {
  cardObserver?.disconnect()
  sectionObserver?.disconnect()
  tapPanModeCleanup?.()
  detachSpotlight()
})
</script>

<template>
  <section
    id="lifters"
    ref="sectionRef"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Background glow -->
    <div class="section-glow is-green" style="--glow-blur: 60px;" />

    <div class="container" style="position: relative;">
      <SectionHeader :cols="'1.6fr 1fr'" :copy-max="380">
        <template #title>
          Train smarter.<br /><span class="lime">Lift heavier.</span> Compound everything.
        </template>
        <template #eyebrow>▸ FOR LIFTERS</template>
        Progressive overload, made obvious. Goals, PRs, history, and clean charts that show, at a
        glance, whether you're getting stronger or stalling.
      </SectionHeader>

      <!-- Bento grid -->
      <div
        ref="gridRef"
        class="bento-grid"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '18px',
        }"
      >
        <div
          v-for="(card, i) in cards"
          :key="i"
          :ref="(el) => setCardRef(el, i)"
          :class="['lifters-card', cardStateClass(i), { 'is-pan-active': tapPanCard === i }]"
          @mouseenter="hovered[i] = true"
          @mouseleave="hovered[i] = false"
          @click="toggleCardPan(i)"
          :style="{
            '--card-delay': `${i * 70}ms`,
            gridColumn: card.span,
            gridRow: card.tall ? 'span 2' : 'auto',
            background: '#0a0a0a',
            border: isCardActive(i)
              ? '1px solid rgba(204,255,0,0.3)'
              : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '28px',
            overflow: 'hidden',
            position: 'relative',
            isolation: 'isolate',
            backfaceVisibility: 'hidden',
            minHeight: card.tall ? '600px' : '320px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: isCardActive(i)
              ? '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(204,255,0,0.1)'
              : 'none',
          }"
        >
          <div class="lifters-card-wash" aria-hidden="true" />
          <!-- Image area -->
          <div
            v-if="card.img"
            :style="{
              position: 'relative',
              height: card.visualHeight ?? (card.compact ? '200px' : card.tall ? '60%' : '200px'),
              overflow: 'hidden',
              background: '#000',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }"
          >
            <img
              :src="card.img"
              :srcset="screenSrcset(card.img)"
              sizes="(max-width: 768px) 100vw, 50vw"
              :alt="card.title"
              width="800"
              height="1739"
              loading="lazy"
              decoding="async"
                class="lifters-card-image"
                :style="{
                  '--img-x': imgPositionX(card),
                  '--img-y': imgPositionY(card),
                  '--img-pan-a': imgPanTo(card),
                  '--img-pan-b': imgPanBackTo(card),
                  '--img-pan-duration': `${5.2 + (i % 3) * 0.5}s`,
                  position: 'absolute',
                  inset: 0,
                  transform: `scale(${card.imgScale ?? 1})`,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transformOrigin: card.imgPosition ?? '50% 50%',
                  willChange: 'object-position, transform',
                  backfaceVisibility: 'hidden',
                  borderRadius: '0',
                }"
            />
            <div
              :style="{
                position: 'absolute',
                inset: '0 0 -2px 0',
                background: 'linear-gradient(180deg, rgba(10,10,10,0) 45%, #0a0a0a 96%)',
                pointerEvents: 'none',
                transform: 'translateZ(0)',
              }"
            />
            <div
              v-if="card.maskBottomEdge"
              class="lifters-card-bottom-edge-mask"
              aria-hidden="true"
            />
          </div>

          <!-- Text content -->
          <div
            :style="{
              padding: card.compact ? '20px' : '32px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 2,
            }"
          >
            <div class="protocol" :style="{ color: '#CCFF00', marginBottom: '12px', fontSize: '10px' }">
              {{ card.tag }}
            </div>
            <h3
              :style="{
                margin: 0,
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: card.compact ? '20px' : card.tall ? '32px' : '26px',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
              }"
            >
              {{ card.title }}
            </h3>
            <p
              :style="{
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 300,
                fontSize: card.compact ? '13px' : '14.5px',
                lineHeight: 1.55,
                marginTop: '12px',
                marginBottom: 0,
              }"
            >
              {{ card.body }}
              <template v-if="card.lifts?.length">
                Log a
                <template v-for="(lift, i) in card.lifts" :key="lift.href">
                  <template v-if="i > 0">{{ i === (card.lifts?.length ?? 0) - 1 ? ', or ' : ', ' }}</template>
                  <NuxtLink
                    :to="lift.href"
                    class="lifters-inline-lift"
                    @click.stop
                  >{{ lift.label }}</NuxtLink>
                </template>
                from the same library.
              </template>
            </p>
            <NuxtLink
              v-if="card.href"
              :to="card.href"
              class="lifters-card-link"
              @click.stop
            >
              {{ card.linkLabel ?? 'Learn more' }} →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Numbers row -->
      <div
        class="metrics-strip-4"
        :style="{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          paddingTop: '60px',
          borderTop: '1px solid var(--liftag-border-strong)',
        }"
      >
        <div v-for="(pair, i) in numbers" :key="i" class="reveal">
          <div
            class="stat-num"
            style="--stat-num-size: clamp(32px, 3.6vw, 48px);"
          >
            {{ pair.n }}
          </div>
          <div class="stat-label">{{ pair.l }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lifters-card-link {
  display: inline-block;
  margin-top: 12px;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-decoration: none;
  text-transform: uppercase;
}

.lifters-card-link:hover {
  color: #fff;
}

.lifters-inline-lift {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 2px;
}

.lifters-inline-lift:hover {
  color: #fff;
}

.lifters-card {
  --spot-x: 50%;
  --spot-y: 50%;
  opacity: 0;
  transform: translate3d(0, 46px, 0) scale(0.965);
  filter: blur(8px);
  transition:
    opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 860ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 760ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 350ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 220ms ease;
  transition-delay: 0ms, 0ms, 0ms, 0ms, 0ms;
}

.lifters-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 4;
  border-radius: inherit;
  padding: 1px;
  pointer-events: none;
  background: radial-gradient(
    240px circle at var(--spot-x, 50%) var(--spot-y, 50%),
    rgba(204, 255, 0, 0.5),
    rgba(204, 255, 0, 0.06) 45%,
    transparent 70%
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lifters-card-wash {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    240px circle at var(--spot-x, 50%) var(--spot-y, 50%),
    rgba(204, 255, 0, 0.05),
    transparent 55%
  );
  opacity: 0;
  transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (hover: hover) and (pointer: fine) {
  .lifters-card:hover::before,
  .lifters-card:hover .lifters-card-wash {
    opacity: 1;
  }
}

.lifters-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.42)),
    rgba(0, 0, 0, 0.22);
  opacity: 1;
  transition: opacity 460ms cubic-bezier(0.16, 1, 0.3, 1);
}

.lifters-card:hover::after {
  opacity: 0.18;
}

.lifters-card.is-pan-active::after {
  opacity: 0.18;
}

.lifters-card.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
  transition-delay: var(--card-delay, 0ms), var(--card-delay, 0ms), var(--card-delay, 0ms), 0ms, 0ms;
}

.lifters-card.is-visible:active {
  transform: translate3d(0, 0, 0) scale(0.995);
}

.lifters-card.is-before {
  opacity: 0;
  transform: translate3d(0, -38px, 0) scale(0.985);
  filter: blur(5px);
}

.lifters-card.is-after {
  opacity: 0;
  transform: translate3d(0, 46px, 0) scale(0.965);
  filter: blur(8px);
}

.lifters-card-image {
  object-position: var(--img-x, 50%) var(--img-y, 50%);
  animation: liftersScreenshotPan var(--img-pan-duration, 5.8s) cubic-bezier(0.45, 0, 0.2, 1) infinite;
  animation-play-state: paused;
}

.lifters-card-bottom-edge-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  z-index: 2;
  height: 5px;
  pointer-events: none;
  background: #0a0a0a;
  transform: translateZ(0);
}

.lifters-card:hover .lifters-card-image {
  animation-play-state: running;
}

.lifters-card.is-pan-active .lifters-card-image {
  animation-play-state: running;
}

@keyframes liftersScreenshotPan {
  0%, 100% {
    object-position: var(--img-x, 50%) var(--img-y, 50%);
  }
  44% {
    object-position: var(--img-x, 50%) var(--img-pan-a, 56%);
  }
  78% {
    object-position: var(--img-x, 50%) var(--img-pan-b, 44%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lifters-card,
  .lifters-card.is-visible,
  .lifters-card.is-before,
  .lifters-card.is-after {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }

  .lifters-card::before,
  .lifters-card-wash {
    display: none;
  }

  .lifters-card:hover .lifters-card-image,
  .lifters-card.is-pan-active .lifters-card-image {
    animation: none;
  }
}

@media (hover: none), (pointer: coarse) {
  .lifters-card:hover::after {
    opacity: 1;
  }

  .lifters-card.is-pan-active::after {
    opacity: 0.18;
  }

  .lifters-card:hover .lifters-card-image {
    animation-play-state: paused;
  }

  .lifters-card.is-pan-active .lifters-card-image {
    animation-play-state: running;
  }
}
</style>
