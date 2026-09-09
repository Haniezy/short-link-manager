import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Both local development and production use the same Neon Postgres driver.
// Initialize lazily so builds never require a database connection.
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  if (!database) {
    const url = process.env.DATABASE_URL;
    if (!url)
      throw new Error("DATABASE_URL is required. Configure Neon Postgres.");
    database = drizzle(neon(url), { schema });
  }
  return database;
}
