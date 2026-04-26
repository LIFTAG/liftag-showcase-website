<script setup lang="ts">
const benefits = [
  {
    tag: 'QR KIT',
    title: 'Every machine, explained.',
    body: 'Stickers ship free. Members scan, watch, lift.',
  },
  {
    tag: 'YOUR CONTENT',
    title: 'Your trainers in every video.',
    body: 'Record once. Deploy across the whole floor.',
  },
  {
    tag: 'DISCOVERY',
    title: 'Get found by nearby lifters.',
    body: 'Featured on the Liftag map with a verified badge.',
  },
  {
    tag: 'FREE',
    title: '100% free for partner gyms.',
    body: 'No subscription. No setup fee. Just results.',
  },
]

const gymNumbers = [
  { n: '0€', l: 'Setup fee', sub: 'no subscription, ever' },
  { n: 'FREE', l: 'QR sticker kit', sub: 'we ship it to you' },
  { n: 'MAP', l: 'Featured placement', sub: 'verified gym badge' },
]

const muscleTags = ['BACK', 'LATS', 'BICEPS']
</script>

<template>
  <section
    id="gyms"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Background glow -->
    <div
      :style="{
        position: 'absolute',
        top: '40%',
        right: '-20%',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(204,255,0,0.08), transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Top: headline + copy -->
      <div
        class="section-header-2col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '60px',
          alignItems: 'end',
          marginBottom: '80px',
        }"
      >
        <div>
          <Eyebrow>▸ FOR GYMS</Eyebrow>
          <SectionTitle>
            Put your gym<br />on the <span class="lime">map.</span>
          </SectionTitle>
        </div>
        <p
          class="reveal"
          :style="{
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: '480px',
            margin: 0,
          }"
        >
          Sticker your floor. Members scan a QR, instantly open the right exercise, and watch a setup
          video your trainers recorded. Get discovered by thousands of nearby lifters looking for
          their next gym.
        </p>
      </div>

      <!-- Middle: 3-col layout -->
      <div
        class="gyms-3col"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: '40px',
          alignItems: 'center',
        }"
      >
        <!-- LEFT — QR sticker + machine card -->
        <div
          class="reveal gyms-qr"
          :style="{ position: 'relative', height: '560px' }"
        >
          <!-- QR Sticker -->
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: '10px',
              width: '180px',
              height: '210px',
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(204,255,0,0.15)',
              transform: 'rotate(4deg)',
              animation: 'float-y 6s ease-in-out infinite',
              zIndex: 3,
            }"
          >
            <!-- QR sticker header -->
            <div
              :style="{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }"
            >
              <div :style="{ display: 'flex', alignItems: 'center', gap: '5px' }">
                <img src="/assets/logo.svg" width="18" height="18" alt="" />
                <span
                  :style="{
                    fontFamily: '\'Space Grotesk\', sans-serif',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#0E0E0E',
                    letterSpacing: '-0.04em',
                    textTransform: 'uppercase',
                  }"
                >LIFTAG</span>
              </div>
              <div
                :style="{
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontSize: '8px',
                  fontWeight: 700,
                  color: '#666',
                  letterSpacing: '0.2em',
                }"
              >#042</div>
            </div>

            <!-- QR image -->
            <div :style="{ width: '100%', aspectRatio: '1', marginBottom: '12px' }">
              <img
                src="/uploads/telegram-cloud-photo-size-4-5904481809322413580-y.jpg"
                alt="LIFTAG QR Code"
                :style="{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }"
              />
            </div>

            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: '16px',
                color: '#0E0E0E',
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }"
            >LAT PULLDOWN</div>
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#999',
                marginTop: '4px',
              }"
            >SCAN TO START</div>
          </div>

          <!-- Machine card -->
          <div
            :style="{
              position: 'absolute',
              bottom: '20px',
              right: 0,
              width: '220px',
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              transform: 'rotate(-3deg)',
              zIndex: 2,
            }"
          >
            <div :style="{ height: '110px', position: 'relative', overflow: 'hidden' }">
              <img
                src="/assets/img/lat-pulldown.jpeg"
                alt="Lat Pulldown machine"
                :style="{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(0.2) contrast(1.05)',
                }"
              />
              <div
                :style="{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))',
                }"
              />
              <div
                :style="{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(204,255,0,0.9)',
                  color: '#0E0E0E',
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontWeight: 700,
                  fontSize: '8px',
                  letterSpacing: '0.15em',
                }"
              >● LIVE · 3 USING</div>
            </div>
            <div :style="{ padding: '14px' }">
              <div class="protocol" :style="{ color: '#CCFF00', fontSize: '8px' }">MACHINE · #042</div>
              <div
                :style="{
                  fontFamily: '\'Space Grotesk\', sans-serif',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  marginTop: '4px',
                }"
              >Cable Lat Pulldown</div>
              <div :style="{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }">
                <span
                  v-for="tag in muscleTags"
                  :key="tag"
                  :style="{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.06)',
                    fontFamily: '\'JetBrains Mono\', monospace',
                    fontSize: '7px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.6)',
                  }"
                >{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER — 2 phones -->
        <div
          class="gyms-phones-center"
          :style="{
            position: 'relative',
            height: '620px',
            display: 'flex',
            justifyContent: 'center',
          }"
        >
          <!-- Back phone — gym detail, rotates 4deg -->
          <div
            :style="{
              position: 'absolute',
              top: '30px',
              right: '-10px',
              transform: 'rotate(4deg)',
              opacity: 0.8,
              animation: 'float-y 7s ease-in-out infinite',
              animationDelay: '1s',
            }"
          >
            <Phone src="/assets/screens/gym-detail.png" :scale="0.82" />
          </div>

          <!-- Front phone — explore map, rotates -3deg -->
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: '-10px',
              transform: 'rotate(-3deg)',
              animation: 'float-y 6s ease-in-out infinite',
              zIndex: 2,
            }"
          >
            <Phone src="/assets/screens/explore-map.png" :scale="0.88" />
          </div>

          <!-- Live badge chip -->
          <div
            :style="{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,10,10,0.92)',
              border: '1px solid rgba(204,255,0,0.3)',
              borderRadius: '14px',
              padding: '10px 18px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(204,255,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 5,
              whiteSpace: 'nowrap',
            }"
          >
            <span
              :style="{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#CCFF00',
                boxShadow: '0 0 8px #CCFF00',
                flexShrink: 0,
              }"
            />
            <span class="protocol" :style="{ color: '#CCFF00', fontSize: '9px' }">
              FREE QR KIT · APPLY NOW
            </span>
          </div>
        </div>

        <!-- RIGHT — benefit list -->
        <div class="reveal" :style="{ display: 'flex', flexDirection: 'column', gap: 0 }">
          <div
            v-for="(b, i) in benefits"
            :key="i"
            :style="{
              padding: '20px 0',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }"
          >
            <div class="protocol" :style="{ color: '#CCFF00', fontSize: '9px', marginBottom: '6px' }">
              {{ b.tag }}
            </div>
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: '18px',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#fff',
                lineHeight: 1.1,
              }"
            >
              {{ b.title }}
            </div>
            <div
              :style="{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginTop: '6px',
                fontWeight: 300,
              }"
            >
              {{ b.body }}
            </div>
          </div>

          <div
            :style="{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '24px',
              marginTop: '8px',
            }"
          >
            <div :style="{ display: 'flex', gap: '12px', flexWrap: 'wrap' }">
              <button class="btn-primary" style="padding: 14px 24px; font-size: 12px;">
                Partner with us
              </button>
              <button class="btn-ghost" style="padding: 14px 24px; font-size: 12px;">
                Get the QR kit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Numbers row -->
      <div
        class="gyms-numbers reveal"
        :style="{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }"
      >
        <div
          v-for="(s, i) in gymNumbers"
          :key="i"
          :style="{
            padding: '28px 32px',
            background: '#0a0a0a',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }"
        >
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800,
              fontSize: 'clamp(28px, 3vw, 44px)',
              color: '#CCFF00',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }"
          >
            {{ s.n }}
          </div>
          <div class="protocol" :style="{ color: '#fff', fontSize: '10px', marginTop: '10px' }">
            {{ s.l }}
          </div>
          <div :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }">
            {{ s.sub }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
