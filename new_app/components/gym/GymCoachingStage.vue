<script setup lang="ts">
import type { CoachingFrame } from '~/utils/gymscan/coachingTimeline';
defineProps<{ frame: CoachingFrame }>();
</script>
<template>
  <div class="gc-stage">
    <div class="gc-fallback-phone" aria-label="LIFTAG logger with exercise instructions above the set table">
      <span class="gc-fallback-island" />
      <div class="gc-fallback-bar">‹ <span>WORKOUT LOGGER</span> •••</div>
      <h3>EZ-Bar Skullcrusher</h3><p>Flat bench · EZ bar</p>
      <img src="/assets/gym3d/bench-instruction.webp" width="1080" height="603" alt="Exercise instruction still above the set table" />
      <strong>{{ frame.isOwner ? 'Your trainer’s video goes here' : 'LIFTAG instructions' }}</strong>
      <div class="gc-fallback-sets"><span>SET</span><span>KG</span><span>REPS</span><b>1 ✓</b><b>20</b><b>12</b><b>2</b><b>20</b><b>12</b><b>3</b><b>20</b><b>12</b></div>
      <span class="gc-fallback-log">Log set</span>
    </div>
  </div>
</template>
