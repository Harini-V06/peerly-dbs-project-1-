import { createServer } from 'node:http'
import { Readable } from 'node:stream'

process.on('uncaughtException', (err) => process.stdout.write('[uncaughtException] ' + err.stack + '\n'))
process.on('unhandledRejection', (r) => process.stdout.write('[unhandledRejection] ' + String(r) + '\n'))

process.stdout.write('serve.mjs v2 starting\n')

const { default: handler } = await import('./dist/server/server.js')

process.stdout.write('handler loaded, fetch type: ' + typeof handler.fetch + '\n')

const port = Number(process.env.PORT) || 3000

createServer(async (req, res) => {
  const url = `http://${req.headers.host || 'localhost'}${req.url}`
  const headers = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : String(v)
  }
  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = Readable.toWeb(req)
  }
  try {
    const webReq = new Request(url, {
      method: req.method,
      headers,
      ...(body ? { body, duplex: 'half' } : {}),
    })
    const webRes = await handler.fetch(webReq)
    res.statusCode = webRes.status
    for (const [k, v] of webRes.headers.entries()) {
      res.setHeader(k, v)
    }
    if (webRes.body) {
      Readable.fromWeb(webRes.body).pipe(res)
    } else {
      res.end()
    }
  } catch (err) {
    process.stdout.write('[request error] ' + err.stack + '\n')
    if (!res.headersSent) {
      res.statusCode = 500
      res.end('Error: ' + err.message)
    }
  }
}).listen(port, '0.0.0.0', () => {
  process.stdout.write('Listening on port ' + port + '\n')
})
