import http from 'node:http'
import type { IncomingMessage } from 'node:http'
import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BFF_ORIGIN = 'http://127.0.0.1:8788'

/**
 * Proxy same-origin `/api/finance-assistant/*` → BFF (evita CORS: localhost vs 127.0.0.1 = "Failed to fetch").
 * Se o BFF estiver parado, responde 503 JSON em vez de 500 vazio do proxy por defeito.
 */
function financeAssistantDevProxy(): Plugin {
  return {
    name: 'finance-assistant-dev-proxy',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/finance-assistant')) {
          next()
          return
        }
        const subpath = url.slice('/api/finance-assistant'.length) || '/'
        const target = new URL(subpath.startsWith('/') ? subpath : `/${subpath}`, BFF_ORIGIN)

        const headers = forwardRequestHeaders(req)
        const pReq = http.request(
          {
            hostname: target.hostname,
            port: target.port || 8788,
            path: target.pathname + target.search,
            method: req.method,
            headers,
          },
          (pRes) => {
            if (res.writableEnded) return
            res.writeHead(pRes.statusCode ?? 502, pRes.headers as NodeJS.Dict<number | string | string[]>)
            pRes.pipe(res)
          },
        )
        pReq.on('error', (err: NodeJS.ErrnoException) => {
          if (res.headersSent || res.writableEnded) return
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              error: `BFF no disponible (${BFF_ORIGIN}). Ejecuta en otra terminal: npm run assistant-server (${err.code ?? err.message})`,
            }),
          )
        })
        req.pipe(pReq)
      })
    },
  }
}

function forwardRequestHeaders(req: IncomingMessage): http.OutgoingHttpHeaders {
  const h: http.OutgoingHttpHeaders = { ...req.headers }
  delete h.connection
  delete h['proxy-connection']
  h.host = '127.0.0.1:8788'
  return h
}

const projectRoot = path.resolve(__dirname, '.')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  /** Ficheiros `.env` + variáveis já no processo (ex.: secret no GitHub Actions). */
  const env = loadEnv(mode, projectRoot, '')
  const accessPassword =
    env.VITE_APP_ACCESS_PASSWORD ?? process.env.VITE_APP_ACCESS_PASSWORD ?? ''

  return {
    plugins: [financeAssistantDevProxy(), react(), tailwindcss()],
    base: '/',
    envDir: projectRoot,
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_APP_ACCESS_PASSWORD': JSON.stringify(accessPassword),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      /** URL fixa: http://localhost:5177/ — se a porta estiver ocupada, o Vite falha (evita abrir 5178 sem perceber). */
      port: 5177,
      strictPort: true,
      allowedHosts: true,
      /** Ao iniciar `npm run dev`, abre o dashboard. */
      open: '/dashboard',
      /** Liga só em localhost (IPv4); evita problemas com `host: true` + acesso via localhost em alguns ambientes. */
      host: 'localhost',
      /** El proxy del BFF va en el plugin `financeAssistantDevProxy` (misma origin, sin CORS). */
    },
  }
})
