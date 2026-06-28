# Biljämförelse

Swedish car ownership cost comparison app. Stack: TanStack Start · Convex · shadcn/ui · Tailwind · Vercel.

## Prerequisites

- Node.js 20+
- npm
- [Convex](https://convex.dev) account
- [Vercel](https://vercel.com) account (for deploy)

## Setup

```bash
git clone <repo-url>
cd car-comparison
npm install
cp .env.example .env.local
```

### Convex

```bash
npx convex dev
```

On first run, log in and create a project. Convex writes `VITE_CONVEX_URL` to `.env.local`.

Health check: `convex/health.ts` → `api.health.get` returns `{ ok: true }`.

### Local dev

```bash
npm run dev
```

Runs Convex sync + Vite on [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Convex + app hot reload |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | Biome lint + format check |
| `npm run test` | Vitest unit tests |
| `npm start` | Run Nitro output locally |

## Vercel deploy

1. Push to GitHub; connect repo in Vercel (framework: TanStack Start).
2. Add env vars (all environments):
   - `VITE_CONVEX_URL` — Convex deployment URL for that environment
   - `CONVEX_DEPLOY_KEY` — from Convex dashboard → Deploy Key
3. Preview deploys on PR; production on push to `main`.

Use separate Convex dev/prod deployments for preview vs production.

```bash
npx vercel link
npx vercel env pull .env.local
```

## Project structure

```
src/
  components/layout/   # AppShell, FormDrawer, ConfirmDialog
  components/ui/       # shadcn primitives
  lib/i18n/sv.ts       # Swedish UI strings
  routes/              # TanStack Router (English paths)
convex/                # Backend queries/mutations
docs/                  # EPICS, UX patterns
```

## UX conventions

See [docs/UX.md](./docs/UX.md) — drawers for forms, dialogs for confirm/destructive only.

## Locale

- UI: Swedish (`sv-SE`)
- Routes: English slugs
- Currency: SEK via `Intl.NumberFormat('sv-SE')`
