<script setup lang="ts">
interface Feature {
  tag: string
  title: string
  body: string
  screen: string
  chip1: { label: string; value: string; sub: string; color: string }
  chip2: { label: string; value: string; sub: string; color: string }
}

const features: Feature[] = [
  {
    tag: 'YOUR PROFILE',
    title: 'Manage your profile.',
    body: 'Specialisms, experience, location, linked gyms. Full control over how you appear to lifters looking for a coach.',
    screen: '/assets/screens/coach-profile.png',
    chip1: { label: 'VISIBILITY', value: 'PUBLIC', sub: 'live on the directory', color: '#FF2D55' },
    chip2: { label: 'PROFILE FIELDS', value: 'Bio · Gyms · Location', sub: 'fully editable', color: '#fff' },
  },
  {
    tag: 'BE DISCOVERED',
    title: 'Clients find you.',
    body: 'Appear in the Liftag trainer directory. Lifters browse coaches by specialty, experience, and location, and contact you directly.',
    screen: '/assets/screens/trainer-discover.png',
    chip1: { label: 'DISCOVERY', value: 'OPEN', sub: 'no paywall, no fee', color: '#FF2D55' },
    chip2: { label: 'FILTERS', value: 'Specialty · City · Gym', sub: 'how lifters narrow down', color: '#fff' },
  },
  {
    tag: 'CLIENT PROGRESS',
    title: 'See every rep they log.',
    body: 'Review workout history, volume trends, and goal progress for each client. Know when to push and what to adjust, based on real data.',
    screen: '/assets/screens/trainer-profile.png',
    chip1: { label: 'CLIENT VIEW', value: 'FULL', sub: 'every set, every PR', color: '#22C55E' },
    chip2: { label: 'TRACKED', value: 'Volume · 1RM · PRs', sub: 'per exercise, per period', color: '#fff' },
  },
  {
    tag: 'SHARE PLANS',
    title: 'Share plans instantly.',
    body: 'Build a custom routine, share via email. Clients activate it and follow your live updates. No third-party tools needed.',
    screen: '/assets/screens/workout.png',
    chip1: { label: 'DELIVERY', value: 'EMAIL', sub: 'no third-party tools', color: '#FF2D55' },
    chip2: { label: 'PLAN TYPES', value: 'PPL · 5-day · Custom', sub: 'fully flexible', color: '#fff' },
  },
]

const active = ref(0)
const coachPulse = ref(0)
const sectionRef = ref<HTMLElement | null>(null)
const sectionInView = ref(false)
const f = computed(() => features[active.value])

const bullets = [
  'Verified trainer badge + priority placement',
  'Share plans with any client via email',
  'Review client history & volume trends',
  'Add custom exercises with your own videos',
  'Online & in-person coaching, one dashboard',
]

function chipBorderColor(color: string) {
  if (color === '#FF2D55') return 'rgba(255,45,85,0.2)'
  if (color === '#22C55E') return 'rgba(34,197,94,0.2)'
  return 'rgba(255,255,255,0.2)'
}

function tabOpacity(i: number, isHover: boolean) {
  if (active.value === i) return 1
  return isHover ? 0.75 : 0.45
}

// Per-tab hover state for right side
const tabHovered = ref<Record<number, boolean>>({})

let autoCycle: ReturnType<typeof setInterval> | null = null

function setActive(index: number) {
  active.value = index
  coachPulse.value += 1
}

onMounted(() => {
  if (!sectionRef.value) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      sectionInView.value = entry?.isIntersecting ?? false
    },
    { threshold: 0.34 },
  )
  observer.observe(sectionRef.value)

  onBeforeUnmount(() => observer.disconnect())
})

