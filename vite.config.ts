import { defineConfig } from 'vite'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    port: 3000,
    open: true,
  },
  plugins: [
    {
      name: 'publish-api',
      configureServer(server) {
        server.middlewares.use('/api/publish', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
          const storeId = (req.url ?? '').replace(/^\//, '').split('?')[0]
          if (!storeId) { res.statusCode = 400; res.end('Missing store ID'); return }
          let body = ''
          req.on('data', (chunk) => { body += String(chunk) })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const dir = resolve(__dir, 'Pages/store-app/dist/overrides')
              mkdirSync(dir, { recursive: true })
              writeFileSync(resolve(dir, `${storeId}.json`), JSON.stringify(data, null, 2) + '\n')
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(e) }))
            }
          })
        })
      },
    },
  ],
})
