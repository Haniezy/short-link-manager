import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

config({ path: ".env.local", quiet: true });
async function main(): Promise<void> {
  if (process.env.DATABASE_DRIVER === "pglite") {
    if (process.env.NODE_ENV === "production") throw new Error("PGlite is local-only.");
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle: drizzleLocal } = await import("drizzle-orm/pglite");
    const { migrate: migrateLocal } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(process.env.PGLITE_DATA_DIR || "./.pglite");
    try {
      await migrateLocal(drizzleLocal(client), { migrationsFolder: "./drizzle" });
      console.log("Local PGlite migrations applied successfully.");
    } finally {
      await client.close();
    }
    return;
  }
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
