import { cleanContactFields, forwardToDiscord, type ContactLimits } from '../../src/contact.ts'

interface Env {
  DISCORD_WEBHOOK?: string
  CONTACT_EMAIL_MAX?: string
  CONTACT_TITLE_MAX?: string
  CONTACT_MESSAGE_MAX?: string
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.DISCORD_WEBHOOK) return Response.json({ error: 'Contact service is not configured.' }, { status: 503 })
  const origin = request.headers.get('Origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const limits: ContactLimits = {
    email: Number(env.CONTACT_EMAIL_MAX) || 254,
    title: Number(env.CONTACT_TITLE_MAX) || 120,
    message: Number(env.CONTACT_MESSAGE_MAX) || 1500,
  }
  const fields = cleanContactFields(payload, limits)
  if (!fields) return Response.json({ error: 'Please check the form fields.' }, { status: 400 })

  try {
    const discordResponse = await forwardToDiscord(env.DISCORD_WEBHOOK, fields)
    if (!discordResponse.ok) return Response.json({ error: 'Message delivery failed.' }, { status: 502 })
    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: 'Message delivery failed.' }, { status: 502 })
  }
}
