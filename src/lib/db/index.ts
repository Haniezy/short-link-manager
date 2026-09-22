import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Database is not configured.");
const pool = new Pool({
  connectionString, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000, max: 5,
});
export const db = drizzle(pool, { schema });
