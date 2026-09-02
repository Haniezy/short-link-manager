import { getClient } from "./client";

/**
 * Idempotent schema bootstrap for the local PGlite database. Runs
 * `CREATE TABLE IF NOT EXISTS` for every table on first access so the app
 * works with zero external migration steps (no `drizzle-kit push` needed).
 *
 * Mirrors src/lib/db/schema.ts. Keep the two in sync.
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  slug text NOT NULL UNIQUE,
  title text,
  destination_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS links_slug_idx ON links(slug);
CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS clicks_link_id_idx ON clicks(link_id);
CREATE INDEX IF NOT EXISTS clicks_clicked_at_idx ON clicks(clicked_at);
`;

declare global {
  var __shortlinkMigrated: Promise<void> | undefined;
}

export function ensureSchema(): Promise<void> {
  if (!globalThis.__shortlinkMigrated) {
    // PGlite/Postgres reject multiple statements in one prepared query, so run
    // each DDL statement separately. Split on semicolons, drop empties.
    const statements = SCHEMA_SQL.split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    globalThis.__shortlinkMigrated = (async () => {
      const client = await getClient();
      for (const statement of statements) {
        await client.query(statement);
      }
    })();
  }
  return globalThis.__shortlinkMigrated;
}
