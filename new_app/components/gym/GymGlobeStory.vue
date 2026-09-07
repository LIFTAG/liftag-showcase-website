<script setup lang="ts">
import { discoveryGyms, findDiscoveryGym } from "~/utils/gymscan/discoveryGyms";
import { projectRegional, regionalBoundaries, regionalLabelPoint, regionalPath } from "~/utils/gymscan/discoveryRegionalMap";

const props = defineProps<{ reduced: boolean; active: boolean }>();
const root = useTemplateRef<HTMLElement>("root");
const unavailable = shallowRef(false);
const expandedPrague = shallowRef(false);
const selectedId = shallowRef("bratislava");
const selectedGym = computed(() => findDiscoveryGym(selectedId.value));
const simple = computed(() => props.reduced || unavailable.value);
const { progress, phase, replay, go } = useDiscoveryScroll(root, () => simple.value);
const mapVisible = computed(() => simple.value || (progress.value > 0.08 && progress.value < 0.48));
const titles = ["A gym network.\nMade visible.", "One gym.\nOne clear identity.", "Every machine.\nExactly where it belongs.", "Your floor.\nOn their phone."];
const captions = ["Explore an illustrative network of gyms, equipment and local expertise.", "Give members one place to understand your space, equipment and guidance.", "Turn the equipment already on your floor into a useful digital inventory.", "The same machines, ready to discover and train inside LIFTAG."];
const locationButtons = computed(() => discoveryGyms.filter((gym) => expandedPrague.value || gym.cluster !== "prague").concat(expandedPrague.value ? [] : [discoveryGyms.find((gym) => gym.id === "praha-karlin")!]).filter(Boolean));
function selectLocation(id: string) {
  const gym = findDiscoveryGym(id);
  if (gym.cluster === "prague" && !expandedPrague.value) { expandedPrague.value = true; return; }
  selectedId.value = id;
  if (!simple.value && phase.value === 0) go(1);
}
</script>
<template>
  <section id="discover" ref="root" class="gd-story" :class="{ 'is-simple': simple }" aria-labelledby="gd-title">
    <div class="gd-sticky" :data-phase="phase">
      <GymDiscoveryStage :progress="progress" :reduced="simple" :active="active" :replay="replay" :gym="selectedGym" @open="go(1)" @unavailable="unavailable = true" />
      <div class="gd-map" :class="{ 'is-shown': mapVisible }" :inert="!mapVisible" aria-label="Illustrative gym locations in Central Europe">
        <svg viewBox="0 0 1000 620" role="img" aria-labelledby="gd-map-title">
          <title id="gd-map-title">Illustrative LIFTAG gym network around Slovakia</title>
          <path v-for="boundary in regionalBoundaries" :key="boundary.id" :d="regionalPath(boundary)" :class="['gd-country', { 'is-slovakia': boundary.id === 'SK' }]" />
          <text x="667" y="399" class="gd-country-name">SLOVAKIA</text>
          <g v-for="gym in locationButtons" :key="gym.id">
            <line v-if="regionalLabelPoint(gym, expandedPrague).x !== projectRegional(gym.longitude, gym.latitude).x || regionalLabelPoint(gym, expandedPrague).y !== projectRegional(gym.longitude, gym.latitude).y" :x1="projectRegional(gym.longitude, gym.latitude).x" :y1="projectRegional(gym.longitude, gym.latitude).y" :x2="regionalLabelPoint(gym, expandedPrague).x" :y2="regionalLabelPoint(gym, expandedPrague).y" class="gd-leader" />
            <circle :cx="projectRegional(gym.longitude, gym.latitude).x" :cy="projectRegional(gym.longitude, gym.latitude).y" r="5" :class="['gd-map-dot', { 'is-selected': selectedId === gym.id }]" />
          </g>
        </svg>
        <button v-for="gym in locationButtons" :key="`button-${gym.id}`" class="gd-location" :class="{ 'is-selected': selectedId === gym.id, 'is-cluster': gym.cluster === 'prague' && !expandedPrague }" :style="{ left: `${regionalLabelPoint(gym, expandedPrague).x / 10}%`, top: `${regionalLabelPoint(gym, expandedPrague).y / 6.2}%` }" :aria-pressed="selectedId === gym.id" @click="selectLocation(gym.id)">{{ gym.cluster === 'prague' && !expandedPrague ? 'Prague · 3 examples' : gym.city }}</button>
        <p class="gd-map-note">Illustrative gym locations</p>
      </div>
      <div class="gd-copy">
        <p class="gx-protocol">05 / {{ phase === 0 ? "REGIONAL DISCOVERY" : phase === 1 ? "ONE GYM" : phase < 3 ? "EQUIPMENT, MAPPED" : "READY IN LIFTAG" }}</p>
        <h2 id="gd-title"><GymEntry :key="`t-${phase}`" mode="holo" :delay="40">{{ simple ? "One gym.\nMade discoverable." : titles[phase] }}</GymEntry></h2>
        <p class="gd-caption">{{ simple ? "Your gym identity and every machine in one useful view." : captions[phase] }}</p>
        <div v-if="!simple" class="gd-steps" aria-label="Explore gym discovery"><button v-for="(label, index) in ['The region', 'One gym', 'The floor', 'In the app']" :key="label" :aria-pressed="phase === index" @click="go(index)"><span class="gd-step-dot" aria-hidden="true" />{{ label }}</button></div>
        <NuxtLink v-if="phase === 3 || simple" class="btn-primary gd-link" to="#kit">Request your free kit</NuxtLink>
      </div>
      <article class="gd-profile" :class="{ 'is-shown': phase === 1 || simple }" :inert="phase !== 1 && !simple">
        <div class="gd-profile-photo"><img src="/assets/gym3d/discovery/plate-loaded-chest-press.webp" width="800" height="800" alt="Plate-loaded chest press from the example equipment floor" loading="lazy" /></div>
        <div class="gd-profile-info"><p class="gx-protocol">ILLUSTRATIVE GYM PROFILE</p><h3>{{ selectedGym.venue }}</h3><p>{{ selectedGym.city }}, {{ selectedGym.country }} <span aria-hidden="true">↗</span></p></div>
        <div class="gd-review"><span class="gd-review-mark" aria-hidden="true">○</span><div><strong>Member reviews</strong><p>No reviews yet. The profile is ready when members are.</p></div></div>
        <div class="gd-profile-equipment"><strong>Equipment connected</strong><span>4 example machines</span></div>
        <button v-if="!simple" class="btn-ghost gd-profile-machines" @click="go(2)"><HoloPill />Explore the gym floor</button>
      </article>
      <div v-if="!simple && phase >= 2" class="gd-selected-gym" aria-live="polite">
        <span>Selected gym</span>
        <strong>{{ selectedGym.venue }}</strong>
        <small>{{ selectedGym.city }}, {{ selectedGym.country }}</small>
      </div>
      <GymEquipmentInventory v-if="simple" :gym="selectedGym" />
      <button v-if="!simple && phase === 0" class="gd-replay gx-protocol" @click="replay++">↻ Replay Earth view</button>
      <button v-if="!simple && phase === 2" class="gd-floor-next gx-protocol" @click="go(3)">FROM FLOOR TO THE APP <span aria-hidden="true">↓</span></button>
    </div>
  </section>
  <section v-if="!simple" class="gd-mobile-endpoint" aria-label="Selected gym inventory">
    <p class="gx-protocol">YOUR FLOOR IN LIFTAG</p>
    <GymEquipmentInventory :gym="selectedGym" />
    <NuxtLink class="btn-primary gd-mobile-endpoint__cta" to="#kit">Request your free kit</NuxtLink>
  </section>
</template>
