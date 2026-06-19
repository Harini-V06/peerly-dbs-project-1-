import { createServer } from 'node:http'
import { existsSync, createReadStream, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

process.on('uncaughtException', (err) => process.stdout.write('[uncaughtException] ' + err.stack + '\n'))
process.on('unhandledRejection', (r) => process.stdout.write('[unhandledRejection] ' + String(r) + '\n'))

const { default: handler } = await import('./dist/server/server.js')
const clientDir = join(fileURLToPath(new URL('.', import.meta.url)), 'dist', 'client')
const port = Number(process.env.PORT) || 3000

// Log available assets at startup to verify Docker build output
try {
  const assets = readdirSync(join(clientDir, 'assets'))
  process.stdout.write('[assets] ' + assets.join(', ') + '\n')
} catch (e) {
  process.stdout.write('[assets] ERROR reading assets dir: ' + e.message + '\n')
}

const MIME = {
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.html': 'text/html',
  '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
}

// Tiny script injected into every HTML response to capture JS errors server-side
const ERROR_CATCHER = `<script>
window.addEventListener('error',function(e){
  fetch('/__jserr',{method:'POST',body:JSON.stringify({msg:e.message,src:e.filename,line:e.lineno,stack:e.error&&e.error.stack})});
});
window.addEventListener('unhandledrejection',function(e){
  fetch('/__jserr',{method:'POST',body:JSON.stringify({msg:String(e.reason),stack:e.reason&&e.reason.stack})});
});
</script>`

createServer(async (req, res) => {
  const pathname = req.url.split('?')[0]

  // Client-side error reporting endpoint
  if (req.method === 'POST' && pathname === '/__jserr') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    try {
      const data = JSON.parse(Buffer.concat(chunks).toString())
      process.stdout.write('[CLIENT JS ERROR] ' + JSON.stringify(data) + '\n')
    } catch {}
    res.statusCode = 204
    res.end()
    return
  }

  // Serve static files from dist/client/ directly
  const filePath = join(clientDir, pathname)
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const mime = MIME[extname(filePath)] || 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    process.stdout.write('static ' + pathname + ' (' + mime + ')\n')
    createReadStream(filePath).pipe(res)
    return
  }

  process.stdout.write(req.method + ' ' + req.url + '\n')

  // Buffer the request body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const bodyBuf = Buffer.concat(chunks)

  const headers = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : String(v)
  }

  try {
    const webReq = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
      method: req.method,
      headers,
      ...(bodyBuf.length > 0 ? { body: bodyBuf } : {}),
    })

    const webRes = await handler.fetch(webReq)
    process.stdout.write('  -> ' + webRes.status + '\n')

    res.statusCode = webRes.status
    const setCookies = webRes.headers.getSetCookie ? webRes.headers.getSetCookie() : []
    for (const [k, v] of webRes.headers.entries()) {
      if (k.toLowerCase() === 'set-cookie') continue
      res.setHeader(k, v)
    }
    if (setCookies.length) res.setHeader('Set-Cookie', setCookies)

    const bodyBuf2 = Buffer.from(await webRes.arrayBuffer())
    const ct = (res.getHeader('content-type') || '').toString()

    // Inject error catcher script into HTML responses
    if (ct.includes('text/html')) {
      const html = bodyBuf2.toString('utf8')
      const patched = html.replace('<head>', '<head>' + ERROR_CATCHER)
      res.end(Buffer.from(patched, 'utf8'))
    } else {
      res.end(bodyBuf2)
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
