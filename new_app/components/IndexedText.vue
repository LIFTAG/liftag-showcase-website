<script setup lang="ts">
import { splitIndexedText } from '~/utils/indexedText'

/**
 * The desktop nav's hover index (SiteNav.vue, `.nav-link__char`) as a reusable
 * label. Each character sits in a clip window holding two copies of itself,
 * one in flow and a duplicate exactly one window below; driving both up by one
 * window swaps them in a single hard step. Geometry, curve and per-character
 * stagger all live in the `.ti-*` block in assets/css/main.css.
 *
 * `hover`  - the arriving copy is lime, so the label changes colour the way the
 *            nav's does. The host element carries the `.ti-host` class, because
 *            the pointer belongs to it (the link, the button) and not to this
 *            span.
 * `appear` - fired by a state change instead of by the pointer, and the
 *            arriving copy is the same colour as the one leaving, so only the
 *            travel reads.
 *
 * `play` drives the appear variant. 0 leaves the label at rest; any other value
 * plays the index, and changing it plays it again (the character run is keyed on
 * it, so the animation restarts from the top rather than resuming). Surfaces
 * with no Vue-side trigger can pass a constant 1 and hold the animation with
 * `--ti-play-state: paused` until their own state class lands - see Roadmap.vue.
 */
const props = withDefaults(defineProps<{
  text: string
  mode?: 'hover' | 'appear'
  play?: number
}>(), {
  mode: 'hover',
  play: 0,
})

const split = useIndexedTextSplit(props.mode)
const tokens = computed(() => (split.value ? splitIndexedText(props.text) : []))
const playing = computed(() => props.mode === 'appear' && props.play !== 0)
</script>

<template>
  <!-- Unsplit, this is a plain inline span around the label: what the server
       sends, what a touch device keeps, and what anyone who asked for reduced
       motion keeps. -->
  <span
    class="ti"
    :class="[`ti--${mode}`, { 'is-split': split, 'is-playing': playing }]"
  ><template v-if="split"><template
    v-for="(token, tokenIndex) in tokens"
    :key="`${play}-${tokenIndex}`"
  ><span v-if="token.kind === 'space'" class="ti__space">{{ token.text }}</span><span
    v-else
    class="ti__word"
  ><span
    v-for="char in token.chars"
    :key="char.i"
    class="ti__char"
    :data-ch="char.char"
    :style="{ '--i': char.i }"
  ><span class="ti__glyph">{{ char.char }}</span></span></span></template></template><template v-else>{{ text }}</template></span>
</template>
