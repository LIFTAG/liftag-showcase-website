import { createServer } from 'node:http'
import {
  discoveryIds as ids,
  fixtureEquipment,
  fixtureGym,
  fixtureMachine,
  fixturePage,
  fixtureRoutine,
  fixtureTrainer,
} from './discovery.ts'

// Local-only acceptance fixture. Run separately, never as a Nuxt server route.
const port = Number(process.env.DISCOVERY_FIXTURE_PORT ?? 4015)
const mediaOrigin = process.env.DISCOVERY_FIXTURE_SITE ?? 'http://127.0.0.1:3002'
const entityId = (base, index) => `${base.slice(0, -4)}${index.toString(16).padStart(4, '0')}`
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const path = url.pathname
  const lang = url.searchParams.get('lang') ?? 'en'
  const page = Number(url.searchParams.get('page') ?? 1)
  const limit = Number(url.searchParams.get('limit') ?? 24)
  const send = (data, status = 200) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify(data))
  }
  if (request.method !== 'GET') return send({ error: 'Read only' }, 405)
  if (path.includes(ids.private)) return send({ error: 'Not public' }, 404)
  if (url.searchParams.get('search') === 'fail') return send({ error: 'Temporary failure' }, 503)
  if (url.searchParams.get('search') === 'slow') await new Promise((resolve) => setTimeout(resolve, 800))

  if (path === '/v1/catalog/machine-manufacturers')
    return send({
      data: [
        { id: ids.brand, name: 'Fixture Works' },
        { id: ids.otherBrand, name: 'Second Manufacturer' },
      ],
    })
  if (path === '/v1/catalog/exercise-categories')
    return send(fixturePage([{ id: ids.exercise, slug: 'back', name: 'Back' }], page, limit))
  const gym = {
    ...fixtureGym(lang),
    media: [
      { type: 'image', url: `${mediaOrigin}/logo-apple-touch.png` },
      {
        type: 'video',
        url: `${mediaOrigin}/assets/videos/scan-flow.mp4`,
        posterUrl: `${mediaOrigin}/logo-apple-touch.png`,
      },
    ],
  }
  const other = {
    ...gym,
    id: ids.otherGym,
    name: 'Second Gym',
    longitude: 17.14,
    isLiftagSupported: false,
    storefrontStatus: 'visible',
    isOpen: true,
    rating: 4.6,
    reviewCount: 2,
    media: [],
  }
  const gyms = [gym, other]
  if (['/v1/gyms/map', '/v1/gyms/nearby', '/v1/gyms'].includes(path)) {
    let found = gyms
    const search = url.searchParams.get('search')?.toLowerCase()
    const brands = url.searchParams.getAll('machineManufacturerIds[]')
    if (search) found = found.filter((g) => `${g.name} ${g.address}`.toLowerCase().includes(search))
    else if (brands.length)
      found = found.filter((g) => brands.includes(g.id === ids.gym ? ids.brand : ids.otherBrand))
    if (path.endsWith('/map')) {
      const tooLarge = Number(url.searchParams.get('north')) - Number(url.searchParams.get('south')) > 20
      return send({
        data: tooLarge ? [] : found,
        metadata: { limit: 200, count: found.length, truncated: tooLarge, tooLarge },
      })
    }
    return send(fixturePage(found, page, limit))
  }
  if (path === `/v1/gyms/${ids.gym}` || path === `/v1/gyms/${ids.otherGym}`)
    return send({
      data: {
        gym: path.endsWith(ids.gym) ? gym : other,
        equipment: {
          totalEntries: 30,
          manufacturers: [fixtureEquipment().manufacturer],
          preview: [fixtureEquipment(lang)],
        },
        trainers: [fixtureTrainer()],
      },
    })
  if (/\/gyms\/[^/]+\/machines$/.test(path)) {
    let equipment = [
      fixtureEquipment(lang),
      ...Array.from({ length: 29 }, (_, i) => ({
        ...fixtureEquipment(lang),
        gymMachineId: entityId(ids.machine, i + 1),
        name: `${fixtureEquipment(lang).name} ${i + 2}`,
      })),
    ]
    const search = url.searchParams.get('search')?.toLowerCase()
    if (search) equipment = equipment.filter((e) => e.name.toLowerCase().includes(search))
    return send(fixturePage(equipment, page, limit))
  }
  if (/\/gyms\/machines\/[^/]+\/resolve$/.test(path)) {
    const machine = fixtureMachine(lang)
    machine.machine.gymMachineId = path.split('/').at(-2)
    return send({ data: machine })
  }
  if (path.endsWith('/reviews')) {
    if (path.includes(ids.otherGym)) return send({ error: 'Review service unavailable' }, 503)
    return send(fixturePage([], page, limit))
  }
  if (path === `/v1/trainers/${ids.trainer}`) return send({ data: fixtureTrainer() })
  if (path === '/v1/users/123/profile')
    return send({
      data: {
        id: 123,
        memberSince: '2021-01-01',
        isTrainer: true,
        publicRoutinesCount: 25,
        publicPlansCount: 25,
      },
    })
  if (path.endsWith('/routines')) {
    const routines = [
      fixtureRoutine(),
      ...Array.from({ length: 24 }, (_, i) => ({
        ...fixtureRoutine(),
        id: entityId(ids.routine, i + 1),
        name: `Public routine ${i + 2}`,
      })),
    ]
    return send(fixturePage(routines, page, limit))
  }
  if (/\/v1\/routines\/[^/]+$/.test(path)) return send({ data: fixtureRoutine() })
  if (path === '/v1/users/123/plans')
    return send(
      fixturePage(
        Array.from({ length: 25 }, (_, i) => ({
          id: entityId(ids.routine, i + 100),
          name: `Public plan ${i + 1}`,
          description: 'Public plan preview. Continue in the app to follow it.',
        })),
        page,
        limit,
      ),
    )
  send({ error: 'Unknown fixture resource' }, 404)
})
server.listen(port, '127.0.0.1', () =>
  process.stdout.write(`Discovery fixture API: http://127.0.0.1:${port}\n`),
)
