# Short Link Manager

A Next.js 16 / TypeScript application backed by Neon Postgres, Drizzle and Neon Auth.
Package manager: pnpm 10.10.0. Tailwind CSS v4 and shadcn/ui are installed.

## Current status

The backend is implemented and tested. The landing page follows the supplied visual references,
with Persian/English content, RTL/LTR layouts, persistent light/dark themes, an explicitly labeled
sample dashboard, and a short-link form connected to the backend for authenticated sessions.
The /login and /signup pages follow the supplied curved-background design, with shared glass
buttons, Persian/English content, theme support, and email/password Server Actions. Successful
authentication returns to the landing page while the dashboard UI is pending. Password confirmation
and basic safe feedback are included; detailed auth error UX is a separate follow-up.
Root and auth route loading/error boundaries are included. The dashboard list/forms, delete
confirmation, and the real link detail chart still need to be built after their designs are approved.

**Deployed URL:** not deployed yet. Vercel deployment and browser-based acceptance testing are pending.
Do not treat this branch as a finished submission.

## Local setup

Use a current supported Node.js LTS release (22 or 24) and pnpm 10.10.0.

```sh
pnpm install
# Copy .env.example to .env.local and set the variables described below.
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000. Never commit .env.local.

| Variable | Where to get it / purpose |
| --- | --- |
| DATABASE_URL | Neon Console → selected project and branch → Connect, pooled Postgres URL |
| NEON_AUTH_BASE_URL | Neon Console → Auth / Configure Auth → Auth URL for the same branch |
| NEON_AUTH_COOKIE_SECRET | Generate a random secret locally; minimum 32 characters |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 locally; your exact HTTPS Vercel origin in production |

Generate the cookie secret with:

```sh
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

Enable email/password sign-up and sign-in in Neon Auth. Allow localhost for development.
The application does not require email verification for this exercise; if enabled, registration
returns `requiresEmailVerification: true` when no session is created so the future form can show
the correct next step.

At deployment, set the variables in Vercel's Environment Variables, add the deployed origin to
Neon Auth's trusted domains, set NEXT_PUBLIC_APP_URL to that origin, and redeploy.
Use a separate Neon branch for ongoing development once real users exist.

## Database migrations

```sh
pnpm db:generate
pnpm db:migrate
```

Commit generated SQL and snapshots. Use migrations instead of db:push for deployed environments.

Migration 0002 removes the old, custom password/session tables and changes links.user_id to
a text Neon Auth identity. It locks the legacy tables and **refuses to proceed if any legacy
users, sessions, links or clicks exist**. It does not infer account ownership from email addresses.
A nonempty legacy installation needs an explicit identity/data migration before applying 0002.
The initially configured database was verified empty before this migration was applied.

Neon Auth manages its own neon_auth schema. Drizzle owns only public.links and public.clicks.
The application never stores passwords or implements its own session tokens.

## Backend interfaces

- src/actions/auth.ts: registerAction, loginAction, logoutAction, backed by the official Neon Auth SDK.
- src/actions/links.ts: createLinkAction and deleteLinkAction. All mutations initiated by forms use Server Actions.
- src/lib/links.ts: loadDashboard and loadLinkDetails, server-only read services returning safe results.
- src/lib/db/: schema and all application database operations. React components should call the services.
- src/lib/auth/session.ts: verified current user and requireUser. Upstream session checks bypass the local
  session cache so a revoked session is not accepted by an action.
- src/proxy.ts and src/app/dashboard/layout.tsx: dashboard authentication gates. Every action/read service
  also checks authentication independently.
- src/lib/short-url.ts: builds the full public short URL from NEXT_PUBLIC_APP_URL.
- /r/[slug]: public GET redirect with status 307, a matching click event and an atomic counter increment.
  HEAD resolves the same destination without recording a click.

Results use `{ data, error }`, with optional `fieldErrors` for inline validation. Expected failures
do not expose raw database or provider messages. All public action inputs and route IDs/slugs
are validated with Zod. UI code must still handle the returned errors and pending states.

## Decisions I made

- **Slugs are globally unique and case-sensitive.** The brief says “unique per user”, but the public
  route /r/[slug] has no user namespace. Allowing duplicate slugs across users would make redirects
  ambiguous. Global uniqueness is enforced in Postgres, including concurrent requests. Custom slugs
  allow letters, numbers and dashes, up to 32 characters; generated slugs have six characters.
- Titles are optional, trimmed and limited to 120 characters; destinations are http(s) URLs up to
  2048 characters. A collision on a generated slug retries at most four times.
- **No internal auth API routes.** Email/password actions invoke the Neon Auth server SDK directly.
  OAuth is outside the brief and is not implemented.
- The redirect Route Handler is the required public endpoint and is the exception to form mutations:
  a successful GET records the click within the same transaction as the counter increment.
- A click is a successful GET redirect, not a unique human visitor. Bots making GET requests count;
  HEAD requests do not. Responses use no-store to avoid cached redirects bypassing counting.
- Analytics use seven UTC calendar dates including today. Missing dates are zero-filled and dates
  outside the window are excluded. Queries enforce link ownership.
- The application keeps the opaque Neon Auth user ID on each link, without a foreign key into the
  provider-managed schema. IDs are taken only from verified sessions. Account deletion is outside
  the requested product scope.
- Route Handlers do not render React not-found/error boundaries. The redirect returns its own
  HTML 404 or sanitized HTML 503 response. Page boundaries belong to the upcoming UI phase.
- The installed official Neon Auth package is a beta release. pnpm reports upstream optional UI peer
  warnings; this application imports only the server SDK. Production build and live backend checks
  passed with the locked versions.

## Verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The default tests run against isolated in-memory PostgreSQL (PGlite); no cloud credentials are needed.
They cover unsafe URLs, malformed IDs, missing/failed sessions, ownership isolation, custom/random
slug collisions, retry limits, deletion cascades, HTTP redirects and 404s, HEAD behavior, concurrent
counter/event consistency, transaction rollback, UTC boundaries and legacy-data protection.
Auth action tests mock the provider to cover safe error mapping and the verification-required state.

During backend development, separate live checks against Neon verified email/password sign-up,
wrong-password rejection, sign-in, sign-out and rejection of revoked cookies. A running production
Next.js server redirected five concurrent requests and produced exactly five events; HEAD did not
increment the count. The disposable account and link were removed, and cleanup was verified.

These live checks exercise the provider SDK and redirect backend, not a browser UI. Browser cookie
behavior and the full sign-up → dashboard → create → redirect → statistics flow must be checked
again after the UI is connected and after deployment.

## How I used AI tools

I used Codex to review the existing repository against the engineering brief and then implement
the backend corrections. The initial scaffold and custom authentication code were already present
when this review began. Codex identified that storing password hashes and database sessions in Neon
Postgres did not satisfy the separate Neon Auth requirement. It replaced that code with the official
server SDK, moved link database operations into a dedicated data layer, and added ownership checks,
validation, safe errors and transaction tests.

The workflow combined generated code with inspection of the installed Next.js documentation and
Neon SDK source, TypeScript checks, linting, PostgreSQL tests and live service checks. Two details
needed correction during implementation: the SDK requires a positive session-cache TTL, and generated
migration SQL needed careful ordering and a guard against deleting legacy data. Windows tooling also
required a local workaround when the migration CLI could not read OS user information. I supplied the
project and Neon configuration through the console. UI development and final deployment are separate
remaining stages; the test results here do not claim they are complete.
