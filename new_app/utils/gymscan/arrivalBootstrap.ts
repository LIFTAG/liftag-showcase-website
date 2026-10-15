/**
 * First-paint cover for the gym demo boot. The overlay used to mount in
 * onMounted, so the SSR HTML painted nav, chapters, and headlines for a
 * frame. This script/style pair lives at the top of <head> so the doors
 * own the viewport before those nodes are parsed.
 *
 * Keep the selectors in lockstep with GymArrival.vue and gym-experience.css.
 *
 * The last rule keeps below-the-fold resources from loading while the doors
 * play. The gym stylesheets arrive after the entry script, so the first
 * layout is unstyled: sections are short, two lazy images sat inside the
 * lazy-load distance, and the map's Slovak city labels (č, š) were set in the
 * body font, which pulled the 83 KB Inter latin-ext subset at top priority.
 * All of it downloaded with the page against the 3D boot. None of it can be
 * seen under the cover, and each is absolutely positioned or a fallback, so
 * display:none moves nothing. From "open" on (and for no-JS, reduced motion
 * and deep links, which never "play") they behave as before.
 */
export const GYM_ARRIVAL_STATE_KEY = "gym-arrival-seen";
export const GYM_ARRIVAL_BOOTSTRAP_MARK = "liftag-gx-arrival";
export const GYM_ARRIVAL_OVERLAY_ID = "gx-arrival";

export const GYM_ARRIVAL_BOOTSTRAP_SCRIPT = `(function(){/*${GYM_ARRIVAL_BOOTSTRAP_MARK}*/var r=document.documentElement,s='play';try{if(location.hash||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||(navigator.connection&&navigator.connection.saveData))s='skip'}catch(e){}r.setAttribute('data-gym-arrival',s)})();`;

export const GYM_ARRIVAL_BOOTSTRAP_STYLE = `html[data-gym-arrival=play]{background:#040605}.gx-arrival{position:fixed;inset:0;z-index:80;overflow:hidden;background:#040605;pointer-events:auto}.gx-arrival.is-opening{background:transparent;pointer-events:none}.gx-arrival__door{position:absolute;top:0;bottom:0;width:50.1%;background:#040605}.gx-arrival__door--left{left:0}.gx-arrival__door--right{right:0}html[data-gym-arrival=play] .gx>:not(.gx-arrival){visibility:hidden}html[data-gym-arrival=open] .gx-nav-root,html[data-gym-arrival=open] .gx-chapters,html[data-gym-arrival=open] .gx-footer,html[data-gym-arrival=open] .gx-opening{visibility:hidden}html[data-gym-arrival=skip] .gx-arrival,html[data-gym-arrival=done] .gx-arrival{display:none!important}html[data-gym-arrival=play] .gx-tag-poster,html[data-gym-arrival=play] .gm-phone__shot,html[data-gym-arrival=play] .gmap-city{display:none}@media (scripting:none),(prefers-reduced-motion:reduce){.gx-arrival{display:none!important}html[data-gym-arrival=play] .gx>:not(.gx-arrival),html[data-gym-arrival=open] .gx-nav-root,html[data-gym-arrival=open] .gx-chapters,html[data-gym-arrival=open] .gx-footer,html[data-gym-arrival=open] .gx-opening{visibility:visible}}`;
