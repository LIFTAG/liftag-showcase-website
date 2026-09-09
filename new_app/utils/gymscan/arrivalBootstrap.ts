/**
 * First-paint cover for the gym demo boot. The overlay used to mount in
 * onMounted, so the SSR HTML painted nav, chapters, and headlines for a
 * frame. This script/style pair lives at the top of <head> so the doors
 * own the viewport before those nodes are parsed.
 *
 * Keep the selectors in lockstep with GymArrival.vue and gym-experience.css.
 */
export const GYM_ARRIVAL_STATE_KEY = "gym-arrival-seen";
export const GYM_ARRIVAL_BOOTSTRAP_MARK = "liftag-gx-arrival";
export const GYM_ARRIVAL_OVERLAY_ID = "gx-arrival";

export const GYM_ARRIVAL_BOOTSTRAP_SCRIPT = `(function(){/*${GYM_ARRIVAL_BOOTSTRAP_MARK}*/var r=document.documentElement,s='play';try{if(location.hash||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||(navigator.connection&&navigator.connection.saveData))s='skip'}catch(e){}r.setAttribute('data-gym-arrival',s)})();`;

export const GYM_ARRIVAL_BOOTSTRAP_STYLE = `html[data-gym-arrival=play]{background:#040605}.gx-arrival{position:fixed;inset:0;z-index:80;overflow:hidden;background:#040605;pointer-events:auto}.gx-arrival.is-opening{background:transparent;pointer-events:none}.gx-arrival__door{position:absolute;top:0;bottom:0;width:50.1%;background:#040605}.gx-arrival__door--left{left:0}.gx-arrival__door--right{right:0}html[data-gym-arrival=play] .gx>:not(.gx-arrival){visibility:hidden}html[data-gym-arrival=open] .gx-nav-root,html[data-gym-arrival=open] .gx-chapters,html[data-gym-arrival=open] .gx-footer,html[data-gym-arrival=open] .gx-opening{visibility:hidden}html[data-gym-arrival=skip] .gx-arrival,html[data-gym-arrival=done] .gx-arrival{display:none!important}@media (scripting:none),(prefers-reduced-motion:reduce){.gx-arrival{display:none!important}html[data-gym-arrival=play] .gx>:not(.gx-arrival),html[data-gym-arrival=open] .gx-nav-root,html[data-gym-arrival=open] .gx-chapters,html[data-gym-arrival=open] .gx-footer,html[data-gym-arrival=open] .gx-opening{visibility:visible}}`;
