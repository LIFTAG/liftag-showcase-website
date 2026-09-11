import { renderOneRmOgCard } from '../../utils/ogToolCard'

export default defineEventHandler(async (event) => {
  const png = await renderOneRmOgCard()
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, stale-while-revalidate=86400')
  return png
})
