import { serve } from 'srvx'

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err))
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason))

const app = await import('./dist/server/server.js')
const handler = app.default ?? app

console.log('handler type:', typeof handler)
if (handler && typeof handler === 'object') {
  console.log('handler keys:', Object.keys(handler).join(', '))
  console.log('handler.fetch type:', typeof handler.fetch)
}

const fetchFn = typeof handler === 'function' ? handler : handler?.fetch
if (typeof fetchFn !== 'function') {
  console.error('FATAL: no fetch function found. handler=', handler)
  process.exit(1)
}

serve({
  fetch: async (...args) => {
    try {
      return await fetchFn(...args)
    } catch (err) {
      console.error('[request error]', err)
      return new Response('Internal Server Error: ' + err.message, { status: 500 })
    }
  },
  port: Number(process.env.PORT) || 3000,
})

console.log(`Listening on port ${process.env.PORT || 3000}`)