watch(sectionInView, (visible) => {
  if (visible) {
    if (autoCycle) return

    autoCycle = setInterval(() => {
      setActive((active.value + 1) % features.length)
    }, 4200)
  } else if (autoCycle) {
    clearInterval(autoCycle)
    autoCycle = null
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (autoCycle) clearInterval(autoCycle)
})
</script>

<template>
  <section
    id="trainers"
    ref="sectionRef"
    class="trainers-section"
    :class="{ 'is-live': sectionInView }"
    :style="{
      background: 'linear-gradient(180deg, #000 0%, #050505 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Top gradient line -->
    <div
      :style="{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #FF2D55 50%, transparent)',
        opacity: 0.5,
      }"
    />
    <!-- Left ambient glow -->
    <div
      :style="{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,45,85,0.08), transparent 60%)',
        filter: 'blur(80px)',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Header -->
      <div
        class="section-header-2col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'end',
          marginBottom: '80px',
        }"
      >
        <div>
          <Eyebrow color="#FF2D55">▸ FOR TRAINERS &amp; COACHES</Eyebrow>
          <SectionTitle>
            Your clients,<br /><span style="color: #FF2D55;">quantified.</span>
          </SectionTitle>
        </div>
        <p
          class="reveal"
          :style="{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: '440px',
            margin: 0,
          }"
        >
          LIFTAG is a full coaching platform, not just a directory. Build your profile, get
          discovered, share plans, and track every client's progress in one place.
        </p>
      </div>

      <!-- Mobile horizontal tab strip — only visible on mobile -->
      <div
        class="trainers-mobile-tabs"
        :style="{
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
          scrollbarWidth: 'none',
        }"
      >
        <button
          v-for="(feat, i) in features"
          :key="i"
          @click="setActive(i)"
          @pointerdown="setActive(i)"
          class="trainer-mobile-tab"
          :class="{ 'is-active': active === i }"
          :style="{
            flex: '0 0 auto',
            padding: '10px 16px',
            borderRadius: '9999px',
            background: active === i ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.04)',
            border: active === i ? '1px solid #FF2D55' : '1px solid rgba(255,255,255,0.1)',
            color: active === i ? '#FF2D55' : 'rgba(255,255,255,0.65)',
            fontFamily: '\'JetBrains Mono\', monospace',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 250ms ease',
          }"
        >
          {{ feat.tag }}
        </button>
      </div>

      <!-- 3-col: copy | phone+chips | vertical tabs -->
      <div
        class="trainers-3col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }"
      >
        <!-- LEFT — copy + bullets + CTA -->
        <div class="reveal">
          <div :style="{ marginBottom: '8px' }">
            <div class="protocol" :style="{ color: '#FF2D55', marginBottom: '12px', fontSize: '10px' }">
              {{ f.tag }}
            </div>
            <h3
              :style="{
                margin: 0,
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: '#fff',
                transition: 'all 300ms ease',
              }"
            >
              {{ f.title }}
            </h3>
            <p
              :style="{
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 300,
                fontSize: '15px',
                lineHeight: 1.6,
                marginTop: '16px',
                marginBottom: 0,
              }"
            >
              {{ f.body }}
            </p>
          </div>

          <!-- Bullet list -->
          <div :style="{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: 0 }">
            <div
              v-for="(item, i) in bullets"
              :key="i"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }"
            >
              <span
                :style="{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: '#FF2D55',
                  boxShadow: '0 0 8px rgba(255,45,85,0.6)',
                }"
              />
              <span :style="{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }">{{ item }}</span>
            </div>
            <div :style="{ borderTop: '1px solid rgba(255,255,255,0.06)' }" />
          </div>

          <div :style="{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }">
            <button class="btn-primary" style="padding: 14px 24px; font-size: 12px;">
              Join as a coach
            </button>
            <button class="btn-ghost" style="padding: 14px 24px; font-size: 12px;">
              Learn more
            </button>
          </div>
        </div>

        <!-- CENTER — phone + dynamic chips below -->
        <div
          class="reveal"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }"
        >
          <div :style="{ position: 'relative' }">
            <!-- Red glow -->
            <div
              :style="{
                position: 'absolute',
                inset: '-40px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,45,85,0.12), transparent 65%)',
                filter: 'blur(30px)',
              }"
            />
            <div :key="coachPulse" class="trainer-phone-pulse" aria-hidden="true" />
            <div
              :style="{
                animation: 'float-y 6s ease-in-out infinite',
                position: 'relative',
                zIndex: 2,
              }"
            >
              <Phone :src="f.screen" :scale="1.0" />
            </div>
          </div>

          <!-- Chips row -->
          <div
            :style="{
              display: 'flex',
              gap: '12px',
              width: '100%',
              justifyContent: 'center',
            }"
          >
            <!-- Chip 1 -->
            <div
              class="trainer-stat-chip"
              :style="{
                background: 'rgba(10,10,10,0.95)',
                border: `1px solid ${chipBorderColor(f.chip1.color)}`,
                borderRadius: '14px',
                padding: '12px 16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                flex: 1,
                transition: 'all 400ms ease',
              }"
            >
              <div class="protocol" :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }">
                {{ f.chip1.label }}
              </div>
              <div
                :style="{
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontWeight: 800,
                  fontSize: '20px',
                  letterSpacing: '-0.02em',
                  marginTop: '4px',
                  color: f.chip1.color,
                }"
              >
                {{ f.chip1.value }}
              </div>
              <div :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }">
                {{ f.chip1.sub }}
              </div>
            </div>

            <!-- Chip 2 -->
            <div
              class="trainer-stat-chip trainer-stat-chip-muted"
              :style="{
                background: 'rgba(10,10,10,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '12px 16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                flex: 1,
                transition: 'all 400ms ease',
              }"
            >
              <div class="protocol" :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }">
                {{ f.chip2.label }}
              </div>
              <div
                :style="{
                  fontFamily: f.chip2.value.length > 6 ? '\'Inter\', sans-serif' : '\'JetBrains Mono\', monospace',
                  fontWeight: 800,
                  fontSize: f.chip2.value.length > 6 ? '12px' : '20px',
                  letterSpacing: '-0.01em',
                  marginTop: '4px',
                  color: '#fff',
                  lineHeight: 1.2,
                }"
              >
                {{ f.chip2.value }}
              </div>
              <div :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }">
                {{ f.chip2.sub }}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT — vertical tab list -->
        <div
          class="trainers-tabs-right"
          :style="{ display: 'flex', flexDirection: 'column', gap: 0 }"
        >
          <div
            v-for="(feat, i) in features"
            :key="i"
            @click="setActive(i)"
            @pointerdown="setActive(i)"
            @mouseenter="tabHovered[i] = true"
            @mouseleave="tabHovered[i] = false"
            class="trainer-tab-row"
            :class="{ 'is-active': active === i }"
            :style="{
              '--tab-delay': `${i * 120}ms`,
              padding: '22px 0 22px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `2px solid ${active === i ? '#FF2D55' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 300ms ease',
              opacity: active === i ? 1 : tabHovered[i] ? 0.75 : 0.45,
            }"
          >
            <div
              class="protocol"
              :style="{
                color: active === i ? '#FF2D55' : 'rgba(255,255,255,0.5)',
                fontSize: '9px',
                marginBottom: '6px',
                transition: 'color 300ms ease',
              }"
            >
              {{ feat.tag }}
            </div>
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: '20px',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
                lineHeight: 1.1,
              }"
            >
              {{ feat.title }}
            </div>
          </div>
          <div :style="{ borderTop: '1px solid rgba(255,255,255,0.06)' }" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trainers-section::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(420px circle at 50% 52%, rgba(255, 45, 85, 0.07), transparent 68%);
  opacity: 0;
  transition: opacity 900ms ease;
}

