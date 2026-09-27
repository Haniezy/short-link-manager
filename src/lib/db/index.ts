import "server-only";
import { createRequire } from "node:module";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

function createDatabase(): PgDatabase<PgQueryResultHKT, typeof schema> {
  if (process.env.DATABASE_DRIVER === "pglite") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PGlite is only supported for local development.");
    }
    // Required on demand: PGlite is a ~26 MB dev-only package and must stay out of
    // the production module graph, where it would be loaded on every cold start.
    const require = createRequire(import.meta.url);
    const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
    const { drizzle: drizzleLocal } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
    return drizzleLocal(new PGlite(process.env.PGLITE_DATA_DIR || "./.pglite"), { schema });
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database is not configured.");
  return drizzle(new Pool({
    connectionString, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000, max: 5,
  }), { schema });
}

// Reuse the embedded database across development hot reloads.
const globalDatabase = globalThis as typeof globalThis & { shortLinkDb?: ReturnType<typeof createDatabase> };
export const db = globalDatabase.shortLinkDb ?? createDatabase();
if (process.env.NODE_ENV !== "production") globalDatabase.shortLinkDb = db;
