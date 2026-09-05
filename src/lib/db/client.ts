import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

export type AppDb =
  | ReturnType<typeof neonDrizzle>
  | ReturnType<typeof pgliteDrizzle>;

/** True when DATABASE_URL is set, i.e. the app is wired to Neon Postgres. */
export function isNeonMode(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

type DbHandle = {
  client: ReturnType<typeof neon> | PGlite;
  db: AppDb;
};

declare global {
  var __shortlinkDbPromise: Promise<DbHandle> | undefined;
}

async function init(): Promise<DbHandle> {
  const cached = globalThis.__shortlinkDbPromise;
  if (cached) {
    return cached;
  }
  const pending = (async () => {
    if (isNeonMode()) {
      const client = neon(process.env.DATABASE_URL!);
      const db = neonDrizzle(client, { schema });
      return { client: client as ReturnType<typeof neon>, db: db as AppDb };
    }
    const dataDir =
      typeof process !== "undefined" &&
      typeof process.cwd === "function"
        ? `${process.cwd()}/${process.env.PGLOCAL_DIR ?? ".pglocal"}`
        : `.pglocal`;
    const client = await PGlite.create(dataDir);
    const db = pgliteDrizzle(client, { schema });
    return { client, db: db as AppDb };
  })();
  // Cache the in-flight handle so concurrent requests share one PGlite
  // instance (PGlite allows a single connection per data dir). On failure we
  // drop the cache so a transient error (e.g. a stale lock from a crashed
  // process) doesn't poison every later request in this process.
  globalThis.__shortlinkDbPromise = pending;
  pending.catch(() => {
    globalThis.__shortlinkDbPromise = undefined;
  });
  return pending;
}

export async function getClient() {
  const { client } = await init();
  return client;
}

export async function getDb() {
  const { db } = await init();
  return db;
}
