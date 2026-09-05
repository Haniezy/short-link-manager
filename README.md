# ShortLink

A small but production-quality short-link manager: create short links
(`yoursite.com/r/abc123`), share them, and track clicks from a clean dashboard.

Built with **Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 ·
shadcn/ui · Drizzle ORM · Neon Postgres · Neon Auth · Server Actions ·
next-themes · sonner · recharts**. Package manager: **pnpm**.

## Deployed URL

> **TODO:** _Add your deployed URL here after deploying to Vercel._

## Local setup

### 1. Prerequisites

- Node.js 20.9+ (built with Node 24)
- pnpm (`npm i -g pnpm`)
- A free [Neon](https://neon.tech) account — instant signup, no credit card

### 2. Install

```bash
pnpm install
```

### 3. Create a Neon project (Neon mode only)

Neon is required **only** if you want the hosted Postgres + Neon Auth path. To
skip it entirely and run fully offline, omit these vars from `.env.local` and
the app auto-falls-back to PGlite + local email/password auth.

1. Create a project in the [Neon console](https://console.neon.tech).
2. Copy the **connection string** (`postgresql://…`) from the dashboard.
3. Enable **Neon Auth** for the project and note its **base URL**
   (your project's auth endpoint).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

**Neon mode** — set `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and
`NEON_AUTH_COOKIE_SECRET`:

| Variable                   | What it is                                             |
| -------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`             | Neon Postgres connection string                        |
| `NEXT_PUBLIC_BASE_URL`     | Public URL of the app (used to build copyable short links) |
| `NEON_AUTH_BASE_URL`       | Base URL of your Neon Auth instance                    |
| `NEON_AUTH_COOKIE_SECRET`  | Random 32+ char secret for signing session cookies (`openssl rand -hex 32`) |

**Local (offline) mode** — just set these and leave `DATABASE_URL` empty:

| Variable                   | What it is                                             |
| -------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`     | `http://localhost:3000`                                |
| `LOCAL_AUTH_SECRET`        | Random 32+ char secret (`openssl rand -hex 32`)        |
| `PGLOCAL_DIR`              | `".pglocal"` (where PGlite stores data)                |

### 5. Create the tables

- **Neon mode**: generate the schema SQL, then paste it into the Neon SQL
  editor (Neon supports standard `psql`):

  ```bash
  pnpm exec drizzle-kit generate   # writes ./drizzle/0000_*.sql
  ```

- **Local mode**: nothing to do — PGlite bootstraps its schema automatically on
  first run.

### 6. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up → create a link →
visit `/r/<slug>` → watch the click count go up.

## Scripts

| Command                   | What it does                          |
| ------------------------- | ------------------------------------- |
| `pnpm dev`                | Dev server (Turbopack)                |
| `pnpm build`              | Production build                      |
| `pnpm start`              | Serve the production build            |
| `pnpm lint`               | ESLint                                |
| `pnpm exec tsc --noEmit`  | Type-check (strict)                   |
| `pnpm exec drizzle-kit generate` | Generate schema SQL (apply in Neon SQL editor) |

## Auto-selected backends (Neon or fully local)

The app switches between Neon and a fully-offline local stack **automatically**
based on which environment variables are present — no code changes or file
swaps needed:

- **Neon mode** (production / anything with `DATABASE_URL` set) uses Neon
  Postgres via the HTTP driver and Neon Auth.
- **Local mode** (no `DATABASE_URL`) runs **fully offline**: the DB driver is
  **PGlite** (real Postgres in-process over WASM), with data persisted to a
  local folder (`.pglocal/`). The schema is created on first boot by
  `src/lib/db/migrate.ts` — no migration command required.
  Auth is the **local email/password** provider (`bcryptjs` + a signed
  httpOnly cookie); sessions live in the cookie, nothing external is contacted.

Local `.env.local` only needs:

```
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
LOCAL_AUTH_SECRET="<generated via openssl rand -hex 32>"
PGLOCAL_DIR=".pglocal"
```

Set `DATABASE_URL` (along with `NEON_AUTH_BASE_URL` and
`NEON_AUTH_COOKIE_SECRET`) on Vercel or any Neon-connectable environment to
opt back into Neon automatically.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import it into Vercel and add the four env vars above
   (`NEXT_PUBLIC_BASE_URL` should be your Vercel URL, e.g.
   `https://your-app.vercel.app`).
3. Deploy — the Neon HTTP driver needs no pooling configuration.

## Architecture in one paragraph

UI lives in `src/app` and `src/components`; it never touches the database.
All database access is centralized in `src/lib/db/queries.ts`. Mutations are
**Server Actions** in `src/lib/actions/` — there are no internal API routes
for mutations. The only route handlers are the public `GET /r/[slug]`
redirect and `api/auth/[...path]` (mounts the Neon Auth handler when configured,
returns 404 in local mode). Every action validates input with **Zod** and
returns an `{ data, error }` shape so raw DB/auth errors never reach the
client. Auth is isolated behind a small `AuthProvider` contract in
`src/lib/auth/` so the concrete SDK touches exactly one file. Every route
segment has a `loading.tsx` (skeletons) and an `error.tsx` boundary.

## Decisions I made

The brief says "don't ask questions; make reasonable choices and document
them". Here they are:

- **Slugs are globally unique, not just per-user.** The public redirect route
  `/r/[slug]` has no notion of the requesting user, so per-user uniqueness
  would make redirects ambiguous. A friendly inline error ("That slug is
  already taken") covers the collision case.
- **Click counts are derived from a `clicks` table** (one row per redirect)
  instead of a counter column. The 7-days chart needs per-day data anyway,
  and this keeps the total and the chart always consistent.
- **Card grid instead of a table** for the dashboard list — it is responsive
  on mobile out of the box and reads better with long destination URLs.
- **The redirect is a `GET` route handler** (`NextResponse.redirect(..., 307)`),
  not a Server Action: it is a public HTTP endpoint, not an app mutation.
- **Env vars are read lazily**, so `pnpm build` succeeds even when secrets are
  only present at runtime (e.g. Vercel); misconfiguration surfaces as a
  friendly error instead of a build crash.
- **A 307 (temporary) redirect** so destinations can be changed without
  browsers caching the old target.

## How I used AI tools

I used **ZCode (AI coding agent)** as my primary pair-programmer across the
whole project, working phase by phase: scaffolding, data layer, auth, server
actions, redirect endpoint, UI shell, dashboard, detail page with the chart,
and docs. The agent generated the initial scaffold commands, the Drizzle
schema, the server-action layer, and most component boilerplate; I reviewed
every file, drove the architecture decisions (isolated auth layer, derived
click counts, `{ data, error }` results), and fixed what the agent got wrong.

What worked well: shadcn/ui components, the Drizzle queries, and the
redirect endpoint were close to final on the first pass, and the agent caught
Next.js 16 breaking changes (async `params`, `revalidateTag` signature)
before I hit them.

What didn't: the biggest trip-up was **Neon Auth** — its docs were
unreachable from my environment, so the agent first wrote against a guessed
API. It recovered by pulling the published npm tarball and reading the real
type definitions, which matched the documented `createNeonAuth` API. Two
build failures it caused and then fixed itself: non-action exports inside a
`"use server"` file, and throwing on missing env vars at module load. Lesson:
AI is fast at the mechanical 80%, but you still need to verify against real
sources and read the build output.
