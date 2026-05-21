import { serve } from 'srvx'
const app = await import('./dist/server/server.js')
const handler = app.default ?? app

serve({
  fetch: (...args) => handler.fetch(...args),
  port: Number(process.env.PORT) || 3000,
})

console.log(`Listening on port ${process.env.PORT || 3000}`)
