<script setup lang="ts">
const props = defineProps<{ param: string }>()
const param = props.param

const { data: machine } = await useAsyncData(`catalog-machine-${param}`, () => resolveCatalogMachine(param))

if (!machine.value) {
  throw createError({ statusCode: 404, statusMessage: 'Machine not found', fatal: true })
}

// UUID (or stale-slug) hits move to the canonical slug URL once the API
// exposes machine slugs.
if (machine.value.slug && machine.value.slug !== param) {
  await navigateTo(`/machines/${machine.value.slug}`, { redirectCode: 301, replace: true })
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
  machineMetaDescription({
    name: name.value,
    description: machine.value?.description,
    exerciseCount: exercises.value.length,
  }),
)

const machineHref = computed(() => `/machines/${canonicalParam.value}`)
const heroAlt = computed(() => `${name.value} — gym machine in the LIFTAG catalog`)

useLiftagSeo({
  title: `${name.value} | Exercises & Setup | LIFTAG`,
  description: pageDescription.value,
  path: machineHref.value,
  ...(photos.value[0] ? { image: photos.value[0] } : {}),
})

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

useLiftagStructuredData([
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
    { name: 'Machines', path: '/machines' },
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
          name: `Exercises on the ${name.value}`,
          items: exercises.value.map((exercise) => ({
            name: exercise.name,
            url: `https://liftag.fit/exercises/${exercise.slug ?? exercise.id}`,
          })),
        }),
      ]
    : []),
])
</script>

<template>
  <CatalogMachinePresentation v-if="machine" :machine="machine" />
</template>
