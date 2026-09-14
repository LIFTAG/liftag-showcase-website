import assert from 'node:assert/strict'
import { discoveryIds as ids } from './fixtures/discovery.ts'

// Run against a local production build pointed at discovery-server.mjs.
const origin = process.env.DISCOVERY_TEST_ORIGIN ?? 'http://127.0.0.1:3002'
const read = async (path, options) => {
  const response = await fetch(new URL(path, origin), options)
  return { response, body: await response.text() }
}
const json = async (path) => {
  const { response, body } = await read(`/api/explore${path}`)
  assert.equal(response.status, 200, `${path}: ${body}`)
  assert.match(response.headers.get('cache-control'), /no-store/)
  return JSON.parse(body)
}
const gym = await json(`/gyms/${ids.gym}`)
assert.equal(gym.locale, 'sk')
assert.equal(gym.gym.name, 'Testovacie fitko')
assert.equal(gym.gym.temporarilyClosed, true)
assert.equal(gym.gym.rating, null)
assert.equal(gym.gym.hours.length, 0)
assert.deepEqual(
  gym.gym.media.map((item) => item.type),
  ['image', 'video'],
)
assert.equal((await json(`/gyms/${ids.gym}?lang=en`)).gym.name, 'Fixture Gym')

const mapPath = '/map?north=51&south=47&west=12&east=23&zoom=7'
assert.equal((await json(mapPath)).items.length, 2)
assert.equal((await json(`${mapPath}&manufacturers=${ids.brand}`)).items.length, 1)
assert.equal((await json(`${mapPath}&manufacturers=${ids.brand},${ids.otherBrand}`)).items.length, 2)
assert.equal((await json('/map?north=80&south=20&west=12&east=23&zoom=3')).meta.tooLarge, true)
assert.equal((await json(`/gyms?search=Second&manufacturers=${ids.brand}`)).items[0].id, ids.otherGym)
assert.equal(
  (await json(`/nearby?lat=48.14&lng=17.12&radius=25000&manufacturers=${ids.brand}`)).items.length,
  1,
)

const first = await json(`/gyms/${ids.gym}/equipment`)
const second = await json(`/gyms/${ids.gym}/equipment?page=2`)
assert.equal(first.items.length, 24)
assert.equal(second.items.length, 6)
assert.equal(new Set([...first.items, ...second.items].map((item) => item.gymMachineId)).size, 30)
const machine = await json(`/gyms/${ids.gym}/machines/${ids.machine}`)
assert.equal(machine.templateId, null)
assert.equal(machine.qrCodeId, null)
assert.equal(machine.exercises[0].templateId, null)
assert.match(machine.exercises[0].instructions, /gym-specific/)

const trainer = await json(`/trainers/${ids.trainer}`)
assert.equal(trainer.userId, 123)
assert.ok(trainer.contacts.some((contact) => contact.href.startsWith('mailto:')))
assert.equal((await json('/users/123/routines?page=2')).items.length, 1)
assert.equal((await json('/users/123/plans?page=2')).items.length, 1)
const routine = await json(`/routines/${ids.routine}`)
assert.equal(routine.exercises.length, 3)
assert.equal(routine.groups[0].rest, 90)
assert.deepEqual(
  routine.exercises[1].sets.map((set) => set.restSeconds),
  [0, 90],
)
assert.deepEqual(
  routine.exercises[1].sets.map((set) => set.weightKg),
  [50, 60],
)

for (const [path, status] of [
  [`/gyms/${ids.otherGym}/machines/${ids.machine}`, 404],
  [`/routines/${ids.private}`, 404],
  ['/gyms/not-an-id', 404],
  ['/map?north=10&south=20&west=10&east=20&zoom=7', 422],
  ['/gyms?page=0', 422],
  ['/gyms?search=fail', 502],
  [`/gyms/${ids.otherGym}/reviews`, 502],
]) {
  assert.equal((await read(`/api/explore${path}`)).response.status, status, path)
}
for (const [path, heading, lang] of [
  [`/gyms/${ids.gym}`, 'Testovacie fitko', 'sk'],
  [`/gyms/${ids.gym}?lang=en`, 'Fixture Gym', 'en'],
  [`/gyms/${ids.gym}/machines/${ids.machine}`, 'Vlastný stroj', 'sk'],
  [`/explore/trainers/${ids.trainer}?lang=en`, 'Fixture Trainer', 'en'],
  [`/explore/routines/${ids.routine}?lang=en`, 'Superset preview', 'en'],
]) {
  const { response, body } = await read(path)
  assert.equal(response.status, 200, path)
  assert.match(body, new RegExp(`<html[^>]*lang="${lang}"`))
  assert.ok(body.includes(heading), `SSR content missing: ${heading}`)
  assert.match(body, /rel="canonical"/)
  assert.match(body, /application\/ld\+json/)
}
const manual = await read(`/gyms/${ids.gym}`, { headers: { Cookie: 'liftag-language=en' } })
assert.match(manual.body, /<html[^>]*lang="en"/)
const explicit = await read(`/gyms/${ids.gym}?lang=sk`, { headers: { Cookie: 'liftag-language=en' } })
assert.match(explicit.body, /<html[^>]*lang="sk"/)
assert.equal((await read(`/explore/routines/${ids.private}`)).response.status, 404)
assert.equal((await read(`/gyms/${ids.otherGym}/machines/${ids.machine}`)).response.status, 404)
console.log(
  'Discovery integration checks passed: filters, pagination, custom machines, public content, SSR, language, and error status codes.',
)

const machinePage = `/machines/${ids.machine}?gym=${ids.gym}&lang=en`
const exercisePage = `/exercises/${ids.exercise}?gym=${ids.gym}&machine=${ids.machine}&exercise=${ids.exercise}&lang=en`
for (const [path, heading] of [
  [machinePage, 'Custom gym machine'],
  [exercisePage, 'Custom exercise'],
  [`/sk${exercisePage.replace('lang=en', 'lang=sk')}`, 'Vlastný cvik'],
]) {
  const { response, body } = await read(path)
  assert.equal(response.status, 200, path)
  assert.match(response.headers.get('cache-control'), /no-store/)
  assert.ok(body.includes(heading))
  assert.ok(
    body.includes('ma-detail') || body.includes('ex-detail'),
    'Custom content must use the catalog presentation',
  )
  assert.match(body, new RegExp(`rel="canonical"[^>]*gym=${ids.gym}|gym=${ids.gym}[^>]*rel="canonical"`))
}
assert.ok((await read(exercisePage)).body.includes('Use the gym-specific instructions.'))
assert.equal(
  (await read(exercisePage.replace(`exercise=${ids.exercise}`, `exercise=${ids.otherBrand}`))).response
    .status,
  404,
)
assert.equal((await read(machinePage.replace(`gym=${ids.gym}`, `gym=${ids.otherGym}`))).response.status, 404)
assert.equal((await read(`/machines/${ids.machine}?gym=wrong`)).response.status, 400)
assert.equal((await read(`/exercises/${ids.exercise}?gym=${ids.gym}`)).response.status, 400)
const redirect = await read(`/gyms/${ids.gym}/machines/${ids.machine}?lang=en`, { redirect: 'manual' })
assert.equal(redirect.response.status, 301)
assert.equal(new URL(redirect.response.headers.get('location'), origin).pathname, `/machines/${ids.machine}`)
console.log(
  'Shared catalog routes: custom content, contextual canonicals, legacy redirects, and ownership validation passed.',
)
