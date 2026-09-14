<script setup lang="ts">
import { catalogChrome } from '~/utils/catalogCopy'
const props = defineProps<{ param: string }>()
const param = props.param
const { locale, href } = useSiteLocale()
const chrome = computed(() => catalogChrome(locale.value))
const seo = computed(() => catalogSeo(locale.value))

const { data: machine } = await useAsyncData(`catalog-machine-${locale.value}-${param}`, (_app, { signal }) =>
  resolveCatalogMachine(param, locale.value, signal),
)

if (!machine.value) {
  throw createError({ statusCode: 404, statusMessage: 'Machine not found', fatal: true })
}

// UUID (or stale-slug) hits move to the canonical slug URL once the API
// exposes machine slugs.
if (machine.value.slug && machine.value.slug !== param) {
  await navigateTo(href(`/machines/${machine.value.slug}`), { redirectCode: 301, replace: true })
}

const name = computed(() => machine.value?.name ?? '')
const canonicalParam = computed(() => machine.value?.slug ?? machine.value?.id ?? param)

const photos = computed(() => {
  const list = machine.value?.photoUrls ?? []
  if (list.length > 0) return list
  return machine.value?.photoUrl ? [machine.value.photoUrl] : []
})

const exercises = computed(() => machine.value?.exercises ?? [])

const pageDescription = computed(() =>
  seo.value.machineMetaDescription({
    name: name.value,
    description: machine.value?.description,
    exerciseCount: exercises.value.length,
  }),
)

const machineHref = computed(() => `/machines/${canonicalParam.value}`)
const heroAlt = computed(() => chrome.value.machineImageAlt(name.value))

useLiftagSeo(() => ({
  title: chrome.value.machineDetailTitle(name.value),
  description: pageDescription.value,
  path: machineHref.value,
  ...(photos.value[0] ? { image: photos.value[0] } : {}),
}))

const imageObject = computed(() =>
  photos.value[0]
    ? liftagImageObject({
        url: photos.value[0],
        name: heroAlt.value,
        caption: heroAlt.value,
        description: pageDescription.value,
      })
    : null,
)

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path: machineHref.value,
    name: name.value,
    description: pageDescription.value,
    image: photos.value[0],
    aboutId: `https://liftag.fit${machineHref.value}#machine`,
    primaryImage: imageObject.value ?? undefined,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: chrome.value.breadcrumbMachines, path: href('/machines') },
    { name: name.value, path: machineHref.value },
  ]),
  liftagExerciseEquipment({
    name: name.value,
    description: pageDescription.value,
    path: machineHref.value,
    image: photos.value[0] ?? null,
  }),
  ...(imageObject.value ? [imageObject.value] : []),
  ...(exercises.value.length
    ? [
        liftagItemList({
          name: chrome.value.machineExerciseList(name.value),
          items: exercises.value.map((exercise) => ({
            name: exercise.name,
            url: `https://liftag.fit${href(exercisePath(exercise.slug ?? exercise.id, locale.value))}`,
          })),
        }),
      ]
    : []),
])
</script>

<template>
  <CatalogMachinePresentation v-if="machine" :machine="machine" :locale="locale" />
</template>
