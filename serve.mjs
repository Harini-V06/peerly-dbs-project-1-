import { createServer } from 'node:http'

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err))
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason))

const app = await import('./dist/server/server.js')
const handler = app.default ?? app

const fetchFn = typeof handler === 'function' ? handler : handler?.fetch

if (typeof fetchFn !== 'function') {
  console.error('No fetch handler found. handler type:', typeof handler)
  if (handler && typeof handler === 'object') console.error('keys:', Object.keys(handler))
  process.exit(1)
}

console.log('fetch handler loaded, type:', typeof fetchFn)

const port = Number(process.env.PORT) || 3000

createServer(async (req, res) => {
  const url = `http://${req.headers.host || 'localhost'}${req.url}`

  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', c => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })
  }

  try {
    const headers = {}
    for (const [k, v] of Object.entries(req.headers)) {
      if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : v
    }

    const webReq = new Request(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    })

    const webRes = await fetchFn(webReq)

    res.statusCode = webRes.status
    for (const [k, v] of webRes.headers.entries()) {
      res.setHeader(k, v)
    }

    if (webRes.body) {
      const reader = webRes.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err) {
    console.error('[request error]', err)
    res.statusCode = 500
    res.end('Error: ' + err.message)
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`)
})
