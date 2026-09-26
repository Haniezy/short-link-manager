# Short Link Manager

A Next.js 16 / TypeScript application backed by Neon Postgres, Drizzle and Neon Auth.
Package manager: pnpm 10.10.0. Tailwind CSS v4 and shadcn/ui are installed.

## Current status

The backend and dashboard UI are implemented. The responsive landing, login, signup and
shared account header support Persian/English and light/dark themes. Successful authentication
now goes to `/dashboard`. The dashboard includes server-paginated links (12 per page), total
link/click summaries, Zod-validated creation, clipboard copying and confirmation before deletion.
Each owned link has a detail page with its destination, creation date, total clicks and a seven-day
Recharts graph. Loading, error and not-found states are included. The account menu displays the
verified email and offers explicit sign-out and a protected `/dashboard/profile` page.
The profile includes Neon-backed display-name updates, password changes with other-session
revocation, read-only email and account totals. Theme/language controls remain in the shared header.
The header shows the saved display name and photo. Profile photos use a validated HTTPS image
URL (file uploads are not implemented); missing or broken images fall back to an initial.

Local UI checks used temporary fixture data to review desktop/mobile layouts, both themes,
inline validation, delete confirmation and empty states. The temporary preview route was removed.
Backend tests include pagination and owner-scoped totals. Local Neon Auth is configured in `.env.local`. A temporary account verified the actual
Next.js signup/signin/signout Server Actions, wrong-password rejection and authenticated
HTTP access to `/dashboard`; the account was deleted and cleanup verified. Full browser
acceptance of link creation and analytics still remains. PGlite alone does not provide authentication.

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

### Local development with PGlite

To use embedded PostgreSQL locally, set these values in `.env.local`:

```dotenv
DATABASE_DRIVER=pglite
PGLITE_DATA_DIR=./.pglite
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run `pnpm db:migrate` before `pnpm dev`. Next.js runs the frontend and backend together;
PGlite runs inside that process, so no separate database server is needed. Data persists in
the ignored `.pglite/` directory. Stop the dev server before running further migrations,
and use only one process against that directory at a time. `db:push` targets Neon only.

PGlite replaces the application database, not Neon Auth: set `NEON_AUTH_BASE_URL` and
`NEON_AUTH_COOKIE_SECRET` as described below for working sign-up/login. Without them,
the public landing and auth forms can be previewed, but authentication cannot succeed.
For Vercel, use `DATABASE_DRIVER=neon` and a real `DATABASE_URL`; PGlite is rejected in
production. See Current status for the remaining live authentication verification.

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
returns `requiresEmailVerification: true` when no session is created so the form can show
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
  Registration accepts email, password and confirmPassword; confirmation is checked on the server
  and is never forwarded to Neon.
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
  HTML 404 or sanitized HTML 503 response. Dashboard pages include their own loading, error and not-found boundaries.
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

### Authentication page transitions

Client-side navigation to login or signup opens a full-screen sliding dialog over the
current page using Next.js intercepted routes. Direct URLs and refreshes render the
standalone form. The panel slides in only over the landing page; switching between
login and signup reuses the same panel without replaying the slide. The in-page back
arrow or Escape slides the panel out to the right before returning home. Browser Back
uses normal route history. Reduced-motion settings disable the slide. Authentication checks and Server Actions are shared by both views.

### Local Auth connection

The local app uses the existing `short-link-manager` Neon project (`dark-field-48386271`),
branch `production` (`br-aged-surf-b55ngn9e`), for Neon Auth only. Its existing email/password
and localhost settings were already enabled and were preserved. Application links remain
in local PGlite; no cloud link data was migrated or merged. Existing accounts in that Neon
Auth branch are shared with any app using the same Auth endpoint. Open the app at
`http://localhost:3000`, matching `NEXT_PUBLIC_APP_URL`; the numeric `127.0.0.1` origin
was rejected by Auth in the local check. Vercel and cloud application-data migration are separate steps.

### Profile verification

Profile action tests cover unauthenticated access, validation, allowed-field filtering,
other-session revocation requests and sanitized provider errors. Desktop/mobile light/dark
layouts and the account menu were checked with temporary fixtures, then the fixture route
was removed. Anonymous profile access redirects to login. Live profile/password mutations
against a real account still need acceptance testing; no personal password was changed.
