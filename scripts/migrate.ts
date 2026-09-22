import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

config({ path: ".env.local", quiet: true });
async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database is not configured.");
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10_000 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully.");
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error("Migration failed. Check database connectivity and the legacy-data guard in migration 0002. No credentials are logged.");
  process.exitCode = 1;
});
