import { gymAnchor, isGymDemoPath } from "~/utils/gymscan/navigation";
/** Preserve native chapter anchors, including direct loads and browser history. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    const router = useRouter();
    const original = router.options.scrollBehavior;
    router.options.scrollBehavior = (to, from, savedPosition) => {
      if (savedPosition) return savedPosition;
      if (to.hash && isGymDemoPath(to.path)) {
        const id = gymAnchor(to.hash);
        const element = id ? document.getElementById(id) : null;
        if (element) return { el: element, top: 0, behavior: "auto" };
      }
      return original?.(to, from, savedPosition);
    };
    const route = router.currentRoute.value;
    const target = isGymDemoPath(route.path) ? gymAnchor(route.hash) : null;
    if (target)
      document.getElementById(target)?.scrollIntoView({ behavior: "instant" });
  });
});