.trainers-section.is-live::after {
  opacity: 1;
  animation: trainerAmbientBreath 6.8s ease-in-out infinite;
}

.trainer-mobile-tab,
.trainer-tab-row,
.trainer-stat-chip {
  position: relative;
  overflow: hidden;
}

.trainer-mobile-tab::after,
.trainer-tab-row::after,
.trainer-stat-chip::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 18%, rgba(255, 45, 85, 0.18), transparent 46%);
  transform: translateX(-130%);
  opacity: 0;
}

.trainers-section.is-live .trainer-tab-row::after,
.trainers-section.is-live .trainer-stat-chip::after {
  animation: trainerGlint 5.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  animation-delay: var(--tab-delay, 0ms);
}

.trainer-tab-row.is-active::after,
.trainer-mobile-tab.is-active::after {
  opacity: 0.9;
}

.trainer-stat-chip-muted::after {
  background: linear-gradient(110deg, transparent 18%, rgba(255, 255, 255, 0.11), transparent 46%);
}

.trainer-phone-pulse {
  position: absolute;
  inset: -34px;
  z-index: 1;
  pointer-events: none;
  border-radius: 999px;
  border: 1px solid rgba(255, 45, 85, 0.22);
  box-shadow:
    0 0 34px rgba(255, 45, 85, 0.12),
    inset 0 0 38px rgba(255, 45, 85, 0.08);
  animation: trainerPhonePulse 960ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes trainerAmbientBreath {
  0%, 100% { transform: scale(0.98); }
  50% { transform: scale(1.04); }
}

@keyframes trainerGlint {
  0%, 64% {
    opacity: 0;
    transform: translateX(-130%);
  }
  78% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
    transform: translateX(130%);
  }
}

@keyframes trainerPhonePulse {
  from {
    opacity: 0.75;
    transform: scale(0.88);
  }
  to {
    opacity: 0;
    transform: scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .trainers-section.is-live::after,
  .trainers-section.is-live .trainer-tab-row::after,
  .trainers-section.is-live .trainer-stat-chip::after,
  .trainer-phone-pulse {
    animation: none;
  }
}
</style>
