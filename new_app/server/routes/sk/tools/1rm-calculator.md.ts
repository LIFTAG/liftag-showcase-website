// Keep localized documents out of public/sk: its directory would make Nitro's
// dev static server redirect the /sk homepage to /sk/ before Vue can render it.
export default defineEventHandler(async (event) => {
  const markdown = await useStorage('assets:server').getItem<string>('markdown/1rm-calculator.sk.md')
  if (markdown === null) throw createError({ statusCode: 500, statusMessage: 'Document unavailable' })
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return markdown
})
