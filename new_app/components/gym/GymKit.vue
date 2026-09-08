<script setup lang="ts">
import { gymFaqs } from "~/utils/gymscan/content";
withDefaults(defineProps<{ source?: "experience" | "partner" }>(), {
  source: "experience",
});
</script>
<template>
  <section id="kit" class="gx-kit" aria-labelledby="gx-kit-title" tabindex="-1">
    <div class="gx-kit__intro">
      <p class="gx-protocol"><GymHeroEntry row><span class="gx-dot" /> START WITH YOUR GYM</GymHeroEntry></p>
      <h2 id="gx-kit-title">
        <GymHeroEntry row>Put your gym </GymHeroEntry><br /><GymHeroEntry :delay="90"><em>in their workout.</em></GymHeroEntry>
      </h2>
      <p><GymHeroEntry :delay="180">Free QR + NFC tags. Your equipment, connected.</GymHeroEntry></p>
      <div class="gx-kit__tag">
        <img
          src="/assets/gym3d/qr-sticker.webp"
          width="827"
          height="874"
          alt="The LIFTAG QR and NFC equipment tag"
          loading="lazy"
        /><span class="gx-protocol"><GymHeroEntry :delay="240">QR + NFC<br />READY FOR YOUR FLOOR</GymHeroEntry></span>
      </div>
      <details class="gx-included">
        <summary>What’s free? <span aria-hidden="true">+</span></summary>
        <p>
          Your QR + NFC tags, gym listing, equipment setup, and core dashboard.
          Advanced business tools are optional.
        </p>
        <NuxtLink to="/pricing">See what’s included ↗</NuxtLink>
      </details>
    </div>
    <div class="gx-kit__form">
      <h3><GymHeroEntry :delay="80">Request your free kit.</GymHeroEntry></h3>
      <GymKitForm :source="source" theme="dark" />
    </div>
    <div class="gx-faqs">
      <details v-for="faq in gymFaqs.slice(1)" :key="faq.question">
        <summary>{{ faq.question }}<span aria-hidden="true">+</span></summary>
        <p>{{ faq.answer }}</p>
      </details>
    </div>
  </section>
</template>
