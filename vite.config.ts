import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { cleanContactFields, defaultContactLimits, forwardToDiscord, type ContactLimits } from './src/contact.ts'

function getContactLimits(env: Record<string, string>): ContactLimits {
  return {
    email: Number(env.CONTACT_EMAIL_MAX) || defaultContactLimits.email,
    title: Number(env.CONTACT_TITLE_MAX) || defaultContactLimits.title,
    message: Number(env.CONTACT_MESSAGE_MAX) || defaultContactLimits.message,
  }
}

function contactMiddleware(webhook: string, limits: ContactLimits): Plugin {
  const handler = (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => {
    if (req.method !== 'POST' || req.url?.split('?')[0] !== '/api/contact') return next()
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
      if (body.length > 10000) {
        res.writeHead(413).end()
        req.destroy()
      }
    })
    req.on('end', async () => {
      try {
        const fields = cleanContactFields(JSON.parse(body), limits)
        if (!fields) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Please check the form fields.' }))
          return
        }
        if (!webhook) {
          res.writeHead(503, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Contact service is not configured.' }))
          return
        }
        const discordResponse = await forwardToDiscord(webhook, fields)
        res.writeHead(discordResponse.ok ? 200 : 502, { 'Content-Type': 'application/json' }).end(JSON.stringify(
          discordResponse.ok ? { ok: true } : { error: 'Message delivery failed.', upstreamStatus: discordResponse.status },
        ))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Invalid request.' }))
      }
    })
  }

  return {
    name: 'local-contact-route',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicProfile = {
    linkedIn: env.LINKED_IN ?? 'https://www.linkedin.com/in/neil-talavera',
    github: env.GITHUB ?? 'https://github.com/neiltalavera',
    morrowlog: env.MORROWLOG ?? 'https://morrowlog.snlc.workers.dev/',
    gymTypescript: env.GYM_TYPESCRIPT ?? 'https://gym-typescript-cav.pages.dev/',
  }
  const limits = getContactLimits(env)

  return {
    plugins: [react(), contactMiddleware(env.DISCORD_WEBHOOK ?? 'https://discord.com/api/webhooks/1569593545978019943/2GNQmuW96DvglWFl8TCPKQkbCT53vY-GOIJR-eS_Eflcsm9O2iySdTWbbrALb_NEM-Jf', limits)],
    envPrefix: 'NEIL_PUBLIC_',
    define: {
      'import.meta.env.PUBLIC_PROFILE': JSON.stringify(publicProfile),
      'import.meta.env.PUBLIC_CONTACT_LIMITS': JSON.stringify(limits),
    },
  }
})
