process.stdout.write('serve.mjs: start\n')

const app = await import('./dist/server/server.js')

process.stdout.write('app loaded\n')
process.stdout.write('app.default type: ' + typeof app.default + '\n')
process.stdout.write('app keys: ' + Object.keys(app).join(', ') + '\n')
if (app.default && typeof app.default === 'object') {
  process.stdout.write('app.default keys: ' + Object.keys(app.default).join(', ') + '\n')
}
if (typeof app.default === 'function') {
  process.stdout.write('app.default is a function\n')
}

process.exit(0)
