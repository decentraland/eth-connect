const { resolve } = require("path")
process.env.TS_NODE_PROJECT = resolve(__dirname, "tsconfig.json")

process.stdout.write('creating test environment...\n')

require('ts-node/register')
require('source-map-support/register')

process.on('unhandledRejection', (reason, promise) => {
  promise.catch((e) => {
    console.error('unhandledRejection:', reason.toString())
    console.error('exception:', e)
    console.error('stack:', e.stack)
  })
})
