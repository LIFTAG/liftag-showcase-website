<script setup lang="ts">
import { gymFaqs } from "~/utils/gymscan/content";
import { GYM_DEMO_PATH } from "~/utils/gymscan/navigation";

definePageMeta({ layout: false });

const description =
  "Connect your gym machines with free LIFTAG QR and NFC tags. Members scan, watch your trainer videos and log sets. Put your gym on the map and plan workouts on its equipment.";

useLiftagSeo({
  title: "LIFTAG | Connect your gym machines",
  description,
  path: GYM_DEMO_PATH,
  noindex: true,
});

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebSite,
  liftagWebPage({
    path: GYM_DEMO_PATH,
    name: "Connect your gym machines",
    description,
    aboutId: APP_ID,
  }),
  liftagFAQPage(gymFaqs),
]);
</script>

<template>
  <GymExperience />
</template>
