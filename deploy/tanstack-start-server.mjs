// Serves TanStack Start SSR plus client assets. Vite is not part of the runtime image.
import { serve } from 'srvx/node'
import { serveStatic } from 'srvx/static'
import server from './dist/server/server.js'

const port = Number.parseInt(process.env.PORT ?? '3000', 10)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be a valid TCP port')
}

serve({
  fetch: server.fetch,
  hostname: '0.0.0.0',
  middleware: [
    serveStatic({
      dir: './dist/client',
    }),
  ],
  port,
})
