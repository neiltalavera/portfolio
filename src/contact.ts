export type ContactLimits = { email: number; title: number; message: number }

export const defaultContactLimits: ContactLimits = {
  email: 254,
  title: 120,
  message: 1500,
}

export type ContactFields = { email: string; title: string; message: string }

export function cleanContactFields(value: unknown, limits: ContactLimits = defaultContactLimits): ContactFields | null {
  if (!value || typeof value !== 'object') return null
  const fields = value as Record<string, unknown>
  if (typeof fields.email !== 'string' || typeof fields.title !== 'string' || typeof fields.message !== 'string') return null

  const email = fields.email.trim().slice(0, limits.email)
  const title = fields.title.trim().slice(0, limits.title)
  const message = fields.message.trim().slice(0, limits.message)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !title || !message) return null
  return { email, title, message }
}

export function makeDiscordBody(fields: ContactFields) {
  return JSON.stringify({ content: `email:${fields.email}\ntitle:${fields.title}\nmessage:${fields.message}` })
}

export function forwardToDiscord(webhook: string, fields: ContactFields) {
  return fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'react-api/1.0',
    },
    body: makeDiscordBody(fields),
  })
}
