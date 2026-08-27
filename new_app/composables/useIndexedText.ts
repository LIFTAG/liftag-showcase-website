// Shared gate for the character index effect (IndexedText.vue, .ti-* in
// assets/css/main.css).
//
// The hover variant is never split in the served HTML. Two reasons:
//
// - Crawlers and readers see one text node per label. The footer is the site's
//   whole internal link graph and it renders on every page; ~50 labels split
//   into ~700 spans, each carrying a data attribute and a custom property,
//   would be dead weight in every response.
// - A touch device can never hover, so on a phone the hover variant would pay
//   for markup that can never animate.
//
// So the hover split is a client-side enhancement, applied after mount - the
// first client render still matches the server, and hydration has nothing to
// reconcile.
//
// The appear variant is split during SSR instead, because its trigger is not
// the pointer. A milestone can scroll into view in the same frame its section
// hydrates, and a label still waiting on an idle callback would miss its own
// entrance. Reduced motion is handled on the far side: the flag flips in
// onMounted (after hydration has matched) and the `.ti-*` reduced-motion rules
// hold the label still regardless.
//
// The two media queries that decide it are owned here rather than per
// instance. This is the tax useSharedMouse exists to avoid: giving each of the
// footer's labels its own pair of MediaQueryList listeners would install a
// hundred of them. As there, the listeners are installed once and left in
// place for the lifetime of the page - there is a single pair, and whatever is
// mounted at the time reads the flags they publish.

const hoverCapable = ref(false)
const reduceMotion = ref(false)
let installed = false

// Splitting the footer means rendering a few hundred spans that look exactly
// like the text they replace until a pointer arrives, so the work waits for an
// idle slice instead of landing next to hydration.
function scheduleIdle(run: () => void) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 1500 })
  else setTimeout(run, 240)
}

function ensureIndexedTextQueries() {
  if (installed || typeof window === 'undefined' || !window.matchMedia) return
  installed = true

  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Reduced motion is read immediately. It is the only flag that can withhold
  // the effect, and an appear consumer must not be left waiting on idle time
  // to find out that it should stay plain.
  reduceMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', (e) => { reduceMotion.value = e.matches })
  hoverQuery.addEventListener('change', (e) => { hoverCapable.value = e.matches })

  scheduleIdle(() => { hoverCapable.value = hoverQuery.matches })
}

/**
 * True once the label may be split into per-character windows.
 *
 * `hover` waits for a pointer that can actually hover; `appear` is driven by a
 * state change rather than by the cursor, so it only waits on reduced motion.
 */
export function useIndexedTextSplit(mode: 'hover' | 'appear' = 'hover') {
  // Until this instance has mounted, the answer is whatever the server rendered
  // and nothing else. The flags above are page-wide and settle within a second
  // of load, but pages/index.vue hydrates its sections on visibility, so a label
  // can hydrate long after that - reading the settled flags for its first client
  // render would contradict the markup already sitting on the page and hand Vue
  // a hydration mismatch. So each instance re-reads them only once its own
  // hydration has been matched.
  const mounted = ref(false)

  // A mounted hook never runs during SSR, and the installer guards on `window`.
  onMounted(() => {
    ensureIndexedTextQueries()
    mounted.value = true
  })

  return computed(() => (
    mounted.value
      ? !reduceMotion.value && (mode === 'appear' || hoverCapable.value)
      : mode === 'appear'
  ))
}
