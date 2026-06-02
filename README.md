# girlrobot-next

The public-facing blog front-end for girlrobot. Built with Next.js 16 and fully dynamic — posts and settings are fetched from the API at runtime.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Three.js + Framer Motion
- `@leinadeez/ui-nicorn` — shared component library
- `@leinadeez/not-my-types` — shared TypeScript types

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
pnpm dev                     # starts on http://localhost:3000
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the girlrobot-back API (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site — used in sitemap, RSS, and OG tags |
| `NEXT_PUBLIC_SITE_AUTHOR` | Author name shown in the footer copyright line |
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID (optional) |

## Features

- **Post feed** — masonry grid (default) with tag filtering and Framer Motion FLIP animations; full-post infinite scroll via view toggle
- **Animated backgrounds** — `matrix`, `ripple`, `columns`, `stars`, `hypnospiral`, `hexfire`, `hexcorp`, `cubes`, `saopaulo`, `frutiger`, `candy`; random on first visit, persisted to localStorage
- **ThemePicker** — live theme switcher panel
- **Now Playing / Gaming / Live** — Spotify, Steam, and Twitch widgets in the corner stack (desktop only)
- **Visit counter** — numitron-tube aesthetic, session-deduped
- **RSS feed** — `/rss.xml`, toggleable from CMS settings
- **Polls, reactions, spoiler images, galleries, isotope galleries, video, embeds** — all rendered from `ContentBlock` data
- **Prev/next post navigation** and **random post** button
- **Breadcrumbs** on post, tag, and static page routes
- **Static pages** — dynamic `[slug]` route, nav shown when published pages exist
- **InfiniteDorkness** — links panel with recommendations

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |

## Deployment

Deployed to Vercel. Set `NEXT_PUBLIC_API_URL` to your API base URL in the Vercel environment variables. The `GITHUB_TOKEN` env var (read:packages scope) is also required to install `@leinadeez` packages during the Vercel build.
