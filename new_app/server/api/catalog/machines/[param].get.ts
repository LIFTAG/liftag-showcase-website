import { parseCatalogLocale } from '../../../../utils/catalogLocale'
import { resolveMachineFromCatalog } from '../../../utils/catalogResolve'

export default defineEventHandler(async (event) => {
  const param = decodeURIComponent(getRouterParam(event, 'param') ?? '')
  if (!param) {
    throw createError({ statusCode: 400, statusMessage: 'Missing machine' })
  }

  const machine = await resolveMachineFromCatalog(param, parseCatalogLocale(getQuery(event).locale))
  if (!machine) {
    throw createError({ statusCode: 404, statusMessage: 'Machine not found' })
  }

  return machine
})
