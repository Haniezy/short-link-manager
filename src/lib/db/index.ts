import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleLocal } from "drizzle-orm/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

function createDatabase(): PgDatabase<PgQueryResultHKT, typeof schema> {
  if (process.env.DATABASE_DRIVER === "pglite") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PGlite is only supported for local development.");
    }
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
