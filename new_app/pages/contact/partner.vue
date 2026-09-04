<script setup lang="ts">
const lead = 'Tell us about your gym, city, and training floor. We’ll get back to you about putting your gym on the LIFTAG map.'
</script>

<template>
  <ContactPage
    eyebrow="▸ PARTNER WITH US"
    title="Put your gym<br/>on the <span class='lime'>map.</span>"
    :lead="lead"
    locked-subject="Gym partnership inquiry"
    collect-gym-context
    success-headline="Message sent."
    success-path="/gym-scan"
    success-link-label="Back to Gym Scan"
    seo-title="Partner with LIFTAG | Get your gym on the map"
    seo-description="Tell us about your gym, city, and training floor, and explore a partnership with LIFTAG."
    seo-path="/contact/partner"
    breadcrumb-name="Partner"
  />
</template>
