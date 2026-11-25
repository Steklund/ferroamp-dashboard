import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'

const SOLARMAN_API = 'https://globalapi.solarmanpv.com'

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const env: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

// Dev-server equivalent of the /api/solarman/* locations in nginx.conf.template,
// so the token stays server-side during `npm run dev` as well.
function solarmanDevProxy(): Plugin {
  return {
    name: 'solarman-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/solarman', async (req, res) => {
        const env = readEnvFile('api.env')
        const url = req.url ?? ''
        let path: string
        let body: string
        const deviceMatch = url.match(/^\/device\/([A-Za-z0-9_-]{1,64})$/)
        if (url === '/devices') {
          path = '/station/v1.0/device'
          body = JSON.stringify({ stationId: Number(env.PLANT_ID), page: 1, size: 50 })
        } else if (deviceMatch) {
          path = '/device/v1.0/currentData'
          body = JSON.stringify({ deviceSn: deviceMatch[1] })
        } else {
          res.statusCode = 404
          res.end()
          return
        }
        try {
          const upstream = await fetch(`${SOLARMAN_API}${path}?language=en`, {
            method: 'POST',
            headers: {
              Authorization: `bearer ${env.SOLARMAN_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body,
          })
          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(await upstream.text())
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ success: false, msg: String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), solarmanDevProxy()],
})
