<script setup lang="ts">
defineProps<{ reduced: boolean }>();
const emit = defineEmits<{ motion: []; kit: [] }>();

const open = shallowRef(false);
const root = useTemplateRef<HTMLElement>("root");
const toggleButton = useTemplateRef<HTMLButtonElement>("menuToggle");
const drawer = useTemplateRef<HTMLElement>("drawer");
let navResizeObserver: ResizeObserver | null = null;

function focusableControls() {
  const controls = root.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return [...(controls ?? [])].filter((control) => {
    const style = getComputedStyle(control);
    const rect = control.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  });
}

function close(restoreFocus = false) {
  if (!open.value) return;
  const focusWasInDrawer = drawer.value?.contains(document.activeElement) ?? false;
  open.value = false;
  if (restoreFocus || focusWasInDrawer) {
    nextTick(() => toggleButton.value?.focus());
  }
}

function toggle() {
  open.value = !open.value;
}

function closeAfterNavigation(event: MouseEvent) {
  const target = event.target as Element;
  if (target.closest("a")) close();
}

function publishNavHeight() {
  const el = root.value;
  if (!el) return;
  el.style.setProperty("--gx-nav-h", `${el.offsetHeight}px`);
}

watch(open, (isOpen, _wasOpen, onCleanup) => {
  if (!import.meta.client || !isOpen) return;
  nextTick(() => {
    if (open.value) {
      drawer.value?.querySelector<HTMLElement>(".gx-nav-drawer__link")?.focus();
    }
  });
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "Tab") return;
    const controls = focusableControls();
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!root.value?.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  };
  const onPointerdown = (event: PointerEvent) => {
    if (!root.value?.contains(event.target as Node)) close();
  };
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerdown);
  onCleanup(() => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("pointerdown", onPointerdown);
  });
});

onMounted(() => {
  publishNavHeight();
  if (typeof ResizeObserver !== "undefined" && root.value) {
    navResizeObserver = new ResizeObserver(publishNavHeight);
    navResizeObserver.observe(root.value, { box: "border-box" });
  }
});

onBeforeUnmount(() => {
  close();
  navResizeObserver?.disconnect();
  navResizeObserver = null;
});
</script>

<template>
  <div
    ref="root"
    class="gx-nav-root"
    :class="{ 'is-open': open }"
    @click="closeAfterNavigation"
  >
    <header class="gx-nav" :class="{ 'is-open': open }">
      <a class="gx-skip" href="#experience">Skip to content</a>
      <NuxtLink class="gx-logo" to="/" aria-label="LIFTAG home">
        <img src="/assets/logo.svg" width="25" height="25" alt="" />
        <GymLockupWord />
      </NuxtLink>
      <nav class="gx-nav__links" aria-label="Main navigation">
        <a href="#experience">Experience</a><a href="#gyms">For gyms</a
        ><NuxtLink to="/get">Get the app ↗</NuxtLink>
      </nav>
      <a class="btn-primary gx-nav__kit" href="#kit" @click="emit('kit')"
        ><span>Request your </span><span class="gx-nav__kit-label">free kit</span></a
      >
      <button
        ref="menuToggle"
        type="button"
        class="gx-nav-toggle"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        aria-controls="gx-mobile-navigation"
        @click="toggle"
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path class="line line1" d="M20 29h60s14.499-.183 14.533 37.711c.01 11.27-3.567 14.96-9.274 14.958C79.552 81.668 75 74.999 75 74.999L25 25" />
          <path class="line line2" d="M20 50h60" />
          <path class="line line3" d="M20 71h60s14.499.183 14.533-37.711c.01-11.27-3.567-14.96-9.274-14.958-5.707.001-10.259 6.67-10.259 6.67L25 75" />
        </svg>
      </button>
    </header>
    <div
      ref="drawer"
      id="gx-mobile-navigation"
      class="gx-nav-drawer"
      :class="{ 'is-open': open }"
      :aria-hidden="!open"
      :inert="!open"
    >
      <nav aria-label="More navigation">
        <a href="#lifters" class="gx-nav-drawer__link">Try LIFTAG</a>
        <a href="#gyms" class="gx-nav-drawer__link">For gym owners</a>
        <NuxtLink to="/for-trainers" class="gx-nav-drawer__link">For coaches</NuxtLink>
        <NuxtLink to="/pricing" class="gx-nav-drawer__link">Pricing</NuxtLink>
        <NuxtLink to="/exercises" class="gx-nav-drawer__link">Exercise library</NuxtLink>
        <NuxtLink to="/get" class="gx-nav-drawer__link gx-nav-drawer__app">Get the app</NuxtLink>
      </nav>
      <div class="gx-nav-drawer__store">
        <GetAppBtn label="Get the app" />
      </div>
      <button
        type="button"
        class="gx-nav-drawer__link gx-nav-drawer__motion"
        :aria-pressed="reduced"
        @click.stop="emit('motion')"
      >
        Reduce motion {{ reduced ? "on" : "off" }}
      </button>
    </div>
  </div>
</template>
