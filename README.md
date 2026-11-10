# Portfolio

**Site URL:** [https://portfolio.pages.dev](https://portfolio.pages.dev)  

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

## Deploy to Cloudflare Pages

Connect this project to a Git repository in Cloudflare Pages and set the build fields:

| Setting | Value |
| --- | --- |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | The folder containing this README and `package.json` |

Cloudflare Pages lists `npm run build` and `dist` as the React with Vite build settings in its [build configuration guide](https://developers.cloudflare.com/pages/configuration/build-configuration/). The Pages Function in `functions/api/contact.ts` handles the live `/api/contact` route.

In the Cloudflare dashboard, open the Pages project and add these values under **Settings > Variables and Secrets** for production. Add them to preview too if preview deployments should receive contact form messages. See Cloudflare’s [Pages environment variable guide](https://developers.cloudflare.com/pages/functions/bindings/#environment-variables) for the current steps.

| Variable | Value |
| --- | --- |
| `DISCORD_WEBHOOK` | The active Discord webhook URL. Store it as a secret. |
| `CONTACT_EMAIL_MAX` | `254` |
| `CONTACT_TITLE_MAX` | `120` |
| `CONTACT_MESSAGE_MAX` | `1500` |

Add the public profile and project link variables as build environment variables if they differ from `.env.example`. Do not set `DISCORD_WEBHOOK` with a `NEIL_PUBLIC_` prefix.

After the first successful deploy, replace the temporary site URL at the top of this README with the assigned `pages.dev` address or your custom domain.