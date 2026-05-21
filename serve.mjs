import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { existsSync, createReadStream, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

process.on('uncaughtException', (err) => process.stdout.write('[uncaughtException] ' + err.stack + '\n'))
process.on('unhandledRejection', (r) => process.stdout.write('[unhandledRejection] ' + String(r) + '\n'))

const { default: handler } = await import('./dist/server/server.js')
const clientDir = join(fileURLToPath(new URL('.', import.meta.url)), 'dist', 'client')
const port = Number(process.env.PORT) || 3000

const MIME = {
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.html': 'text/html',
  '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
}

createServer(async (req, res) => {
  // Serve static files from dist/client/ directly
  const pathname = req.url.split('?')[0]
  const filePath = join(clientDir, pathname)
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const mime = MIME[extname(filePath)] || 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    createReadStream(filePath).pipe(res)
    return
  }

  // Everything else goes to the SSR handler
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
