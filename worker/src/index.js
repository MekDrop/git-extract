import { Router } from 'itty-router'
import { githubCallback } from './routes/auth.js'
import { handleExtract } from './routes/extract.js'
import { handleStatus } from './routes/status.js'

const router = Router()

router.get('/auth/github/callback', githubCallback)
router.post('/extract', handleExtract)
router.get('/status', handleStatus)
router.options('*', () => new Response(null, { status: 204 }))
router.all('*', () => Response.json({ error: 'not found' }, { status: 404 }))

function withCors(response, request, env) {
  const origin = request.headers.get('Origin')
  if (!origin || origin !== env.SPA_URL) return response
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', env.SPA_URL)
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export default {
  async fetch(request, env, ctx) {
    try {
      const response = await router.fetch(request, env, ctx)
      return withCors(response, request, env)
    } catch (err) {
      return withCors(
        Response.json({ error: 'internal error' }, { status: 500 }),
        request,
        env,
      )
    }
  },
}
