import { cleanContactFields, forwardToDiscord, type ContactLimits } from './contact.ts'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  DISCORD_WEBHOOK?: string
  CONTACT_EMAIL_MAX?: string
  CONTACT_TITLE_MAX?: string
  CONTACT_MESSAGE_MAX?: string
}

function jsonResponse(body: Record<string, unknown>, status: number, extraHeaders: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname !== '/api/contact') {
      if (url.pathname.startsWith('/api/')) return jsonResponse({ error: 'Not found.' }, 404)
      return env.ASSETS.fetch(request)
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, { Allow: 'POST' })
    }

    const origin = request.headers.get('Origin')
    if (origin && new URL(origin).host !== url.host) {
      return jsonResponse({ error: 'Invalid request origin.' }, 403)
    }

    const contentLength = Number(request.headers.get('Content-Length') ?? 0)
    if (contentLength > 10_000) return jsonResponse({ error: 'Request is too large.' }, 413)

    let payload: unknown
    try {
      const body = await request.text()
      if (new TextEncoder().encode(body).byteLength > 10_000) {
        return jsonResponse({ error: 'Request is too large.' }, 413)
      }
      payload = JSON.parse(body)
    } catch {
      return jsonResponse({ error: 'Invalid request.' }, 400)
    }

    const limits: ContactLimits = {
      email: Number(env.CONTACT_EMAIL_MAX) || 254,
      title: Number(env.CONTACT_TITLE_MAX) || 120,
      message: Number(env.CONTACT_MESSAGE_MAX) || 1500,
    }
    const fields = cleanContactFields(payload, limits)
    if (!fields) return jsonResponse({ error: 'Please check the form fields.' }, 400)
    if (!env.DISCORD_WEBHOOK) return jsonResponse({ error: 'Contact service is not configured.' }, 503)

    try {
      const discordResponse = await forwardToDiscord(env.DISCORD_WEBHOOK, fields)
      if (!discordResponse.ok) return jsonResponse({ error: 'Message delivery failed.' }, 502)
      return jsonResponse({ ok: true }, 200)
    } catch {
      return jsonResponse({ error: 'Message delivery failed.' }, 502)
    }
  },
}
