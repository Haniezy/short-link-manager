# ShortLink

A production-ready short-link manager built with Next.js. Authenticated users
can create, copy, visit, analyze, and delete short links from a responsive
dashboard.

## Deployed URL

https://short-link-manager-rose.vercel.app

## Features

- Email and password sign-up, sign-in, and sign-out
- Protected dashboard
- Custom or automatically generated six-character slugs
- Server-side validation with Zod
- 307 redirects through `/r/[slug]`
- Click tracking
- Seven-day clicks chart
- Copy-to-clipboard support
- Link deletion with a confirmation dialog
- Responsive light and dark themes
- Loading skeletons and error boundaries
- Toast notifications for successful and failed actions

## Tech stack

- Next.js 16 with App Router
- React and TypeScript with strict mode
- Tailwind CSS v4
- shadcn/ui
- Drizzle ORM
- Neon Postgres
- Neon Auth
- Server Components
- Server Actions
- Zod
- Recharts
- next-themes
- Sonner
- pnpm

## Local setup

### Prerequisites

Install the following tools:

- Node.js 20.9 or newer
- pnpm
- A Neon account

Install pnpm globally if it is not already installed:

```bash
npm install -g pnpm
```

### 1. Install

```bash
pnpm install
```

### 2. Create a Neon project

Neon Postgres and Neon Auth are required in both local development and production.
Create a project in the [Neon console](https://console.neon.tech), copy its
Postgres connection string, and enable Neon Auth to obtain the auth base URL.
There is no local authentication or offline database fallback.

### 3. Configure environment variables

cp .env.example .env.local

**Neon mode** — set `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and
`NEON_AUTH_COOKIE_SECRET`:

| Variable                   | What it is                                             |
| -------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`             | Neon Postgres connection string                        |
| `NEXT_PUBLIC_BASE_URL`     | Public URL of the app (used to build copyable short links) |
| `NEON_AUTH_BASE_URL`       | Base URL of your Neon Auth instance                    |
| `NEON_AUTH_COOKIE_SECRET`  | Random 32+ char secret for signing session cookies (`openssl rand -hex 32`) |

### 4. Apply migrations

```bash
pnpm exec drizzle-kit migrate
```

The configuration reads `.env.local` and connects to Neon Postgres. For an
existing database whose original schema was created manually, apply only the
unapplied SQL files in the Neon SQL editor instead of replaying the initial
migration. `0001_profiles.sql` adds profile storage; `0002_remove_local_users.sql`
removes the obsolete, empty `public.users` table. It refuses to remove a
nonempty table. Neon Auth owns its own user records; those are never dropped.

### 5. Run

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

## Authentication and profiles

Neon Auth handles registration, login, logout and sessions in every environment.
`requireSession()` protects dashboard and profile routes. Profile passwords are
changed through Neon Auth, with other sessions revoked; the app never hashes
or stores passwords. Missing Neon configuration does not enable another provider.

The account menu opens `/profile` (`/fa/profile` in Persian). Profile name,
HTTPS avatar URL and biography are stored in Neon Postgres. Membership dates
come from Neon Auth; link counts and last link visits come from the app tables.
Theme and language preferences currently persist in the browser. Email changes
and two-factor setup are explicitly unavailable; they do not simulate security
features. All profile mutations use validated Server Actions.

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
