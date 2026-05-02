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
  tag: string
  title: string
  body: string
  compact?: boolean
}

const cards: FeatureCardProps[] = [
  {
    span: 'span 7',
    tall: true,
    img: '/assets/screens/progression.png',
    imgPosition: '50% 74%',
    imgScale: 1.12,
    imgPanTo: '84%',
    imgPanBackTo: '68%',
    visualHeight: '64%',
    tag: 'PROGRESS INSIGHTS',
    title: 'Progress, not vibes.',
    body: 'Per-session weight, 1RM, and total volume, auto-aggregated across every workout. Watch the line climb.',
  },
  {
    span: 'span 5',
    tall: true,
    img: '/assets/screens/log-set.png',
    imgPosition: '50% 48%',
    imgPanTo: '82%',
    visualHeight: '64%',
    tag: 'LOG SET',
    title: 'Two taps. Set logged.',
    body: 'Weight × reps. RPE optional. The timer auto-runs between sets so you don\'t have to think.',
  },
  {
    span: 'span 5',
    img: '/assets/screens/active-session.png',
    imgPosition: '50% 53%',
    imgPanTo: '83%',
    visualHeight: '220px',
    tag: 'ROUTINES + SUPERSETS',
    title: 'Plans that flex with you.',
    body: 'Build routines, share them, run supersets. Every session adapts to your real performance.',
  },
  {
    span: 'span 4',
    img: '/assets/screens/history.png',
    imgPosition: '50% 29%',
    imgPanTo: '83%',
    visualHeight: '220px',
    tag: 'HISTORY',
    title: 'Every session, dated.',
    body: 'Calendar + by-body-part. Find any session in two taps.',
  },
  {
    span: 'span 3',
    img: '/assets/screens/exercises.png',
    imgPosition: '50% 17%',
    imgPanTo: '100%',
    visualHeight: '230px',
    tag: 'LIBRARY',
    title: '250+ exercises. Form videos.',
    body: 'Vetted by coaches, not influencers.',
    compact: true,
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

// Per-card hover state
const hovered = ref<Record<number, boolean>>({})
const tapPanCard = ref<number | null>(null)
const isTapPanMode = ref(false)
const cardStates = ref<Record<number, 'before' | 'visible' | 'after'>>({})
const cardEls: HTMLElement[] = []

let cardObserver: IntersectionObserver | null = null
let tapPanModeCleanup: (() => void) | null = null

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

onMounted(async () => {
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

        const isAboveViewportCenter = entry.boundingClientRect.top < window.innerHeight * 0.5
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
  tapPanModeCleanup?.()
})
</script>

<template>
  <section
    id="lifters"
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
              alt=""
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
            </p>
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
.lifters-card {
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
