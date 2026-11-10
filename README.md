# Portfolio

**Site URL:** [https://neil-talavera.snlc.workers.dev](https://neil-talavera.snlc.workers.dev)  

A single-page portfolio, built with Vite, React, and TypeScript. It highlights Morrowlog, a live full-stack app, along with career experience, skills, and a contact form.

## Projects

### Morrowlog

A live community blog built to show full-stack delivery across cloud services.

- Frontend: Vite, React, and TypeScript, hosted on Cloudflare Workers
- Backend: Python and FastAPI, hosted on AWS Lambda
- Database: PostgreSQL on Neon
- [Live app](https://morrowlog.snlc.workers.dev/)
- [Frontend source](https://github.com/neiltalavera/simple-blog-frontend)
- [Backend source](https://github.com/neiltalavera/simple-blog-backend)

### Gym TypeScript

A tutorial-based React and TypeScript practice project and an early Cloudflare Pages deployment.

- [Live app](https://gym-typescript-cav.pages.dev/)
- [Source code](https://github.com/neiltalavera/gym-typescript)

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Vite prints a local address in the terminal. Open that address to view the site.

To create and preview a production build:

```sh
npm run build
npm run preview
```

## Environment settings

Copy the public link settings and contact limits from `.env.example` into `.env`. The `.env` file is ignored by Git.

The site uses these public settings:

| Variable | Purpose |
| --- | --- |
| `LINKED_IN` | LinkedIn profile link |
| `GITHUB` | GitHub profile link |
| `MORROWLOG` | Morrowlog live app link |
| `GYM_TYPESCRIPT` | Gym TypeScript live app link |
| `CONTACT_EMAIL_MAX` | Maximum email length, defaults to 254 |
| `CONTACT_TITLE_MAX` | Maximum title length, defaults to 120 |
| `CONTACT_MESSAGE_MAX` | Maximum message length, defaults to 1500 |

Set `DISCORD_WEBHOOK` only in the local `.env` file or a server environment. Never add it to a public variable or commit it to Git. The browser posts form data to `/api/contact`. The server trims and truncates each value, then sends the requested JSON format to Discord with `Content-Type: application/json` and `User-Agent: react-api/1.0`.

## Deploy to Cloudflare Workers

This project uses a Worker entry point for the contact API and serves the Vite build as static assets. The [`wrangler.jsonc`](wrangler.jsonc) file connects these parts. The Worker name must match the existing Cloudflare Worker name.

For a Worker connected to Git, open **Workers & Pages > your Worker > Settings > Builds**. Use these commands:

| Setting | Command |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |

Cloudflare Workers Builds runs the build command, then the deploy command. Wrangler reads `wrangler.jsonc`, uploads `dist` as static assets, and routes `/api/*` requests through `src/worker.ts`. See the [Workers Builds guide](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) and [static asset routing guide](https://developers.cloudflare.com/workers/static-assets/binding/).

Add `DISCORD_WEBHOOK` under **Settings > Variables & Secrets** as an encrypted runtime secret. Add these runtime variables too:

| Variable | Value |
| --- | --- |
| `CONTACT_EMAIL_MAX` | `254` |
| `CONTACT_TITLE_MAX` | `120` |
| `CONTACT_MESSAGE_MAX` | `1500` |

The public profile links and contact limits are read during the Vite build. If you change them, set them in **Settings > Builds > Build variables and secrets**. These public values go into the browser bundle. Do not set `DISCORD_WEBHOOK` as a build variable or with a `NEIL_PUBLIC_` prefix.

After saving new runtime secrets, redeploy the Worker. The `.env` file is only for local development and must stay out of Git.
