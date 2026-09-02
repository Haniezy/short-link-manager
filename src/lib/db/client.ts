import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { resolve } from "node:path";

/**
 * Local Postgres via PGlite (Postgres-in-process, WASM). This replaces the
 * Neon HTTP driver so the app runs entirely offline with no Neon account.
 * Data is persisted to the directory in PGLOCAL_DIR (defaults to ".pglocal").
 *
 * Initialization is lazy and stored on `globalThis` so Turbopack HMR / Next.js
 * module-graph splits don't spawn a second PGlite on the same data dir
 * (PGlite does not support multiple connections; a second instance would
 * miss writes from the first). `PGlite.create()` awaits WASM + FS ready.
 */

type Schema = typeof schema;
export type AppDb = PgliteDatabase<Schema>;

type DbHandle = {
  client: PGlite;
  db: AppDb;
};

declare global {
  var __shortlinkPgPromise: Promise<DbHandle> | undefined;
}

function init(): Promise<DbHandle> {
  // If a previous attempt rejected (e.g. a stale lock file from a crashed
  // process), drop the cached promise so the next caller gets a fresh attempt.
  // We only cache successfully-resolved handles.
  const cached = globalThis.__shortlinkPgPromise;
  if (cached) {
    return cached;
  }
  const pending = (async () => {
    const dataDir = resolve(
      /* turbopackIgnore: true */ process.cwd(),
      process.env.PGLOCAL_DIR || ".pglocal",
    );
    const client = await PGlite.create(dataDir);
    const db = drizzle(client, { schema });
    globalThis.__shortlinkPgPromise = Promise.resolve({ client, db });
    return { client, db };
  })();
  // Cache only after success — rejections should not poison future calls.
  globalThis.__shortlinkPgPromise = pending;
  return pending;
}

export async function getClient(): Promise<PGlite> {
  const { client } = await init();
  return client;
}

export async function getDb(): Promise<AppDb> {
  const { db } = await init();
  return db;
}
