<script setup lang="ts">
const lead = 'Got a question, hit a bug, or need help with your account? Drop us a message and we’ll get back to you.'
</script>

<template>
  <ContactPage
    eyebrow="▸ SUPPORT"
    title="We’re here<br/>to <span class='lime'>help.</span>"
    :lead="lead"
    locked-subject="Support request"
    success-headline="Message sent."
    seo-title="Support | LIFTAG"
    seo-description="Need help with LIFTAG? Send us a message about your account, a bug, or any other question."
    seo-path="/contact/support"
  />
</template>
